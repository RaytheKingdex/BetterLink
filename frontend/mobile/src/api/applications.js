// src/api/applications.js
// /api/applications endpoints — student application tracking

import { apiFetch } from './client';

/**
 * GET /api/applications/me
 * Fetch the current student's submitted applications.
 * @returns {MyApplicationItem[]}
 */
export async function getMyApplications() {
  return apiFetch('/api/applications/me', {}, true);
}
