/**
 * Routes pour la gestion des établissements
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { Establishment } from '../models/Establishment.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * GET /api/establishments
 * Liste tous les établissements de l'utilisateur
 */
router.get('/', async (req, res) => {
  try {
    const establishmentModel = new Establishment(req.db);
    const establishments = await establishmentModel.findByUserId(req.userId);

    res.json({ establishments });
  } catch (error) {
    console.error('Erreur lors de la récupération des établissements:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/establishments/:id
 * Récupère un établissement par ID
 */
router.get('/:id', async (req, res) => {
  try {
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(req.params.id);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    // Vérifie que l'établissement appartient à l'utilisateur
    if (establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json({ establishment });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'établissement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/establishments
 * Crée un nouvel établissement
 */
router.post('/', async (req, res) => {
  try {
    const { name, googlePlaceId, address, department, menuPhotoUrl } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.create({
      userId: req.userId,
      name,
      googlePlaceId,
      address,
      department,
      menuPhotoUrl,
    });

    res.status(201).json({ establishment });
  } catch (error) {
    console.error('Erreur lors de la création de l\'établissement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT /api/establishments/:id
 * Met à jour un établissement
 */
router.put('/:id', async (req, res) => {
  try {
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(req.params.id);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    if (establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const updated = await establishmentModel.update(req.params.id, req.body);
    res.json({ establishment: updated });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'établissement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/establishments/:id
 * Supprime un établissement
 */
router.delete('/:id', async (req, res) => {
  try {
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(req.params.id);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    if (establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await establishmentModel.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'établissement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

