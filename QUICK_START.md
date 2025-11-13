# 🚀 Démarrage Rapide

## Pour créer un compte et déployer sur Cloudflare

### 1. Créer un compte

1. Ouvrez l'application
2. Sur la **landing page**, cliquez sur **"Commencer gratuitement"**
3. Remplissez le formulaire d'inscription :
   - Nom
   - Email
   - Mot de passe (minimum 6 caractères)
4. Confirmez votre mot de passe
5. Cliquez sur **"Créer mon compte"**

Un email de vérification sera envoyé (en mode développement, vérifiez la console).

### 2. Déployer sur Cloudflare

#### Backend

```bash
cd backend

# 1. Créer la base de données D1
npm run db:create
# Copiez le database_id affiché

# 2. Mettre à jour wrangler.toml avec votre database_id
# Éditez backend/wrangler.toml et remplacez YOUR_DATABASE_ID

# 3. Appliquer les migrations
npm run db:migrate

# 4. Configurer les secrets
wrangler secret put JWT_SECRET
wrangler secret put GOOGLE_PLACES_API_KEY
wrangler secret put FRONTEND_URL

# 5. Déployer
npm run deploy
```

#### Frontend

**Option A : Cloudflare Pages (Recommandé)**

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Pages**
2. **Create a project** > Connectez votre repo Git
3. Configuration :
   - Build command: `npm run build`
   - Build output: `dist`
4. Variables d'environnement :
   - `VITE_API_BASE_URL` = URL de votre Worker
   - `VITE_GOOGLE_PLACES_API_KEY` = Votre clé API

**Option B : Build manuel**

```bash
npm install
npm run build
# Uploadez le dossier dist/ vers votre hébergeur
```

### 3. Vérifier le déploiement

- Backend : `https://votre-worker.workers.dev/health`
- Frontend : Ouvrez votre URL Cloudflare Pages
- Testez la création de compte

## 📝 Notes

- Les emails de vérification nécessitent un service d'email réel (SendGrid, AWS SES, etc.)
- Pour le développement local, utilisez `npm run dev` dans le dossier backend
- Consultez `DEPLOY_CLOUDFLARE.md` pour plus de détails

