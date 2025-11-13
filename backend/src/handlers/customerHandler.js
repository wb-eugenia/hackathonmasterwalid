/**
 * Handler pour les routes des clients
 */

export async function handleCustomers(request) {
  return new Response(JSON.stringify({ message: 'Customers handler - à implémenter' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

