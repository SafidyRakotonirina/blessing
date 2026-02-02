import express from 'express';
import {
  getUsers,
  getUserStats,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
  getProfesseurs,
  getAvailableTeachers
} from '../controllers/user.controller.js';
import { authenticate, isAdminOrSecretaire, checkOwnership } from '../middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes générales
router.get('/', isAdminOrSecretaire, getUsers);
router.get('/stats', isAdminOrSecretaire, getUserStats);
router.get('/profs', getProfesseurs);
router.get('/available-teachers', getAvailableTeachers);

// Routes avec ID utilisateur
router.get('/:id', checkOwnership, getUserById);
router.post('/', isAdminOrSecretaire, createUser);
router.put('/:id', isAdminOrSecretaire, updateUser);
router.delete('/:id', isAdminOrSecretaire, deleteUser);
router.patch('/:id/toggle', isAdminOrSecretaire, toggleUserActive);

export default router;
