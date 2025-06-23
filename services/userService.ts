import ApiService from './apiService';
import { User } from '@/contexts/AuthContext';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: 'buyer' | 'seller' | 'both';
}

export class UserService {
  static async createUser(userData: CreateUserData): Promise<User> {
    return ApiService.register(userData);
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      // Cette méthode n'est plus directement disponible via l'API pour des raisons de sécurité
      // Elle est maintenant gérée via la route de login
      return null;
    } catch (error) {
      return null;
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      return await ApiService.getUserById(id);
    } catch (error) {
      return null;
    }
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return ApiService.updateUser(id, userData);
  }
}