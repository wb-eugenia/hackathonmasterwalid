# 🚀 Déploiement Automatique via GitHub

## Configuration GitHub + Cloudflare

### Étape 1 : Créer le Repository GitHub

1. Allez sur [GitHub](https://github.com) et créez un nouveau repository
2. Nommez-le (ex: `restaurant-reviews-platform`)
3. **Ne cochez PAS** "Initialize with README" (vous avez déjà des fichiers)

### Étape 2 : Initialiser Git et Pousser le Code

```powershell
# À la racine du projet
git init
git add .
git commit -m "Initial commit - Restaurant Reviews Platform"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git
git push -u origin main
```

### Étape 3 : Configurer les Secrets GitHub

Allez sur votre repository GitHub > **Settings** > **Secrets and variables** > **Actions**

Ajoutez ces secrets :

#### Secrets Cloudflare

1. **CLOUDFLARE_API_TOKEN**
   - Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Cliquez sur **Create Token**
   - Utilisez le template **Edit Cloudflare Workers**
   - Copiez le token et ajoutez-le comme secret

2. **CLOUDFLARE_ACCOUNT_ID**
   - Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Dans la sidebar droite, copiez votre **Account ID**
   - Ajoutez-le comme secret

#### Secrets Application

3. **VITE_API_BASE_URL**
   - URL de votre Worker : `https://restaurant-reviews-backend.xxx.workers.dev/api`
   - (Vous l'obtiendrez après le premier déploiement manuel)

4. **VITE_GOOGLE_PLACES_API_KEY**
   - Votre clé API Google Places

### Étape 4 : Premier Déploiement Manuel (Backend)

Avant que GitHub Actions puisse déployer, vous devez créer la base de données et configurer les secrets Cloudflare :

```powershell
cd backend

# Créer la base D1
npm run db:create
# Copiez le database_id

# Mettez à jour wrangler.toml avec le database_id

# Appliquer migrations
npm run db:migrate

# Configurer secrets Cloudflare
wrangler secret put JWT_SECRET
wrangler secret put GOOGLE_PLACES_API_KEY
wrangler secret put FRONTEND_URL

# Déployer une première fois
npm run deploy
```

**Copiez l'URL du Worker** et mettez-la dans le secret GitHub `VITE_API_BASE_URL`

### Étape 5 : Déploiement Automatique

Maintenant, à chaque `git push`, GitHub Actions va :

1. **Déployer le backend** sur Cloudflare Workers
2. **Build et déployer le frontend** sur Cloudflare Pages

```powershell
# Faites vos modifications
git add .
git commit -m "Vos modifications"
git push
```

Le déploiement se fera automatiquement ! 🎉

## 📋 Checklist

- [ ] Repository GitHub créé
- [ ] Code poussé sur GitHub
- [ ] Secrets GitHub configurés (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)
- [ ] Secrets application configurés (VITE_API_BASE_URL, VITE_GOOGLE_PLACES_API_KEY)
- [ ] Base D1 créée et migrations appliquées
- [ ] Secrets Cloudflare configurés (JWT_SECRET, GOOGLE_PLACES_API_KEY, FRONTEND_URL)
- [ ] Premier déploiement manuel réussi
- [ ] Workflow GitHub Actions testé

## 🔍 Vérifier le Déploiement

1. Allez sur votre repository GitHub > **Actions**
2. Vous verrez les workflows en cours/exécutés
3. Cliquez sur un workflow pour voir les logs

## 🐛 Troubleshooting

### Erreur "CLOUDFLARE_API_TOKEN not found"
- Vérifiez que le secret est bien configuré dans GitHub
- Vérifiez que le token Cloudflare a les bonnes permissions

### Erreur "Database not found"
- Vérifiez que les migrations ont été appliquées manuellement
- Vérifiez que le `database_id` dans `wrangler.toml` est correct

### Erreur de build frontend
- Vérifiez que les secrets `VITE_API_BASE_URL` et `VITE_GOOGLE_PLACES_API_KEY` sont configurés
- Vérifiez les logs dans GitHub Actions

## 📝 Commandes Git Utiles

```powershell
# Voir le statut
git status

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Description des changements"

# Push
git push

# Voir l'historique
git log

# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Revenir sur main
git checkout main
```

