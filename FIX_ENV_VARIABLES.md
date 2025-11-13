# 🔧 Pourquoi les Variables d'Environnement ne Fonctionnent Pas

## Problème

Les variables d'environnement Vite sont injectées **au moment du BUILD**, pas au runtime.

Si vous avez :
1. ✅ Ajouté les variables dans Cloudflare Pages
2. ❌ Mais buildé localement (sans les variables)
3. ❌ Puis déployé le build local

Alors le code compilé contient toujours `localhost:3000` !

## Solution 1 : Build avec Variables Locales (Recommandé)

Créez un fichier `.env.production` à la racine :

```env
VITE_API_BASE_URL=https://hackathonwalid.wbouzidane.workers.dev/api
VITE_GOOGLE_PLACES_API_KEY=votre_cle_api
```

Puis build et déployez :

```powershell
npm run build
npx wrangler pages deploy dist --project-name=hackathonwalid
```

## Solution 2 : Laisser Cloudflare Pages Builder (Meilleure)

1. **Désactivez les builds automatiques** dans Cloudflare Pages
2. **Configurez les variables** dans Cloudflare Pages (déjà fait ✅)
3. **Laissez GitHub Actions** builder et déployer automatiquement

Le workflow GitHub Actions utilise les secrets GitHub qui sont passés comme variables d'environnement au build.

## Solution 3 : Build via Cloudflare Pages

1. Dans Cloudflare Pages, activez "Auto-deploy from Git"
2. Configurez :
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Variables d'environnement** : Ajoutez `VITE_API_BASE_URL` et `VITE_GOOGLE_PLACES_API_KEY`
3. Cloudflare Pages buildera avec les bonnes variables

## Vérification

Après redéploiement, ouvrez la console du navigateur (F12) et vérifiez :
- ❌ `http://localhost:3000/api` = Variables non injectées
- ✅ `https://hackathonwalid.wbouzidane.workers.dev/api` = Variables injectées correctement

## Important

Les variables `VITE_*` sont remplacées par leur valeur au moment du build. Une fois le code compilé, vous ne pouvez plus les changer sans rebuilder.

