import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { login as apiLogin, logout as apiLogout, getStoredTokens, setTokens, clearTokens } from '../api/client';

/**
 * PUBLIC_INTERFACE
 * AuthContext provides authentication state and actions across the app.
 */
export const AuthContext = createContext({
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  user: null,
  login: async (_username, _password) => {},
  logout: () => {},
});

/**
 * Parse a JWT payload safely. Returns null on failure.
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * AuthProvider wraps the app and manages auth state with token persistence.
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [{ access, refresh }, setTokenState] = useState(getStoredTokens());
  const [user, setUser] = useState(null);

  const isAuthenticated = Boolean(access);

  // Derive simple user info from JWT (if it contains standard claims)
  useEffect(() => {
    if (access) {
      const payload = parseJwt(access);
      if (payload) {
        setUser({
          username: payload.username || payload.user || payload.sub || null,
          exp: payload.exp || null,
        });
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [access]);

  // Keep axios Authorization header in sync on mount/change
  useEffect(() => {
    // The request interceptor in api reads token from localStorage already,
    // but in case we need to prewarm anything, ensure tokens are in storage.
    if (access || refresh) {
      setTokens({ access, refresh });
    }
  }, [access, refresh]);

  const doLogin = useCallback(
    async (username, password) => {
      const data = await apiLogin(username, password);
      const newAccess = data.access || data.access_token || null;
      const newRefresh = data.refresh || data.refresh_token || null;
      setTokenState({ access: newAccess, refresh: newRefresh });
      // Determine where to navigate: redirect back to protected origin or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      return data;
    },
    [navigate, location.state]
  );

  const doLogout = useCallback(() => {
    // Clear tokens in both local state and storage
    apiLogout();
    clearTokens();
    setTokenState({ access: null, refresh: null });
    setUser(null);
    // Redirect to login
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      accessToken: access,
      refreshToken: refresh,
      user,
      login: doLogin,
      logout: doLogout,
    }),
    [isAuthenticated, access, refresh, user, doLogin, doLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * useAuth hook to access auth state and actions.
 */
export function useAuth() {
  return useContext(AuthContext);
}
