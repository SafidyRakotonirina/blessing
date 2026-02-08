import { pool } from "../config/database.js";

class VagueModel {
  // Créer une vague avec horaires (array of {jour_id, horaire_id})
  static async create(vagueData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        nom,
        niveau_id,
        enseignant_id,
        salle_id,
        date_debut,
        date_fin,
        statut = "planifie",
        horaires = [], 
      } = vagueData;

      let capacite_max = 20;
      if (salle_id) {
        const [salle] = await connection.execute(
          "SELECT capacite FROM salles WHERE id = ?",
          [salle_id],
        );
        if (salle.length === 0) throw new Error("Salle introuvable");
        capacite_max = salle[0].capacite;
      }

      const [result] = await connection.execute(
        `INSERT INTO vagues (nom, niveau_id, enseignant_id, salle_id, date_debut, date_fin, capacite_max, statut) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nom,
          niveau_id,
          enseignant_id || null,
          salle_id || null,
          date_debut,
          date_fin,
          capacite_max,
          statut,
        ],
      );
      const vagueId = result.insertId;

      // Insérer les horaires
      if (horaires.length === 0) throw new Error("Au moins un horaire requis");
      for (const h of horaires) {
        if (!h.jour_id || !h.horaire_id)
          throw new Error("jour_id et horaire_id requis pour chaque horaire");
        await connection.execute(
          `INSERT INTO vague_horaires (vague_id, jour_id, horaire_id) VALUES (?, ?, ?)`,
          [vagueId, h.jour_id, h.horaire_id],
        );
      }

      await connection.commit();
      return vagueId;
    } catch (error) {
      await connection.rollback();
      console.error("[VagueModel] Erreur create:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Trouver une vague par ID avec horaires
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT v.*,
              n.code as niveau_code, n.nom as niveau_nom,
              u.nom as enseignant_nom, u.prenom as enseignant_prenom,
              s.nom as salle_nom, s.capacite as salle_capacite,
              (SELECT COUNT(*) FROM inscriptions WHERE vague_id = v.id AND statut = 'actif') as nb_inscrits
       FROM vagues v
       LEFT JOIN niveaux n ON v.niveau_id = n.id
       LEFT JOIN utilisateurs u ON v.enseignant_id = u.id
       LEFT JOIN salles s ON v.salle_id = s.id
       WHERE v.id = ?`,
      [id],
    );

    if (rows.length === 0) return null;

    // Récupérer les horaires avec joins
    const [horaires] = await pool.execute(
      `SELECT vh.*, j.nom as jour_nom, j.ordre as jour_ordre,
              h.heure_debut, h.heure_fin, h.libelle
       FROM vague_horaires vh
       JOIN jours j ON vh.jour_id = j.id
       JOIN horaires h ON vh.horaire_id = h.id
       WHERE vh.vague_id = ?
       ORDER BY j.ordre, h.heure_debut`,
      [id],
    );

