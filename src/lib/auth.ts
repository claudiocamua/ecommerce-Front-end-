'use client';

import { User as UserType, AuthToken } from '@/types/user';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

export const authStorage = {
  saveToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  saveUser(user: UserType) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser(): UserType | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        return JSON.parse(userStr);
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  removeUser() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  },

  clear() {
    this.removeToken();
    this.removeUser();
  }
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
      authStorage.clear();
      window.location.href = '/';
    },
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  is_admin?: boolean;
}