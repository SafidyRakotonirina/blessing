import UserModel from "../models/user.model.js";
import {
  asyncHandler,
  errorResponse,
  paginatedResponse,
  successResponse,
} from "../utils/response.js";

// Obtenir tous les utilisateurs
export const getUsers = asyncHandler(async (req, res) => {
  const { role, actif, search, page, limit } = req.query;

  const filters = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
  };

  // On ignore explicitement les chaînes vides
  if (role && role.trim() !== "") filters.role = role;
  if (search && search.trim() !== "") filters.search = search;
  
  if (actif !== undefined && actif !== "") {
    filters.actif = actif === "true";
  }


  const result = await UserModel.findAll(filters);

  return paginatedResponse(
    res,
    result.users,
    result.page,
    result.limit,
    result.total,
    "Liste des utilisateurs récupérée avec succès",
  );
});

// Obtenir les statistiques des utilisateurs
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await UserModel.getStats();

  return successResponse(res, stats, "Statistiques récupérées avec succès");
});

// Obtenir un utilisateur par ID
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await UserModel.findById(id);

  if (!user) {
    return errorResponse(res, "Utilisateur introuvable", 404);
  }

  return successResponse(res, user, "Utilisateur récupéré avec succès");
});

// Créer un utilisateur
export const createUser = asyncHandler(async (req, res) => {
  const { nom, prenom, email, telephone, password, role } = req.body;

  // Vérifier si l'email existe déjà
  /* const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    return errorResponse(res, 'Cet email est déjà utilisé', 409);
  } */

  // Créer l'utilisateur
  const userId = await UserModel.create({
    nom,
    prenom,
    email,
    telephone,
    password,
    role,
  });

  const user = await UserModel.findById(userId);

  return successResponse(res, user, "Utilisateur créé avec succès", 201);
});

// Mettre à jour un utilisateur
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, telephone, role, photo_url } = req.body;

  // Vérifier si l'utilisateur existe
  const existingUser = await UserModel.findById(id);
  if (!existingUser) {
    return errorResponse(res, "Utilisateur introuvable", 404);
  }

  // Vérifier si le nouvel email est déjà utilisé par un autre utilisateur
  if (email && email !== existingUser.email) {
    const emailUser = await UserModel.findByEmail(email);
    if (emailUser) {
      return errorResponse(res, "Cet email est déjà utilisé", 409);
    }
  }

  const updateData = {};
  if (nom) updateData.nom = nom;
  if (prenom) updateData.prenom = prenom;
  if (email) updateData.email = email;
  if (telephone) updateData.telephone = telephone;
  if (role) updateData.role = role;
  if (photo_url !== undefined) updateData.photo_url = photo_url;

  const updated = await UserModel.update(id, updateData);

  if (!updated) {
    return errorResponse(res, "Erreur lors de la mise à jour", 400);
  }

  const user = await UserModel.findById(id);

  return successResponse(res, user, "Utilisateur mis à jour avec succès");
});

// Désactiver un utilisateur
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Vérifier si l'utilisateur existe
  const user = await UserModel.findById(id);
  if (!user) {
    return errorResponse(res, "Utilisateur introuvable", 404);
  }

  // Empêcher la suppression de son propre compte
  if (parseInt(id) === req.user.id) {
    return errorResponse(
      res,
      "Vous ne pouvez pas désactiver votre propre compte",
      400,
    );
  }

  const deleted = await UserModel.deactivate(id);

  if (!deleted) {
    return errorResponse(res, "Erreur lors de la désactivation", 400);
  }

  return successResponse(res, null, "Utilisateur désactivé avec succès");
});

// Activer/désactiver un utilisateur
export const toggleUserActive = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Vérifier si l'utilisateur existe
  const user = await UserModel.findById(id);
  if (!user) {
    return errorResponse(res, "Utilisateur introuvable", 404);
  }

  // Empêcher la modification de son propre compte
  if (parseInt(id) === req.user.id) {
    return errorResponse(
      res,
      "Vous ne pouvez pas modifier le statut de votre propre compte",
      400,
    );
  }

  const toggled = await UserModel.toggleActive(id);

  if (!toggled) {
    return errorResponse(res, "Erreur lors du changement de statut", 400);
  }

  const updatedUser = await UserModel.findById(id);

  return successResponse(
    res,
    updatedUser,
    updatedUser.actif
      ? "Utilisateur activé avec succès"
      : "Utilisateur désactivé avec succès",
  );
});

// Obtenir la liste des professeurs
export const getProfesseurs = asyncHandler(async (req, res) => {
  const filters = {
    role: "enseignant",
    actif: true,
    page: 1,
    limit: 1000,
  };

  const result = await UserModel.findAll(filters);

  return successResponse(
    res,
    result.users,
    "Liste des enseignants récupérée avec succès",
  );
});

// Obtenir les enseignants disponibles
export const getAvailableTeachers = asyncHandler(async (req, res) => {
  const { jourId, horaireId, excludeVagueId } = req.query;

  if (!jourId || !horaireId) {
    return errorResponse(
      res,
      "Les paramètres jourId et horaireId sont requis",
      400,
    );
  }

  const teachers = await UserModel.getAvailableTeachers(
    jourId,
    horaireId,
    excludeVagueId || null,
  );

  return successResponse(
    res,
    teachers,
    "Enseignants disponibles récupérés avec succès",
  );
});
