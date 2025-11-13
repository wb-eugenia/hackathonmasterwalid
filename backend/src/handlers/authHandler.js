/**
 * Handler pour les routes d'authentification
 * Adapte les routes Express pour Cloudflare Workers
 */

import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { generateId, toTimestamp } from '../config/database.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/emailService.js';

export async function handleAuth(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/auth', '');
  const method = request.method;
  const db = request.db;

  try {
    // Parse body
    let body = null;
    if (method !== 'GET' && method !== 'HEAD') {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    }

    // POST /api/auth/register
    if (path === '/register' && method === 'POST') {
      const { email, password, name } = body || {};

      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email et mot de passe requis' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const userModel = new User(db);
      const existingUser = await userModel.findByEmail(email);
      
      if (existingUser) {
        return new Response(JSON.stringify({ error: 'Cet email est déjà utilisé' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const user = await userModel.create({ email, password, name });
      const verificationToken = generateId();
      const expiresAt = toTimestamp() + (24 * 60 * 60);

      await db.prepare(
        `INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(generateId(), user.id, verificationToken, expiresAt, toTimestamp()).run();

      sendVerificationEmail(email, verificationToken).catch(console.error);

      const token = generateToken(user.id, request.env);

      return new Response(JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          email_verified: false,
        },
        token,
        message: 'Un email de vérification a été envoyé',
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/auth/login
    if (path === '/login' && method === 'POST') {
      const { email, password } = body || {};

      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email et mot de passe requis' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const userModel = new User(db);
      const user = await userModel.findByEmail(email);

      if (!user) {
        return new Response(JSON.stringify({ error: 'Email ou mot de passe incorrect' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const isValid = await userModel.verifyPassword(user, password);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Email ou mot de passe incorrect' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const token = generateToken(user.id, request.env);

      return new Response(JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          email_verified: user.email_verified === 1,
        },
        token,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/auth/verify-email
    if (path.startsWith('/verify-email') && method === 'GET') {
      const token = url.searchParams.get('token');

      if (!token) {
        return new Response(JSON.stringify({ error: 'Token requis' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const tokenRecord = await db.prepare(
        'SELECT * FROM email_verification_tokens WHERE token = ? AND expires_at > ?'
      ).bind(token, toTimestamp()).first();

      if (!tokenRecord) {
        return new Response(JSON.stringify({ error: 'Token invalide ou expiré' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const userModel = new User(db);
      await userModel.update(tokenRecord.user_id, { email_verified: 1 });

      await db.prepare('DELETE FROM email_verification_tokens WHERE id = ?')
        .bind(tokenRecord.id).run();

      const user = await userModel.findById(tokenRecord.user_id);
      sendWelcomeEmail(user.email, user.name).catch(console.error);

      return new Response(JSON.stringify({ message: 'Email vérifié avec succès' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/auth/resend-verification
    if (path === '/resend-verification' && method === 'POST') {
      const { email } = body || {};

      if (!email) {
        return new Response(JSON.stringify({ error: 'Email requis' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const userModel = new User(db);
      const user = await userModel.findByEmail(email);

      if (!user) {
        return new Response(JSON.stringify({ error: 'Utilisateur non trouvé' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (user.email_verified === 1) {
        return new Response(JSON.stringify({ error: 'Email déjà vérifié' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const verificationToken = generateId();
      const expiresAt = toTimestamp() + (24 * 60 * 60);

      await db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ?')
        .bind(user.id).run();

      await db.prepare(
        `INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(generateId(), user.id, verificationToken, expiresAt, toTimestamp()).run();

      await sendVerificationEmail(email, verificationToken);

      return new Response(JSON.stringify({ message: 'Email de vérification renvoyé' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Route non trouvée' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur auth handler:', error);
    console.error('Stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: 'Erreur serveur', 
      message: error.message,
      stack: error.stack,
      details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

