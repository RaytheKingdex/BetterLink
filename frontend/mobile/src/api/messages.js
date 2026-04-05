// src/api/messages.js
// BetterLink — Direct message endpoints

import { apiFetch } from './client';

/** GET /api/messages/conversations — all users the current user has DM'd */
export async function getConversations() {
  return apiFetch('/api/messages/conversations', {}, true);
}

/** GET /api/messages/:userId — fetch DM thread with a user */
export async function getThread(userId, { page = 1, pageSize = 40 } = {}) {
  return apiFetch(
    `/api/messages/${userId}?page=${page}&pageSize=${pageSize}`,
    {},
    true,
  );
}

/** POST /api/messages/:userId — send a DM */
export async function sendMessage(userId, body) {
  return apiFetch(`/api/messages/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  }, true);
}
