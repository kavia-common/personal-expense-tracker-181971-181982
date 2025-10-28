import axios from 'axios';

/**
 * Utilities for managing auth tokens in localStorage.
 * Keys are namespaced to avoid collisions.
 */
const ACCESS_TOKEN_KEY = 'et_access_token';
const REFRESH_TOKEN_KEY = 'et_refresh_token';

/**
 * PUBLIC_INTERFACE
 * Set the access and refresh tokens in localStorage.
 */
export function setTokens({ access, refresh }) {
  /** Set the access and refresh tokens in localStorage. */
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

/**
 * PUBLIC_INTERFACE
 * Remove stored tokens from localStorage.
 */
export function clearTokens() {
  /** Remove stored tokens from localStorage. */
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * PUBLIC_INTERFACE
 * Get tokens; useful for components needing direct access.
 */
export function getStoredTokens() {
  return {
    access: localStorage.getItem(ACCESS_TOKEN_KEY) || null,
    refresh: localStorage.getItem(REFRESH_TOKEN_KEY) || null,
  };
}

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Determine base URL: use env or fallback to http://localhost:3001/api
const baseURL = process.env.REACT_APP_API_BASE || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header with Bearer token if available
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track refreshing state to avoid multiple parallel refresh calls
let isRefreshing = false;
let refreshPromise = null;

// Attempt a token refresh and update storage
async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error('No refresh token available');
  }

  // The refresh endpoint per acceptance: /api/auth/token/refresh
  // Our api instance uses baseURL pointing to .../api, so path should be '/auth/token/refresh'
  const refreshPath = '/auth/token/refresh';

  const response = await axios.post(
    `${baseURL}${refreshPath}`,
    { refresh },
    { headers: { 'Content-Type': 'application/json' } }
  );

  // Common JWT response field names:
  // Some backends use { access: '...', refresh: '...' } others { access_token: '...' }
  const data = response.data || {};
  const newAccess = data.access || data.access_token;
  const newRefresh = data.refresh || data.refresh_token || refresh;
  if (!newAccess) {
    throw new Error('Refresh did not return an access token');
  }
  setTokens({ access: newAccess, refresh: newRefresh });
  return newAccess;
}

// Response interceptor to handle 401 and retry once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error?.response?.status;

    if (status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loop: mark request as retried
    if (originalRequest._retry) {
      // Already retried once, clear tokens and reject
      clearTokens();
      return Promise.reject(error);
    }
    // eslint-disable-next-line no-param-reassign
    originalRequest._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken()
          .catch((e) => {
            // If refresh fails, clear tokens and propagate error
            clearTokens();
            throw e;
          })
          .finally(() => {
            isRefreshing = false;
          });
      }
      const newAccess = await refreshPromise;

      // Update the Authorization header and retry the original request
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (e) {
      return Promise.reject(e);
    }
  }
);

/**
 * PUBLIC_INTERFACE
 * Authenticate user with username/password.
 * Calls the backend token endpoint and stores the returned tokens.
 * Returns the token payload.
 */
export async function login(username, password) {
  const url = '/auth/token/'; // relative to baseURL
  const response = await api.post(url, { username, password });
  const data = response.data || {};
  // Normalize: accept either access/refresh or access_token/refresh_token
  const access = data.access || data.access_token;
  const refresh = data.refresh || data.refresh_token;
  if (access) {
    setTokens({ access, refresh });
  }
  return data;
}

/**
 * PUBLIC_INTERFACE
 * Logout helper to clear stored tokens.
 */
export function logout() {
  clearTokens();
}

export default api;
