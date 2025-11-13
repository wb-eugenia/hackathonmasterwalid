/**
 * Handler pour les routes financières
 */

export async function handleFinancial(request) {
  return new Response(JSON.stringify({ message: 'Financial handler - à implémenter' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

