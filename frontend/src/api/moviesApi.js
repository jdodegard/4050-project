const TMDB_BASE = 'https://api.themoviedb.org/3';
const KEY = import.meta.env.VITE_TMDB_API_KEY;

async function handleResponse(res) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchAllMovies() {
  const data = await fetch(
    `${TMDB_BASE}/movie/popular?api_key=${KEY}&language=en-US&page=1`
  ).then(handleResponse);

  return data.results;
}

export async function fetchMovieById(id) {
  return fetch(
    `${TMDB_BASE}/movie/${id}?api_key=${KEY}&language=en-US`
  ).then(handleResponse);
}

export async function searchMoviesByTitle(title) {
  const data = await fetch(
    `${TMDB_BASE}/search/movie?api_key=${KEY}&query=${encodeURIComponent(title)}&language=en-US&page=1`
  ).then(handleResponse);

  return data.results;
}

export async function filterMoviesByGenre(genre) {
  const data = await fetch(
    `${TMDB_BASE}/discover/movie?api_key=${KEY}&with_genres=${encodeURIComponent(genre)}&language=en-US&page=1`
  ).then(handleResponse);

  return data.results;
}