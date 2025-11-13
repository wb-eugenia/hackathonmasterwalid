/**
 * Dashboard patron pour la gestion des cartes fidélité
 */

import React, { useState, useEffect } from 'react';
import { LoyaltyCard, Customer } from '../../types/loyalty';
import { loyaltyCardService, customerService } from '../../services/loyaltyService';
import { CardScanner } from './CardScanner';
import { CardList } from './CardList';
import { CardDetailModal } from './CardDetailModal';
import './LoyaltyDashboard.css';

interface LoyaltyDashboardProps {
  establishmentId: string;
}

export const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({ establishmentId }) => {
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedCard, setSelectedCard] = useState<LoyaltyCard | null>(null);

  /**
   * Charge les cartes fidélité
   */
  useEffect(() => {
    loadCards();
  }, [establishmentId]);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const cardsData = await loyaltyCardService.list(establishmentId);
      setCards(cardsData);
    } catch (error) {
      console.error('Erreur chargement cartes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Gère la création d'une nouvelle carte
   */
  const handleCardCreated = (card: LoyaltyCard) => {
    setCards([card, ...cards]);
    setShowScanner(false);
  };

  /**
   * Statistiques rapides
   */
  const stats = {
    total: cards.length,
    active: cards.filter((c) => c.status === 'active').length,
    totalPoints: cards.reduce((sum, c) => sum + c.points_balance, 0),
    linked: cards.filter((c) => c.customer_id).length,
  };

  return (
    <div className="loyalty-dashboard">
      <div className="loyalty-header">
        <h1>Gestion des cartes fidélité</h1>
        <button className="create-card-button" onClick={() => setShowScanner(true)}>
          ➕ Créer une carte
        </button>
      </div>

      <div className="loyalty-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total cartes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Actives</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.linked}</div>
          <div className="stat-label">Liées à un client</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalPoints}</div>
          <div className="stat-label">Points totaux</div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <CardList
          cards={cards}
          onCardSelect={setSelectedCard}
          onRefresh={loadCards}
        />
      )}

      {showScanner && (
        <CardScanner
          establishmentId={establishmentId}
          onCardCreated={handleCardCreated}
          onCancel={() => setShowScanner(false)}
        />
      )}

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={() => {
            loadCards();
            setSelectedCard(null);
          }}
        />
      )}
    </div>
  );
};

