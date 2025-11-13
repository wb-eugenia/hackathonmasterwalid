/**
 * Modèle Review pour la gestion des avis
 */

import { generateId, toTimestamp } from '../config/database.js';

export class Review {
  constructor(db) {
    this.db = db;
  }

  /**
   * Crée un nouvel avis
   */
  async create({
    establishmentId,
    googleReviewId,
    text,
    authorName,
    rating,
    date,
    sentiment,
    category,
  }) {
    const id = generateId();
    const now = toTimestamp();

    await this.db.prepare(
      `INSERT INTO reviews (id, establishment_id, google_review_id, text, author_name, rating, date, sentiment, category, scraped_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      establishmentId,
      googleReviewId || null,
      text,
      authorName,
      rating,
      date,
      sentiment || null,
      category || null,
      now
    ).run();

    return this.findById(id);
  }

  /**
   * Crée plusieurs avis en batch
   */
  async createBatch(reviews) {
    const now = toTimestamp();
    const stmt = this.db.prepare(
      `INSERT INTO reviews (id, establishment_id, google_review_id, text, author_name, rating, date, sentiment, category, scraped_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const batch = reviews.map((review) => {
      const id = generateId();
      return stmt.bind(
        id,
        review.establishmentId,
        review.googleReviewId || null,
        review.text,
        review.authorName,
        review.rating,
        review.date,
        review.sentiment || null,
        review.category || null,
        now
      );
    });

    await this.db.batch(batch);
    return reviews.length;
  }

  /**
   * Trouve un avis par ID
   */
  async findById(id) {
    const result = await this.db.prepare(
      'SELECT * FROM reviews WHERE id = ?'
    ).bind(id).first();

    return result || null;
  }

  /**
   * Trouve un avis par Google Review ID
   */
  async findByGoogleReviewId(googleReviewId) {
    const result = await this.db.prepare(
      'SELECT * FROM reviews WHERE google_review_id = ?'
    ).bind(googleReviewId).first();

    return result || null;
  }

  /**
   * Liste les avis d'un établissement avec filtres
   */
  async findByEstablishmentId(establishmentId, { rating, startDate, endDate, limit, offset } = {}) {
    let query = 'SELECT * FROM reviews WHERE establishment_id = ?';
    const params = [establishmentId];

    if (rating) {
      query += ' AND rating = ?';
      params.push(rating);
    }

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY rating DESC, date DESC';

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
   * Compte les avis d'un établissement
   */
  async countByEstablishmentId(establishmentId, { rating, startDate, endDate } = {}) {
    let query = 'SELECT COUNT(*) as count FROM reviews WHERE establishment_id = ?';
    const params = [establishmentId];

    if (rating) {
      query += ' AND rating = ?';
      params.push(rating);
    }

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    const result = await this.db.prepare(query).bind(...params).first();
    return result?.count || 0;
  }

  /**
   * Statistiques des avis d'un établissement
   */
  async getStatistics(establishmentId) {
    const stats = await this.db.prepare(
      `SELECT 
        COUNT(*) as total,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1,
        COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive,
        COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative,
        COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral
       FROM reviews 
       WHERE establishment_id = ?`
    ).bind(establishmentId).first();

    return stats || null;
  }
}

