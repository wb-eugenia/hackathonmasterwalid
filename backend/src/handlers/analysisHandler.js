/**
 * Handler pour les routes d'analyse
 */

export async function handleAnalysis(request) {
  return new Response(JSON.stringify({ message: 'Analysis handler - à implémenter' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

