-- Élargit les états autorisés et ajoute la traçabilité des transitions.

-- 1. Reconstruction de testimonies avec les deux nouveaux états.
CREATE TABLE testimonies_new (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'draft' CHECK(state IN (
    'draft', 'to_review', 'to_delete', 'published', 'archived'
  )),
  published_on_osuny INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO testimonies_new (id, data, state, published_on_osuny, created_at)
SELECT id, data, state, published_on_osuny, created_at FROM testimonies;

DROP TABLE testimonies;
ALTER TABLE testimonies_new RENAME TO testimonies;

-- 2. Journal des transitions d'état (qui, quand, motif).
CREATE TABLE testimony_events (
  id TEXT PRIMARY KEY,
  testimony_id TEXT NOT NULL REFERENCES testimonies(id) ON DELETE CASCADE,
  from_state TEXT,
  to_state TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_testimony_events_testimony ON testimony_events(testimony_id);