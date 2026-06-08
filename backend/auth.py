import hashlib
import hmac
import os
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel

try:
    from .db import get_conn
except ImportError:
    from db import get_conn


ACCESS_COOKIE_NAME = "COMPASS_ACCESS"
REFRESH_COOKIE_NAME = "COMPASS_REFRESH"
JWT_ALGORITHM = "HS256"
ALLOWED_ROLES = {"user", "admin"}
LOGIN_WINDOW_MINUTES = 15
LOGIN_MAX_FAILED_ATTEMPTS = 5

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginCredentials(BaseModel):
    email: str
    password: str


def _utc_now() -> datetime:
    return datetime.now(UTC)


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "y", "on"}


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _is_production() -> bool:
    env = (os.getenv("APP_ENV") or os.getenv("ENVIRONMENT") or os.getenv("ENV") or "").lower()
    return env in {"prod", "production"}


def _cookie_secure() -> bool:
    return _env_bool("AUTH_COOKIE_SECURE", _is_production())


def _cookie_samesite() -> str:
    value = (os.getenv("AUTH_COOKIE_SAMESITE") or "strict").strip().lower()
    return value if value in {"strict", "lax", "none"} else "strict"


def _access_minutes() -> int:
    return max(1, _env_int("AUTH_ACCESS_TOKEN_MINUTES", 15))


def _refresh_hours() -> int:
    return max(2, _env_int("AUTH_REFRESH_TOKEN_HOURS", 12))


def _jwt_secret() -> str:
    secret = os.getenv("AUTH_JWT_SECRET_KEY")
    if secret and len(secret) >= 32:
        return secret
    if _is_production():
        raise RuntimeError("AUTH_JWT_SECRET_KEY must be set to at least 32 characters in production.")
    return "dev-only-insecure-compass-auth-secret-change-me"


def validate_auth_config() -> None:
    _jwt_secret()
    if _cookie_samesite() == "none" and not _cookie_secure():
        raise RuntimeError("AUTH_COOKIE_SECURE must be true when AUTH_COOKIE_SAMESITE=none.")


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (TypeError, ValueError):
        return False


def _hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _public_user(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "platform_user_id": row["platform_user_id"],
        "email": row["email"],
        "role": row["role"],
        "full_name": row["full_name"],
        "is_active": row["is_active"],
    }


def _create_access_token(user: dict[str, Any], expires_at: datetime) -> str:
    payload = {
        "sub": user["platform_user_id"],
        "role": user["role"],
        "iat": _utc_now(),
        "exp": expires_at,
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def _create_refresh_token() -> tuple[str, str]:
    token_id = str(uuid4())
    secret = secrets.token_urlsafe(48)
    return token_id, f"{token_id}.{secret}"


def _seconds_until(expires_at: datetime) -> int:
    return max(0, int((expires_at - _utc_now()).total_seconds()))


def _set_auth_cookies(
    response: Response,
    *,
    access_token: str,
    access_expires_at: datetime,
    refresh_token: str,
    refresh_expires_at: datetime,
) -> None:
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        max_age=_seconds_until(access_expires_at),
        httponly=True,
        secure=_cookie_secure(),
        samesite=_cookie_samesite(),
        path="/",
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=_seconds_until(refresh_expires_at),
        httponly=True,
        secure=_cookie_secure(),
        samesite=_cookie_samesite(),
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(
        key=ACCESS_COOKIE_NAME,
        path="/",
        secure=_cookie_secure(),
        samesite=_cookie_samesite(),
    )
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/",
        secure=_cookie_secure(),
        samesite=_cookie_samesite(),
    )


def _request_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else "unknown"


def _allowed_origins() -> set[str]:
    raw = os.getenv("ALLOWED_ORIGINS") or ""
    return {origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()}


def validate_request_origin(request: Request) -> None:
    if request.method not in {"POST", "PUT", "PATCH", "DELETE"}:
        return
    origin = request.headers.get("origin")
    if not origin:
        return
    allowed = _allowed_origins()
    if not allowed or "*" in allowed or origin.rstrip("/") in allowed:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Origin not allowed")


def _record_login_attempt(conn, *, email: str, ip_address: str, succeeded: bool) -> None:
    conn.execute(
        """
        INSERT INTO platform_login_attempts (email, ip_address, succeeded, attempted_at)
        VALUES (%s, %s, %s, %s)
        """,
        (email, ip_address, succeeded, _utc_now()),
    )


