const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function handleResponse(res) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function fetchAllMovies() {
  return fetch(`${BASE_URL}/movies`).then(handleResponse);
}

export function fetchMovieById(id) {
  return fetch(`${BASE_URL}/movies/${id}`).then(handleResponse);
}

export function searchMoviesByTitle(title) {
  return fetch(`${BASE_URL}/movies/search?title=${encodeURIComponent(title)}`).then(handleResponse);
}

export function filterMoviesByGenre(genre) {
  return fetch(`${BASE_URL}/movies/filter?genre=${encodeURIComponent(genre)}`).then(handleResponse);
}

export function fetchGenres() {
  return fetch(`${BASE_URL}/movies/genres`).then(handleResponse);
}
