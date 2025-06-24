
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../services/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Middleware d'authentification
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes d'authentification
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, userType } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUserResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const result = await pool.query(
      'INSERT INTO users (email, password, name, phone, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, phone, user_type, rating, total_transactions, joined_date',
      [email, hashedPassword, name, phone, userType]
    );

    const user = result.rows[0];

    // Générer le token JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: { ...user, userType: user.user_type, totalTransactions: user.total_transactions, joinedDate: user.joined_date }, token });
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Récupérer l'utilisateur
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: { ...user, userType: user.user_type, totalTransactions: user.total_transactions, joinedDate: user.joined_date }, token });
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Routes utilisateur
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, email, name, phone, user_type, rating, total_transactions, joined_date FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = result.rows[0];
    res.json({ ...user, userType: user.user_type, totalTransactions: user.total_transactions, joinedDate: user.joined_date });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, userType } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2, user_type = $3 WHERE id = $4 RETURNING id, email, name, phone, user_type, rating, total_transactions, joined_date',
      [name, phone, userType, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = result.rows[0];
    res.json({ ...user, userType: user.user_type, totalTransactions: user.total_transactions, joinedDate: user.joined_date });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY created_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/transactions/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM transactions WHERE buyer_id = $1 OR seller_id = $1 ORDER BY created_date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactionData = req.body;
    const result = await pool.query(
      'INSERT INTO transactions (buyer_id, seller_id, amount, description, status, created_date, last_update) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE) RETURNING *',
      [transactionData.buyerId, transactionData.sellerId, transactionData.amount, transactionData.description, transactionData.status || 'pending']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création de la transaction:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/transactions/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, disputeReason } = req.body;

    const result = await pool.query(
      'UPDATE transactions SET status = $1, dispute_reason = $2, last_update = CURRENT_DATE WHERE id = $3 RETURNING *',
      [status, disputeReason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes messages
app.get('/api/transactions/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM messages WHERE transaction_id = $1 ORDER BY timestamp ASC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { transactionId, senderId, content, messageType } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (transaction_id, sender_id, content, message_type, timestamp) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [transactionId, senderId, content, messageType || 'text']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur API démarré sur http://0.0.0.0:${PORT}`);
  console.log('Mode: Base de données PostgreSQL connectée');
});
