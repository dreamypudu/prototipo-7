try:
    from .normalizers.mechanics import create_mechanic_export_schema
    from .normalizers import labels as labels_module
    from .normalizers import scenarios_catalog as scenarios_catalog_module
except ImportError:
    from normalizers.mechanics import create_mechanic_export_schema
    from normalizers import labels as labels_module
    from normalizers import scenarios_catalog as scenarios_catalog_module


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


def _migrate_v2_schema(conn):
    """Migra tablas existentes al nuevo shape v2.

    - users: solo user_id + created_at.
    - sessions: sin estado/navegador.
    - scenario_sequences: sin sequence_title/raw_sequence/stakeholder_id; con narrative_id, stakeholder_ids[], node_ids[].
    - decision_nodes: sin node_title/npc_*; con narrative_id + node_text.
    - explicit_decisions: cambia PK a (session_id, node_id, option_id) y dropea columnas obsoletas.

    Idempotente. Si la tabla no existe todavia, los ALTER no fallan gracias a IF EXISTS.
    """
    drop_constraints = [
        ("scenario_sequences", "scenario_sequences_stakeholder_id_fkey"),
        ("decision_nodes", "decision_nodes_npc_id_fkey"),
        ("explicit_decisions", "explicit_decisions_npc_id_fkey"),
        ("explicit_decisions", "explicit_decisions_node_option_fkey"),
        ("expected_actions", "expected_actions_source_option_fkey"),
        ("canonical_actions", "canonical_actions_source_option_fkey"),
        ("mechanic_events", "mechanic_events_node_option_fkey"),
    ]
    for table, constraint in drop_constraints:
        conn.execute(f"ALTER TABLE IF EXISTS {table} DROP CONSTRAINT IF EXISTS {constraint}")

    # users: solo user_id + created_at (drop demograficos no usados)
    for col in ("name", "tipo_usuario", "edad_usuario", "carrera_usuario"):
        conn.execute(f"ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS {col}")

    # sessions: drop estado/navegador
    for col in ("estado", "navegador"):
        conn.execute(f"ALTER TABLE IF EXISTS sessions DROP COLUMN IF EXISTS {col}")

    # scenario_sequences: drop columnas y FK obsoleta; el resto se crea por _create_core_tables/_add_missing_columns
    for col in ("stakeholder_id", "sequence_title", "raw_sequence"):
        conn.execute(f"ALTER TABLE IF EXISTS scenario_sequences DROP COLUMN IF EXISTS {col}")

    # decision_nodes: drop columnas viejas
    for col in ("node_title", "npc_id", "npc_role", "npc_name"):
        conn.execute(f"ALTER TABLE IF EXISTS decision_nodes DROP COLUMN IF EXISTS {col}")

    # explicit_decisions: cambia PK. Si la tabla existe con la PK vieja (decision_id),
    # la dropeamos por completo para que _create_contract_tables la recree.
    # Las sesiones se re-normalizan al pegar el payload (DELETE + INSERT en cada POST).
    conn.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'explicit_decisions'
                  AND column_name = 'decision_id'
            ) THEN
                DROP TABLE explicit_decisions CASCADE;
            END IF;
        END$$;
        """
    )


def _migrate_legacy_columns(conn):
    for table_name in [
        "cases",
        "daily_effects",
        "player_actions_log",
        "session_state",
        "session_stakeholders",
        "reports",
    ]:
        conn.execute(f"DROP TABLE IF EXISTS {table_name} CASCADE")
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
        ("canonical_actions", "value_final"),
        ("canonical_actions", "context"),
        ("mechanic_events", "raw_payload"),
        ("mechanic_events", "payload"),
        ("comparisons", "raw_deviation"),
        ("comparisons", "deviation"),
        ("process_logs", "raw_metadata"),
        ("process_logs", "events"),
        ("final_states", "raw_final_state"),
        ("scheduler_action_details", "week_schedule"),
        ("scheduler_action_details", "conflicts"),
        ("scheduler_action_details", "load_summary"),
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
            created_at TEXT
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
        CREATE TABLE IF NOT EXISTS narratives (
            narrative_id TEXT PRIMARY KEY,
            label TEXT
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
            narrative_id TEXT REFERENCES narratives(narrative_id),
            version_id TEXT REFERENCES versions(version_id),
            stakeholder_ids TEXT[] NOT NULL DEFAULT '{}',
            node_ids TEXT[] NOT NULL DEFAULT '{}'
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS decision_nodes (
            node_id TEXT PRIMARY KEY,
            sequence_id TEXT REFERENCES scenario_sequences(sequence_id),
            narrative_id TEXT REFERENCES narratives(narrative_id),
            node_text TEXT,
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
            payload JSONB NOT NULL
        )
        """
    )


