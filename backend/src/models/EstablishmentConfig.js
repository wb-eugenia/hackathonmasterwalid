/**
 * Modèle EstablishmentConfig pour la configuration des établissements
 */

import { generateId, toTimestamp } from '../config/database.js';

export class EstablishmentConfig {
  constructor(db) {
    this.db = db;
  }

  /**
   * Crée ou met à jour la configuration
   */
  async upsert({ establishmentId, openingHours, contactEmail, contactPhone, website, menuPhotoUrl, notificationSettings, onboardingCompleted }) {
    const existing = await this.findByEstablishmentId(establishmentId);
    const now = toTimestamp();

    if (existing) {
      // Mise à jour
      const updates = [];
      const values = [];

      if (openingHours !== undefined) {
        updates.push('opening_hours = ?');
        values.push(typeof openingHours === 'string' ? openingHours : JSON.stringify(openingHours));
      }
      if (contactEmail !== undefined) {
        updates.push('contact_email = ?');
        values.push(contactEmail);
      }
      if (contactPhone !== undefined) {
        updates.push('contact_phone = ?');
        values.push(contactPhone);
      }
      if (website !== undefined) {
        updates.push('website = ?');
        values.push(website);
      }
      if (menuPhotoUrl !== undefined) {
        updates.push('menu_photo_url = ?');
        values.push(menuPhotoUrl);
      }
      if (notificationSettings !== undefined) {
        updates.push('notification_settings = ?');
        values.push(typeof notificationSettings === 'string' ? notificationSettings : JSON.stringify(notificationSettings));
      }
      if (onboardingCompleted !== undefined) {
        updates.push('onboarding_completed = ?');
        values.push(onboardingCompleted ? 1 : 0);
      }

      if (updates.length > 0) {
        updates.push('updated_at = ?');
        values.push(now);
        values.push(establishmentId);

        await this.db.prepare(
          `UPDATE establishment_config SET ${updates.join(', ')} WHERE establishment_id = ?`
        ).bind(...values).run();
      }

      return this.findByEstablishmentId(establishmentId);
    } else {
      // Création
      const id = generateId();
      await this.db.prepare(
        `INSERT INTO establishment_config (
          id, establishment_id, opening_hours, contact_email, contact_phone, 
          website, menu_photo_url, notification_settings, onboarding_completed, created_at, updated_at
        )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id,
        establishmentId,
        openingHours ? (typeof openingHours === 'string' ? openingHours : JSON.stringify(openingHours)) : null,
        contactEmail || null,
        contactPhone || null,
        website || null,
        menuPhotoUrl || null,
        notificationSettings ? (typeof notificationSettings === 'string' ? notificationSettings : JSON.stringify(notificationSettings)) : null,
        onboardingCompleted ? 1 : 0,
        now,
        now
      ).run();

      return this.findByEstablishmentId(establishmentId);
    }
  }

  /**
   * Trouve la configuration d'un établissement
   */
  async findByEstablishmentId(establishmentId) {
    const result = await this.db.prepare(
      'SELECT * FROM establishment_config WHERE establishment_id = ?'
    ).bind(establishmentId).first();

    if (result) {
      // Parse JSON fields
      if (result.opening_hours) {
        try {
          result.opening_hours = JSON.parse(result.opening_hours);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
      if (result.notification_settings) {
        try {
          result.notification_settings = JSON.parse(result.notification_settings);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
    }

    return result || null;
  }

  /**
   * Marque l'onboarding comme complété
   */
  async completeOnboarding(establishmentId) {
    return this.upsert({ establishmentId, onboardingCompleted: true });
  }
}

