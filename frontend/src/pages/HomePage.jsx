import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import {
  fetchAllMovies,
  searchMoviesByTitle,
  filterMoviesByGenre,
  fetchGenres,
} from '../api/moviesApi';
import { fetchUpcomingShows } from '../api/showsApi';
import './HomePage.css';

const ANY_DATE = 'Any Date';
const HERO_WORDS = ['Perfect', 'Epic', 'Cinematic', 'Legendary', 'Unforgettable'];

function isNowPlaying(movie) {
  const s = (movie.status || '').toUpperCase();
  return s.includes('NOW') || s.includes('RUNNING') || s.includes('CURRENT') || s === 'PLAYING';
}

// "2026-07-31" straight off the show, no timezone maths needed
function showDay(startsAt) {
  return String(startsAt).slice(0, 10);
}

// Fri, Jul 31 - what actually goes in the dropdown
function labelForDay(day) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
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
  const [selectedDate, setSelectedDate] = useState(ANY_DATE);
  const [shows, setShows] = useState([]);
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

  // the whole upcoming schedule, so picking a date can narrow the grid without
  // another round trip every time the dropdown changes
  useEffect(() => {
    fetchUpcomingShows()
      .then(setShows)
      .catch(() => setShows([]));
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

  // only offer days the cinema is actually screening something
  const showDays = [...new Set(shows.map(s => showDay(s.startsAt)))].sort();

  // which movies have a screening on the chosen day
  const datedIds = selectedDate === ANY_DATE ? null : new Set(
    shows.filter(s => showDay(s.startsAt) === selectedDate).map(s => s.movie.id)
  );

  const visible = datedIds ? movies.filter(m => datedIds.has(m.id)) : movies;

  const nowPlaying = visible.filter(isNowPlaying);
  const comingSoon = visible.filter(m => !isNowPlaying(m));
  const isFiltering = urlSearch.trim() || genre !== 'All' || selectedDate !== ANY_DATE;

  function clearAll() {
    setGenre('All');
    setSelectedDate(ANY_DATE);
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

        <div className="filter-group">
          <label>Show Date</label>
          <select
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="filter-select"
          >
            <option value={ANY_DATE}>{ANY_DATE}</option>
            {showDays.map(d => <option key={d} value={d}>{labelForDay(d)}</option>)}
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
