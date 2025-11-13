# Script PowerShell pour déployer sur GitHub
# Exécutez : .\deploy-to-github.ps1

Write-Host "🚀 Déploiement sur GitHub" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Git est installé
try {
    $gitVersion = git --version
    Write-Host "✅ Git installé : $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git n'est pas installé. Installez-le depuis https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Vérifier si le repo est déjà initialisé
if (Test-Path .git) {
    Write-Host "✅ Repository Git déjà initialisé" -ForegroundColor Green
} else {
    Write-Host "📦 Initialisation du repository Git..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Repository initialisé" -ForegroundColor Green
}

# Demander l'URL du repository GitHub
Write-Host ""
Write-Host "📝 Entrez l'URL de votre repository GitHub :" -ForegroundColor Cyan
Write-Host "   Exemple: https://github.com/VOTRE_USERNAME/VOTRE_REPO.git" -ForegroundColor Gray
$repoUrl = Read-Host "URL"

# Vérifier si le remote existe déjà
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "⚠️  Remote 'origin' existe déjà : $remoteExists" -ForegroundColor Yellow
    $update = Read-Host "Voulez-vous le mettre à jour ? (o/n)"
    if ($update -eq "o" -or $update -eq "O") {
        git remote set-url origin $repoUrl
        Write-Host "✅ Remote mis à jour" -ForegroundColor Green
    }
} else {
    git remote add origin $repoUrl
    Write-Host "✅ Remote ajouté" -ForegroundColor Green
}

# Ajouter tous les fichiers
Write-Host ""
Write-Host "📦 Ajout des fichiers..." -ForegroundColor Yellow
git add .
Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green

# Commit
Write-Host ""
Write-Host "💾 Création du commit..." -ForegroundColor Yellow
$commitMessage = "Initial commit - Restaurant Reviews Platform with Cloudflare deployment"
git commit -m $commitMessage
Write-Host "✅ Commit créé" -ForegroundColor Green

# Renommer la branche en main
Write-Host ""
Write-Host "🌿 Configuration de la branche main..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branche configurée" -ForegroundColor Green

# Push
Write-Host ""
Write-Host "🚀 Poussage vers GitHub..." -ForegroundColor Yellow
Write-Host "   (Vous devrez peut-être vous authentifier)" -ForegroundColor Gray
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Code poussé sur GitHub avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
    Write-Host "   1. Allez sur votre repo GitHub > Settings > Secrets" -ForegroundColor White
    Write-Host "   2. Ajoutez les secrets : CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, etc." -ForegroundColor White
    Write-Host "   3. Consultez GITHUB_DEPLOY.md pour les détails" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du push. Vérifiez votre authentification GitHub." -ForegroundColor Red
    Write-Host "   Vous pouvez utiliser : gh auth login" -ForegroundColor Yellow
}

