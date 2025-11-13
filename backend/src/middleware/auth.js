/**
 * Middleware d'authentification JWT
 */

import jwt from 'jsonwebtoken';

// Pour Workers, utilise env.JWT_SECRET, sinon process.env
function getJwtSecret(env) {
  if (env && env.JWT_SECRET) {
    return env.JWT_SECRET;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  }
  return 'your-secret-key-change-in-production';
}

/**
 * Génère un token JWT
 */
export function generateToken(userId, env) {
  const secret = getJwtSecret(env);
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

/**
 * Vérifie un token JWT
 */
export function verifyToken(token, env) {
  try {
    const secret = getJwtSecret(env);
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

/**
 * Middleware pour protéger les routes
 * Version Express (pour serveur local)
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token, req.env || process.env);

  if (!decoded) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  req.userId = decoded.userId;
  next();
}

/**
 * Version pour Cloudflare Workers
 * Retourne un objet avec userId ou error
 */
export async function authenticateWorker(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Token manquant', status: 401 };
  }

  const token = authHeader.substring(7);
  const env = request.env || {};
  const decoded = verifyToken(token, env);

  if (!decoded) {
    return { error: 'Token invalide', status: 401 };
  }

  return { userId: decoded.userId };
}

