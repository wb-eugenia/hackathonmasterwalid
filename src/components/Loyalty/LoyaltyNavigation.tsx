/**
 * Navigation entre les différentes sections de l'application
 */

import React from 'react';
import './LoyaltyNavigation.css';

interface LoyaltyNavigationProps {
  currentView: 'reviews' | 'loyalty';
  onViewChange: (view: 'reviews' | 'loyalty') => void;
}

export const LoyaltyNavigation: React.FC<LoyaltyNavigationProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="loyalty-navigation">
      <button
        className={`nav-button ${currentView === 'reviews' ? 'active' : ''}`}
        onClick={() => onViewChange('reviews')}
      >
        📊 Avis
      </button>
      <button
        className={`nav-button ${currentView === 'loyalty' ? 'active' : ''}`}
        onClick={() => onViewChange('loyalty')}
      >
        🎁 Fidélité
      </button>
    </div>
  );
};

