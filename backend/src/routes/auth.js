/**
 * Routes d'authentification
 */

import express from 'express';
import { User } from '../models/User.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { generateId, toTimestamp } from '../config/database.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Crée un nouveau compte utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const userModel = new User(req.db);
    
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // Crée l'utilisateur
    const user = await userModel.create({ email, password, name });
    
    // Génère un token de vérification
    const verificationToken = generateId();
    const expiresAt = toTimestamp() + (24 * 60 * 60); // 24 heures
    
    await req.db.prepare(
      `INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(generateId(), user.id, verificationToken, expiresAt, toTimestamp()).run();

    // Envoie l'email de vérification (asynchrone)
    sendVerificationEmail(email, verificationToken).catch(console.error);

    const token = generateToken(user.id, req.env || process.env);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: false,
      },
      token,
      message: 'Un email de vérification a été envoyé',
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/auth/login
 * Connecte un utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const userModel = new User(req.db);
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const isValid = await userModel.verifyPassword(user, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = generateToken(user.id, req.env || process.env);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        email_verified: user.email_verified === 1,
      },
      token,
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/auth/verify-email
 * Vérifie l'email avec un token
 */
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token requis' });
    }

    // Vérifie le token
    const tokenRecord = await req.db.prepare(
      'SELECT * FROM email_verification_tokens WHERE token = ? AND expires_at > ?'
    ).bind(token, toTimestamp()).first();

    if (!tokenRecord) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    // Met à jour l'utilisateur
    const userModel = new User(req.db);
    await userModel.update(tokenRecord.user_id, { email_verified: 1 });

    // Supprime le token
    await req.db.prepare('DELETE FROM email_verification_tokens WHERE id = ?')
      .bind(tokenRecord.id).run();

    // Envoie l'email de bienvenue
    const user = await userModel.findById(tokenRecord.user_id);
    sendWelcomeEmail(user.email, user.name).catch(console.error);

    res.json({ message: 'Email vérifié avec succès' });
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/auth/resend-verification
 * Renvoie l'email de vérification
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    const userModel = new User(req.db);
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.email_verified === 1) {
      return res.status(400).json({ error: 'Email déjà vérifié' });
    }

    // Génère un nouveau token
    const verificationToken = generateId();
    const expiresAt = toTimestamp() + (24 * 60 * 60);

    // Supprime les anciens tokens
    await req.db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ?')
      .bind(user.id).run();

    // Crée le nouveau token
    await req.db.prepare(
      `INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(generateId(), user.id, verificationToken, expiresAt, toTimestamp()).run();

    // Envoie l'email
    await sendVerificationEmail(email, verificationToken);

    res.json({ message: 'Email de vérification renvoyé' });
  } catch (error) {
    console.error('Erreur lors du renvoi:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
