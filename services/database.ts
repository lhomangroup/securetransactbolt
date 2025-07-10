// Configuration de base de données en mémoire pour l'environnement de développement
console.log('🔍 Configuration de la base de données en mémoire');

// Stockage en mémoire pour remplacer PostgreSQL
let users: any[] = [];
let transactions: any[] = [];
let messages: any[] = [];
let nextUserId = 1;
let nextTransactionId = 1;
let nextMessageId = 1;

// Simulation d'un pool de connexions
const pool = {
  query: async (sql: string, params: any[] = []) => {
    console.log('📊 Executing query:', sql.substring(0, 100) + '...');
    
    // Simulation des requêtes SQL avec stockage en mémoire
    if (sql.includes('SELECT table_name FROM information_schema.tables')) {
      return { rows: [{ table_name: 'users' }, { table_name: 'transactions' }, { table_name: 'messages' }] };
    }
    
    if (sql.includes('CREATE TABLE') || sql.includes('CREATE INDEX')) {
      return { rows: [] };
    }
    
    if (sql.includes('SELECT NOW()')) {
      return { rows: [{ current_time: new Date() }] };
    }
    
    // Requêtes utilisateurs
    if (sql.includes('SELECT id FROM users WHERE email')) {
      const email = params[0];
      const user = users.find(u => u.email === email);
      return { rows: user ? [{ id: user.id }] : [] };
    }
    
    if (sql.includes('INSERT INTO users')) {
      const [email, password, name, phone, userType, rating, totalTransactions, joinedDate] = params;
      const newUser = {
        id: nextUserId++,
        email,
        password,
        name,
        phone,
        user_type: userType,
        rating,
        total_transactions: totalTransactions,
        joined_date: joinedDate
      };
      users.push(newUser);
      return { rows: [newUser] };
    }
    
    if (sql.includes('SELECT * FROM users WHERE email')) {
      const email = params[0];
      const user = users.find(u => u.email === email);
      return { rows: user ? [user] : [] };
    }
    
    if (sql.includes('SELECT id, email, name, phone, user_type, rating, total_transactions, joined_date FROM users WHERE id')) {
      const id = parseInt(params[0]);
      const user = users.find(u => u.id === id);
      return { rows: user ? [user] : [] };
    }
    
    if (sql.includes('UPDATE users SET')) {
      const [name, phone, userType, id] = params;
      const userIndex = users.findIndex(u => u.id === parseInt(id));
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], name, phone, user_type: userType };
        return { rows: [users[userIndex]] };
      }
      return { rows: [] };
    }
    
    // Requêtes transactions
    if (sql.includes('SELECT * FROM transactions ORDER BY created_date DESC')) {
      return { rows: transactions };
    }
    
    if (sql.includes('SELECT * FROM transactions WHERE buyer_id')) {
      const userId = params[0];
      const userTransactions = transactions.filter(t => t.buyer_id === parseInt(userId) || t.seller_id === parseInt(userId));
      return { rows: userTransactions };
    }
    
    if (sql.includes('INSERT INTO transactions')) {
      const [title, description, price, status, buyerId, sellerId, buyerName, sellerName, inspectionPeriod, deliveryAddress, createdDate, lastUpdate] = params;
      const newTransaction = {
        id: nextTransactionId++,
        title,
        description,
        price,
        status,
        buyer_id: buyerId,
        seller_id: sellerId,
        buyer_name: buyerName,
        seller_name: sellerName,
        inspection_period: inspectionPeriod,
        delivery_address: deliveryAddress,
        created_date: createdDate,
        last_update: lastUpdate
      };
      transactions.push(newTransaction);
      return { rows: [newTransaction] };
    }
    
    if (sql.includes('UPDATE transactions SET status')) {
      const [status, disputeReason, lastUpdate, id] = params;
      const transactionIndex = transactions.findIndex(t => t.id === parseInt(id));
      if (transactionIndex !== -1) {
        transactions[transactionIndex] = { 
          ...transactions[transactionIndex], 
          status, 
          dispute_reason: disputeReason, 
          last_update: lastUpdate 
        };
        return { rows: [transactions[transactionIndex]] };
      }
      return { rows: [] };
    }
    
    // Requêtes messages
    if (sql.includes('SELECT * FROM messages WHERE transaction_id')) {
      const transactionId = parseInt(params[0]);
      const transactionMessages = messages.filter(m => m.transaction_id === transactionId);
      return { rows: transactionMessages };
    }
    
    if (sql.includes('INSERT INTO messages')) {
      const [transactionId, senderId, senderName, message, type, timestamp] = params;
      const newMessage = {
        id: nextMessageId++,
        transaction_id: parseInt(transactionId),
        sender_id: senderId,
        sender_name: senderName,
        message,
        type,
        timestamp
      };
      messages.push(newMessage);
      return { rows: [newMessage] };
    }
    
    return { rows: [] };
  },
  
  connect: async () => {
    console.log('✅ Connecté à la base de données en mémoire');
    return {
      query: pool.query,
      release: () => console.log('🔓 Connexion libérée')
    };
  },
  
  on: (event: string, callback: Function) => {
    if (event === 'connect') {
      setTimeout(() => callback(), 100);
    }
  }
};

console.log('✅ Base de données en mémoire initialisée');

export default pool;