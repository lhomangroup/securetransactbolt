
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserService, CreateUserData } from '@/services/userService';

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
        // Vérifier si un utilisateur est déjà connecté
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          const userData = await UserService.getUserById(storedUserId);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur par email
      const userData = await UserService.getUserByEmail(email);
      
      if (userData) {
        // Dans une vraie app, on vérifierait le mot de passe hashé
        // Pour la démo, on accepte tous les logins
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('userId', userData.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      
      const newUser = await UserService.createUser(userData);
      
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('userId', newUser.id);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userId');
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (user) {
      try {
        const updatedUser = await UserService.updateUser(user.id, userData);
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
