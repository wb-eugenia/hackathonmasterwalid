/**
 * Modèle Establishment pour la gestion des restaurants
 */

import { generateId, toTimestamp } from '../config/database.js';

export class Establishment {
  constructor(db) {
    this.db = db;
  }

  /**
   * Crée un nouvel établissement
   */
  async create({ userId, name, googlePlaceId, address, department, menuPhotoUrl }) {
    const id = generateId();
    const now = toTimestamp();

    await this.db.prepare(
      `INSERT INTO establishments (id, user_id, name, google_place_id, address, department, menu_photo_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      userId,
      name,
      googlePlaceId || null,
      address || null,
      department || null,
      menuPhotoUrl || null,
      now,
      now
    ).run();

    return this.findById(id);
  }

  /**
   * Trouve un établissement par ID
   */
  async findById(id) {
    const result = await this.db.prepare(
      'SELECT * FROM establishments WHERE id = ?'
    ).bind(id).first();

    return result || null;
  }

  /**
   * Trouve un établissement par Google Place ID
   */
  async findByGooglePlaceId(googlePlaceId) {
    const result = await this.db.prepare(
      'SELECT * FROM establishments WHERE google_place_id = ?'
    ).bind(googlePlaceId).first();

    return result || null;
  }

  /**
   * Liste tous les établissements d'un utilisateur
   */
  async findByUserId(userId) {
    const result = await this.db.prepare(
      'SELECT * FROM establishments WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();

    return result.results || [];
  }

  /**
   * Met à jour un établissement
   */
  async update(id, data) {
    const updates = [];
    const values = [];

    const allowedFields = ['name', 'address', 'department', 'menu_photo_url', 'google_place_id'];
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
      `UPDATE establishments SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    return this.findById(id);
  }

  /**
   * Supprime un établissement
   */
  async delete(id) {
    await this.db.prepare('DELETE FROM establishments WHERE id = ?').bind(id).run();
    return true;
  }
}

