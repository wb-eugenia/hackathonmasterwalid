/**
 * Handler pour les routes de scraping
 */

export async function handleScraping(request) {
  return new Response(JSON.stringify({ message: 'Scraping handler - à implémenter' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

