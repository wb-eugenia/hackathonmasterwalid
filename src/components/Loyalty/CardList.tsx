/**
 * Liste des cartes fidélité avec filtres
 */

import React, { useState } from 'react';
import { LoyaltyCard } from '../../types/loyalty';
import './CardList.css';

interface CardListProps {
  cards: LoyaltyCard[];
  onCardSelect: (card: LoyaltyCard) => void;
  onRefresh: () => void;
}

export const CardList: React.FC<CardListProps> = ({ cards, onCardSelect, onRefresh }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'linked' | 'unlinked'>('all');

  const filteredCards = cards.filter((card) => {
    if (filter === 'all') return true;
    if (filter === 'active') return card.status === 'active';
    if (filter === 'inactive') return card.status !== 'active';
    if (filter === 'linked') return !!card.customer_id;
    if (filter === 'unlinked') return !card.customer_id;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      active: { label: 'Active', className: 'badge-active' },
      inactive: { label: 'Inactive', className: 'badge-inactive' },
      expired: { label: 'Expirée', className: 'badge-expired' },
      blocked: { label: 'Bloquée', className: 'badge-blocked' },
    };
    return badges[status] || { label: status, className: 'badge-default' };
  };

  return (
    <div className="card-list-container">
      <div className="card-list-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Toutes ({cards.length})
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Actives ({cards.filter((c) => c.status === 'active').length})
        </button>
        <button
          className={filter === 'linked' ? 'active' : ''}
          onClick={() => setFilter('linked')}
        >
          Liées ({cards.filter((c) => c.customer_id).length})
        </button>
        <button
          className={filter === 'unlinked' ? 'active' : ''}
          onClick={() => setFilter('unlinked')}
        >
          Non liées ({cards.filter((c) => !c.customer_id).length})
        </button>
      </div>

      <div className="card-list">
        {filteredCards.length === 0 ? (
          <div className="empty-state">
            <p>Aucune carte trouvée</p>
          </div>
        ) : (
          filteredCards.map((card) => {
            const statusBadge = getStatusBadge(card.status);
            return (
              <div
                key={card.id}
                className="card-item"
                onClick={() => onCardSelect(card)}
              >
                <div className="card-header">
                  <div className="card-number">{card.card_number}</div>
                  <span className={`badge ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                </div>
                <div className="card-info">
                  {card.customer_name ? (
                    <div className="card-customer">
                      👤 {card.customer_name}
                      {card.customer_email && (
                        <span className="card-email"> ({card.customer_email})</span>
                      )}
                    </div>
                  ) : (
                    <div className="card-customer-unlinked">Non liée à un client</div>
                  )}
                  <div className="card-points">
                    ⭐ {card.points_balance} points
                  </div>
                </div>
                {card.card_code && (
                  <div className="card-code">
                    Code: {card.card_code}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

