import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export const useVagueStore = create((set) => ({
  vagues: [],
  selectedVague: null,
  filters: {
    statut: '',
    niveau_id: '',
    enseignant_id: '',
    salle_id: '',
  },

  setVagues: (vagues) => set({ vagues }),
  setSelectedVague: (vague) => set({ selectedVague: vague }),
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  clearFilters: () => set({
    filters: {
      statut: '',
      niveau_id: '',
      enseignant_id: '',
      salle_id: '',
    }
  }),
}));

export const useNiveauStore = create((set) => ({
  niveaux: [],
  setNiveaux: (niveaux) => set({ niveaux }),
}));

export const useUserStore = create((set) => ({
  users: [],
  selectedUser: null,
  setUsers: (users) => set({ users }),
  setSelectedUser: (user) => set({ selectedUser: user }),
}));

export const useFinanceStore = create((set) => ({
  ecolages: [],
  stats: null,
  setEcolages: (ecolages) => set({ ecolages }),
  setStats: (stats) => set({ stats }),
}));
