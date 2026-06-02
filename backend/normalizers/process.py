try:
    from ..json_utils import as_list, as_record, first_present, float_or_none, int_or_none, to_jsonb
    from .common import ensure_decision_reference
except ImportError:
    from json_utils import as_list, as_record, first_present, float_or_none, int_or_none, to_jsonb
    from normalizers.common import ensure_decision_reference


def _process_hover_summary(log: dict):
    events = as_list(log.get("events"))
    start_time = float_or_none(log.get("startTime")) or 0
    final_choice = log.get("finalChoice")
    hover_totals: dict[str, float] = {}
    hover_counts: dict[str, int] = {}
    open_hover: dict[str, float] = {}
    hover_sequence: list[str] = []

    for event in events:
        metadata = as_record(event.get("metadata"))
        option_id = metadata.get("option_id")
        if not option_id:
            continue
        timestamp = float_or_none(event.get("timestamp")) or start_time
        if event.get("type") == "hover_enter":
            # Solo cuenta si la opcion no tenia ya un hover abierto. Asi una reentrada sin
            # 'hover_leave' en medio (popup que roba el cursor, StrictMode en dev, micro-flicker)
            # NO suma de nuevo: 1 hover = una vez que el usuario entro a la opcion.
            if option_id not in open_hover:
                hover_counts[option_id] = hover_counts.get(option_id, 0) + 1
                open_hover[option_id] = timestamp
                hover_sequence.append(option_id)
        elif event.get("type") == "hover_leave" and option_id in open_hover:
            hover_totals[option_id] = hover_totals.get(option_id, 0) + max(0, timestamp - open_hover[option_id])
            del open_hover[option_id]

    end_time = float_or_none(log.get("endTime")) or start_time
    for option_id, entered_at in open_hover.items():
        hover_totals[option_id] = hover_totals.get(option_id, 0) + max(0, end_time - entered_at)

    selected_hover = hover_totals.get(final_choice, 0)
    max_hover = max(hover_totals.values(), default=0)
    return {
        "hover_totals": hover_totals,
        "hover_counts": hover_counts,
        "first_hover_option_id": hover_sequence[0] if hover_sequence else None,
        "last_hover_option_id": hover_sequence[-1] if hover_sequence else None,
        "selected_option_hover_ms": selected_hover,
        "selected_option_was_most_hovered": selected_hover == max_hover if final_choice and max_hover > 0 else None,
        "hover_switch_count": sum(1 for left, right in zip(hover_sequence, hover_sequence[1:]) if left != right),
    }


def insert_option_process_stats(conn, session_id: str, process_log: list):
    """Una fila por (sesion, nodo, opcion): nº de hovers y tiempo total sobre esa opcion.

    Deriva del mismo resumen que process_logs, pero ya agregado (sin duplicar por evento).
    Los nodos de decision se visitan una vez; si un nodo se repitiera, gana la ultima visita.
    """
    for log in process_log:
        node_id = first_present(log.get("node_id"), log.get("nodeId"))
        final_choice = first_present(log.get("final_choice"), log.get("finalChoice"))
        if not node_id:
            continue
        summary = _process_hover_summary(log)
        hover_totals = summary["hover_totals"]
        hover_counts = summary["hover_counts"]
        option_ids = set(hover_totals) | set(hover_counts)
        if final_choice:
            option_ids.add(final_choice)
        for option_id in option_ids:
            if not option_id:
                continue
            conn.execute(
                """
                INSERT INTO option_process_stats (
                    session_id, node_id, option_id, hover_count, hover_total_ms, is_selected
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (session_id, node_id, option_id) DO UPDATE SET
                    hover_count = EXCLUDED.hover_count,
                    hover_total_ms = EXCLUDED.hover_total_ms,
                    is_selected = EXCLUDED.is_selected
                """,
                (
                    session_id,
                    node_id,
                    option_id,
                    int_or_none(hover_counts.get(option_id)) or 0,
                    float_or_none(hover_totals.get(option_id)) or 0.0,
                    bool(final_choice is not None and option_id == final_choice),
                ),
            )


def insert_process_logs(conn, session_id: str, version_id: str | None, process_log: list):
    for log in process_log:
        node_id = first_present(log.get("node_id"), log.get("nodeId"))
        final_choice = first_present(log.get("final_choice"), log.get("finalChoice"))
        ensure_decision_reference(conn, node_id=node_id, option_id=final_choice, version_id=version_id)
        summary = _process_hover_summary(log)
        events = as_list(log.get("events"))
        if not events:
            events = [{"type": "node_complete", "metadata": {}, "timestamp": log.get("endTime")}]

        for event in events:
            metadata = as_record(event.get("metadata"))
            option_id = first_present(metadata.get("option_id"), final_choice if event.get("type") == "node_complete" else None)
            timestamp = float_or_none(event.get("timestamp"))
            conn.execute(
                """
                INSERT INTO process_logs (
                    session_id, node_id, option_id, event_type, timestamp_ms,
                    elapsed_from_node_start_ms, node_total_duration_ms,
                    option_hover_total_ms, option_hover_count, first_hover_option_id,
                    last_hover_option_id, selected_option_hover_ms,
                    selected_option_was_most_hovered, hover_switch_count,
                    raw_metadata, start_time, end_time, total_duration, final_choice, events
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    session_id,
                    node_id,
                    option_id,
                    event.get("type"),
                    timestamp,
                    timestamp - (float_or_none(log.get("startTime")) or 0) if timestamp is not None else None,
                    float_or_none(log.get("totalDuration")),
                    float_or_none(summary["hover_totals"].get(option_id)) if option_id else None,
                    int_or_none(summary["hover_counts"].get(option_id)) if option_id else None,
                    summary["first_hover_option_id"],
                    summary["last_hover_option_id"],
                    float_or_none(summary["selected_option_hover_ms"]),
                    summary["selected_option_was_most_hovered"],
                    int_or_none(summary["hover_switch_count"]),
                    to_jsonb(metadata),
                    float_or_none(log.get("startTime")),
                    float_or_none(log.get("endTime")),
                    float_or_none(log.get("totalDuration")),
                    final_choice,
                    to_jsonb(log.get("events")),
                ),
            )
