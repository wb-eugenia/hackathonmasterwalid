/**
 * Service pour la récupération des avis Google Places
 * 
 * Utilise l'API Google Places Details pour récupérer les avis réels
 * Documentation: https://developers.google.com/maps/documentation/places/web-service/details
 * 
 * Note: L'API Google Places retourne jusqu'à 5 avis par défaut.
 * Pour récupérer tous les avis, il faudrait utiliser un scrapper ou plusieurs appels API.
 */

import { Review, Restaurant } from '../types';

/**
 * Données mockées d'avis pour la simulation
 * Dans la version réelle, ces données viendront du scrapper
 */
const MOCK_REVIEWS: Record<string, Review[]> = {
  '1': [
    {
      id: 'r1',
      text: 'Excellent restaurant ! La cuisine est délicieuse et le service impeccable.',
      authorName: 'Sophie Martin',
      rating: 5,
      date: '2024-01-15',
      sentiment: 'positive',
    },
    {
      id: 'r2',
      text: 'Très bon rapport qualité-prix. Je recommande vivement.',
      authorName: 'Pierre Dubois',
      rating: 5,
      date: '2024-01-10',
      sentiment: 'positive',
    },
    {
      id: 'r3',
      text: 'Bon restaurant mais un peu cher pour ce que c\'est.',
      authorName: 'Marie Leclerc',
      rating: 4,
      date: '2024-01-05',
      sentiment: 'neutral',
    },
    {
      id: 'r4',
      text: 'Ambiance agréable mais la nourriture était moyenne.',
      authorName: 'Jean Bernard',
      rating: 3,
      date: '2023-12-28',
      sentiment: 'neutral',
    },
  ],
  '2': [
    {
      id: 'r5',
      text: 'Superbe expérience culinaire ! Un must à Marseille.',
      authorName: 'Claire Moreau',
      rating: 5,
      date: '2024-01-20',
      sentiment: 'positive',
    },
    {
      id: 'r6',
      text: 'Service lent et plats pas à la hauteur des attentes.',
      authorName: 'Thomas Petit',
      rating: 2,
      date: '2024-01-12',
      sentiment: 'negative',
    },
    {
      id: 'r7',
      text: 'Très bon restaurant, je reviendrai certainement.',
      authorName: 'Laura Simon',
      rating: 4,
      date: '2024-01-08',
      sentiment: 'positive',
    },
  ],
  '3': [
    {
      id: 'r8',
      text: 'Parfait ! Tout était excellent du début à la fin.',
      authorName: 'Marc Durand',
      rating: 5,
      date: '2024-01-18',
      sentiment: 'positive',
    },
    {
      id: 'r9',
      text: 'Bon restaurant avec une belle terrasse.',
      authorName: 'Julie Roux',
      rating: 4,
      date: '2024-01-14',
      sentiment: 'positive',
    },
    {
      id: 'r10',
      text: 'Déçu par la qualité des plats pour le prix demandé.',
      authorName: 'Nicolas Blanc',
      rating: 2,
      date: '2024-01-02',
      sentiment: 'negative',
    },
  ],
};

/**
 * Génère des avis mockés pour un restaurant qui n'a pas d'avis pré-définis
 * @param restaurant - Restaurant pour lequel générer des avis
 * @returns Liste d'avis mockés (15-25 avis pour simuler un scrapper réel)
 */