def _enforce_login_rate_limit(conn, *, email: str, ip_address: str) -> None:
    window_start = _utc_now() - timedelta(minutes=LOGIN_WINDOW_MINUTES)
    row = conn.execute(
        """
        SELECT COUNT(*) AS failed_count
        FROM platform_login_attempts
        WHERE succeeded = FALSE
          AND attempted_at >= %s
          AND (email = %s OR ip_address = %s)
        """,
        (window_start, email, ip_address),
    ).fetchone()
    if row and int(row["failed_count"]) >= LOGIN_MAX_FAILED_ATTEMPTS:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many login attempts")


def _get_user_by_email(conn, email: str):
    return conn.execute(
        """
        SELECT platform_user_id, email, password_hash, role, full_name, is_active
        FROM platform_users
        WHERE email = %s
        """,
        (email,),
    ).fetchone()


def _get_user_by_id(conn, platform_user_id: str):
    return conn.execute(
        """
        SELECT platform_user_id, email, role, full_name, is_active
        FROM platform_users
        WHERE platform_user_id = %s
        """,
        (platform_user_id,),
    ).fetchone()


def _issue_refresh_token(conn, *, user: dict[str, Any], expires_at: datetime | None = None) -> tuple[str, datetime]:
    refresh_token_id, refresh_token = _create_refresh_token()
    refresh_expires_at = expires_at or (_utc_now() + timedelta(hours=_refresh_hours()))
    conn.execute(
        """
        INSERT INTO platform_refresh_tokens (
            refresh_token_id, platform_user_id, token_hash, created_at, expires_at
        )
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            refresh_token_id,
            user["platform_user_id"],
            _hash_refresh_token(refresh_token),
            _utc_now(),
            refresh_expires_at,
        ),
    )
    return refresh_token, refresh_expires_at


def _parse_refresh_cookie(raw_token: str | None) -> tuple[str, str]:
    if not raw_token or "." not in raw_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token_id, _ = raw_token.split(".", 1)
    if not token_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return token_id, raw_token


def _revoke_refresh_token(conn, raw_token: str | None) -> None:
    if not raw_token:
        return
    try:
        token_id, token = _parse_refresh_cookie(raw_token)
    except HTTPException:
        return
    conn.execute(
        """
        UPDATE platform_refresh_tokens
        SET revoked_at = COALESCE(revoked_at, %s)
        WHERE refresh_token_id = %s
          AND token_hash = %s
        """,
        (_utc_now(), token_id, _hash_refresh_token(token)),
    )


def require_platform_user(request: Request) -> dict[str, Any]:
    token = request.cookies.get(ACCESS_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    platform_user_id = payload.get("sub")
    if not isinstance(platform_user_id, str) or not platform_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    with get_conn() as conn:
        user = _get_user_by_id(conn, platform_user_id)

    if not user or not user["is_active"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return _public_user(user)


def require_user_or_admin(user: dict[str, Any] = Depends(require_platform_user)) -> dict[str, Any]:
    if user["role"] not in {"user", "admin"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return user


def require_admin(user: dict[str, Any] = Depends(require_platform_user)) -> dict[str, Any]:
    if user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


def seed_platform_user(conn) -> None:
    email = _normalize_email(os.getenv("AUTH_SEED_EMAIL") or "")
    password = os.getenv("AUTH_SEED_PASSWORD") or ""
    if not email and not password:
        return
    if not email or not password:
        raise RuntimeError("AUTH_SEED_EMAIL and AUTH_SEED_PASSWORD must be provided together.")
    if "@" not in email:
        raise RuntimeError("AUTH_SEED_EMAIL must be a valid email-like value.")
    if len(password) < 12:
        raise RuntimeError("AUTH_SEED_PASSWORD must contain at least 12 characters.")

    role = (os.getenv("AUTH_SEED_ROLE") or "user").strip().lower()
    if role not in ALLOWED_ROLES:
        raise RuntimeError("AUTH_SEED_ROLE must be one of: user, admin.")

    full_name = (os.getenv("AUTH_SEED_FULL_NAME") or "Cuenta laboratorio").strip()
    overwrite = _env_bool("AUTH_SEED_OVERWRITE", False)
    existing = conn.execute(
        "SELECT platform_user_id FROM platform_users WHERE email = %s",
        (email,),
    ).fetchone()

    if existing and overwrite:
        conn.execute(
            """
            UPDATE platform_users
            SET password_hash = %s,
                role = %s,
                full_name = %s,
                is_active = TRUE,
                updated_at = %s
            WHERE email = %s
            """,
            (hash_password(password), role, full_name, _utc_now(), email),
        )
        return
    if existing:
        return

    conn.execute(
        """
        INSERT INTO platform_users (
            platform_user_id, email, password_hash, role, full_name, is_active, created_at, updated_at
        )
        VALUES (%s, %s, %s, %s, %s, TRUE, %s, %s)
        """,
        (str(uuid4()), email, hash_password(password), role, full_name, _utc_now(), _utc_now()),
    )


@router.post("/login")
def login(credentials: LoginCredentials, request: Request, response: Response, _: None = Depends(validate_request_origin)):
    email = _normalize_email(credentials.email)
    ip_address = _request_ip(request)
    if not email or not credentials.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    with get_conn() as conn:
        _enforce_login_rate_limit(conn, email=email, ip_address=ip_address)
        user = _get_user_by_email(conn, email)
        is_valid = bool(user and user["is_active"] and verify_password(credentials.password, user["password_hash"]))
        _record_login_attempt(conn, email=email, ip_address=ip_address, succeeded=is_valid)
        if not is_valid:
            conn.commit()
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        now = _utc_now()
        refresh_token, refresh_expires_at = _issue_refresh_token(conn, user=user)
        access_expires_at = min(now + timedelta(minutes=_access_minutes()), refresh_expires_at)
        access_token = _create_access_token(user, access_expires_at)
        conn.execute(
            "UPDATE platform_users SET last_login_at = %s, updated_at = %s WHERE platform_user_id = %s",
            (now, now, user["platform_user_id"]),
        )
        conn.commit()

    _set_auth_cookies(
        response,
        access_token=access_token,
        access_expires_at=access_expires_at,
        refresh_token=refresh_token,
        refresh_expires_at=refresh_expires_at,
    )
    return {"user": _public_user(user)}


@router.post("/refresh")
def refresh(request: Request, response: Response, _: None = Depends(validate_request_origin)):
    token_id, raw_token = _parse_refresh_cookie(request.cookies.get(REFRESH_COOKIE_NAME))
    token_hash = _hash_refresh_token(raw_token)

    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT rt.refresh_token_id, rt.platform_user_id, rt.token_hash, rt.expires_at, rt.revoked_at,
                   pu.email, pu.role, pu.full_name, pu.is_active
            FROM platform_refresh_tokens rt
            JOIN platform_users pu ON pu.platform_user_id = rt.platform_user_id
            WHERE rt.refresh_token_id = %s
            """,
            (token_id,),
        ).fetchone()

        now = _utc_now()
        if (
            not row
            or row["revoked_at"] is not None
            or row["expires_at"] <= now
            or not row["is_active"]
            or not hmac.compare_digest(row["token_hash"], token_hash)
        ):
            _revoke_refresh_token(conn, raw_token)
            conn.commit()
            _clear_auth_cookies(response)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

        user = {
            "platform_user_id": row["platform_user_id"],
            "email": row["email"],
            "role": row["role"],
            "full_name": row["full_name"],
            "is_active": row["is_active"],
        }
        conn.execute(
            "UPDATE platform_refresh_tokens SET revoked_at = %s, last_used_at = %s WHERE refresh_token_id = %s",
            (now, now, token_id),
        )
        refresh_token, refresh_expires_at = _issue_refresh_token(conn, user=user, expires_at=row["expires_at"])
        access_expires_at = min(now + timedelta(minutes=_access_minutes()), refresh_expires_at)
        access_token = _create_access_token(user, access_expires_at)
        conn.commit()

    _set_auth_cookies(
        response,
        access_token=access_token,
        access_expires_at=access_expires_at,
        refresh_token=refresh_token,
        refresh_expires_at=refresh_expires_at,
    )
    return {"user": _public_user(user)}


@router.post("/logout")
def logout(request: Request, response: Response, _: None = Depends(validate_request_origin)):
    with get_conn() as conn:
        _revoke_refresh_token(conn, request.cookies.get(REFRESH_COOKIE_NAME))
        conn.commit()
    _clear_auth_cookies(response)
    return {"ok": True}


@router.get("/me")
def me(user: dict[str, Any] = Depends(require_platform_user)):
    return {"user": user}
