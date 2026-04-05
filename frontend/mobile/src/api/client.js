// src/api/client.js
// Central HTTP client for all BetterLink API calls

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ─── Config ────────────────────────────────────────────────────────────────────
// Update BASE_URL to your backend address when running on device/emulator.
// Android emulator → localhost maps to 10.0.2.2
// Physical device  → use your machine's LAN IP, e.g. http://192.168.1.x:5000
export const BASE_URL = 'http://10.0.2.2:5000';

const TOKEN_KEY = 'betterlink_token';

// ─── Token Helpers ─────────────────────────────────────────────────────────────
// expo-secure-store is native-only; fall back to localStorage on web.
export const saveToken = async (token) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
};

export const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const clearToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
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

// ─── Multipart / FormData Fetcher ─────────────────────────────────────────────
/**
 * POST a FormData payload (multipart/form-data) — do NOT set Content-Type manually;
 * the browser/RN runtime must set it with the correct boundary.
 */
export async function apiFetchFormData(path, formData, auth = false) {
  const headers = {};

  if (auth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (response.status === 204) return null;

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
