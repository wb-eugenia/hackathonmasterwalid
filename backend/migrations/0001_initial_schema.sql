-- Migration initiale pour Cloudflare D1
-- Exécutez avec: wrangler d1 migrations apply

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Table des établissements
CREATE TABLE IF NOT EXISTS establishments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  google_place_id TEXT UNIQUE,
  address TEXT,
  department TEXT,
  menu_photo_url TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des avis
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  establishment_id TEXT NOT NULL,
  google_review_id TEXT UNIQUE,
  text TEXT NOT NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  date TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  category TEXT,
  scraped_at INTEGER NOT NULL,
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Table des réponses générées
CREATE TABLE IF NOT EXISTS review_responses (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL,
  response_text TEXT NOT NULL,
  generated_by TEXT NOT NULL,
  sent_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Table des données financières
CREATE TABLE IF NOT EXISTS financial_data (
  id TEXT PRIMARY KEY,
  establishment_id TEXT NOT NULL,
  date TEXT NOT NULL,
  revenue REAL,
  costs REAL,
  profit REAL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Table des plats/menus
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  establishment_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL,
  category TEXT,
  description TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reviews_establishment ON reviews(establishment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(date);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_establishments_user ON establishments(user_id);
CREATE INDEX IF NOT EXISTS idx_establishments_place_id ON establishments(google_place_id);

