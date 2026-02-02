import UserModel from '../models/user.model.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/response.js';

// Inscription
export const register = asyncHandler(async (req, res) => {
  const { nom, prenom, email, telephone, password, role } = req.body;

  // Vérifier si l'email existe déjà
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    return errorResponse(res, 'Cet email est déjà utilisé', 409);
  }

  // Créer l'utilisateur
  const userId = await UserModel.create({
    nom,
    prenom,
    email,
    telephone,
    password,
    role: role || 'etudiant'
  });

  // Récupérer l'utilisateur créé
  const user = await UserModel.findById(userId);

  // Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Sauvegarder le refresh token
  await UserModel.saveRefreshToken(userId, refreshToken);

  return successResponse(
    res,
    {
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        telephone: user.telephone,
        photo_url: user.photo_url
      },
      accessToken,
      refreshToken
    },
    'Inscription réussie',
    201
  );
});

// Connexion
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Trouver l'utilisateur
  const user = await UserModel.findByEmail(email);
  if (!user) {
    return errorResponse(res, 'Email ou mot de passe incorrect', 401);
  }

  // Vérifier si l'utilisateur est actif
  if (!user.actif) {
    return errorResponse(res, 'Votre compte a été désactivé', 403);
  }

  // Vérifier le mot de passe
  const isPasswordValid = await UserModel.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, 'Email ou mot de passe incorrect', 401);
  }

  // Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Sauvegarder le refresh token
  await UserModel.saveRefreshToken(user.id, refreshToken);

  return successResponse(res, {
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      telephone: user.telephone,
      photo_url: user.photo_url
    },
    accessToken,
    refreshToken
  }, 'Connexion réussie');
});

// Rafraîchir le token
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(res, 'Refresh token requis', 400);
  }

  try {
    // Vérifier le refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Vérifier que le refresh token est dans la base de données
    const isValid = await UserModel.verifyRefreshToken(decoded.id, refreshToken);
    if (!isValid) {
      return errorResponse(res, 'Refresh token invalide', 401);
    }

    // Récupérer l'utilisateur
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 'Utilisateur introuvable', 404);
    }

    if (!user.actif) {
      return errorResponse(res, 'Votre compte a été désactivé', 403);
    }

    // Générer de nouveaux tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Sauvegarder le nouveau refresh token
    await UserModel.saveRefreshToken(user.id, newRefreshToken);

    return successResponse(res, {
      accessToken,
      refreshToken: newRefreshToken
    }, 'Token rafraîchi avec succès');

  } catch (error) {
    return errorResponse(res, 'Refresh token invalide ou expiré', 401);
  }
});

// Déconnexion
export const logout = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Supprimer le refresh token
  await UserModel.removeRefreshToken(userId);

  return successResponse(res, null, 'Déconnexion réussie');
});

// Obtenir le profil de l'utilisateur connecté
export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await UserModel.findById(userId);
  
  if (!user) {
    return errorResponse(res, 'Utilisateur introuvable', 404);
  }

  return successResponse(res, user, 'Profil récupéré avec succès');
});

// Mise à jour du profil
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { nom, prenom, telephone, photo_url } = req.body;

  const updateData = {};
  if (nom) updateData.nom = nom;
  if (prenom) updateData.prenom = prenom;
  if (telephone) updateData.telephone = telephone;
  if (photo_url) updateData.photo_url = photo_url;

  const updated = await UserModel.update(userId, updateData);

  if (!updated) {
    return errorResponse(res, 'Erreur lors de la mise à jour du profil', 400);
  }

  const user = await UserModel.findById(userId);

  return successResponse(res, user, 'Profil mis à jour avec succès');
});

// Changer le mot de passe
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  // Récupérer l'utilisateur avec le mot de passe
  const user = await UserModel.findByEmail(req.user.email);

  // Vérifier le mot de passe actuel
  const isPasswordValid = await UserModel.verifyPassword(currentPassword, user.password);
  if (!isPasswordValid) {
    return errorResponse(res, 'Mot de passe actuel incorrect', 401);
  }

  // Mettre à jour le mot de passe
  await UserModel.updatePassword(userId, newPassword);

  // Supprimer tous les refresh tokens (déconnexion de tous les appareils)
  await UserModel.removeRefreshToken(userId);

  return successResponse(res, null, 'Mot de passe changé avec succès');
});
