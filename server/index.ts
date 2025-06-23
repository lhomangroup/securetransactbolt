
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
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const query = `
      INSERT INTO users (email, password, name, phone, user_type, rating, total_transactions, joined_date)
      VALUES ($1, $2, $3, $4, $5, 0, 0, CURRENT_DATE)
      RETURNING id, email, name, phone, user_type as userType, rating, total_transactions as totalTransactions, joined_date as joinedDate
    `;
    
    const values = [email, hashedPassword, name, phone, userType];
    const result = await pool.query(query, values);
    const user = result.rows[0];

    // Générer le token JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Récupérer l'utilisateur
    const query = `
      SELECT id, email, name, phone, user_type as userType, rating, total_transactions as totalTransactions, joined_date as joinedDate, password
      FROM users WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Supprimer le mot de passe de la réponse
    delete user.password;

    // Générer le token JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes utilisateur
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, email, name, phone, user_type as userType, rating, total_transactions as totalTransactions, joined_date as joinedDate
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => updates[field]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `
      UPDATE users SET ${setClause}
      WHERE id = $1
      RETURNING id, email, name, phone, user_type as userType, rating, total_transactions as totalTransactions, joined_date as joinedDate
    `;
    
    const result = await pool.query(query, [id, ...values]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT id, title, description, price, status, buyer_id as buyerId, seller_id as sellerId, 
             buyer_name as buyerName, seller_name as sellerName, created_date as createdDate, 
             expected_delivery as expectedDelivery, inspection_period as inspectionPeriod, 
             delivery_address as deliveryAddress, dispute_reason as disputeReason, last_update as lastUpdate
      FROM transactions
      ORDER BY created_date DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/transactions/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT id, title, description, price, status, buyer_id as buyerId, seller_id as sellerId, 
             buyer_name as buyerName, seller_name as sellerName, created_date as createdDate, 
             expected_delivery as expectedDelivery, inspection_period as inspectionPeriod, 
             delivery_address as deliveryAddress, dispute_reason as disputeReason, last_update as lastUpdate
      FROM transactions 
      WHERE buyer_id = $1 OR seller_id = $1
      ORDER BY created_date DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactionData = req.body;
    const query = `
      INSERT INTO transactions (title, description, price, status, buyer_id, seller_id, buyer_name, seller_name, 
                               expected_delivery, inspection_period, delivery_address, dispute_reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, title, description, price, status, buyer_id as buyerId, seller_id as sellerId, 
                buyer_name as buyerName, seller_name as sellerName, created_date as createdDate, 
                expected_delivery as expectedDelivery, inspection_period as inspectionPeriod, 
                delivery_address as deliveryAddress, dispute_reason as disputeReason, last_update as lastUpdate
    `;
    
    const values = [
      transactionData.title,
      transactionData.description,
      transactionData.price,
      transactionData.status,
      transactionData.buyerId,
      transactionData.sellerId,
      transactionData.buyerName,
      transactionData.sellerName,
      transactionData.expectedDelivery,
      transactionData.inspectionPeriod,
      transactionData.deliveryAddress,
      transactionData.disputeReason
    ];
    
    const result = await pool.query(query, values);
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
    
    const query = `
      UPDATE transactions 
      SET status = $2, dispute_reason = $3, last_update = CURRENT_DATE
      WHERE id = $1
      RETURNING id, title, description, price, status, buyer_id as buyerId, seller_id as sellerId, 
                buyer_name as buyerName, seller_name as sellerName, created_date as createdDate, 
                expected_delivery as expectedDelivery, inspection_period as inspectionPeriod, 
                delivery_address as deliveryAddress, dispute_reason as disputeReason, last_update as lastUpdate
    `;
    
    const result = await pool.query(query, [id, status, disputeReason]);
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
    const query = `
      SELECT id, transaction_id as transactionId, sender_id as senderId, sender_name as senderName, 
             message, timestamp, type
      FROM messages 
      WHERE transaction_id = $1
      ORDER BY timestamp ASC
    `;
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const messageData = req.body;
    const query = `
      INSERT INTO messages (transaction_id, sender_id, sender_name, message, type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, transaction_id as transactionId, sender_id as senderId, sender_name as senderName, 
                message, timestamp, type
    `;
    
    const values = [
      messageData.transactionId,
      messageData.senderId,
      messageData.senderName,
      messageData.message,
      messageData.type
    ];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur API démarré sur le port ${PORT}`);
});
