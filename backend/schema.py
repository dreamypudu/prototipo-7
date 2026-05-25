try:
    from .normalizers.mechanics import create_mechanic_export_schema
except ImportError:
    from normalizers.mechanics import create_mechanic_export_schema


def _constraint_exists_block(constraint_name: str, ddl: str) -> str:
    return f"""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = '{constraint_name}'
        ) THEN
            {ddl}
        END IF;
    END$$;
    """


def _drop_constraint(conn, table_name: str, constraint_name: str):
    conn.execute(
        f"""
        DO $$
        BEGIN
            IF to_regclass('{table_name}') IS NOT NULL THEN
                ALTER TABLE {table_name} DROP CONSTRAINT IF EXISTS {constraint_name} CASCADE;
            END IF;
        END$$;
        """
    )


def _migrate_legacy_columns(conn):
    conn.execute("DROP TABLE IF EXISTS cases CASCADE")
    conn.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'decision_nodes' AND column_name = 'nodo_id'
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'decision_nodes' AND column_name = 'node_id'
            ) THEN
                ALTER TABLE decision_nodes RENAME COLUMN nodo_id TO node_id;
            END IF;

            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'decision_nodes' AND column_name = 'escenario_id'
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'decision_nodes' AND column_name = 'sequence_id'
            ) THEN
                ALTER TABLE decision_nodes RENAME COLUMN escenario_id TO sequence_id;
            END IF;

            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'decision_nodes' AND column_name = 'texto'
            ) AND NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'decision_nodes' AND column_name = 'node_title'
            ) THEN
                ALTER TABLE decision_nodes RENAME COLUMN texto TO node_title;
            END IF;
        END$$;
        """
    )
    _drop_constraint(conn, "decision_nodes", "decision_nodes_escenario_id_fkey")


def _migrate_json_columns(conn):
    for table_name, column_name in [
        ("sessions", "payload"),
        ("explicit_decisions", "raw_tags"),
        ("explicit_decisions", "raw_consequences"),
        ("expected_actions", "raw_constraints"),
        ("expected_actions", "raw_effects"),
        ("canonical_actions", "raw_value_final"),
        ("canonical_actions", "raw_context"),
        ("mechanic_events", "raw_payload"),
        ("comparisons", "raw_deviation"),
        ("process_logs", "raw_metadata"),
        ("daily_effects", "comparisons"),
        ("daily_effects", "global_deltas"),
        ("daily_effects", "stakeholder_deltas"),
        ("player_actions_log", "metadata"),
        ("session_state", "stakeholders"),
        ("session_state", "global_state"),
        ("session_stakeholders", "state"),
        ("final_states", "raw_final_state"),
        ("reports", "payload"),
    ]:
        conn.execute(
            f"""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = '{table_name}' AND column_name = '{column_name}'
                      AND data_type <> 'jsonb'
                ) THEN
                    ALTER TABLE {table_name}
                    ALTER COLUMN {column_name} TYPE JSONB
                    USING CASE
                        WHEN {column_name} IS NULL THEN NULL
                        ELSE {column_name}::jsonb
                    END;
                END IF;
            END$$;
            """
        )


def _migrate_comparison_id_and_outcome(conn):
    conn.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'comparisons' AND column_name = 'comparison_id'
                  AND data_type <> 'text'
            ) THEN
                ALTER TABLE comparisons ALTER COLUMN comparison_id DROP DEFAULT;
                ALTER TABLE comparisons ALTER COLUMN comparison_id TYPE TEXT USING comparison_id::text;
            END IF;
        END$$;
        """
    )
    conn.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'comparisons' AND column_name = 'outcome'
                  AND data_type <> 'boolean'
            ) THEN
                ALTER TABLE comparisons
                ALTER COLUMN outcome TYPE BOOLEAN
                USING CASE
                    WHEN outcome IS NULL THEN NULL
                    WHEN lower(outcome::text) IN ('true', 't', '1', 'yes', 'y') THEN TRUE
                    WHEN lower(outcome::text) IN ('false', 'f', '0', 'no', 'n') THEN FALSE
                    ELSE NULL
                END;
            END IF;
        END$$;
        """
    )


def _create_core_tables(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            name TEXT,
            tipo_usuario TEXT,
            edad_usuario INTEGER,
            carrera_usuario TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS versions (
            version_id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS mechanics (
            mechanic_id TEXT PRIMARY KEY,
            version_id TEXT REFERENCES versions(version_id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS stakeholders (
            stakeholder_id TEXT PRIMARY KEY,
            name TEXT,
            role TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS scenario_sequences (
            sequence_id TEXT PRIMARY KEY,
            version_id TEXT REFERENCES versions(version_id),
            stakeholder_id TEXT REFERENCES stakeholders(stakeholder_id),
            sequence_title TEXT,
            raw_sequence JSONB
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS decision_nodes (
            node_id TEXT PRIMARY KEY,
            sequence_id TEXT REFERENCES scenario_sequences(sequence_id),
            node_title TEXT,
            npc_id TEXT REFERENCES stakeholders(stakeholder_id),
            npc_role TEXT,
            npc_name TEXT,
            day INTEGER,
            time_slot TEXT,
            raw_node JSONB
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS decision_options (
            node_id TEXT NOT NULL,
            option_id TEXT NOT NULL,
            option_text TEXT,
            is_decision BOOLEAN,
            raw_option JSONB,
            PRIMARY KEY (node_id, option_id),
            FOREIGN KEY (node_id) REFERENCES decision_nodes(node_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(user_id),
            version_id TEXT REFERENCES versions(version_id),
            start_time TEXT,
            end_time TEXT,
            created_at TEXT NOT NULL,
            payload JSONB NOT NULL,
            estado TEXT,
            navegador TEXT
        )
        """
    )


