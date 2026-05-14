import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token'),
  login: (token: string) => {
    localStorage.setItem('token', token);
    set({ isAuthenticated: true, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, token: null });
  },
}));
