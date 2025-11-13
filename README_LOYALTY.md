# Système de Fidélité Client - Documentation

## 🎯 Vue d'ensemble

Système complet de gestion de cartes fidélité pour restaurants avec :
- Création et scan de cartes (photo, QR, code-barres)
- Gestion des clients et association aux cartes
- Suivi des points (accumulation, dépense)
- Interface patron et interface client

## 📋 Fonctionnalités

### Module Patron

1. **Création de cartes fidélité**
   - Scan de carte physique (photo)
   - Scan QR code / code-barres
   - Saisie manuelle du numéro/code
   - Association à un client (optionnel)

2. **Gestion des cartes**
   - Liste avec filtres (actives, liées, etc.)
   - Détails d'une carte
   - Ajout/retrait de points
   - Historique des transactions

3. **Gestion des clients**
   - Création de clients
   - Recherche de clients
   - Association carte-client

### Interface Client

1. **Consultation de la carte**
   - Solde de points
   - Historique des transactions
   - Statistiques (points gagnés/dépensés)

## 🗄️ Structure de la Base de Données

### Tables principales

- **customers** : Clients du restaurant
- **loyalty_cards** : Cartes fidélité
- **loyalty_transactions** : Historique des transactions de points
- **loyalty_rules** : Règles de fidélité (programmes)
- **rewards** : Récompenses disponibles
- **claimed_rewards** : Récompenses réclamées

## 🔌 API Endpoints

### Cartes fidélité

- `POST /api/loyalty/cards` - Créer une carte
- `POST /api/loyalty/cards/scan` - Scanner une carte
- `GET /api/loyalty/cards` - Liste des cartes
- `GET /api/loyalty/cards/:id` - Détails d'une carte
- `POST /api/loyalty/cards/:id/link` - Associer à un client
- `POST /api/loyalty/cards/:id/points` - Transaction de points
- `GET /api/loyalty/cards/:id/transactions` - Historique

### Clients

- `POST /api/customers` - Créer un client
- `GET /api/customers` - Liste des clients
- `GET /api/customers/:id` - Détails d'un client
- `PUT /api/customers/:id` - Mettre à jour
- `DELETE /api/customers/:id` - Supprimer

## 🚀 Utilisation

### Créer une carte

1. Cliquez sur "Créer une carte"
2. Choisissez le type de scan (photo, QR, code-barres)
3. Scannez ou saisissez manuellement
4. (Optionnel) Associez à un client
5. Confirmez la création

### Gérer les points

1. Sélectionnez une carte
2. Cliquez sur "Ajouter des points" ou "Dépenser des points"
3. Saisissez le montant et une description
4. Confirmez

### Consulter la carte (client)

1. Accédez à l'interface client avec l'ID de la carte
2. Visualisez le solde et l'historique

## 🔧 Configuration OCR

Le service OCR est actuellement en mode simulation. Pour activer :

1. **Google Cloud Vision API** :
   ```javascript
   // backend/src/services/ocrService.js
   import vision from '@google-cloud/vision';
   ```

2. **Tesseract.js** (client-side) :
   ```bash
   npm install tesseract.js
   ```

3. **jsQR** (pour QR codes) :
   ```bash
   npm install jsqr
   ```

## 📝 TODO

- [ ] Implémenter OCR réel (Google Cloud Vision ou Tesseract)
- [ ] Implémenter lecture QR/barcode (jsQR, quaggaJS)
- [ ] Ajouter les règles de fidélité (points par euro, etc.)
- [ ] Système de récompenses
- [ ] Notifications pour les clients
- [ ] Export des données (CSV, PDF)
- [ ] Statistiques avancées

## 🔒 Sécurité

- Seul le patron (propriétaire de l'établissement) peut créer et gérer les cartes
- Authentification JWT requise pour toutes les routes
- Validation des données côté serveur
- Protection contre les doublons de cartes

