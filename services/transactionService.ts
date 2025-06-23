
import pool from './database';
import { Transaction, TransactionStatus, ChatMessage } from '@/contexts/TransactionContext';

export class TransactionService {
  static async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdDate' | 'lastUpdate'>): Promise<Transaction> {
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
    return result.rows[0];
  }

  static async getAllTransactions(): Promise<Transaction[]> {
    const query = `
      SELECT id, title, description, price, status, buyer_id as buyerId, seller_id as sellerId, 
             buyer_name as buyerName, seller_name as sellerName, created_date as createdDate, 
             expected_delivery as expectedDelivery, inspection_period as inspectionPeriod, 
             delivery_address as deliveryAddress, dispute_reason as disputeReason, last_update as lastUpdate
      FROM transactions
      ORDER BY created_date DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async getTransactionById(id: string): Promise<Transaction | null> {
    const query = `
      SELECT id, title, description, price, status, buyer_id as buyerId, seller_id as sellerId, 
             buyer_name as buyerName, seller_name as sellerName, created_date as createdDate, 
             expected_delivery as expectedDelivery, inspection_period as inspectionPeriod, 
             delivery_address as deliveryAddress, dispute_reason as disputeReason, last_update as lastUpdate
      FROM transactions WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async getUserTransactions(userId: string): Promise<Transaction[]> {
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
    return result.rows;
  }

  static async updateTransactionStatus(id: string, status: TransactionStatus, disputeReason?: string): Promise<Transaction> {
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
    return result.rows[0];
  }

  static async createMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
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
    return result.rows[0];
  }

  static async getTransactionMessages(transactionId: string): Promise<ChatMessage[]> {
    const query = `
      SELECT id, transaction_id as transactionId, sender_id as senderId, sender_name as senderName, 
             message, timestamp, type
      FROM messages 
      WHERE transaction_id = $1
      ORDER BY timestamp ASC
    `;
    
    const result = await pool.query(query, [transactionId]);
    return result.rows;
  }
}
