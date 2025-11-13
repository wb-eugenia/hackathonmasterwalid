# 🔧 Build avec Variables d'Environnement

## Le Problème

Les variables `VITE_*` sont injectées **au moment du BUILD**, pas au runtime.

Si vous build localement sans les variables, le code compilé contient `localhost:3000`.

## Solution : Créer .env.production

### Étape 1 : Créer le fichier

Créez un fichier `.env.production` à la racine du projet :

```env
VITE_API_BASE_URL=https://hackathonwalid.wbouzidane.workers.dev/api
VITE_GOOGLE_PLACES_API_KEY=AIzaSyBP10WJhmsYciKfnhxbuW3JfZXe170OuNk
```

### Étape 2 : Build et Déployer

```powershell
npm run build
npx wrangler pages deploy dist --project-name=hackathonwalid
```

Maintenant le build contiendra les bonnes URLs !

## Alternative : Utiliser GitHub Actions

Le workflow GitHub Actions utilise les secrets GitHub comme variables d'environnement au build.

**Assurez-vous que les secrets sont configurés :**
- `VITE_API_BASE_URL` = `https://hackathonwalid.wbouzidane.workers.dev/api`
- `VITE_GOOGLE_PLACES_API_KEY` = votre clé API

Puis poussez sur GitHub, et GitHub Actions buildera avec les bonnes variables.

## Vérification

Après déploiement, ouvrez la console du navigateur (F12) et vérifiez les requêtes :
- ✅ Doit aller vers : `https://hackathonwalid.wbouzidane.workers.dev/api`
- ❌ Ne doit PAS aller vers : `http://localhost:3000/api`

