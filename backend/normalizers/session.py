from copy import deepcopy

try:
    from ..json_utils import as_list, as_record, to_jsonb
    from ..timezone_utils import to_chile_iso
    from .actions import upsert_canonical_action, upsert_expected_action
    from .common import (
        ensure_mechanic,
        ensure_user,
        ensure_version,
        resolve_anonymous_user_id,
        upsert_stakeholders_from_state,
    )
    from .comparisons import insert_comparisons
    from .decisions import insert_explicit_decisions
    from .events import insert_mechanic_events
    from .labels import insert_decision_labels_batch
    from .process import insert_process_logs
    from .state import insert_final_state, insert_question_log
except ImportError:
    from json_utils import as_list, as_record, to_jsonb
    from timezone_utils import to_chile_iso
    from normalizers.actions import upsert_canonical_action, upsert_expected_action
    from normalizers.common import (
        ensure_mechanic,
        ensure_user,
        ensure_version,
        resolve_anonymous_user_id,
        upsert_stakeholders_from_state,
    )
    from normalizers.comparisons import insert_comparisons
    from normalizers.decisions import insert_explicit_decisions
    from normalizers.events import insert_mechanic_events
    from normalizers.labels import insert_decision_labels_batch
    from normalizers.process import insert_process_logs
    from normalizers.state import insert_final_state, insert_question_log


DERIVED_TABLES_DELETE_ORDER = [
    "comparisons",
    "mechanic_events",
    "canonical_actions",
    "expected_actions",
    "mlq_labels",
    "explicit_decisions",
    "process_logs",
    "question_log",
    "final_states",
]


def _delete_session_derivatives(conn, session_id: str):
    for table_name in DERIVED_TABLES_DELETE_ORDER:
        conn.execute(f"DELETE FROM {table_name} WHERE session_id = %s", (session_id,))


def _upsert_session_row(
    conn,
    *,
    session_id: str,
    user_id: str,
    version_id: str | None,
    start_time: str | None,
    end_time: str | None,
    created_at: str,
    payload: dict,
):
    conn.execute(
        """
        INSERT INTO sessions (session_id, user_id, version_id, start_time, end_time, created_at, payload)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (session_id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            version_id = EXCLUDED.version_id,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            created_at = EXCLUDED.created_at,
            payload = EXCLUDED.payload
        """,
        (session_id, user_id, version_id, start_time, end_time, created_at, to_jsonb(payload)),
    )


def normalize_session(conn, session_id: str, session: dict, created_at: str):
    metadata = as_record(session.get("session_metadata"))
    version_id = metadata.get("simulator_version_id")
    user_id = resolve_anonymous_user_id(session_id, metadata.get("user_id"))
    # Convertimos timestamps a hora chilena para que se lean directos en la base.
    start_time = to_chile_iso(metadata.get("start_time"))
    end_time = to_chile_iso(metadata.get("end_time"))
    created_at = to_chile_iso(created_at) or created_at
    sanitized_session = deepcopy(session)
    sanitized_metadata = sanitized_session.setdefault("session_metadata", {})
    sanitized_metadata["session_id"] = session_id
    sanitized_metadata["user_id"] = user_id

    explicit_decisions = as_list(session.get("explicit_decisions"))
    expected_actions = as_list(session.get("expected_actions"))
    canonical_actions = as_list(session.get("canonical_actions"))
    mechanic_events = as_list(session.get("mechanic_events"))
    comparisons = as_list(session.get("comparisons"))
    process_log = as_list(session.get("process_log"))
    question_log = as_list(session.get("question_log"))
    final_state = as_record(session.get("final_state"))
    stakeholders_state = final_state.get("stakeholders") if isinstance(final_state, dict) else []
    stakeholders_state = stakeholders_state if isinstance(stakeholders_state, list) else []

    ensure_user(conn, user_id)
    ensure_version(conn, version_id, created_at)
    upsert_stakeholders_from_state(conn, stakeholders_state)
    for item in [*expected_actions, *canonical_actions, *mechanic_events]:
        ensure_mechanic(conn, item.get("mechanic_id"), version_id)

    _upsert_session_row(
        conn,
        session_id=session_id,
        user_id=user_id,
        version_id=version_id,
        start_time=start_time,
        end_time=end_time,
        created_at=created_at,
        payload=sanitized_session,
    )
    _delete_session_derivatives(conn, session_id)

    insert_explicit_decisions(conn, session_id, user_id, version_id, explicit_decisions, stakeholders_state)
    insert_decision_labels_batch(conn, session_id, explicit_decisions)

    expected_ids = set()
    for index, action in enumerate(expected_actions, start=1):
        expected_id = upsert_expected_action(
            conn,
            session_id,
            action,
            version_id,
            fallback_id=f"{session_id}:expected:{index}",
        )
        if expected_id:
            expected_ids.add(expected_id)

    canonical_ids = set()
    for index, action in enumerate(canonical_actions, start=1):
        canonical_id = upsert_canonical_action(
            conn,
            session_id,
            action,
            version_id,
            fallback_id=f"{session_id}:canonical:{index}",
        )
        if canonical_id:
            canonical_ids.add(canonical_id)

    insert_mechanic_events(conn, session_id, version_id, mechanic_events)
    insert_comparisons(conn, session_id, comparisons, expected_ids, canonical_ids)
    insert_process_logs(conn, session_id, version_id, process_log)
    insert_question_log(conn, session_id, question_log)
    insert_final_state(conn, session_id, user_id, version_id, final_state, explicit_decisions)

    return {
        "explicit_decisions": len(explicit_decisions),
        "expected_actions": len(expected_actions),
        "canonical_actions": len(canonical_actions),
        "mechanic_events": len(mechanic_events),
        "comparisons": len(comparisons),
        "process_log": len(process_log),
        "question_log": len(question_log),
        "final_state": 1 if final_state else 0,
    }
