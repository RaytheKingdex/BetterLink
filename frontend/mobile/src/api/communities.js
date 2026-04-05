// src/api/communities.js
// /api/communities endpoints

import { Platform } from 'react-native';
import { apiFetch } from './client';
import { getToken, BASE_URL } from './client';

export async function createCommunity(data) {
  return apiFetch('/api/communities', { method: 'POST', body: JSON.stringify(data) }, true);
}

export async function getCommunityById(id) {
  return apiFetch(`/api/communities/${id}`, {}, true);
}

export async function deleteCommunity(id) {
  return apiFetch(`/api/communities/${id}`, { method: 'DELETE' }, true);
}

export async function joinCommunity(id) {
  return apiFetch(`/api/communities/${id}/join`, { method: 'POST' }, true);
}

export async function getMyCommunities() {
  return apiFetch('/api/communities/mine', {}, true);
}

export async function searchCommunities(q) {
  return apiFetch(`/api/communities/search?q=${encodeURIComponent(q)}`, {}, true);
}

export async function getCommunityMessages(id, page = 1, pageSize = 50) {
  return apiFetch(`/api/communities/${id}/messages?page=${page}&pageSize=${pageSize}`, {}, true);
}

/**
 * Post a community message with optional media/document attachment.
 * Uses multipart/form-data so the server can receive the file.
 */
export async function postCommunityMessage(id, body, attachment = null) {
  const token = await getToken();
  const formData = new FormData();
  if (body) formData.append('body', body);

  if (attachment) {
    if (Platform.OS === 'web') {
      // On web, fetch the blob URL and convert to a File
      const res = await fetch(attachment.uri);
      const blob = await res.blob();
      const file = new File([blob], attachment.name || 'attachment', { type: attachment.mimeType || blob.type });
      formData.append('attachment', file);
    } else {
      formData.append('attachment', {
        uri: attachment.uri,
        type: attachment.mimeType || 'application/octet-stream',
        name: attachment.name || 'attachment',
      });
    }
  }

  const response = await fetch(`${BASE_URL}/api/communities/${id}/messages`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  const result = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const err = new Error(typeof result === 'string' ? result : (result?.message || `HTTP ${response.status}`));
    err.status = response.status;
    throw err;
  }
  return result;
}

export async function deleteCommunityMessage(communityId, messageId) {
  return apiFetch(`/api/communities/${communityId}/messages/${messageId}`, { method: 'DELETE' }, true);
}
