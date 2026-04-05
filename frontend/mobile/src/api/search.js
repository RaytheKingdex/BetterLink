// src/api/search.js
import { apiFetch } from './client';

/** GET /api/search/students?q= — Employer finds students */
export async function searchStudents(q = '') {
  return apiFetch(`/api/search/students?q=${encodeURIComponent(q)}`, {}, true);
}

/** GET /api/search/employers?q= — Student finds employers */
export async function searchEmployers(q = '') {
  return apiFetch(`/api/search/employers?q=${encodeURIComponent(q)}`, {}, true);
}
