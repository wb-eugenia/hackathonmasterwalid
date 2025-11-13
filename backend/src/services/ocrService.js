/**
 * Service OCR pour extraire les informations des cartes fidélité scannées
 * 
 * TODO: Intégrer avec un service OCR réel (Google Cloud Vision, Tesseract, etc.)
 */

/**
 * Extrait le numéro de carte depuis une image
 * @param {string} imageBase64 - Image en base64
 * @returns {Promise<{cardNumber: string | null, cardCode: string | null}>}
 */
export async function extractCardInfoFromImage(imageBase64) {
  // TODO: Intégrer avec Google Cloud Vision API ou Tesseract OCR
  
  // Simulation pour le développement
  console.log('🔍 Extraction OCR depuis image...');
  
  // Pour l'instant, retourne null - à implémenter avec un vrai service OCR
  return {
    cardNumber: null,
    cardCode: null,
  };
}

/**
 * Extrait le code depuis un QR code ou barcode
 * @param {string} imageBase64 - Image en base64
 * @returns {Promise<string | null>}
 */
export async function extractCodeFromQRBarcode(imageBase64) {
  // TODO: Intégrer avec une bibliothèque de lecture QR/barcode
  // Exemples: jsQR, qrcode-reader, quaggaJS
  
  console.log('🔍 Extraction code QR/Barcode depuis image...');
  
  // Pour l'instant, retourne null - à implémenter avec une vraie bibliothèque
  return null;
}

/**
 * Valide et nettoie un numéro de carte saisi manuellement
 * @param {string} cardNumber - Numéro de carte saisi
 * @returns {string | null} - Numéro nettoyé ou null si invalide
 */
export function validateAndCleanCardNumber(cardNumber) {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return null;
  }

  // Nettoie le numéro (supprime espaces, tirets, etc.)
  const cleaned = cardNumber.trim().replace(/[\s-]/g, '').toUpperCase();

  // Validation basique (minimum 4 caractères)
  if (cleaned.length < 4) {
    return null;
  }

  return cleaned;
}

/**
 * Valide et nettoie un code (QR/barcode)
 * @param {string} code - Code saisi
 * @returns {string | null} - Code nettoyé ou null si invalide
 */
export function validateAndCleanCode(code) {
  if (!code || typeof code !== 'string') {
    return null;
  }

  const cleaned = code.trim();

  // Validation basique (minimum 3 caractères)
  if (cleaned.length < 3) {
    return null;
  }

  return cleaned;
}

