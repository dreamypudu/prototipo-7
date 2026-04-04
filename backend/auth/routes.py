from fastapi import APIRouter, Body, HTTPException, Request

from backend.db import get_conn
from backend.auth.service import (
    issue_auth_token,
    log_auth_event,
    require_auth_header,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def auth_login(payload: dict = Body(...)):
    username = str(payload.get("username") or "").strip().lower()
    password = str(payload.get("password") or "")
    if not username or not password:
        raise HTTPException(status_code=400, detail="username_and_password_required")

    with get_conn() as conn:
        user_row = conn.execute(
            """
            SELECT user_id, username, display_name, password_hash, is_active, created_at, updated_at
            FROM auth_users
            WHERE username = %s
            """,
            (username,),
        ).fetchone()

        if not user_row or not user_row.get("is_active") or not verify_password(password, user_row["password_hash"]):
            log_auth_event(
                conn,
                "login_failed",
                username=username,
                success=False,
                metadata={"reason": "invalid_credentials"},
            )
            conn.commit()
            raise HTTPException(status_code=401, detail="invalid_credentials")

        token = issue_auth_token(dict(user_row))
        log_auth_event(
            conn,
            "login_succeeded",
            user_id=user_row["user_id"],
            username=user_row["username"],
            success=True,
        )
        conn.commit()

    return {
        "ok": True,
        "token": token,
        "user": {
            "user_id": user_row["user_id"],
            "username": user_row["username"],
            "display_name": user_row.get("display_name"),
        },
    }


@router.post("/verify")
def auth_verify(request: Request):
    auth_context = require_auth_header(request.headers.get("authorization"))
    user = auth_context["user"]
    return {
        "ok": True,
        "user": {
            "user_id": user["user_id"],
            "username": user["username"],
            "display_name": user.get("display_name"),
        },
        "claims": auth_context["claims"],
    }


@router.post("/logout")
def auth_logout(request: Request):
    auth_context = require_auth_header(request.headers.get("authorization"))
    user = auth_context["user"]
    with get_conn() as conn:
        log_auth_event(
            conn,
            "logout",
            user_id=user["user_id"],
            username=user["username"],
            success=True,
        )
        conn.commit()
    return {"ok": True}
