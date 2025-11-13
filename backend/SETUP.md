# Guide de Configuration Backend

## 1. Installation des dépendances

```bash
cd backend
npm install
```

## 2. Configuration Cloudflare D1

### Créer une base de données D1

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sélectionnez votre compte
3. Allez dans **Workers & Pages** > **D1**
4. Cliquez sur **Create database**
5. Nommez votre base (ex: `restaurant-reviews-db`)
6. Copiez le **Database ID**

### Configurer wrangler.toml

Ouvrez `backend/wrangler.toml` et remplacez `YOUR_DATABASE_ID` par votre Database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "restaurant-reviews-db"
database_id = "votre-database-id-ici"
```

## 3. Appliquer les migrations

```bash
# En local (pour développement)
wrangler d1 migrations apply --local

# En production
wrangler d1 migrations apply
```

## 4. Configuration des variables d'environnement

Créez un fichier `.env` dans le dossier `backend/`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GOOGLE_PLACES_API_KEY=your_google_places_api_key
OPENAI_API_KEY=your_openai_api_key (optionnel)
```

## 5. Démarrage

### Mode développement local

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Mode production (Cloudflare Workers)

```bash
npm run deploy
```

## 6. Test de l'API

```bash
# Test de santé
curl http://localhost:3000/health

# Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Notes importantes

- En développement local, vous pouvez utiliser Wrangler pour simuler D1: `wrangler d1 execute --local --file=migrations/0001_initial_schema.sql`
- Pour le déploiement sur Cloudflare Workers, assurez-vous que votre compte Cloudflare est configuré
- Le JWT_SECRET doit être changé en production pour des raisons de sécurité

