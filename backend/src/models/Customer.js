/**
 * Modèle Customer pour la gestion des clients
 */

import { generateId, toTimestamp } from '../config/database.js';

export class Customer {
  constructor(db) {
    this.db = db;
  }

  /**
   * Crée un nouveau client
   */
  async create({ establishmentId, name, email, phone }) {
    const id = generateId();
    const now = toTimestamp();

    await this.db.prepare(
      `INSERT INTO customers (id, establishment_id, name, email, phone, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, establishmentId, name, email || null, phone || null, now, now).run();

    return this.findById(id);
  }

  /**
   * Trouve un client par ID
   */
  async findById(id) {
    const result = await this.db.prepare(
      'SELECT * FROM customers WHERE id = ?'
    ).bind(id).first();

    return result || null;
  }

  /**
   * Trouve un client par email
   */
  async findByEmail(email, establishmentId) {
    const result = await this.db.prepare(
      'SELECT * FROM customers WHERE email = ? AND establishment_id = ?'
    ).bind(email, establishmentId).first();

    return result || null;
  }

  /**
   * Liste tous les clients d'un établissement
   */
  async findByEstablishmentId(establishmentId, { limit, offset } = {}) {
    let query = 'SELECT * FROM customers WHERE establishment_id = ? ORDER BY created_at DESC';
    const params = [establishmentId];

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
   * Recherche des clients par nom ou email
   */
  async search(establishmentId, searchTerm) {
    const result = await this.db.prepare(
      `SELECT * FROM customers 
       WHERE establishment_id = ? 
       AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)
       ORDER BY name ASC
       LIMIT 50`
    ).bind(
      establishmentId,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`
    ).all();

    return result.results || [];
  }

  /**
   * Met à jour un client
   */
  async update(id, data) {
    const updates = [];
    const values = [];

    const allowedFields = ['name', 'email', 'phone'];
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
      `UPDATE customers SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    return this.findById(id);
  }

  /**
   * Supprime un client
   */
  async delete(id) {
    await this.db.prepare('DELETE FROM customers WHERE id = ?').bind(id).run();
    return true;
  }
}

