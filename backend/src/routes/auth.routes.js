import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword
} from '../controllers/auth.controller.js';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  changePasswordValidator
} from '../validators/auth.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes publiques
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/refresh', refreshTokenValidator, refreshToken);

// Routes protégées
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePasswordValidator, changePassword);

export default router;
