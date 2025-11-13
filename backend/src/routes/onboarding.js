/**
 * Routes pour l'onboarding (configuration initiale)
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { Establishment } from '../models/Establishment.js';
import { EstablishmentConfig } from '../models/EstablishmentConfig.js';
import { UserEstablishment } from '../models/UserEstablishment.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * POST /api/onboarding/establishment/:id
 * Complète la configuration d'un établissement
 */
router.post('/establishment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { openingHours, contactEmail, contactPhone, website, menuPhotoUrl, notificationSettings } = req.body;

    // Vérifie que l'établissement existe et appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(id);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    // Vérifie les permissions (owner ou admin)
    const userEstablishmentModel = new UserEstablishment(req.db);
    const hasAccess = await userEstablishmentModel.hasRole(req.userId, id, 'admin');
    
    if (!hasAccess && establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Crée ou met à jour la configuration
    const configModel = new EstablishmentConfig(req.db);
    const config = await configModel.upsert({
      establishmentId: id,
      openingHours,
      contactEmail,
      contactPhone,
      website,
      menuPhotoUrl,
      notificationSettings,
      onboardingCompleted: true,
    });

    res.json({ config });
  } catch (error) {
    console.error('Erreur lors de la configuration:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/onboarding/establishment/:id
 * Récupère la configuration d'un établissement
 */
router.get('/establishment/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifie les permissions
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(id);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    const userEstablishmentModel = new UserEstablishment(req.db);
    const hasAccess = await userEstablishmentModel.hasRole(req.userId, id, 'collaborator');
    
    if (!hasAccess && establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const configModel = new EstablishmentConfig(req.db);
    const config = await configModel.findByEstablishmentId(id);

    res.json({ config: config || { onboarding_completed: false } });
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

