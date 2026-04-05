// src/api/follows.js
// BetterLink — Follow / network endpoints

import { apiFetch } from './client';

/** GET /api/follows/following — users the current user follows */
export async function getFollowing() {
  return apiFetch('/api/follows/following', {}, true);
}

/** GET /api/follows/followers — users who follow the current user */
export async function getFollowers() {
  return apiFetch('/api/follows/followers', {}, true);
}

/** POST /api/follows/:userId — follow a user */
export async function followUser(userId) {
  return apiFetch(`/api/follows/${userId}`, { method: 'POST' }, true);
}

/** DELETE /api/follows/:userId — unfollow a user */
export async function unfollowUser(userId) {
  return apiFetch(`/api/follows/${userId}`, { method: 'DELETE' }, true);
}

/** GET /api/follows/search?q= — search users to follow */
export async function searchUsers(q) {
  return apiFetch(`/api/follows/search?q=${encodeURIComponent(q)}`, {}, true);
}
