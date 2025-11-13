/**
 * Handler pour les routes des avis
 * Version simplifiée - à compléter selon besoins
 */

import { authenticateWorker } from '../middleware/auth.js';

export async function handleReviews(request) {
  // Placeholder - à implémenter selon les besoins
  return new Response(JSON.stringify({ message: 'Reviews handler - à implémenter' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

