
import { Pool } from 'pg';

// Utiliser la DATABASE_URL de l'environnement Replit
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL non définie dans l\'environnement');
  console.log('💡 Assurez-vous d\'avoir créé une base de données PostgreSQL dans Replit');
  process.exit(1);
}

console.log('🔍 Configuration de la base de données:');
console.log('DATABASE_URL définie:', !!DATABASE_URL);

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connecté à la base de données PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion à la base de données:', err.message);
  if (err.message.includes('ECONNREFUSED')) {
    console.log('💡 Vérifiez que la base de données PostgreSQL est active dans l\'onglet Database');
  }
});

// Test de connexion initial
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Échec de la connexion initiale:', err.message);
  } else {
    console.log('✅ Connexion initiale réussie à PostgreSQL');
    release();
  }
});

export default pool;
