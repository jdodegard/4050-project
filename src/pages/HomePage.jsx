import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { fetchAllMovies } from '../api/moviesApi';
import './HomePage.css';

const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Animation', 'Adventure'];
const SHOW_DATES = ['Any Date', 'Today', 'This Week', 'This Weekend', 'Next Week'];

function isNowPlaying(movie) {
  const s = (movie.status || '').toUpperCase();
  return s.includes('NOW') || s.includes('RUNNING') || s.includes('CURRENT') || s === 'PLAYING';
}

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedDate] = useState('Any Date');

  useEffect(() => {
    setLoading(true);
    fetchAllMovies()
      .then(data => setAllMovies(Array.isArray(data) ? data : []))
      .catch(() => setError('Unable to load movies. Please make sure the server is running.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  const filtered = useMemo(() => {
    let movies = allMovies;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      movies = movies.filter(m => m.title?.toLowerCase().includes(q));
    }
    if (selectedGenre !== 'All') {
      movies = movies.filter(m => m.genre?.toLowerCase() === selectedGenre.toLowerCase());
    }
    return movies;
  }, [allMovies, searchQuery, selectedGenre]);

  const nowPlaying = filtered.filter(isNowPlaying);
  const comingSoon = filtered.filter(m => !isNowPlaying(m));
  const isFiltering = searchQuery.trim() || selectedGenre !== 'All';

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Now Showing &amp; Coming Soon</span>
          <h1>Book Your <span>Perfect</span> Movie Night</h1>
          <p>Browse current showings and upcoming releases. Select your seats, choose your tickets, and enjoy the show.</p>
        </div>
      </section>

      <div className="filter-bar">
        <div className="filter-group">
          <label>Genre</label>
          <select
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className="filter-select"
          >
            {GENRES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="filter-group filter-group-disabled">
          <label>Show Date <span className="coming-label">(coming soon)</span></label>
          <select
            value={selectedDate}
            onChange={() => {}}
            className="filter-select"
            disabled
            title="Show date filter coming in next sprint"
          >
            {SHOW_DATES.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {isFiltering && (
          <button
            className="clear-filters-btn"
            onClick={() => { setSearchQuery(''); setSelectedGenre('All'); }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading && (
        <div className="status-block">
          <div className="spinner" />
          <p>Loading movies...</p>
        </div>
      )}

      {error && (
        <div className="status-block error-block">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {isFiltering && filtered.length === 0 && (
            <div className="status-block">
              <p className="no-results">No movies found matching your criteria.</p>
            </div>
          )}

          {!isFiltering || nowPlaying.length > 0 ? (
            <section className="movie-section">
              <h2 className="section-title">
                <span className="title-accent" />
                Now Playing
              </h2>
              {nowPlaying.length === 0 ? (
                <p className="empty-section">No movies currently showing.</p>
              ) : (
                <div className="movie-grid">
                  {nowPlaying.map(m => <MovieCard key={m.id} movie={m} />)}
                </div>
              )}
            </section>
          ) : null}

          {!isFiltering || comingSoon.length > 0 ? (
            <section className="movie-section">
              <h2 className="section-title">
                <span className="title-accent" />
                Coming Soon
              </h2>
              {comingSoon.length === 0 ? (
                <p className="empty-section">No upcoming movies at this time.</p>
              ) : (
                <div className="movie-grid">
                  {comingSoon.map(m => <MovieCard key={m.id} movie={m} />)}
                </div>
              )}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
