/**
 * Composant principal du dashboard des avis
 * Affiche les statistiques et le tableau des avis triés
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/apiService';
import { ReviewsTable } from './ReviewsTable';
import { ReviewsFilters, RatingFilter, PeriodFilter } from './ReviewsFilters';
import { Review } from '../../types';
import './ReviewsDashboard.css';

export const ReviewsDashboard: React.FC = () => {
  const { selectedRestaurant, reviews, setReviews, totalReviewsCount, setTotalReviewsCount } = useApp();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('7days'); // Par défaut: 7 derniers jours

  /**
   * Charge les avis du restaurant sélectionné depuis le backend
   */
  useEffect(() => {
    const loadReviews = async () => {
      if (!selectedRestaurant || !selectedRestaurant.id) return;

      setIsLoading(true);
      try {
        // Charge les avis depuis le backend
        // Note: Le backend doit avoir l'ID de l'établissement (pas juste le placeId)
        const establishmentId = selectedRestaurant.id;
        
        const { reviews: reviewsData, total: totalCount } = await reviewService.getByEstablishment(
          establishmentId,
          {
            // Pas de filtres initiaux, on les applique côté client
          }
        );

        // Convertit les avis du backend au format frontend
        const formattedReviews: Review[] = reviewsData.map((r: any) => ({
          id: r.id,
          text: r.text,
          authorName: r.author_name,
          rating: r.rating,
          date: r.date,
          sentiment: r.sentiment,
        }));

        setReviews(formattedReviews);
        setTotalReviewsCount(totalCount);
      } catch (error) {
        console.error('Erreur lors du chargement des avis:', error);
        // Fallback: utilise les services mockés si le backend n'est pas disponible
        try {
          const { fetchRestaurantReviews, getTotalReviewsCount } = await import('../../services/reviewsService');
          const [reviewsData, totalCount] = await Promise.all([
            fetchRestaurantReviews(selectedRestaurant),
            getTotalReviewsCount(selectedRestaurant),
          ]);
          setReviews(reviewsData);
          setTotalReviewsCount(totalCount);
        } catch (fallbackError) {
          console.error('Erreur fallback:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, [selectedRestaurant, setReviews, setTotalReviewsCount]);

  /**
   * Filtre les avis selon les critères sélectionnés
   */
  const filteredReviews = useMemo(() => {
    let filtered: Review[] = [...reviews];

    // Filtre par note
    if (ratingFilter !== 'all') {
      filtered = filtered.filter((review) => review.rating === ratingFilter);
    }

    // Filtre par période
    if (periodFilter !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (periodFilter) {
        case '7days':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3months':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0); // Toutes les dates
      }

      filtered = filtered.filter((review) => {
        try {
          const reviewDate = new Date(review.date);
          return reviewDate >= cutoffDate;
        } catch {
          return false; // Exclut les dates invalides
        }
      });
    }

    // Trie par note décroissante
    return filtered.sort((a, b) => b.rating - a.rating);
  }, [reviews, ratingFilter, periodFilter]);

  if (!selectedRestaurant) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <p>Aucun restaurant sélectionné</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">Dashboard des avis</h1>
          <p className="dashboard-restaurant">{selectedRestaurant.name}</p>
        </div>
        <button className="logout-button" onClick={logout}>
          Déconnexion
        </button>
      </div>

      <div className="dashboard-content">
        <div className="stats-card">
          <div className="stat-item">
            <div className="stat-value">{totalReviewsCount}</div>
            <div className="stat-label">Avis récupérés</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{filteredReviews.length}</div>
            <div className="stat-label">Avis affichés</div>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner">⏳</div>
            <p>Chargement des avis...</p>
          </div>
        ) : (
          <>
            <ReviewsFilters
              ratingFilter={ratingFilter}
              periodFilter={periodFilter}
              onRatingChange={setRatingFilter}
              onPeriodChange={setPeriodFilter}
              filteredCount={filteredReviews.length}
              totalCount={reviews.length}
            />
            <ReviewsTable reviews={filteredReviews} showFiltersInfo={true} />
          </>
        )}
      </div>
    </div>
  );
};


