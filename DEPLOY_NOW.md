# 🚀 Déploiement Immédiat sur Cloudflare

## Commandes à exécuter (dans l'ordre)

### 1. Installer les dépendances

```powershell
cd backend
npm install
```

### 2. Créer la base de données D1

```powershell
npm run db:create
```

**⚠️ IMPORTANT** : Copiez le `database_id` qui s'affiche (ex: `a1b2c3d4...`)

### 3. Configurer wrangler.toml

Ouvrez `backend/wrangler.toml` et remplacez `YOUR_DATABASE_ID` par l'ID copié à l'étape 2.

### 4. Appliquer les migrations

```powershell
npm run db:migrate
```

### 5. Configurer les secrets

```powershell
# JWT Secret (générez une clé aléatoire)
wrangler secret put JWT_SECRET

# Google Places API Key
wrangler secret put GOOGLE_PLACES_API_KEY

# URL du frontend (vous la mettrez à jour après déploiement du frontend)
wrangler secret put FRONTEND_URL
```

### 6. Déployer le backend

```powershell
npm run deploy
```

**✅ Copiez l'URL du Worker affichée** (ex: `https://restaurant-reviews-backend.xxx.workers.dev`)

### 7. Déployer le frontend

#### Option A : Cloudflare Pages

1. Allez sur https://dash.cloudflare.com/ > **Pages**
2. **Create a project** > Connectez votre repo Git
3. Configuration :
   - Build command: `npm run build`
   - Build output: `dist`
4. Variables d'environnement :
   - `VITE_API_BASE_URL` = `https://restaurant-reviews-backend.xxx.workers.dev/api`
   - `VITE_GOOGLE_PLACES_API_KEY` = votre clé API

#### Option B : Build manuel

```powershell
# À la racine du projet
npm install
npm run build
```

Uploadez le dossier `dist/` vers votre hébergeur.

### 8. Tester

1. Ouvrez votre frontend déployé
2. Cliquez sur "Commencer gratuitement"
3. Créez un compte
4. Testez les fonctionnalités

## ✅ C'est fait !

Votre application est maintenant en ligne sur Cloudflare.

## 📊 Monitoring

```powershell
# Voir les logs en temps réel
cd backend
wrangler tail
```

## 🔧 Commandes utiles

```powershell
# Voir les secrets
wrangler secret list

# Redéployer
cd backend
npm run deploy

# Voir les migrations
wrangler d1 migrations list restaurant-reviews-db
```

