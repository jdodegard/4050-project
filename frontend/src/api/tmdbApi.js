const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';
const KEY = import.meta.env.VITE_TMDB_API_KEY;

const cache = new Map();

export function needsPoster(url) {
  return !url || url.includes('placehold.co');
}

export async function fetchPoster(title, size = 'w500') {
  if (!KEY || KEY === 'paste_your_key_here') return null;
  const cacheKey = `${title}:${size}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const res = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${KEY}&query=${encodeURIComponent(title)}&language=en-US&page=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const path = data.results?.[0]?.poster_path;
    const url = path ? `${IMG_BASE}/${size}${path}` : null;
    cache.set(cacheKey, url);
    return url;
  } catch {
    return null;
  }
}
