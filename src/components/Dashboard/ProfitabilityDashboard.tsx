/**
 * Dashboard de rentabilité
 */

import React, { useState, useEffect } from 'react';
import { analysisService, financialService } from '../../services/apiService';
import './ProfitabilityDashboard.css';

interface ProfitabilityDashboardProps {
  establishmentId: string;
}

export const ProfitabilityDashboard: React.FC<ProfitabilityDashboardProps> = ({ establishmentId }) => {
  const [revenue, setRevenue] = useState('');
  const [costs, setCosts] = useState('');
  const [profitability, setProfitability] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [financialData, setFinancialData] = useState<any[]>([]);

  useEffect(() => {
    loadFinancialData();
  }, [establishmentId]);

  const loadFinancialData = async () => {
    try {
      const data = await financialService.getByEstablishment(establishmentId);
      setFinancialData(data.financialData || []);
    } catch (error) {
      console.error('Erreur chargement données financières:', error);
    }
  };

  const calculateProfitability = async () => {
    if (!revenue || !costs) {
      alert('Veuillez saisir les revenus et les coûts');
      return;
    }

    setIsLoading(true);
    try {
      const result = await analysisService.getProfitability(
        establishmentId,
        parseFloat(revenue),
        parseFloat(costs)
      );
      setProfitability(result);
    } catch (error: any) {
      alert(error.message || 'Erreur lors du calcul');
    } finally {
      setIsLoading(false);
    }
  };

  const saveFinancialData = async () => {
    if (!revenue || !costs) {
      alert('Veuillez saisir les revenus et les coûts');
      return;
    }

    setIsLoading(true);
    try {
      await financialService.create(establishmentId, {
        date: new Date().toISOString().split('T')[0],
        revenue: parseFloat(revenue),
        costs: parseFloat(costs),
      });
      await loadFinancialData();
      await calculateProfitability();
      alert('Données sauvegardées');
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profitability-dashboard">
      <h1>Analyse de rentabilité</h1>

      <div className="profitability-form">
        <div className="form-row">
          <div className="form-group">
            <label>Revenus (€)</label>
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Coûts (€)</label>
            <input
              type="number"
              value={costs}
              onChange={(e) => setCosts(e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
        <div className="form-actions">
          <button onClick={calculateProfitability} disabled={isLoading}>
            Calculer
          </button>
          <button onClick={saveFinancialData} disabled={isLoading} className="save-button">
            Sauvegarder
          </button>
        </div>
      </div>

      {profitability && (
        <div className="profitability-results">
          <h2>Résultats</h2>
          <div className="results-grid">
            <div className="result-card">
              <div className="result-label">Profit actuel</div>
              <div className="result-value">{profitability.current?.profit?.toFixed(2)} €</div>
            </div>
            <div className="result-card">
              <div className="result-label">Marge de profit</div>
              <div className="result-value">{profitability.current?.profitMargin?.toFixed(2)} %</div>
            </div>
            <div className="result-card">
              <div className="result-label">Impact estimé des avis</div>
              <div className="result-value">{profitability.estimatedImpact?.profitImpact?.toFixed(2)} €</div>
            </div>
          </div>
        </div>
      )}

      {financialData.length > 0 && (
        <div className="financial-history">
          <h2>Historique financier</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Revenus</th>
                <th>Coûts</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {financialData.map((data) => (
                <tr key={data.id}>
                  <td>{new Date(data.date).toLocaleDateString('fr-FR')}</td>
                  <td>{data.revenue?.toFixed(2)} €</td>
                  <td>{data.costs?.toFixed(2)} €</td>
                  <td>{data.profit?.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

