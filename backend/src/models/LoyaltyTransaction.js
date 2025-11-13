/**
 * Modèle LoyaltyTransaction pour la gestion des transactions de points
 */

import { generateId, toTimestamp } from '../config/database.js';

export class LoyaltyTransaction {
  constructor(db) {
    this.db = db;
  }

  /**
   * Crée une nouvelle transaction
   */
  async create({
    loyaltyCardId,
    transactionType,
    points,
    description,
    reference,
    createdBy,
  }) {
    const id = generateId();
    const now = toTimestamp();

    await this.db.prepare(
      `INSERT INTO loyalty_transactions (
        id, loyalty_card_id, transaction_type, points, description, reference, created_by, created_at
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      loyaltyCardId,
      transactionType,
      points,
      description || null,
      reference || null,
      createdBy || null,
      now
    ).run();

    return this.findById(id);
  }

  /**
   * Trouve une transaction par ID
   */
  async findById(id) {
    const result = await this.db.prepare(
      'SELECT * FROM loyalty_transactions WHERE id = ?'
    ).bind(id).first();

    return result || null;
  }

  /**
   * Liste les transactions d'une carte
   */
  async findByCardId(loyaltyCardId, { limit, offset } = {}) {
    let query = 'SELECT * FROM loyalty_transactions WHERE loyalty_card_id = ? ORDER BY created_at DESC';
    const params = [loyaltyCardId];

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    if (offset) {
      query += ' OFFSET ?';
      params.push(offset);
    }

    const result = await this.db.prepare(query).bind(...params).all();
    return result.results || [];
  }

  /**
   * Historique complet d'une carte avec pagination
   */
  async getHistory(loyaltyCardId, { limit = 50, offset = 0 } = {}) {
    const result = await this.db.prepare(
      `SELECT * FROM loyalty_transactions 
       WHERE loyalty_card_id = ? 
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    ).bind(loyaltyCardId, limit, offset).all();

    const totalResult = await this.db.prepare(
      'SELECT COUNT(*) as total FROM loyalty_transactions WHERE loyalty_card_id = ?'
    ).bind(loyaltyCardId).first();

    return {
      transactions: result.results || [],
      total: totalResult?.total || 0,
    };
  }
}

