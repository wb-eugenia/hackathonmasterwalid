/**
 * Service API pour le système de fidélité
 */

import { Customer, LoyaltyCard, LoyaltyTransaction } from '../types/loyalty';
import { apiRequest } from './apiService';

// ===== Clients =====

export const customerService = {
  async list(establishmentId: string, search?: string): Promise<Customer[]> {
    const params = new URLSearchParams({ establishmentId });
    if (search) params.append('search', search);
    
    const data = await apiRequest<{ customers: Customer[] }>(`/customers?${params.toString()}`);
    return data.customers;
  },

  async getById(id: string): Promise<Customer> {
    const data = await apiRequest<{ customer: Customer }>(`/customers/${id}`);
    return data.customer;
  },

  async create(customer: Partial<Customer>): Promise<Customer> {
    const data = await apiRequest<{ customer: Customer }>('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
    return data.customer;
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    const data = await apiRequest<{ customer: Customer }>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.customer;
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

// ===== Cartes fidélité =====

export const loyaltyCardService = {
  async list(establishmentId: string, status?: string): Promise<LoyaltyCard[]> {
    const params = new URLSearchParams({ establishmentId });
    if (status) params.append('status', status);
    
    const data = await apiRequest<{ cards: LoyaltyCard[] }>(`/loyalty/cards?${params.toString()}`);
    return data.cards;
  },

  async getById(id: string): Promise<LoyaltyCard> {
    const data = await apiRequest<{ card: LoyaltyCard }>(`/loyalty/cards/${id}`);
    return data.card;
  },

  async create(card: Partial<LoyaltyCard>): Promise<LoyaltyCard> {
    const data = await apiRequest<{ card: LoyaltyCard }>('/loyalty/cards', {
      method: 'POST',
      body: JSON.stringify(card),
    });
    return data.card;
  },

  async scan(establishmentId: string, imageBase64: string, scanType?: 'qr' | 'barcode'): Promise<{ cardNumber: string | null; cardCode: string | null }> {
    const data = await apiRequest<{ extractedInfo: { cardNumber: string | null; cardCode: string | null } }>('/loyalty/cards/scan', {
      method: 'POST',
      body: JSON.stringify({ establishmentId, imageBase64, scanType }),
    });
    return data.extractedInfo;
  },

  async linkToCustomer(cardId: string, customerId: string): Promise<LoyaltyCard> {
    const data = await apiRequest<{ card: LoyaltyCard }>(`/loyalty/cards/${cardId}/link`, {
      method: 'POST',
      body: JSON.stringify({ customerId }),
    });
    return data.card;
  },

  async addPoints(cardId: string, points: number, description?: string, reference?: string): Promise<{ card: LoyaltyCard; transaction: LoyaltyTransaction }> {
    const data = await apiRequest<{ card: LoyaltyCard; transaction: LoyaltyTransaction }>(`/loyalty/cards/${cardId}/points`, {
      method: 'POST',
      body: JSON.stringify({
        transactionType: 'earn',
        points,
        description,
        reference,
      }),
    });
    return data;
  },

  async spendPoints(cardId: string, points: number, description?: string, reference?: string): Promise<{ card: LoyaltyCard; transaction: LoyaltyTransaction }> {
    const data = await apiRequest<{ card: LoyaltyCard; transaction: LoyaltyTransaction }>(`/loyalty/cards/${cardId}/points`, {
      method: 'POST',
      body: JSON.stringify({
        transactionType: 'spend',
        points,
        description,
        reference,
      }),
    });
    return data;
  },

  async getTransactions(cardId: string, limit?: number, offset?: number): Promise<{ transactions: LoyaltyTransaction[]; total: number }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    return apiRequest<{ transactions: LoyaltyTransaction[]; total: number }>(`/loyalty/cards/${cardId}/transactions?${params.toString()}`);
  },
};

