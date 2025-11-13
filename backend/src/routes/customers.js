/**
 * Routes pour la gestion des clients
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { Customer } from '../models/Customer.js';
import { Establishment } from '../models/Establishment.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * POST /api/customers
 * Crée un nouveau client
 */
router.post('/', async (req, res) => {
  try {
    const { establishmentId, name, email, phone } = req.body;

    if (!establishmentId || !name) {
      return res.status(400).json({ error: 'Établissement et nom requis' });
    }

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(establishmentId);

    if (!establishment) {
      return res.status(404).json({ error: 'Établissement non trouvé' });
    }

    if (establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Vérifie si un client avec cet email existe déjà
    const customerModel = new Customer(req.db);
    if (email) {
      const existing = await customerModel.findByEmail(email, establishmentId);
      if (existing) {
        return res.status(409).json({ error: 'Un client avec cet email existe déjà' });
      }
    }

    const customer = await customerModel.create({
      establishmentId,
      name,
      email,
      phone,
    });

    res.status(201).json({ customer });
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/customers
 * Liste les clients d'un établissement
 */
router.get('/', async (req, res) => {
  try {
    const { establishmentId, search, limit, offset } = req.query;

    if (!establishmentId) {
      return res.status(400).json({ error: 'ID établissement requis' });
    }

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(establishmentId);

    if (!establishment || establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const customerModel = new Customer(req.db);
    let customers;

    if (search) {
      customers = await customerModel.search(establishmentId, search);
    } else {
      customers = await customerModel.findByEstablishmentId(establishmentId, {
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null,
      });
    }

    res.json({ customers });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/customers/:id
 * Récupère un client par ID
 */
router.get('/:id', async (req, res) => {
  try {
    const customerModel = new Customer(req.db);
    const customer = await customerModel.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(customer.establishment_id);

    if (!establishment || establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json({ customer });
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * PUT /api/customers/:id
 * Met à jour un client
 */
router.put('/:id', async (req, res) => {
  try {
    const customerModel = new Customer(req.db);
    const customer = await customerModel.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(customer.establishment_id);

    if (!establishment || establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const updated = await customerModel.update(req.params.id, req.body);
    res.json({ customer: updated });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * DELETE /api/customers/:id
 * Supprime un client
 */
router.delete('/:id', async (req, res) => {
  try {
    const customerModel = new Customer(req.db);
    const customer = await customerModel.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(customer.establishment_id);

    if (!establishment || establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await customerModel.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

