
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '@/services/apiService';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: 'buyer' | 'seller' | 'both';
  rating: number;
  totalTransactions: number;
  joinedDate: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: 'buyer' | 'seller' | 'both';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const storedUserId = await AsyncStorage.getItem('userId');
        
        if (token && storedUserId) {
          const userData = await ApiService.getUserById(storedUserId);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        // Si l'erreur est due à un token invalide, on nettoie le stockage
        await AsyncStorage.multiRemove(['authToken', 'userId']);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const userData = await ApiService.login(email, password);
      
      setUser(userData);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('userId', userData.id);
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      
      // Lancer l'erreur pour que le composant puisse l'afficher
      if (error.message) {
        throw new Error(error.message);
      } else if (typeof error === 'string') {
        throw new Error(error);
      } else {
        throw new Error('Erreur de connexion au serveur. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      
      const newUser = await ApiService.register(userData);
      
      setUser(newUser);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('userId', newUser.id);
      return true;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      
      // Lancer l'erreur pour que le composant puisse l'afficher
      if (error.message) {
        throw new Error(error.message);
      } else if (typeof error === 'string') {
        throw new Error(error);
      } else {
        throw new Error('Erreur de connexion au serveur. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
      await AsyncStorage.multiRemove(['userId']);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = await ApiService.updateUser(user.id, userData);
        setUser(updatedUser);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
