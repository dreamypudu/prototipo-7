try:
    from ..json_utils import as_record, bool_or_none, first_present, float_or_none, int_or_none, to_jsonb
    from .common import ensure_decision_reference, ensure_stakeholder, find_stakeholder_by_name
except ImportError:
    from json_utils import as_record, bool_or_none, first_present, float_or_none, int_or_none, to_jsonb
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


def _number_delta(primary, before, after):
    explicit_delta = float_or_none(primary)
    if explicit_delta is not None:
        return explicit_delta
    before_value = float_or_none(before)
    after_value = float_or_none(after)
    if before_value is None or after_value is None:
        return None
    return after_value - before_value


def _zero_if_missing(value):
    number = float_or_none(value)
    return number if number is not None else 0


def _extract_consequences(decision: dict):
    return as_record(first_present(decision.get("consequences"), decision.get("raw_consequences")))


def _extract_global_delta(decision: dict, consequences: dict, field: str, legacy_field: str):
    before = as_record(first_present(decision.get("globalEffectsBefore"), decision.get("global_effects_before")))
    after = as_record(first_present(decision.get("globalEffectsAfter"), decision.get("global_effects_after")))
    return _number_delta(
        first_present(consequences.get(legacy_field), consequences.get(field)),
        before.get(field),
        after.get(field),
    )


def _bridge_response_text(value):
    if isinstance(value, list):
        parts = []
        for entry in value:
            if isinstance(entry, dict) and entry.get("text"):
                parts.append(str(entry.get("text")))
        return "\n".join(parts) if parts else None
    return value


def insert_explicit_decisions(conn, session_id: str, user_id: str, version_id: str | None, decisions: list, stakeholders_state: list):
    for index, decision in enumerate(decisions, start=1):
        node_id = first_present(decision.get("node_id"), decision.get("nodeId"))
        option_id = first_present(decision.get("option_id"), decision.get("choiceId"))
        option_text = first_present(decision.get("option_text"), decision.get("choiceText"))
        consequences = _extract_consequences(decision)
        sequence_id = first_present(decision.get("sequence_id"), decision.get("sequenceId"))
        time_slot = first_present(decision.get("time_slot"), decision.get("timeSlot"))
        trust_delta = _zero_if_missing(first_present(consequences.get("trust_delta"), consequences.get("trustChange")))
        support_delta = _zero_if_missing(first_present(consequences.get("support_delta"), consequences.get("supportChange")))
        reputation_delta = _zero_if_missing(_extract_global_delta(decision, consequences, "reputation", "reputationChange"))
        dialogue_response = _bridge_response_text(first_present(
            consequences.get("dialogue_response"),
            consequences.get("bridgeResponse"),
            consequences.get("dialogueResponse"),
        ))

        ensure_decision_reference(
            conn,
            node_id=node_id,
            option_id=option_id,
            option_text=option_text,
            sequence_id=sequence_id,
            version_id=version_id,
            day=int_or_none(decision.get("day")),
            time_slot=time_slot,
            raw_node={"decision": decision},
            raw_option={"consequences": consequences},
        )
        conn.execute(
            """
            INSERT INTO explicit_decisions (
                session_id, user_id, decision_order, sequence_id, node_id,
                day, time_slot, option_id, option_text, is_decision,
                trust_delta, support_delta, reputation_delta,
                dialogue_response, raw_consequences
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (session_id, node_id, option_id) DO UPDATE SET
                user_id = EXCLUDED.user_id,
                decision_order = EXCLUDED.decision_order,
                sequence_id = EXCLUDED.sequence_id,
                day = EXCLUDED.day,
                time_slot = EXCLUDED.time_slot,
                option_text = EXCLUDED.option_text,
                is_decision = EXCLUDED.is_decision,
                trust_delta = EXCLUDED.trust_delta,
                support_delta = EXCLUDED.support_delta,
                reputation_delta = EXCLUDED.reputation_delta,
                dialogue_response = EXCLUDED.dialogue_response,
                raw_consequences = EXCLUDED.raw_consequences
            """,
            (
                session_id,
                user_id,
                int_or_none(first_present(decision.get("decision_order"), decision.get("decisionOrder"))) or index,
                sequence_id,
                node_id,
                int_or_none(decision.get("day")),
                time_slot,
                option_id,
                option_text,
                bool_or_none(first_present(decision.get("is_decision"), option_id != "NEXT")),
                trust_delta,
                support_delta,
                reputation_delta,
                dialogue_response,
                to_jsonb(consequences),
            ),
        )
