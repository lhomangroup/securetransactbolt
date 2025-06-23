import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  inspectionPeriod: number; // en jours
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
  createTransaction: (transaction: Omit<Transaction, 'id' | 'createdDate' | 'lastUpdate'>) => string;
  updateTransactionStatus: (id: string, status: TransactionStatus, disputeReason?: string) => void;
  sendMessage: (transactionId: string, senderId: string, senderName: string, message: string) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  getUserTransactions: (userId: string) => Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      title: 'iPhone 14 Pro - Comme neuf',
      description: 'iPhone 14 Pro 128GB couleur Deep Purple. Très bon état, aucune rayure. Livré avec sa boîte et tous les accessoires d\'origine.',
      price: 850,
      status: 'inspection_period',
      buyerId: '1',
      sellerId: '2',
      buyerName: 'Utilisateur Connecté',
      sellerName: 'Marie Dubois',
      createdDate: '2024-01-15',
      expectedDelivery: '2024-01-20',
      inspectionPeriod: 3,
      deliveryAddress: '123 Rue de la Paix, 75001 Paris',
      images: ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'],
      lastUpdate: '2024-01-18',
    },
    {
      id: '2',
      title: 'MacBook Air M2',
      description: 'MacBook Air avec puce M2, 8GB RAM, 256GB SSD. Utilisé pendant 6 mois, excellent état.',
      price: 1200,
      status: 'pending_payment',
      buyerId: '3',
      sellerId: '1',
      buyerName: 'Jean Martin',
      sellerName: 'Utilisateur Connecté',
      createdDate: '2024-01-16',
      inspectionPeriod: 5,
      lastUpdate: '2024-01-16',
    },
    {
      id: '3',
      title: 'Services de développement web',
      description: 'Création d\'un site web e-commerce complet avec système de paiement intégré.',
      price: 2500,
      status: 'disputed',
      buyerId: '1',
      sellerId: '4',
      buyerName: 'Utilisateur Connecté',
      sellerName: 'TechSolutions SARL',
      createdDate: '2024-01-10',
      inspectionPeriod: 7,
      disputeReason: 'Le site ne correspond pas aux spécifications convenues',
      lastUpdate: '2024-01-17',
    },
    {
      id: '4',
      title: 'iPad Pro 12.9" - 2022',
      description: 'iPad Pro 12.9 pouces avec puce M2, 256GB, Wi-Fi + Cellular. Parfait état, utilisé 3 mois.',
      price: 950,
      status: 'completed',
      buyerId: '5',
      sellerId: '1',
      buyerName: 'Pierre Martin',
      sellerName: 'Utilisateur Connecté',
      createdDate: '2024-01-12',
      inspectionPeriod: 3,
      lastUpdate: '2024-01-15',
    },
    {
      id: '5',
      title: 'MacBook Pro 16" - M1 Pro',
      description: 'MacBook Pro 16 pouces avec puce M1 Pro, 32GB RAM, 1TB SSD. État impeccable.',
      price: 2200,
      status: 'completed',
      buyerId: '1',
      sellerId: '6',
      buyerName: 'Utilisateur Connecté',
      sellerName: 'Sophie Leroy',
      createdDate: '2024-01-08',
      inspectionPeriod: 5,
      lastUpdate: '2024-01-12',
    },
    {
      id: '6',
      title: 'AirPods Pro 2ème génération',
      description: 'AirPods Pro 2ème génération, neufs dans leur emballage d\'origine.',
      price: 220,
      status: 'completed',
      buyerId: '7',
      sellerId: '1',
      buyerName: 'Lucas Dubois',
      sellerName: 'Utilisateur Connecté',
      createdDate: '2024-01-05',
      inspectionPeriod: 2,
      lastUpdate: '2024-01-10',
    }
  ]);

  const [messages, setMessages] = useState<{ [transactionId: string]: ChatMessage[] }>({
    '1': [
      {
        id: '1',
        transactionId: '1',
        senderId: '2',
        senderName: 'Marie Dubois',
        message: 'Bonjour ! J\'ai bien expédié l\'iPhone hier. Vous devriez le recevoir demain.',
        timestamp: '2024-01-17T10:30:00Z',
        type: 'text',
      },
      {
        id: '2',
        transactionId: '1',
        senderId: '1',
        senderName: 'Utilisateur Connecté',
        message: 'Parfait, merci ! J\'ai hâte de le recevoir.',
        timestamp: '2024-01-17T11:15:00Z',
        type: 'text',
      },
      {
        id: '3',
        transactionId: '1',
        senderId: 'system',
        senderName: 'SecureTransact',
        message: 'L\'article a été livré. La période d\'inspection de 3 jours a commencé.',
        timestamp: '2024-01-18T09:00:00Z',
        type: 'system',
      },
      {
        id: '4',
        transactionId: '1',
        senderId: '1',
        senderName: 'Utilisateur Connecté',
        message: 'Article bien reçu ! Il est exactement comme décrit. Merci beaucoup !',
        timestamp: '2024-01-18T14:20:00Z',
        type: 'text',
      },
    ],
    '3': [
      {
        id: '5',
        transactionId: '3',
        senderId: '1',
        senderName: 'Utilisateur Connecté',
        message: 'Le site web ne correspond pas du tout à ce qui était convenu. Plusieurs fonctionnalités manquent.',
        timestamp: '2024-01-17T14:30:00Z',
        type: 'text',
      },
      {
        id: '6',
        transactionId: '3',
        senderId: '4',
        senderName: 'TechSolutions SARL',
        message: 'Nous sommes disposés à faire les ajustements nécessaires. Pouvez-vous nous envoyer une liste détaillée ?',
        timestamp: '2024-01-17T15:45:00Z',
        type: 'text',
      },
      {
        id: '7',
        transactionId: '3',
        senderId: 'system',
        senderName: 'SecureTransact',
        message: 'Un litige a été ouvert pour cette transaction. Notre équipe de médiation va examiner le cas.',
        timestamp: '2024-01-17T16:00:00Z',
        type: 'system',
      },
    ],
  });

  const createTransaction = (transactionData: Omit<Transaction, 'id' | 'createdDate' | 'lastUpdate'>): string => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Ajouter un message système initial
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      transactionId: newTransaction.id,
      senderId: 'system',
      senderName: 'SecureTransact',
      message: 'Transaction créée. En attente d\'acceptation par l\'autre partie.',
      timestamp: new Date().toISOString(),
      type: 'system',
    };
    
    setMessages(prev => ({
      ...prev,
      [newTransaction.id]: [systemMessage]
    }));
    
    return newTransaction.id;
  };

  const updateTransactionStatus = (id: string, status: TransactionStatus, disputeReason?: string) => {
    setTransactions(prev => prev.map(transaction => 
      transaction.id === id 
        ? { 
            ...transaction, 
            status, 
            disputeReason: disputeReason || transaction.disputeReason,
            lastUpdate: new Date().toISOString().split('T')[0] 
          }
        : transaction
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

    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      transactionId: id,
      senderId: 'system',
      senderName: 'SecureTransact',
      message: statusMessages[status],
      timestamp: new Date().toISOString(),
      type: 'system',
    };

    setMessages(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), systemMessage]
    }));
  };

  const sendMessage = (transactionId: string, senderId: string, senderName: string, message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      transactionId,
      senderId,
      senderName,
      message,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setMessages(prev => ({
      ...prev,
      [transactionId]: [...(prev[transactionId] || []), newMessage],
    }));
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