const generateMockReviews = (restaurant: Restaurant): Review[] => {
  const authors = [
    'Sophie Martin', 'Pierre Dubois', 'Marie Leclerc', 'Jean Bernard', 'Nicolas Blanc',
    'Claire Moreau', 'Thomas Petit', 'Laura Simon', 'Marc Durand', 'Julie Roux',
    'Antoine Dupont', 'Camille Rousseau', 'Lucas Moreau', 'Emma Dubois', 'Hugo Martin',
    'Léa Bernard', 'Noah Petit', 'Chloé Simon', 'Liam Roux', 'Zoé Moreau',
    'Alexandre Durand', 'Manon Leclerc', 'Maxime Rousseau', 'Inès Martin', 'Paul Dubois'
  ];

  const positiveTexts = [
    `Excellent restaurant ! ${restaurant.name} offre une expérience culinaire remarquable.`,
    `Très bon rapport qualité-prix. Je recommande vivement ${restaurant.name}.`,
    `Service impeccable et plats délicieux. Une adresse à retenir !`,
    `Superbe expérience ! ${restaurant.name} mérite vraiment le détour.`,
    `Parfait du début à la fin. Cuisine raffinée et service au top.`,
    `Un vrai régal ! Les plats sont savoureux et bien présentés.`,
    `Ambiance chaleureuse et cuisine de qualité. Je reviendrai !`,
    `Excellent rapport qualité-prix. Les plats sont délicieux.`,
    `Restaurant à recommander sans hésitation. Tout était parfait.`,
    `Une belle découverte ! ${restaurant.name} est un excellent restaurant.`,
  ];

  const neutralTexts = [
    `Bon restaurant mais un peu cher pour ce que c'est. L'ambiance est agréable.`,
    `Service correct, plats de qualité. ${restaurant.name} mérite une visite.`,
    `Déçu par certains aspects mais globalement une bonne expérience.`,
    `Restaurant correct sans être exceptionnel. Le service était bon.`,
    `Plats corrects mais rien d'extraordinaire. Prix un peu élevé.`,
    `Ambiance sympa mais la cuisine pourrait être meilleure.`,
    `Service un peu lent mais les plats étaient bons.`,
    `Restaurant correct, rien de spécial mais pas décevant non plus.`,
  ];

  const negativeTexts = [
    `Déçu par la qualité des plats pour le prix demandé.`,
    `Service lent et plats pas à la hauteur des attentes.`,
    `Restaurant cher pour ce que c'est. Qualité moyenne.`,
    `Pas convaincu par l'expérience. Service et cuisine moyens.`,
  ];

  const reviews: Review[] = [];
  const numReviews = Math.floor(Math.random() * 11) + 15; // Entre 15 et 25 avis

  // Génère des dates aléatoires sur les 6 derniers mois
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < numReviews; i++) {
    // Distribution des notes : plus de 4 et 5 étoiles (60%), quelques 3 (25%), peu de 1-2 (15%)
    let rating: number;
    const rand = Math.random();
    if (rand < 0.6) {
      rating = Math.random() < 0.7 ? 5 : 4; // 70% de 5, 30% de 4
    } else if (rand < 0.85) {
      rating = 3;
    } else {
      rating = Math.random() < 0.5 ? 2 : 1;
    }

    // Sélectionne un texte selon la note
    let text: string;
    let sentiment: 'positive' | 'neutral' | 'negative';
    if (rating >= 4) {
      text = positiveTexts[Math.floor(Math.random() * positiveTexts.length)];
      sentiment = 'positive';
    } else if (rating === 3) {
      text = neutralTexts[Math.floor(Math.random() * neutralTexts.length)];
      sentiment = 'neutral';
    } else {
      text = negativeTexts[Math.floor(Math.random() * negativeTexts.length)];
      sentiment = 'negative';
    }

    // Génère une date aléatoire
    const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
    const randomDate = new Date(randomTime);
    const dateStr = randomDate.toISOString().split('T')[0];

    // Sélectionne un auteur aléatoire
    const author = authors[Math.floor(Math.random() * authors.length)];

    reviews.push({
      id: `review_${restaurant.id}_${i + 1}`,
      text,
      authorName: author,
      rating,
      date: dateStr,
      sentiment,
    });
  }

  return reviews;
};

/**
 * Récupère les avis réels d'un restaurant depuis Google Places API
 * @param restaurant - Restaurant dont on veut récupérer les avis
 * @returns Promise avec la liste des avis triés par note décroissante
 */
/**
 * Recherche le placeId d'un restaurant via l'API Google Places Text Search
 * @param restaurant - Restaurant pour lequel chercher le placeId
 * @param apiKey - Clé API Google Places
 * @returns PlaceId trouvé ou null
 */
