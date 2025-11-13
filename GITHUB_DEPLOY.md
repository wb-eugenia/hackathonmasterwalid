# 🚀 Commandes pour Déployer sur GitHub

## Étape 1 : Initialiser Git (si pas déjà fait)

```powershell
# À la racine du projet
git init
```

## Étape 2 : Créer le Repository sur GitHub

1. Allez sur https://github.com/new
2. Nommez votre repo (ex: `restaurant-reviews-platform`)
3. **Ne cochez PAS** "Initialize with README"
4. Cliquez sur **Create repository**
5. **Copiez l'URL** affichée (ex: `https://github.com/VOTRE_USERNAME/VOTRE_REPO.git`)

## Étape 3 : Pousser le Code

```powershell
# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Restaurant Reviews Platform"

# Renommer la branche en main
git branch -M main

# Ajouter le remote (remplacez par votre URL GitHub)
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Pousser vers GitHub
git push -u origin main
```

## Étape 4 : Configurer les Secrets GitHub

1. Allez sur votre repo GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Cliquez sur **New repository secret**

### Secrets à Ajouter :

| Nom du Secret | Valeur | Où le trouver |
|---------------|--------|---------------|
| `CLOUDFLARE_API_TOKEN` | Votre token API Cloudflare | [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) > Create Token > Template "Edit Cloudflare Workers" |
| `CLOUDFLARE_ACCOUNT_ID` | Votre Account ID | [Cloudflare Dashboard](https://dash.cloudflare.com/) > Sidebar droite |
| `VITE_API_BASE_URL` | URL de votre Worker | Après premier déploiement : `https://restaurant-reviews-backend.xxx.workers.dev/api` |
| `VITE_GOOGLE_PLACES_API_KEY` | Votre clé API Google | Votre clé API Google Places |

## Étape 5 : Premier Déploiement Manuel (Backend)

Avant que GitHub Actions puisse déployer, vous devez créer la base de données :

```powershell
cd backend

# Créer la base D1
npm run db:create
# ⚠️ Copiez le database_id affiché

# Éditez wrangler.toml et remplacez YOUR_DATABASE_ID par l'ID copié

# Appliquer les migrations
npm run db:migrate

# Configurer les secrets Cloudflare
wrangler secret put JWT_SECRET
# Entrez : votre-clé-jwt-sécurisée

wrangler secret put GOOGLE_PLACES_API_KEY
# Entrez : votre-clé-api-google

wrangler secret put FRONTEND_URL
# Entrez : https://votre-app.pages.dev (vous le mettrez à jour après)

# Déployer une première fois
npm run deploy
```

**✅ Copiez l'URL du Worker** (ex: `https://restaurant-reviews-backend.xxx.workers.dev`)

## Étape 6 : Mettre à Jour les Secrets GitHub

1. Allez sur GitHub > **Settings** > **Secrets**
2. Mettez à jour `VITE_API_BASE_URL` avec : `https://restaurant-reviews-backend.xxx.workers.dev/api`

## Étape 7 : Déploiement Automatique

Maintenant, à chaque `git push`, le déploiement se fait automatiquement :

```powershell
# Faites vos modifications
git add .
git commit -m "Description des changements"
git push
```

## ✅ Vérifier le Déploiement

1. Allez sur votre repo GitHub > **Actions**
2. Vous verrez les workflows en cours
3. Cliquez sur un workflow pour voir les logs

## 📝 Commandes Utiles

```powershell
# Voir le statut
git status

# Ajouter des fichiers
git add .

# Commit
git commit -m "Message"

# Push
git push

# Voir l'historique
git log --oneline
```

## 🎉 C'est fait !

Votre application se déploie automatiquement sur Cloudflare à chaque push sur GitHub.

