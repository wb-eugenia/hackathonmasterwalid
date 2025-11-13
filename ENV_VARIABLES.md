# 🔧 Variables d'Environnement

## API Base URL

Pour votre environnement Cloudflare, l'URL de base de l'API est :

```
https://hackathonwalid.wbouzidane.workers.dev/api
```

## Configuration Cloudflare Pages

Dans votre projet Cloudflare Pages, configurez ces variables d'environnement :

### Variables Requises

1. **VITE_API_BASE_URL**
   - Valeur : `https://hackathonwalid.wbouzidane.workers.dev/api`
   - Description : URL de base pour toutes les requêtes API

2. **VITE_GOOGLE_PLACES_API_KEY**
   - Valeur : Votre clé API Google Places
   - Description : Clé pour utiliser l'API Google Places (recherche d'établissements)

### Comment Configurer

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sélectionnez **Pages** > Votre projet (`hackathonwalid-frontend`)
3. Allez dans **Settings** > **Environment variables**
4. Ajoutez les deux variables ci-dessus
5. Redéployez le projet

### Configuration Locale

Pour le développement local, créez un fichier `.env` à la racine :

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_PLACES_API_KEY=votre_cle_api_google
```

## URLs de Production

- **Backend API** : `https://hackathonwalid.wbouzidane.workers.dev`
- **Frontend** : `https://hackathonwalid-frontend.pages.dev` (après déploiement)
- **API Endpoint** : `https://hackathonwalid.wbouzidane.workers.dev/api`

