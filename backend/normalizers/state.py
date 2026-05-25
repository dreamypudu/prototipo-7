try:
    from ..json_utils import as_list, as_record, first_present, float_or_none, int_or_none, to_jsonb
    from .common import ensure_stakeholder
except ImportError:
    from json_utils import as_list, as_record, first_present, float_or_none, int_or_none, to_jsonb
    from normalizers.common import ensure_stakeholder


def insert_question_log(conn, session_id: str, question_log: list):
    for entry in question_log:
        npc_id = entry.get("npc_id") or entry.get("stakeholder_id")
        ensure_stakeholder(conn, npc_id)
        conn.execute(
            """
            INSERT INTO question_log (
                session_id, npc_id, question_id, was_locked, trust_at_ask,
                support_at_ask, reputation_at_ask, timestamp_ms, day, time_slot
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                session_id,
                npc_id,
                entry.get("question_id"),
                entry.get("was_locked"),
                float_or_none(entry.get("trust_at_ask")),
                float_or_none(entry.get("support_at_ask")),
                float_or_none(entry.get("reputation_at_ask")),
                int_or_none(first_present(entry.get("timestamp_ms"), entry.get("timestamp"))),
                int_or_none(entry.get("day")),
                entry.get("timeSlot") or entry.get("time_slot"),
            ),
        )


def insert_player_actions(conn, session_id: str, player_actions_log: list):
    for log in player_actions_log:
        conn.execute(
            """
            INSERT INTO player_actions_log (session_id, event, metadata, day, time_slot, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                session_id,
                log.get("event"),
                to_jsonb(log.get("metadata")),
                int_or_none(log.get("day")),
                log.get("timeSlot") or log.get("time_slot"),
                float_or_none(log.get("timestamp")),
            ),
        )


def insert_session_state(conn, session_id: str, final_state: dict):
    if not final_state:
        return
    conn.execute(
        """
        INSERT INTO session_state (session_id, stakeholders, global_state)
        VALUES (%s, %s, %s)
        ON CONFLICT (session_id) DO UPDATE SET
            stakeholders = EXCLUDED.stakeholders,
            global_state = EXCLUDED.global_state
        """,
        (
            session_id,
            to_jsonb(final_state.get("stakeholders")),
            to_jsonb(final_state.get("global")),
        ),
    )
    stakeholders_state = final_state.get("stakeholders")
    if not isinstance(stakeholders_state, list):
        return
    for stakeholder in stakeholders_state:
        stakeholder_id = stakeholder.get("id") or stakeholder.get("shortId") or stakeholder.get("name")
        if not stakeholder_id:
            continue
        ensure_stakeholder(conn, stakeholder_id, stakeholder.get("name"), stakeholder.get("role"))
        conn.execute(
            """
            INSERT INTO session_stakeholders (session_id, stakeholder_id, state)
            VALUES (%s, %s, %s)
            ON CONFLICT (session_id, stakeholder_id) DO UPDATE SET
                state = EXCLUDED.state
            """,
            (session_id, stakeholder_id, to_jsonb(stakeholder)),
        )


def insert_final_state(conn, session_id: str, user_id: str, version_id: str | None, final_state: dict, explicit_decisions: list):
    if not final_state:
        return
    global_state = as_record(final_state.get("global"))
    completed_node_ids = set(as_list(final_state.get("completedScenarios"))) or {
        first_present(decision.get("node_id"), decision.get("nodeId"))
        for decision in explicit_decisions
        if first_present(decision.get("node_id"), decision.get("nodeId"))
    }
    completed_sequence_ids = set(as_list(final_state.get("completedSequences"))) or {
        decision.get("sequence_id")
        for decision in explicit_decisions
        if decision.get("sequence_id")
    }
    conn.execute(
        """
        INSERT INTO final_states (
            session_id, user_id, version_id, final_day, final_budget,
            final_reputation, final_project_progress, completed_sequences_count,
            completed_scenarios_count, raw_final_state
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (session_id) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            version_id = EXCLUDED.version_id,
            final_day = EXCLUDED.final_day,
            final_budget = EXCLUDED.final_budget,
            final_reputation = EXCLUDED.final_reputation,
            final_project_progress = EXCLUDED.final_project_progress,
            completed_sequences_count = EXCLUDED.completed_sequences_count,
            completed_scenarios_count = EXCLUDED.completed_scenarios_count,
            raw_final_state = EXCLUDED.raw_final_state
        """,
        (
            session_id,
            user_id,
            version_id,
            int_or_none(global_state.get("day")),
            float_or_none(global_state.get("budget")),
            float_or_none(global_state.get("reputation")),
            float_or_none(global_state.get("projectProgress")),
            len(completed_sequence_ids),
            len(completed_node_ids),
            to_jsonb(final_state),
        ),
    )
