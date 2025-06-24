
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://0.0.0.0:5000/api';

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
        let errorMessage = 'Erreur API';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          errorMessage = `Erreur HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.');
      }
      throw error;
    }
  }

  // Authentification
  static async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    await AsyncStorage.setItem('authToken', response.token);
    return response.user;
  }

  static async register(userData: any) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    await AsyncStorage.setItem('authToken', response.token);
    return response.user;
  }

  static async logout() {
    await AsyncStorage.removeItem('authToken');
  }

  // Utilisateurs
  static async getUserById(id: string) {
    return this.request(`/users/${id}`);
  }

  static async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Transactions
  static async getAllTransactions() {
    return this.request('/transactions');
  }

  static async getUserTransactions(userId: string) {
    return this.request(`/transactions/user/${userId}`);
  }

  static async createTransaction(transactionData: any) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  static async updateTransactionStatus(id: string, status: string, disputeReason?: string) {
    return this.request(`/transactions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, disputeReason }),
    });
  }

  // Messages
  static async getTransactionMessages(transactionId: string) {
    return this.request(`/transactions/${transactionId}/messages`);
  }

  static async createMessage(messageData: any) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }
}

export default ApiService;
