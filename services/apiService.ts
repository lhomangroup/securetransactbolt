import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.NODE_ENV === 'production' || typeof window === 'undefined' 
  ? 'http://0.0.0.0:5000' 
  : `${window.location.protocol}//${window.location.hostname}:5000`;

// Configuration pour les requêtes
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = 'Erreur serveur';

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
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

      return await response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      }
      throw error;
    }
  }

  // Authentification
  static async login(email: string, password: string) {
    try {
      console.log('Tentative de connexion avec:', email);
      const data = await this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      await AsyncStorage.setItem('authToken', data.token);
      return data.user;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);

      // Gestion des erreurs de connexion
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      }

      // Gestion des erreurs de base de données
      if (error.message.includes('Base de données non disponible')) {
        throw new Error('Base de données non disponible. Veuillez configurer PostgreSQL dans Replit.');
      }

      throw error;
    }
  }

  static async register(userData: any) {
    try {
      console.log('Tentative d\'inscription avec:', userData.email);
      const data = await this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      await AsyncStorage.setItem('authToken', data.token);
      return data.user;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);

      // Gestion des erreurs de connexion
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      }

      // Gestion des erreurs de base de données
      if (error.message.includes('Base de données non disponible')) {
        throw new Error('Base de données non disponible. Veuillez configurer PostgreSQL dans Replit.');
      }

      throw error;
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