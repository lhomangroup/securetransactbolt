import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL non définie dans l\'environnement');
  console.log('💡 Pour configurer PostgreSQL dans Replit:');
  console.log('   1. Allez dans l\'onglet "Database" dans le panneau de gauche');
  console.log('   2. Créez une nouvelle base de données PostgreSQL');
  console.log('   3. La variable DATABASE_URL sera automatiquement définie');
  console.log('   4. Redémarrez le serveur après la création de la base');
}

console.log('🔍 Configuration de la base de données:');
console.log('DATABASE_URL définie:', !!DATABASE_URL);

let pool: Pool | null = null;

if (DATABASE_URL) {
  console.log('🔗 Tentative de connexion à PostgreSQL...');
  
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('connect', () => {
    console.log('✅ Connecté à la base de données PostgreSQL');
  });

  pool.on('error', (err) => {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.log('💡 Vérifiez que votre base de données PostgreSQL est active dans Replit');
    }
  });

  // Test de connexion initial et création des tables
  pool.connect()
    .then(async (client) => {
      console.log('✅ Connexion initiale réussie à PostgreSQL');
      
      try {
        // Vérifier si les tables existent
        const tablesResult = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('users', 'transactions', 'messages')
        `);
        
        const existingTables = tablesResult.rows.map(row => row.table_name);
        console.log('📋 Tables existantes:', existingTables);
        
        if (existingTables.length === 0) {
          console.log('🔧 Création des tables...');
          
          // Créer la table users
          await client.query(`
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
            )
          `);
          
          // Créer la table transactions
          await client.query(`
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
            )
          `);
          
          // Créer la table messages
          await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
              id SERIAL PRIMARY KEY,
              transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
              sender_id VARCHAR(50) NOT NULL,
              sender_name VARCHAR(255) NOT NULL,
              message TEXT NOT NULL,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              type VARCHAR(10) CHECK (type IN ('text', 'image', 'system')) DEFAULT 'text'
            )
          `);
          
          // Créer les index
          await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id)');
          await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id)');
          await client.query('CREATE INDEX IF NOT EXISTS idx_messages_transaction_id ON messages(transaction_id)');
          await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
          
          console.log('✅ Tables créées avec succès');
        } else {
          console.log('✅ Tables déjà existantes');
        }
        
      } catch (error) {
        console.error('❌ Erreur lors de la création des tables:', error);
      }
      
      client.release();
    })
    .catch((err) => {
      console.error('❌ Échec de la connexion initiale:', err.message);
      console.log('💡 Vérifiez la configuration de votre base de données PostgreSQL');
    });
} else {
  console.log('⚠️  Base de données non configurée - fonctionnement en mode dégradé');
}

export default pool;