import psycopg2
import psycopg2.extras
from app.core.config import settings

_conn = None


def get_connection():
    """Return a shared psycopg2 connection (lazy-init)."""
    global _conn
    if _conn is None or _conn.closed:
        _conn = psycopg2.connect(
            settings.database_url,
            cursor_factory=psycopg2.extras.RealDictCursor,
        )
    return _conn
