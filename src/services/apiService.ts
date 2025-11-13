/**
 * Service API pour communiquer avec le backend
 * Remplace les services mockés par des appels réels au backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Récupère le token d'authentification depuis le localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

/**
 * Effectue une requête API avec authentification
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(error.error || `Erreur ${response.status}`);
  }

  return response.json();
}

// ===== Authentification =====

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    email_verified?: boolean;
  };
  token: string;
  message?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/auth/verify-email?token=${token}`);
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!getAuthToken();
  },
};

// ===== Établissements =====

export interface Establishment {
  id: string;
  user_id: string;
  name: string;
  google_place_id?: string;
  address?: string;
  department?: string;
  menu_photo_url?: string;
  created_at: number;
  updated_at: number;
}

export const establishmentService = {
  async list(): Promise<Establishment[]> {
    const data = await apiRequest<{ establishments: Establishment[] }>('/establishments');
    return data.establishments;
  },

  async getById(id: string): Promise<Establishment> {
    const data = await apiRequest<{ establishment: Establishment }>(`/establishments/${id}`);
    return data.establishment;
  },

  async create(establishment: Partial<Establishment>): Promise<Establishment> {
    const data = await apiRequest<{ establishment: Establishment }>('/establishments', {
      method: 'POST',
      body: JSON.stringify(establishment),
    });
    return data.establishment;
  },

  async update(id: string, updates: Partial<Establishment>): Promise<Establishment> {
    const data = await apiRequest<{ establishment: Establishment }>(`/establishments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.establishment;
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/establishments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== User Establishments (Multi-établissements) =====

export interface UserEstablishment {
  id: string;
  user_id: string;
  establishment_id: string;
  role: 'owner' | 'admin' | 'collaborator';
  establishment_name?: string;
  establishment_address?: string;
  department?: string;
  created_at: number;
}

export const userEstablishmentService = {
  async list(): Promise<UserEstablishment[]> {
    const data = await apiRequest<{ establishments: UserEstablishment[] }>('/user-establishments');
    return data.establishments;
  },

  async link(establishmentId: string, role?: 'owner' | 'admin' | 'collaborator'): Promise<UserEstablishment> {
    const data = await apiRequest<{ userEstablishment: UserEstablishment }>('/user-establishments', {
      method: 'POST',
      body: JSON.stringify({ establishmentId, role }),
    });
    return data.userEstablishment;
  },
};

// ===== Onboarding =====

export interface OnboardingConfig {
  openingHours?: Record<string, { open: string; close: string; closed: boolean }>;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  menuPhotoUrl?: string;
  notificationSettings?: {
    negativeReviews?: boolean;
    lowRating?: boolean;
    newReviews?: boolean;
  };
}

export const onboardingService = {
  async getConfig(establishmentId: string) {
    const data = await apiRequest<{ config: any }>(`/onboarding/establishment/${establishmentId}`);
    return data.config;
  },

  async completeOnboarding(establishmentId: string, config: OnboardingConfig) {
    return apiRequest(`/onboarding/establishment/${establishmentId}`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },
};

// ===== Avis =====

export interface Review {
  id: string;
  establishment_id: string;
  google_review_id?: string;
  text: string;
  author_name: string;
  rating: number;
  date: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  category?: string;
  scraped_at: number;
}

export interface ReviewFilters {
  rating?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const reviewService = {
  async getByEstablishment(
    establishmentId: string,
    filters: ReviewFilters = {}
  ): Promise<{ reviews: Review[]; total: number }> {
    const params = new URLSearchParams();
    if (filters.rating) params.append('rating', filters.rating.toString());
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const endpoint = `/reviews/establishment/${establishmentId}${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{ reviews: Review[]; total: number }>(endpoint);
  },

  async getStatistics(establishmentId: string) {
    const data = await apiRequest<{ statistics: any }>(
      `/reviews/establishment/${establishmentId}/statistics`
    );
    return data.statistics;
  },
};

// ===== Scraping =====

export const scrapingService = {
  async scrapeEstablishment(establishmentId: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/scraping/establishment/${establishmentId}`, {
      method: 'POST',
    });
  },
};

// ===== Analyse =====

export const analysisService = {
  async getProfitability(
    establishmentId: string,
    revenue?: number,
    costs?: number
  ) {
    const params = new URLSearchParams();
    if (revenue) params.append('revenue', revenue.toString());
    if (costs) params.append('costs', costs.toString());

    const queryString = params.toString();
    const endpoint = `/analysis/establishment/${establishmentId}/profitability${queryString ? `?${queryString}` : ''}`;
    
    const data = await apiRequest<{ profitability: any }>(endpoint);
    return data.profitability;
  },

  async generateResponse(reviewId: string): Promise<{ response: string }> {
    const data = await apiRequest<{ response: string }>(`/analysis/review/${reviewId}/generate-response`, {
      method: 'POST',
    });
    return data;
  },
};

// ===== Données financières =====

export const financialService = {
  async create(establishmentId: string, data: { date: string; revenue?: number; costs?: number; profit?: number }) {
    return apiRequest(`/financial/establishment/${establishmentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getByEstablishment(establishmentId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    return apiRequest<{ financialData: any[] }>(`/financial/establishment/${establishmentId}${queryString ? `?${queryString}` : ''}`);
  },
};
