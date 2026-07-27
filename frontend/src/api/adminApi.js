const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api') + '/admin';

// admin endpoints send readable errors in the body, same deal as authApi
async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function get(path) {
  return fetch(`${BASE_URL}${path}`, { credentials: 'include' }).then(handleResponse);
}

function post(path, body) {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body ?? {}),
  }).then(handleResponse);
}

export function addMovie(movie) {
  return post('/movies', movie);
}

export function fetchShowrooms() {
  return get('/showrooms');
}

export function fetchSchedule() {
  return get('/shows');
}

export function scheduleShow(show) {
  return post('/shows', show);
}

export function fetchPromotions() {
  return get('/promotions');
}

export function createPromotion(promo) {
  return post('/promotions', promo);
}
