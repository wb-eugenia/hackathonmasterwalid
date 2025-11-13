# ⚡ Correction Rapide : ERR_CONNECTION_REFUSED

## Problème

Le frontend essaie de se connecter à `localhost:3000` au lieu de l'API de production.

## Solution Immédiate

### 1. Configurer les Variables dans Cloudflare Pages

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Pages** > **hackathonwalid**
3. **Settings** > **Environment variables**
4. Cliquez sur **Add variable**

#### Ajoutez ces 2 variables :

**Variable 1 :**
- Name: `VITE_API_BASE_URL`
- Value: `https://hackathonwalid.wbouzidane.workers.dev/api`
- Environment: ✅ Production, ✅ Preview, ✅ Branch

**Variable 2 :**
- Name: `VITE_GOOGLE_PLACES_API_KEY`
- Value: Votre clé API Google Places
- Environment: ✅ Production, ✅ Preview, ✅ Branch

### 2. Redéployer

Après avoir ajouté les variables, redéployez :

```powershell
npm run build
npx wrangler pages deploy dist --project-name=hackathonwalid
```

**OU** attendez que GitHub Actions redéploie automatiquement au prochain push.

### 3. Vérifier

Après redéploiement, ouvrez votre site et essayez de créer un compte. L'erreur devrait disparaître.

## URLs Importantes

- **Backend API** : `https://hackathonwalid.wbouzidane.workers.dev/api`
- **Frontend** : `https://hackathonwalid.pages.dev`

## Note

Les variables d'environnement doivent être configurées dans Cloudflare Pages, pas dans le code. Elles sont injectées au moment du build.

