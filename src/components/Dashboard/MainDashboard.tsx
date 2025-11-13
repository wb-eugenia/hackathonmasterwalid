/**
 * Dashboard principal avec onglets (Avis, Fidélité, Rentabilité)
 */

import React, { useState } from 'react';
import { ReviewsDashboard } from './ReviewsDashboard';
import { LoyaltyDashboard } from '../Loyalty/LoyaltyDashboard';
import { ProfitabilityDashboard } from './ProfitabilityDashboard';
import './MainDashboard.css';

interface MainDashboardProps {
  establishmentId: string;
}

type TabType = 'reviews' | 'loyalty' | 'profitability';

export const MainDashboard: React.FC<MainDashboardProps> = ({ establishmentId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('reviews');

  return (
    <div className="main-dashboard">
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          📊 Avis Google
        </button>
        <button
          className={`tab-button ${activeTab === 'loyalty' ? 'active' : ''}`}
          onClick={() => setActiveTab('loyalty')}
        >
          🎁 Fidélité
        </button>
        <button
          className={`tab-button ${activeTab === 'profitability' ? 'active' : ''}`}
          onClick={() => setActiveTab('profitability')}
        >
          💰 Rentabilité
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'reviews' && <ReviewsDashboard />}
        {activeTab === 'loyalty' && <LoyaltyDashboard establishmentId={establishmentId} />}
        {activeTab === 'profitability' && <ProfitabilityDashboard establishmentId={establishmentId} />}
      </div>
    </div>
  );
};

