/**
 * Service d'envoi d'emails
 * 
 * TODO: Intégrer avec un service d'email réel (SendGrid, AWS SES, Resend, etc.)
 */

/**
 * Envoie un email de vérification
 * @param {string} email - Email du destinataire
 * @param {string} token - Token de vérification
 * @returns {Promise<boolean>}
 */
export async function sendVerificationEmail(email, token) {
  // TODO: Intégrer avec un service d'email réel
  console.log(`📧 Email de vérification à envoyer à ${email}`);
  console.log(`🔗 Lien: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`);
  
  // Simulation - en production, utiliser SendGrid, AWS SES, etc.
  return true;
}

/**
 * Envoie un email de bienvenue
 * @param {string} email - Email du destinataire
 * @param {string} name - Nom de l'utilisateur
 * @returns {Promise<boolean>}
 */
export async function sendWelcomeEmail(email, name) {
  console.log(`📧 Email de bienvenue à envoyer à ${email} pour ${name}`);
  return true;
}

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} email - Email du destinataire
 * @param {string} token - Token de réinitialisation
 * @returns {Promise<boolean>}
 */
export async function sendPasswordResetEmail(email, token) {
  console.log(`📧 Email de réinitialisation à envoyer à ${email}`);
  console.log(`🔗 Lien: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`);
  return true;
}

