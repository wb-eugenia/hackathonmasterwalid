/**
 * Service mocké pour l'API Google Places Search
 * 
 * TODO: Remplacer par l'appel réel à l'API Google Places
 * Documentation: https://developers.google.com/maps/documentation/places/web-service/search-text
 * 
 * Exemple d'appel réel:
 * const response = await fetch(
 *   `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${API_KEY}`
 * );
 */

import { Restaurant } from '../types';

/**
 * Données mockées de restaurants pour la simulation
 * Dans la version réelle, ces données viendront de l'API Google Places
 */
const MOCK_RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Le Gourmet Parisien', department: '75 - Paris', address: '123 Rue de la Paix, Paris' },
  { id: '2', name: 'La Brasserie du Sud', department: '13 - Bouches-du-Rhône', address: '45 Avenue de la République, Marseille' },
  { id: '3', name: 'Restaurant Le Jardin', department: '69 - Rhône', address: '78 Rue de la République, Lyon' },
  { id: '4', name: 'Le Bistrot Lyonnais', department: '69 - Rhône', address: '12 Place Bellecour, Lyon' },
  { id: '5', name: 'Chez Marie', department: '33 - Gironde', address: '56 Cours de l\'Intendance, Bordeaux' },
  { id: '6', name: 'Le Petit Bistro', department: '75 - Paris', address: '89 Rue Montmartre, Paris' },
  { id: '7', name: 'La Table du Chef', department: '31 - Haute-Garonne', address: '23 Place du Capitole, Toulouse' },
  { id: '8', name: 'Restaurant Le Port', department: '13 - Bouches-du-Rhône', address: '34 Quai des Belges, Marseille' },
  // Restaurants McDonald's
  { id: '9', name: 'McDonald\'s', department: '67 - Bas-Rhin', address: '15 Place Kléber, 67000 Strasbourg' },
  { id: '10', name: 'McDonald\'s', department: '67 - Bas-Rhin', address: '45 Avenue de la Forêt Noire, 67000 Strasbourg' },
  { id: '11', name: 'McDonald\'s', department: '75 - Paris', address: '123 Champs-Élysées, 75008 Paris' },
  { id: '12', name: 'McDonald\'s', department: '69 - Rhône', address: '78 Rue de la République, 69002 Lyon' },
  // Autres restaurants à Strasbourg
  { id: '13', name: 'Restaurant Le Tire-Bouchon', department: '67 - Bas-Rhin', address: '12 Rue des Tonneliers, 67000 Strasbourg' },
  { id: '14', name: 'La Petite France', department: '67 - Bas-Rhin', address: '8 Rue du Bain-aux-Plantes, 67000 Strasbourg' },
  { id: '15', name: 'Brasserie Les Haras', department: '67 - Bas-Rhin', address: '23 Rue des Glacières, 67000 Strasbourg' },
];

/**
 * Extrait le département depuis une adresse française
 * @param address - Adresse complète
 * @returns Code et nom du département (ex: "67 - Bas-Rhin")
 */
const extractDepartment = (address: string): string => {
  // Mapping des codes postaux aux départements
  const departmentMap: Record<string, string> = {
    '67': '67 - Bas-Rhin',
    '68': '68 - Haut-Rhin',
    '75': '75 - Paris',
    '13': '13 - Bouches-du-Rhône',
    '69': '69 - Rhône',
    '33': '33 - Gironde',
    '31': '31 - Haute-Garonne',
  };

  // Extrait le code postal (5 chiffres)
  const postalCodeMatch = address.match(/\b(\d{5})\b/);
  if (postalCodeMatch) {
    const postalCode = postalCodeMatch[1];
    const deptCode = postalCode.substring(0, 2);
    return departmentMap[deptCode] || `${deptCode} - Département ${deptCode}`;
  }

  return 'Département inconnu';
};

/**
 * Recherche de restaurants via Google Places API (réelle) ou données mockées (fallback)
 * @param query - Nom du restaurant recherché
 * @returns Promise avec la liste des restaurants correspondants
 */
export const searchRestaurants = async (query: string): Promise<Restaurant[]> => {
  if (!query.trim()) {
    return [];
  }

  // Récupère la clé API depuis les variables d'environnement
  const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

  // Si une clé API est configurée, utilise l'API Google Places réelle
  if (API_KEY && API_KEY !== '') {
    try {
      // Utilise le proxy Vite pour éviter les erreurs CORS
      const response = await fetch(
        `/api/google-places/place/textsearch/json?query=${encodeURIComponent(query)}&type=restaurant&language=fr&key=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'OK' && data.results) {
        return data.results.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          department: extractDepartment(place.formatted_address || ''),
          address: place.formatted_address || '',
          placeId: place.place_id,
        }));
      } else if (data.status === 'ZERO_RESULTS') {
        return [];
      } else {
        // En cas d'erreur API (quota, clé invalide, etc.), fallback sur les données mockées
        console.warn('Erreur API Google Places, utilisation des données mockées:', data.status);
        return searchMockedRestaurants(query);
      }
    } catch (error) {
      // En cas d'erreur réseau, fallback sur les données mockées
      console.warn('Erreur lors de l\'appel à l\'API Google Places, utilisation des données mockées:', error);
      return searchMockedRestaurants(query);
    }
  }

  // Pas de clé API configurée, utilise les données mockées
  return searchMockedRestaurants(query);
};

/**
 * Recherche dans les données mockées (fallback)
 * @param query - Nom du restaurant recherché
 * @returns Liste des restaurants correspondants
 */
const searchMockedRestaurants = async (query: string): Promise<Restaurant[]> => {
  // Simulation d'un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Filtre les restaurants mockés selon la requête
  // Recherche dans le nom, le département et l'adresse
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter((word) => word.length > 0);

  const filtered = MOCK_RESTAURANTS.filter((restaurant) => {
    const searchableText = `${restaurant.name} ${restaurant.department} ${restaurant.address || ''}`.toLowerCase();
    // Tous les mots de la requête doivent être présents
    return queryWords.every((word) => searchableText.includes(word));
  });

  return filtered;
};

/**
 * Récupère les détails d'un restaurant par son ID
 * @param placeId - ID du restaurant (Google Places ID)
 * @returns Promise avec les détails du restaurant
 */
export const getRestaurantDetails = async (placeId: string): Promise<Restaurant | null> => {
  // Simulation d'un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 300));

  const restaurant = MOCK_RESTAURANTS.find((r) => r.id === placeId || r.placeId === placeId);
  return restaurant || null;
};


