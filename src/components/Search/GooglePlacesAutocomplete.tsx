/**
 * Composant d'autocomplete Google Places
 * Utilise les Google Maps Extended Component Library
 * Documentation: https://developers.google.com/maps/documentation/javascript/extended-component-library
 */

import React, { useEffect, useRef, useState } from 'react';
import { Restaurant } from '../../types';
import './GooglePlacesAutocomplete.css';

// Déclaration des types pour les web components Google Maps
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmpx-api-loader': React.DetailedHTMLProps<any, any>;
      'gmpx-place-picker': React.DetailedHTMLProps<any, any>;
    }
  }
}

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (restaurant: Restaurant) => void;
  placeholder?: string;
}

export const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  onPlaceSelect,
  placeholder = 'Entrez une adresse ou un nom de restaurant',
}) => {
  const placePickerRef = useRef<HTMLElement>(null);
  const apiLoaderRef = useRef<HTMLElement>(null);
  const [selectedPlace, setSelectedPlace] = useState<Restaurant | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';

  useEffect(() => {
    // Charge le script Google Maps Extended Component Library
    if (!document.querySelector('script[src*="@googlemaps/extended-component-library"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js';
      document.head.appendChild(script);
    }

    // Configure l'API loader avec la clé (utilise setAttribute car React ne permet pas "key" comme prop)
    if (apiLoaderRef.current && apiKey) {
      apiLoaderRef.current.setAttribute('key', apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    // Polling pour détecter la sélection d'un lieu
    let pollingInterval: ReturnType<typeof setInterval> | null = null;
    let lastValue = '';
    let lastPlaceId = '';

    const checkPlaceSelection = () => {
      const placePicker = placePickerRef.current as any;
      if (!placePicker) return;

      try {
        // Vérifie si la valeur du champ a changé
        const currentValue = placePicker.value || placePicker.shadowRoot?.querySelector('input')?.value || '';
        
        // Si la valeur a changé et qu'elle n'est pas vide, c'est qu'un lieu a été sélectionné
        // On accepte même les valeurs courtes (minimum 2 caractères) pour permettre la confirmation
        if (currentValue && currentValue !== lastValue && currentValue.length >= 2) {
          lastValue = currentValue;

          // Essaie de récupérer le lieu depuis différentes propriétés
          const place = 
            placePicker.place || 
            placePicker.selectedPlace || 
            (placePicker as any).__place ||
            placePicker.shadowRoot?.querySelector('[data-place]')?.dataset?.place;

          // Si on a un objet place
          if (place && typeof place === 'object') {
            let placeId = place.id || place.placeId || place.place_id || place.placeID || '';
            
            // Si pas de placeId, essaie de le récupérer depuis le composant
            if (!placeId && placePicker) {
              const componentPlace = (placePicker as any).value?.place || 
                                     (placePicker as any).selectedPlace ||
                                     (placePicker as any).place;
              
              if (componentPlace) {
                placeId = componentPlace.id || componentPlace.placeId || componentPlace.place_id || '';
              }
            }
            
            console.log('📍 [GooglePlacesAutocomplete] PlaceId détecté:', placeId);
            
            // Évite de mettre à jour si c'est le même lieu
            if (placeId !== lastPlaceId) {
              lastPlaceId = placeId;
              
              const restaurant: Restaurant = {
                id: placeId || `place_${Date.now()}`,
                name: place.displayName || place.name || currentValue.split(',')[0] || 'Restaurant',
                department: extractDepartment(place.formattedAddress || place.address || place.formatted_address || currentValue),
                address: place.formattedAddress || place.address || place.formatted_address || currentValue,
                placeId: placeId,
              };
              
              console.log('✅ [GooglePlacesAutocomplete] Restaurant créé depuis polling:', restaurant);
              setSelectedPlace(restaurant);
            }
          } else if (currentValue && lastPlaceId === '') {
            // Si on a juste une valeur textuelle et qu'on n'a pas encore de place, on crée un restaurant basique
            const restaurant: Restaurant = {
              id: `place_${Date.now()}`,
              name: currentValue.split(',')[0] || 'Restaurant',
              department: extractDepartment(currentValue),
              address: currentValue,
              placeId: '',
            };
            setSelectedPlace(restaurant);
          }
        } else if (!currentValue) {
          // Si le champ est vide, on réinitialise
          if (lastValue !== '') {
            setSelectedPlace(null);
            lastValue = '';
            lastPlaceId = '';
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de sélection:', error);
      }
    };

    // Écoute les événements
    const setupEventListeners = () => {
      const placePicker = placePickerRef.current as any;
      if (!placePicker || !placePicker.addEventListener) return;

      // Écoute l'événement gmpx-placechange
      const handlePlaceChange = async (event: Event) => {
        console.log('🎯 [GooglePlacesAutocomplete] Événement gmpx-placechange déclenché');
        const customEvent = event as CustomEvent;
        const place = customEvent.detail?.place || customEvent.detail;

        console.log('📍 [GooglePlacesAutocomplete] Place reçue:', place);

        if (place) {
          // Essaie de récupérer le placeId depuis différentes propriétés
          const placeId = place.id || place.placeId || place.place_id || place.placeID || '';
          console.log('📍 [GooglePlacesAutocomplete] PlaceId extrait:', placeId);

          // Si pas de placeId dans l'objet, essaie de le récupérer depuis le composant ou via une recherche
          let finalPlaceId = placeId;
          if (!finalPlaceId && placePicker) {
            // Essaie d'accéder aux propriétés internes du composant
            const componentPlace = (placePicker as any).value?.place || 
                                   (placePicker as any).selectedPlace ||
                                   (placePicker as any).place ||
                                   (placePicker as any).__selectedPlace;
            
            if (componentPlace) {
              finalPlaceId = componentPlace.id || componentPlace.placeId || componentPlace.place_id || componentPlace.placeID || '';
              console.log('📍 [GooglePlacesAutocomplete] PlaceId depuis le composant:', finalPlaceId);
            }

            // Si toujours pas de placeId, essaie de le récupérer via l'API Google Places
            if (!finalPlaceId) {
              const address = place.formattedAddress || place.formatted_address || place.address || '';
              const name = place.displayName || place.name || '';
              
              if (address || name) {
                console.log('🔍 [GooglePlacesAutocomplete] Recherche du placeId via API...');
                try {
                  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
                  if (apiKey) {
                    const query = name ? `${name} ${address}` : address;
                    const response = await fetch(
                      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`
                    );
                    
                    if (response.ok) {
                      const data = await response.json();
                      if (data.status === 'OK' && data.results && data.results.length > 0) {
                        finalPlaceId = data.results[0].place_id;
                        console.log('✅ [GooglePlacesAutocomplete] PlaceId récupéré via API:', finalPlaceId);
                      }
                    }
                  }
                } catch (error) {
                  console.warn('⚠️ [GooglePlacesAutocomplete] Erreur lors de la recherche du placeId:', error);
                }
              }
            }
          }

          const restaurant: Restaurant = {
            id: finalPlaceId || `place_${Date.now()}`,
            name: place.displayName || place.name || 'Restaurant',
            department: extractDepartment(place.formattedAddress || place.formatted_address || place.address || ''),
            address: place.formattedAddress || place.formatted_address || place.address || '',
            placeId: finalPlaceId,
          };

          console.log('✅ [GooglePlacesAutocomplete] Restaurant créé:', restaurant);
          setSelectedPlace(restaurant);
        } else {
          console.warn('⚠️ [GooglePlacesAutocomplete] Pas de place dans l\'événement');
        }
      };

      // Écoute plusieurs événements
      placePicker.addEventListener('gmpx-placechange', handlePlaceChange);
      placePicker.addEventListener('place-change', handlePlaceChange);
      
      // Écoute les changements dans le champ
      const inputElement = placePicker.shadowRoot?.querySelector('input');
      if (inputElement) {
        // Détection immédiate lors de la saisie
        inputElement.addEventListener('input', () => {
          setTimeout(checkPlaceSelection, 100);
        });
        inputElement.addEventListener('change', checkPlaceSelection);
        inputElement.addEventListener('blur', checkPlaceSelection);
        // Détection lors de la sélection dans les suggestions
        inputElement.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            setTimeout(checkPlaceSelection, 200);
          }
        });
      }

      return () => {
        placePicker.removeEventListener('gmpx-placechange', handlePlaceChange);
        placePicker.removeEventListener('place-change', handlePlaceChange);
        if (inputElement) {
          inputElement.removeEventListener('change', checkPlaceSelection);
          inputElement.removeEventListener('blur', checkPlaceSelection);
        }
      };
    };

    // Configure les event listeners
    const cleanup = setupEventListeners();

    // Démarre le polling pour vérifier périodiquement
    pollingInterval = setInterval(checkPlaceSelection, 500);

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (cleanup) {
        cleanup();
      }
    };
  }, []); // Pas de dépendances pour éviter les re-renders infinis

  /**
   * Gère la confirmation de sélection
   */
  const handleConfirm = () => {
    if (selectedPlace) {
      onPlaceSelect(selectedPlace);
    }
  };

  /**
   * Réinitialise la sélection
   */
  const handleClear = () => {
    setSelectedPlace(null);
    // Réinitialise aussi le champ de l'autocomplete
    const placePicker = placePickerRef.current as any;
    if (placePicker && placePicker.value !== undefined) {
      placePicker.value = '';
    }
  };

  // Si pas de clé API, ne pas afficher le composant
  if (!apiKey) {
    return null;
  }

  return (
    <div className="google-places-autocomplete">
      <gmpx-api-loader
        ref={apiLoaderRef as any}
        solution-channel="GMP_GE_placepicker_v2"
      />
      <div className="autocomplete-wrapper">
        <gmpx-place-picker
          ref={placePickerRef as any}
          placeholder={placeholder}
          className="place-picker-custom"
        />
        {selectedPlace && (
          <div className="selected-place-info">
            <div className="selected-place-details">
              <div className="selected-place-name">{selectedPlace.name}</div>
              {selectedPlace.address && (
                <div className="selected-place-address">{selectedPlace.address}</div>
              )}
            </div>
            <div className="confirm-actions">
              <button className="btn-clear" onClick={handleClear}>
                ✕
              </button>
              <button className="btn-confirm" onClick={handleConfirm}>
                Confirmer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Extrait le département depuis une adresse française
 */
const extractDepartment = (address: string): string => {
  const departmentMap: Record<string, string> = {
    '67': '67 - Bas-Rhin',
    '68': '68 - Haut-Rhin',
    '75': '75 - Paris',
    '13': '13 - Bouches-du-Rhône',
    '69': '69 - Rhône',
    '33': '33 - Gironde',
    '31': '31 - Haute-Garonne',
  };

  const postalCodeMatch = address.match(/\b(\d{5})\b/);
  if (postalCodeMatch) {
    const postalCode = postalCodeMatch[1];
    const deptCode = postalCode.substring(0, 2);
    return departmentMap[deptCode] || `${deptCode} - Département ${deptCode}`;
  }

  return 'Département inconnu';
};

