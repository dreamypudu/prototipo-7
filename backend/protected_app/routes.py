import mimetypes
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, HTMLResponse

from backend.auth.deps import require_auth_context
from backend.config import PROTECTED_DIST_DIR, PUBLIC_ASSETS_DIR

router = APIRouter(tags=["protected-app"])


def _read_protected_shell() -> str:
    shell_path = PROTECTED_DIST_DIR / "app.html"
    if not shell_path.exists():
        raise HTTPException(status_code=503, detail="protected_app_bundle_missing")

    html = shell_path.read_text(encoding="utf-8")
    return (
        html.replace('src="/assets/', 'src="/_protected/assets/')
        .replace('href="/assets/', 'href="/_protected/assets/')
    )


def _safe_child(root: Path, raw_path: str) -> Path:
    resolved = (root / raw_path).resolve()
    root_resolved = root.resolve()
    if root_resolved not in resolved.parents and resolved != root_resolved:
          raise HTTPException(status_code=404, detail="asset_not_found")
    if not resolved.exists() or not resolved.is_file():
          raise HTTPException(status_code=404, detail="asset_not_found")
    return resolved


@router.get("/protected-app", response_class=HTMLResponse)
def get_protected_app(_: dict = Depends(require_auth_context)):
    response = HTMLResponse(_read_protected_shell())
    response.headers["Cache-Control"] = "private, no-store"
    return response


@router.get("/protected-assets/{asset_path:path}")
def get_protected_asset(asset_path: str, _: dict = Depends(require_auth_context)):
    asset_file = _safe_child(PROTECTED_DIST_DIR / "assets", asset_path)
    media_type = mimetypes.guess_type(asset_file.name)[0] or "application/octet-stream"
    response = FileResponse(asset_file, media_type=media_type)
    response.headers["Cache-Control"] = "private, max-age=31536000, immutable"
    return response


@router.get("/protected-public/{asset_path:path}")
def get_protected_public_asset(asset_path: str, _: dict = Depends(require_auth_context)):
    asset_file = _safe_child(PUBLIC_ASSETS_DIR, asset_path)
    media_type = mimetypes.guess_type(asset_file.name)[0] or "application/octet-stream"
    response = FileResponse(asset_file, media_type=media_type)
    response.headers["Cache-Control"] = "private, max-age=3600"
    return response
