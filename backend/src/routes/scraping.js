/**
 * Routes pour le scraping des avis
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { scrapeEstablishmentReviews } from '../jobs/scraperJob.js';
import { Establishment } from '../models/Establishment.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * POST /api/scraping/establishment/:id
 * Lance le scraping des avis pour un établissement
 */
router.post('/establishment/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(id);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    if (establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    if (!establishment.google_place_id) {
      return res.status(400).json({ error: 'Établissement sans Google Place ID' });
    }

    // Lance le scraping en arrière-plan
    scrapeEstablishmentReviews(req.db, id).catch((error) => {
      console.error('Erreur lors du scraping:', error);
    });

    res.json({ 
      message: 'Scraping lancé',
      establishmentId: id,
    });
  } catch (error) {
    console.error('Erreur lors du lancement du scraping:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

