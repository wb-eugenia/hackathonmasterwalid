/**
 * Composant de recherche de restaurant
 * Permet à l'utilisateur de rechercher un restaurant via Google Places (simulé)
 */

import React, { useState } from 'react';
import { Restaurant } from '../../types';
import { GooglePlacesAutocomplete } from './GooglePlacesAutocomplete';
import { establishmentService } from '../../services/apiService';
import './RestaurantSearch.css';

interface RestaurantSearchProps {
  onRestaurantSelect: (restaurant: Restaurant) => void;
}

export const RestaurantSearch: React.FC<RestaurantSearchProps> = ({ onRestaurantSelect }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Gère la sélection d'un restaurant depuis l'autocomplete Google Places
   * Sauvegarde l'établissement dans le backend puis passe au dashboard
   */
  const handlePlaceSelect = async (restaurant: Restaurant) => {
    setIsSaving(true);
    try {
      // Sauvegarde l'établissement dans le backend
      const savedEstablishment = await establishmentService.create({
        name: restaurant.name,
        google_place_id: restaurant.placeId || undefined,
        address: restaurant.address,
        department: restaurant.department,
      });

      // Convertit l'établissement backend au format frontend
      const frontendRestaurant: Restaurant = {
        id: savedEstablishment.id,
        name: savedEstablishment.name,
        department: savedEstablishment.department || '',
        address: savedEstablishment.address,
        placeId: savedEstablishment.google_place_id || '',
      };

      onRestaurantSelect(frontendRestaurant);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'établissement:', error);
      // En cas d'erreur, utilise quand même le restaurant (mode dégradé)
      onRestaurantSelect(restaurant);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="search-container">
      <div className="search-card">
        <h1 className="search-title">Rechercher votre restaurant</h1>
        <p className="search-subtitle">
          Saisissez le nom de votre établissement pour le trouver
        </p>

        {/* Autocomplete Google Places uniquement */}
        {apiKey ? (
          <div className="autocomplete-section">
            <GooglePlacesAutocomplete
              onPlaceSelect={handlePlaceSelect}
              placeholder="Entrez une adresse ou un nom de restaurant"
            />
            {isSaving && (
              <div className="saving-indicator">
                <p>💾 Sauvegarde de l'établissement...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="no-api-key-message">
            <p>⚠️ Veuillez configurer votre clé API Google Places dans le fichier .env</p>
            <p className="hint-text">Variable: VITE_GOOGLE_PLACES_API_KEY</p>
          </div>
        )}
      </div>
    </div>
  );
};

