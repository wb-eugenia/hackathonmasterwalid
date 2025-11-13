/**
 * Routes pour la gestion des cartes fidélité
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { LoyaltyCard } from '../models/LoyaltyCard.js';
import { Customer } from '../models/Customer.js';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.js';
import { Establishment } from '../models/Establishment.js';
import { extractCardInfoFromImage, extractCodeFromQRBarcode, validateAndCleanCardNumber, validateAndCleanCode } from '../services/ocrService.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

/**
 * POST /api/loyalty/cards
 * Crée une nouvelle carte fidélité (patron uniquement)
 */
router.post('/cards', async (req, res) => {
  try {
    const { establishmentId, customerId, cardNumber, cardCode, cardType, photoUrl } = req.body;

    if (!establishmentId) {
      return res.status(400).json({ error: 'ID établissement requis' });
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

    // Valide et nettoie les données
    const cleanedCardNumber = cardNumber ? validateAndCleanCardNumber(cardNumber) : null;
    const cleanedCardCode = cardCode ? validateAndCleanCode(cardCode) : null;

    // Si une photo est fournie, essaie d'extraire les informations
    let extractedCardNumber = cleanedCardNumber;
    let extractedCardCode = cleanedCardCode;

    if (photoUrl && !cleanedCardNumber && !cleanedCardCode) {
      try {
        const extracted = await extractCardInfoFromImage(photoUrl);
        extractedCardNumber = extracted.cardNumber;
        extractedCardCode = extracted.cardCode;
      } catch (error) {
        console.error('Erreur OCR:', error);
      }
    }

    // Vérifie si une carte avec ce numéro existe déjà
    const cardModel = new LoyaltyCard(req.db);
    if (extractedCardNumber) {
      const existing = await cardModel.findByCardNumber(extractedCardNumber);
      if (existing) {
        return res.status(409).json({ error: 'Une carte avec ce numéro existe déjà' });
      }
    }

    // Crée la carte
    const card = await cardModel.create({
      establishmentId,
      customerId: customerId || null,
      cardNumber: extractedCardNumber,
      cardCode: extractedCardCode,
      cardType: cardType || 'physical',
      photoUrl: photoUrl || null,
    });

    res.status(201).json({ card });
  } catch (error) {
    console.error('Erreur lors de la création de la carte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/loyalty/cards/scan
 * Traite un scan de carte (photo ou QR/barcode)
 */
router.post('/cards/scan', async (req, res) => {
  try {
    const { establishmentId, imageBase64, scanType } = req.body;

    if (!establishmentId || !imageBase64) {
      return res.status(400).json({ error: 'Établissement et image requis' });
    }

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(establishmentId);

    if (!establishment || establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    let extractedInfo = { cardNumber: null, cardCode: null };

    if (scanType === 'qr' || scanType === 'barcode') {
      const code = await extractCodeFromQRBarcode(imageBase64);
      extractedInfo.cardCode = code;
    } else {
      // OCR pour extraire le numéro de carte
      extractedInfo = await extractCardInfoFromImage(imageBase64);
    }

    res.json({ extractedInfo });
  } catch (error) {
    console.error('Erreur lors du scan:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/loyalty/cards
 * Liste toutes les cartes d'un établissement
 */
router.get('/cards', async (req, res) => {
  try {
    const { establishmentId, status } = req.query;

    if (!establishmentId) {
      return res.status(400).json({ error: 'ID établissement requis' });
    }

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(establishmentId);

    if (!establishment || establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const cardModel = new LoyaltyCard(req.db);
    const cards = await cardModel.findByEstablishmentId(establishmentId, { status });

    res.json({ cards });
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/loyalty/cards/:id
 * Récupère une carte par ID
 */
router.get('/cards/:id', async (req, res) => {
  try {
    const cardModel = new LoyaltyCard(req.db);
    const card = await cardModel.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ error: 'Carte non trouvée' });
    }

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(card.establishment_id);

    if (!establishment || establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json({ card });
  } catch (error) {
    console.error('Erreur lors de la récupération de la carte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/loyalty/cards/:id/link
 * Associe une carte à un client
 */
router.post('/cards/:id/link', async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'ID client requis' });
    }

    const cardModel = new LoyaltyCard(req.db);
    const card = await cardModel.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ error: 'Carte non trouvée' });
    }

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(card.establishment_id);

    if (!establishment || establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Vérifie que le client existe et appartient au même établissement
    const customerModel = new Customer(req.db);
    const customer = await customerModel.findById(customerId);

    if (!customer || customer.establishment_id !== card.establishment_id) {
      return res.status(400).json({ error: 'Client invalide' });
    }

    const updatedCard = await cardModel.linkToCustomer(req.params.id, customerId);

    res.json({ card: updatedCard });
  } catch (error) {
    console.error('Erreur lors de la liaison de la carte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/loyalty/cards/:id/points
 * Ajoute ou retire des points (transaction)
 */
router.post('/cards/:id/points', async (req, res) => {
  try {
    const { transactionType, points, description, reference } = req.body;

    if (!transactionType || !points || points <= 0) {
      return res.status(400).json({ error: 'Type de transaction et points requis' });
    }

    const cardModel = new LoyaltyCard(req.db);
    const card = await cardModel.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ error: 'Carte non trouvée' });
    }

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(card.establishment_id);

    if (!establishment || establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Vérifie le solde pour les dépenses
    if (transactionType === 'spend' && card.points_balance < points) {
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    // Crée la transaction
    const transactionModel = new LoyaltyTransaction(req.db);
    const transaction = await transactionModel.create({
      loyaltyCardId: req.params.id,
      transactionType,
      points,
      description,
      reference,
      createdBy: req.userId,
    });

    // Met à jour le solde de la carte
    const updatedCard = await cardModel.updatePoints(req.params.id, points, transactionType);

    res.json({ card: updatedCard, transaction });
  } catch (error) {
    console.error('Erreur lors de la transaction:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/loyalty/cards/:id/transactions
 * Historique des transactions d'une carte
 */
router.get('/cards/:id/transactions', async (req, res) => {
  try {
    const { limit, offset } = req.query;

    const cardModel = new LoyaltyCard(req.db);
    const card = await cardModel.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ error: 'Carte non trouvée' });
    }

    // Vérifie que l'établissement appartient à l'utilisateur
    const establishmentModel = new Establishment(req.db);
    const establishment = await establishmentModel.findById(card.establishment_id);

    if (!establishment || establishment.user_id !== req.userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const transactionModel = new LoyaltyTransaction(req.db);
    const history = await transactionModel.getHistory(req.params.id, {
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });

    res.json(history);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;

