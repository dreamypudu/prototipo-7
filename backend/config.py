import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
PROTECTED_DIST_DIR = BASE_DIR / "protected_dist"
PUBLIC_ASSETS_DIR = PROJECT_ROOT / "public"

load_dotenv(BASE_DIR / ".env.local")
load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required. Set it to your Postgres connection string.")

AUTH_JWT_SECRET = os.getenv("AUTH_JWT_SECRET", "")
AUTH_JWT_ISSUER = os.getenv("AUTH_JWT_ISSUER", "compass-auth")
AUTH_TOKEN_HOURS = max(1, int(os.getenv("AUTH_TOKEN_HOURS", "12")))


def require_auth_secret() -> str:
    if not AUTH_JWT_SECRET:
        raise RuntimeError("AUTH_JWT_SECRET is required.")
    return AUTH_JWT_SECRET


def get_allowed_origins():
    raw = os.getenv("ALLOWED_ORIGINS")
    if not raw:
        return ["*"]
    return [origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()]
