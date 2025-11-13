/**
 * Routes pour l'analyse des avis et la rentabilité
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { Review } from '../models/Review.js';
import { Establishment } from '../models/Establishment.js';
import { calculateProfitability } from '../services/profitabilityService.js';
import { generateResponse } from '../services/aiService.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * GET /api/analysis/establishment/:id/profitability
 * Calcule la rentabilité d'un établissement
 */
router.get('/establishment/:id/profitability', async (req, res) => {
  try {
    const { id } = req.params;
    const { revenue, costs } = req.query;

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(id);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    if (establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Récupère les statistiques des avis
    const reviewModel = new Review(req.db);
    const stats = await reviewModel.getStatistics(id);

    if (!stats || stats.total === 0) {
      return res.status(400).json({ error: 'Aucun avis disponible pour le calcul' });
    }

    // Calcule la rentabilité
    const profitability = calculateProfitability({
      totalReviews: stats.total,
      averageRating: stats.average_rating || 0,
      positiveReviewsPercentage: stats.positive ? (stats.positive / stats.total) * 100 : 0,
      revenue: revenue ? parseFloat(revenue) : 0,
      costs: costs ? parseFloat(costs) : 0,
    });

    res.json({ profitability });
  } catch (error) {
    console.error('Erreur lors du calcul de rentabilité:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/analysis/review/:id/generate-response
 * Génère une réponse automatique à un avis
 */
router.post('/review/:id/generate-response', async (req, res) => {
  try {
    const { id } = req.params;

    const reviewModel = new Review(req.db);
    const review = await reviewModel.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Avis non trouvé' });
    }

    // Récupère l'établissement
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(review.establishment_id);

    if (!establishment || establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Génère la réponse
    const response = await generateResponse(review, establishment.name);

    res.json({ response });
  } catch (error) {
    console.error('Erreur lors de la génération de réponse:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

