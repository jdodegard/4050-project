import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieById } from '../api/moviesApi';
import { fetchPoster, fetchTrailerUrl, needsPoster } from '../api/tmdbApi';
import './MovieDetailPage.css';

const SHOWTIMES = ['2:00 PM', '5:00 PM', '8:00 PM'];

function getTrailerEmbed(url) {
  if (!url) return null;
  if (url.includes('youtube.com/embed/')) return { type: 'youtube', src: url };
  const ytWatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytWatch) return { type: 'youtube', src: `https://www.youtube.com/embed/${ytWatch[1]}` };
  return { type: 'video', src: url };
}

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posterSrc, setPosterSrc] = useState(null);
  const [trailerSrc, setTrailerSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPosterSrc(null);
    setTrailerSrc(null);

    fetchMovieById(id)
      .then(m => { if (!cancelled) setMovie(m); return m; })
      .then(m => {
        if (cancelled) return;
        if (needsPoster(m?.posterUrl)) {
          fetchPoster(m.title, 'w500').then(url => { if (!cancelled && url) setPosterSrc(url); });
        } else {
          setPosterSrc(m?.posterUrl || null);
        }
        fetchTrailerUrl(m.title).then(url => {
          if (!cancelled) setTrailerSrc(url || m?.trailerUrl || null);
        });
      })
      .catch(() => { if (!cancelled) setError('Movie not found.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
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

  return (
    <div className="detail-page">
      <div className="detail-backdrop" />

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
                <span className={`badge ${(movie.status.toUpperCase().includes('NOW') || movie.status.toUpperCase().includes('RUNNING') || movie.status.toUpperCase().includes('CURRENT')) ? 'badge-now' : 'badge-soon'}`}>
                  {(movie.status.toUpperCase().includes('NOW') || movie.status.toUpperCase().includes('RUNNING') || movie.status.toUpperCase().includes('CURRENT')) ? 'Now Playing' : 'Coming Soon'}
                </span>
              )}
            </div>

            <h1 className="detail-title">{movie.title}</h1>
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
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {trailer && (
          <div className="trailer-section">
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
