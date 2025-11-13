# 📝 Commandes GitHub - Copier/Coller

## Initialisation et Premier Push

```powershell
# 1. Initialiser Git
git init

# 2. Ajouter tous les fichiers
git add .

# 3. Premier commit
git commit -m "Initial commit - Restaurant Reviews Platform"

# 4. Renommer branche en main
git branch -M main

# 5. Ajouter remote (remplacez VOTRE_USERNAME et VOTRE_REPO)
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# 6. Pousser
git push -u origin main
```

## Commandes de Mise à Jour

```powershell
# Voir les changements
git status

# Ajouter les fichiers modifiés
git add .

# Ou ajouter un fichier spécifique
git add nom-du-fichier

# Commit avec message
git commit -m "Description des changements"

# Pousser vers GitHub
git push

# Pousser une nouvelle branche
git push -u origin nom-de-la-branche
```

## Gestion des Branches

```powershell
# Créer une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# Changer de branche
git checkout main

# Voir toutes les branches
git branch

# Supprimer une branche locale
git branch -d nom-branche
```

## Voir l'Historique

```powershell
# Voir les commits
git log

# Voir les commits de manière compacte
git log --oneline

# Voir les différences
git diff
```

## Annuler des Changements

```powershell
# Annuler les modifications non commitées
git checkout -- nom-fichier

# Annuler le dernier commit (garder les fichiers)
git reset --soft HEAD~1

# Voir ce qui sera commité
git status
```

## Configuration Git (si nécessaire)

```powershell
# Configurer votre nom
git config --global user.name "Votre Nom"

# Configurer votre email
git config --global user.email "votre@email.com"

# Voir la configuration
git config --list
```

