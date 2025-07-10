import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../services/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Configuration CORS standard
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:8081',
    'https://localhost:8081',
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:8081',
    'https://127.0.0.1:8081',
    'http://localhost:8087',
    'https://localhost:8087'
  ];

  // Add Replit dynamic origins if available
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    origins.push(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.dev`);
  }

  return origins;
};

app.use(cors({
  origin: getAllowedOrigins(),
  credentials: true
}));
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

// Route de test pour vérifier la connexion
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur API fonctionnel',
    timestamp: new Date().toISOString()
  });
});

// Route de test de la base de données
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      status: 'OK', 
      message: 'Base de données connectée',
      time: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Erreur de test DB:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Erreur de connexion à la base de données',
      error: error.message
    });
  }
});

// Route d'inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Tentative d\'inscription:', req.body);

    const { email, password, name, phone, userType } = req.body;

    // Validation des données
    if (!email || !password || !name || !userType) {
      console.log('❌ Données manquantes pour l\'inscription');
      return res.status(400).json({ 
        success: false,
        error: 'Tous les champs obligatoires doivent être remplis' 
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Format d\'email invalide' 
      });
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }

    // Validation du type d'utilisateur
    if (!['buyer', 'seller', 'both'].includes(userType)) {
      return res.status(400).json({ 
        success: false,
        error: 'Type d\'utilisateur invalide' 
      });
    }

    // Vérification de la base de données
    if (!pool) {
      console.log('❌ Base de données non disponible');
      return res.status(500).json({ 
        success: false,
        error: 'Base de données non disponible. Veuillez configurer PostgreSQL.' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ Email déjà utilisé:', email);
      return res.status(400).json({ 
        success: false,
        error: 'Un compte avec cet email existe déjà' 
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insérer le nouvel utilisateur
    const result = await pool.query(
      `INSERT INTO users (email, password, name, phone, user_type, rating, total_transactions, joined_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, email, name, phone, user_type, rating, total_transactions, joined_date`,
      [email.toLowerCase(), hashedPassword, name, phone || null, userType, 0, 0, new Date().toISOString().split('T')[0]]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Inscription réussie pour:', email);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        userType: user.user_type,
        rating: parseFloat(user.rating) || 0,
        totalTransactions: user.total_transactions || 0,
        joinedDate: user.joined_date
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);

    // Messages d'erreur plus spécifiques
    let errorMessage = 'Erreur serveur lors de la création du compte';

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Base de données non disponible. Veuillez configurer PostgreSQL.';
    } else if (error.code === '23505') { // Violation de contrainte unique
      errorMessage = 'Un compte avec cet email existe déjà';
    } else if (error.code === '42P01') { // Table n'existe pas
      errorMessage = 'Base de données non initialisée. Veuillez créer les tables.';
    }

    res.status(500).json({ 
      success: false,
      error: errorMessage 
    });
  }
});

// Route de connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Tentative de connexion:', req.body.email);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Données manquantes pour la connexion');
      return res.status(400).json({ 
        success: false,
        error: 'Email et mot de passe requis' 
      });
    }

    // Vérification de la base de données
    if (!pool) {
      console.log('❌ Base de données non disponible');
      return res.status(500).json({ 
        success: false,
        error: 'Base de données non disponible. Veuillez configurer PostgreSQL.' 
      });
    }

    // Chercher l'utilisateur
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      console.log('❌ Utilisateur non trouvé:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Email ou mot de passe incorrect' 
      });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Connexion réussie pour:', email);

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        userType: user.user_type,
        rating: parseFloat(user.rating) || 0,
        totalTransactions: user.total_transactions || 0,
        joinedDate: user.joined_date
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);

    // Messages d'erreur plus spécifiques
    let errorMessage = 'Erreur serveur lors de la connexion';

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Base de données non disponible. Veuillez configurer PostgreSQL.';
    } else if (error.code === '42P01') {
      errorMessage = 'Base de données non initialisée. Veuillez créer les tables.';
    }

    res.status(500).json({ 
      success: false,
      error: errorMessage 
    });
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
    res.json({ 
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      userType: user.user_type, 
      rating: parseFloat(user.rating) || 0,
      totalTransactions: user.total_transactions || 0, 
      joinedDate: user.joined_date 
    });
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
    res.json({ 
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      userType: user.user_type, 
      rating: parseFloat(user.rating) || 0,
      totalTransactions: user.total_transactions || 0, 
      joinedDate: user.joined_date 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY created_date DESC');
    res.json(result.rows.map(transaction => ({
      ...transaction,
      id: transaction.id.toString(),
      buyerId: transaction.buyer_id?.toString(),
      sellerId: transaction.seller_id?.toString(),
      buyerName: transaction.buyer_name,
      sellerName: transaction.seller_name,
      createdDate: transaction.created_date,
      expectedDelivery: transaction.expected_delivery,
      inspectionPeriod: transaction.inspection_period,
      deliveryAddress: transaction.delivery_address,
      disputeReason: transaction.dispute_reason,
      lastUpdate: transaction.last_update
    })));
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
    res.json(result.rows.map(transaction => ({
      ...transaction,
      id: transaction.id.toString(),
      buyerId: transaction.buyer_id?.toString(),
      sellerId: transaction.seller_id?.toString(),
      buyerName: transaction.buyer_name,
      sellerName: transaction.seller_name,
      createdDate: transaction.created_date,
      expectedDelivery: transaction.expected_delivery,
      inspectionPeriod: transaction.inspection_period,
      deliveryAddress: transaction.delivery_address,
      disputeReason: transaction.dispute_reason,
      lastUpdate: transaction.last_update
    })));
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactionData = req.body;
    const result = await pool.query(
      `INSERT INTO transactions (title, description, price, status, buyer_id, seller_id, buyer_name, seller_name, inspection_period, delivery_address, created_date, last_update) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [
        transactionData.title,
        transactionData.description,
        transactionData.price,
        transactionData.status || 'pending_acceptance',
        transactionData.buyerId,
        transactionData.sellerId,
        transactionData.buyerName,
        transactionData.sellerName,
        transactionData.inspectionPeriod || 3,
        transactionData.deliveryAddress,
        new Date().toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      ]
    );

    const transaction = result.rows[0];
    res.status(201).json({
      ...transaction,
      id: transaction.id.toString(),
      buyerId: transaction.buyer_id?.toString(),
      sellerId: transaction.seller_id?.toString(),
      buyerName: transaction.buyer_name,
      sellerName: transaction.seller_name,
      createdDate: transaction.created_date,
      expectedDelivery: transaction.expected_delivery,
      inspectionPeriod: transaction.inspection_period,
      deliveryAddress: transaction.delivery_address,
      disputeReason: transaction.dispute_reason,
      lastUpdate: transaction.last_update
    });
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
      'UPDATE transactions SET status = $1, dispute_reason = $2, last_update = $3 WHERE id = $4 RETURNING *',
      [status, disputeReason, new Date().toISOString().split('T')[0], id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction non trouvée' });
    }

    const transaction = result.rows[0];
    res.json({
      ...transaction,
      id: transaction.id.toString(),
      buyerId: transaction.buyer_id?.toString(),
      sellerId: transaction.seller_id?.toString(),
      buyerName: transaction.buyer_name,
      sellerName: transaction.seller_name,
      createdDate: transaction.created_date,
      expectedDelivery: transaction.expected_delivery,
      inspectionPeriod: transaction.inspection_period,
      deliveryAddress: transaction.delivery_address,
      disputeReason: transaction.dispute_reason,
      lastUpdate: transaction.last_update
    });
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
    res.json(result.rows.map(message => ({
      id: message.id.toString(),
      transactionId: message.transaction_id.toString(),
      senderId: message.sender_id,
      senderName: message.sender_name,
      message: message.message,
      timestamp: message.timestamp,
      type: message.type
    })));
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { transactionId, senderId, senderName, message, type } = req.body;
    const result = await pool.query(
      'INSERT INTO messages (transaction_id, sender_id, sender_name, message, type, timestamp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [transactionId, senderId, senderName, message, type || 'text', new Date().toISOString()]
    );

    const newMessage = result.rows[0];
    res.status(201).json({
      id: newMessage.id.toString(),
      transactionId: newMessage.transaction_id.toString(),
      senderId: newMessage.sender_id,
      senderName: newMessage.sender_name,
      message: newMessage.message,
      timestamp: newMessage.timestamp,
      type: newMessage.type
    });
  } catch (error) {
    console.error('Erreur lors de la création du message:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur API démarré sur http://0.0.0.0:${PORT}`);
  console.log(`🌐 Accessible via: http://localhost:${PORT}`);
  console.log(`🔗 API accessible sur: http://127.0.0.1:${PORT}`);
  console.log('📊 Base de données: PostgreSQL');
  console.log('🔗 Routes disponibles:');
  console.log('  - GET  /api/health');
  console.log('  - GET  /api/db-test');
  console.log('  - POST /api/auth/register');
  console.log('  - POST /api/auth/login');
});