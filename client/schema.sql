PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL,
  song_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, song_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS history (
  user_id TEXT NOT NULL,
  song_id TEXT NOT NULL,
  played_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, song_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_history_user_played
ON history (user_id, played_at DESC);

CREATE TABLE IF NOT EXISTS playlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_playlists_user
ON playlists (user_id, created_at);

CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id TEXT NOT NULL,
  song_id TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (playlist_id, song_id),
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO users (id, name)
VALUES ('usr_demo', 'Demo User');

INSERT OR IGNORE INTO favorites (user_id, song_id, created_at) VALUES
  ('usr_demo', 'trk_002', '2026-09-26T09:00:00Z'),
  ('usr_demo', 'trk_004', '2026-09-26T09:01:00Z');

INSERT OR IGNORE INTO history (user_id, song_id, played_at) VALUES
  ('usr_demo', 'trk_004', '2026-09-26T08:58:00Z'),
  ('usr_demo', 'trk_001', '2026-09-26T08:59:00Z'),
  ('usr_demo', 'trk_002', '2026-09-26T09:00:00Z');

INSERT OR IGNORE INTO playlists (id, user_id, name, created_at) VALUES
  ('pl_focus', 'usr_demo', 'Focus Flow', '2026-09-26T09:00:00Z'),
  ('pl_late', 'usr_demo', 'Late Night', '2026-09-26T09:10:00Z');

INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, position, added_at) VALUES
  ('pl_focus', 'trk_001', 0, '2026-09-26T09:00:00Z'),
  ('pl_focus', 'trk_003', 1, '2026-09-26T09:00:00Z'),
  ('pl_focus', 'trk_005', 2, '2026-09-26T09:00:00Z'),
  ('pl_late', 'trk_002', 0, '2026-09-26T09:10:00Z'),
  ('pl_late', 'trk_004', 1, '2026-09-26T09:10:00Z');
