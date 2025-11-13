# ✅ Checklist de Déploiement Cloudflare

## Avant de commencer

- [ ] Compte Cloudflare créé
- [ ] Wrangler CLI installé : `npm install -g wrangler`
- [ ] Authentifié : `wrangler login`

## Backend

### Configuration
- [ ] Dépendances installées : `cd backend && npm install`
- [ ] Base D1 créée (nom: hackathondb) : `npm run db:create`
- [ ] `database_id` copié et mis à jour dans `wrangler.toml`
- [ ] Migrations appliquées : `npm run db:migrate`

### Secrets
- [ ] `JWT_SECRET` configuré : `wrangler secret put JWT_SECRET`
- [ ] `GOOGLE_PLACES_API_KEY` configuré
- [ ] `FRONTEND_URL` configuré (mettre à jour après déploiement frontend)

### Déploiement
- [ ] Backend déployé : `npm run deploy`
- [ ] URL du Worker copiée
- [ ] Test `/health` : `curl https://votre-worker.workers.dev/health`

## Frontend

### Configuration
- [ ] Variables d'environnement configurées :
  - `VITE_API_BASE_URL` = URL du Worker + `/api`
  - `VITE_GOOGLE_PLACES_API_KEY` = Votre clé API

### Déploiement
- [ ] Frontend déployé (Cloudflare Pages ou autre)
- [ ] URL du frontend copiée

### Post-déploiement
- [ ] Mettre à jour `FRONTEND_URL` dans les secrets si nécessaire
- [ ] Tester la création de compte
- [ ] Vérifier les logs : `wrangler tail`

## Tests finaux

- [ ] Landing page s'affiche
- [ ] Création de compte fonctionne
- [ ] Connexion fonctionne
- [ ] Recherche d'établissement fonctionne
- [ ] Dashboard s'affiche

## 🎉 Déploiement réussi !

