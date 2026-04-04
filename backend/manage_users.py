import argparse
from getpass import getpass
from pathlib import Path
import sys
from uuid import uuid4

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.auth.service import hash_password, log_auth_event, utcnow_iso
from backend.db import create_schema, get_conn


def _resolve_password(value: str | None) -> str:
    if value:
        return value
    password = getpass("Password: ").strip()
    if not password:
        raise SystemExit("Password is required.")
    return password


def create_user(username: str, password: str, display_name: str | None = None) -> None:
    normalized = username.strip().lower()
    if not normalized:
        raise SystemExit("Username is required.")

    with get_conn() as conn:
        create_schema(conn)
        existing = conn.execute(
            "SELECT user_id FROM auth_users WHERE username = %s",
            (normalized,),
        ).fetchone()
        if existing:
            raise SystemExit(f"User '{normalized}' already exists.")

        user_id = str(uuid4())
        now = utcnow_iso()
        conn.execute(
            """
            INSERT INTO auth_users (user_id, username, password_hash, display_name, is_active, created_at, updated_at)
            VALUES (%s, %s, %s, %s, TRUE, %s, %s)
            """,
            (user_id, normalized, hash_password(password), display_name, now, now),
        )
        log_auth_event(
            conn,
            "user_created",
            user_id=user_id,
            username=normalized,
            success=True,
            metadata={"display_name": display_name},
        )
        conn.commit()
    print(f"Created user '{normalized}' ({user_id}).")


def set_password(username: str, password: str) -> None:
    normalized = username.strip().lower()
    with get_conn() as conn:
        create_schema(conn)
        user = conn.execute(
            "SELECT user_id, username FROM auth_users WHERE username = %s",
            (normalized,),
        ).fetchone()
        if not user:
            raise SystemExit(f"User '{normalized}' not found.")

        conn.execute(
            """
            UPDATE auth_users
            SET password_hash = %s, updated_at = %s
            WHERE username = %s
            """,
            (hash_password(password), utcnow_iso(), normalized),
        )
        log_auth_event(
            conn,
            "password_changed",
            user_id=user["user_id"],
            username=user["username"],
            success=True,
        )
        conn.commit()
    print(f"Password updated for '{normalized}'.")


def set_active(username: str, is_active: bool) -> None:
    normalized = username.strip().lower()
    with get_conn() as conn:
        create_schema(conn)
        user = conn.execute(
            "SELECT user_id, username, is_active FROM auth_users WHERE username = %s",
            (normalized,),
        ).fetchone()
        if not user:
            raise SystemExit(f"User '{normalized}' not found.")

        conn.execute(
            "UPDATE auth_users SET is_active = %s, updated_at = %s WHERE username = %s",
            (is_active, utcnow_iso(), normalized),
        )
        log_auth_event(
            conn,
            "user_activated" if is_active else "user_deactivated",
            user_id=user["user_id"],
            username=user["username"],
            success=True,
        )
        conn.commit()
    print(f"User '{normalized}' is now {'active' if is_active else 'inactive'}.")


def list_users() -> None:
    with get_conn() as conn:
        create_schema(conn)
        rows = conn.execute(
            """
            SELECT username, display_name, is_active, created_at, updated_at
            FROM auth_users
            ORDER BY username
            """
        ).fetchall()
    if not rows:
        print("No auth users found.")
        return
    for row in rows:
        status = "active" if row["is_active"] else "inactive"
        display_name = row["display_name"] or "-"
        print(f"{row['username']} | {status} | {display_name} | created {row['created_at']}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Manage simulator auth users.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    create_parser = subparsers.add_parser("create-user")
    create_parser.add_argument("--username", required=True)
    create_parser.add_argument("--password")
    create_parser.add_argument("--display-name")

    password_parser = subparsers.add_parser("set-password")
    password_parser.add_argument("--username", required=True)
    password_parser.add_argument("--password")

    activate_parser = subparsers.add_parser("activate-user")
    activate_parser.add_argument("--username", required=True)

    deactivate_parser = subparsers.add_parser("deactivate-user")
    deactivate_parser.add_argument("--username", required=True)

    subparsers.add_parser("list-users")

    args = parser.parse_args()

    if args.command == "create-user":
        create_user(args.username, _resolve_password(args.password), args.display_name)
    elif args.command == "set-password":
        set_password(args.username, _resolve_password(args.password))
    elif args.command == "activate-user":
        set_active(args.username, True)
    elif args.command == "deactivate-user":
        set_active(args.username, False)
    elif args.command == "list-users":
        list_users()


if __name__ == "__main__":
    main()
