"""Agregados psicometricos de la mecanica de mapa, derivados de mechanic_events:

- map_hover_stats: por (sesion, dia, bloque, npc), cuantas veces se paso el mouse sobre el
  funcionario y el tiempo total (consideracion), y si termino visitandolo.
- map_block_latency: por (sesion, dia, bloque), tiempo desde que se abre el mapa hasta el
  primer click y nº de visitas.
- stamp_map_visit_order: numera las visitas (visit_order) por sesion segun arrived_at_ms.

El conteo de hover usa la misma logica robusta que las tarjetas: cuenta solo al entrar desde
"no abierto" (inmune a flicker / StrictMode / re-render).
"""
try:
    from ..json_utils import as_record, first_present, float_or_none, int_or_none
except ImportError:
    from json_utils import as_record, first_present, float_or_none, int_or_none


def _map_events(mechanic_events):
    return [ev for ev in (mechanic_events or []) if ev.get("mechanic_id") == "map"]


def insert_map_hover_stats(conn, session_id: str, mechanic_events: list):
    map_events = _map_events(mechanic_events)

    # Set de (dia, bloque, npc) efectivamente visitados (para was_visited).
    visited = set()
    for ev in map_events:
        if ev.get("event_type") != "staff_clicked":
            continue
        payload = as_record(ev.get("payload"))
        npc = first_present(payload.get("npc_id"), payload.get("staff_id"))
        day = int_or_none(payload.get("day"))
        slot = payload.get("time_slot")
        if npc is not None and day is not None and slot is not None:
            visited.add((day, slot, npc))

    # Eventos de hover ordenados por timestamp.
    hover_events = []
    for ev in map_events:
        event_type = ev.get("event_type")
        if event_type not in ("staff_hover_enter", "staff_hover_leave"):
            continue
        payload = as_record(ev.get("payload"))
        npc = payload.get("npc_id")
        day = int_or_none(payload.get("day"))
        slot = payload.get("time_slot")
        ts = float_or_none(first_present(payload.get("ts"), ev.get("timestamp")))
        if npc is None or day is None or slot is None or ts is None:
            continue
        hover_events.append((ts, day, slot, npc, event_type))
    hover_events.sort(key=lambda e: e[0])

    stats: dict = {}  # (day, slot, npc) -> {count, total, open_ts}
    for ts, day, slot, npc, event_type in hover_events:
        key = (day, slot, npc)
        st = stats.setdefault(key, {"count": 0, "total": 0.0, "open_ts": None})
        if event_type == "staff_hover_enter":
            # Solo cuenta si no habia un hover abierto (reentradas sin leave no suman doble).
            if st["open_ts"] is None:
                st["count"] += 1
                st["open_ts"] = ts
        else:  # staff_hover_leave
            if st["open_ts"] is not None:
                st["total"] += max(0.0, ts - st["open_ts"])
                st["open_ts"] = None

    for (day, slot, npc), st in stats.items():
        conn.execute(
            """
            INSERT INTO map_hover_stats (
                session_id, day, time_slot, npc_id, hover_count, hover_total_ms, was_visited
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (session_id, day, time_slot, npc_id) DO UPDATE SET
                hover_count = EXCLUDED.hover_count,
                hover_total_ms = EXCLUDED.hover_total_ms,
                was_visited = EXCLUDED.was_visited
            """,
            (session_id, day, slot, npc, st["count"], st["total"], (day, slot, npc) in visited),
        )


def insert_map_block_latency(conn, session_id: str, mechanic_events: list):
    map_events = _map_events(mechanic_events)

    entered: dict = {}       # (day, slot) -> earliest block_entered ts
    first_click: dict = {}   # (day, slot) -> earliest click ts
    visit_count: dict = {}   # (day, slot) -> n visitas

    for ev in map_events:
        event_type = ev.get("event_type")
        payload = as_record(ev.get("payload"))
        day = int_or_none(payload.get("day"))
        slot = payload.get("time_slot")
        if day is None or slot is None:
            continue
        key = (day, slot)
        if event_type == "map_block_entered":
            ts = float_or_none(first_present(payload.get("ts"), ev.get("timestamp")))
            if ts is not None and (key not in entered or ts < entered[key]):
                entered[key] = ts
        elif event_type == "staff_clicked":
            ts = float_or_none(first_present(payload.get("arrived_at_ms"), payload.get("ts"), ev.get("timestamp")))
            visit_count[key] = visit_count.get(key, 0) + 1
            if ts is not None and (key not in first_click or ts < first_click[key]):
                first_click[key] = ts

    for key in set(entered) | set(first_click) | set(visit_count):
        day, slot = key
        be = entered.get(key)
        fc = first_click.get(key)
        ms_to_first = max(0, int(fc - be)) if (be is not None and fc is not None) else None
        conn.execute(
            """
            INSERT INTO map_block_latency (
                session_id, day, time_slot, block_entered_ms, first_click_ms, ms_to_first_click, visit_count
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (session_id, day, time_slot) DO UPDATE SET
                block_entered_ms = EXCLUDED.block_entered_ms,
                first_click_ms = EXCLUDED.first_click_ms,
                ms_to_first_click = EXCLUDED.ms_to_first_click,
                visit_count = EXCLUDED.visit_count
            """,
            (
                session_id,
                day,
                slot,
                int(be) if be is not None else None,
                int(fc) if fc is not None else None,
                ms_to_first,
                visit_count.get(key, 0),
            ),
        )


def stamp_map_visit_order(conn, session_id: str):
    conn.execute(
        """
        WITH ordered AS (
            SELECT canonical_action_id,
                   ROW_NUMBER() OVER (ORDER BY arrived_at_ms NULLS LAST, canonical_action_id) AS rn
            FROM map_action_details
            WHERE session_id = %s
        )
        UPDATE map_action_details m
        SET visit_order = ordered.rn
        FROM ordered
        WHERE m.canonical_action_id = ordered.canonical_action_id
        """,
        (session_id,),
    )
