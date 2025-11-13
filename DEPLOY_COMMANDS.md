# 🚀 Commandes de Déploiement Cloudflare

## Commandes à exécuter dans PowerShell

### 1. Installation et Configuration

```powershell
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Créer la base de données D1
npm run db:create
```

**⚠️ Copiez le `database_id` affiché et mettez-le dans `wrangler.toml`**

### 2. Configuration wrangler.toml

Ouvrez `backend/wrangler.toml` et remplacez `YOUR_DATABASE_ID` par votre ID.

### 3. Migrations

```powershell
# Appliquer les migrations
npm run db:migrate
```

### 4. Secrets

```powershell
# JWT Secret (générez une clé aléatoire)
wrangler secret put JWT_SECRET

# Google Places API Key
wrangler secret put GOOGLE_PLACES_API_KEY

# URL du frontend (à mettre à jour après déploiement)
wrangler secret put FRONTEND_URL
```

### 5. Déploiement Backend

```powershell
npm run deploy
```

**✅ Copiez l'URL du Worker affichée**

### 6. Déploiement Frontend

#### Option A : Cloudflare Pages

1. Allez sur https://dash.cloudflare.com/ > **Pages**
2. **Create a project** > Connectez votre repo
3. Configuration :
   - Build command: `npm run build`
   - Build output: `dist`
4. Variables :
   - `VITE_API_BASE_URL` = `https://votre-worker.workers.dev/api`
   - `VITE_GOOGLE_PLACES_API_KEY` = votre clé

#### Option B : Build manuel

```powershell
# À la racine
cd ..
npm install
npm run build
```

Uploadez `dist/` vers votre hébergeur.

### 7. Test

```powershell
# Test backend
curl https://votre-worker.workers.dev/health

# Ouvrez votre frontend et testez la création de compte
```

## ✅ C'est déployé !

