/**
 * Cloudflare Worker entry point
 * Adapte Express pour Cloudflare Workers
 */

// Importe les handlers de routes
import { handleAuth } from './handlers/authHandler.js';
import { handleEstablishments } from './handlers/establishmentHandler.js';
import { handleReviews } from './handlers/reviewHandler.js';
import { handleLoyalty } from './handlers/loyaltyHandler.js';
import { handleCustomers } from './handlers/customerHandler.js';
import { handleOnboarding } from './handlers/onboardingHandler.js';
import { handleUserEstablishments } from './handlers/userEstablishmentHandler.js';
import { handleScraping } from './handlers/scrapingHandler.js';
import { handleAnalysis } from './handlers/analysisHandler.js';
import { handleFinancial } from './handlers/financialHandler.js';
import { initDatabase } from './config/database.js';

/**
 * Fonction pour router les requêtes
 */
async function routeRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Route de santé
  if (path === '/health' || path === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Routes API - injecte env et db dans request
  if (path.startsWith('/api/auth')) {
    request.db = env.DB;
    request.env = env;
    return handleAuth(request);
  }
  if (path.startsWith('/api/establishments')) {
    request.db = env.DB;
    request.env = env;
    return handleEstablishments(request);
  }
  if (path.startsWith('/api/reviews')) {
    request.db = env.DB;
    request.env = env;
    return handleReviews(request);
  }
  if (path.startsWith('/api/loyalty')) {
    request.db = env.DB;
    request.env = env;
    return handleLoyalty(request);
  }
  if (path.startsWith('/api/customers')) {
    request.db = env.DB;
    request.env = env;
    return handleCustomers(request);
  }
  if (path.startsWith('/api/onboarding')) {
    request.db = env.DB;
    request.env = env;
    return handleOnboarding(request);
  }
  if (path.startsWith('/api/user-establishments')) {
    request.db = env.DB;
    request.env = env;
    return handleUserEstablishments(request);
  }
  if (path.startsWith('/api/scraping')) {
    request.db = env.DB;
    request.env = env;
    return handleScraping(request);
  }
  if (path.startsWith('/api/analysis')) {
    request.db = env.DB;
    request.env = env;
    return handleAnalysis(request);
  }
  if (path.startsWith('/api/financial')) {
    request.db = env.DB;
    request.env = env;
    return handleFinancial(request);
  }

  // 404
  return new Response(JSON.stringify({ error: 'Route non trouvée' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Gère les requêtes HTTP pour Cloudflare Workers
 */
export default {
  async fetch(request, env, ctx) {
    // Initialise la base de données si nécessaire
    if (!env.DB_INITIALIZED) {
      try {
        await initDatabase(env.DB);
        env.DB_INITIALIZED = true;
      } catch (error) {
        console.error('Erreur initialisation DB:', error);
      }
    }

    // Gère CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      // Route la requête
      const response = await routeRequest(request, env);

      // Ajoute les headers CORS à toutes les réponses
      if (response) {
        const headers = new Headers(response.headers);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }

      return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Erreur Worker:', error);
      return new Response(JSON.stringify({ error: 'Erreur serveur interne', message: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
