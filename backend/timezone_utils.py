"""Helpers para hora chilena en todos los timestamps que guarda el backend.

Postgres TIMESTAMPTZ guarda en UTC internamente, pero la UI de Supabase muestra
el ISO crudo que insertamos. Si guardamos strings con offset chileno (`-04:00`),
quien revise la base lee la hora local sin tener que convertir mentalmente.
"""
from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo


CHILE_TZ = ZoneInfo("America/Santiago")


def now_chile_iso() -> str:
    """Devuelve el instante actual en hora chilena como ISO 8601 con offset.

    Ejemplo: '2026-05-30T19:19:32.046-04:00'
    """
    return datetime.now(CHILE_TZ).isoformat()


def to_chile_iso(value) -> str | None:
    """Convierte un valor (ISO string o datetime) a ISO en hora chilena.

    - Si es None, devuelve None.
    - Si es string ISO sin tz, asume UTC.
    - Si trae 'Z' al final, lo trata como UTC.
    """
    if value is None:
        return None
    if isinstance(value, datetime):
        dt = value
    else:
        text = str(value).strip()
        if not text:
            return None
        try:
            dt = datetime.fromisoformat(text.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            return text  # mejor dejarlo crudo que perder info
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))
    return dt.astimezone(CHILE_TZ).isoformat()
