// src/api/client.js
// Central HTTP client for all BetterLink API calls

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// ─── Config ────────────────────────────────────────────────────────────────────
// The client tries a small set of local development addresses so the same build
// works on web, iOS simulator, Android emulator, and loopback-based device runs.
const BASE_URL_CANDIDATES = [
  Constants?.expoConfig?.extra?.apiBaseUrl,
  process.env.EXPO_PUBLIC_API_BASE_URL,
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://10.0.2.2:5000',
].filter(Boolean);

export const BASE_URL = BASE_URL_CANDIDATES[0];

const TOKEN_KEY = 'betterlink_token';

// ─── Token Helpers ─────────────────────────────────────────────────────────────
export const saveToken = async (token) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const clearToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

// ─── Core Fetcher ──────────────────────────────────────────────────────────────
/**
 * Makes an authenticated (or public) request to the BetterLink API.
 *
 * @param {string} path      - e.g. '/api/jobs'
 * @param {object} options   - fetch options (method, body, etc.)
 * @param {boolean} auth     - whether to attach the JWT Bearer token
 * @returns {Promise<any>}   - parsed JSON response
 * @throws {ApiError}        - structured error with status + message
 */
export async function apiFetch(path, options = {}, auth = false) {
  let lastError = null;

  for (const baseUrl of BASE_URL_CANDIDATES) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

      if (auth) {
        const token = await getToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
      });

      // No-content responses (204)
      if (response.status === 204) {
        return null;
      }

      // Try to parse body
      let body;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = await response.json();
      } else {
        body = await response.text();
      }

      if (!response.ok) {
        const message = extractErrorMessage(body) || `HTTP ${response.status}`;
        const err = new Error(message);
        err.status = response.status;
        err.body = body;
        throw err;
      }

      return body;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to reach the BetterLink API.');
}

// ─── Error Helpers ─────────────────────────────────────────────────────────────
function extractErrorMessage(body) {
  if (typeof body === 'string') return body;
  if (typeof body === 'object' && body !== null) {
    if (body.message) return body.message;
    if (body.title) return body.title;
    // ASP.NET validation errors
    if (body.errors) {
      const msgs = Object.values(body.errors).flat();
      return msgs.join(' ');
    }
  }
  return null;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}
