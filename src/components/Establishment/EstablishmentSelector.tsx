/**
 * Sélecteur d'établissement pour multi-établissements
 */

import React, { useState, useEffect } from 'react';
import { userEstablishmentService, UserEstablishment } from '../../services/apiService';
import './EstablishmentSelector.css';

interface EstablishmentSelectorProps {
  onSelect: (establishmentId: string) => void;
  currentEstablishmentId?: string;
}

export const EstablishmentSelector: React.FC<EstablishmentSelectorProps> = ({
  onSelect,
  currentEstablishmentId,
}) => {
  const [establishments, setEstablishments] = useState<UserEstablishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEstablishments();
  }, []);

  const loadEstablishments = async () => {
    setIsLoading(true);
    try {
      const data = await userEstablishmentService.list();
      setEstablishments(data);
      if (data.length > 0 && !currentEstablishmentId) {
        onSelect(data[0].establishment_id);
      }
    } catch (error) {
      console.error('Erreur chargement établissements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="establishment-selector-loading">Chargement...</div>;
  }

  if (establishments.length === 0) {
    return null;
  }

  if (establishments.length === 1) {
    return null; // Pas besoin de sélecteur si un seul établissement
  }

  return (
    <div className="establishment-selector">
      <label>Établissement :</label>
      <select
        value={currentEstablishmentId || establishments[0]?.establishment_id}
        onChange={(e) => onSelect(e.target.value)}
        className="establishment-select"
      >
        {establishments.map((ue) => (
          <option key={ue.id} value={ue.establishment_id}>
            {ue.establishment_name} ({ue.role})
          </option>
        ))}
      </select>
    </div>
  );
};

