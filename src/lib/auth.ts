'use client';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

export const authStorage = {
  saveToken(token: string) { if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token); },
  getToken(): string | null { if (typeof window !== 'undefined') return localStorage.getItem(TOKEN_KEY); return null; },
  saveUser(user: any) { if (typeof window !== 'undefined') localStorage.setItem(USER_KEY, JSON.stringify(user)); },
  getUser(): any | null { if (typeof window !== 'undefined') { const s = localStorage.getItem(USER_KEY); return s ? JSON.parse(s) : null; } return null; },
  isAuthenticated(): boolean { return !!this.getToken(); },
  removeToken() { if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY); },
  removeUser() { if (typeof window !== 'undefined') localStorage.removeItem(USER_KEY); },
  clear() { this.removeToken(); this.removeUser(); }
};

export function useAuth() {
  const user = authStorage.getUser();
  const token = authStorage.getToken();
  return {
    user,
    token,
    isAuthenticated: !!token,
    logout: () => { authStorage.clear(); if (typeof window !== 'undefined') window.location.href = '/'; }
  };
}