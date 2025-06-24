
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('buyer', 'seller', 'both')),
    rating DECIMAL(3,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    joined_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    buyer_id INTEGER REFERENCES users(id),
    seller_id INTEGER REFERENCES users(id),
    buyer_name VARCHAR(255),
    seller_name VARCHAR(255),
    created_date DATE DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    inspection_period INTEGER,
    delivery_address TEXT,
    dispute_reason TEXT,
    last_update DATE DEFAULT CURRENT_DATE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    sender_id INTEGER REFERENCES users(id),
    sender_name VARCHAR(255),
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) DEFAULT 'user'
);
