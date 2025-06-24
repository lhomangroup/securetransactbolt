
// Base de données désactivée
// import { Pool } from 'pg';

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
// });

// export default pool;

// Base de données mock pour éviter les erreurs
const mockPool = {
  query: () => Promise.reject(new Error('Base de données désactivée')),
  connect: () => Promise.reject(new Error('Base de données désactivée')),
  end: () => Promise.resolve()
};

export default mockPool;
