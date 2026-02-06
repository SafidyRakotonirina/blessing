import VagueModel from "../models/vague.model.js";
import {
  asyncHandler,
  errorResponse,
  paginatedResponse,
  successResponse,
} from "../utils/response.js";

// Obtenir toutes les vagues
export const getVagues = asyncHandler(async (req, res) => {
  const filters = {
    statut: req.query.statut,
    niveau_id: req.query.niveau_id,
    enseignant_id: req.query.enseignant_id,
    salle_id: req.query.salle_id,
    search: req.query.search,
    page: req.query.page || 1,
    limit: req.query.limit || 10,
  };

  const result = await VagueModel.findAll(filters);

  return paginatedResponse(
    res,
    result.vagues,
    result.page,
    result.limit,
    result.total,
    "Liste des vagues récupérée avec succès",
  );
});

// Obtenir une vague par ID (avec ses horaires)
export const getVagueById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vague = await VagueModel.findById(id);

  if (!vague) {
    return errorResponse(res, "Vague introuvable", 404);
  }

  return successResponse(res, vague, "Vague récupérée avec succès");
});

// Créer une vague avec plusieurs horaires
export const createVague = asyncHandler(async (req, res) => {
  const {
    nom,
    niveau_id,
    enseignant_id,
    salle_id,
    date_debut,
    date_fin,
    statut,
    horaires,
  } = req.body;

  // Logs pour debug
  console.log("Payload reçu :", req.body);
  console.log("Horaires reçus :", horaires);

  // Validation des champs requis
  if (!nom || !niveau_id || !date_debut || !date_fin) {
    return errorResponse(
      res,
      "Les champs nom, niveau_id, date_debut et date_fin sont requis",
      400,
    );
  }

  // Vérification de la présence des horaires
  if (!horaires || !Array.isArray(horaires) || horaires.length === 0) {
    return errorResponse(res, "Au moins une plage horaire est requise", 400);
  }

  // Validation des horaires
  for (const h of horaires) {
    if (!h.heure_debut || !h.heure_fin) {
      return errorResponse(
        res,
        "Chaque horaire doit avoir une heure de début et de fin",
        400,
      );
    }
  }

  const vagueData = {
    nom,
    niveau_id,
    enseignant_id: enseignant_id || null,
    salle_id: salle_id || null,
    date_debut,
    date_fin,
    statut: statut || "planifie",
    horaires,
  };

  try {
    const vagueId = await VagueModel.create(vagueData);
    return successResponse(
      res,
      { id: vagueId },
      "Vague créée avec succès",
      201,
    );
  } catch (error) {
    console.error("Erreur création vague:", error);
    throw error;
  }
});

// Mettre à jour une vague
export const updateVague = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    nom,
    niveau_id,
    enseignant_id,
    salle_id,
    date_debut,
    date_fin,
    statut,
    horaires,
  } = req.body;

  // Vérifier que la vague existe
  const vague = await VagueModel.findById(id);
  if (!vague) {
    return errorResponse(res, "Vague introuvable", 404);
  }

  // Construire l'objet de mise à jour
  const updateData = {
    nom,
    niveau_id,
    enseignant_id: enseignant_id || null,
    salle_id: salle_id || null,
    date_debut,
    date_fin,
    statut: statut || vague.statut,
  };

  // Ajouter les horaires s'ils sont fournis
  if (horaires !== undefined) {
    if (!Array.isArray(horaires)) {
      return errorResponse(res, "Les horaires doivent être un tableau", 400);
    }

    // Validation des horaires
    for (const h of horaires) {
      if (!h.heure_debut || !h.heure_fin) {
        return errorResponse(
          res,
          "Chaque horaire doit avoir une heure de début et de fin",
          400,
        );
      }
    }

    updateData.horaires = horaires;
  }

  try {
    await VagueModel.update(id, updateData);
    return successResponse(res, null, "Vague mise à jour avec succès");
  } catch (error) {
    console.error("Erreur mise à jour vague:", error);
    throw error;
  }
});

// Supprimer une vague
export const deleteVague = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vague = await VagueModel.findById(id);
  if (!vague) {
    return errorResponse(res, "Vague introuvable", 404);
  }

  // Vérifier s'il y a des inscriptions
  if (vague.nb_inscrits > 0) {
    return errorResponse(
      res,
      "Impossible de supprimer une vague avec des inscriptions actives",
      400,
    );
  }

  try {
    await VagueModel.delete(id);
    return successResponse(res, null, "Vague supprimée avec succès");
  } catch (error) {
    console.error("Erreur suppression vague:", error);
    throw error;
  }
});

// Obtenir le planning général
export const getPlanning = asyncHandler(async (req, res) => {
  const filters = {
    salle_id: req.query.salle_id,
    enseignant_id: req.query.enseignant_id,
  };

  const planning = await VagueModel.getPlanning(filters);

  return successResponse(res, planning, "Planning récupéré avec succès");
});

// Obtenir le planning d'un enseignant
export const getPlanningEnseignant = asyncHandler(async (req, res) => {
  const { enseignantId } = req.params;

  const planning = await VagueModel.getPlanning({
    enseignant_id: enseignantId,
  });

  // Organiser par vague avec les horaires
  const planningOrganise = planning.map((vague) => ({
    vague_id: vague.id,
    vague_nom: vague.nom,
    niveau: vague.niveau_code,
    salle: vague.salle_nom,
    date_debut: vague.date_debut,
    date_fin: vague.date_fin,
    nb_inscrits: vague.nb_inscrits,
    capacite_max: vague.capacite_max,
    statut: vague.statut,
    horaires: vague.horaires,
  }));

  return successResponse(
    res,
    {
      enseignant_id: enseignantId,
      vagues: planningOrganise,
      total_vagues: planning.length,
    },
    "Planning de l'enseignant récupéré avec succès",
  );
});

// Vérifier la capacité d'une vague
export const checkCapacite = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vague = await VagueModel.findById(id);
  if (!vague) {
    return errorResponse(res, "Vague introuvable", 404);
  }

  const capaciteDisponible = await VagueModel.checkCapacite(id);

  return successResponse(
    res,
    {
      capacite_max: vague.capacite_max,
      nb_inscrits: vague.nb_inscrits,
      places_disponibles: vague.capacite_max - vague.nb_inscrits,
      capacite_disponible: capaciteDisponible,
    },
    "Capacité vérifiée",
  );
});
