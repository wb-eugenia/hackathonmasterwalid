/**
 * Composant pour scanner et créer des cartes fidélité
 * Permet de scanner une photo, QR code, ou saisie manuelle
 */

import React, { useState, useRef } from 'react';
import { LoyaltyCard, Customer } from '../../types/loyalty';
import { loyaltyCardService, customerService } from '../../services/loyaltyService';
import './CardScanner.css';

interface CardScannerProps {
  establishmentId: string;
  onCardCreated: (card: LoyaltyCard) => void;
  onCancel: () => void;
}

export const CardScanner: React.FC<CardScannerProps> = ({
  establishmentId,
  onCardCreated,
  onCancel,
}) => {
  const [step, setStep] = useState<'scan' | 'manual' | 'link'>('scan');
  const [scanType, setScanType] = useState<'photo' | 'qr' | 'barcode'>('photo');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  /**
   * Gère la sélection d'un fichier image
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Lance la caméra pour scanner
   */
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erreur caméra:', error);
      alert('Impossible d\'accéder à la caméra');
    }
  };

  /**
   * Capture une photo depuis la caméra
   */
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      setImageBase64(base64);
      setImagePreview(base64);
      stopCamera();
    }
  };

  /**
   * Arrête la caméra
   */
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  /**
   * Traite le scan de la carte
   */
  const handleScan = async () => {
    if (!imageBase64) {
      alert('Veuillez sélectionner ou capturer une image');
      return;
    }

    setIsProcessing(true);
    try {
      const extractedInfo = await loyaltyCardService.scan(
        establishmentId,
        imageBase64,
        scanType === 'qr' ? 'qr' : scanType === 'barcode' ? 'barcode' : undefined
      );

      if (extractedInfo.cardNumber || extractedInfo.cardCode) {
        setCardNumber(extractedInfo.cardNumber || '');
        setCardCode(extractedInfo.cardCode || '');
        setStep('link');
      } else {
        alert('Aucune information extraite. Veuillez saisir manuellement.');
        setStep('manual');
      }
    } catch (error) {
      console.error('Erreur scan:', error);
      alert('Erreur lors du scan. Veuillez saisir manuellement.');
      setStep('manual');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Recherche des clients
   */
  const searchCustomers = async (term: string) => {
    if (term.length < 2) {
      setCustomers([]);
      return;
    }

    try {
      const results = await customerService.list(establishmentId, term);
      setCustomers(results);
    } catch (error) {
      console.error('Erreur recherche clients:', error);
    }
  };

  /**
   * Crée la carte fidélité
   */
  const createCard = async () => {
    if (!cardNumber && !cardCode) {
      alert('Veuillez saisir un numéro de carte ou un code');
      return;
    }

    setIsProcessing(true);
    try {
      const card = await loyaltyCardService.create({
        establishment_id: establishmentId,
        customer_id: selectedCustomerId || undefined,
        card_number: cardNumber || undefined,
        card_code: cardCode || undefined,
        card_type: scanType === 'qr' ? 'qr' : scanType === 'barcode' ? 'barcode' : 'physical',
        photo_url: imageBase64 || undefined,
      });

      onCardCreated(card);
    } catch (error: any) {
      console.error('Erreur création carte:', error);
      alert(error.message || 'Erreur lors de la création de la carte');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card-scanner-overlay">
      <div className="card-scanner-modal">
        <div className="card-scanner-header">
          <h2>Créer une carte fidélité</h2>
          <button className="close-button" onClick={onCancel}>✕</button>
        </div>

        <div className="card-scanner-content">
          {step === 'scan' && (
            <div className="scan-step">
              <div className="scan-type-selector">
                <button
                  className={scanType === 'photo' ? 'active' : ''}
                  onClick={() => setScanType('photo')}
                >
                  📷 Photo
                </button>
                <button
                  className={scanType === 'qr' ? 'active' : ''}
                  onClick={() => setScanType('qr')}
                >
                  📱 QR Code
                </button>
                <button
                  className={scanType === 'barcode' ? 'active' : ''}
                  onClick={() => setScanType('barcode')}
                >
                  📊 Code-barres
                </button>
              </div>

              <div className="image-capture-section">
                {!imagePreview && (
                  <>
                    <div className="camera-preview">
                      {stream ? (
                        <video ref={videoRef} autoPlay playsInline className="camera-video" />
                      ) : (
                        <div className="camera-placeholder">
                          <p>📷</p>
                          <button onClick={startCamera}>Activer la caméra</button>
                        </div>
                      )}
                    </div>
                    {stream && (
                      <button className="capture-button" onClick={capturePhoto}>
                        📸 Capturer
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <button
                      className="file-button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📁 Choisir un fichier
                    </button>
                  </>
                )}

                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button onClick={() => {
                      setImagePreview(null);
                      setImageBase64(null);
                    }}>
                      ✕ Supprimer
                    </button>
                  </div>
                )}
              </div>

              <div className="scan-actions">
                <button
                  className="scan-button"
                  onClick={handleScan}
                  disabled={!imageBase64 || isProcessing}
                >
                  {isProcessing ? '⏳ Traitement...' : '🔍 Scanner'}
                </button>
                <button
                  className="manual-button"
                  onClick={() => setStep('manual')}
                >
                  ✏️ Saisie manuelle
                </button>
              </div>
            </div>
          )}

          {step === 'manual' && (
            <div className="manual-step">
              <div className="form-group">
                <label>Numéro de carte</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Ex: CARD-123456"
                />
              </div>

              <div className="form-group">
                <label>Code (QR/Barcode)</label>
                <input
                  type="text"
                  value={cardCode}
                  onChange={(e) => setCardCode(e.target.value)}
                  placeholder="Code QR ou code-barres"
                />
              </div>

              <div className="manual-actions">
                <button
                  className="create-button"
                  onClick={() => setStep('link')}
                  disabled={!cardNumber && !cardCode}
                >
                  Continuer
                </button>
                <button onClick={() => setStep('scan')}>Retour</button>
              </div>
            </div>
          )}

          {step === 'link' && (
            <div className="link-step">
              <div className="form-group">
                <label>Associer à un client (optionnel)</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchCustomers(e.target.value);
                  }}
                  placeholder="Rechercher un client..."
                />
                {customers.length > 0 && (
                  <div className="customer-list">
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        className={`customer-item ${selectedCustomerId === customer.id ? 'selected' : ''}`}
                        onClick={() => setSelectedCustomerId(customer.id)}
                      >
                        <div className="customer-name">{customer.name}</div>
                        {customer.email && (
                          <div className="customer-email">{customer.email}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="link-actions">
                <button
                  className="create-button"
                  onClick={createCard}
                  disabled={isProcessing}
                >
                  {isProcessing ? '⏳ Création...' : '✅ Créer la carte'}
                </button>
                <button onClick={() => setStep('manual')}>Retour</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

