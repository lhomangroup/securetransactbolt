
import { Pool } from 'pg';

// Configuration manuelle de DATABASE_URL si elle n'est pas définie
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_QkdWrGU3NlZ9@ep-orange-darkness-a5074awi.us-east-2.aws.neon.tech/neondb?sslmode=require';

console.log('🔍 Configuration de la base de données:');
console.log('DATABASE_URL définie:', !!process.env.DATABASE_URL);
console.log('URL utilisée:', DATABASE_URL ? 'Configurée' : 'Non configurée');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connecté à la base de données PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion à la base de données:', err);
  if (err.message.includes('ECONNREFUSED')) {
    console.log('💡 Vérifiez que la base de données PostgreSQL est active');
  }
});

// Test de connexion initial
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Échec de la connexion initiale:', err);
  } else {
    console.log('✅ Connexion initiale réussie à PostgreSQL');
    release();
  }
});

export default pool;
