/**
 * Handler pour les routes de fidélité
 * Version simplifiée - à compléter selon besoins
 */

export async function handleLoyalty(request) {
  return new Response(JSON.stringify({ message: 'Loyalty handler - à implémenter' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

