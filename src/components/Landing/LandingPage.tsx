/**
 * Landing page principale de l'application
 * Présente les 3 fonctionnalités principales et permet de créer un compte
 */

import React from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Gérez votre restaurant avec <span className="highlight">intelligence</span>
          </h1>
          <p className="hero-subtitle">
            Plateforme complète pour gérer vos avis Google, votre programme de fidélité 
            et analyser la rentabilité de votre établissement
          </p>
          <div className="hero-actions">
            <button className="cta-button" onClick={onGetStarted}>
              Commencer gratuitement
            </button>
            <button
              className="cta-button-secondary"
              onClick={() => {
                const event = new CustomEvent('showLogin');
                window.dispatchEvent(event);
              }}
            >
              Se connecter
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Tout ce dont vous avez besoin</h2>
        <p className="section-subtitle">
          Une solution complète pour optimiser la gestion de votre restaurant
        </p>

        <div className="features-grid">
          {/* Feature 1: Avis Google */}
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Avis Google Automatisés</h3>
            <p className="feature-description">
              Collectez et analysez automatiquement tous vos avis Google. 
              Visualisez les tendances, filtrez par note et période, et recevez 
              des réponses automatiques générées par IA pour améliorer votre réputation.
            </p>
            <ul className="feature-list">
              <li>✅ Collecte automatique des avis</li>
              <li>✅ Analyse de sentiment IA</li>
              <li>✅ Réponses automatiques personnalisées</li>
              <li>✅ Statistiques détaillées</li>
            </ul>
          </div>

          {/* Feature 2: Fidélité */}
          <div className="feature-card">
            <div className="feature-icon">🎁</div>
            <h3 className="feature-title">Programme de Fidélité</h3>
            <p className="feature-description">
              Créez et gérez facilement vos cartes fidélité. Scannez les cartes physiques, 
              suivez les points de vos clients, et générez automatiquement des récompenses. 
              Tout en un seul endroit.
            </p>
            <ul className="feature-list">
              <li>✅ Scan de cartes (photo, QR, code-barres)</li>
              <li>✅ Gestion des points et transactions</li>
              <li>✅ Base clients centralisée</li>
              <li>✅ Interface client pour consultation</li>
            </ul>
          </div>

          {/* Feature 3: Rentabilité */}
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3 className="feature-title">Analyse de Rentabilité</h3>
            <p className="feature-description">
              Suivez vos revenus, coûts et profits en temps réel. Calculez l'impact 
              de vos avis sur votre rentabilité et prenez des décisions éclairées 
              pour optimiser votre activité.
            </p>
            <ul className="feature-list">
              <li>✅ Suivi financier complet</li>
              <li>✅ Calculs de rentabilité automatiques</li>
              <li>✅ Impact des avis sur les revenus</li>
              <li>✅ Historique et rapports</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Prêt à optimiser votre restaurant ?</h2>
          <p className="cta-subtitle">
            Rejoignez des centaines de restaurateurs qui font confiance à notre plateforme
          </p>
          <button className="cta-button-large" onClick={onGetStarted}>
            Créer mon compte gratuitement
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2024 Restaurant Management Platform. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

