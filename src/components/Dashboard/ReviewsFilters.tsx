/**
 * Composant de filtres pour les avis
 * Permet de filtrer par note et par période
 */

import React from 'react';
import './ReviewsFilters.css';

export type RatingFilter = 'all' | 1 | 2 | 3 | 4 | 5;
export type PeriodFilter = '7days' | '30days' | '3months' | 'all';

interface ReviewsFiltersProps {
  ratingFilter: RatingFilter;
  periodFilter: PeriodFilter;
  onRatingChange: (rating: RatingFilter) => void;
  onPeriodChange: (period: PeriodFilter) => void;
  filteredCount: number;
  totalCount: number;
}

export const ReviewsFilters: React.FC<ReviewsFiltersProps> = ({
  ratingFilter,
  periodFilter,
  onRatingChange,
  onPeriodChange,
  filteredCount,
  totalCount,
}) => {
  return (
    <div className="reviews-filters">
      <div className="filters-header">
        <h3 className="filters-title">Filtres</h3>
        <div className="filters-count">
          {filteredCount} / {totalCount} avis
        </div>
      </div>

      <div className="filters-content">
        {/* Filtre par note */}
        <div className="filter-group">
          <label className="filter-label">Note</label>
          <div className="rating-filters">
            <button
              className={`rating-filter-btn ${ratingFilter === 'all' ? 'active' : ''}`}
              onClick={() => onRatingChange('all')}
            >
              Toutes
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                className={`rating-filter-btn ${ratingFilter === rating ? 'active' : ''}`}
                onClick={() => onRatingChange(rating as RatingFilter)}
                title={`${rating} étoile${rating > 1 ? 's' : ''}`}
              >
                {'⭐'.repeat(rating)}
              </button>
            ))}
          </div>
        </div>

        {/* Filtre par période */}
        <div className="filter-group">
          <label className="filter-label">Période</label>
          <div className="period-filters">
            <button
              className={`period-filter-btn ${periodFilter === '7days' ? 'active' : ''}`}
              onClick={() => onPeriodChange('7days')}
            >
              7 derniers jours
            </button>
            <button
              className={`period-filter-btn ${periodFilter === '30days' ? 'active' : ''}`}
              onClick={() => onPeriodChange('30days')}
            >
              30 derniers jours
            </button>
            <button
              className={`period-filter-btn ${periodFilter === '3months' ? 'active' : ''}`}
              onClick={() => onPeriodChange('3months')}
            >
              3 derniers mois
            </button>
            <button
              className={`period-filter-btn ${periodFilter === 'all' ? 'active' : ''}`}
              onClick={() => onPeriodChange('all')}
            >
              Toutes les périodes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

