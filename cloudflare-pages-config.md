# Configuration Cloudflare Pages

## Problème

Cloudflare Pages essaie d'exécuter `npx wrangler deploy` pour déployer le frontend, mais le frontend doit être déployé via Cloudflare Pages directement, pas via Workers.

## Solution

Le frontend doit être déployé via Cloudflare Pages avec la configuration suivante :

### Configuration dans Cloudflare Dashboard

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sélectionnez **Pages** > Votre projet (`hackathonwalid-frontend`)
3. Allez dans **Settings** > **Builds & deployments**
4. Configuration :
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Root directory** : `/` (racine du projet)
   - **Node version** : `18` ou `20`

### Variables d'environnement

Dans **Settings** > **Environment variables**, ajoutez :
- `VITE_API_BASE_URL` = `https://hackathonwalid.wbouzidane.workers.dev/api`
- `VITE_GOOGLE_PLACES_API_KEY` = votre clé API

### Déploiement via GitHub Actions

Le workflow GitHub Actions (`deploy-cloudflare.yml`) utilise `cloudflare/pages-action@v1` qui déploie correctement sur Cloudflare Pages. Assurez-vous que :
- Les secrets GitHub sont configurés
- Le projet Cloudflare Pages existe (`hackathonwalid-frontend`)

### Alternative : Déploiement manuel

Si vous préférez déployer manuellement :

```powershell
# Build
npm run build

# Déployer avec wrangler pages
npx wrangler pages deploy dist --project-name=hackathonwalid-frontend
```

Mais le workflow GitHub Actions devrait fonctionner automatiquement.

