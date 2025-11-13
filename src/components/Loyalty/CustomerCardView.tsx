/**
 * Interface client pour consulter sa carte fidélité
 * Affiche le solde, l'historique et les récompenses disponibles
 */

import React, { useState, useEffect } from 'react';
import { LoyaltyCard, LoyaltyTransaction } from '../../types/loyalty';
import { loyaltyCardService } from '../../services/loyaltyService';
import './CustomerCardView.css';

interface CustomerCardViewProps {
  cardId: string;
}

export const CustomerCardView: React.FC<CustomerCardViewProps> = ({ cardId }) => {
  const [card, setCard] = useState<LoyaltyCard | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCardData();
  }, [cardId]);

  const loadCardData = async () => {
    setIsLoading(true);
    try {
      const [cardData, transactionsData] = await Promise.all([
        loyaltyCardService.getById(cardId),
        loyaltyCardService.getTransactions(cardId, 20, 0),
      ]);
      setCard(cardData);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      console.error('Erreur chargement carte:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="customer-card-loading">Chargement...</div>;
  }

  if (!card) {
    return <div className="customer-card-error">Carte non trouvée</div>;
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return '➕';
      case 'spend':
        return '➖';
      case 'adjust':
        return '⚙️';
      case 'expire':
        return '⏰';
      default:
        return '📝';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earn':
        return '#4CAF50';
      case 'spend':
        return '#f44336';
      case 'adjust':
        return '#2196F3';
      case 'expire':
        return '#ff9800';
      default:
        return '#666';
    }
  };

  return (
    <div className="customer-card-view">
      <div className="card-header-section">
        <div className="card-visual">
          <div className="card-number-display">{card.card_number}</div>
          {card.status === 'active' && (
            <div className="card-status-badge active">Active</div>
          )}
        </div>
        <div className="points-display">
          <div className="points-value">{card.points_balance}</div>
          <div className="points-label">Points disponibles</div>
        </div>
      </div>

      <div className="card-stats">
        <div className="stat-item">
          <div className="stat-value">{card.total_points_earned}</div>
          <div className="stat-label">Points gagnés</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{card.total_points_spent}</div>
          <div className="stat-label">Points dépensés</div>
        </div>
      </div>

      <div className="transactions-section">
        <h3>Historique récent</h3>
        {transactions.length === 0 ? (
          <div className="empty-transactions">Aucune transaction</div>
        ) : (
          <div className="transactions-list">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-icon" style={{ color: getTransactionColor(transaction.transaction_type) }}>
                  {getTransactionIcon(transaction.transaction_type)}
                </div>
                <div className="transaction-details">
                  <div className="transaction-description">
                    {transaction.description || 'Transaction'}
                  </div>
                  <div className="transaction-date">
                    {new Date(transaction.created_at * 1000).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div
                  className="transaction-points"
                  style={{ color: getTransactionColor(transaction.transaction_type) }}
                >
                  {transaction.transaction_type === 'earn' || transaction.transaction_type === 'adjust' ? '+' : '-'}
                  {transaction.points}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

