const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';
const KEY = import.meta.env.VITE_TMDB_API_KEY;

const cache = new Map();

export function needsPoster(url) {
  return !url || url.includes('placehold.co') || url.startsWith('/assets/');
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

export async function fetchTrailerUrl(title) {
  if (!KEY || KEY === 'paste_your_key_here') return null;
  const cacheKey = `trailer:${title}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const searchRes = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${KEY}&query=${encodeURIComponent(title)}&language=en-US&page=1`
    );
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const movieId = searchData.results?.[0]?.id;
    if (!movieId) return null;

    const videoRes = await fetch(
      `${TMDB_BASE}/movie/${movieId}/videos?api_key=${KEY}&language=en-US`
    );
    if (!videoRes.ok) return null;
    const videoData = await videoRes.json();

    const trailer = videoData.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const url = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
    cache.set(cacheKey, url);
    return url;
  } catch {
    return null;
  }
}
