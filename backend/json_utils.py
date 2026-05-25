import json
from typing import Any

from psycopg.types.json import Jsonb


def json_dump(value: Any) -> str | None:
    return json.dumps(value, ensure_ascii=False) if value is not None else None


def json_load(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return value


def to_jsonb(value: Any) -> Jsonb | None:
    return Jsonb(value) if value is not None else None


def as_record(value: Any) -> dict:
    parsed = json_load(value)
    return parsed if isinstance(parsed, dict) else {}


def as_list(value: Any) -> list:
    parsed = json_load(value)
    return parsed if isinstance(parsed, list) else []


def int_or_none(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def float_or_none(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def bool_or_none(value: Any) -> bool | None:
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"true", "t", "1", "yes", "y", "si", "sí"}:
            return True
        if normalized in {"false", "f", "0", "no", "n"}:
            return False
    return bool(value)


def first_present(*values: Any) -> Any:
    for value in values:
        if value is not None:
            return value
    return None
