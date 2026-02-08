// finance.controller.js  (version simplifiée + compatible BD 2026)

import FinanceModel from "../models/finance.model.js";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from "../utils/response.js";
import { asyncHandler } from "../utils/response.js";

export const getEcolages = asyncHandler(async (req, res) => {
  const filters = {
    statut: req.query.statut, 
    inscription_id: req.query.inscription_id,
    search: req.query.search,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
  };

  const result = await FinanceModel.getEcolages(filters);

  return paginatedResponse(
    res,
    result.ecolages,
    result.page,
    result.limit,
    result.total,
    "Liste des écolages récupérée",
  );
});

export const getEcolageById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ecolage = await FinanceModel.getEcolageById(id);

  if (!ecolage) return errorResponse(res, "Écolage introuvable", 404);

  const paiements = await FinanceModel.getPaiementsByEcolage(id);

  return successResponse(res, { ...ecolage, paiements }, "Écolage + paiements");
});

export const enregistrerPaiement = asyncHandler(async (req, res) => {
  const {
    ecolage_id,
    montant,
    date_paiement,
    methode_paiement,
    reference,
    remarques,
  } = req.body;

  if (!ecolage_id || !montant || parseFloat(montant) <= 0) {
    return errorResponse(res, "ecolage_id et montant > 0 obligatoires", 400);
  }

  const ecolage = await FinanceModel.getEcolageById(ecolage_id);
  if (!ecolage) return errorResponse(res, "Écolage introuvable", 404);

  if (parseFloat(montant) > parseFloat(ecolage.montant_restant)) {
    return errorResponse(res, "Montant dépasse le restant", 400);
  }

  const paiementId = await FinanceModel.enregistrerPaiement({
    ecolage_id,
    montant: parseFloat(montant),
    date_paiement: date_paiement || new Date().toISOString().split("T")[0],
    methode_paiement,
    reference,
    remarques,
    utilisateur_id: req.user?.id || null,
  });

  // mise à jour automatique de ecolages (montant_paye, restant, statut)
  await FinanceModel.mettreAJourEcolageApresPaiement(ecolage_id);

  const ecolageUpdated = await FinanceModel.getEcolageById(ecolage_id);
  const paiements = await FinanceModel.getPaiementsByEcolage(ecolage_id);

  return successResponse(
    res,
    {
      paiement_id: paiementId,
      ecolage: ecolageUpdated,
      paiements,
    },
    "Paiement enregistré",
    201,
  );
});

// Obtenir les écolages d'un étudiant
export const getEcolagesByEtudiant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ecolages = await FinanceModel.getEcolagesByEtudiant(id);

  // Pour chaque écolage, récupérer les paiements
  const ecolagesAvecPaiements = await Promise.all(
    ecolages.map(async (ecolage) => {
      const paiements = await FinanceModel.getPaiementsByEcolage(ecolage.id);
      return {
        ...ecolage,
        paiements,
      };
    }),
  );

  return successResponse(
    res,
    ecolagesAvecPaiements,
    "Écolages de l'étudiant récupérés avec succès",
  );
});

// Annuler un paiement
export const annulerPaiement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const annule = await FinanceModel.annulerPaiement(id);

    if (!annule) {
      return errorResponse(res, "Erreur lors de l'annulation du paiement", 400);
    }

    return successResponse(res, null, "Paiement annulé avec succès");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

// Obtenir les statistiques financières
export const getFinanceStats = asyncHandler(async (req, res) => {
  const filters = {
    date_debut: req.query.date_debut,
    date_fin: req.query.date_fin,
  };

  const stats = await FinanceModel.getStats(filters);

  return successResponse(
    res,
    stats,
    "Statistiques financières récupérées avec succès",
  );
});

// Obtenir un rapport par période
export const getRapportFinancier = asyncHandler(async (req, res) => {
  const filters = {
    date_debut: req.query.date_debut,
    date_fin: req.query.date_fin,
  };

  const rapport = await FinanceModel.getRapport(filters);

  // Calculer les totaux
  const totaux = rapport.reduce(
    (acc, item) => {
      acc.nb_paiements += parseInt(item.nb_paiements);
      acc.total_paiements += parseFloat(item.total_paiements);
      return acc;
    },
    { nb_paiements: 0, total_paiements: 0 },
  );

  return successResponse(
    res,
    {
      rapport,
      totaux,
    },
    "Rapport financier généré avec succès",
  );
});
