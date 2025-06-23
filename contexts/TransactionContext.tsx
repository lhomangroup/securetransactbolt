
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ApiService from '@/services/apiService';

export type TransactionStatus = 
  | 'pending_acceptance'
  | 'pending_payment'
  | 'payment_secured'
  | 'shipped'
  | 'delivered'
  | 'inspection_period'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export interface Transaction {
  id: string;
  title: string;
  description: string;
  price: number;
  status: TransactionStatus;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  createdDate: string;
  expectedDelivery?: string;
  inspectionPeriod: number;
  deliveryAddress?: string;
  images?: string[];
  disputeReason?: string;
  lastUpdate: string;
}

export interface ChatMessage {
  id: string;
  transactionId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
}

interface TransactionContextType {
  transactions: Transaction[];
  messages: { [transactionId: string]: ChatMessage[] };
  createTransaction: (transaction: Omit<Transaction, 'id' | 'createdDate' | 'lastUpdate'>) => Promise<string>;
  updateTransactionStatus: (id: string, status: TransactionStatus, disputeReason?: string) => Promise<void>;
  sendMessage: (transactionId: string, senderId: string, senderName: string, message: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  getUserTransactions: (userId: string) => Transaction[];
  loadTransactionMessages: (transactionId: string) => Promise<void>;
  loading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [messages, setMessages] = useState<{ [transactionId: string]: ChatMessage[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const allTransactions = await ApiService.getAllTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdDate' | 'lastUpdate'>): Promise<string> => {
    try {
      const newTransaction = await ApiService.createTransaction(transactionData);

      setTransactions(prev => [newTransaction, ...prev]);

      // Ajouter un message système initial
      await sendSystemMessage(newTransaction.id, 'Transaction créée. En attente d\'acceptation par l\'autre partie.');

      return newTransaction.id;
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      throw error;
    }
  };

  const updateTransactionStatus = async (id: string, status: TransactionStatus, disputeReason?: string) => {
    try {
      const updatedTransaction = await ApiService.updateTransactionStatus(id, status, disputeReason);

      setTransactions(prev => prev.map(transaction => 
        transaction.id === id ? updatedTransaction : transaction
      ));

      // Ajouter un message système pour le changement de statut
      const statusMessages: { [key in TransactionStatus]: string } = {
        pending_acceptance: 'Transaction en attente d\'acceptation',
        pending_payment: 'Transaction acceptée. En attente de paiement.',
        payment_secured: 'Paiement sécurisé. L\'article peut être expédié.',
        shipped: 'Article expédié.',
        delivered: 'Article livré.',
        inspection_period: 'Période d\'inspection commencée.',
        completed: 'Transaction terminée avec succès. Les fonds ont été libérés.',
        disputed: 'Litige ouvert. Notre équipe de médiation va examiner le cas.',
        cancelled: 'Transaction annulée.'
      };

      await sendSystemMessage(id, statusMessages[status]);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const sendMessage = async (transactionId: string, senderId: string, senderName: string, message: string) => {
    try {
      const newMessage = await ApiService.createMessage({
        transactionId,
        senderId,
        senderName,
        message,
        type: 'text',
      });

      setMessages(prev => ({
        ...prev,
        [transactionId]: [...(prev[transactionId] || []), newMessage],
      }));
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const sendSystemMessage = async (transactionId: string, message: string) => {
    try {
      const systemMessage = await ApiService.createMessage({
        transactionId,
        senderId: 'system',
        senderName: 'SecureTransact',
        message,
        type: 'system',
      });

      setMessages(prev => ({
        ...prev,
        [transactionId]: [...(prev[transactionId] || []), systemMessage],
      }));
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message système:', error);
    }
  };

  const loadTransactionMessages = async (transactionId: string) => {
    try {
      const transactionMessages = await ApiService.getTransactionMessages(transactionId);
      setMessages(prev => ({
        ...prev,
        [transactionId]: transactionMessages,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const getTransactionById = (id: string): Transaction | undefined => {
    return transactions.find(transaction => transaction.id === id);
  };

  const getUserTransactions = (userId: string): Transaction[] => {
    return transactions.filter(transaction => 
      transaction.buyerId === userId || transaction.sellerId === userId
    );
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      messages,
      createTransaction,
      updateTransactionStatus,
      sendMessage,
      getTransactionById,
      getUserTransactions,
      loadTransactionMessages,
      loading,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
