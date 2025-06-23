import ApiService from './apiService';
import { Transaction, TransactionStatus, ChatMessage } from '@/contexts/TransactionContext';

export class TransactionService {
  static async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdDate' | 'lastUpdate'>): Promise<Transaction> {
    return ApiService.createTransaction(transactionData);
  }

  static async getAllTransactions(): Promise<Transaction[]> {
    return ApiService.getAllTransactions();
  }

  static async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      const transactions = await ApiService.getAllTransactions();
      return transactions.find(t => t.id === id) || null;
    } catch (error) {
      return null;
    }
  }

  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    return ApiService.getUserTransactions(userId);
  }

  static async updateTransactionStatus(id: string, status: TransactionStatus, disputeReason?: string): Promise<Transaction> {
    return ApiService.updateTransactionStatus(id, status, disputeReason);
  }

  static async createMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    return ApiService.createMessage(messageData);
  }

  static async getTransactionMessages(transactionId: string): Promise<ChatMessage[]> {
    return ApiService.getTransactionMessages(transactionId);
  }
}