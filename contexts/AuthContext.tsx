
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
        console.log('🔍 Vérification du statut d\'authentification...');
        const token = await AsyncStorage.getItem('authToken');
        const storedUserId = await AsyncStorage.getItem('userId');
        
        console.log('📱 Token trouvé:', !!token);
        console.log('👤 User ID trouvé:', !!storedUserId);
        
        if (token && storedUserId) {
          try {
            const userData = await ApiService.getUserById(storedUserId);
            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
              console.log('✅ Utilisateur authentifié:', userData.name);
            } else {
              console.log('❌ Données utilisateur non trouvées');
              await AsyncStorage.multiRemove(['authToken', 'userId']);
            }
          } catch (error) {
            console.log('❌ Erreur lors de la récupération des données utilisateur:', error);
            await AsyncStorage.multiRemove(['authToken', 'userId']);
          }
        } else {
          console.log('ℹ️ Aucune session trouvée');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        // Si l'erreur est due à un token invalide, on nettoie le stockage
        await AsyncStorage.multiRemove(['authToken', 'userId']);
      } finally {
        console.log('🏁 Vérification d\'authentification terminée');
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔐 Début du processus de connexion...');
      
      const userData = await ApiService.login(email, password);
      
      if (userData) {
        console.log('✅ Données utilisateur reçues:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('userId', userData.id);
        console.log('✅ Connexion réussie dans AuthContext');
        console.log('🔄 État mis à jour - isAuthenticated:', true);
        return true;
      } else {
        throw new Error('Données utilisateur non reçues');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion dans AuthContext:', error);
      
      // Lancer l'erreur avec un message approprié
      const errorMessage = error.message || 'Une erreur inattendue est survenue lors de la connexion';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('📝 Début du processus d\'inscription...');
      
      const newUser = await ApiService.register(userData);
      
      if (newUser) {
        setUser(newUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('userId', newUser.id);
        console.log('✅ Inscription réussie dans AuthContext');
        return true;
      } else {
        throw new Error('Données utilisateur non reçues');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'inscription dans AuthContext:', error);
      
      // Lancer l'erreur avec un message approprié
      const errorMessage = error.message || 'Une erreur inattendue est survenue lors de la création du compte';
      throw new Error(errorMessage);
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
