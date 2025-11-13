-- Migration pour le système de fidélité
-- Exécutez avec: wrangler d1 migrations apply

-- Table des clients
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  establishment_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Table des cartes fidélité
CREATE TABLE IF NOT EXISTS loyalty_cards (
  id TEXT PRIMARY KEY,
  establishment_id TEXT NOT NULL,
  customer_id TEXT,
  card_number TEXT UNIQUE NOT NULL,
  card_code TEXT, -- Code QR/barcode ou autre identifiant
  card_type TEXT CHECK (card_type IN ('physical', 'virtual', 'qr', 'barcode')) DEFAULT 'physical',
  photo_url TEXT, -- Photo de la carte physique scannée
  status TEXT CHECK (status IN ('active', 'inactive', 'expired', 'blocked')) DEFAULT 'active',
  points_balance INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  total_points_spent INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER, -- Date d'expiration optionnelle
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Table des transactions de points
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id TEXT PRIMARY KEY,
  loyalty_card_id TEXT NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('earn', 'spend', 'adjust', 'expire')) NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  reference TEXT, -- Référence à une commande, promotion, etc.
  created_by TEXT, -- ID de l'utilisateur qui a créé la transaction
  created_at INTEGER NOT NULL,
  FOREIGN KEY (loyalty_card_id) REFERENCES loyalty_cards(id) ON DELETE CASCADE
);

-- Table des règles de fidélité (programmes de points)
CREATE TABLE IF NOT EXISTS loyalty_rules (
  id TEXT PRIMARY KEY,
  establishment_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  points_per_euro REAL DEFAULT 1.0, -- Points gagnés par euro dépensé
  points_per_visit INTEGER DEFAULT 0, -- Points par visite
  minimum_purchase REAL, -- Achat minimum requis
  reward_threshold INTEGER, -- Seuil de points pour récompense
  reward_description TEXT, -- Description de la récompense
  is_active BOOLEAN DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Table des récompenses disponibles
CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  establishment_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  reward_type TEXT CHECK (reward_type IN ('discount', 'free_item', 'cashback', 'other')) DEFAULT 'discount',
  discount_percentage REAL, -- Pourcentage de réduction
  discount_amount REAL, -- Montant fixe de réduction
  is_active BOOLEAN DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Table des récompenses réclamées
CREATE TABLE IF NOT EXISTS claimed_rewards (
  id TEXT PRIMARY KEY,
  reward_id TEXT NOT NULL,
  loyalty_card_id TEXT NOT NULL,
  points_spent INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'used', 'expired', 'cancelled')) DEFAULT 'pending',
  claimed_at INTEGER NOT NULL,
  used_at INTEGER,
  expires_at INTEGER,
  FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE,
  FOREIGN KEY (loyalty_card_id) REFERENCES loyalty_cards(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_establishment ON loyalty_cards(establishment_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_customer ON loyalty_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_number ON loyalty_cards(card_number);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_code ON loyalty_cards(card_code);
CREATE INDEX IF NOT EXISTS idx_customers_establishment ON customers(establishment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card ON loyalty_transactions(loyalty_card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON loyalty_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_loyalty_rules_establishment ON loyalty_rules(establishment_id);
CREATE INDEX IF NOT EXISTS idx_rewards_establishment ON rewards(establishment_id);

