import HoraireModel from "../models/horaire.model.js";
import {
  asyncHandler,
  errorResponse,
  successResponse,
} from "../utils/response.js";

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Obtenir tous les horaires
export const getHoraires = asyncHandler(async (req, res) => {
  const filters = {
    actif: req.query.actif,
  };

  const horaires = await HoraireModel.findAll(filters);

  return successResponse(
    res,
    horaires,
    "Liste des horaires récupérée avec succès",
  );
});

// Obtenir un horaire par ID
export const getHoraireById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const horaire = await HoraireModel.findById(id);

  if (!horaire) {
    return errorResponse(res, "Horaire introuvable", 404);
  }

  return successResponse(res, horaire, "Horaire récupéré avec succès");
});

// Créer un horaire
export const createHoraire = asyncHandler(async (req, res) => {
  const { heure_debut, heure_fin, libelle } = req.body;

  // Validation
  if (!heure_debut || !heure_fin) {
    return errorResponse(
      res,
      "Les heures de début et de fin sont requises",
      400,
    );
  }

  const debut = timeToMinutes(heure_debut);
  const fin = timeToMinutes(heure_fin);

  // Vérifier que heure_fin > heure_debut
  if (debut >= fin) {
    return errorResponse(
      res,
      "L'heure de fin doit être après l'heure de début",
      400,
    );
  }

  const horaireId = await HoraireModel.create({
    heure_debut,
    heure_fin,
    libelle,
  });

  const horaire = await HoraireModel.findById(horaireId);

  return successResponse(res, horaire, "Horaire créé avec succès", 201);
});

// Mettre à jour un horaire
export const updateHoraire = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { heure_debut, heure_fin, libelle, actif } = req.body;

  const existingHoraire = await HoraireModel.findById(id);
  if (!existingHoraire) {
    return errorResponse(res, "Horaire introuvable", 404);
  }

  // Validation si les heures sont modifiées
  if (heure_debut && heure_fin && heure_debut >= heure_fin) {
    return errorResponse(
      res,
      "L'heure de fin doit être après l'heure de début",
      400,
    );
  }

  const updateData = {};
  if (heure_debut) updateData.heure_debut = heure_debut;
  if (heure_fin) updateData.heure_fin = heure_fin;
  if (libelle !== undefined) updateData.libelle = libelle;
  if (actif !== undefined) updateData.actif = actif;

  const updated = await HoraireModel.update(id, updateData);

  if (!updated) {
    return errorResponse(res, "Erreur lors de la mise à jour", 400);
  }

  const horaire = await HoraireModel.findById(id);

  return successResponse(res, horaire, "Horaire mis à jour avec succès");
});

// Supprimer un horaire
export const deleteHoraire = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const horaire = await HoraireModel.findById(id);
  if (!horaire) {
    return errorResponse(res, "Horaire introuvable", 404);
  }

  // Vérifier si l'horaire est utilisé
  const isUsed = await HoraireModel.isUsed(id);
  if (isUsed) {
    return errorResponse(
      res,
      "Impossible de supprimer cet horaire car il est utilisé par des vagues",
      400,
    );
  }

  const deleted = await HoraireModel.delete(id);

  if (!deleted) {
    return errorResponse(res, "Erreur lors de la suppression", 400);
  }

  return successResponse(res, null, "Horaire supprimé avec succès");
});

// Obtenir les horaires disponibles pour un créneau
export const getHorairesDisponibles = asyncHandler(async (req, res) => {
  const { jour_id, salle_id, exclude_vague_id } = req.query;

  if (!jour_id || !salle_id) {
    return errorResponse(
      res,
      "Les paramètres jour_id et salle_id sont requis",
      400,
    );
  }

  const horaires = await HoraireModel.getDisponibles(
    jour_id,
    salle_id,
    exclude_vague_id || null,
  );

  return successResponse(
    res,
    horaires,
    "Horaires disponibles récupérés avec succès",
  );
});
