/**
 * Job de scraping automatique des avis
 * S'exécute via un scheduler (cron) pour scraper régulièrement les avis
 */

import cron from 'node-cron';
import { scrapeAllReviews } from '../services/scraperService.js';
import { Review } from '../models/Review.js';
import { Establishment } from '../models/Establishment.js';
import { analyzeSentiment, categorizeReview } from '../services/aiService.js';

/**
 * Scrape les avis d'un établissement et les stocke en base
 */
export async function scrapeEstablishmentReviews(db, establishmentId) {
  try {
    const establishmentModel = new Establishment(db);
    const establishment = await establishmentModel.findById(establishmentId);

    if (!establishment || !establishment.google_place_id) {
      console.warn(`⚠️ Établissement ${establishmentId} sans Google Place ID`);
      return;
    }

    console.log(`🔍 Scraping des avis pour ${establishment.name}...`);

    // Scrape les avis
    const scrapedReviews = await scrapeAllReviews(establishment.google_place_id);

    if (scrapedReviews.length === 0) {
      console.log(`ℹ️ Aucun avis trouvé pour ${establishment.name}`);
      return;
    }

    // Analyse chaque avis avec IA
    const reviewsWithAnalysis = await Promise.all(
      scrapedReviews.map(async (review) => {
        const [sentiment, category] = await Promise.all([
          analyzeSentiment(review.text),
          categorizeReview(review.text),
        ]);

        return {
          ...review,
          sentiment,
          category,
          establishmentId,
        };
      })
    );

    // Vérifie les avis existants pour éviter les doublons
    const reviewModel = new Review(db);
    const reviewsToInsert = [];

    for (const review of reviewsWithAnalysis) {
      if (review.googleReviewId) {
        const existing = await reviewModel.findByGoogleReviewId(review.googleReviewId);
        if (!existing) {
          reviewsToInsert.push(review);
        }
      } else {
        reviewsToInsert.push(review);
      }
    }

    // Insère les nouveaux avis
    if (reviewsToInsert.length > 0) {
      await reviewModel.createBatch(reviewsToInsert);
      console.log(`✅ ${reviewsToInsert.length} nouveaux avis ajoutés pour ${establishment.name}`);
    } else {
      console.log(`ℹ️ Aucun nouvel avis pour ${establishment.name}`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors du scraping pour l'établissement ${establishmentId}:`, error);
  }
}

/**
 * Scrape tous les établissements actifs
 */
export async function scrapeAllEstablishments(db) {
  try {
    const establishmentModel = new Establishment(db);
    // Récupère tous les établissements avec un Google Place ID
    const establishments = await db.prepare(
      'SELECT id FROM establishments WHERE google_place_id IS NOT NULL'
    ).all();

    console.log(`🔍 Début du scraping pour ${establishments.results.length} établissements...`);

    for (const establishment of establishments.results) {
      await scrapeEstablishmentReviews(db, establishment.id);
      // Pause entre chaque établissement pour éviter le rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log('✅ Scraping terminé');
  } catch (error) {
    console.error('❌ Erreur lors du scraping global:', error);
  }
}

/**
 * Démarre le scheduler de scraping
 * Par défaut: toutes les 6 heures
 */
export function startScraperScheduler(db, schedule = '0 */6 * * *') {
  console.log(`⏰ Scheduler de scraping configuré: ${schedule}`);

  cron.schedule(schedule, async () => {
    console.log('🕐 Exécution du job de scraping...');
    await scrapeAllEstablishments(db);
  });

  // Exécute immédiatement au démarrage (optionnel)
  // scrapeAllEstablishments(db);
}

