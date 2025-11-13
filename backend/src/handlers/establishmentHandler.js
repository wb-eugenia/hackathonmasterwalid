/**
 * Handler pour les routes des établissements
 */

import { Establishment } from '../models/Establishment.js';
import { authenticateWorker } from '../middleware/auth.js';

export async function handleEstablishments(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/establishments', '');
  const method = request.method;
  const db = request.db;

  try {
    // Vérifie l'authentification
    const authResult = await authenticateWorker(request);
    if (authResult.error) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: authResult.status || 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const userId = authResult.userId;

    // Parse body
    let body = null;
    if (method !== 'GET' && method !== 'HEAD') {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    }

    // GET /api/establishments
    if (path === '' && method === 'GET') {
      const establishmentModel = new Establishment(db);
      const establishments = await establishmentModel.findByUserId(userId);

      return new Response(JSON.stringify({ establishments }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // GET /api/establishments/:id
    if (path.startsWith('/') && method === 'GET') {
      const id = path.substring(1);
      const establishmentModel = new Establishment(db);
      const establishment = await establishmentModel.findById(id);

      if (!establishment) {
        return new Response(JSON.stringify({ error: 'Établissement non trouvé' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (establishment.user_id !== userId) {
        return new Response(JSON.stringify({ error: 'Accès refusé' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ establishment }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/establishments
    if (path === '' && method === 'POST') {
      const { name, googlePlaceId, address, department, menuPhotoUrl } = body || {};

      if (!name) {
        return new Response(JSON.stringify({ error: 'Le nom est requis' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const establishmentModel = new Establishment(db);
      const establishment = await establishmentModel.create({
        userId,
        name,
        googlePlaceId,
        address,
        department,
        menuPhotoUrl,
      });

      return new Response(JSON.stringify({ establishment }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PUT /api/establishments/:id
    if (path.startsWith('/') && method === 'PUT') {
      const id = path.substring(1);
      const establishmentModel = new Establishment(db);
      const establishment = await establishmentModel.findById(id);

      if (!establishment) {
        return new Response(JSON.stringify({ error: 'Établissement non trouvé' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (establishment.user_id !== userId) {
        return new Response(JSON.stringify({ error: 'Accès refusé' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const updated = await establishmentModel.update(id, body || {});
      return new Response(JSON.stringify({ establishment: updated }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // DELETE /api/establishments/:id
    if (path.startsWith('/') && method === 'DELETE') {
      const id = path.substring(1);
      const establishmentModel = new Establishment(db);
      const establishment = await establishmentModel.findById(id);

      if (!establishment) {
        return new Response(JSON.stringify({ error: 'Établissement non trouvé' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (establishment.user_id !== userId) {
        return new Response(JSON.stringify({ error: 'Accès refusé' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await establishmentModel.delete(id);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Route non trouvée' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur establishment handler:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

