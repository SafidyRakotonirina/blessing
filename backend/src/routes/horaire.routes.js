import express from "express";
import {
  createHoraire,
  deleteHoraire,
  getHoraireById,
  getHoraires,
  getHorairesDisponibles,
  updateHoraire,
} from "../controllers/horaire.controller.js";
import {
  authenticate,
  isAdminOrSecretaire,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes publiques (lecture)
router.get("/", getHoraires);
router.get("/disponibles", getHorairesDisponibles);
router.get("/:id", getHoraireById);

// Routes protégées (admin/secrétaire uniquement)
router.post("/", isAdminOrSecretaire, createHoraire);
router.put("/:id", isAdminOrSecretaire, updateHoraire);
router.delete("/:id", isAdminOrSecretaire, deleteHoraire);

export default router;
