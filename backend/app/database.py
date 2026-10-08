import sqlite3
from collections.abc import Generator

from app.config import settings
from app.utils.security import hash_password


def get_connection() -> sqlite3.Connection:
    """Create and return a configured SQLite connection."""
    conn = sqlite3.connect(settings.db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def get_db() -> Generator[sqlite3.Connection, None, None]:
    """FastAPI dependency yielding a database connection per request."""
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    """Initialize the SQLite database schema and seed the admin user."""
    schema = """
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT,
        is_admin BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Medias table (movies & series from TMDB)
    CREATE TABLE IF NOT EXISTS medias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tmdb_id INTEGER NOT NULL UNIQUE,
        media_type TEXT NOT NULL CHECK(media_type IN ('movie', 'tv')),
        title TEXT NOT NULL,
        original_title TEXT,
        poster_path TEXT,
        overview TEXT,
        release_date DATE,
        season_number INTEGER DEFAULT NULL,
        episode_number INTEGER DEFAULT NULL,
        next_air_date DATE DEFAULT NULL,
        status TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'released', 'available')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Requests table (linking users with requested medias / seasons)
    CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        media_id INTEGER NOT NULL,
        season_number INTEGER DEFAULT NULL,
        episode_number INTEGER DEFAULT NULL,
        status TEXT DEFAULT 'pending'
            CHECK(status IN ('pending', 'notified', 'available', 'completed')),
        notified_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (media_id) REFERENCES medias(id) ON DELETE CASCADE,
        UNIQUE(user_id, media_id, season_number)
    );

    -- Trackers table (torrent availability checks)
    CREATE TABLE IF NOT EXISTS trackers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        media_id INTEGER NOT NULL,
        tracker_name TEXT NOT NULL,
        torrent_id TEXT,
        torrent_url TEXT,
        quality TEXT,
        is_available BOOLEAN DEFAULT 0,
        last_checked_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (media_id) REFERENCES medias(id) ON DELETE CASCADE
    );
    """
    conn = get_connection()
    try:
        table_exists = conn.execute(
            "SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'users'"
        ).fetchone()
        if not table_exists:
            conn.executescript(schema)

        # Seed admin user if not existing
        if settings.ADMIN_USERNAME and settings.ADMIN_PASSWORD:
            hashed = hash_password(settings.ADMIN_PASSWORD)
            conn.execute(
                """
                INSERT OR IGNORE INTO users (username, email, password_hash, is_admin)
                VALUES (?, ?, ?, 1)
                """,
                (settings.ADMIN_USERNAME, settings.ADMIN_MAIL, hashed),
            )
            conn.commit()
    finally:
        conn.close()
