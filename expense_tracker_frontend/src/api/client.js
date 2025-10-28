import axios from 'axios';

/**
 * Utilities for managing auth tokens in localStorage.
 * Keys are namespaced to avoid collisions.
 */
const ACCESS_TOKEN_KEY = 'et_access_token';
const REFRESH_TOKEN_KEY = 'et_refresh_token';

// PUBLIC_INTERFACE
export function setTokens({ access, refresh }) {
  /** Set the access and refresh tokens in localStorage. */
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

// PUBLIC_INTERFACE
export function clearTokens() {
  /** Remove stored tokens from localStorage. */
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

const defaultBase = (() => {
  try {
    const origin = window?.location?.origin || '';
    // default API prefix under same host
    return `${origin}/api`;
  } catch {
    return '/api';
  }
})();

const baseURL = process.env.REACT_APP_API_BASE || defaultBase;

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
  const refreshUrl = '/auth/token/refresh/'; // relative to baseURL
  const response = await axios.post(
    `${baseURL}${refreshUrl.startsWith('/') ? '' : '/'}${refreshUrl}`,
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

// PUBLIC_INTERFACE
export async function login(username, password) {
  /**
   * Authenticate user with username/password.
   * Calls the backend token endpoint and stores the returned tokens.
   * Returns the token payload.
   */
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

// PUBLIC_INTERFACE
export default api;