const findPlaceIdBySearch = async (restaurant: Restaurant, apiKey: string): Promise<string | null> => {
  try {
    const query = restaurant.address || restaurant.name;
    if (!query) return null;

    console.log('🔍 [ReviewsService] Recherche du placeId pour:', restaurant.name);
    // Utilise le proxy Vite pour éviter les erreurs CORS
    const response = await fetch(
      `/api/google-places/place/textsearch/json?query=${encodeURIComponent(query)}&type=restaurant&language=fr&key=${apiKey}`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Trouve le résultat le plus proche (même nom ou adresse similaire)
        const result = data.results.find((r: any) => 
          r.name.toLowerCase().includes(restaurant.name.toLowerCase()) ||
          restaurant.name.toLowerCase().includes(r.name.toLowerCase())
        ) || data.results[0];

        console.log('✅ [ReviewsService] PlaceId trouvé via recherche:', result.place_id);
        return result.place_id;
      }
    }
  } catch (error) {
    console.error('❌ [ReviewsService] Erreur lors de la recherche du placeId:', error);
  }
  return null;
};

export const fetchRestaurantReviews = async (restaurant: Restaurant): Promise<Review[]> => {
  const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
  let placeId = restaurant.placeId || restaurant.id;

  console.log('🔍 [ReviewsService] Début de la récupération des avis');
  console.log('📋 [ReviewsService] Restaurant:', restaurant.name);
  console.log('🔑 [ReviewsService] Clé API présente:', API_KEY ? 'OUI' : 'NON');
  console.log('📍 [ReviewsService] PlaceId initial:', placeId);
  console.log('📍 [ReviewsService] PlaceId valide:', placeId && (placeId.startsWith('ChIJ') || placeId.length > 20) ? 'OUI' : 'NON');

  // Si le placeId n'est pas valide mais qu'on a une clé API, cherche le placeId via l'API
  if (API_KEY && (!placeId || !(placeId.startsWith('ChIJ') || placeId.length > 20))) {
    console.log('🔍 [ReviewsService] PlaceId invalide, recherche via API...');
    const foundPlaceId = await findPlaceIdBySearch(restaurant, API_KEY);
    if (foundPlaceId) {
      placeId = foundPlaceId;
      console.log('✅ [ReviewsService] PlaceId trouvé:', placeId);
    } else {
      console.warn('⚠️ [ReviewsService] Impossible de trouver le placeId via l\'API');
    }
  }

  // Si on a une clé API et un placeId valide, utilise l'API Google Places
  if (API_KEY && placeId && (placeId.startsWith('ChIJ') || placeId.length > 20)) {
    try {
      // Utilise le proxy Vite pour éviter les erreurs CORS
      const apiUrl = `/api/google-places/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews,user_ratings_total&language=fr&key=${API_KEY}`;
      console.log('🌐 [ReviewsService] Appel API Google Places via proxy...');
      console.log('🔗 [ReviewsService] URL (sans clé):', apiUrl.replace(API_KEY, '***API_KEY***'));

      // Appel à l'API Google Places Details via proxy
      const response = await fetch(apiUrl);

      console.log('📡 [ReviewsService] Réponse reçue - Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [ReviewsService] Erreur HTTP:', response.status, response.statusText);
        console.error('❌ [ReviewsService] Détails erreur:', errorText);
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 [ReviewsService] Données reçues - Status:', data.status);
      console.log('📦 [ReviewsService] Résultat présent:', !!data.result);

      if (data.status === 'OK' && data.result) {
        const googleReviews = data.result.reviews || [];
        console.log('✅ [ReviewsService] Nombre d\'avis récupérés:', googleReviews.length);
        console.log('📊 [ReviewsService] Total d\'avis (user_ratings_total):', data.result.user_ratings_total || 'Non disponible');
        
        // Transforme les avis Google en format Review
        const reviews: Review[] = googleReviews.map((review: any, index: number) => {
          // Convertit le timestamp en date ISO
          const reviewDate = review.time ? new Date(review.time * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          
          return {
            id: review.author_url || `review_${placeId}_${index}`,
            text: review.text || '',
            authorName: review.author_name || 'Auteur anonyme',
            rating: review.rating || 0,
            date: reviewDate,
            sentiment: analyzeSentimentSync(review.text || ''),
          };
        });

        // Si on a des avis réels, on les retourne
        if (reviews.length > 0) {
          console.log('✅ [ReviewsService] Avis réels retournés:', reviews.length);
          return reviews.sort((a, b) => b.rating - a.rating);
        } else {
          console.warn('⚠️ [ReviewsService] Aucun avis dans la réponse Google Places');
        }
      } else if (data.status === 'ZERO_RESULTS' || data.status === 'NOT_FOUND') {
        console.warn('⚠️ [ReviewsService] Aucun avis trouvé - Status:', data.status);
        console.warn('⚠️ [ReviewsService] Message:', data.error_message || 'Aucun message d\'erreur');
      } else {
        console.error('❌ [ReviewsService] Erreur API Google Places - Status:', data.status);
        console.error('❌ [ReviewsService] Message d\'erreur:', data.error_message || 'Aucun message d\'erreur');
        console.error('❌ [ReviewsService] Utilisation des données mockées en fallback');
      }
    } catch (error) {
      console.error('❌ [ReviewsService] Exception lors de l\'appel API:', error);
      if (error instanceof Error) {
        console.error('❌ [ReviewsService] Message d\'erreur:', error.message);
        console.error('❌ [ReviewsService] Stack:', error.stack);
      }
      console.warn('⚠️ [ReviewsService] Utilisation des données mockées en fallback');
    }
  } else {
    if (!API_KEY) {
      console.warn('⚠️ [ReviewsService] Pas de clé API configurée (VITE_GOOGLE_PLACES_API_KEY)');
    }
    if (!placeId) {
      console.warn('⚠️ [ReviewsService] Pas de placeId disponible');
    } else if (!(placeId.startsWith('ChIJ') || placeId.length > 20)) {
      console.warn('⚠️ [ReviewsService] PlaceId invalide (doit commencer par ChIJ ou avoir plus de 20 caractères)');
    }
    console.warn('⚠️ [ReviewsService] Utilisation des données mockées');
  }

  // Fallback: Récupère les avis mockés pour ce restaurant (par ID ou placeId)
  let reviews = MOCK_REVIEWS[restaurant.id] || [];
  
  // Si pas d'avis trouvés par ID, essaie avec le placeId
  if (reviews.length === 0 && restaurant.placeId) {
    reviews = MOCK_REVIEWS[restaurant.placeId] || [];
  }
  
  // Si toujours pas d'avis, génère des avis mockés
  if (reviews.length === 0) {
    reviews = generateMockReviews(restaurant);
  }

  // Trie par note décroissante (du plus élevé au plus bas)
  return reviews.sort((a, b) => b.rating - a.rating);
};

/**
 * Récupère le nombre total d'avis disponibles pour un restaurant
 * @param restaurant - Restaurant dont on veut compter les avis
 * @returns Promise avec le nombre total d'avis
 */
export const getTotalReviewsCount = async (restaurant: Restaurant): Promise<number> => {
  const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
  let placeId = restaurant.placeId || restaurant.id;

  console.log('🔢 [ReviewsService] Récupération du nombre total d\'avis');
  console.log('📍 [ReviewsService] PlaceId initial:', placeId);

  // Si le placeId n'est pas valide mais qu'on a une clé API, cherche le placeId via l'API
  if (API_KEY && (!placeId || !(placeId.startsWith('ChIJ') || placeId.length > 20))) {
    console.log('🔍 [ReviewsService] PlaceId invalide, recherche via API...');
    const foundPlaceId = await findPlaceIdBySearch(restaurant, API_KEY);
    if (foundPlaceId) {
      placeId = foundPlaceId;
      console.log('✅ [ReviewsService] PlaceId trouvé:', placeId);
    }
  }

  // Si on a une clé API et un placeId valide, utilise l'API Google Places
  if (API_KEY && placeId && (placeId.startsWith('ChIJ') || placeId.length > 20)) {
    try {
      // Utilise le proxy Vite pour éviter les erreurs CORS
      const apiUrl = `/api/google-places/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=user_ratings_total,reviews&key=${API_KEY}`;
      console.log('🌐 [ReviewsService] Appel API pour le nombre total d\'avis via proxy...');

      // Appel à l'API Google Places Details pour récupérer le nombre total d'avis
      const response = await fetch(apiUrl);

      console.log('📡 [ReviewsService] Réponse - Status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 [ReviewsService] Données - Status:', data.status);
        
        if (data.status === 'OK' && data.result) {
          // Retourne le nombre total d'avis (user_ratings_total) ou le nombre d'avis retournés
          const totalRatings = data.result.user_ratings_total || 0;
          const reviewsCount = data.result.reviews?.length || 0;
          
          console.log('📊 [ReviewsService] Total d\'avis (user_ratings_total):', totalRatings);
          console.log('📊 [ReviewsService] Nombre d\'avis retournés:', reviewsCount);
          
          // Retourne le total réel si disponible, sinon le nombre d'avis retournés
          const result = totalRatings > 0 ? totalRatings : reviewsCount;
          console.log('✅ [ReviewsService] Nombre total retourné:', result);
          return result;
        } else {
          console.error('❌ [ReviewsService] Erreur API - Status:', data.status);
          console.error('❌ [ReviewsService] Message:', data.error_message || 'Aucun message');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ [ReviewsService] Erreur HTTP:', response.status, response.statusText);
        console.error('❌ [ReviewsService] Détails:', errorText);
      }
    } catch (error) {
      console.error('❌ [ReviewsService] Exception lors de la récupération du nombre d\'avis:', error);
      if (error instanceof Error) {
        console.error('❌ [ReviewsService] Message:', error.message);
      }
    }
  } else {
    console.warn('⚠️ [ReviewsService] Conditions non remplies pour l\'API - utilisation du fallback');
  }

  // Fallback: Récupère les avis mockés pour ce restaurant (par ID ou placeId)
  let reviews = MOCK_REVIEWS[restaurant.id] || [];
  
  // Si pas d'avis trouvés par ID, essaie avec le placeId
  if (reviews.length === 0 && restaurant.placeId) {
    reviews = MOCK_REVIEWS[restaurant.placeId] || [];
  }
  
  // Si toujours pas d'avis, génère des avis mockés et retourne leur nombre
  if (reviews.length === 0) {
    reviews = generateMockReviews(restaurant);
  }
  
  return reviews.length;
};

/**
 * Analyse le sentiment d'un texte de manière synchrone (pour utilisation dans map)
 * @param text - Texte à analyser
 * @returns Sentiment détecté
 */
const analyzeSentimentSync = (text: string): 'positive' | 'neutral' | 'negative' => {
  const positiveWords = ['excellent', 'superbe', 'parfait', 'délicieux', 'recommand', 'bon', 'génial', 'fantastique', 'merveilleux', 'adoré'];
  const negativeWords = ['déçu', 'mauvais', 'lent', 'cher', 'moyen', 'horrible', 'décevant', 'nul', 'dégoûtant', 'terrible'];

  const lowerText = text.toLowerCase();
  
  const hasPositive = positiveWords.some((word) => lowerText.includes(word));
  const hasNegative = negativeWords.some((word) => lowerText.includes(word));

  if (hasPositive && !hasNegative) return 'positive';
  if (hasNegative && !hasPositive) return 'negative';
  return 'neutral';
};

/**
 * Analyse le sentiment des avis (simulation)
 * TODO: Remplacer par un vrai service d'analyse de sentiment
 * Options possibles:
 * - API externe (Google Cloud Natural Language, AWS Comprehend)
 * - Modèle local (TensorFlow.js, spaCy)
 * - Bibliothèque JavaScript (Sentiment.js, etc.)
 */
export const analyzeSentiment = async (text: string): Promise<'positive' | 'neutral' | 'negative'> => {
  // Simulation simple basée sur des mots-clés
  await new Promise((resolve) => setTimeout(resolve, 100));
  return analyzeSentimentSync(text);
};


