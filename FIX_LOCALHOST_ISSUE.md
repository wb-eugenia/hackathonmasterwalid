# 🔧 Solution Définitive : ERR_CONNECTION_REFUSED sur localhost

## Le Problème

Le code compilé contient toujours `localhost:3000` parce que le build a été fait **sans** les variables d'environnement.

## Solution : Build avec Variables

### Option 1 : Build Local avec .env.production (Rapide)

1. Créez un fichier `.env.production` à la racine :

```env
VITE_API_BASE_URL=https://hackathonwalid.wbouzidane.workers.dev/api
VITE_GOOGLE_PLACES_API_KEY=votre_cle_api_google_places
```

2. Build et déployez :

```powershell
npm run build
npx wrangler pages deploy dist --project-name=hackathonwalid
```

### Option 2 : Utiliser GitHub Actions (Recommandé)

1. **Configurez les secrets GitHub** :
   - Allez sur votre repo GitHub > **Settings** > **Secrets and variables** > **Actions**
   - Ajoutez :
     - `VITE_API_BASE_URL` = `https://hackathonwalid.wbouzidane.workers.dev/api`
     - `VITE_GOOGLE_PLACES_API_KEY` = votre clé API

2. **Poussez sur GitHub** :
   ```powershell
   git add .
   git commit -m "Fix: Use production API URL"
   git push
   ```

3. GitHub Actions buildera automatiquement avec les bonnes variables.

### Option 3 : Cloudflare Pages Auto-Build

1. Dans Cloudflare Pages, activez **"Auto-deploy from Git"**
2. Configurez les variables dans **Settings** > **Environment variables**
3. Cloudflare Pages buildera avec les variables

## Vérification

Après redéploiement, ouvrez la console (F12) et vérifiez :
- ✅ Les requêtes vont vers : `https://hackathonwalid.wbouzidane.workers.dev/api`
- ❌ Ne vont PAS vers : `http://localhost:3000/api`

## Important

**Les variables Vite sont injectées au BUILD, pas au runtime !**

Si vous build localement sans variables → le code contient `localhost:3000`
Si vous build avec variables → le code contient l'URL de production