    return {
      ...rows[0],
      horaires,
    };
  }

  // Obtenir toutes les vagues avec filtres et pagination
  static async findAll(filters = {}) {
    let query = `
      SELECT v.*,
             n.code as niveau_code, n.nom as niveau_nom,
             u.nom as enseignant_nom, u.prenom as enseignant_prenom,
             s.nom as salle_nom,
             (SELECT COUNT(*) FROM inscriptions WHERE vague_id = v.id AND statut = 'actif') as nb_inscrits
      FROM vagues v
      LEFT JOIN niveaux n ON v.niveau_id = n.id
      LEFT JOIN utilisateurs u ON v.enseignant_id = u.id
      LEFT JOIN salles s ON v.salle_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.statut) {
      query += " AND v.statut = ?";
      params.push(filters.statut);
    }
    if (filters.niveau_id) {
      query += " AND v.niveau_id = ?";
      params.push(filters.niveau_id);
    }
    if (filters.enseignant_id) {
      query += " AND v.enseignant_id = ?";
      params.push(filters.enseignant_id);
    }
    if (filters.salle_id) {
      query += " AND v.salle_id = ?";
      params.push(filters.salle_id);
    }
    if (filters.search) {
      query += " AND v.nom LIKE ?";
      params.push(`%${filters.search}%`);
    }

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));
    const offset = (page - 1) * limit;

    query += ` ORDER BY v.date_debut DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);

    // Ajouter horaires à chaque vague
    const vagues = await Promise.all(
      rows.map(async (vague) => {
        const [horaires] = await pool.execute(
          `SELECT vh.*, j.nom as jour_nom, j.ordre as jour_ordre,
                  h.heure_debut, h.heure_fin, h.libelle
           FROM vague_horaires vh
           JOIN jours j ON vh.jour_id = j.id
           JOIN horaires h ON vh.horaire_id = h.id
           WHERE vh.vague_id = ?
           ORDER BY j.ordre, h.heure_debut`,
          [vague.id],
        );
        return { ...vague, horaires };
      }),
    );

    // Comptage du total
    let countQuery = "SELECT COUNT(*) as total FROM vagues v WHERE 1=1";
    const countParams = [];

    if (filters.statut) {
      countQuery += " AND v.statut = ?";
      countParams.push(filters.statut);
    }
    if (filters.niveau_id) {
      countQuery += " AND v.niveau_id = ?";
      countParams.push(filters.niveau_id);
    }
    if (filters.enseignant_id) {
      countQuery += " AND v.enseignant_id = ?";
      countParams.push(filters.enseignant_id);
    }
    if (filters.salle_id) {
      countQuery += " AND v.salle_id = ?";
      countParams.push(filters.salle_id);
    }
    if (filters.search) {
      countQuery += " AND v.nom LIKE ?";
      countParams.push(`%${filters.search}%`);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    return { vagues, total, page, limit };
  }

  // Mettre à jour une vague et ses horaires
  static async update(id, vagueData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { horaires, ...vagueFields } = vagueData;

      // Mise à jour de la capacité si salle change
      if (vagueFields.salle_id) {
        const [salleRows] = await connection.execute(
          "SELECT capacite FROM salles WHERE id = ?",
          [vagueFields.salle_id],
        );
        if (salleRows.length === 0) throw new Error("Salle introuvable");
        vagueFields.capacite_max = salleRows[0].capacite;
      }

      // Mise à jour des champs
      const fields = [];
      const values = [];
      Object.keys(vagueFields).forEach((key) => {
        if (vagueFields[key] !== undefined && key !== "id") {
          fields.push(`${key} = ?`);
          values.push(vagueFields[key]);
        }
      });

      if (fields.length > 0) {
        values.push(id);
        await connection.execute(
          `UPDATE vagues SET ${fields.join(", ")} WHERE id = ?`,
          values,
        );
      }

      // Mise à jour des horaires
      if (horaires !== undefined) {
        // Supprimer les anciens
        await connection.execute(
          "DELETE FROM vague_horaires WHERE vague_id = ?",
          [id],
        );

        // Insérer les nouveaux
        for (const h of horaires) {
          await connection.execute(
            `INSERT INTO vague_horaires (vague_id, jour_id, horaire_id) VALUES (?, ?, ?)`,
            [id, h.jour_id, h.horaire_id],
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("[VagueModel] Erreur update:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Supprimer une vague (si non utilisée)
  static async delete(id) {
    if (await this.isUsed(id)) {
      throw new Error("Vague utilisée dans des inscriptions");
    }
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Supprimer horaires
      await connection.execute(
        "DELETE FROM vague_horaires WHERE vague_id = ?",
        [id],
      );

      // Supprimer vague
      const [result] = await connection.execute(
        "DELETE FROM vagues WHERE id = ?",
        [id],
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error("[VagueModel] Erreur delete:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Vérifier si utilisée
  static async isUsed(id) {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM inscriptions WHERE vague_id = ?",
      [id],
    );
    return rows[0].count > 0;
  }

  // Vérifier la capacité d'une vague
  static async checkCapacite(vagueId) {
    const [rows] = await pool.execute(
      `SELECT v.capacite_max,
              (SELECT COUNT(*) FROM inscriptions WHERE vague_id = v.id AND statut = 'actif') as nb_inscrits
       FROM vagues v
       WHERE v.id = ?`,
      [vagueId],
    );
    if (rows.length === 0) return false;
    return rows[0].nb_inscrits < rows[0].capacite_max;
  }

  // Obtenir le planning complet
  static async getPlanning(filters = {}) {
    let query = `
      SELECT v.id, v.nom, v.statut, v.capacite_max, v.date_debut, v.date_fin,
             n.code as niveau_code,
             u.nom as enseignant_nom, u.prenom as enseignant_prenom,
             s.nom as salle_nom,
             (SELECT COUNT(*) FROM inscriptions WHERE vague_id = v.id AND statut = 'actif') as nb_inscrits
      FROM vagues v
      LEFT JOIN niveaux n ON v.niveau_id = n.id
      LEFT JOIN utilisateurs u ON v.enseignant_id = u.id
      LEFT JOIN salles s ON v.salle_id = s.id
      WHERE v.statut IN ('planifie', 'en_cours')
    `;

    const params = [];
    if (filters.salle_id) {
      query += " AND v.salle_id = ?";
      params.push(filters.salle_id);
    }
    if (filters.enseignant_id) {
      query += " AND v.enseignant_id = ?";
      params.push(filters.enseignant_id);
    }

    const [vagues] = await pool.execute(query, params);

    const vaguesAvecHoraires = await Promise.all(
      vagues.map(async (vague) => {
        const [horaires] = await pool.execute(
          `SELECT vh.*, j.nom as jour_nom, j.ordre as jour_ordre,
                  h.heure_debut, h.heure_fin, h.libelle
           FROM vague_horaires vh
           JOIN jours j ON vh.jour_id = j.id
           JOIN horaires h ON vh.horaire_id = h.id
           WHERE vh.vague_id = ?
           ORDER BY j.ordre, h.heure_debut`,
          [vague.id],
        );
        return { ...vague, horaires };
      }),
    );

    return vaguesAvecHoraires;
  }
}

export default VagueModel;
