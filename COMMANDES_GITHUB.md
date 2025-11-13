# 📝 Commandes GitHub - Copier/Coller

## 🚀 Option 1 : Script Automatique (Recommandé)

```powershell
# Exécutez le script
.\deploy-to-github.ps1
```

Le script vous guidera étape par étape.

## 📋 Option 2 : Commandes Manuelles

### 1. Initialiser Git

```powershell
git init
```

### 2. Créer le Repository sur GitHub

1. Allez sur https://github.com/new
2. Nommez votre repo (ex: `restaurant-reviews-platform`)
3. **Ne cochez PAS** "Initialize with README"
4. Cliquez sur **Create repository**
5. **Copiez l'URL** (ex: `https://github.com/VOTRE_USERNAME/VOTRE_REPO.git`)

### 3. Pousser le Code

```powershell
# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Restaurant Reviews Platform"

# Renommer branche en main
git branch -M main

# Ajouter remote (remplacez par votre URL)
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Pousser
git push -u origin main
```

### 4. Mises à Jour Futures

```powershell
# Voir les changements
git status

# Ajouter les fichiers
git add .

# Commit
git commit -m "Description des changements"

# Push
git push
```

## 🔐 Configuration des Secrets GitHub

Après avoir poussé le code, configurez les secrets :

1. Allez sur votre repo GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. **New repository secret**

### Secrets Requis :

```
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
VITE_API_BASE_URL
VITE_GOOGLE_PLACES_API_KEY
```

Voir `GITHUB_DEPLOY.md` pour les détails.

## ✅ Vérification

1. Allez sur votre repo > **Actions**
2. Vous verrez les workflows de déploiement
3. Le déploiement se fait automatiquement à chaque push

