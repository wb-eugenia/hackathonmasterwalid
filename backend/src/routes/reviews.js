/**
 * Routes pour la gestion des avis
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { Review } from '../models/Review.js';
import { Establishment } from '../models/Establishment.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * GET /api/reviews/establishment/:establishmentId
 * Liste les avis d'un établissement avec filtres
 */
router.get('/establishment/:establishmentId', async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const { rating, startDate, endDate, limit, offset } = req.query;

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(establishmentId);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    if (establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const reviewModel = new Review(req.db);
    const reviews = await reviewModel.findByEstablishmentId(establishmentId, {
      rating: rating ? parseInt(rating) : null,
      startDate: startDate || null,
      endDate: endDate || null,
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const total = await reviewModel.countByEstablishmentId(establishmentId, {
      rating: rating ? parseInt(rating) : null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    res.json({ reviews, total });
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/reviews/establishment/:establishmentId/statistics
 * Statistiques des avis d'un établissement
 */
router.get('/establishment/:establishmentId/statistics', async (req, res) => {
  try {
    const { establishmentId } = req.params;

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(establishmentId);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    if (establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const reviewModel = new Review(req.db);
    const statistics = await reviewModel.getStatistics(establishmentId);

    res.json({ statistics });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

