# Backend API - Restaurant Reviews

Backend Node.js/Express avec intégration Cloudflare D1 (SQL) pour la gestion des avis restaurants.

## 🚀 Installation

```bash
cd backend
npm install
```

## 📦 Configuration

1. **Créez un fichier `.env`** à partir de `.env.example`:
```bash
cp .env.example .env
```

2. **Configurez Cloudflare D1**:
```bash
# Créez une base de données D1
npm run db:create

# Appliquez les migrations
npm run db:migrate
```

3. **Mettez à jour `wrangler.toml`** avec votre `database_id` après création.

## 🗄️ Base de données Cloudflare D1

### Schéma

- **users**: Utilisateurs de l'application
- **establishments**: Restaurants/établissements
- **reviews**: Avis Google scrapés
- **review_responses**: Réponses générées par IA
- **financial_data**: Données financières pour calculs de rentabilité
- **menu_items**: Plats extraits de la carte menu (OCR)

### Migrations

```bash
# Appliquer les migrations
npm run db:migrate

# En développement local avec Wrangler
wrangler d1 migrations apply --local
```

## 🔌 API Endpoints

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Établissements

- `GET /api/establishments` - Liste des établissements
- `GET /api/establishments/:id` - Détails d'un établissement
- `POST /api/establishments` - Créer un établissement
- `PUT /api/establishments/:id` - Mettre à jour
- `DELETE /api/establishments/:id` - Supprimer

### Avis

- `GET /api/reviews/establishment/:id` - Liste des avis (avec filtres)
- `GET /api/reviews/establishment/:id/statistics` - Statistiques

## 🔧 Services

### Scraping

Le service de scraping peut être exécuté:
- Manuellement via API
- Automatiquement via scheduler (cron)

```javascript
import { scrapeEstablishmentReviews } from './src/jobs/scraperJob.js';
await scrapeEstablishmentReviews(db, establishmentId);
```

### Analyse IA

- Analyse de sentiment
- Catégorisation des avis
- Génération de réponses automatiques

### Rentabilité

Calcul de l'impact des avis sur la rentabilité basé sur:
- Note moyenne
- Nombre d'avis
- Données financières (revenus, coûts)

## 🚀 Démarrage

```bash
# Développement
npm run dev

# Production
npm start
```

## 📝 TODO

- [ ] Intégrer Puppeteer/Playwright pour scraping complet
- [ ] Intégrer OpenAI GPT-4 pour génération de réponses
- [ ] Intégrer Google Cloud Natural Language pour analyse
- [ ] Ajouter OCR pour extraction de menus
- [ ] Implémenter webhooks pour n8n
- [ ] Ajouter cache Redis/Elasticsearch
- [ ] Mettre en place monitoring et logs

