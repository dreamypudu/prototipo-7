try:
    from ..json_utils import bool_or_none, first_present, float_or_none, int_or_none, to_jsonb
    from .common import ensure_decision_reference, ensure_stakeholder, find_stakeholder_by_name
except ImportError:
    from json_utils import bool_or_none, first_present, float_or_none, int_or_none, to_jsonb
    from normalizers.common import ensure_decision_reference, ensure_stakeholder, find_stakeholder_by_name


def _coerce_tags(raw_tags):
    if isinstance(raw_tags, list) and raw_tags:
        first = raw_tags[0] if isinstance(raw_tags[0], dict) else {}
        return (
            first.get("tag_type"),
            first.get("tag_value") or first.get("tag_variable"),
            float_or_none(first.get("tag_score")),
        )
    if isinstance(raw_tags, dict):
        if any(key in raw_tags for key in ("tag_type", "tag_value", "tag_variable", "tag_score")):
            return (
                raw_tags.get("tag_type"),
                raw_tags.get("tag_value") or raw_tags.get("tag_variable"),
                float_or_none(raw_tags.get("tag_score")),
            )
        if raw_tags:
            key = next(iter(raw_tags))
            value = raw_tags.get(key)
            if isinstance(value, dict):
                return (
                    value.get("tag_type") or key,
                    value.get("tag_value") or value.get("tag_variable"),
                    float_or_none(value.get("tag_score") or value.get("score")),
                )
            return (key, str(value), None)
    return (None, None, None)


def insert_explicit_decisions(conn, session_id: str, user_id: str, version_id: str | None, decisions: list, stakeholders_state: list):
    for index, decision in enumerate(decisions, start=1):
        node_id = first_present(decision.get("node_id"), decision.get("nodeId"))
        option_id = first_present(decision.get("option_id"), decision.get("choiceId"))
        option_text = first_present(decision.get("option_text"), decision.get("choiceText"))
        raw_tags = first_present(decision.get("raw_tags"), decision.get("tags"))
        tag_type, tag_value, tag_score = _coerce_tags(raw_tags)
        consequences = decision.get("consequences") if isinstance(decision.get("consequences"), dict) else {}
        stakeholder = find_stakeholder_by_name(stakeholders_state, decision.get("stakeholder"))
        npc_id = first_present(decision.get("npc_id"), decision.get("stakeholder_id"), stakeholder.get("id") if stakeholder else None)
        npc_role = first_present(decision.get("npc_role"), stakeholder.get("role") if stakeholder else None)
        npc_name = first_present(decision.get("npc_name"), decision.get("stakeholder"), stakeholder.get("name") if stakeholder else None)
        sequence_id = decision.get("sequence_id")

        ensure_stakeholder(conn, npc_id, npc_name, npc_role)
        ensure_decision_reference(
            conn,
            node_id=node_id,
            option_id=option_id,
            option_text=option_text,
            sequence_id=sequence_id,
            version_id=version_id,
            npc_id=npc_id,
            npc_role=npc_role,
            npc_name=npc_name,
            day=int_or_none(decision.get("day")),
            time_slot=decision.get("timeSlot") or decision.get("time_slot"),
            raw_node={"decision": decision},
            raw_option={"tags": raw_tags, "consequences": consequences},
        )
        conn.execute(
            """
            INSERT INTO explicit_decisions (
                session_id, user_id, decision_order, sequence_id, case_id, node_id,
                node_title, npc_id, npc_role, npc_name, day, time_slot, option_id,
                option_text, is_decision, tag_type, tag_value, tag_score, raw_tags,
                trust_delta, support_delta, reputation_delta, budget_delta,
                project_progress_delta, dialogue_response, raw_consequences
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                session_id,
                user_id,
                int_or_none(decision.get("decision_order")) or index,
                sequence_id,
                decision.get("case_id"),
                node_id,
                first_present(decision.get("node_title"), node_id),
                npc_id,
                npc_role,
                npc_name,
                int_or_none(decision.get("day")),
                decision.get("timeSlot") or decision.get("time_slot"),
                option_id,
                option_text,
                bool_or_none(first_present(decision.get("is_decision"), option_id != "NEXT")),
                tag_type,
                tag_value,
                tag_score,
                to_jsonb(raw_tags),
                float_or_none(consequences.get("trustChange")),
                float_or_none(consequences.get("supportChange")),
                float_or_none(consequences.get("reputationChange")),
                float_or_none(consequences.get("budgetChange")),
                float_or_none(consequences.get("projectProgressChange")),
                consequences.get("dialogueResponse"),
                to_jsonb(consequences),
            ),
        )
