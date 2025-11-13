/**
 * Modèle LoyaltyCard pour la gestion des cartes fidélité
 */

import { generateId, toTimestamp } from '../config/database.js';

export class LoyaltyCard {
  constructor(db) {
    this.db = db;
  }

  /**
   * Génère un numéro de carte unique
   */
  generateCardNumber() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `CARD-${timestamp}-${random}`;
  }

  /**
   * Crée une nouvelle carte fidélité
   */
  async create({
    establishmentId,
    customerId,
    cardNumber,
    cardCode,
    cardType = 'physical',
    photoUrl,
    pointsBalance = 0,
  }) {
    const id = generateId();
    const now = toTimestamp();
    const finalCardNumber = cardNumber || this.generateCardNumber();

    await this.db.prepare(
      `INSERT INTO loyalty_cards (
        id, establishment_id, customer_id, card_number, card_code, card_type, 
        photo_url, status, points_balance, total_points_earned, total_points_spent, 
        created_at, updated_at
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      establishmentId,
      customerId || null,
      finalCardNumber,
      cardCode || null,
      cardType,
      photoUrl || null,
      'active',
      pointsBalance,
      0,
      0,
      now,
      now
    ).run();

    return this.findById(id);
  }

  /**
   * Trouve une carte par ID
   */
  async findById(id) {
    const result = await this.db.prepare(
      `SELECT lc.*, c.name as customer_name, c.email as customer_email
       FROM loyalty_cards lc
       LEFT JOIN customers c ON lc.customer_id = c.id
       WHERE lc.id = ?`
    ).bind(id).first();

    return result || null;
  }

  /**
   * Trouve une carte par numéro
   */
  async findByCardNumber(cardNumber) {
    const result = await this.db.prepare(
      `SELECT lc.*, c.name as customer_name, c.email as customer_email
       FROM loyalty_cards lc
       LEFT JOIN customers c ON lc.customer_id = c.id
       WHERE lc.card_number = ?`
    ).bind(cardNumber).first();

    return result || null;
  }

  /**
   * Trouve une carte par code (QR/barcode)
   */
  async findByCardCode(cardCode) {
    const result = await this.db.prepare(
      `SELECT lc.*, c.name as customer_name, c.email as customer_email
       FROM loyalty_cards lc
       LEFT JOIN customers c ON lc.customer_id = c.id
       WHERE lc.card_code = ?`
    ).bind(cardCode).first();

    return result || null;
  }

  /**
   * Liste toutes les cartes d'un établissement
   */
  async findByEstablishmentId(establishmentId, { status, limit, offset } = {}) {
    let query = `SELECT lc.*, c.name as customer_name, c.email as customer_email
                 FROM loyalty_cards lc
                 LEFT JOIN customers c ON lc.customer_id = c.id
                 WHERE lc.establishment_id = ?`;
    const params = [establishmentId];

    if (status) {
      query += ' AND lc.status = ?';
      params.push(status);
    }

    query += ' ORDER BY lc.created_at DESC';

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
   * Liste les cartes d'un client
   */
  async findByCustomerId(customerId) {
    const result = await this.db.prepare(
      `SELECT * FROM loyalty_cards 
       WHERE customer_id = ? 
       ORDER BY created_at DESC`
    ).bind(customerId).all();

    return result.results || [];
  }

  /**
   * Associe une carte à un client
   */
  async linkToCustomer(cardId, customerId) {
    await this.db.prepare(
      'UPDATE loyalty_cards SET customer_id = ?, updated_at = ? WHERE id = ?'
    ).bind(customerId, toTimestamp(), cardId).run();

    return this.findById(cardId);
  }

  /**
   * Met à jour le solde de points
   */
  async updatePoints(cardId, points, transactionType) {
    const card = await this.findById(cardId);
    if (!card) return null;

    let newBalance = card.points_balance;
    let totalEarned = card.total_points_earned;
    let totalSpent = card.total_points_spent;

    if (transactionType === 'earn' || transactionType === 'adjust') {
      newBalance += points;
      if (transactionType === 'earn') {
        totalEarned += points;
      }
    } else if (transactionType === 'spend') {
      newBalance = Math.max(0, newBalance - points);
      totalSpent += points;
    } else if (transactionType === 'expire') {
      newBalance = Math.max(0, newBalance - points);
    }

    await this.db.prepare(
      `UPDATE loyalty_cards 
       SET points_balance = ?, total_points_earned = ?, total_points_spent = ?, updated_at = ?
       WHERE id = ?`
    ).bind(newBalance, totalEarned, totalSpent, toTimestamp(), cardId).run();

    return this.findById(cardId);
  }

  /**
   * Met à jour une carte
   */
  async update(id, data) {
    const updates = [];
    const values = [];

    const allowedFields = ['status', 'card_code', 'photo_url', 'expires_at'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = ?');
    values.push(toTimestamp());
    values.push(id);

    await this.db.prepare(
      `UPDATE loyalty_cards SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    return this.findById(id);
  }

  /**
   * Supprime une carte
   */
  async delete(id) {
    await this.db.prepare('DELETE FROM loyalty_cards WHERE id = ?').bind(id).run();
    return true;
  }
}

