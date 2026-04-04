from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from backend.auth.routes import router as auth_router
from backend.auth.service import require_auth_header
from backend.config import get_allowed_origins, require_auth_secret
from backend.db import init_db
from backend.protected_app.routes import router as protected_app_router
from backend.sessions.routes import router as sessions_router

app = FastAPI(title="Simulator Backend", version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def auth_guard(request: Request, call_next):
    path = request.url.path
    if path == "/health" or path.startswith("/auth/") or not path.startswith("/sessions"):
        return await call_next(request)

    auth_context = require_auth_header(request.headers.get("authorization"))
    request.state.auth_user = auth_context["user"]
    request.state.auth_claims = auth_context["claims"]
    return await call_next(request)


@app.on_event("startup")
def startup_event():
    require_auth_secret()
    init_db()


@app.get("/health")
def health():
    return {"ok": True}


app.include_router(auth_router)
app.include_router(protected_app_router)
app.include_router(sessions_router)
