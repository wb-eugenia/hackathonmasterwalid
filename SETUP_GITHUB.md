# 🚀 Configuration GitHub - Guide Complet

## ✅ Étape 1 : Code déjà commité localement

Le code a été initialisé et commité localement. Il ne reste plus qu'à le pousser sur GitHub.

## 📦 Étape 2 : Créer le Repository GitHub

1. Allez sur **https://github.com/new**
2. Nommez votre repository (ex: `restaurant-reviews-platform`)
3. **Description** (optionnel) : "Plateforme de gestion pour restaurants"
4. Choisissez **Public** ou **Private**
5. **⚠️ IMPORTANT** : Ne cochez PAS "Add a README file"
6. Cliquez sur **Create repository**

## 🔗 Étape 3 : Connecter le Repository Local

Après avoir créé le repo, GitHub affichera des instructions. Utilisez celles-ci :

```powershell
# Ajouter le remote (remplacez par votre URL GitHub)
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Pousser le code
git push -u origin main
```

**Si vous avez déjà un remote** :
```powershell
# Vérifier le remote actuel
git remote -v

# Changer l'URL si nécessaire
git remote set-url origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Pousser
git push -u origin main
```

## 🔐 Étape 4 : Configurer les Secrets GitHub

### 4.1 Obtenir le Token Cloudflare

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Cliquez sur **Create Token**
3. Utilisez le template **Edit Cloudflare Workers**
4. Configurez les permissions :
   - Account : Workers Scripts : Edit
   - Account : Workers Routes : Edit
   - Account : D1 : Edit
   - Zone : Zone Settings : Read (si vous utilisez Pages)
5. Cliquez sur **Continue to summary** puis **Create Token**
6. **Copiez le token** (vous ne pourrez plus le voir après)

### 4.2 Obtenir l'Account ID Cloudflare

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Dans la sidebar droite, vous verrez **Account ID**
3. **Copiez cet ID**

### 4.3 Ajouter les Secrets dans GitHub

1. Allez sur votre repo GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Cliquez sur **New repository secret**

Ajoutez ces secrets un par un :

| Nom | Valeur | Description |
|-----|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Votre token Cloudflare | Token créé à l'étape 4.1 |
| `CLOUDFLARE_ACCOUNT_ID` | Votre Account ID | ID copié à l'étape 4.2 |
| `VITE_API_BASE_URL` | `https://restaurant-reviews-backend.xxx.workers.dev/api` | URL de votre Worker (après premier déploiement) |
| `VITE_GOOGLE_PLACES_API_KEY` | Votre clé API | Clé API Google Places |

## 🗄️ Étape 5 : Premier Déploiement Manuel (Backend)

Avant que GitHub Actions puisse déployer, vous devez créer la base de données :

```powershell
cd backend

# Créer la base D1
npm run db:create
# ⚠️ Copiez le database_id affiché

# Éditez wrangler.toml et remplacez YOUR_DATABASE_ID

# Appliquer les migrations
npm run db:migrate

# Configurer les secrets Cloudflare
wrangler secret put JWT_SECRET
wrangler secret put GOOGLE_PLACES_API_KEY
wrangler secret put FRONTEND_URL

# Déployer
npm run deploy
```

**Copiez l'URL du Worker** et mettez-la dans le secret GitHub `VITE_API_BASE_URL`

## ✅ Étape 6 : Déploiement Automatique

Maintenant, à chaque `git push`, le déploiement se fait automatiquement :

```powershell
# Faites vos modifications
git add .
git commit -m "Description"
git push
```

## 📊 Vérifier le Déploiement

1. Allez sur votre repo GitHub > **Actions**
2. Vous verrez les workflows en cours/exécutés
3. Cliquez sur un workflow pour voir les logs détaillés

## 🎉 C'est fait !

Votre application se déploie automatiquement sur Cloudflare à chaque push.

