import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import {
  fetchAllMovies,
  searchMoviesByTitle,
  filterMoviesByGenre,
  fetchGenres,
} from '../api/moviesApi';
import './HomePage.css';

const SHOW_DATES = ['Any Date', 'Today', 'This Week', 'This Weekend', 'Next Week'];
const HERO_WORDS = ['Perfect', 'Epic', 'Cinematic', 'Legendary', 'Unforgettable'];

function isNowPlaying(movie) {
  const s = (movie.status || '').toUpperCase();
  return s.includes('NOW') || s.includes('RUNNING') || s.includes('CURRENT') || s === 'PLAYING';
}

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlSearch = searchParams.get('search') || '';

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genre, setGenre] = useState('All');
  const [selectedDate] = useState('Any Date');
  const [wordIdx, setWordIdx] = useState(0);
  const heroRef = useRef(null);

  // cycle the highlighted word in the headline
  useEffect(() => {
    const id = setInterval(() => setWordIdx(i => (i + 1) % HERO_WORDS.length), 2400);
    return () => clearInterval(id);
  }, []);

  // let the hero glow lean toward the cursor
  function heroMove(e) {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--hx', `${((e.clientX - r.left) / r.width - 0.5) * 60}px`);
    el.style.setProperty('--hy', `${((e.clientY - r.top) / r.height - 0.5) * 40}px`);
  }

  // grab the genre list from the db once, drop "All" in front for the dropdown
  useEffect(() => {
    fetchGenres()
      .then(list => setGenres(['All', ...list]))
      .catch(() => setGenres(['All']));
  }, []);

  // any time the search text or chosen genre changes we go back to the backend.
  // tiny delay on search so typing a title doesn't fire a request every keystroke.
  useEffect(() => {
    const q = urlSearch.trim();
    let alive = true;
    setLoading(true);
    setError(null);

    const run = () => {
      let req;
      if (q) {
        req = searchMoviesByTitle(q);
      } else if (genre !== 'All') {
        req = filterMoviesByGenre(genre);
      } else {
        req = fetchAllMovies();
      }

      req
        .then(data => {
          if (!alive) return;
          let rows = Array.isArray(data) ? data : [];
          // backend does one filter at a time, so when a search is running we
          // narrow those db results down to the picked genre right here
          if (q && genre !== 'All') {
            rows = rows.filter(m => (m.genre || '').toLowerCase() === genre.toLowerCase());
          }
          setMovies(rows);
        })
        .catch(() => { if (alive) setError('could not reach the server. is the backend running on :8080?'); })
        .finally(() => { if (alive) setLoading(false); });
    };

    const t = setTimeout(run, q ? 280 : 0);
    return () => { alive = false; clearTimeout(t); };
  }, [urlSearch, genre]);

  const nowPlaying = movies.filter(isNowPlaying);
  const comingSoon = movies.filter(m => !isNowPlaying(m));
  const isFiltering = urlSearch.trim() || genre !== 'All';

  function clearAll() {
    setGenre('All');
    navigate('/');
  }

  return (
    <div className="home-page">
      <section className="hero" ref={heroRef} onMouseMove={heroMove}>
        <div className="hero-glow" />
        <div className="hero-particles" aria-hidden="true">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                animationDelay: `${(i % 7) * 0.8}s`,
                animationDuration: `${6 + (i % 5)}s`,
              }}
            />
          ))}
        </div>
        <div className="hero-content">
          <span className="hero-eyebrow">Now Showing &amp; Coming Soon</span>
          <h1>
            Book Your{' '}
            <span className="rotating-word" key={wordIdx}>{HERO_WORDS[wordIdx]}</span>
            <br />Movie Night
          </h1>
          <p>Browse current showings and upcoming releases. Pick your seats, choose your tickets, and enjoy the show.</p>
          <div className="hero-stats">
            <span><b>{nowPlaying.length}</b> playing now</span>
            <i />
            <span><b>{comingSoon.length}</b> coming soon</span>
          </div>
        </div>
        <div className="hero-filmstrip" aria-hidden="true">
          <div className="filmstrip-track">
            {Array.from({ length: 44 }).map((_, i) => <span key={i} />)}
          </div>
        </div>
      </section>

      <div className="filter-bar">
        <div className="filter-group">
          <label>Genre</label>
          <select value={genre} onChange={e => setGenre(e.target.value)} className="filter-select">
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="filter-group filter-group-disabled">
          <label>Show Date <span className="coming-label">(coming soon)</span></label>
          <select
            value={selectedDate}
            onChange={() => {}}
            className="filter-select"
            disabled
            title="show date filter lands next sprint"
          >
            {SHOW_DATES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {urlSearch.trim() && (
          <div className="active-chip"><span>“{urlSearch.trim()}”</span></div>
        )}

        {isFiltering && (
          <button className="clear-filters-btn" onClick={clearAll}>Clear</button>
        )}
      </div>

      {loading && (
        <div className="movie-section">
          <div className="movie-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 70}ms` }} />
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="status-block error-block"><p>{error}</p></div>
      )}

      {!loading && !error && (
        <>
          {isFiltering && movies.length === 0 && (
            <div className="status-block">
              <p className="no-results">No movies match that. Try another title or genre.</p>
            </div>
          )}

          {(!isFiltering || nowPlaying.length > 0) && (
            <Section title="Now Playing" movies={nowPlaying} emptyText="Nothing showing right now." />
          )}

          {(!isFiltering || comingSoon.length > 0) && (
            <Section title="Coming Soon" movies={comingSoon} emptyText="No upcoming titles yet." />
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, movies, emptyText }) {
  return (
    <section className="movie-section">
      <h2 className="section-title">
        <span className="title-accent" />
        {title}
        <span className="section-count">{movies.length}</span>
      </h2>
      {movies.length === 0 ? (
        <p className="empty-section">{emptyText}</p>
      ) : (
        <div className="movie-grid">
          {movies.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
        </div>
      )}
    </section>
  );
}
