/**
 * Context pour la gestion de l'authentification
 * Gère l'état de connexion de l'utilisateur
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '../types';
import { authService } from '../services/apiService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifie si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && authService.isAuthenticated()) {
      setUser({ email: currentUser.email, password: '' }); // Ne stocke pas le mot de passe
    }
    setIsLoading(false);
  }, []);

  /**
   * Tente de connecter l'utilisateur avec email et mot de passe
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @returns Promise<boolean> - true si la connexion réussit, false sinon
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      setUser({ email: response.user.email, password: '' });
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  };

  /**
   * Déconnecte l'utilisateur
   */
  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login: login as any, // Type casting pour compatibilité
    logout,
    isAuthenticated: user !== null,
  };

  // Affiche un loader pendant la vérification de l'authentification
  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook pour accéder au contexte d'authentification
 * @throws Error si utilisé en dehors d'un AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


