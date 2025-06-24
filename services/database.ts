
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL non définie dans l\'environnement');
  console.log('💡 Assurez-vous d\'avoir créé une base de données PostgreSQL dans Replit');
  process.exit(1);
}

console.log('🔍 Configuration de la base de données:');
console.log('DATABASE_URL définie:', !!DATABASE_URL);
console.log('Tentative de connexion à Neon PostgreSQL...');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
  console.log('✅ Connecté à la base de données PostgreSQL Neon');
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion à la base de données:', err.message);
  if (err.message.includes('ECONNREFUSED')) {
    console.log('💡 Vérifiez que votre base de données Neon est active');
  }
});

// Test de connexion initial
pool.connect()
  .then((client) => {
    console.log('✅ Connexion initiale réussie à PostgreSQL Neon');
    client.release();
  })
  .catch((err) => {
    console.error('❌ Échec de la connexion initiale:', err.message);
  });

export default pool;
