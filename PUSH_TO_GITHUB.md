# 🚀 Pousser le Code sur GitHub - Commandes

## ✅ Étape 1 : Code déjà commité !

Le code a été initialisé et commité localement. Il ne reste plus qu'à le pousser sur GitHub.

## 📦 Étape 2 : Créer le Repository GitHub

1. Allez sur **https://github.com/new**
2. Nommez votre repository (ex: `restaurant-reviews-platform`)
3. **Ne cochez PAS** "Add a README file"
4. Cliquez sur **Create repository**

## 🔗 Étape 3 : Connecter et Pousser

Après avoir créé le repo, GitHub affichera des instructions. Utilisez ces commandes :

```powershell
# Ajouter le remote (remplacez par votre URL GitHub)
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Pousser le code
git push -u origin main
```

**Si vous avez déjà un remote** :
```powershell
# Vérifier le remote
git remote -v

# Changer l'URL si nécessaire
git remote set-url origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Pousser
git push -u origin main
```

## 🔐 Étape 4 : Configurer les Secrets GitHub

Après avoir poussé le code, configurez les secrets pour le déploiement automatique :

1. Allez sur votre repo GitHub > **Settings** > **Secrets and variables** > **Actions**
2. Cliquez sur **New repository secret**

### Secrets à ajouter :

| Nom | Où le trouver |
|-----|--------------|
| `CLOUDFLARE_API_TOKEN` | [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) > Create Token > Template "Edit Cloudflare Workers" |
| `CLOUDFLARE_ACCOUNT_ID` | [Cloudflare Dashboard](https://dash.cloudflare.com/) > Sidebar droite |
| `VITE_API_BASE_URL` | URL de votre Worker (après premier déploiement) |
| `VITE_GOOGLE_PLACES_API_KEY` | Votre clé API Google Places |

## 🗄️ Étape 5 : Premier Déploiement Backend

Avant que GitHub Actions puisse déployer, créez la base de données :

```powershell
cd backend
npm run db:create
# Copiez le database_id et mettez-le dans wrangler.toml
npm run db:migrate
wrangler secret put JWT_SECRET
wrangler secret put GOOGLE_PLACES_API_KEY
wrangler secret put FRONTEND_URL
npm run deploy
```

## ✅ C'est fait !

Maintenant, à chaque `git push`, le déploiement se fait automatiquement via GitHub Actions.

