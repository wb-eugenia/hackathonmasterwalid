/**
 * Handler pour les routes user-establishments
 */

export async function handleUserEstablishments(request) {
  return new Response(JSON.stringify({ message: 'User establishments handler - à implémenter' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

