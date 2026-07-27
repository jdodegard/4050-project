import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPoster, needsPoster } from '../api/tmdbApi';
import { useAuth } from '../context/AuthContext';
import './MovieCard.css';

export default function MovieCard({ movie, index = 0 }) {
  const navigate = useNavigate();
  const { user, favIds, toggleFavorite } = useAuth();
  const cardRef = useRef(null);
  const [posterSrc, setPosterSrc] = useState(
    needsPoster(movie.posterUrl) ? null : movie.posterUrl
  );

  useEffect(() => {
    if (needsPoster(movie.posterUrl)) {
      fetchPoster(movie.title, 'w342').then(url => {
        if (url) setPosterSrc(url);
      });
    }
  }, [movie.title, movie.posterUrl]);

  // tilt the card toward the cursor. keeps it feeling alive without a library
  function handleMove(e) {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-py * 9).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(px * 11).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 60).toFixed(1)}px`);
  }

  function resetTilt() {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }

  const soon = !((movie.status || '').toUpperCase().match(/NOW|RUNNING|CURRENT/));
  const isFav = favIds.has(movie.id);

  // the card itself navigates, so the heart has to eat the click
  function handleHeart(e) {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleFavorite(movie.id).catch(() => {});
  }

  return (
    <div
      ref={cardRef}
      className="movie-card"
      style={{ animationDelay: `${index * 55}ms` }}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      <div className="movie-card-poster">
        {posterSrc ? (
          <img src={posterSrc} alt={movie.title} />
        ) : (
          <div className="poster-placeholder"><span>CES</span></div>
        )}
        <div className="card-shine" />
        <div className="movie-card-overlay">
          <button className="view-details-btn">View Details</button>
        </div>
        {movie.rating && <span className="rating-badge">{movie.rating}</span>}
        <span className={`status-dot ${soon ? 'dot-soon' : 'dot-now'}`} title={soon ? 'Coming soon' : 'Now playing'} />
        <button
          className={`fav-heart ${isFav ? 'is-fav' : ''}`}
          onClick={handleHeart}
          title={!user ? 'Sign in to save favorites' : isFav ? 'Remove from favorites' : 'Add to favorites'}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg viewBox="0 0 24 24" width="15" height="15">
            <path
              d="M12 21s-6.7-4.35-9.33-8.11C.8 10.2 1.7 6.6 4.86 5.4c1.98-.75 4.03-.05 5.14 1.44L12 8.9l2-2.06c1.11-1.49 3.16-2.19 5.14-1.44 3.16 1.2 4.06 4.8 2.19 7.49C18.7 16.65 12 21 12 21z"
              fill={isFav ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </button>
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        <span className="movie-card-genre">{movie.genre}</span>
      </div>
    </div>
  );
}
