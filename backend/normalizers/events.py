try:
    from ..json_utils import as_record, first_present, int_or_none, to_jsonb
    from .common import ensure_decision_reference, ensure_mechanic
except ImportError:
    from json_utils import as_record, first_present, int_or_none, to_jsonb
    from normalizers.common import ensure_decision_reference, ensure_mechanic


def _extract_event_reference(event: dict):
    payload = as_record(event.get("payload"))
    return {
        "node_id": first_present(event.get("node_id"), payload.get("node_id"), payload.get("nodeId")),
        "option_id": first_present(event.get("option_id"), payload.get("option_id"), payload.get("optionId")),
        "target_ref": first_present(event.get("target_ref"), payload.get("target_ref"), payload.get("email_id"), payload.get("document_id")),
        "payload": payload,
    }


def insert_mechanic_events(conn, session_id: str, version_id: str | None, mechanic_events: list):
    for index, event in enumerate(mechanic_events, start=1):
        event_id = event.get("event_id") or f"{session_id}:mechanic_event:{index}"
        mechanic_id = event.get("mechanic_id")
        reference = _extract_event_reference(event)
        ensure_mechanic(conn, mechanic_id, version_id)
        ensure_decision_reference(
            conn,
            node_id=reference["node_id"],
            option_id=reference["option_id"],
            version_id=version_id,
        )
        conn.execute(
            """
            INSERT INTO mechanic_events (
                event_id, session_id, mechanic_id, event_type, timestamp_ms,
                node_id, option_id, target_ref, raw_payload, timestamp, payload
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (event_id) DO UPDATE SET
                session_id = EXCLUDED.session_id,
                mechanic_id = EXCLUDED.mechanic_id,
                event_type = EXCLUDED.event_type,
                timestamp_ms = EXCLUDED.timestamp_ms,
                node_id = EXCLUDED.node_id,
                option_id = EXCLUDED.option_id,
                target_ref = EXCLUDED.target_ref,
                raw_payload = EXCLUDED.raw_payload,
                timestamp = EXCLUDED.timestamp,
                payload = EXCLUDED.payload
            """,
            (
                event_id,
                session_id,
                mechanic_id,
                event.get("event_type"),
                int_or_none(first_present(event.get("timestamp_ms"), event.get("timestamp"))),
                reference["node_id"],
                reference["option_id"],
                reference["target_ref"],
                to_jsonb(reference["payload"]),
                int_or_none(first_present(event.get("timestamp_ms"), event.get("timestamp"))),
                to_jsonb(reference["payload"]),
            ),
        )
