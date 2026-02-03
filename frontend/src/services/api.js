import axios from '../config/axios';

// ===== AUTH SERVICE =====
export const authService = {
  login: async (email, password) => {
    const response = await axios.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await axios.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await axios.put('/auth/profile', userData);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await axios.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// ===== USERS SERVICE =====
export const userService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await axios.post('/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await axios.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/users/${id}`);
    return response.data;
  },

  toggleActive: async (id) => {
    const response = await axios.patch(`/users/${id}/toggle`);
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get('/users/stats');
    return response.data;
  },

  getProfesseurs: async () => {
    const response = await axios.get('/users/profs');
    return response.data;
  },

  getAvailableTeachers: async (jourId, horaireId, excludeVagueId) => {
    const response = await axios.get('/users/available-teachers', {
      params: { jourId, horaireId, excludeVagueId },
    });
    return response.data;
  },
};

// ===== VAGUES SERVICE =====
export const vagueService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/vagues', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/vagues/${id}`);
    return response.data;
  },

  create: async (vagueData) => {
    const response = await axios.post('/vagues', vagueData);
    return response.data;
  },

  update: async (id, vagueData) => {
    const response = await axios.put(`/vagues/${id}`, vagueData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/vagues/${id}`);
    return response.data;
  },

  updateStatus: async (id, statut) => {
    const response = await axios.patch(`/vagues/${id}/statut`, { statut });
    return response.data;
  },

  getEtudiants: async (id) => {
    const response = await axios.get(`/vagues/${id}/etudiants`);
    return response.data;
  },

  getPlanning: async (params = {}) => {
    const response = await axios.get('/vagues/planning', { params });
    return response.data;
  },
};

// ===== INSCRIPTIONS SERVICE =====
export const inscriptionService = {
  create: async (inscriptionData) => {
    const response = await axios.post('/inscriptions', inscriptionData);
    return response.data;
  },

  delete: async (vagueId, etudiantId) => {
    const response = await axios.delete(`/inscriptions/${vagueId}/${etudiantId}`);
    return response.data;
  },

  getByStudent: async (studentId) => {
    const response = await axios.get(`/inscriptions/student/${studentId}`);
    return response.data;
  },

  updateStatus: async (id, statut) => {
    const response = await axios.patch(`/inscriptions/${id}/statut`, { statut });
    return response.data;
  },

  getStats: async (params = {}) => {
    const response = await axios.get('/inscriptions/stats', { params });
    return response.data;
  },
};

// ===== NIVEAUX SERVICE =====
export const niveauService = {
  getAll: async (params = {}) => {
    const response = await axios.get('/niveaux', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/niveaux/${id}`);
    return response.data;
  },

  create: async (niveauData) => {
    const response = await axios.post('/niveaux', niveauData);
    return response.data;
  },

  update: async (id, niveauData) => {
    const response = await axios.put(`/niveaux/${id}`, niveauData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/niveaux/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await axios.get('/niveaux/stats');
    return response.data;
  },
};

// ===== FINANCES SERVICE =====
export const financeService = {
  getEcolages: async (params = {}) => {
    const response = await axios.get('/finances/ecolages', { params });
    return response.data;
  },

  getEcolageById: async (id) => {
    const response = await axios.get(`/finances/ecolages/${id}`);
    return response.data;
  },

  getEcolagesByStudent: async (studentId) => {
    const response = await axios.get(`/finances/student/${studentId}`);
    return response.data;
  },

  enregistrerPaiement: async (paiementData) => {
    const response = await axios.post('/finances/paiements', paiementData);
    return response.data;
  },

  annulerPaiement: async (id) => {
    const response = await axios.delete(`/finances/paiements/${id}`);
    return response.data;
  },

  getStats: async (params = {}) => {
    const response = await axios.get('/finances/stats', { params });
    return response.data;
  },

  getRapport: async (params = {}) => {
    const response = await axios.get('/finances/rapport', { params });
    return response.data;
  },
};

// ===== REFERENCE SERVICE =====
export const referenceService = {
  // Salles
  getSalles: async () => {
    const response = await axios.get('/reference/salles');
    return response.data;
  },

  createSalle: async (salleData) => {
    const response = await axios.post('/reference/salles', salleData);
    return response.data;
  },

  updateSalle: async (id, salleData) => {
    const response = await axios.put(`/reference/salles/${id}`, salleData);
    return response.data;
  },

  deleteSalle: async (id) => {
    const response = await axios.delete(`/reference/salles/${id}`);
    return response.data;
  },

  // Horaires
  getHoraires: async () => {
    const response = await axios.get('/reference/horaires');
    return response.data;
  },

  createHoraire: async (horaireData) => {
    const response = await axios.post('/reference/horaires', horaireData);
    return response.data;
  },

  updateHoraire: async (id, horaireData) => {
    const response = await axios.put(`/reference/horaires/${id}`, horaireData);
    return response.data;
  },

  deleteHoraire: async (id) => {
    const response = await axios.delete(`/reference/horaires/${id}`);
    return response.data;
  },

  // Jours
  getJours: async () => {
    const response = await axios.get('/reference/jours');
    return response.data;
  },

  // Écoles
  getEcoles: async () => {
    const response = await axios.get('/reference/ecoles');
    return response.data;
  },

  createEcole: async (ecoleData) => {
    const response = await axios.post('/reference/ecoles', ecoleData);
    return response.data;
  },

  updateEcole: async (id, ecoleData) => {
    const response = await axios.put(`/reference/ecoles/${id}`, ecoleData);
    return response.data;
  },

  deleteEcole: async (id) => {
    const response = await axios.delete(`/reference/ecoles/${id}`);
    return response.data;
  },
};
