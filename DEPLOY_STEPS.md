# 🚀 Guide de Déploiement Cloudflare - Étapes Détaillées

## Prérequis

1. Compte Cloudflare avec Workers activé
2. Wrangler CLI installé : `npm install -g wrangler`
3. Authentification : `wrangler login`

## Étape 1 : Installation des dépendances

```bash
cd backend
npm install
```

## Étape 2 : Créer la Base de Données D1

```bash
npm run db:create
```

**Important** : Copiez le `database_id` affiché. Il ressemble à : `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

## Étape 3 : Configurer wrangler.toml

Ouvrez `backend/wrangler.toml` et remplacez `YOUR_DATABASE_ID` :

```toml
[[d1_databases]]
binding = "DB"
database_name = "hackathondb"
database_id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"  # Votre ID ici
```

## Étape 4 : Appliquer les Migrations

```bash
# En production (base: hackathondb)
npm run db:migrate

# Ou en local pour tester
npm run db:migrate:local
```

Les migrations seront appliquées dans l'ordre :
1. `0001_initial_schema.sql` - Schéma de base
2. `0002_loyalty_system.sql` - Système de fidélité
3. `0003_user_roles_multi_establishments.sql` - Multi-établissements

## Étape 5 : Configurer les Secrets

```bash
# JWT Secret (générez une clé sécurisée)
wrangler secret put JWT_SECRET
# Entrez : votre-clé-jwt-super-secure-ici

# Google Places API Key
wrangler secret put GOOGLE_PLACES_API_KEY
# Entrez : votre-clé-api-google-places

# URL du frontend (pour les emails)
wrangler secret put FRONTEND_URL
# Entrez : https://votre-app.pages.dev (ou votre URL)

# OpenAI API Key (optionnel)
wrangler secret put OPENAI_API_KEY
# Entrez : votre-clé-openai (ou laissez vide)
```

## Étape 6 : Déployer le Backend

```bash
npm run deploy
```

Le déploiement peut prendre 1-2 minutes. À la fin, vous verrez :
```
✨  Deployed to https://restaurant-reviews-backend.VOTRE_SUBDOMAIN.workers.dev
```

**Copiez cette URL** - vous en aurez besoin pour le frontend.

## Étape 7 : Tester le Backend

```bash
# Test de santé
curl https://restaurant-reviews-backend.VOTRE_SUBDOMAIN.workers.dev/health

# Devrait retourner : {"status":"ok","timestamp":"..."}
```

## Étape 8 : Déployer le Frontend

### Option A : Cloudflare Pages (Recommandé)

1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. **Workers & Pages** > **Pages** > **Create a project**
3. Connectez votre repository Git (GitHub, GitLab, etc.)
4. Configuration :
   - **Framework preset** : Vite
   - **Build command** : `npm run build`
   - **Build output directory** : `dist`
   - **Root directory** : `/` (racine)

5. **Environment variables** (Settings > Variables) :
   ```
   VITE_API_BASE_URL = https://restaurant-reviews-backend.VOTRE_SUBDOMAIN.workers.dev/api
   VITE_GOOGLE_PLACES_API_KEY = votre_cle_api_google
   ```

6. **Save and Deploy**

### Option B : Build Manuel

```bash
# À la racine du projet
npm install
npm run build

# Le dossier dist/ contient les fichiers à déployer
# Uploadez-le vers Netlify, Vercel, ou votre hébergeur
```

## Étape 9 : Vérification Complète

1. **Backend** : `https://votre-worker.workers.dev/health` ✅
2. **Frontend** : Ouvrez votre URL Cloudflare Pages
3. **Test création compte** :
   - Cliquez sur "Commencer gratuitement"
   - Créez un compte
   - Vérifiez que tout fonctionne

## Étape 10 : Monitoring

```bash
# Voir les logs en temps réel
wrangler tail

# Voir les métriques
# Allez sur Cloudflare Dashboard > Workers > Analytics
```

## 🔧 Commandes Utiles

```bash
# Voir les secrets configurés
wrangler secret list

# Mettre à jour un secret
wrangler secret put NOM_SECRET

# Supprimer un secret
wrangler secret delete NOM_SECRET

# Voir les migrations appliquées
wrangler d1 migrations list restaurant-reviews-db

# Exécuter une requête SQL
wrangler d1 execute restaurant-reviews-db --command "SELECT COUNT(*) FROM users"

# Redéployer
npm run deploy
```

## 🐛 Troubleshooting

### Erreur "Database not found"
- Vérifiez que le `database_id` dans `wrangler.toml` est correct
- Vérifiez que les migrations ont été appliquées

### Erreur CORS
- Les headers CORS sont automatiquement ajoutés dans `worker.js`
- Vérifiez que `VITE_API_BASE_URL` pointe vers le bon Worker

### Erreur "Secret not found"
- Vérifiez avec `wrangler secret list`
- Configurez les secrets manquants

### Timeout Worker
- Les Workers gratuits ont 10ms CPU time
- Pour des opérations longues, utilisez des Workers séparés ou des queues

## ✅ Checklist de Déploiement

- [ ] Base de données D1 créée
- [ ] `wrangler.toml` configuré avec le bon `database_id`
- [ ] Migrations appliquées
- [ ] Secrets configurés (JWT_SECRET, GOOGLE_PLACES_API_KEY, FRONTEND_URL)
- [ ] Backend déployé et testé (`/health`)
- [ ] Frontend déployé avec les bonnes variables d'environnement
- [ ] Test de création de compte fonctionnel
- [ ] Logs vérifiés (`wrangler tail`)

## 🎉 C'est prêt !

Votre application est maintenant déployée sur Cloudflare. Les utilisateurs peuvent créer des comptes et utiliser toutes les fonctionnalités.

