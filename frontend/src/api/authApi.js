const BASE_URL = 'http://localhost:8080/api/auth';

// unlike the movie endpoints, these return useful error messages in the
// body, so pull them out instead of throwing a generic HTTP error
async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function post(path, body) {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // session cookie
    body: JSON.stringify(body ?? {}),
  }).then(handleResponse);
}

export function register(form) {
  return post('/register', form);
}

export function activate(token) {
  return post('/activate', { token });
}

export function login(email, password) {
  return post('/login', { email, password });
}

export function logout() {
  return post('/logout');
}

/** Restores the signed-in user after a page refresh. Null when signed out. */
export function fetchCurrentUser() {
  return fetch(`${BASE_URL}/me`, { credentials: 'include' })
    .then(res => (res.ok ? res.json() : null))
    .catch(() => null);
}

export function forgotPassword(email) {
  return post('/forgot-password', { email });
}

export function resetPassword(token, newPassword) {
  return post('/reset-password', { token, newPassword });
}
