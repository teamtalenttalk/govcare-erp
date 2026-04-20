import { create } from 'zustand';
import api from './api';
import { DEMO_MODE, DEMO_USER } from './demo-data';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    if (DEMO_MODE) {
      localStorage.setItem('govcare_token', 'demo-token');
      localStorage.setItem('govcare_user', JSON.stringify(DEMO_USER));
      set({ user: DEMO_USER as User, token: 'demo-token', isAuthenticated: true });
      return;
    }
    const response = await api.post('/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('govcare_token', token);
    localStorage.setItem('govcare_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('govcare_token');
    localStorage.removeItem('govcare_user');
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  loadUser: () => {
    const token = localStorage.getItem('govcare_token');
    const userStr = localStorage.getItem('govcare_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },
}));
