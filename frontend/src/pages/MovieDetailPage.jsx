import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieById } from '../api/moviesApi';
import { fetchPoster, fetchTrailerUrl, needsPoster } from '../api/tmdbApi';
import { useAuth } from '../context/AuthContext';
import { useInView } from '../hooks/useInView';
import './MovieDetailPage.css';

const SHOWTIMES = ['2:00 PM', '5:00 PM', '8:00 PM'];

function getTrailerEmbed(url) {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) return { type: 'youtube', src: url };
  const ytWatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytWatch) return { type: 'youtube', src: `https://www.youtube.com/embed/${ytWatch[1]}` };
  return { type: 'video', src: url };
}

function nowPlaying(status) {
  return /NOW|RUNNING|CURRENT/.test((status || '').toUpperCase());
}

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, favIds, toggleFavorite } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posterSrc, setPosterSrc] = useState(null);
  const [trailerSrc, setTrailerSrc] = useState(null);
  const [trailerRef, trailerSeen] = useInView();

  useEffect(() => {
    setLoading(true);
    fetchMovieById(id)
      .then(m => { setMovie(m); return m; })
      .then(m => {
        if (needsPoster(m?.posterUrl)) {
          fetchPoster(m.title, 'w500').then(url => { if (url) setPosterSrc(url); });
        } else {
          setPosterSrc(m?.posterUrl || null);
        }
        // pull a real trailer from TMDB when a key is set, otherwise the
        // seeded trailerUrl stays as the fallback
        fetchTrailerUrl(m.title).then(url => {
          if (url) setTrailerSrc(url);
        });
      })
      .catch(() => setError('Movie not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleSelectShowtime(time) {
    navigate('/booking', { state: { movie: { ...movie, posterUrl: posterSrc || movie.posterUrl }, showtime: time } });
  }

  if (loading) {
    return (
      <div className="detail-status">
        <div className="spinner" />
        <p>Loading movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="detail-status error">
        <p>{error || 'Movie not found.'}</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  const trailer = getTrailerEmbed(trailerSrc || movie.trailerUrl || movie.trailer);
  const playing = nowPlaying(movie.status);

  return (
    <div className="detail-page">
      {/* blurred poster bleeds behind the header for a cinema feel */}
      <div className="detail-backdrop">
        {posterSrc && <img src={posterSrc} alt="" aria-hidden="true" />}
        <div className="detail-backdrop-fade" />
      </div>

      <div className="detail-content">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="detail-main">
          <div className="detail-poster">
            {posterSrc ? (
              <img src={posterSrc} alt={movie.title} />
            ) : (
              <div className="poster-placeholder-lg">CES</div>
            )}
          </div>

          <div className="detail-info">
            <div className="detail-badges">
              {movie.rating && <span className="badge badge-rating">{movie.rating}</span>}
              {movie.genre && <span className="badge badge-genre">{movie.genre}</span>}
              {movie.status && (
                <span className={`badge ${playing ? 'badge-now' : 'badge-soon'}`}>
                  {playing ? 'Now Playing' : 'Coming Soon'}
                </span>
              )}
            </div>

            <div className="detail-title-row">
              <h1 className="detail-title">{movie.title}</h1>
              <button
                className={`detail-fav ${favIds.has(movie.id) ? 'is-fav' : ''}`}
                onClick={() => (user ? toggleFavorite(movie.id).catch(() => {}) : navigate('/login'))}
                title={!user ? 'Sign in to save favorites' : favIds.has(movie.id) ? 'Remove from favorites' : 'Add to favorites'}
                aria-label={favIds.has(movie.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    d="M12 21s-6.7-4.35-9.33-8.11C.8 10.2 1.7 6.6 4.86 5.4c1.98-.75 4.03-.05 5.14 1.44L12 8.9l2-2.06c1.11-1.49 3.16-2.19 5.14-1.44 3.16 1.2 4.06 4.8 2.19 7.49C18.7 16.65 12 21 12 21z"
                    fill={favIds.has(movie.id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </button>
            </div>
            <hr className="detail-divider" />

            {movie.director && (
              <p className="detail-meta"><span className="detail-meta-label">Director</span>{movie.director}</p>
            )}
            {(movie.cast || movie.actors) && (
              <p className="detail-meta"><span className="detail-meta-label">Cast</span>{movie.cast || movie.actors}</p>
            )}
            {movie.releaseDate && (
              <p className="detail-meta"><span className="detail-meta-label">Release</span>{movie.releaseDate}</p>
            )}

            <p className="detail-description">{movie.description || movie.synopsis}</p>

            <div className="showtimes-section">
              <h3>Available Showtimes</h3>
              <div className="showtimes-grid">
                {SHOWTIMES.map(time => (
                  <button
                    key={time}
                    className="showtime-btn"
                    onClick={() => handleSelectShowtime(time)}
                  >
                    <span className="st-time">{time}</span>
                    <span className="st-go">Book →</span>
                  </button>
                ))}
              </div>
              <p className="showtime-hint">pick a time to start your booking</p>
            </div>
          </div>
        </div>

        {trailer && (
          <div className={`trailer-section reveal ${trailerSeen ? 'in' : ''}`} ref={trailerRef}>
            <h2 className="section-heading">
              <span className="title-accent" />
              Trailer
            </h2>
            <div className="trailer-wrapper">
              {trailer.type === 'youtube' ? (
                <iframe
                  src={`${trailer.src}?rel=0&modestbranding=1`}
                  title={`${movie.title} Trailer`}
                  style={{ border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video controls>
                  <source src={trailer.src} />
                  Your browser does not support video playback.
                </video>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
