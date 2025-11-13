# 🔒 Correction de la fuite de clé API

## ⚠️ Problème détecté

GitGuardian a détecté qu'une clé API Google était exposée dans le dépôt GitHub.

## ✅ Actions correctives prises

1. **Clé retirée des fichiers de documentation**
   - `FIX_LOCALHOST_ISSUE.md` : Clé remplacée par un placeholder
   - `BUILD_WITH_ENV.md` : Clé remplacée par un placeholder

2. **Fichier `.env.example` créé**
   - Template pour les variables d'environnement
   - Aucune clé réelle n'est incluse

3. **`.gitignore` vérifié**
   - Les fichiers `.env*` sont bien ignorés par Git

## 🚨 Actions requises de votre côté

### 1. Révoquer l'ancienne clé API (RECOMMANDÉ)

La clé exposée doit être révoquée pour des raisons de sécurité :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Trouvez la clé API `AIzaSyBP10WJhmsYciKfnhxbuW3JfZXe170OuNk`
3. Cliquez sur "Révoquer" ou "Supprimer"
4. Créez une nouvelle clé API avec les mêmes restrictions

### 2. Mettre à jour les variables d'environnement

#### Localement
Créez un fichier `.env` à la racine du projet :
```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_PLACES_API_KEY=votre_nouvelle_cle_api
```

#### Sur Cloudflare Pages
1. Allez sur [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Sélectionnez votre projet Pages (`hackathonwalid`)
3. Allez dans "Settings" > "Environment variables"
4. Mettez à jour `VITE_GOOGLE_PLACES_API_KEY` avec votre nouvelle clé

### 3. Redéployer l'application

Après avoir mis à jour la clé, redéployez :
```bash
npm run build
npx wrangler pages deploy dist --project-name=hackathonwalid
```

## 📝 Bonnes pratiques pour l'avenir

1. **Ne jamais commiter de clés API**
   - Utilisez toujours des variables d'environnement
   - Vérifiez `.gitignore` avant chaque commit

2. **Utiliser des placeholders dans la documentation**
   - `votre_cle_api` au lieu de la vraie clé
   - `exemple.com` au lieu de vraies URLs

3. **Restreindre les clés API**
   - Limitez les domaines autorisés
   - Limitez les APIs accessibles
   - Utilisez des quotas pour éviter les abus

4. **Vérifier avant de push**
   ```bash
   # Vérifier qu'aucune clé n'est dans les fichiers
   git diff --cached | grep -i "AIzaSy\|sk-\|pk_"
   ```

## 🔍 Vérification

Pour vérifier qu'aucune clé n'est encore exposée :
```bash
# Rechercher des patterns de clés API
grep -r "AIzaSy" . --exclude-dir=node_modules --exclude-dir=.git
```

## 📚 Ressources

- [GitGuardian Guide](https://docs.gitguardian.com/internal-repositories-monitoring/integrations/git_hooks/pre_commit)
- [Google Cloud API Security](https://cloud.google.com/docs/authentication/api-keys)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

