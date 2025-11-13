/**
 * Composant de confirmation de sélection de restaurant
 * Affiche les détails du restaurant sélectionné et permet de confirmer
 */

import React from 'react';
import { Restaurant } from '../../types';
import './RestaurantSelection.css';

interface RestaurantSelectionProps {
  restaurant: Restaurant;
  onConfirm: () => void;
  onBack: () => void;
}

export const RestaurantSelection: React.FC<RestaurantSelectionProps> = ({
  restaurant,
  onConfirm,
  onBack,
}) => {
  return (
    <div className="selection-container">
      <div className="selection-card">
        <h1 className="selection-title">Restaurant sélectionné</h1>
        
        <div className="restaurant-details">
          <div className="detail-row">
            <span className="detail-label">Nom :</span>
            <span className="detail-value">{restaurant.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Département :</span>
            <span className="detail-value">{restaurant.department}</span>
          </div>
          {restaurant.address && (
            <div className="detail-row">
              <span className="detail-label">Adresse :</span>
              <span className="detail-value">{restaurant.address}</span>
            </div>
          )}
        </div>

        <div className="selection-actions">
          <button className="button-secondary" onClick={onBack}>
            Retour
          </button>
          <button className="button-primary" onClick={onConfirm}>
            Confirmer et voir les avis
          </button>
        </div>
      </div>
    </div>
  );
};


