from datetime import datetime, timezone

from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from .db import get_conn
    from .json_utils import json_load
    from .normalizers import DETAIL_TABLE_NAMES, normalize_session
    from .schema import create_schema
except ImportError:
    from db import get_conn
    from json_utils import json_load
    from normalizers import DETAIL_TABLE_NAMES, normalize_session
    from schema import create_schema


def init_db():
    with get_conn() as conn:
        create_schema(conn)


def _get_allowed_origins():
    import os

    raw = os.getenv("ALLOWED_ORIGINS")
    if not raw:
        return ["*"]
    return [origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()]


app = FastAPI(title="Simulator Backend", version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    init_db()


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/sessions")
def create_session(session: dict = Body(...)):
    metadata = session.get("session_metadata", {})
    session_id = metadata.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_metadata.session_id missing")

    created_at = datetime.now(timezone.utc).isoformat()
    with get_conn() as conn:
        conn.execute("BEGIN")
        try:
            counts = normalize_session(conn, session_id, session, created_at)
            conn.commit()
        except ValueError as exc:
            conn.rollback()
            raise HTTPException(status_code=400, detail=str(exc))

    return {"ok": True, "session_id": session_id, "counts": counts}


@app.post("/sessions/{session_id}/normalize")
def normalize_existing_session(session_id: str):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT payload, created_at FROM sessions WHERE session_id = %s",
            (session_id,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="session not found")

        session = json_load(row["payload"]) or {}
        conn.execute("BEGIN")
        counts = normalize_session(conn, session_id, session, row["created_at"])
        conn.commit()

    return {"ok": True, "session_id": session_id, "counts": counts}


@app.post("/sessions/normalize")
def normalize_all_sessions():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT session_id, payload, created_at FROM sessions"
        ).fetchall()
        results = []
        conn.execute("BEGIN")
        for row in rows:
            session = json_load(row["payload"]) or {}
            counts = normalize_session(conn, row["session_id"], session, row["created_at"])
            results.append({"session_id": row["session_id"], "counts": counts})
        conn.commit()

    return {"ok": True, "processed": len(results), "results": results}


@app.get("/sessions")
def list_sessions(limit: int = 100):
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT session_id, user_id, version_id, start_time, end_time, created_at
            FROM sessions
            ORDER BY created_at DESC
            LIMIT %s
            """,
            (limit,),
        ).fetchall()

    return [dict(row) for row in rows]


@app.get("/sessions/{session_id}")
def get_session(session_id: str):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT payload FROM sessions WHERE session_id = %s",
            (session_id,),
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="session not found")

    return json_load(row["payload"]) or {}


def _fetch_table(conn, table_name: str, session_id: str):
    return [
        dict(row)
        for row in conn.execute(
            f"SELECT * FROM {table_name} WHERE session_id = %s",
            (session_id,),
        ).fetchall()
    ]


@app.get("/sessions/{session_id}/normalized")
def get_session_normalized(session_id: str):
    with get_conn() as conn:
        session_row = conn.execute(
            """
            SELECT session_id, user_id, version_id, start_time, end_time, created_at
            FROM sessions
            WHERE session_id = %s
            """,
            (session_id,),
        ).fetchone()
        if not session_row:
            raise HTTPException(status_code=404, detail="session not found")

        data = {"session": dict(session_row)}
        for table_name in [
            "explicit_decisions",
            "expected_actions",
            "canonical_actions",
            *DETAIL_TABLE_NAMES,
            "mechanic_events",
            "comparisons",
            "process_logs",
            "question_log",
            "final_states",
        ]:
            data[table_name] = _fetch_table(conn, table_name, session_id)

    return data


@app.get("/sessions/latest")
def get_latest_session():
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT session_id, user_id, version_id, start_time, end_time, created_at
            FROM sessions
            ORDER BY created_at DESC
            LIMIT 1
            """
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="session not found")

    return dict(row)


@app.get("/sessions/latest/normalized")
def get_latest_session_normalized():
    with get_conn() as conn:
        row = conn.execute(
            "SELECT session_id FROM sessions ORDER BY created_at DESC LIMIT 1"
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="session not found")
    return get_session_normalized(row["session_id"])


__all__ = ["app", "create_schema", "get_conn", "normalize_session"]
