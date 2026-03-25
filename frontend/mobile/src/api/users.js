// src/api/users.js
// /api/users endpoints — profile fetch and update

import { apiFetch } from './client';

/**
 * GET /api/users/me
 * Fetch the current authenticated user's profile.
 * @returns {{ userId, email, firstName, lastName, roles }}
 */
export async function getMe() {
  return apiFetch('/api/users/me', {}, true);
}

/**
 * PUT /api/users/me
 * Update the current user's first and/or last name.
 * @param {{ firstName?: string, lastName?: string }} data
 * @returns {null} 204 No Content on success
 */
export async function updateMe(data) {
  return apiFetch('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }, true);
}
