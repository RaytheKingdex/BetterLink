// src/api/communities.js
// /api/communities endpoints — create, view, join, message

import { apiFetch } from './client';

/**
 * POST /api/communities
 * Create a new community.
 * @param {{ name: string, description?: string }} data
 * @returns {{ id }}
 */
export async function createCommunity(data) {
  return apiFetch('/api/communities', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
}

/**
 * GET /api/communities/:id
 * Get community details.
 * @param {number} id
 * @returns {{ id, name, description, createdAt, memberCount }}
 */
export async function getCommunityById(id) {
  return apiFetch(`/api/communities/${id}`, {}, true);
}

/**
 * POST /api/communities/:id/join
 * Join a community.
 * @param {number} id
 * @returns {{ message }}
 */
export async function joinCommunity(id) {
  return apiFetch(`/api/communities/${id}/join`, {
    method: 'POST',
  }, true);
}

/**
 * POST /api/communities/:id/messages
 * Post a message to a community (must be a member).
 * @param {number} id
 * @param {{ body: string }} data
 * @returns {{ message }}
 */
export async function postCommunityMessage(id, data) {
  return apiFetch(`/api/communities/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
}