def _create_contract_tables(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS explicit_decisions (
            decision_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            user_id TEXT REFERENCES users(user_id),
            decision_order INTEGER,
            sequence_id TEXT REFERENCES scenario_sequences(sequence_id),
            case_id TEXT,
            node_id TEXT,
            node_title TEXT,
            npc_id TEXT REFERENCES stakeholders(stakeholder_id),
            npc_role TEXT,
            npc_name TEXT,
            day INTEGER,
            time_slot TEXT,
            option_id TEXT,
            option_text TEXT,
            is_decision BOOLEAN,
            tag_type TEXT,
            tag_value TEXT,
            tag_score DOUBLE PRECISION,
            raw_tags JSONB,
            trust_delta DOUBLE PRECISION,
            support_delta DOUBLE PRECISION,
            reputation_delta DOUBLE PRECISION,
            budget_delta DOUBLE PRECISION,
            project_progress_delta DOUBLE PRECISION,
            dialogue_response TEXT,
            raw_consequences JSONB
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS expected_actions (
            expected_action_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            source_node_id TEXT,
            source_option_id TEXT,
            npc_id TEXT REFERENCES stakeholders(stakeholder_id),
            mechanic_id TEXT REFERENCES mechanics(mechanic_id),
            action_type TEXT,
            target_ref TEXT,
            rule_id TEXT,
            created_at_ms BIGINT,
            created_day INTEGER,
            created_time_slot TEXT,
            due_day INTEGER,
            due_time_slot TEXT,
            has_expected_action BOOLEAN,
            raw_constraints JSONB,
            raw_effects JSONB,
            ui_title TEXT,
            ui_description TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS canonical_actions (
            canonical_action_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            mechanic_id TEXT REFERENCES mechanics(mechanic_id),
            action_type TEXT,
            target_ref TEXT,
            target_type TEXT,
            target_id TEXT,
            target_label TEXT,
            day INTEGER,
            time_slot TEXT,
            committed_day INTEGER,
            committed_time_slot TEXT,
            source_node_id TEXT,
            source_option_id TEXT,
            summary TEXT,
            committed_at_ms BIGINT,
            raw_value_final JSONB,
            raw_context JSONB,
            value_final JSONB,
            context JSONB
        )
        """
    )
    create_mechanic_export_schema(conn)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS mechanic_events (
            event_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            mechanic_id TEXT REFERENCES mechanics(mechanic_id),
            event_type TEXT,
            timestamp_ms BIGINT,
            node_id TEXT,
            option_id TEXT,
            target_ref TEXT,
            raw_payload JSONB,
            timestamp BIGINT,
            payload JSONB
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS comparisons (
            comparison_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            expected_action_id TEXT,
            canonical_action_id TEXT,
            outcome BOOLEAN,
            reason TEXT,
            rule_id TEXT,
            resolved_day INTEGER,
            resolved_at_ms BIGINT,
            raw_deviation JSONB,
            deviation JSONB
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS process_logs (
            process_log_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            node_id TEXT,
            option_id TEXT,
            event_type TEXT,
            timestamp_ms DOUBLE PRECISION,
            elapsed_from_node_start_ms DOUBLE PRECISION,
            node_total_duration_ms DOUBLE PRECISION,
            option_hover_total_ms DOUBLE PRECISION,
            option_hover_count INTEGER,
            first_hover_option_id TEXT,
            last_hover_option_id TEXT,
            selected_option_hover_ms DOUBLE PRECISION,
            selected_option_was_most_hovered BOOLEAN,
            hover_switch_count INTEGER,
            raw_metadata JSONB,
            start_time DOUBLE PRECISION,
            end_time DOUBLE PRECISION,
            total_duration DOUBLE PRECISION,
            final_choice TEXT,
            events JSONB
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS question_log (
            question_log_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            npc_id TEXT REFERENCES stakeholders(stakeholder_id),
            question_id TEXT,
            was_locked BOOLEAN,
            trust_at_ask DOUBLE PRECISION,
            support_at_ask DOUBLE PRECISION,
            reputation_at_ask DOUBLE PRECISION,
            timestamp_ms BIGINT,
            day INTEGER,
            time_slot TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS final_states (
            session_id TEXT PRIMARY KEY REFERENCES sessions(session_id) ON DELETE CASCADE,
            user_id TEXT REFERENCES users(user_id),
            version_id TEXT REFERENCES versions(version_id),
            final_day INTEGER,
            final_budget DOUBLE PRECISION,
            final_reputation DOUBLE PRECISION,
            final_project_progress DOUBLE PRECISION,
            completed_sequences_count INTEGER,
            completed_scenarios_count INTEGER,
            raw_final_state JSONB
        )
        """
    )


def _create_support_tables(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS daily_effects (
            effect_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            day INTEGER NOT NULL,
            comparisons JSONB,
            global_deltas JSONB,
            stakeholder_deltas JSONB,
            created_at TEXT NOT NULL,
            status TEXT,
            applied_at TEXT,
            UNIQUE (session_id, day)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS player_actions_log (
            player_action_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            event TEXT,
            metadata JSONB,
            day INTEGER,
            time_slot TEXT,
            timestamp DOUBLE PRECISION
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS session_state (
            session_id TEXT PRIMARY KEY REFERENCES sessions(session_id) ON DELETE CASCADE,
            stakeholders JSONB,
            global_state JSONB
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS session_stakeholders (
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            stakeholder_id TEXT NOT NULL REFERENCES stakeholders(stakeholder_id),
            state JSONB,
            PRIMARY KEY (session_id, stakeholder_id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS reports (
            report_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            payload JSONB
        )
        """
    )


def _add_missing_columns(conn):
    statements = [
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS name TEXT,
        ADD COLUMN IF NOT EXISTS tipo_usuario TEXT,
        ADD COLUMN IF NOT EXISTS edad_usuario INTEGER,
        ADD COLUMN IF NOT EXISTS carrera_usuario TEXT
        """,
        """
        ALTER TABLE mechanics
        ADD COLUMN IF NOT EXISTS version_id TEXT
        """,
        """
        ALTER TABLE stakeholders
        ADD COLUMN IF NOT EXISTS name TEXT,
        ADD COLUMN IF NOT EXISTS role TEXT
        """,
        """
        ALTER TABLE sessions
        ADD COLUMN IF NOT EXISTS user_id TEXT,
        ADD COLUMN IF NOT EXISTS version_id TEXT,
        ADD COLUMN IF NOT EXISTS start_time TEXT,
        ADD COLUMN IF NOT EXISTS end_time TEXT,
        ADD COLUMN IF NOT EXISTS created_at TEXT,
        ADD COLUMN IF NOT EXISTS payload JSONB,
        ADD COLUMN IF NOT EXISTS estado TEXT,
        ADD COLUMN IF NOT EXISTS navegador TEXT
        """,
        """
        ALTER TABLE scenario_sequences
        ADD COLUMN IF NOT EXISTS version_id TEXT,
        ADD COLUMN IF NOT EXISTS stakeholder_id TEXT,
        ADD COLUMN IF NOT EXISTS sequence_title TEXT,
        ADD COLUMN IF NOT EXISTS raw_sequence JSONB
        """,
        """
        ALTER TABLE decision_nodes
        ADD COLUMN IF NOT EXISTS sequence_id TEXT,
        ADD COLUMN IF NOT EXISTS node_title TEXT,
        ADD COLUMN IF NOT EXISTS npc_id TEXT,
        ADD COLUMN IF NOT EXISTS npc_role TEXT,
        ADD COLUMN IF NOT EXISTS npc_name TEXT,
        ADD COLUMN IF NOT EXISTS day INTEGER,
        ADD COLUMN IF NOT EXISTS time_slot TEXT,
        ADD COLUMN IF NOT EXISTS raw_node JSONB
        """,
        """
        ALTER TABLE explicit_decisions
        ADD COLUMN IF NOT EXISTS user_id TEXT,
        ADD COLUMN IF NOT EXISTS decision_order INTEGER,
        ADD COLUMN IF NOT EXISTS sequence_id TEXT,
        ADD COLUMN IF NOT EXISTS case_id TEXT,
        ADD COLUMN IF NOT EXISTS node_id TEXT,
        ADD COLUMN IF NOT EXISTS node_title TEXT,
        ADD COLUMN IF NOT EXISTS npc_id TEXT,
        ADD COLUMN IF NOT EXISTS npc_role TEXT,
        ADD COLUMN IF NOT EXISTS npc_name TEXT,
        ADD COLUMN IF NOT EXISTS day INTEGER,
        ADD COLUMN IF NOT EXISTS time_slot TEXT,
        ADD COLUMN IF NOT EXISTS option_id TEXT,
        ADD COLUMN IF NOT EXISTS option_text TEXT,
        ADD COLUMN IF NOT EXISTS is_decision BOOLEAN,
        ADD COLUMN IF NOT EXISTS tag_type TEXT,
        ADD COLUMN IF NOT EXISTS tag_value TEXT,
        ADD COLUMN IF NOT EXISTS tag_score DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS raw_tags JSONB,
        ADD COLUMN IF NOT EXISTS trust_delta DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS support_delta DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS reputation_delta DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS budget_delta DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS project_progress_delta DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS dialogue_response TEXT,
        ADD COLUMN IF NOT EXISTS raw_consequences JSONB
        """,
        """
        ALTER TABLE expected_actions
        ADD COLUMN IF NOT EXISTS source_node_id TEXT,
        ADD COLUMN IF NOT EXISTS source_option_id TEXT,
        ADD COLUMN IF NOT EXISTS npc_id TEXT,
        ADD COLUMN IF NOT EXISTS mechanic_id TEXT,
        ADD COLUMN IF NOT EXISTS action_type TEXT,
        ADD COLUMN IF NOT EXISTS target_ref TEXT,
        ADD COLUMN IF NOT EXISTS rule_id TEXT,
        ADD COLUMN IF NOT EXISTS created_at_ms BIGINT,
        ADD COLUMN IF NOT EXISTS created_day INTEGER,
        ADD COLUMN IF NOT EXISTS created_time_slot TEXT,
        ADD COLUMN IF NOT EXISTS due_day INTEGER,
        ADD COLUMN IF NOT EXISTS due_time_slot TEXT,
        ADD COLUMN IF NOT EXISTS has_expected_action BOOLEAN,
        ADD COLUMN IF NOT EXISTS raw_constraints JSONB,
        ADD COLUMN IF NOT EXISTS raw_effects JSONB,
        ADD COLUMN IF NOT EXISTS ui_title TEXT,
        ADD COLUMN IF NOT EXISTS ui_description TEXT
        """,
        """
        ALTER TABLE canonical_actions
        ADD COLUMN IF NOT EXISTS mechanic_id TEXT,
        ADD COLUMN IF NOT EXISTS action_type TEXT,
        ADD COLUMN IF NOT EXISTS target_ref TEXT,
        ADD COLUMN IF NOT EXISTS target_type TEXT,
        ADD COLUMN IF NOT EXISTS target_id TEXT,
        ADD COLUMN IF NOT EXISTS target_label TEXT,
        ADD COLUMN IF NOT EXISTS day INTEGER,
        ADD COLUMN IF NOT EXISTS time_slot TEXT,
        ADD COLUMN IF NOT EXISTS committed_day INTEGER,
        ADD COLUMN IF NOT EXISTS committed_time_slot TEXT,
        ADD COLUMN IF NOT EXISTS source_node_id TEXT,
        ADD COLUMN IF NOT EXISTS source_option_id TEXT,
        ADD COLUMN IF NOT EXISTS summary TEXT,
        ADD COLUMN IF NOT EXISTS committed_at_ms BIGINT,
        ADD COLUMN IF NOT EXISTS raw_value_final JSONB,
        ADD COLUMN IF NOT EXISTS raw_context JSONB,
        ADD COLUMN IF NOT EXISTS value_final JSONB,
        ADD COLUMN IF NOT EXISTS context JSONB
        """,
        """
        ALTER TABLE mechanic_events
        ADD COLUMN IF NOT EXISTS timestamp_ms BIGINT,
        ADD COLUMN IF NOT EXISTS node_id TEXT,
        ADD COLUMN IF NOT EXISTS option_id TEXT,
        ADD COLUMN IF NOT EXISTS target_ref TEXT,
        ADD COLUMN IF NOT EXISTS raw_payload JSONB,
        ADD COLUMN IF NOT EXISTS timestamp BIGINT,
        ADD COLUMN IF NOT EXISTS payload JSONB
        """,
        """
        ALTER TABLE comparisons
        ADD COLUMN IF NOT EXISTS reason TEXT,
        ADD COLUMN IF NOT EXISTS resolved_day INTEGER,
        ADD COLUMN IF NOT EXISTS resolved_at_ms BIGINT,
        ADD COLUMN IF NOT EXISTS raw_deviation JSONB,
        ADD COLUMN IF NOT EXISTS deviation JSONB
        """,
    ]
    for statement in statements:
        conn.execute(statement)


def _seed_fk_placeholders(conn):
    conn.execute("INSERT INTO users (user_id) SELECT DISTINCT user_id FROM sessions WHERE user_id IS NOT NULL ON CONFLICT (user_id) DO NOTHING")
    conn.execute("INSERT INTO versions (version_id, created_at) SELECT DISTINCT version_id, now()::text FROM sessions WHERE version_id IS NOT NULL ON CONFLICT (version_id) DO NOTHING")
    conn.execute("INSERT INTO mechanics (mechanic_id) SELECT DISTINCT mechanic_id FROM expected_actions WHERE mechanic_id IS NOT NULL ON CONFLICT (mechanic_id) DO NOTHING")
    conn.execute("INSERT INTO mechanics (mechanic_id) SELECT DISTINCT mechanic_id FROM canonical_actions WHERE mechanic_id IS NOT NULL ON CONFLICT (mechanic_id) DO NOTHING")
    conn.execute("INSERT INTO mechanics (mechanic_id) SELECT DISTINCT mechanic_id FROM mechanic_events WHERE mechanic_id IS NOT NULL ON CONFLICT (mechanic_id) DO NOTHING")
    conn.execute("INSERT INTO stakeholders (stakeholder_id) SELECT DISTINCT npc_id FROM explicit_decisions WHERE npc_id IS NOT NULL ON CONFLICT (stakeholder_id) DO NOTHING")
    conn.execute("INSERT INTO stakeholders (stakeholder_id) SELECT DISTINCT npc_id FROM expected_actions WHERE npc_id IS NOT NULL ON CONFLICT (stakeholder_id) DO NOTHING")
    conn.execute("INSERT INTO stakeholders (stakeholder_id) SELECT DISTINCT npc_id FROM question_log WHERE npc_id IS NOT NULL ON CONFLICT (stakeholder_id) DO NOTHING")
    conn.execute("INSERT INTO stakeholders (stakeholder_id) SELECT DISTINCT npc_id FROM decision_nodes WHERE npc_id IS NOT NULL ON CONFLICT (stakeholder_id) DO NOTHING")
    conn.execute("INSERT INTO stakeholders (stakeholder_id) SELECT DISTINCT stakeholder_id FROM scenario_sequences WHERE stakeholder_id IS NOT NULL ON CONFLICT (stakeholder_id) DO NOTHING")
    conn.execute("INSERT INTO scenario_sequences (sequence_id) SELECT DISTINCT sequence_id FROM explicit_decisions WHERE sequence_id IS NOT NULL ON CONFLICT (sequence_id) DO NOTHING")
    conn.execute("INSERT INTO scenario_sequences (sequence_id) SELECT DISTINCT sequence_id FROM decision_nodes WHERE sequence_id IS NOT NULL ON CONFLICT (sequence_id) DO NOTHING")
    conn.execute("INSERT INTO decision_nodes (node_id) SELECT DISTINCT node_id FROM explicit_decisions WHERE node_id IS NOT NULL ON CONFLICT (node_id) DO NOTHING")
    conn.execute("INSERT INTO decision_nodes (node_id) SELECT DISTINCT source_node_id FROM expected_actions WHERE source_node_id IS NOT NULL ON CONFLICT (node_id) DO NOTHING")
    conn.execute("INSERT INTO decision_nodes (node_id) SELECT DISTINCT source_node_id FROM canonical_actions WHERE source_node_id IS NOT NULL ON CONFLICT (node_id) DO NOTHING")
    conn.execute("INSERT INTO decision_nodes (node_id) SELECT DISTINCT node_id FROM mechanic_events WHERE node_id IS NOT NULL ON CONFLICT (node_id) DO NOTHING")
    conn.execute(
        """
        INSERT INTO decision_options (node_id, option_id)
        SELECT DISTINCT node_id, option_id
        FROM explicit_decisions
        WHERE node_id IS NOT NULL AND option_id IS NOT NULL
        ON CONFLICT (node_id, option_id) DO NOTHING
        """
    )
    conn.execute(
        """
        UPDATE comparisons c
        SET expected_action_id = NULL
        WHERE expected_action_id IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM expected_actions ea
              WHERE ea.expected_action_id = c.expected_action_id
          )
        """
    )
    conn.execute(
        """
        UPDATE comparisons c
        SET canonical_action_id = NULL
        WHERE canonical_action_id IS NOT NULL
          AND NOT EXISTS (
              SELECT 1 FROM canonical_actions ca
              WHERE ca.canonical_action_id = c.canonical_action_id
          )
        """
    )
    conn.execute(
        """
        INSERT INTO decision_options (node_id, option_id)
        SELECT DISTINCT source_node_id, source_option_id
        FROM expected_actions
        WHERE source_node_id IS NOT NULL AND source_option_id IS NOT NULL
        ON CONFLICT (node_id, option_id) DO NOTHING
        """
    )
    conn.execute(
        """
        INSERT INTO decision_options (node_id, option_id)
        SELECT DISTINCT source_node_id, source_option_id
        FROM canonical_actions
        WHERE source_node_id IS NOT NULL AND source_option_id IS NOT NULL
        ON CONFLICT (node_id, option_id) DO NOTHING
        """
    )
    conn.execute(
        """
        INSERT INTO decision_options (node_id, option_id)
        SELECT DISTINCT node_id, option_id
        FROM mechanic_events
        WHERE node_id IS NOT NULL AND option_id IS NOT NULL
        ON CONFLICT (node_id, option_id) DO NOTHING
        """
    )


def _add_contract_constraints(conn):
    constraints = [
        ("sessions_user_id_fkey", "ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id)"),
        ("sessions_version_id_fkey", "ALTER TABLE sessions ADD CONSTRAINT sessions_version_id_fkey FOREIGN KEY (version_id) REFERENCES versions(version_id)"),
        ("mechanics_version_id_fkey", "ALTER TABLE mechanics ADD CONSTRAINT mechanics_version_id_fkey FOREIGN KEY (version_id) REFERENCES versions(version_id)"),
        ("scenario_sequences_version_id_fkey", "ALTER TABLE scenario_sequences ADD CONSTRAINT scenario_sequences_version_id_fkey FOREIGN KEY (version_id) REFERENCES versions(version_id)"),
        ("scenario_sequences_stakeholder_id_fkey", "ALTER TABLE scenario_sequences ADD CONSTRAINT scenario_sequences_stakeholder_id_fkey FOREIGN KEY (stakeholder_id) REFERENCES stakeholders(stakeholder_id)"),
        ("decision_nodes_sequence_id_fkey", "ALTER TABLE decision_nodes ADD CONSTRAINT decision_nodes_sequence_id_fkey FOREIGN KEY (sequence_id) REFERENCES scenario_sequences(sequence_id)"),
        ("decision_nodes_npc_id_fkey", "ALTER TABLE decision_nodes ADD CONSTRAINT decision_nodes_npc_id_fkey FOREIGN KEY (npc_id) REFERENCES stakeholders(stakeholder_id)"),
        ("explicit_decisions_session_id_fkey", "ALTER TABLE explicit_decisions ADD CONSTRAINT explicit_decisions_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE"),
        ("explicit_decisions_user_id_fkey", "ALTER TABLE explicit_decisions ADD CONSTRAINT explicit_decisions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id)"),
        ("explicit_decisions_sequence_id_fkey", "ALTER TABLE explicit_decisions ADD CONSTRAINT explicit_decisions_sequence_id_fkey FOREIGN KEY (sequence_id) REFERENCES scenario_sequences(sequence_id)"),
        ("explicit_decisions_npc_id_fkey", "ALTER TABLE explicit_decisions ADD CONSTRAINT explicit_decisions_npc_id_fkey FOREIGN KEY (npc_id) REFERENCES stakeholders(stakeholder_id)"),
        ("explicit_decisions_node_option_fkey", "ALTER TABLE explicit_decisions ADD CONSTRAINT explicit_decisions_node_option_fkey FOREIGN KEY (node_id, option_id) REFERENCES decision_options(node_id, option_id)"),
        ("expected_actions_session_id_fkey", "ALTER TABLE expected_actions ADD CONSTRAINT expected_actions_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE"),
        ("expected_actions_npc_id_fkey", "ALTER TABLE expected_actions ADD CONSTRAINT expected_actions_npc_id_fkey FOREIGN KEY (npc_id) REFERENCES stakeholders(stakeholder_id)"),
        ("expected_actions_mechanic_id_fkey", "ALTER TABLE expected_actions ADD CONSTRAINT expected_actions_mechanic_id_fkey FOREIGN KEY (mechanic_id) REFERENCES mechanics(mechanic_id)"),
        ("expected_actions_source_option_fkey", "ALTER TABLE expected_actions ADD CONSTRAINT expected_actions_source_option_fkey FOREIGN KEY (source_node_id, source_option_id) REFERENCES decision_options(node_id, option_id)"),
        ("canonical_actions_session_id_fkey", "ALTER TABLE canonical_actions ADD CONSTRAINT canonical_actions_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE"),
        ("canonical_actions_mechanic_id_fkey", "ALTER TABLE canonical_actions ADD CONSTRAINT canonical_actions_mechanic_id_fkey FOREIGN KEY (mechanic_id) REFERENCES mechanics(mechanic_id)"),
        ("canonical_actions_source_option_fkey", "ALTER TABLE canonical_actions ADD CONSTRAINT canonical_actions_source_option_fkey FOREIGN KEY (source_node_id, source_option_id) REFERENCES decision_options(node_id, option_id)"),
        ("mechanic_events_session_id_fkey", "ALTER TABLE mechanic_events ADD CONSTRAINT mechanic_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE"),
        ("mechanic_events_mechanic_id_fkey", "ALTER TABLE mechanic_events ADD CONSTRAINT mechanic_events_mechanic_id_fkey FOREIGN KEY (mechanic_id) REFERENCES mechanics(mechanic_id)"),
        ("mechanic_events_node_option_fkey", "ALTER TABLE mechanic_events ADD CONSTRAINT mechanic_events_node_option_fkey FOREIGN KEY (node_id, option_id) REFERENCES decision_options(node_id, option_id)"),
        ("comparisons_session_id_fkey", "ALTER TABLE comparisons ADD CONSTRAINT comparisons_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE"),
        ("comparisons_expected_action_id_fkey", "ALTER TABLE comparisons ADD CONSTRAINT comparisons_expected_action_id_fkey FOREIGN KEY (expected_action_id) REFERENCES expected_actions(expected_action_id) ON DELETE CASCADE"),
        ("comparisons_canonical_action_id_fkey", "ALTER TABLE comparisons ADD CONSTRAINT comparisons_canonical_action_id_fkey FOREIGN KEY (canonical_action_id) REFERENCES canonical_actions(canonical_action_id) ON DELETE SET NULL"),
        ("process_logs_session_id_fkey", "ALTER TABLE process_logs ADD CONSTRAINT process_logs_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE"),
        ("question_log_session_id_fkey", "ALTER TABLE question_log ADD CONSTRAINT question_log_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE"),
        ("question_log_npc_id_fkey", "ALTER TABLE question_log ADD CONSTRAINT question_log_npc_id_fkey FOREIGN KEY (npc_id) REFERENCES stakeholders(stakeholder_id)"),
        ("final_states_session_id_fkey", "ALTER TABLE final_states ADD CONSTRAINT final_states_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE"),
        ("final_states_user_id_fkey", "ALTER TABLE final_states ADD CONSTRAINT final_states_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id)"),
        ("final_states_version_id_fkey", "ALTER TABLE final_states ADD CONSTRAINT final_states_version_id_fkey FOREIGN KEY (version_id) REFERENCES versions(version_id)"),
        ("player_actions_log_session_id_fkey", "ALTER TABLE player_actions_log ADD CONSTRAINT player_actions_log_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE"),
        ("session_state_session_id_fkey", "ALTER TABLE session_state ADD CONSTRAINT session_state_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE"),
        ("session_stakeholders_session_id_fkey", "ALTER TABLE session_stakeholders ADD CONSTRAINT session_stakeholders_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE"),
        ("session_stakeholders_stakeholder_id_fkey", "ALTER TABLE session_stakeholders ADD CONSTRAINT session_stakeholders_stakeholder_id_fkey FOREIGN KEY (stakeholder_id) REFERENCES stakeholders(stakeholder_id)"),
    ]
    for constraint_name, ddl in constraints:
        conn.execute(_constraint_exists_block(constraint_name, ddl + ";"))


def _create_indexes(conn):
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_exp_decisions_session ON explicit_decisions(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_exp_decisions_node_option ON explicit_decisions(node_id, option_id)",
        "CREATE INDEX IF NOT EXISTS idx_expected_session ON expected_actions(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_expected_source_option ON expected_actions(source_node_id, source_option_id)",
        "CREATE INDEX IF NOT EXISTS idx_canonical_session ON canonical_actions(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_canonical_source_option ON canonical_actions(source_node_id, source_option_id)",
        "CREATE INDEX IF NOT EXISTS idx_events_session ON mechanic_events(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_events_node_option ON mechanic_events(node_id, option_id)",
        "CREATE INDEX IF NOT EXISTS idx_comparisons_session ON comparisons(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_process_session ON process_logs(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_player_session ON player_actions_log(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_question_log_session ON question_log(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_session_stakeholders_session ON session_stakeholders(session_id)",
        "CREATE INDEX IF NOT EXISTS idx_daily_effects_session_day ON daily_effects(session_id, day)",
    ]
    for statement in indexes:
        conn.execute(statement)


def create_schema(conn):
    _migrate_legacy_columns(conn)
    _create_core_tables(conn)
    _create_contract_tables(conn)
    _create_support_tables(conn)
    _add_missing_columns(conn)
    _migrate_json_columns(conn)
    _migrate_comparison_id_and_outcome(conn)
    _seed_fk_placeholders(conn)
    _add_contract_constraints(conn)
    _create_indexes(conn)
    conn.commit()
