try:
    from ..json_utils import bool_or_none, first_present, int_or_none, to_jsonb
except ImportError:
    from json_utils import bool_or_none, first_present, int_or_none, to_jsonb


def insert_comparisons(conn, session_id: str, comparisons: list, expected_ids: set, canonical_ids: set):
    for index, comparison in enumerate(comparisons, start=1):
        exp_id = comparison.get("expected_action_id")
        canonical_id = comparison.get("canonical_action_id")
        safe_expected_id = exp_id if exp_id in expected_ids else None
        safe_canonical_id = canonical_id if canonical_id in canonical_ids else None
        comparison_id = comparison.get("comparison_id") or f"{session_id}:comparison:{index}"
        raw_deviation = first_present(comparison.get("raw_deviation"), comparison.get("deviation"))
        resolved_at_ms = int_or_none(comparison.get("resolved_at_ms"))
        expected_row = None
        canonical_row = None
        if safe_expected_id:
            expected_row = conn.execute(
                "SELECT mechanic_id, created_at_ms FROM expected_actions WHERE expected_action_id = %s",
                (safe_expected_id,),
            ).fetchone()
        if safe_canonical_id:
            canonical_row = conn.execute(
                "SELECT mechanic_id FROM canonical_actions WHERE canonical_action_id = %s",
                (safe_canonical_id,),
            ).fetchone()

        expected_created_at_ms = int_or_none(expected_row["created_at_ms"]) if expected_row else None
        commitment_elapsed_ms = int_or_none(
            first_present(comparison.get("commitment_elapsed_ms"), comparison.get("elapsed_ms"))
        )
        if commitment_elapsed_ms is None and resolved_at_ms is not None and expected_created_at_ms is not None:
            commitment_elapsed_ms = max(0, resolved_at_ms - expected_created_at_ms)

        mechanic_id = first_present(
            comparison.get("mechanic_id"),
            expected_row["mechanic_id"] if expected_row else None,
            canonical_row["mechanic_id"] if canonical_row else None,
        )
        if mechanic_id:
            conn.execute(
                "INSERT INTO mechanics (mechanic_id) VALUES (%s) ON CONFLICT (mechanic_id) DO NOTHING",
                (mechanic_id,),
            )

        conn.execute(
            """
            INSERT INTO comparisons (
                comparison_id, session_id, expected_action_id, canonical_action_id,
                mechanic_id, outcome, reason, rule_id, resolved_day, resolved_at_ms,
                commitment_elapsed_ms,
                raw_deviation, deviation
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (comparison_id) DO UPDATE SET
                session_id = EXCLUDED.session_id,
                expected_action_id = EXCLUDED.expected_action_id,
                canonical_action_id = EXCLUDED.canonical_action_id,
                mechanic_id = EXCLUDED.mechanic_id,
                outcome = EXCLUDED.outcome,
                reason = EXCLUDED.reason,
                rule_id = EXCLUDED.rule_id,
                resolved_day = EXCLUDED.resolved_day,
                resolved_at_ms = EXCLUDED.resolved_at_ms,
                commitment_elapsed_ms = EXCLUDED.commitment_elapsed_ms,
                raw_deviation = EXCLUDED.raw_deviation,
                deviation = EXCLUDED.deviation
            """,
            (
                comparison_id,
                session_id,
                safe_expected_id,
                safe_canonical_id,
                mechanic_id,
                bool_or_none(comparison.get("outcome")),
                comparison.get("reason"),
                comparison.get("rule_id"),
                int_or_none(comparison.get("resolved_day")),
                resolved_at_ms,
                commitment_elapsed_ms,
                to_jsonb(raw_deviation),
                to_jsonb(raw_deviation),
            ),
        )
