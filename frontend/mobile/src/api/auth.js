// src/api/auth.js
// Authentication endpoints: login, register student, register employer

import { apiFetch } from './client';

/**
 * Login with email + password.
 * @returns {{ token, userId, email, role }}
 */
export async function login(email, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Register a new student account.
 * @param {object} data - { email, password, fullName, university, programName,
 *                          graduationYear?, gpa?, skills?, resumeUrl?, portfolioUrl? }
 * @returns {{ token, userId, email, role }}
 */
export async function registerStudent(data) {
  return apiFetch('/api/auth/register/student', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Register a new employer account.
 * @param {object} data - { email, password, fullName, organizationName,
 *                          industry?, website?, location? }
 * @returns {{ token, userId, email, role }}
 */
export async function registerEmployer(data) {
  return apiFetch('/api/auth/register/employer', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