def _create_contract_tables(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS explicit_decisions (
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            user_id TEXT REFERENCES users(user_id),
            decision_order INTEGER,
            sequence_id TEXT REFERENCES scenario_sequences(sequence_id),
            node_id TEXT,
            day INTEGER,
            time_slot TEXT,
            option_id TEXT,
            option_text TEXT,
            is_decision BOOLEAN,
            trust_delta DOUBLE PRECISION,
            support_delta DOUBLE PRECISION,
            reputation_delta DOUBLE PRECISION,
            dialogue_response TEXT,
            raw_consequences JSONB,
            PRIMARY KEY (session_id, node_id, option_id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS expected_actions (
            expected_action_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            user_id TEXT REFERENCES users(user_id),
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
            user_id TEXT REFERENCES users(user_id),
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
            user_id TEXT REFERENCES users(user_id),
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
            user_id TEXT REFERENCES users(user_id),
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
            user_id TEXT REFERENCES users(user_id),
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
    # Resumen por opcion (una fila por sesion-nodo-opcion): cuantas veces se paso el
    # mouse por encima de cada alternativa y el tiempo total acumulado sobre ella.
    # Deriva de los mismos eventos de process_logs, pero ya agregado y sin duplicar.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS option_process_stats (
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            user_id TEXT REFERENCES users(user_id),
            node_id TEXT NOT NULL,
            option_id TEXT NOT NULL,
            hover_count INTEGER NOT NULL DEFAULT 0,
            hover_total_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
            is_selected BOOLEAN NOT NULL DEFAULT FALSE,
            PRIMARY KEY (session_id, node_id, option_id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS question_log (
            question_log_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
            user_id TEXT REFERENCES users(user_id),
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
            player_notes TEXT,
            raw_final_state JSONB
        )
        """
    )


def _create_support_tables(conn):
    return


def _add_missing_columns(conn):
    statements = [
        """
        ALTER TABLE final_states
        ADD COLUMN IF NOT EXISTS player_notes TEXT
        """,
        # Denormalizacion de user_id en todas las tablas de detalle, para poder
        # filtrar por usuario sin JOIN a sessions. Se rellena en el normalizer.
        """
        ALTER TABLE expected_actions ADD COLUMN IF NOT EXISTS user_id TEXT
        """,
        """
        ALTER TABLE canonical_actions ADD COLUMN IF NOT EXISTS user_id TEXT
        """,
        """
        ALTER TABLE mechanic_events ADD COLUMN IF NOT EXISTS user_id TEXT
        """,
        """
        ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS user_id TEXT
        """,
        """
        ALTER TABLE process_logs ADD COLUMN IF NOT EXISTS user_id TEXT
        """,
        """
        ALTER TABLE option_process_stats ADD COLUMN IF NOT EXISTS user_id TEXT
        """,
        """
        ALTER TABLE question_log ADD COLUMN IF NOT EXISTS user_id TEXT
        """,
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS created_at TEXT
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
        ADD COLUMN IF NOT EXISTS payload JSONB
        """,
        """
        ALTER TABLE scenario_sequences
        ADD COLUMN IF NOT EXISTS narrative_id TEXT,
        ADD COLUMN IF NOT EXISTS version_id TEXT,
        ADD COLUMN IF NOT EXISTS stakeholder_ids TEXT[] NOT NULL DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS node_ids TEXT[] NOT NULL DEFAULT '{}'
        """,
        """
        ALTER TABLE decision_nodes
        ADD COLUMN IF NOT EXISTS sequence_id TEXT,
        ADD COLUMN IF NOT EXISTS narrative_id TEXT,
        ADD COLUMN IF NOT EXISTS node_text TEXT,
        ADD COLUMN IF NOT EXISTS day INTEGER,
        ADD COLUMN IF NOT EXISTS time_slot TEXT,
        ADD COLUMN IF NOT EXISTS raw_node JSONB
        """,
        """
        ALTER TABLE explicit_decisions
        ADD COLUMN IF NOT EXISTS user_id TEXT,
        ADD COLUMN IF NOT EXISTS decision_order INTEGER,
        ADD COLUMN IF NOT EXISTS sequence_id TEXT,
        ADD COLUMN IF NOT EXISTS node_id TEXT,
        ADD COLUMN IF NOT EXISTS day INTEGER,
        ADD COLUMN IF NOT EXISTS time_slot TEXT,
        ADD COLUMN IF NOT EXISTS option_id TEXT,
        ADD COLUMN IF NOT EXISTS option_text TEXT,
        ADD COLUMN IF NOT EXISTS is_decision BOOLEAN,
        ADD COLUMN IF NOT EXISTS trust_delta DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS support_delta DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS reputation_delta DOUBLE PRECISION,
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
        """
        ALTER TABLE process_logs
        ADD COLUMN IF NOT EXISTS node_id TEXT,
        ADD COLUMN IF NOT EXISTS option_id TEXT,
        ADD COLUMN IF NOT EXISTS event_type TEXT,
        ADD COLUMN IF NOT EXISTS timestamp_ms DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS elapsed_from_node_start_ms DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS node_total_duration_ms DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS option_hover_total_ms DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS option_hover_count INTEGER,
        ADD COLUMN IF NOT EXISTS first_hover_option_id TEXT,
        ADD COLUMN IF NOT EXISTS last_hover_option_id TEXT,
        ADD COLUMN IF NOT EXISTS selected_option_hover_ms DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS selected_option_was_most_hovered BOOLEAN,
        ADD COLUMN IF NOT EXISTS hover_switch_count INTEGER,
        ADD COLUMN IF NOT EXISTS raw_metadata JSONB,
        ADD COLUMN IF NOT EXISTS start_time DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS end_time DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS total_duration DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS final_choice TEXT,
        ADD COLUMN IF NOT EXISTS events JSONB
        """,
        """
        ALTER TABLE question_log
        ADD COLUMN IF NOT EXISTS npc_id TEXT,
        ADD COLUMN IF NOT EXISTS question_id TEXT,
        ADD COLUMN IF NOT EXISTS was_locked BOOLEAN,
        ADD COLUMN IF NOT EXISTS trust_at_ask DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS support_at_ask DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS reputation_at_ask DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS timestamp_ms BIGINT,
        ADD COLUMN IF NOT EXISTS day INTEGER,
        ADD COLUMN IF NOT EXISTS time_slot TEXT
        """,
        """
        ALTER TABLE final_states
        ADD COLUMN IF NOT EXISTS user_id TEXT,
        ADD COLUMN IF NOT EXISTS version_id TEXT,
        ADD COLUMN IF NOT EXISTS final_day INTEGER,
        ADD COLUMN IF NOT EXISTS final_budget DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS final_reputation DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS final_project_progress DOUBLE PRECISION,
        ADD COLUMN IF NOT EXISTS completed_sequences_count INTEGER,
        ADD COLUMN IF NOT EXISTS completed_scenarios_count INTEGER,
        ADD COLUMN IF NOT EXISTS raw_final_state JSONB
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
    # Stakeholders se siembran desde tablas que aun referencian npc_id; el catalogo de narrativa los carga al boot.
    conn.execute("INSERT INTO stakeholders (stakeholder_id) SELECT DISTINCT npc_id FROM expected_actions WHERE npc_id IS NOT NULL ON CONFLICT (stakeholder_id) DO NOTHING")
    conn.execute("INSERT INTO stakeholders (stakeholder_id) SELECT DISTINCT npc_id FROM question_log WHERE npc_id IS NOT NULL ON CONFLICT (stakeholder_id) DO NOTHING")
    # Secuencias y nodos referenciados por sesiones (stub si el catalogo aun no los cargo).
    conn.execute("INSERT INTO scenario_sequences (sequence_id) SELECT DISTINCT sequence_id FROM explicit_decisions WHERE sequence_id IS NOT NULL ON CONFLICT (sequence_id) DO NOTHING")
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
        ("scenario_sequences_narrative_id_fkey", "ALTER TABLE scenario_sequences ADD CONSTRAINT scenario_sequences_narrative_id_fkey FOREIGN KEY (narrative_id) REFERENCES narratives(narrative_id)"),
        ("decision_nodes_sequence_id_fkey", "ALTER TABLE decision_nodes ADD CONSTRAINT decision_nodes_sequence_id_fkey FOREIGN KEY (sequence_id) REFERENCES scenario_sequences(sequence_id)"),
        ("decision_nodes_narrative_id_fkey", "ALTER TABLE decision_nodes ADD CONSTRAINT decision_nodes_narrative_id_fkey FOREIGN KEY (narrative_id) REFERENCES narratives(narrative_id)"),
        ("explicit_decisions_session_id_fkey", "ALTER TABLE explicit_decisions ADD CONSTRAINT explicit_decisions_session_id_fkey FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE"),
        ("explicit_decisions_user_id_fkey", "ALTER TABLE explicit_decisions ADD CONSTRAINT explicit_decisions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id)"),
        ("explicit_decisions_sequence_id_fkey", "ALTER TABLE explicit_decisions ADD CONSTRAINT explicit_decisions_sequence_id_fkey FOREIGN KEY (sequence_id) REFERENCES scenario_sequences(sequence_id)"),
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
        "CREATE INDEX IF NOT EXISTS idx_question_log_session ON question_log(session_id)",
        # Indices por user_id (denormalizado) para filtrar/extraer por usuario.
        "CREATE INDEX IF NOT EXISTS idx_exp_decisions_user ON explicit_decisions(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_expected_user ON expected_actions(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_canonical_user ON canonical_actions(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_events_user ON mechanic_events(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_comparisons_user ON comparisons(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_process_user ON process_logs(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_option_stats_user ON option_process_stats(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_question_log_user ON question_log(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_final_states_user ON final_states(user_id)",
    ]
    for statement in indexes:
        conn.execute(statement)


def _create_labels_tables(conn):
    # Migracion idempotente y robusta: comparamos la PK ACTUAL de mlq_labels con
    # la que esperamos (session_id, sequence_id, node_id, option_id). Si no
    # coincide --o si la tabla quedo en un estado mixto entre shapes viejos
    # (module_id, variable) y el wide-format actual-- dropeamos y dejamos que
    # la siguiente CREATE TABLE la genere desde cero.
    conn.execute(
        """
        DO $$
        DECLARE
            expected_pk TEXT := 'session_id,sequence_id,node_id,option_id';
            current_pk TEXT;
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'mlq_labels'
            ) THEN
                SELECT string_agg(a.attname, ',' ORDER BY array_position(con.conkey, a.attnum))
                INTO current_pk
                FROM pg_constraint con
                JOIN pg_class rel ON rel.oid = con.conrelid
                JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
                JOIN pg_attribute a ON a.attrelid = rel.oid AND a.attnum = ANY(con.conkey)
                WHERE rel.relname = 'mlq_labels'
                  AND nsp.nspname = 'public'
                  AND con.contype = 'p';

                IF current_pk IS DISTINCT FROM expected_pk THEN
                    DROP TABLE mlq_labels CASCADE;
                END IF;
            END IF;
        END$$;
        """
    )
    conn.execute(labels_module.CREATE_SQL)
    conn.execute(labels_module.ALTER_SQL)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_mlq_labels_user ON mlq_labels(user_id)")
    conn.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'mlq_labels_session_id_fkey'
            ) THEN
                ALTER TABLE mlq_labels
                ADD CONSTRAINT mlq_labels_session_id_fkey
                FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE;
            END IF;
        END$$;
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_mlq_labels_session ON mlq_labels(session_id)")


def create_schema(conn):
    _migrate_legacy_columns(conn)
    _migrate_v2_schema(conn)
    _create_core_tables(conn)
    _create_contract_tables(conn)
    _create_support_tables(conn)
    _add_missing_columns(conn)
    _migrate_json_columns(conn)
    _migrate_comparison_id_and_outcome(conn)
    _seed_fk_placeholders(conn)
    _add_contract_constraints(conn)
    _create_indexes(conn)
    _create_labels_tables(conn)
    # Catalogo estatico de narrativa: narratives, scenario_sequences, decision_nodes,
    # decision_options y stakeholders citados en el contenido. Idempotente.
    scenarios_catalog_module.populate(conn)
    conn.commit()
