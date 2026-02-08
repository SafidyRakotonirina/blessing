import { pool } from "../config/database.js";

class InscriptionModel {
  // Créer une inscription complète (étudiant + inscription + écolage)
  static async createComplete(inscriptionData) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const {
        // Données étudiant (créé comme utilisateur avec role 'etudiant')
        etudiant_nom,
        etudiant_prenom,
        etudiant_telephone,
        etudiant_email = null,
        etudiant_id = null,
        // Données inscription
        vague_id,
        date_inscription,
        remarques = null,
        // Paiement initial
        frais_inscription_paye = false,
        montant_ecolage_initial = 0,
        frais_livre_paye = false,
      } = inscriptionData;

      let finalEtudiantId = etudiant_id;

      // Créer l'étudiant si nouveau (comme utilisateur)
      if (!etudiant_id) {
        const [etudiantResult] = await connection.execute(
          `INSERT INTO utilisateurs (nom, prenom, telephone, email, role)
           VALUES (?, ?, ?, ?, 'etudiant')`,
          [etudiant_nom, etudiant_prenom, etudiant_telephone, etudiant_email],
        );
        finalEtudiantId = etudiantResult.insertId;
      }

      // Créer l'inscription
      const [inscriptionResult] = await connection.execute(
        `INSERT INTO inscriptions (etudiant_id, vague_id, date_inscription, remarques)
         VALUES (?, ?, ?, ?)`,
        [finalEtudiantId, vague_id, date_inscription, remarques],
      );

      const inscriptionId = inscriptionResult.insertId;

      // Récupérer les frais du niveau
      const [niveauRows] = await connection.execute(
        `SELECT n.frais_inscription, n.frais_ecolage, n.frais_livre
         FROM vagues v
         JOIN niveaux n ON v.niveau_id = n.id
         WHERE v.id = ?`,
        [vague_id],
      );

      if (niveauRows.length === 0) {
        throw new Error("Vague ou niveau introuvable");
      }

      const { frais_inscription, frais_ecolage, frais_livre } = niveauRows[0];

      // Calculer montants
      const montant_total =
        parseFloat(frais_inscription) +
        parseFloat(frais_ecolage) +
        parseFloat(frais_livre);
      const montant_paye =
        (frais_inscription_paye ? parseFloat(frais_inscription) : 0) +
        parseFloat(montant_ecolage_initial) +
        (frais_livre_paye ? parseFloat(frais_livre) : 0);
      const montant_restant = montant_total - montant_paye;

      let statut = "non_paye";
      if (montant_paye >= montant_total) {
        statut = "paye";
      } else if (montant_paye > 0) {
        statut = "partiel";
      }

      // Créer l'écolage
      await connection.execute(
        `INSERT INTO ecolages (inscription_id, montant_total, montant_paye, montant_restant, frais_inscription_paye, frais_livre_paye, statut)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          inscriptionId,
          montant_total,
          montant_paye,
          montant_restant,
          frais_inscription_paye,
          frais_livre_paye,
          statut,
        ],
      );

      await connection.commit();
      return { inscriptionId, etudiantId: finalEtudiantId };
    } catch (error) {
      await connection.rollback();
      console.error("[InscriptionModel] Erreur createComplete:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Trouver une inscription par ID avec détails
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT i.*,
              u.nom as etudiant_nom, u.prenom as etudiant_prenom, 
              u.email as etudiant_email, u.telephone as etudiant_telephone,
              v.nom as vague_nom, v.date_debut, v.date_fin,
              n.code as niveau_code, n.nom as niveau_nom,
              ec.montant_total, ec.montant_paye, ec.montant_restant, 
              ec.frais_inscription_paye, ec.frais_livre_paye, ec.statut
       FROM inscriptions i
       JOIN utilisateurs u ON i.etudiant_id = u.id
       JOIN vagues v ON i.vague_id = v.id
       JOIN niveaux n ON v.niveau_id = n.id
       LEFT JOIN ecolages ec ON i.id = ec.inscription_id
       WHERE i.id = ?`,
      [id],
    );

    if (rows.length === 0) return null;

