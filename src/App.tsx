/**
 * Composant principal de l'application
 * Gère la navigation entre les différentes étapes :
 * 1. Authentification
 * 2. Recherche de restaurant
 * 3. Dashboard des avis
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/Landing/LandingPage';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { RestaurantSearch } from './components/Search/RestaurantSearch';
import { ReviewsDashboard } from './components/Dashboard/ReviewsDashboard';
import { LoyaltyDashboard } from './components/Loyalty/LoyaltyDashboard';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';
import { EstablishmentSelector } from './components/Establishment/EstablishmentSelector';
import { MainDashboard } from './components/Dashboard/MainDashboard';
import { userEstablishmentService } from './services/apiService';
import { onboardingService } from './services/apiService';
import './App.css';

/**
 * Composant interne qui gère l'affichage conditionnel selon l'état de l'application
 */
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { selectedRestaurant, setSelectedRestaurant } = useApp();
  const [showLanding, setShowLanding] = useState(!isAuthenticated);
  const [showRegister, setShowRegister] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentEstablishmentId, setCurrentEstablishmentId] = useState<string | null>(null);
  const [userEstablishments, setUserEstablishments] = useState<any[]>([]);

  // Charge les établissements de l'utilisateur
  useEffect(() => {
    if (isAuthenticated) {
      loadUserEstablishments();
    }
  }, [isAuthenticated]);

  const loadUserEstablishments = async () => {
    try {
      const establishments = await userEstablishmentService.list();
      setUserEstablishments(establishments);
      
      if (establishments.length > 0 && !currentEstablishmentId) {
        setCurrentEstablishmentId(establishments[0].establishment_id);
        // Charge l'établissement sélectionné
        const { establishmentService } = await import('./services/apiService');
        const establishment = await establishmentService.getById(establishments[0].establishment_id);
        setSelectedRestaurant({
          id: establishment.id,
          name: establishment.name,
          department: establishment.department || '',
          address: establishment.address,
          placeId: establishment.google_place_id || '',
        });
      }
    } catch (error) {
      console.error('Erreur chargement établissements:', error);
    }
  };

  // Vérifie si l'onboarding est complété
  useEffect(() => {
    if (selectedRestaurant && isAuthenticated) {
      checkOnboarding();
    }
  }, [selectedRestaurant, isAuthenticated]);

  const checkOnboarding = async () => {
    if (!selectedRestaurant) return;
    
    try {
      const config = await onboardingService.getConfig(selectedRestaurant.id);
      if (!config || !config.onboarding_completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      // Si pas de config, affiche l'onboarding
      setShowOnboarding(true);
    }
  };

  // Écoute les événements pour basculer entre login et register
  useEffect(() => {
    const handleShowRegister = () => {
      setShowRegister(true);
      setShowLanding(false);
    };
    const handleShowLogin = () => {
      setShowRegister(false);
      setShowLanding(false);
    };
    
    window.addEventListener('showRegister', handleShowRegister);
    window.addEventListener('showLogin', handleShowLogin);
    
    return () => {
      window.removeEventListener('showRegister', handleShowRegister);
      window.removeEventListener('showLogin', handleShowLogin);
    };
  }, []);

  // Si l'utilisateur se connecte, cache la landing page
  useEffect(() => {
    if (isAuthenticated) {
      setShowLanding(false);
    }
  }, [isAuthenticated]);

  // Landing Page
  if (showLanding && !isAuthenticated) {
    return (
      <LandingPage
        onGetStarted={() => {
          setShowLanding(false);
          setShowRegister(true);
        }}
      />
    );
  }

  // Étape 1: Authentification
  if (!isAuthenticated) {
    return showRegister ? (
      <RegisterForm />
    ) : (
      <LoginForm />
    );
  }

  // Étape 2: Recherche de restaurant (si aucun restaurant sélectionné et aucun établissement)
  if (!selectedRestaurant && userEstablishments.length === 0) {
    return (
      <RestaurantSearch
        onRestaurantSelect={async (restaurant) => {
          // Sauvegarde l'établissement et le lie à l'utilisateur
          try {
            const { establishmentService } = await import('./services/apiService');
            const saved = await establishmentService.create({
              name: restaurant.name,
              google_place_id: restaurant.placeId,
              address: restaurant.address,
              department: restaurant.department,
            });
            
            // Lie l'établissement à l'utilisateur
            await userEstablishmentService.link(saved.id, 'owner');
            
            setSelectedRestaurant({
              id: saved.id,
              name: saved.name,
              department: saved.department || '',
              address: saved.address,
              placeId: saved.google_place_id || '',
            });
            
            setCurrentEstablishmentId(saved.id);
            setShowOnboarding(true);
          } catch (error) {
            console.error('Erreur sauvegarde établissement:', error);
            setSelectedRestaurant(restaurant);
          }
        }}
      />
    );
  }

  // Étape 3: Onboarding (si nécessaire)
  if (showOnboarding && selectedRestaurant) {
    return (
      <OnboardingWizard
        establishment={selectedRestaurant}
        onComplete={() => {
          setShowOnboarding(false);
        }}
      />
    );
  }

  // Étape 4: Dashboard principal
  return (
    <div className="app-dashboard-container">
      {userEstablishments.length > 1 && (
        <EstablishmentSelector
          currentEstablishmentId={currentEstablishmentId || undefined}
          onSelect={async (establishmentId) => {
            setCurrentEstablishmentId(establishmentId);
            const { establishmentService } = await import('./services/apiService');
            const establishment = await establishmentService.getById(establishmentId);
            setSelectedRestaurant({
              id: establishment.id,
              name: establishment.name,
              department: establishment.department || '',
              address: establishment.address,
              placeId: establishment.google_place_id || '',
            });
          }}
        />
      )}
      {selectedRestaurant && (
        <MainDashboard establishmentId={selectedRestaurant.id} />
      )}
    </div>
  );
};

/**
 * Composant racine de l'application
 * Enveloppe l'application avec les providers de contexte
 */
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;


