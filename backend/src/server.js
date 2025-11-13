/**
 * Serveur Express principal
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database.js';

// Routes
import authRoutes from './routes/auth.js';
import establishmentRoutes from './routes/establishments.js';
import reviewRoutes from './routes/reviews.js';
import scrapingRoutes from './routes/scraping.js';
import analysisRoutes from './routes/analysis.js';
import financialRoutes from './routes/financial.js';
import loyaltyRoutes from './routes/loyalty.js';
import customerRoutes from './routes/customers.js';
import onboardingRoutes from './routes/onboarding.js';
import userEstablishmentRoutes from './routes/userEstablishments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware pour injecter la base de données dans les requêtes
// Note: Pour Cloudflare Workers, utilisez env.DB
// Pour le développement local, vous pouvez utiliser une DB SQLite locale ou Cloudflare D1 local
app.use(async (req, res, next) => {
  // En développement, initialise la DB si nécessaire
  if (process.env.NODE_ENV === 'development') {
    // Si vous utilisez Cloudflare D1 localement avec Wrangler:
    // req.db = await getLocalD1Database();
    // Sinon, utilisez une DB SQLite locale ou mock
    if (!req.db) {
      console.warn('⚠️ Base de données non configurée - certaines fonctionnalités peuvent ne pas fonctionner');
    }
  }
  next();
});

// Routes de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/establishments', establishmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/scraping', scrapingRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/user-establishments', userEstablishmentRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrage du serveur
if (process.env.NODE_ENV !== 'production') {
  // Mode développement local
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📝 API disponible sur http://localhost:${PORT}/api`);
  });
} else {
  // Mode production Cloudflare Workers
  // Export pour Cloudflare Workers
  export default {
    async fetch(request, env) {
      // Initialise la base de données
      if (!env.DB_INITIALIZED) {
        await initDatabase(env.DB);
        env.DB_INITIALIZED = true;
      }

      // Injecte la DB dans les requêtes
      const modifiedRequest = {
        ...request,
        db: env.DB,
      };

      return app(modifiedRequest);
    },
  };
}

