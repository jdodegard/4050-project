const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function handleResponse(res) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function fetchShowsForMovie(movieId) {
  return fetch(`${BASE_URL}/shows?movieId=${movieId}`).then(handleResponse);
}

export function fetchSeatMap(showId) {
  return fetch(`${BASE_URL}/shows/${showId}/seats`).then(handleResponse);
}
