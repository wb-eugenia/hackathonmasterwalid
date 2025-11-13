/**
 * Modal de détail d'une carte fidélité avec gestion des points
 */

import React, { useState, useEffect } from 'react';
import { LoyaltyCard, LoyaltyTransaction } from '../../types/loyalty';
import { loyaltyCardService, customerService } from '../../services/loyaltyService';
import { Customer } from '../../types/loyalty';
import './CardDetailModal.css';

interface CardDetailModalProps {
  card: LoyaltyCard;
  onClose: () => void;
  onUpdate: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose, onUpdate }) => {
  const [cardData, setCardData] = useState<LoyaltyCard>(card);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [showSpendPoints, setShowSpendPoints] = useState(false);
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsDescription, setPointsDescription] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(card.customer_id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCardData();
    if (card.establishment_id) {
      loadCustomers();
    }
  }, [card.id]);

  const loadCardData = async () => {
    try {
      const [cardInfo, transactionsData] = await Promise.all([
        loyaltyCardService.getById(card.id),
        loyaltyCardService.getTransactions(card.id, 50, 0),
      ]);
      setCardData(cardInfo);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const customersData = await customerService.list(card.establishment_id);
      setCustomers(customersData);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  const handleAddPoints = async () => {
    if (!pointsAmount || parseInt(pointsAmount) <= 0) {
      alert('Veuillez saisir un montant valide');
      return;
    }

    setIsLoading(true);
    try {
      await loyaltyCardService.addPoints(
        card.id,
        parseInt(pointsAmount),
        pointsDescription || 'Points ajoutés manuellement'
      );
      setPointsAmount('');
      setPointsDescription('');
      setShowAddPoints(false);
      loadCardData();
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'ajout de points');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpendPoints = async () => {
    if (!pointsAmount || parseInt(pointsAmount) <= 0) {
      alert('Veuillez saisir un montant valide');
      return;
    }

    if (cardData.points_balance < parseInt(pointsAmount)) {
      alert('Solde insuffisant');
      return;
    }

    setIsLoading(true);
    try {
      await loyaltyCardService.spendPoints(
        card.id,
        parseInt(pointsAmount),
        pointsDescription || 'Points dépensés'
      );
      setPointsAmount('');
      setPointsDescription('');
      setShowSpendPoints(false);
      loadCardData();
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la dépense de points');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkCustomer = async () => {
    if (!selectedCustomerId) {
      alert('Veuillez sélectionner un client');
      return;
    }

    setIsLoading(true);
    try {
      await loyaltyCardService.linkToCustomer(card.id, selectedCustomerId);
      loadCardData();
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la liaison');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card-detail-overlay" onClick={onClose}>
      <div className="card-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Carte {cardData.card_number}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          <div className="card-info-section">
            <div className="info-row">
              <span className="info-label">Statut:</span>
              <span className={`status-badge ${cardData.status}`}>{cardData.status}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Points:</span>
              <span className="points-value">{cardData.points_balance}</span>
            </div>
            {cardData.customer_name ? (
              <div className="info-row">
                <span className="info-label">Client:</span>
                <span>{cardData.customer_name} {cardData.customer_email && `(${cardData.customer_email})`}</span>
              </div>
            ) : (
              <div className="link-customer-section">
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && filteredCustomers.length > 0 && (
                  <div className="customer-dropdown">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="customer-option"
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setSearchTerm(customer.name);
                        }}
                      >
                        {customer.name} {customer.email && `(${customer.email})`}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  className="link-button"
                  onClick={handleLinkCustomer}
                  disabled={!selectedCustomerId || isLoading}
                >
                  Lier au client
                </button>
              </div>
            )}
          </div>

          <div className="actions-section">
            <button
              className="action-button add-points"
              onClick={() => {
                setShowAddPoints(true);
                setShowSpendPoints(false);
              }}
            >
              ➕ Ajouter des points
            </button>
            <button
              className="action-button spend-points"
              onClick={() => {
                setShowSpendPoints(true);
                setShowAddPoints(false);
              }}
              disabled={cardData.points_balance === 0}
            >
              ➖ Dépenser des points
            </button>
          </div>

          {(showAddPoints || showSpendPoints) && (
            <div className="points-form">
              <input
                type="number"
                placeholder="Nombre de points"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                min="1"
              />
              <input
                type="text"
                placeholder="Description (optionnel)"
                value={pointsDescription}
                onChange={(e) => setPointsDescription(e.target.value)}
              />
              <div className="form-actions">
                <button
                  className="confirm-button"
                  onClick={showAddPoints ? handleAddPoints : handleSpendPoints}
                  disabled={isLoading || !pointsAmount}
                >
                  {isLoading ? '⏳' : '✅'} Confirmer
                </button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setShowAddPoints(false);
                    setShowSpendPoints(false);
                    setPointsAmount('');
                    setPointsDescription('');
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          <div className="transactions-section">
            <h3>Historique des transactions</h3>
            {transactions.length === 0 ? (
              <div className="empty-state">Aucune transaction</div>
            ) : (
              <div className="transactions-list">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-row">
                    <div className="transaction-type">{transaction.transaction_type}</div>
                    <div className="transaction-desc">{transaction.description || '-'}</div>
                    <div className={`transaction-points ${transaction.transaction_type}`}>
                      {transaction.transaction_type === 'earn' ? '+' : '-'}{transaction.points}
                    </div>
                    <div className="transaction-date">
                      {new Date(transaction.created_at * 1000).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

