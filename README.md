# 🍽️ Restaurant Reviews Platform

Plateforme complète de gestion pour restaurants avec :
- 📊 Gestion des avis Google automatisée
- 🎁 Système de fidélité client
- 💰 Analyse de rentabilité

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- Compte Cloudflare
- Clé API Google Places

### Installation

```bash
# Installer les dépendances
npm install
cd backend && npm install
```

### Configuration

1. **Backend** : Créez un fichier `backend/.env`
```env
JWT_SECRET=your-secret-key
GOOGLE_PLACES_API_KEY=your-api-key
```

2. **Frontend** : Créez un fichier `.env`
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_PLACES_API_KEY=your-api-key
```

### Développement Local

```bash
# Backend
cd backend
npm run dev

# Frontend (dans un autre terminal)
npm run dev
```

## 📦 Déploiement

### Déploiement sur Cloudflare

Voir les guides détaillés :
- `DEPLOY_NOW.md` - Guide rapide
- `DEPLOY_STEPS.md` - Guide détaillé
- `GITHUB_SETUP.md` - Configuration GitHub

### Déploiement via GitHub Actions

1. Poussez votre code sur GitHub
2. Configurez les secrets GitHub (voir `GITHUB_SETUP.md`)
3. Le déploiement se fait automatiquement à chaque push

## 🏗️ Architecture

- **Frontend** : React + TypeScript + Vite
- **Backend** : Node.js + Express (local) / Cloudflare Workers (production)
- **Base de données** : Cloudflare D1 (SQL)
- **Déploiement** : Cloudflare Workers + Cloudflare Pages

## 📚 Documentation

- `README_LOYALTY.md` - Documentation du système de fidélité
- `DEPLOY_CLOUDFLARE.md` - Guide de déploiement Cloudflare
- `QUICK_START.md` - Guide de démarrage rapide

## 🎯 Fonctionnalités

### ✅ Implémentées

- ✅ Authentification (inscription, connexion, vérification email)
- ✅ Landing page avec présentation des fonctionnalités
- ✅ Recherche d'établissement via Google Places
- ✅ Gestion multi-établissements
- ✅ Système de rôles (owner, admin, collaborator)
- ✅ Onboarding complet
- ✅ Dashboard multi-onglets (Avis, Fidélité, Rentabilité)
- ✅ Système de fidélité (scan de cartes, gestion des points)
- ✅ Analyse de rentabilité

### 🚧 À venir

- [ ] Intégration OCR réelle pour scan de cartes
- [ ] OAuth Google
- [ ] Scraping complet des avis (au-delà de 5 avis)
- [ ] Intégration IA avancée (GPT-4)
- [ ] Notifications en temps réel

## 📝 License

MIT
