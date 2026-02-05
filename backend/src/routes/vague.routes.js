import express from 'express';
import {
  getVagues,
  getVagueById,
  createVague,
  updateVague,
  deleteVague,
  getPlanning,
  getPlanningEnseignant
} from '../controllers/vague.controller.js';
import { authenticate, isAdminOrSecretaire } from '../middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes générales
router.get('/', getVagues);
router.get('/planning', getPlanning);
router.get('/:id', getVagueById);

// Planning d'un enseignant
router.get('/enseignant/:enseignantId/planning', getPlanningEnseignant);

// Routes protégées (admin/secrétaire uniquement)
router.post('/', isAdminOrSecretaire, createVague);
router.put('/:id', isAdminOrSecretaire, updateVague);
router.delete('/:id', isAdminOrSecretaire, deleteVague);

export default router;
