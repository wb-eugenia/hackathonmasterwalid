/**
 * Wizard d'onboarding pour la configuration initiale
 */

import React, { useState } from 'react';
import { Restaurant } from '../../types';
import { onboardingService } from '../../services/apiService';
import './OnboardingWizard.css';

interface OnboardingWizardProps {
  establishment: Restaurant;
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ establishment, onComplete }) => {
  const [step, setStep] = useState(1);
  const [openingHours, setOpeningHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({});
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [menuPhotoUrl, setMenuPhotoUrl] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    negativeReviews: true,
    lowRating: true,
    newReviews: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setMenuPhotoUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onboardingService.completeOnboarding(establishment.id, {
        openingHours,
        contactEmail,
        contactPhone,
        website,
        menuPhotoUrl,
        notificationSettings,
      });
      onComplete();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboarding-step">
            <h2>Horaires d'ouverture</h2>
            <p>Définissez les horaires de votre établissement</p>
            <div className="hours-form">
              {days.map((day) => (
                <div key={day} className="day-hours">
                  <label>
                    <input
                      type="checkbox"
                      checked={!openingHours[day]?.closed}
                      onChange={(e) => {
                        setOpeningHours({
                          ...openingHours,
                          [day]: {
                            ...openingHours[day],
                            closed: !e.target.checked,
                            open: openingHours[day]?.open || '09:00',
                            close: openingHours[day]?.close || '18:00',
                          },
                        });
                      }}
                    />
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                  {!openingHours[day]?.closed && (
                    <div className="time-inputs">
                      <input
                        type="time"
                        value={openingHours[day]?.open || '09:00'}
                        onChange={(e) => {
                          setOpeningHours({
                            ...openingHours,
                            [day]: {
                              ...openingHours[day],
                              open: e.target.value,
                              close: openingHours[day]?.close || '18:00',
                              closed: false,
                            },
                          });
                        }}
                      />
                      <span>à</span>
                      <input
                        type="time"
                        value={openingHours[day]?.close || '18:00'}
                        onChange={(e) => {
                          setOpeningHours({
                            ...openingHours,
                            [day]: {
                              ...openingHours[day],
                              close: e.target.value,
                              open: openingHours[day]?.open || '09:00',
                              closed: false,
                            },
                          });
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="onboarding-step">
            <h2>Informations de contact</h2>
            <div className="form-group">
              <label>Email de contact</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@restaurant.com"
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            <div className="form-group">
              <label>Site web (optionnel)</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.restaurant.com"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="onboarding-step">
            <h2>Carte menu</h2>
            <p>Uploadez une photo de votre carte menu pour extraction automatique</p>
            <div className="menu-upload">
              {menuPhotoUrl ? (
                <div className="menu-preview">
                  <img src={menuPhotoUrl} alt="Menu" />
                  <button onClick={() => setMenuPhotoUrl('')}>✕ Supprimer</button>
                </div>
              ) : (
                <label className="upload-button">
                  📷 Choisir une photo
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="onboarding-step">
            <h2>Paramètres de notifications</h2>
            <p>Choisissez les notifications que vous souhaitez recevoir</p>
            <div className="notification-settings">
              <label>
                <input
                  type="checkbox"
                  checked={notificationSettings.negativeReviews}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      negativeReviews: e.target.checked,
                    })
                  }
                />
                Alertes pour avis négatifs
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={notificationSettings.lowRating}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      lowRating: e.target.checked,
                    })
                  }
                />
                Alertes pour notes faibles (≤ 2 étoiles)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={notificationSettings.newReviews}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      newReviews: e.target.checked,
                    })
                  }
                />
                Notifications pour nouveaux avis
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <h1>Configuration de {establishment.name}</h1>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
          <p>Étape {step} sur 4</p>
        </div>

        <div className="onboarding-content">{renderStep()}</div>

        <div className="onboarding-actions">
          {step > 1 && (
            <button className="back-button" onClick={() => setStep(step - 1)}>
              ← Précédent
            </button>
          )}
          {step < 4 ? (
            <button className="next-button" onClick={() => setStep(step + 1)}>
              Suivant →
            </button>
          ) : (
            <button
              className="complete-button"
              onClick={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Sauvegarde...' : '✅ Terminer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

