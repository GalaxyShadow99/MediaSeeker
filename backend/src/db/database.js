const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const {hashPassword} = require('../utils/encryption');
// Database filename from environment variables or fallback
const dbName = process.env.DB_NAME || 'mediaseeker.db';


// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dataDir, dbName);

// Connect to SQLite database
const db = new Database(dbPath);

// Enable WAL mode & foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initDb() {
  const schema = `
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
    -- required fields: tmdb_id, media_type, title
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
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'notified', 'available', 'completed')),
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
  `;
  db.exec(schema);
  db.prepare('INSERT OR IGNORE INTO users (username, email, password_hash, is_admin) VALUES (?, ?, ?, 1)').run(
    process.env.ADMIN_USERNAME,
    process.env.ADMIN_MAIL,
    hashPassword(process.env.ADMIN_PASSWORD)
  );

};

module.exports = { db, initDb };
