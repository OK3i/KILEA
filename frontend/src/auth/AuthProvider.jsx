import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, AUTH_CHANGED_EVENT, TOKEN_KEY } from '../api/client.js';
import { readTokenUser } from './authToken.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!readTokenUser(savedToken)) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return savedToken;
  });
  const [user, setUser] = useState(() => readTokenUser());

  const syncUser = useCallback(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const nextUser = readTokenUser(savedToken);
    if (!nextUser) localStorage.removeItem(TOKEN_KEY);
    setToken(nextUser ? savedToken : null);
    setUser(nextUser);
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_CHANGED_EVENT, syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, [syncUser]);

  const authenticate = useCallback(async (mode, payload) => {
    const { data } = await api.post(`/auth/${mode}`, payload);
    if (!data.accessToken) {
      throw new Error('Authentication response did not contain an access token.');
    }
    localStorage.setItem(TOKEN_KEY, data.accessToken);
    setToken(data.accessToken);
    setUser(data.user || readTokenUser(data.accessToken));
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      authenticate,
      logout,
    }),
    [token, user, authenticate, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
