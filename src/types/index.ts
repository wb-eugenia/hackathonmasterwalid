/**
 * Types TypeScript pour l'application
 */

// Types pour l'authentification
export interface User {
  email: string;
  password: string;
}

// Types pour les établissements (restaurants)
export interface Restaurant {
  id: string;
  name: string;
  department: string;
  address?: string;
  placeId?: string; // ID Google Places (pour le scrapper réel)
}

// Alias pour compatibilité
export type Establishment = Restaurant;

// Types pour les avis
export interface Review {
  id: string;
  text: string;
  authorName: string;
  rating: number; // Nombre d'étoiles (1-5)
  date: string; // Format ISO ou date lisible
  sentiment?: 'positive' | 'neutral' | 'negative'; // Pour l'analyse de sentiment future
}

// Types pour le contexte d'authentification
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean | Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Types pour le contexte de l'application
export interface AppContextType {
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  totalReviewsCount: number;
  setTotalReviewsCount: (count: number) => void;
}


