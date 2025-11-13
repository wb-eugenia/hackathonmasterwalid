/**
 * Modèle User pour la gestion des utilisateurs
 */

import { generateId, toTimestamp } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User {
  constructor(db) {
    this.db = db;
  }

  /**
   * Crée un nouvel utilisateur
   */
  async create({ email, password, name }) {
    const id = generateId();
    const passwordHash = await bcrypt.hash(password, 10);
    const now = toTimestamp();

    await this.db.prepare(
      `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, email, passwordHash, name || null, now, now).run();

    return this.findById(id);
  }

  /**
   * Trouve un utilisateur par ID
   */
  async findById(id) {
    const result = await this.db.prepare(
      'SELECT id, email, name, created_at FROM users WHERE id = ?'
    ).bind(id).first();

    return result || null;
  }

  /**
   * Trouve un utilisateur par email
   */
  async findByEmail(email) {
    const result = await this.db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();

    return result || null;
  }

  /**
   * Vérifie le mot de passe
   */
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  /**
   * Met à jour un utilisateur
   */
  async update(id, data) {
    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.password !== undefined) {
      const passwordHash = await bcrypt.hash(data.password, 10);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (updates.length === 0) return this.findById(id);

    updates.push('updated_at = ?');
    values.push(toTimestamp());
    values.push(id);

    await this.db.prepare(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    return this.findById(id);
  }
}

