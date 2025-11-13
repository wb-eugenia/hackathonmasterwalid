# 📦 Configuration GitHub - Guide Rapide

## Commandes à Exécuter

### 1. Initialiser Git (si pas déjà fait)

```powershell
# À la racine du projet
git init
```

### 2. Créer le Repository sur GitHub

1. Allez sur https://github.com/new
2. Nommez votre repo (ex: `restaurant-reviews-platform`)
3. **Ne cochez PAS** "Initialize with README"
4. Cliquez sur **Create repository**

### 3. Pousser le Code

```powershell
# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Restaurant Reviews Platform with Cloudflare deployment"

# Renommer la branche en main (si nécessaire)
git branch -M main

# Ajouter le remote (remplacez par votre URL GitHub)
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Pousser
git push -u origin main
```

### 4. Configurer les Secrets GitHub

1. Allez sur votre repo GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Cliquez sur **New repository secret**

Ajoutez ces secrets :

| Nom | Description | Où le trouver |
|-----|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | Token API Cloudflare | [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) > Create Token > Edit Cloudflare Workers |
| `CLOUDFLARE_ACCOUNT_ID` | ID du compte Cloudflare | [Cloudflare Dashboard](https://dash.cloudflare.com/) > Sidebar droite |
| `VITE_API_BASE_URL` | URL de votre Worker | Après premier déploiement : `https://restaurant-reviews-backend.xxx.workers.dev/api` |
| `VITE_GOOGLE_PLACES_API_KEY` | Clé API Google Places | Votre clé API Google |

### 5. Premier Déploiement Manuel (Backend)

```powershell
cd backend

# Créer la base D1
npm run db:create
# ⚠️ Copiez le database_id

# Éditez wrangler.toml et remplacez YOUR_DATABASE_ID

# Migrations
npm run db:migrate

# Secrets Cloudflare
wrangler secret put JWT_SECRET
wrangler secret put GOOGLE_PLACES_API_KEY
wrangler secret put FRONTEND_URL

# Déployer
npm run deploy
```

**Copiez l'URL du Worker** et mettez-la dans le secret GitHub `VITE_API_BASE_URL`

### 6. Déploiement Automatique

Maintenant, à chaque `git push`, le déploiement se fait automatiquement :

```powershell
# Faites vos modifications
git add .
git commit -m "Description"
git push
```

Allez sur **Actions** dans votre repo GitHub pour voir le déploiement en cours.

## ✅ Vérification

1. **Backend** : `https://restaurant-reviews-backend.xxx.workers.dev/health`
2. **Frontend** : Votre URL Cloudflare Pages
3. **GitHub Actions** : Repo > Actions > Voir les workflows

## 🎉 C'est fait !

Votre application se déploie automatiquement à chaque push sur GitHub.