    // Récupérer les paiements
    const [paiements] = await pool.execute(
      "SELECT * FROM paiements WHERE ecolage_id = (SELECT id FROM ecolages WHERE inscription_id = ?) ORDER BY date_paiement DESC",
      [id],
    );

    return {
      ...rows[0],
      paiements,
    };
  }

  // Obtenir les inscriptions d'un étudiant
  static async findByEtudiant(etudiantId) {
    const [rows] = await pool.execute(
      `SELECT i.*,
              v.nom as vague_nom, v.date_debut, v.date_fin, v.statut as vague_statut,
              n.code as niveau_code, n.nom as niveau_nom,
              s.nom as salle_nom,
              ec.montant_total, ec.montant_paye, ec.montant_restant, ec.statut
       FROM inscriptions i
       JOIN vagues v ON i.vague_id = v.id
       JOIN niveaux n ON v.niveau_id = n.id
       LEFT JOIN salles s ON v.salle_id = s.id
       LEFT JOIN ecolages ec ON i.id = ec.inscription_id
       WHERE i.etudiant_id = ?
       ORDER BY i.date_inscription DESC`,
      [etudiantId],
    );

    return rows;
  }

  // Ajouter un paiement
  static async addPaiement(paiementData) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const {
        inscription_id,
        type_paiement,
        montant,
        date_paiement,
        methode_paiement,
        reference = null,
        remarques = null,
        utilisateur_id = null,
      } = paiementData;

      // Récupérer ecolage_id
      const [ecolage] = await connection.execute(
        "SELECT id FROM ecolages WHERE inscription_id = ?",
        [inscription_id],
      );
      if (ecolage.length === 0) throw new Error("Ecolage introuvable");

      const ecolage_id = ecolage[0].id;

      // Enregistrer le paiement
      const [paiementResult] = await connection.execute(
        `INSERT INTO paiements (ecolage_id, montant, date_paiement, methode_paiement, reference, type_frais, remarques, utilisateur_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ecolage_id,
          montant,
          date_paiement,
          methode_paiement,
          reference,
          type_paiement,
          remarques,
          utilisateur_id,
        ],
      );

      // Mettre à jour ecolage
      await connection.execute(
        `UPDATE ecolages 
         SET montant_paye = montant_paye + ?,
             montant_restant = montant_restant - ?
         WHERE id = ?`,
        [montant, montant, ecolage_id],
      );

      if (type_paiement === "inscription") {
        await connection.execute(
          "UPDATE ecolages SET frais_inscription_paye = TRUE WHERE id = ?",
          [ecolage_id],
        );
      } else if (type_paiement === "livre") {
        await connection.execute(
          "UPDATE ecolages SET frais_livre_paye = TRUE WHERE id = ?",
          [ecolage_id],
        );
      }

      // Recalculer statut
      const [updatedEcolage] = await connection.execute(
        "SELECT montant_total, montant_paye FROM ecolages WHERE id = ?",
        [ecolage_id],
      );

      let statut = "non_paye";
      if (updatedEcolage[0].montant_paye >= updatedEcolage[0].montant_total) {
        statut = "paye";
      } else if (updatedEcolage[0].montant_paye > 0) {
        statut = "partiel";
      }

      await connection.execute("UPDATE ecolages SET statut = ? WHERE id = ?", [
        statut,
        ecolage_id,
      ]);

      await connection.commit();
      return paiementResult.insertId;
    } catch (error) {
      await connection.rollback();
      console.error("[InscriptionModel] Erreur addPaiement:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Statistiques
  static async getStats(filters = {}) {
    let query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN i.statut = 'actif' THEN 1 ELSE 0 END) as actifs,
        SUM(CASE WHEN i.statut = 'annule' THEN 1 ELSE 0 END) as annules
      FROM inscriptions i
      WHERE 1=1
    `;

    const params = [];

    if (filters.date_debut) {
      query += " AND i.date_inscription >= ?";
      params.push(filters.date_debut);
    }

    if (filters.date_fin) {
      query += " AND i.date_inscription <= ?";
      params.push(filters.date_fin);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0];
  }
}

export default InscriptionModel;
