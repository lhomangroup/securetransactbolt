
-- Création de la table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  user_type VARCHAR(10) CHECK (user_type IN ('buyer', 'seller', 'both')) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  joined_date DATE DEFAULT CURRENT_DATE,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des transactions
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status VARCHAR(30) CHECK (status IN ('pending_acceptance', 'pending_payment', 'payment_secured', 'shipped', 'delivered', 'inspection_period', 'completed', 'disputed', 'cancelled')) NOT NULL,
  buyer_id INTEGER REFERENCES users(id),
  seller_id INTEGER REFERENCES users(id),
  buyer_name VARCHAR(255) NOT NULL,
  seller_name VARCHAR(255) NOT NULL,
  created_date DATE DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  inspection_period INTEGER DEFAULT 3,
  delivery_address TEXT,
  dispute_reason TEXT,
  last_update DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des messages
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
  sender_id VARCHAR(50) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  type VARCHAR(10) CHECK (type IN ('text', 'image', 'system')) DEFAULT 'text'
);

-- Création d'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_transaction_id ON messages(transaction_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
