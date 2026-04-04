from datetime import datetime, timezone
import json

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError
from fastapi import HTTPException

from backend.config import AUTH_JWT_ISSUER, AUTH_TOKEN_HOURS, require_auth_secret
from backend.db import get_conn

PASSWORD_HASHER = PasswordHasher()


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return PASSWORD_HASHER.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return PASSWORD_HASHER.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def issue_auth_token(user_row: dict) -> str:
    issued_at = datetime.now(timezone.utc)
    payload = {
        "sub": user_row["user_id"],
        "username": user_row["username"],
        "display_name": user_row.get("display_name"),
        "iat": int(issued_at.timestamp()),
        "exp": int((issued_at.timestamp()) + AUTH_TOKEN_HOURS * 3600),
        "iss": AUTH_JWT_ISSUER,
    }
    return jwt.encode(payload, require_auth_secret(), algorithm="HS256")


def decode_auth_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            require_auth_secret(),
            algorithms=["HS256"],
            issuer=AUTH_JWT_ISSUER,
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="invalid_token") from exc


def extract_bearer_token(header_value: str | None) -> str:
    if not header_value:
        raise HTTPException(status_code=401, detail="missing_authorization")
    scheme, _, token = header_value.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="invalid_authorization")
    return token.strip()


def fetch_auth_user(conn, user_id: str):
    return conn.execute(
        """
        SELECT user_id, username, display_name, is_active, created_at, updated_at
        FROM auth_users
        WHERE user_id = %s
        """,
        (user_id,),
    ).fetchone()


def require_auth_header(authorization: str | None) -> dict:
    token = extract_bearer_token(authorization)
    claims = decode_auth_token(token)
    with get_conn() as conn:
        user_row = fetch_auth_user(conn, claims["sub"])
    if not user_row or not user_row.get("is_active"):
        raise HTTPException(status_code=401, detail="inactive_user")
    return {
        "token": token,
        "claims": claims,
        "user": dict(user_row),
    }


def log_auth_event(
    conn,
    event_type: str,
    *,
    user_id: str | None = None,
    username: str | None = None,
    success: bool = True,
    metadata: str | dict | None = None,
) -> None:
    serialized_metadata = metadata
    if metadata is not None and not isinstance(metadata, str):
        serialized_metadata = json.dumps(metadata, ensure_ascii=False)

    conn.execute(
        """
        INSERT INTO auth_audit_log (user_id, username, event_type, success, metadata, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            user_id,
            username,
            event_type,
            success,
            serialized_metadata,
            utcnow_iso(),
        ),
    )
