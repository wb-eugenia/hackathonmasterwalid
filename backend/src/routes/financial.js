/**
 * Routes pour la gestion des données financières
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { Establishment } from '../models/Establishment.js';
import { generateId, toTimestamp } from '../config/database.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * POST /api/financial/establishment/:id
 * Enregistre des données financières pour un établissement
 */
router.post('/establishment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, revenue, costs, profit } = req.body;

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(id);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    if (establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const financialId = generateId();
    const now = toTimestamp();

    await req.db.prepare(
      `INSERT INTO financial_data (id, establishment_id, date, revenue, costs, profit, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      financialId,
      id,
      date || new Date().toISOString().split('T')[0],
      revenue || null,
      costs || null,
      profit || (revenue && costs ? revenue - costs : null),
      now
    ).run();

    res.status(201).json({ success: true, id: financialId });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des données financières:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/financial/establishment/:id
 * Récupère les données financières d'un établissement
 */
router.get('/establishment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(id);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    if (establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    let query = 'SELECT * FROM financial_data WHERE establishment_id = ?';
    const params = [id];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC';

    const result = await req.db.prepare(query).bind(...params).all();

    res.json({ financialData: result.results || [] });
  } catch (error) {
    console.error('Erreur lors de la récupération des données financières:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

