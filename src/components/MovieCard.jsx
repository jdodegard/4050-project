import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPoster, needsPoster } from '../api/tmdbApi';
import './MovieCard.css';

export default function MovieCard({ movie }) {
  const navigate = useNavigate();
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

  return (
    <div className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
      <div className="movie-card-poster">
        {posterSrc ? (
          <img src={posterSrc} alt={movie.title} />
        ) : (
          <div className="poster-placeholder">
            <span>CES</span>
          </div>
        )}
        <div className="movie-card-overlay">
          <button className="view-details-btn">View Details</button>
        </div>
        {movie.rating && <span className="rating-badge">{movie.rating}</span>}
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        <span className="movie-card-genre">{movie.genre}</span>
      </div>
    </div>
  );
}
