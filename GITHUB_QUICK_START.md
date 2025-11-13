# ⚡ Déploiement GitHub - Guide Rapide

## 🎯 Commandes à Exécuter Maintenant

### 1. Créer le Repository GitHub

1. Allez sur **https://github.com/new**
2. Nommez votre repo (ex: `restaurant-reviews-platform`)
3. **Ne cochez PAS** "Initialize with README"
4. Cliquez sur **Create repository**
5. **Copiez l'URL** affichée

### 2. Connecter et Pousser

```powershell
# Remplacez par votre URL GitHub
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Pousser
git push -u origin main
```

### 3. Configurer les Secrets

Allez sur votre repo GitHub > **Settings** > **Secrets** > **Actions**

Ajoutez :
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_API_BASE_URL` (après premier déploiement)
- `VITE_GOOGLE_PLACES_API_KEY`

### 4. Premier Déploiement Backend

```powershell
cd backend
npm run db:create
# Mettez le database_id dans wrangler.toml
npm run db:migrate
wrangler secret put JWT_SECRET
wrangler secret put GOOGLE_PLACES_API_KEY
wrangler secret put FRONTEND_URL
npm run deploy
```

## ✅ C'est fait !

Le code est sur GitHub et se déploie automatiquement.

