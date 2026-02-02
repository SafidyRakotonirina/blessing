import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';

// Middleware pour vérifier l'authentification
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Token non fourni', 401);
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return errorResponse(res, 'Token invalide ou expiré', 401);
    }
  } catch (error) {
    return errorResponse(res, 'Erreur d\'authentification', 500);
  }
};

// Middleware pour vérifier les rôles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Non authentifié', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        'Vous n\'avez pas les permissions nécessaires',
        403
      );
    }

    next();
  };
};

// Middleware pour vérifier si l'utilisateur est admin ou secrétaire
export const isAdminOrSecretaire = authorize('admin', 'secretaire');

// Middleware pour vérifier si l'utilisateur est admin uniquement
export const isAdmin = authorize('admin');

// Middleware pour vérifier si l'utilisateur est enseignant
export const isEnseignant = authorize('enseignant', 'admin', 'secretaire');

// Middleware pour vérifier l'accès aux données personnelles
export const checkOwnership = (req, res, next) => {
  const userId = parseInt(req.params.id);
  const requesterId = req.user.id;
  const requesterRole = req.user.role;

  // Admin et secrétaire peuvent accéder à tout
  if (requesterRole === 'admin' || requesterRole === 'secretaire') {
    return next();
  }

  // Les autres ne peuvent accéder qu'à leurs propres données
  if (userId !== requesterId) {
    return errorResponse(
      res,
      'Accès non autorisé à ces données',
      403
    );
  }

  next();
};
