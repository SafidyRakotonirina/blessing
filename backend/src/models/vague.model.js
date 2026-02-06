import { pool } from "../config/database.js";

class VagueModel {
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

      let capacite = 20; 
      if (salle_id) {
        const [salle] = await connection.execute(
          "SELECT capacite FROM salles WHERE id = ?",
          [salle_id],
        );
        capacite = salle[0]?.capacite || 20;
      }

      
      const [result] = await connection.execute(
        `INSERT INTO vagues (nom, niveau_id, enseignant_id, salle_id, date_debut, date_fin, capacite_max, statut) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nom,
          niveau_id,
          enseignant_id,
          salle_id,
          date_debut,
          date_fin,
          capacite,
          statut,
        ],
      );
      const vagueId = result.insertId;

      // 3. Insérer les horaires
      if (horaires && horaires.length > 0) {
        for (const h of horaires) {
          await connection.execute(
            `INSERT INTO vague_horaires (vague_id, heure_debut, heure_fin) VALUES (?, ?, ?)`,
            [vagueId, h.heure_debut, h.heure_fin],
          );
        }
      }

      await connection.commit();
      return vagueId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Trouver une vague par ID avec ses créneaux
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

    // Récupérer les horaires
    const [horaires] = await pool.execute(
      `SELECT id, heure_debut, heure_fin
       FROM vague_horaires
       WHERE vague_id = ?
       ORDER BY heure_debut`,
      [id],
    );

    return {
      ...rows[0],
      horaires,
    };
  }

  // Supprimer les horaires d'une vague
  static async deleteHoraires(vagueId, connection = null) {
    const conn = connection || pool;
    await conn.execute("DELETE FROM vague_horaires WHERE vague_id = ?", [
      vagueId,
    ]);
  }

  // Ajouter un horaire
  static async addHoraire(vagueId, horaire, connection = null) {
    const conn = connection || pool;
    const { heure_debut, heure_fin } = horaire;
    await conn.execute(
      "INSERT INTO vague_horaires (vague_id, heure_debut, heure_fin) VALUES (?, ?, ?)",
      [vagueId, heure_debut, heure_fin],
    );
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

    const [rows] = await pool.execute(
      `${query} ORDER BY v.date_debut DESC LIMIT ${limit} OFFSET ${offset}`,
      params,
    );

    // Récupérer les horaires pour chaque vague
    const vagues = await Promise.all(
      rows.map(async (vague) => {
        const [horaires] = await pool.execute(
          `SELECT id, heure_debut, heure_fin
           FROM vague_horaires
           WHERE vague_id = ?
           ORDER BY heure_debut`,
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

      // Mise à jour de la capacité si la salle change
      if (vagueFields.salle_id) {
        const [salleRows] = await connection.execute(
          "SELECT capacite FROM salles WHERE id = ?",
          [vagueFields.salle_id],
        );
        if (salleRows.length > 0) {
          vagueFields.capacite_max = salleRows[0].capacite;
        }
      }

      // 1. Mise à jour des champs
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

      // 2. Mise à jour des horaires
      if (horaires !== undefined) {
        // Supprimer les anciens horaires
        await connection.execute(
          "DELETE FROM vague_horaires WHERE vague_id = ?",
          [id],
        );

        // Insérer les nouveaux horaires
        if (horaires.length > 0) {
          for (const h of horaires) {
            await connection.execute(
              "INSERT INTO vague_horaires (vague_id, heure_debut, heure_fin) VALUES (?, ?, ?)",
              [id, h.heure_debut, h.heure_fin],
            );
          }
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Supprimer d'abord les horaires
      await connection.execute(
        "DELETE FROM vague_horaires WHERE vague_id = ?",
        [id],
      );

      // Puis supprimer la vague
      const [result] = await connection.execute(
        "DELETE FROM vagues WHERE id = ?",
        [id],
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
          `SELECT id, heure_debut, heure_fin
           FROM vague_horaires
           WHERE vague_id = ?
           ORDER BY heure_debut`,
          [vague.id],
        );
        return { ...vague, horaires };
      }),
    );

    return vaguesAvecHoraires;
  }

  // Obtenir les horaires d'une vague (méthode additionnelle pour compatibilité)
  static async getHorairesByVagueId(vagueId) {
    const [horaires] = await pool.execute(
      `SELECT id, heure_debut, heure_fin
       FROM vague_horaires
       WHERE vague_id = ?
       ORDER BY heure_debut`,
      [vagueId],
    );
    return horaires;
  }
}

export default VagueModel;
