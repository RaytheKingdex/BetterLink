// src/api/feed.js
// BetterLink — Feed / social posts endpoints

import { Platform } from 'react-native';
import { apiFetch, apiFetchFormData } from './client';

/**
 * Fetch paginated feed posts (most recent first).
 * @param {{ page?: number, pageSize?: number }} options
 */
export async function getFeed({ page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('pageSize', String(pageSize));
  return apiFetch(`/api/feed?${params.toString()}`, {}, true);
}

/**
 * On web, asset.uri is a blob: or data: URL — convert it to a real Blob
 * so the browser can include it as a proper multipart file.
 */
async function assetToFile(asset, index) {
  const mime = asset.mimeType || 'image/jpeg';
  const ext = mime.includes('video') ? '.mp4' : '.jpg';
  const name = asset.fileName || `media_${index}${ext}`;

  if (Platform.OS !== 'web') {
    // React Native native fetch polyfill handles { uri, type, name } natively
    return { uri: asset.uri, type: mime, name };
  }

  // Web: fetch the blob URL / data URL and turn it into a File object
  const response = await fetch(asset.uri);
  const blob = await response.blob();
  return new File([blob], name, { type: mime });
}

/**
 * Create a new post, optionally with media attachments.
 * @param {string} content
 * @param {object[]} mediaAssets  expo-image-picker assets
 */
export async function createPost(content, mediaAssets = []) {
  const formData = new FormData();
  formData.append('content', content);

  for (let i = 0; i < mediaAssets.length; i++) {
    const file = await assetToFile(mediaAssets[i], i);
    formData.append('media', file);
  }

  return apiFetchFormData('/api/feed', formData, true);
}

/**
 * Toggle like on a post. Returns { liked, likeCount }.
 * @param {number} postId
 */
export async function toggleLike(postId) {
  return apiFetch(`/api/feed/${postId}/like`, { method: 'POST' }, true);
}

/**
 * Delete own post.
 * @param {number} postId
 */
export async function deletePost(postId) {
  return apiFetch(`/api/feed/${postId}`, { method: 'DELETE' }, true);
}

/**
 * GET /api/feed/:id/comments
 */
export async function getComments(postId) {
  return apiFetch(`/api/feed/${postId}/comments`, {}, true);
}

/**
 * POST /api/feed/:id/comments
 */
export async function addComment(postId, body) {
  return apiFetch(`/api/feed/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  }, true);
}

/**
 * DELETE /api/feed/:id/comments/:commentId
 */
export async function deleteComment(postId, commentId) {
  return apiFetch(`/api/feed/${postId}/comments/${commentId}`, { method: 'DELETE' }, true);
}
