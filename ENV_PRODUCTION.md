# 🔧 Variables d'Environnement pour la Production

## Réponse : Non, pas besoin d'une variable "production"

Vite gère automatiquement les environnements :
- `npm run dev` = Mode développement
- `npm run build` = Mode production (par défaut)

## Variables Requises dans Cloudflare Pages

Vous devez seulement configurer ces 2 variables :

### 1. VITE_API_BASE_URL
- **Valeur** : `https://hackathonwalid.wbouzidane.workers.dev/api`
- **Pourquoi** : URL de l'API backend en production

### 2. VITE_GOOGLE_PLACES_API_KEY
- **Valeur** : Votre clé API Google Places
- **Pourquoi** : Pour utiliser l'API Google Places

## Comment Vite Détecte la Production

Vite utilise automatiquement :
- `import.meta.env.MODE` = `'production'` lors du build
- `import.meta.env.DEV` = `false` en production
- `import.meta.env.PROD` = `true` en production

## Code Mis à Jour

Le code a été mis à jour pour :
1. ✅ Utiliser `VITE_API_BASE_URL` si définie (production)
2. ✅ Fallback sur `localhost:3000/api` si non définie (développement)

## Configuration Cloudflare Pages

Dans **Settings** > **Environment variables**, ajoutez uniquement :

```
VITE_API_BASE_URL = https://hackathonwalid.wbouzidane.workers.dev/api
VITE_GOOGLE_PLACES_API_KEY = votre_cle_api
```

**Pas besoin de** `NODE_ENV` ou `VITE_ENV` - Vite le gère automatiquement !

## Vérification

Après avoir configuré les variables et redéployé, le code utilisera automatiquement :
- ✅ Production : `https://hackathonwalid.wbouzidane.workers.dev/api`
- ❌ Développement : `http://localhost:3000/api` (si variables non définies)

