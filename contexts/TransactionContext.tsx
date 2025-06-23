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
      title: 'iPhone 15 Pro Max 256GB - Titane Naturel',
      description: 'iPhone 15 Pro Max 256GB en titane naturel. Acheté il y a 2 mois, utilisé avec protection d\'écran et coque depuis l\'achat. État neuf, aucune rayure visible. Livré avec boîte d\'origine, câble USB-C, documentation et AirPods Pro 2 offerts.',
      price: 1150,
      status: 'inspection_period',
      buyerId: '1',
      sellerId: '12',
      buyerName: 'Utilisateur Connecté',
      sellerName: 'Alexandre Martin',
      createdDate: '2024-02-15',
      expectedDelivery: '2024-02-18',
      inspectionPeriod: 3,
      deliveryAddress: '47 Avenue des Champs-Élysées, 75008 Paris',
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500'],
      lastUpdate: '2024-02-18',
    },
    {
      id: '2',
      title: 'Tesla Model Y - Location longue durée',
      description: 'Proposition de location longue durée pour Tesla Model Y Performance 2023. Véhicule équipé de l\'autopilot, toit panoramique, sièges chauffants. Contrat 24 mois avec maintenance incluse.',
      price: 650,
      status: 'pending_payment',
      buyerId: '8',
      sellerId: '1',
      buyerName: 'Marina Rousseau',
      sellerName: 'Utilisateur Connecté',
      createdDate: '2024-02-16',
      inspectionPeriod: 1,
      lastUpdate: '2024-02-16',
    },
    {
      id: '3',
      title: 'Développement application mobile React Native',
      description: 'Création d\'une application mobile complète avec authentification, paiements intégrés, notifications push, backend Node.js, base de données MongoDB. Livraison prévue sous 8 semaines avec 3 mois de support gratuit.',
      price: 12500,
      status: 'disputed',
      buyerId: '1',
      sellerId: '15',
      buyerName: 'Utilisateur Connecté',
      sellerName: 'DigitalCraft Studio',
      createdDate: '2024-01-22',
      inspectionPeriod: 14,
      disputeReason: 'Fonctionnalités manquantes dans la livraison finale et délais non respectés',
      lastUpdate: '2024-02-16',
    },
    {
      id: '4',
      title: 'MacBook Pro 14" M3 Pro - Configuration sur mesure',
      description: 'MacBook Pro 14 pouces avec puce M3 Pro, 18GB RAM, 1TB SSD, écran Liquid Retina XDR. Utilisé 4 mois pour du développement. Configuration parfaite pour les développeurs et créatifs.',
      price: 2850,
      status: 'completed',
      buyerId: '9',
      sellerId: '1',
      buyerName: 'Thomas Dubois',
      sellerName: 'Utilisateur Connecté',
      createdDate: '2024-02-10',
      inspectionPeriod: 5,
      lastUpdate: '2024-02-15',
    },
    {
      id: '5',
      title: 'Rolex Submariner Date - Édition 2023',
      description: 'Rolex Submariner Date référence 126610LN, acier inoxydable, cadran noir. Montre neuve avec certificat d\'authenticité, boîte et papiers. Garantie internationale valide 4 ans.',
      price: 9200,
      status: 'completed',
      buyerId: '1',
      sellerId: '11',
      buyerName: 'Utilisateur Connecté',
      sellerName: 'Horlogerie Prestige Paris',
      createdDate: '2024-02-05',
      inspectionPeriod: 7,
      lastUpdate: '2024-02-14',
    },
    {
      id: '6',
      title: 'Sony A7R V - Kit photographe professionnel',
      description: 'Appareil photo Sony A7R V avec objectifs 24-70mm F2.8, 70-200mm F2.8, flash, batteries supplémentaires, cartes mémoire, sac de transport professionnel. Parfait pour photographes événementiel.',
      price: 4200,
      status: 'completed',
      buyerId: '14',
      sellerId: '1',
      buyerName: 'Sophie Moreau',
      sellerName: 'Utilisateur Connecté',
      createdDate: '2024-02-01',
      inspectionPeriod: 3,
      lastUpdate: '2024-02-05',
    },
    {
      id: '7',
      title: 'Cours particuliers mathématiques - Prépa HEC',
      description: 'Cours particuliers de mathématiques pour préparation HEC. Professeur agrégé avec 15 ans d\'expérience. Forfait 20h réparties sur 2 mois avec support WhatsApp illimité.',
      price: 1200,
      status: 'shipped',
      buyerId: '13',
      sellerId: '16',
      buyerName: 'Julie Petit',
      sellerName: 'Prof. Laurent Durand',
      createdDate: '2024-02-14',
      inspectionPeriod: 7,
      lastUpdate: '2024-02-17',
    },
    {
      id: '8',
      title: 'Vélo électrique Specialized Turbo - Comme neuf',
      description: 'Vélo électrique Specialized Turbo Como 4.0, autonomie 90km, utilisé 3 mois. Livré avec chargeur, antivol haute sécurité, casque et accessoires. Idéal trajets urbains.',
      price: 2400,
      status: 'pending_acceptance',
      buyerId: '10',
      sellerId: '1',
      buyerName: 'David Chen',
      sellerName: 'Utilisateur Connecté',
      createdDate: '2024-02-17',
      inspectionPeriod: 2,
      lastUpdate: '2024-02-17',
    },
    {
      id: '9',
      title: 'Formation complète Trading Crypto - Mentoring inclus',
      description: 'Formation trading cryptomonnaies avec stratégies avancées, analyse technique, gestion des risques. 40h de vidéos + 3 mois de mentoring personnalisé + accès groupe privé Discord.',
      price: 1850,
      status: 'payment_secured',
      buyerId: '17',
      sellerId: '18',
      buyerName: 'Kevin Moreau',
      sellerName: 'CryptoAcademy Pro',
      createdDate: '2024-02-16',
      inspectionPeriod: 14,
      lastUpdate: '2024-02-17',
    },
    {
      id: '10',
      title: 'Consultation juridique - Création entreprise',
      description: 'Accompagnement juridique complet pour création SARL/SAS. Rédaction statuts, formalités administratives, conseils fiscaux, première consultation comptable offerte.',
      price: 850,
      status: 'delivered',
      buyerId: '1',
      sellerId: '19',
      buyerName: 'Utilisateur Connecté',
      sellerName: 'Cabinet Avocat & Associés',
      createdDate: '2024-02-12',
      inspectionPeriod: 5,
      lastUpdate: '2024-02-18',
    }
  ]);

  const [messages, setMessages] = useState<{ [transactionId: string]: ChatMessage[] }>({
    '1': [
      {
        id: '1',
        transactionId: '1',
        senderId: '12',
        senderName: 'Alexandre Martin',
        message: 'Bonjour ! L\'iPhone est en parfait état, je l\'expédie aujourd\'hui même avec Chronopost 24h. Vous recevrez le numéro de suivi par SMS.',
        timestamp: '2024-02-17T09:15:00Z',
        type: 'text',
      },
      {
        id: '2',
        transactionId: '1',
        senderId: '1',
        senderName: 'Alexandre Martin',
        message: 'Parfait ! J\'ai vraiment hâte de le recevoir. La protection d\'écran est-elle toujours dessus ?',
        timestamp: '2024-02-17T09:45:00Z',
        type: 'text',
      },
      {
        id: '3',
        transactionId: '1',
        senderId: '12',
        senderName: 'Alexandre Martin',
        message: 'Oui bien sûr ! Protection d\'écran + coque transparente MagSafe. Je joins aussi un chargeur sans fil en bonus 😊',
        timestamp: '2024-02-17T10:12:00Z',
        type: 'text',
      },
      {
        id: '4',
        transactionId: '1',
        senderId: 'system',
        senderName: 'SecureTransact',
        message: 'Article expédié. Numéro de suivi: CP123456789FR',
        timestamp: '2024-02-17T14:00:00Z',
        type: 'system',
      },
      {
        id: '5',
        transactionId: '1',
        senderId: 'system',
        senderName: 'SecureTransact',
        message: 'Article livré avec succès. La période d\'inspection de 3 jours a commencé.',
        timestamp: '2024-02-18T11:30:00Z',
        type: 'system',
      },
      {
        id: '6',
        transactionId: '1',
        senderId: '1',
        senderName: 'Alexandre Martin',
        message: 'Fantastique ! L\'iPhone est absolument parfait, même mieux que sur les photos. Transaction au top ! 🔥',
        timestamp: '2024-02-18T16:20:00Z',
        type: 'text',
      },
    ],
    '3': [
      {
        id: '7',
        transactionId: '3',
        senderId: '1',
        senderName: 'Alexandre Martin',
        message: 'Bonjour, nous avons reçu la première version de l\'app mais il manque plusieurs fonctionnalités importantes mentionnées dans le cahier des charges.',
        timestamp: '2024-02-14T10:30:00Z',
        type: 'text',
      },
      {
        id: '8',
        transactionId: '3',
        senderId: '15',
        senderName: 'DigitalCraft Studio',
        message: 'Bonjour, pouvez-vous nous préciser quelles fonctionnalités manquent exactement ? Nous allons corriger cela rapidement.',
        timestamp: '2024-02-14T14:15:00Z',
        type: 'text',
      },
      {
        id: '9',
        transactionId: '3',
        senderId: '1',
        senderName: 'Alexandre Martin',
        message: 'Il manque: - Système de notifications push\n- Paiements par Apple Pay/Google Pay\n- Mode hors ligne\n- Chat en temps réel\n\nDe plus, l\'app crash régulièrement sur iOS.',
        timestamp: '2024-02-14T15:45:00Z',
        type: 'text',
      },
      {
        id: '10',
        transactionId: '3',
        senderId: '15',
        senderName: 'DigitalCraft Studio',
        message: 'Nous comprenons votre frustration. Ces fonctionnalités étaient prévues pour la phase 2. Nous proposons un délai supplémentaire de 3 semaines sans coût additionnel.',
        timestamp: '2024-02-15T09:20:00Z',
        type: 'text',
      },
      {
        id: '11',
        transactionId: '3',
        senderId: '1',
        senderName: 'Alexandre Martin',
        message: 'Non, ces fonctionnalités étaient clairement dans le contrat initial. Les délais sont déjà dépassés de 4 semaines. Je demande l\'ouverture d\'un litige.',
        timestamp: '2024-02-15T11:00:00Z',
        type: 'text',
      },
      {
        id: '12',
        transactionId: '3',
        senderId: 'system',
        senderName: 'SecureTransact',
        message: 'Un litige a été ouvert pour cette transaction. Notre équipe de médiation examine le dossier. Délai de réponse: 5-7 jours ouvrés.',
        timestamp: '2024-02-16T08:00:00Z',
        type: 'system',
      },
    ],
    '7': [
      {
        id: '13',
        transactionId: '7',
        senderId: '16',
        senderName: 'Prof. Laurent Durand',
        message: 'Bonjour Julie ! J\'ai préparé un programme sur mesure pour votre préparation HEC. Quand souhaitez-vous commencer les cours ?',
        timestamp: '2024-02-14T18:30:00Z',
        type: 'text',
      },
      {
        id: '14',
        transactionId: '7',
        senderId: '13',
        senderName: 'Julie Petit',
        message: 'Bonjour ! Dès que possible svp, j\'ai mes concours dans 3 mois. Pouvons-nous faire 2 séances par semaine ?',
        timestamp: '2024-02-14T19:15:00Z',
        type: 'text',
      },
      {
        id: '15',
        transactionId: '7',
        senderId: '16',
        senderName: 'Prof. Laurent Durand',
        message: 'Parfait ! Je propose mardi et vendredi 18h-19h30. J\'envoie le programme détaillé par email. Première séance mardi prochain ?',
        timestamp: '2024-02-14T20:00:00Z',
        type: 'text',
      },
      {
        id: '16',
        transactionId: '7',
        senderId: 'system',
        senderName: 'SecureTransact',
        message: 'Service programmé pour démarrer le 20/02/2024. Première session confirmée.',
        timestamp: '2024-02-17T10:00:00Z',
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