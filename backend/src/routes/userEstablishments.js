/**
 * Routes pour la gestion des établissements d'un utilisateur
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { UserEstablishment } from '../models/UserEstablishment.js';
import { Establishment } from '../models/Establishment.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * GET /api/user-establishments
 * Liste tous les établissements de l'utilisateur
 */
router.get('/', async (req, res) => {
  try {
    const userEstablishmentModel = new UserEstablishment(req.db);
    const establishments = await userEstablishmentModel.findByUserId(req.userId);

    res.json({ establishments });
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/user-establishments
 * Associe un établissement à l'utilisateur (après sélection)
 */
router.post('/', async (req, res) => {
  try {
    const { establishmentId, role = 'owner' } = req.body;

    if (!establishmentId) {
      return res.status(400).json({ error: 'ID établissement requis' });
    }

    // Vérifie que l'établissement existe
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(establishmentId);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    // Si l'utilisateur est le propriétaire original, crée avec rôle owner
    // Sinon, crée avec le rôle spécifié (pour invitations)
    const finalRole = establishment.user_id === req.userId ? 'owner' : role;

    const userEstablishmentModel = new UserEstablishment(req.db);
    const userEstablishment = await userEstablishmentModel.create({
      userId: req.userId,
      establishmentId,
      role: finalRole,
    });

    res.status(201).json({ userEstablishment });
  } catch (error) {
    console.error('Erreur lors de l\'association:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/user-establishments/:establishmentId/users
 * Liste les utilisateurs d'un établissement (admin/owner uniquement)
 */
router.get('/:establishmentId/users', async (req, res) => {
  try {
    const { establishmentId } = req.params;

    // Vérifie les permissions
    const userEstablishmentModel = new UserEstablishment(req.db);
    const hasAccess = await userEstablishmentModel.hasRole(req.userId, establishmentId, 'admin');

    if (!hasAccess) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const users = await userEstablishmentModel.findByEstablishmentId(establishmentId);

    res.json({ users });
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT /api/user-establishments/:id/role
 * Met à jour le rôle d'un utilisateur (admin/owner uniquement)
 */
router.put('/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['owner', 'admin', 'collaborator'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    // Récupère la liaison
    const userEstablishmentModel = new UserEstablishment(req.db);
    const userEstablishment = await userEstablishmentModel.findById(id);

    if (!userEstablishment) {
      return res.status(404).json({ error: 'Liaison non trouvée' });
    }

    // Vérifie les permissions (seul owner peut modifier les rôles)
    const hasAccess = await userEstablishmentModel.hasRole(
      req.userId,
      userEstablishment.establishment_id,
      'owner'
    );

    if (!hasAccess) {
      return res.status(403).json({ error: 'Seul le propriétaire peut modifier les rôles' });
    }

    const updated = await userEstablishmentModel.updateRole(id, role);

    res.json({ userEstablishment: updated });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/user-establishments/:id
 * Supprime une liaison (retire un utilisateur d'un établissement)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userEstablishmentModel = new UserEstablishment(req.db);
    const userEstablishment = await userEstablishmentModel.findById(id);

    if (!userEstablishment) {
      return res.status(404).json({ error: 'Liaison non trouvée' });
    }

    // Vérifie les permissions (owner ou l'utilisateur lui-même)
    const isOwner = await userEstablishmentModel.hasRole(
      req.userId,
      userEstablishment.establishment_id,
      'owner'
    );

    if (!isOwner && userEstablishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await userEstablishmentModel.delete(id);

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

