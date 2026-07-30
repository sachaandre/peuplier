CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'moderator' CHECK(role IN ('admin', 'moderator')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE form_fields (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK(field_type IN (
    'text', 'textarea', 'number', 'email', 'tel', 'date', 'radio', 'checkbox', 'city'
  )),
  required INTEGER NOT NULL DEFAULT 0,
  private INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  options TEXT,
  osuny_block_mapping TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO form_fields (id, label, field_type, required, private, position)
VALUES ('testimony', 'Votre témoignage', 'textarea', 1, 0, 0);

CREATE TABLE testimonies (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'draft' CHECK(state IN ('draft', 'published', 'archived')),
  published_on_osuny INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);