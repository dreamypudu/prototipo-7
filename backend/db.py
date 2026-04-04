import psycopg
from psycopg.rows import dict_row

from backend.config import DATABASE_URL


def get_conn():
    conn = psycopg.connect(DATABASE_URL)
    conn.row_factory = dict_row
    return conn


def create_schema(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            name TEXT
        )
        """
    )
    conn.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS tipo_usuario TEXT,
        ADD COLUMN IF NOT EXISTS edad_usuario INTEGER,
        ADD COLUMN IF NOT EXISTS carrera_usuario TEXT
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS auth_users (
            user_id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            display_name TEXT,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS auth_audit_log (
            audit_id BIGSERIAL PRIMARY KEY,
            user_id TEXT,
            username TEXT,
            event_type TEXT NOT NULL,
            success BOOLEAN NOT NULL DEFAULT TRUE,
            metadata TEXT,
            created_at TEXT NOT NULL
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
            version_id TEXT,
            FOREIGN KEY (version_id) REFERENCES versions(version_id)
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
        CREATE TABLE IF NOT EXISTS objectives (
            objetivo_id TEXT PRIMARY KEY,
            stakeholder_id TEXT NOT NULL,
            texto_objetivo TEXT,
            atributo_interno_min JSONB,
            atributo_global_min JSONB,
            acciones_requeridas JSONB,
            FOREIGN KEY (stakeholder_id) REFERENCES stakeholders(stakeholder_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS questions (
            pregunta_id TEXT PRIMARY KEY,
            stakeholder_id TEXT NOT NULL,
            texto_pregunta TEXT,
            texto_respuesta TEXT,
            atributo_global_min JSONB,
            acciones_requeridas JSONB,
            FOREIGN KEY (stakeholder_id) REFERENCES stakeholders(stakeholder_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS question_requirements (
            requisito_pregunta_id BIGSERIAL PRIMARY KEY,
            pregunta_id TEXT NOT NULL,
            trust_min INTEGER,
            support_min INTEGER,
            reputation_min INTEGER,
            FOREIGN KEY (pregunta_id) REFERENCES questions(pregunta_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            user_id TEXT,
            version_id TEXT,
            start_time TEXT,
            end_time TEXT,
            created_at TEXT NOT NULL,
            payload TEXT NOT NULL,
            estado TEXT,
            navegador TEXT,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (version_id) REFERENCES versions(version_id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS scenarios (
            escenario_id TEXT PRIMARY KEY,
            version_id TEXT,
            stakeholder_id TEXT,
            etapa INTEGER,
            titulo TEXT,
            FOREIGN KEY (version_id) REFERENCES versions(version_id),
            FOREIGN KEY (stakeholder_id) REFERENCES stakeholders(stakeholder_id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS decision_nodes (
            nodo_id TEXT PRIMARY KEY,
            escenario_id TEXT,
            tipo_decision TEXT,
            texto TEXT,
            FOREIGN KEY (escenario_id) REFERENCES scenarios(escenario_id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS explicit_decisions (
            decision_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL,
            node_id TEXT,
            option_id TEXT,
            option_text TEXT,
            stakeholder TEXT,
            day INTEGER,
            time_slot TEXT,
            consequences TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS bridge_responses (
            respuesta_puente_id BIGSERIAL PRIMARY KEY,
            decision_id BIGINT,
            respuesta_atributo_alto TEXT,
            respuesta_atributo_medio TEXT,
            respuesta_atributo_bajo TEXT,
            FOREIGN KEY (decision_id) REFERENCES explicit_decisions(decision_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS expected_actions (
            expected_action_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            source_node_id TEXT,
            source_option_id TEXT,
            action_type TEXT,
            target_ref TEXT,
            constraints TEXT,
            rule_id TEXT,
            created_at BIGINT,
            mechanic_id TEXT,
            effects TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        ALTER TABLE expected_actions
        ADD COLUMN IF NOT EXISTS effects TEXT
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS canonical_actions (
            canonical_action_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            mechanic_id TEXT,
            action_type TEXT,
            target_ref TEXT,
            value_final TEXT,
            committed_at BIGINT,
            context TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS mechanic_events (
            event_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            mechanic_id TEXT,
            event_type TEXT,
            timestamp BIGINT,
            payload TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS comparisons (
            comparison_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL,
            expected_action_id TEXT,
            canonical_action_id TEXT,
            outcome TEXT,
            deviation TEXT,
            rule_id TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        ALTER TABLE comparisons
        ADD COLUMN IF NOT EXISTS rule_id TEXT
        """
    )
    # Drop legacy FKs, clean orphans, then add FK with ON DELETE SET NULL (so Supabase shows relationships)
    conn.execute("ALTER TABLE comparisons DROP CONSTRAINT IF EXISTS comparisons_expected_action_id_fkey CASCADE")
    conn.execute("ALTER TABLE comparisons DROP CONSTRAINT IF EXISTS comparisons_canonical_action_id_fkey CASCADE")
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
    # Recreate FKs with ON DELETE SET NULL (guarded to avoid duplicate creation)
    conn.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'comparisons_expected_action_id_fkey'
            ) THEN
                ALTER TABLE comparisons
                ADD CONSTRAINT comparisons_expected_action_id_fkey
                FOREIGN KEY (expected_action_id)
                REFERENCES expected_actions(expected_action_id)
                ON DELETE SET NULL;
            END IF;
        END$$;
        """
    )
    conn.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'comparisons_canonical_action_id_fkey'
            ) THEN
                ALTER TABLE comparisons
                ADD CONSTRAINT comparisons_canonical_action_id_fkey
                FOREIGN KEY (canonical_action_id)
                REFERENCES canonical_actions(canonical_action_id)
                ON DELETE SET NULL;
            END IF;
        END$$;
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS daily_effects (
            effect_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL,
            day INTEGER NOT NULL,
            comparisons TEXT,
            global_deltas TEXT,
            stakeholder_deltas TEXT,
            created_at TEXT NOT NULL,
            status TEXT,
            applied_at TEXT,
            UNIQUE (session_id, day),
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        ALTER TABLE daily_effects
        ADD COLUMN IF NOT EXISTS status TEXT,
        ADD COLUMN IF NOT EXISTS applied_at TEXT
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS process_logs (
            process_log_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL,
            node_id TEXT,
            start_time DOUBLE PRECISION,
            end_time DOUBLE PRECISION,
            total_duration DOUBLE PRECISION,
            final_choice TEXT,
            events TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS player_actions_log (
            player_action_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL,
            event TEXT,
            metadata TEXT,
            day INTEGER,
            time_slot TEXT,
            timestamp DOUBLE PRECISION,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS session_state (
            session_id TEXT PRIMARY KEY,
            stakeholders TEXT,
            global_state TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS session_stakeholders (
            session_id TEXT NOT NULL,
            stakeholder_id TEXT NOT NULL,
            state TEXT,
            PRIMARY KEY (session_id, stakeholder_id),
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
            FOREIGN KEY (stakeholder_id) REFERENCES stakeholders(stakeholder_id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS reports (
            report_id BIGSERIAL PRIMARY KEY,
            session_id TEXT NOT NULL,
            payload TEXT,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_exp_decisions_session ON explicit_decisions(session_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_expected_session ON expected_actions(session_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_canonical_session ON canonical_actions(session_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_events_session ON mechanic_events(session_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_comparisons_session ON comparisons(session_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_process_session ON process_logs(session_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_player_session ON player_actions_log(session_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_session_stakeholders_session ON session_stakeholders(session_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_questions_stakeholder ON questions(stakeholder_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_objectives_stakeholder ON objectives(stakeholder_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_decision_nodes_escenario ON decision_nodes(escenario_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_scenarios_version ON scenarios(version_id)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_daily_effects_session_day ON daily_effects(session_id, day)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_auth_users_username ON auth_users(username)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_auth_audit_created_at ON auth_audit_log(created_at)")
    conn.commit()


def init_db():
    with get_conn() as conn:
        create_schema(conn)
