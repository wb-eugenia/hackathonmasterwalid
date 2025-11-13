/**
 * Modèle UserEstablishment pour la gestion des rôles et multi-établissements
 */

import { generateId, toTimestamp } from '../config/database.js';

export class UserEstablishment {
  constructor(db) {
    this.db = db;
  }

  /**
   * Crée une liaison utilisateur-établissement
   */
  async create({ userId, establishmentId, role = 'collaborator' }) {
    const id = generateId();
    const now = toTimestamp();

    // Vérifie si la liaison existe déjà
    const existing = await this.findByUserAndEstablishment(userId, establishmentId);
    if (existing) {
      return existing;
    }

    await this.db.prepare(
      `INSERT INTO user_establishments (id, user_id, establishment_id, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, userId, establishmentId, role, now, now).run();

    return this.findById(id);
  }

  /**
   * Trouve une liaison par ID
   */
  async findById(id) {
    const result = await this.db.prepare(
      `SELECT ue.*, e.name as establishment_name, e.address as establishment_address
       FROM user_establishments ue
       JOIN establishments e ON ue.establishment_id = e.id
       WHERE ue.id = ?`
    ).bind(id).first();

    return result || null;
  }

  /**
   * Trouve une liaison par utilisateur et établissement
   */
  async findByUserAndEstablishment(userId, establishmentId) {
    const result = await this.db.prepare(
      'SELECT * FROM user_establishments WHERE user_id = ? AND establishment_id = ?'
    ).bind(userId, establishmentId).first();

    return result || null;
  }

  /**
   * Liste tous les établissements d'un utilisateur
   */
  async findByUserId(userId) {
    const result = await this.db.prepare(
      `SELECT ue.*, e.name as establishment_name, e.address as establishment_address, e.department
       FROM user_establishments ue
       JOIN establishments e ON ue.establishment_id = e.id
       WHERE ue.user_id = ?
       ORDER BY ue.created_at DESC`
    ).bind(userId).all();

    return result.results || [];
  }

  /**
   * Liste tous les utilisateurs d'un établissement
   */
  async findByEstablishmentId(establishmentId) {
    const result = await this.db.prepare(
      `SELECT ue.*, u.email, u.name as user_name
       FROM user_establishments ue
       JOIN users u ON ue.user_id = u.id
       WHERE ue.establishment_id = ?
       ORDER BY ue.role DESC, ue.created_at ASC`
    ).bind(establishmentId).all();

    return result.results || [];
  }

  /**
   * Met à jour le rôle d'un utilisateur
   */
  async updateRole(id, role) {
    await this.db.prepare(
      'UPDATE user_establishments SET role = ?, updated_at = ? WHERE id = ?'
    ).bind(role, toTimestamp(), id).run();

    return this.findById(id);
  }

  /**
   * Supprime une liaison
   */
  async delete(id) {
    await this.db.prepare('DELETE FROM user_establishments WHERE id = ?').bind(id).run();
    return true;
  }

  /**
   * Vérifie si un utilisateur a un rôle spécifique sur un établissement
   */
  async hasRole(userId, establishmentId, requiredRole) {
    const roles = ['collaborator', 'admin', 'owner'];
    const userRole = await this.findByUserAndEstablishment(userId, establishmentId);
    
    if (!userRole) return false;

    const userRoleIndex = roles.indexOf(userRole.role);
    const requiredRoleIndex = roles.indexOf(requiredRole);

    return userRoleIndex >= requiredRoleIndex;
  }
}

