// src/api/jobs.js
// /api/jobs endpoints — browse, detail, create, apply

import { apiFetch } from './client';

/**
 * GET /api/jobs
 * Browse open job listings with optional title filter and pagination.
 * @param {{ title?: string, page?: number, pageSize?: number }} params
 * @returns {JobListItem[]}
 */
export async function getJobs({ title = '', page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams();
  if (title) params.append('title', title);
  params.append('page', String(page));
  params.append('pageSize', String(pageSize));
  return apiFetch(`/api/jobs?${params.toString()}`);
}

/**
 * GET /api/jobs/:id
 * Fetch a single job by ID.
 * @param {number} id
 * @returns {JobListItem}
 */
export async function getJobById(id) {
  return apiFetch(`/api/jobs/${id}`);
}

/**
 * POST /api/jobs
 * Create a new job posting (Employer only).
 * @param {{ title, description, location, employmentType, applicationDeadline? }} data
 * @returns {{ id }}
 */
export async function createJob(data) {
  return apiFetch('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
}

/**
 * GET /api/jobs/mine
 * Returns the employer's own listings with applicant counts.
 */
export async function getMyJobs() {
  return apiFetch('/api/jobs/mine', {}, true);
}

/**
 * GET /api/jobs/:id/applicants?sortBy=
 * Returns applicants for a job (Employer only).
 */
export async function getJobApplicants(jobId, sortBy = 'date_desc') {
  return apiFetch(`/api/jobs/${jobId}/applicants?sortBy=${encodeURIComponent(sortBy)}`, {}, true);
}

/**
 * PUT /api/jobs/:id
 * Edit an existing job listing (Employer only).
 */
export async function updateJob(jobId, data) {
  return apiFetch(`/api/jobs/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, true);
}

/**
 * DELETE /api/jobs/:id
 * Delete a job listing (Employer only).
 */
export async function deleteJob(jobId) {
  return apiFetch(`/api/jobs/${jobId}`, { method: 'DELETE' }, true);
}

/**
 * PUT /api/jobs/:id/applicants/:applicationId/status
 * Accept ('accepted') or reject ('rejected') an applicant.
 * Sending 'accepted' triggers an automated hire DM to the student.
 */
export async function updateApplicationStatus(jobId, applicationId, status) {
  return apiFetch(`/api/jobs/${jobId}/applicants/${applicationId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }, true);
}

/**
 * POST /api/jobs/:id/apply
 * Apply to a job (Student only).
 * @param {number} jobId
 * @param {{ coverLetter?: string }} data
 * @returns {{ message }}
 */
export async function applyToJob(jobId, data = {}) {
  return apiFetch(`/api/jobs/${jobId}/apply`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
}
