# Guide de Déploiement sur Cloudflare

## 📋 Prérequis

1. Compte Cloudflare avec Workers activé
2. Wrangler CLI installé : `npm install -g wrangler`
3. Authentification Cloudflare : `wrangler login`

## 🗄️ Étape 1 : Créer la Base de Données D1

```bash
cd backend
wrangler d1 create hackathondb
```

Cela affichera un `database_id`. **Copiez-le** et mettez-le à jour dans `wrangler.toml` :

```toml
[[d1_databases]]
binding = "DB"
database_name = "hackathondb"
database_id = "VOTRE_DATABASE_ID_ICI"
```

## 📦 Étape 2 : Appliquer les Migrations

```bash
# Applique les migrations en production
wrangler d1 migrations apply restaurant-reviews-db

# Ou en local pour tester
wrangler d1 migrations apply hackathondb --local
```

Les migrations seront appliquées dans l'ordre :
- `0001_initial_schema.sql` - Schéma de base
- `0002_loyalty_system.sql` - Système de fidélité
- `0003_user_roles_multi_establishments.sql` - Multi-établissements et rôles

## 🔐 Étape 3 : Configurer les Secrets

Configurez les secrets Cloudflare (non visibles dans le code) :

```bash
# JWT Secret (changez par une clé sécurisée)
wrangler secret put JWT_SECRET

# Google Places API Key
wrangler secret put GOOGLE_PLACES_API_KEY

# URL du frontend (pour les emails de vérification)
wrangler secret put FRONTEND_URL

# OpenAI API Key (optionnel, pour génération de réponses IA)
wrangler secret put OPENAI_API_KEY
```

Quand vous exécutez ces commandes, Wrangler vous demandera de saisir la valeur.

## 🚀 Étape 4 : Déployer le Backend

```bash
cd backend
npm install
npm run deploy
```

Le backend sera disponible sur : `https://hackathonwalid.VOTRE_SUBDOMAIN.workers.dev`

## 🌐 Étape 5 : Déployer le Frontend

### Option A : Cloudflare Pages (Recommandé)

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Pages**
2. Cliquez sur **Create a project**
3. Connectez votre repository Git (GitHub, GitLab, etc.)
4. Configuration de build :
   - **Framework preset** : Vite
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Root directory** : `/` (racine du projet)

5. Variables d'environnement (Settings > Environment variables) :
   ```
   VITE_API_BASE_URL=https://restaurant-reviews-backend.VOTRE_SUBDOMAIN.workers.dev/api
   VITE_GOOGLE_PLACES_API_KEY=votre_cle_api_google
   ```

6. Déployez ! Cloudflare Pages déploiera automatiquement à chaque push.

### Option B : Déploiement Manuel

```bash
# Build du frontend
npm install
npm run build

# Le dossier dist/ contient les fichiers à déployer
# Uploadez-le vers votre hébergeur (Netlify, Vercel, etc.)
```

## ✅ Étape 6 : Vérification

1. **Testez l'API backend** :
   ```bash
   curl https://votre-backend.workers.dev/health
   ```

2. **Testez le frontend** :
   - Ouvrez votre URL Cloudflare Pages
   - Créez un compte
   - Vérifiez que tout fonctionne

3. **Vérifiez les logs** :
   ```bash
   wrangler tail
   ```

## 🔧 Configuration Post-Déploiement

### Mettre à jour l'URL du frontend dans les secrets

Si vous changez l'URL du frontend, mettez à jour le secret :

```bash
wrangler secret put FRONTEND_URL
# Entrez la nouvelle URL : https://votre-app.pages.dev
```

### Vérifier les migrations

```bash
# Liste les migrations appliquées
wrangler d1 migrations list hackathondb
```

### Accéder à la base de données

```bash
# Exécute une requête SQL
wrangler d1 execute hackathondb --command "SELECT COUNT(*) FROM users"
```

## 📝 Notes Importantes

- **Workers CPU Time** : Les Workers gratuits ont 10ms CPU time, payants 50ms
- **D1 Quotas** : 5GB de stockage gratuit, 5M reads/jour, 100K writes/jour
- **Secrets** : Les secrets sont stockés de manière sécurisée et ne sont pas visibles dans le code
- **CORS** : Les headers CORS sont configurés dans le Worker

## 🐛 Troubleshooting

### Erreur "Database not found"
- Vérifiez que le `database_id` dans `wrangler.toml` est correct
- Vérifiez que les migrations ont été appliquées

### Erreur CORS
- Vérifiez que les headers CORS sont bien ajoutés dans `worker.js`
- Vérifiez que `VITE_API_BASE_URL` pointe vers le bon Worker

### Erreur "Secret not found"
- Vérifiez que tous les secrets sont configurés : `wrangler secret list`

### Timeout
- Si les opérations prennent trop de temps, considérez :
  - Utiliser des Workers séparés pour les tâches longues
  - Implémenter un système de queue
  - Optimiser les requêtes à la base de données

## 📚 Ressources

- [Documentation Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Documentation Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Documentation Cloudflare Pages](https://developers.cloudflare.com/pages/)

