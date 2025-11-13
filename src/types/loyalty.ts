/**
 * Types pour le système de fidélité
 */

export interface Customer {
  id: string;
  establishment_id: string;
  name: string;
  email?: string;
  phone?: string;
  created_at: number;
  updated_at: number;
}

export interface LoyaltyCard {
  id: string;
  establishment_id: string;
  customer_id?: string;
  card_number: string;
  card_code?: string;
  card_type: 'physical' | 'virtual' | 'qr' | 'barcode';
  photo_url?: string;
  status: 'active' | 'inactive' | 'expired' | 'blocked';
  points_balance: number;
  total_points_earned: number;
  total_points_spent: number;
  created_at: number;
  updated_at: number;
  expires_at?: number;
  customer_name?: string;
  customer_email?: string;
}

export interface LoyaltyTransaction {
  id: string;
  loyalty_card_id: string;
  transaction_type: 'earn' | 'spend' | 'adjust' | 'expire';
  points: number;
  description?: string;
  reference?: string;
  created_by?: string;
  created_at: number;
}

export interface LoyaltyRule {
  id: string;
  establishment_id: string;
  name: string;
  description?: string;
  points_per_euro: number;
  points_per_visit: number;
  minimum_purchase?: number;
  reward_threshold?: number;
  reward_description?: string;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface Reward {
  id: string;
  establishment_id: string;
  name: string;
  description?: string;
  points_cost: number;
  reward_type: 'discount' | 'free_item' | 'cashback' | 'other';
  discount_percentage?: number;
  discount_amount?: number;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

