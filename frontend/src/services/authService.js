import api from './api';

// POST /api/auth/signup — tourist self-registration
export async function signupTourist({ name, email, phone, password, confirmPassword }) {
  return api.post('/auth/signup', { name, email, phone, password, confirmPassword });
}

// POST /api/auth/login — all roles
export async function loginUser({ email, password }) {
  return api.post('/auth/login', { email, password });
}

// GET /api/auth/me — fetch current user from token
export async function fetchProfile() {
  return api.get('/auth/me');
}

// Persist token + user to localStorage
export function saveSession(token, user) {
  localStorage.setItem('sy_token', token);
  localStorage.setItem('sy_user', JSON.stringify(user));
}

// Clear session
export function clearSession() {
  localStorage.removeItem('sy_token');
  localStorage.removeItem('sy_user');
}

// Read persisted user (used on page reload)
export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('sy_user') || 'null'); } catch { return null; }
}
