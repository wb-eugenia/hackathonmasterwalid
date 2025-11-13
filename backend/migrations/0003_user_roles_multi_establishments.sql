-- Migration pour gestion multi-établissements et rôles
-- Exécutez avec: wrangler d1 migrations apply

-- Ajout colonnes utilisateur pour email confirmation et OAuth
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN verification_token TEXT;
ALTER TABLE users ADD COLUMN oauth_provider TEXT; -- 'google', 'facebook', etc.
ALTER TABLE users ADD COLUMN oauth_id TEXT;

-- Table de liaison utilisateur-établissement avec rôles
CREATE TABLE IF NOT EXISTS user_establishments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  establishment_id TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'collaborator')) DEFAULT 'collaborator',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
  UNIQUE(user_id, establishment_id)
);

-- Table de configuration des établissements
CREATE TABLE IF NOT EXISTS establishment_config (
  id TEXT PRIMARY KEY,
  establishment_id TEXT UNIQUE NOT NULL,
  opening_hours TEXT, -- JSON string avec horaires
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  menu_photo_url TEXT,
  notification_settings TEXT, -- JSON string avec paramètres
  onboarding_completed INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Table des tokens de vérification email
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_establishments_user ON user_establishments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_establishments_establishment ON user_establishments(establishment_id);
CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_tokens_token ON email_verification_tokens(token);

