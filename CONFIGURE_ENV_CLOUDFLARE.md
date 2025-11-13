# 🔧 Configurer les Variables d'Environnement dans Cloudflare Pages

## Problème

Le frontend essaie de se connecter à `localhost:3000` au lieu de l'API de production.

## Solution : Configurer les Variables d'Environnement

### Étape 1 : Aller dans Cloudflare Dashboard

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sélectionnez **Pages** > Votre projet (`hackathonwalid`)
3. Allez dans **Settings** > **Environment variables**

### Étape 2 : Ajouter les Variables

Cliquez sur **Add variable** et ajoutez :

#### Variable 1 : VITE_API_BASE_URL
- **Variable name** : `VITE_API_BASE_URL`
- **Value** : `https://hackathonwalid.wbouzidane.workers.dev/api`
- **Environment** : Production, Preview, Branch (tous)

#### Variable 2 : VITE_GOOGLE_PLACES_API_KEY
- **Variable name** : `VITE_GOOGLE_PLACES_API_KEY`
- **Value** : Votre clé API Google Places
- **Environment** : Production, Preview, Branch (tous)

### Étape 3 : Redéployer

Après avoir ajouté les variables, vous devez redéployer :

```powershell
npm run build
npx wrangler pages deploy dist --project-name=hackathonwalid
```

Ou attendez que GitHub Actions redéploie automatiquement.

## Vérification

Après redéploiement, le frontend devrait utiliser :
- ✅ `https://hackathonwalid.wbouzidane.workers.dev/api` au lieu de `localhost:3000/api`

## Alternative : Vérifier le Code

Le code utilise déjà `import.meta.env.VITE_API_BASE_URL` avec un fallback :

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

Si la variable n'est pas définie, il utilise `localhost:3000` par défaut.

## URLs Importantes

- **Backend API** : `https://hackathonwalid.wbouzidane.workers.dev/api`
- **Frontend** : `https://hackathonwalid.pages.dev` (ou votre URL de déploiement)

