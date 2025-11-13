/**
 * Handler pour les routes d'onboarding
 */

export async function handleOnboarding(request) {
  return new Response(JSON.stringify({ message: 'Onboarding handler - à implémenter' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

