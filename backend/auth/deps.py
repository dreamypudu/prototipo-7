from fastapi import Request

from backend.auth.service import require_auth_header


def require_auth_context(request: Request) -> dict:
    return require_auth_header(request.headers.get("authorization"))
