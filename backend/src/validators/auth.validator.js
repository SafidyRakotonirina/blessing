import { body } from 'express-validator';
import { handleValidationErrors } from '../utils/validation.js';

export const registerValidator = [
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  
  body('prenom')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le prénom doit contenir entre 2 et 100 caractères'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  
  body('telephone')
    .optional()
    .trim()
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .withMessage('Numéro de téléphone invalide'),
  
  body('role')
    .optional()
    .isIn(['admin', 'secretaire', 'enseignant', 'etudiant'])
    .withMessage('Rôle invalide'),
  
  handleValidationErrors
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
  
  handleValidationErrors
];

export const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Le refresh token est requis'),
  
  handleValidationErrors
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('Le nouveau mot de passe est requis')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
  
  handleValidationErrors
];
