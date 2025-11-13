/**
 * Context pour la gestion de l'état global de l'application
 * Gère le restaurant sélectionné, les avis et les statistiques
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppContextType, Restaurant, Review } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviewsCount, setTotalReviewsCount] = useState<number>(0);

  const value: AppContextType = {
    selectedRestaurant,
    setSelectedRestaurant,
    reviews,
    setReviews,
    totalReviewsCount,
    setTotalReviewsCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook pour accéder au contexte de l'application
 * @throws Error si utilisé en dehors d'un AppProvider
 */
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};


