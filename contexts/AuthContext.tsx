import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

  // Simuler une vérification d'authentification au démarrage
  useEffect(() => {
    // Dans une vraie app, on vérifierait le token stocké localement
    const checkAuthStatus = async () => {
      // Simulation d'un utilisateur connecté pour les tests
      const demoUser: User = {
        id: '1',
        email: 'demo@secureTransact.com',
        name: 'Utilisateur Démo',
        phone: '+33 6 12 34 56 78',
        userType: 'both',
        rating: 4.8,
        totalTransactions: 15,
        joinedDate: '2023-01-15',
      };
      
      // Décommenter ces lignes pour simuler un utilisateur connecté
      // setUser(demoUser);
      // setIsAuthenticated(true);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData: User = {
        id: '1',
        email,
        name: 'Utilisateur Connecté',
        phone: '+33 6 12 34 56 78',
        userType: 'both',
        rating: 4.8,
        totalTransactions: 15,
        joinedDate: '2023-01-15',
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        userType: userData.userType,
        rating: 0,
        totalTransactions: 0,
        joinedDate: new Date().toISOString().split('T')[0],
      };
      
      setUser(newUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
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