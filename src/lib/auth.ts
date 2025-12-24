'use client';

import { User, AuthToken } from '@/types/user';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

export const authStorage = {
  setAuth: (authData: AuthToken) => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(TOKEN_KEY, authData.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(authData.user));
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!authStorage.getToken();
  },

  clearAuth: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export function useAuth() {
  const user = authStorage.getUser();
  const token = authStorage.getToken();
  const isAuthenticated = authStorage.isAuthenticated();

  return {
    user,
    token,
    isAuthenticated,
    logout: () => {
      authStorage.clearAuth();
      window.location.href = '/';
    },
  };
}