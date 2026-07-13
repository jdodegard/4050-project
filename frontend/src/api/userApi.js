const BASE_URL = 'http://localhost:8080/api/user';

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function request(path, method = 'GET', body) {
  return fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  }).then(handleResponse);
}

export function fetchProfile() {
  return request('/profile');
}

// email is locked server-side, so it's simply not part of the payload
export function updateProfile({ firstName, lastName, phone, promoOptIn }) {
  return request('/profile', 'PUT', { firstName, lastName, phone, promoOptIn });
}

export function changePassword(currentPassword, newPassword) {
  return request('/password', 'PUT', { currentPassword, newPassword });
}

export function saveAddress(address) {
  return request('/address', 'PUT', address);
}

export function deleteAddress() {
  return request('/address', 'DELETE');
}

export function addCard({ cardNumber, expMonth, expYear }) {
  return request('/cards', 'POST', { cardNumber, expMonth, expYear });
}

export function deleteCard(id) {
  return request(`/cards/${id}`, 'DELETE');
}

export function fetchFavorites() {
  return request('/favorites');
}

export function addFavorite(movieId) {
  return request(`/favorites/${movieId}`, 'POST');
}

export function removeFavorite(movieId) {
  return request(`/favorites/${movieId}`, 'DELETE');
}
