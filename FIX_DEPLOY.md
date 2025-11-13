# 🔧 Correction du Déploiement Cloudflare Pages

## Problème

Cloudflare Pages essaie d'exécuter `npx wrangler deploy` après le build, mais le frontend doit être déployé via Cloudflare Pages directement, pas via Workers.

## Solution

### Option 1 : Désactiver les builds automatiques dans Cloudflare Pages (Recommandé)

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sélectionnez **Pages** > Votre projet (`hackathonwalid-frontend`)
3. Allez dans **Settings** > **Builds & deployments**
4. **Désactivez** "Builds automatiques" ou "Auto-deploy from Git"
5. Laissez uniquement GitHub Actions gérer le déploiement

### Option 2 : Configurer Cloudflare Pages correctement

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sélectionnez **Pages** > Votre projet (`hackathonwalid-frontend`)
3. Allez dans **Settings** > **Builds & deployments**
4. Configuration :
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Root directory** : `/` (racine)
   - **Node version** : `18`
   - **Deploy command** : **LAISSEZ VIDE** ou supprimez `npx wrangler deploy`

### Option 3 : Utiliser uniquement GitHub Actions

Le workflow GitHub Actions (`.github/workflows/deploy-cloudflare.yml`) utilise `cloudflare/pages-action@v1` qui déploie correctement. 

**Assurez-vous que :**
- Les secrets GitHub sont configurés :
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
  - `VITE_API_BASE_URL`
  - `VITE_GOOGLE_PLACES_API_KEY`
- Le projet Cloudflare Pages existe (`hackathonwalid-frontend`)

### Vérification

Après avoir corrigé la configuration, le déploiement devrait :
1. ✅ Build réussir (`npm run build`)
2. ✅ Déployer via `cloudflare/pages-action@v1` (pas wrangler)
3. ✅ Afficher l'URL du site déployé

## Commandes utiles

```powershell
# Test local du build
npm run build

# Vérifier que dist/ contient les fichiers
ls dist/
```

