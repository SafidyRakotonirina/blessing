import bcrypt from "bcryptjs";
import { pool } from "../config/database.js";

class UserModel {
  // Créer un utilisateur (étudiant par défaut si role non spécifié)
  static async create(userData) {
    const {
      nom,
      prenom,
      email,
      telephone,
      password,
      role = "etudiant",
      google_id = null,
      photo_url = null,
    } = userData;

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const [result] = await pool.execute(
      `INSERT INTO utilisateurs (nom, prenom, email, telephone, password, role, google_id, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nom,
        prenom,
        email || null,
        telephone,
        hashedPassword,
        role,
        google_id || null,
        photo_url || null,
      ],
    );

    return result.insertId;
  }

  // Trouver un utilisateur par email
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      "SELECT * FROM utilisateurs WHERE email = ?",
      [email],
    );
    return rows[0];
  }

  // Trouver un utilisateur par ID (exclut password et refresh_token)
  static async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id, nom, prenom, email, telephone, role, photo_url, actif, created_at FROM utilisateurs WHERE id = ?",
      [id],
    );
    return rows[0];
  }

  // Trouver un utilisateur par Google ID
  static async findByGoogleId(googleId) {
    const [rows] = await pool.execute(
      "SELECT * FROM utilisateurs WHERE google_id = ?",
      [googleId],
    );
    return rows[0];
  }

  // Obtenir tous les utilisateurs avec filtres (inclut étudiants via role)
  static async findAll(filters = {}) {
  const { role, actif, search, page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;
  const params = [];
  let whereClause = "";

  // Correction des filtres avec l'alias u.
  if (role) {
    whereClause += " AND u.role = ?";
    params.push(role);
  }
  if (actif !== undefined) {
    whereClause += " AND u.actif = ?";
    params.push(actif);
  }
  if (search) {
    whereClause += " AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.email LIKE ?)";
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  // La requête avec u.id pour lever l'ambiguïté
  const sql = `
    SELECT 
      u.id, u.nom, u.prenom, u.email, u.telephone, u.role, u.photo_url, u.actif, u.created_at,
      COUNT(DISTINCT i.id) as nb_inscriptions,
      COUNT(DISTINCT CASE WHEN i.statut = 'actif' THEN i.id END) as nb_inscriptions_actives
    FROM utilisateurs u
    LEFT JOIN inscriptions i ON u.id = i.etudiant_id
    WHERE 1=1 ${whereClause}
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;

  // On ajoute les params pour la pagination
  const queryParams = [...params, parseInt(limit), parseInt(offset)];
  const [users] = await pool.execute(sql, queryParams);

  // Requête pour le total (nécessaire pour la pagination)
  const [totalResult] = await pool.execute(
    `SELECT COUNT(*) as count FROM utilisateurs u WHERE 1=1 ${whereClause}`,
    params
  );

  return {
    users,
    total: totalResult[0].count,
    page: parseInt(page),
    limit: parseInt(limit)
  };
}

  // Mettre à jour un utilisateur
  static async update(id, userData) {
    const fields = [];
    const values = [];

    Object.keys(userData).forEach((key) => {
      if (userData[key] !== undefined && key !== "password" && key !== "id") {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });

    if (fields.length === 0) {
      return false;
    }

    values.push(id);

    const [result] = await pool.execute(
      `UPDATE utilisateurs SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return result.affectedRows > 0;
  }

  // Mettre à jour le mot de passe
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.execute(
      "UPDATE utilisateurs SET password = ? WHERE id = ?",
      [hashedPassword, id],
    );

    return result.affectedRows > 0;
  }

  // Désactiver un utilisateur (soft delete)
  static async deactivate(id) {
    const [result] = await pool.execute(
      "UPDATE utilisateurs SET actif = FALSE WHERE id = ?",
      [id],
    );

    return result.affectedRows > 0;
  }

  // Activer/désactiver un utilisateur
  static async toggleActive(id) {
    const [result] = await pool.execute(
      "UPDATE utilisateurs SET actif = NOT actif WHERE id = ?",
      [id],
    );

    return result.affectedRows > 0;
  }

  // Vérifier si utilisé avant hard delete
  static async isUsed(id) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM inscriptions WHERE etudiant_id = ?
       UNION SELECT COUNT(*) FROM vagues WHERE enseignant_id = ?
       UNION SELECT COUNT(*) FROM paiements WHERE utilisateur_id = ?`,
      [id, id, id],
    );
    return rows.some((r) => r.count > 0);
  }

  // Supprimer un utilisateur (hard delete - si non utilisé)
  static async delete(id) {
    if (await this.isUsed(id)) {
      throw new Error(
        "Utilisateur utilisé dans des inscriptions/vagues/paiements",
      );
    }
    const [result] = await pool.execute(
      "DELETE FROM utilisateurs WHERE id = ?",
      [id],
    );

    return result.affectedRows > 0;
  }

  // Enregistrer le refresh token
  static async saveRefreshToken(id, refreshToken) {
    const [result] = await pool.execute(
      "UPDATE utilisateurs SET refresh_token = ? WHERE id = ?",
      [refreshToken, id],
    );

    return result.affectedRows > 0;
  }

  // Supprimer le refresh token
  static async removeRefreshToken(id) {
    const [result] = await pool.execute(
      "UPDATE utilisateurs SET refresh_token = NULL WHERE id = ?",
      [id],
    );

    return result.affectedRows > 0;
  }

  // Vérifier le refresh token
  static async verifyRefreshToken(id, refreshToken) {
    const [rows] = await pool.execute(
      "SELECT refresh_token FROM utilisateurs WHERE id = ? AND refresh_token = ?",
      [id, refreshToken],
    );

    return rows.length > 0;
  }

  // Vérifier le mot de passe
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Obtenir les statistiques
  static async getStats() {
    const [stats] = await pool.execute(`
      SELECT 
        role,
        COUNT(*) as total,
        SUM(CASE WHEN actif = TRUE THEN 1 ELSE 0 END) as actifs,
        SUM(CASE WHEN actif = FALSE THEN 1 ELSE 0 END) as inactifs
      FROM utilisateurs
      GROUP BY role
    `);

    return stats;
  }

  // Obtenir les enseignants disponibles pour un créneau
  static async getAvailableTeachers(jourId, horaireId, excludeVagueId = null) {
    let query = `
      SELECT DISTINCT u.id, u.nom, u.prenom, u.email, u.telephone
      FROM utilisateurs u
      WHERE u.role = 'enseignant' 
        AND u.actif = TRUE
        AND u.id NOT IN (
          SELECT v.enseignant_id 
          FROM vagues v
          JOIN vague_horaires vh ON v.id = vh.vague_id
          WHERE vh.jour_id = ? 
            AND vh.horaire_id = ?
            AND v.statut IN ('planifie', 'en_cours')
    `;

    const params = [jourId, horaireId];

    if (excludeVagueId) {
      query += " AND v.id != ?";
      params.push(excludeVagueId);
    }

    query += ")";

    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

export default UserModel;
