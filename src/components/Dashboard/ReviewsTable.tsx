/**
 * Composant de tableau des avis
 * Affiche les avis triés par nombre d'étoiles (du plus élevé au plus bas)
 */

import React from 'react';
import { Review } from '../../types';
import './ReviewsTable.css';

interface ReviewsTableProps {
  reviews: Review[];
  showFiltersInfo?: boolean;
}

export const ReviewsTable: React.FC<ReviewsTableProps> = ({ reviews, showFiltersInfo = false }) => {
  /**
   * Formate la date pour l'affichage
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Génère l'affichage des étoiles
   */
  const renderStars = (rating: number): string => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <p>
          {showFiltersInfo
            ? 'Aucun avis ne correspond aux filtres sélectionnés'
            : 'Aucun avis disponible pour ce restaurant'}
        </p>
      </div>
    );
  }

  return (
    <div className="reviews-table-container">
      <h2 className="table-title">
        {showFiltersInfo && reviews.length > 0
          ? `${reviews.length} avis affichés (triés par note décroissante)`
          : 'Avis triés par note (du plus élevé au plus bas)'}
      </h2>
      <div className="reviews-table">
        <div className="table-header">
          <div className="header-cell header-rating">Note</div>
          <div className="header-cell header-text">Avis</div>
          <div className="header-cell header-author">Auteur</div>
          <div className="header-cell header-date">Date</div>
        </div>
        <div className="table-body">
          {reviews.map((review) => (
            <div key={review.id} className="table-row">
              <div className="table-cell cell-rating">
                <div className="rating-display">
                  <span className="rating-stars">{renderStars(review.rating)}</span>
                  <span className="rating-number">{review.rating}/5</span>
                </div>
              </div>
              <div className="table-cell cell-text">{review.text}</div>
              <div className="table-cell cell-author">{review.authorName}</div>
              <div className="table-cell cell-date">{formatDate(review.date)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


