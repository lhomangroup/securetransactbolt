import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de l'URL de base selon l'environnement
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // En mode web/navigateur
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:5000`;
    }
    
    // Support pour Replit et autres environnements
    if (hostname.includes('replit') || hostname.includes('repl.co')) {
      // Dans Replit, utiliser le même protocole que le frontend
      // et remplacer le port par 5000
      const baseHostname = hostname.replace(/:\d+$/, '');
      return `${protocol}//${baseHostname}:5000`;
    }
    
    // Pour les autres environnements, utiliser le même protocole
    return `${protocol}//${hostname}:5000`;
  }
  // En mode natif ou serveur
  return 'http://0.0.0.0:5000';
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);

// Configuration pour les requêtes
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    console.log(`📡 API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Si on ne peut pas parser la réponse JSON
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ API Request failed:', error);
    throw error;
  }
};

export { apiRequest, API_BASE_URL };

class ApiService {
  private static async getAuthHeader() {
    const token = await AsyncStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    const authHeaders = await this.getAuthHeader();

    try {
      console.log(`📡 Making request to: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      });

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = 'Erreur serveur';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.log('❌ Error response:', errorData);
        } catch (e) {
          // Si on ne peut pas parser la réponse JSON, utiliser le message par défaut
          if (response.status === 401) {
            errorMessage = 'Email ou mot de passe incorrect';
          } else if (response.status === 400) {
            errorMessage = 'Données invalides';
          } else if (response.status >= 500) {
            errorMessage = 'Erreur du serveur. Veuillez réessayer.';
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);
      return data;
    } catch (error: any) {
      console.error('❌ Request error:', error);
      
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.');
      }
      throw error;
    }
  }

  // Test de connectivité
  static async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      console.log('✅ Serveur accessible:', data);
      return true;
    } catch (error) {
      console.error('❌ Serveur non accessible:', error);
      return false;
    }
  }

  // Test de la base de données
  static async testDatabase() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/db-test`);
      const data = await response.json();
      console.log('✅ Base de données accessible:', data);
      return true;
    } catch (error) {
      console.error('❌ Base de données non accessible:', error);
      return false;
    }
  }

  // Authentification
  static async login(email: string, password: string) {
    try {
      console.log('🔐 Tentative de connexion avec:', email);
      
      // Test de connectivité avant la requête
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.');
      }
      
      const data = await this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success && data.token) {
        await AsyncStorage.setItem('authToken', data.token);
        console.log('✅ Connexion réussie, token sauvegardé');
        return data.user;
      } else {
        throw new Error(data.error || 'Erreur de connexion');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion:', error);

      // Gestion des erreurs réseau
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch') || error.message.includes('serveur')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré et accessible.');
      }

      // Gestion des erreurs de base de données
      if (error.message.includes('Base de données non disponible') || error.message.includes('PostgreSQL')) {
        throw new Error('Service temporairement indisponible. Vérifiez la configuration de la base de données.');
      }

      // Gestion des erreurs d'authentification
      if (error.message.includes('Email ou mot de passe incorrect')) {
        throw new Error('Email ou mot de passe incorrect. Veuillez vérifier vos informations.');
      }

      // Erreur générique
      throw new Error(error.message || 'Une erreur est survenue lors de la connexion');
    }
  }

  static async register(userData: any) {
    try {
      console.log('📝 Tentative d\'inscription avec:', userData.email);
      
      // Test de connectivité avant la requête
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.');
      }

      // Test de la base de données
      const dbConnected = await this.testDatabase();
      if (!dbConnected) {
        throw new Error('Base de données non disponible. Vérifiez la configuration PostgreSQL.');
      }
      
      const data = await this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (data.success && data.token) {
        await AsyncStorage.setItem('authToken', data.token);
        console.log('✅ Inscription réussie, token sauvegardé');
        return data.user;
      } else {
        throw new Error(data.error || 'Erreur lors de la création du compte');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'inscription:', error);

      // Gestion des erreurs réseau
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch') || error.message.includes('serveur')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré et accessible.');
      }

      // Gestion des erreurs de base de données
      if (error.message.includes('Base de données non disponible') || error.message.includes('PostgreSQL') || error.message.includes('non initialisée')) {
        throw new Error('Base de données non disponible. Vérifiez la configuration PostgreSQL et que les tables sont créées.');
      }

      // Gestion des erreurs de validation
      if (error.message.includes('email existe déjà')) {
        throw new Error('Un compte avec cet email existe déjà. Utilisez un autre email ou connectez-vous.');
      }

      if (error.message.includes('champs obligatoires')) {
        throw new Error('Tous les champs obligatoires doivent être remplis.');
      }

      if (error.message.includes('Format d\'email invalide')) {
        throw new Error('Le format de l\'email n\'est pas valide.');
      }

      if (error.message.includes('mot de passe doit contenir')) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
      }

      // Erreur générique
      throw new Error(error.message || 'Une erreur est survenue lors de la création du compte');
    }
  }

  static async logout() {
    await AsyncStorage.removeItem('authToken');
  }

  // Utilisateurs
  static async getUserById(id: string) {
    return this.request(`/api/users/${id}`);
  }

  static async updateUser(id: string, userData: any) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Transactions
  static async getAllTransactions() {
    return this.request('/api/transactions');
  }

  static async getUserTransactions(userId: string) {
    return this.request(`/api/transactions/user/${userId}`);
  }

  static async createTransaction(transactionData: any) {
    return this.request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  static async updateTransactionStatus(id: string, status: string, disputeReason?: string) {
    return this.request(`/api/transactions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, disputeReason }),
    });
  }

  // Messages
  static async getTransactionMessages(transactionId: string) {
    return this.request(`/api/transactions/${transactionId}/messages`);
  }

  static async createMessage(messageData: any) {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }
}

export default ApiService;