/**
 * Service de scraping des avis Google Places
 * 
 * TODO: Implémenter le scraping réel avec Puppeteer/Playwright
 * ou utiliser l'API Google Places (limité à 5 avis)
 */

import axios from 'axios';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * Récupère les avis depuis l'API Google Places
 * Note: L'API retourne seulement 5 avis maximum
 * Pour récupérer tous les avis, il faut utiliser un scrapper
 */
export async function scrapeReviewsFromGoogle(placeId) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: placeId,
          fields: 'reviews,user_ratings_total',
          language: 'fr',
          key: GOOGLE_PLACES_API_KEY,
        },
      }
    );

    if (response.data.status === 'OK' && response.data.result) {
      const reviews = response.data.result.reviews || [];
      
      return reviews.map((review) => ({
        googleReviewId: review.author_url || null,
        text: review.text || '',
        authorName: review.author_name || 'Auteur anonyme',
        rating: review.rating || 0,
        date: review.time ? new Date(review.time * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        sentiment: null, // Sera analysé plus tard
        category: null, // Sera analysé plus tard
      }));
    }

    return [];
  } catch (error) {
    console.error('Erreur lors du scraping des avis:', error);
    throw error;
  }
}

/**
 * Scrape tous les avis d'un restaurant (nécessite un scrapper réel)
 * TODO: Implémenter avec Puppeteer/Playwright pour scraper Google Maps
 */
export async function scrapeAllReviews(placeId) {
  // Pour l'instant, utilise l'API (limité à 5 avis)
  // Dans la version complète, utiliser un scrapper headless browser
  return await scrapeReviewsFromGoogle(placeId);
}

