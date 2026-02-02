import express from 'express';
import {
  getEcolages,
  getEcolageById,
  getEcolagesByEtudiant,
  enregistrerPaiement,
  annulerPaiement,
  getFinanceStats,
  getRapportFinancier
} from '../controllers/finance.controller.js';
import { authenticate, isAdminOrSecretaire } from '../middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes protégées (admin/secrétaire uniquement)
router.get('/ecolages', isAdminOrSecretaire, getEcolages);
router.get('/ecolages/:id', isAdminOrSecretaire, getEcolageById);
router.post('/paiements', isAdminOrSecretaire, enregistrerPaiement);
router.delete('/paiements/:id', isAdminOrSecretaire, annulerPaiement);
router.get('/stats', isAdminOrSecretaire, getFinanceStats);
router.get('/rapport', isAdminOrSecretaire, getRapportFinancier);

// Route accessible par les étudiants pour leurs propres écolages
router.get('/student/:id', getEcolagesByEtudiant);

export default router;
