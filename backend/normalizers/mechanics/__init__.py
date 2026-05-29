from . import delegation, documents, email, map, scheduler
from .utils import as_record


MECHANIC_MODULES = [
    map,
    email,
    documents,
    scheduler,
    delegation,
]

DETAIL_TABLE_NAMES = [module.TABLE_NAME for module in MECHANIC_MODULES]
EXPORT_HANDLERS = {module.HANDLER_KEY: module.upsert for module in MECHANIC_MODULES}


def create_mechanic_export_schema(conn):
    for module in MECHANIC_MODULES:
        conn.execute(module.CREATE_SQL)
        alter_sql = getattr(module, "ALTER_SQL", None)
        if alter_sql:
            conn.execute(alter_sql)
    for table_name in DETAIL_TABLE_NAMES:
        conn.execute(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_session ON {table_name}(session_id)")


def upsert_canonical_action_detail(conn, session_id: str, action: dict):
    canonical_action_id = action.get("canonical_action_id")
    if not canonical_action_id:
        return

    value_final = as_record(action.get("value_final"))
    payload = value_final.get("mechanic_payload")
    payload = payload if isinstance(payload, dict) else value_final
    handler = EXPORT_HANDLERS.get((action.get("mechanic_id"), action.get("action_type")))
    if not handler:
        return
    handler(conn, session_id, action, value_final, payload)
