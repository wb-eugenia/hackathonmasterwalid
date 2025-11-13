/**
 * Service de calcul de rentabilité
 * Calcule la rentabilité basée sur les avis et les données financières
 */

/**
 * Calcule l'impact des avis sur la rentabilité
 * @param {Object} params - Paramètres de calcul
 * @returns {Object} Résultats de rentabilité
 */
export function calculateProfitability({
  totalReviews,
  averageRating,
  positiveReviewsPercentage,
  revenue,
  costs,
  reviewImpactFactor = 0.1, // 10% d'impact des avis sur le chiffre d'affaires
}) {
  // Calcul du profit actuel
  const currentProfit = revenue - costs;
  const profitMargin = revenue > 0 ? (currentProfit / revenue) * 100 : 0;

  // Impact estimé des avis sur le chiffre d'affaires
  // Plus la note moyenne est élevée, plus l'impact est positif
  const ratingImpact = (averageRating - 3) / 2; // -1 à +1
  const estimatedRevenueImpact = revenue * reviewImpactFactor * ratingImpact;
  const estimatedProfitImpact = estimatedRevenueImpact * (profitMargin / 100);

  // Projection avec amélioration des avis
  const projectedRating = Math.min(5, averageRating + 0.5);
  const projectedRatingImpact = (projectedRating - 3) / 2;
  const projectedRevenueImpact = revenue * reviewImpactFactor * projectedRatingImpact;
  const projectedProfitImpact = projectedRevenueImpact * (profitMargin / 100);

  return {
    current: {
      profit: currentProfit,
      profitMargin,
      revenue,
      costs,
    },
    estimatedImpact: {
      revenueImpact: estimatedRevenueImpact,
      profitImpact: estimatedProfitImpact,
    },
    projection: {
      rating: projectedRating,
      revenueImpact: projectedRevenueImpact,
      profitImpact: projectedProfitImpact,
      potentialProfit: currentProfit + projectedProfitImpact,
    },
    metrics: {
      totalReviews,
      averageRating,
      positiveReviewsPercentage,
    },
  };
}

