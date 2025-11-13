# Guide de Déploiement Cloudflare

## Prérequis

1. Compte Cloudflare avec Workers activé
2. Wrangler CLI installé : `npm install -g wrangler`
3. Authentification Cloudflare : `wrangler login`

## 1. Configuration de la Base de Données D1

### Créer la base de données

```bash
cd backend
npm run db:create
```

Cela affichera un `database_id`. Copiez-le.

### Configurer wrangler.toml

Ouvrez `backend/wrangler.toml` et remplacez `YOUR_DATABASE_ID` par votre ID :

```toml
[[d1_databases]]
binding = "DB"
database_name = "restaurant-reviews-db"
database_id = "votre-database-id-ici"
```

### Appliquer les migrations

```bash
# En local (pour tests)
npm run db:migrate:local

# En production
npm run db:migrate
```

## 2. Configuration des Secrets

Configurez les secrets Cloudflare (non visibles dans le code) :

```bash
# JWT Secret
wrangler secret put JWT_SECRET

# Google Places API Key
wrangler secret put GOOGLE_PLACES_API_KEY

# OpenAI API Key (optionnel)
wrangler secret put OPENAI_API_KEY
```

## 3. Déploiement du Backend

### Déploiement en production

```bash
cd backend
npm run deploy
```

### Déploiement en preview

```bash
npm run deploy:preview
```

Le backend sera disponible sur : `https://restaurant-reviews-backend.votre-sous-domaine.workers.dev`

## 4. Configuration du Frontend

### Variables d'environnement

Créez un fichier `.env.production` :

```env
VITE_API_BASE_URL=https://restaurant-reviews-backend.votre-sous-domaine.workers.dev/api
VITE_GOOGLE_PLACES_API_KEY=votre_cle_api
```

### Build du frontend

```bash
npm run build
```

### Déploiement du frontend

#### Option 1: Cloudflare Pages

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/) > Pages
2. Créez un nouveau projet
3. Connectez votre repository Git
4. Configuration de build :
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`

#### Option 2: Déploiement manuel

```bash
# Build
npm run build

# Upload du dossier dist/ vers votre hébergeur
```

## 5. Vérification

1. Testez l'API backend : `https://votre-backend.workers.dev/health`
2. Testez le frontend : `https://votre-frontend.pages.dev`
3. Vérifiez les logs : `wrangler tail`

## 6. Monitoring

### Logs en temps réel

```bash
wrangler tail
```

### Métriques

Consultez les métriques dans le Cloudflare Dashboard :
- Workers > Analytics
- D1 > Analytics

## Notes importantes

- Les secrets sont stockés de manière sécurisée dans Cloudflare
- La base D1 est automatiquement sauvegardée
- Les Workers ont une limite de 10ms CPU time (gratuit) ou 50ms (payant)
- Pour des opérations longues (scraping, OCR), utilisez des Workers séparés ou des queues

## Troubleshooting

### Erreur de connexion à la base de données

Vérifiez que :
- Le `database_id` est correct dans `wrangler.toml`
- Les migrations ont été appliquées
- Le binding `DB` est correctement configuré

### Erreur CORS

Ajoutez les headers CORS dans votre Worker ou utilisez Cloudflare Pages avec le backend.

### Timeout

Si les opérations prennent trop de temps, considérez :
- Utiliser des Workers séparés pour les tâches longues
- Implémenter un système de queue
- Optimiser les requêtes à la base de données

