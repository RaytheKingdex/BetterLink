// src/api/users.js
// /api/users endpoints — profile fetch and update

import { apiFetch } from './client';

/**
 * GET /api/users/:id
 * Fetch another user's public profile.
 */
export async function getUserById(id) {
  return apiFetch(`/api/users/${id}`, {}, true);
}

/**
 * GET /api/users/me
 * Fetch the current authenticated user's profile.
 * @returns {{ userId, displayId, email, firstName, lastName, bio, roles }}
 */
export async function getMe() {
  return apiFetch('/api/users/me', {}, true);
}

/**
 * PUT /api/users/me
 * Update the current user's first/last name and/or bio.
 * @param {{ firstName?: string, lastName?: string, bio?: string }} data
 * @returns {null} 204 No Content on success
 */
export async function updateMe(data) {
  return apiFetch('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }, true);
}

/**
 * GET /api/users/:id/posts?page=1&pageSize=20
 * Fetch posts authored by a given user.
 * @returns {FeedPostItem[]}
 */
export async function getUserPosts(id, page = 1, pageSize = 20) {
  return apiFetch(`/api/users/${id}/posts?page=${page}&pageSize=${pageSize}`, {}, true);
}

/**
 * DELETE /api/users/me
 * Permanently delete the current user's account.
 */
export async function deleteMe() {
  return apiFetch('/api/users/me', { method: 'DELETE' }, true);
}
