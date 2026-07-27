import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { searchMoviesByTitle } from '../api/moviesApi';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // pull live matches from the db as they type, capped at a handful
  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) { setHits([]); return; }

    let alive = true;
    const t = setTimeout(() => {
      searchMoviesByTitle(q)
        .then(rows => { if (alive) { setHits((rows || []).slice(0, 6)); setActive(-1); } })
        .catch(() => { if (alive) setHits([]); });
    }, 200);

    return () => { alive = false; clearTimeout(t); };
  }, [query]);

  // hitting "/" anywhere jumps to the search box
  useEffect(() => {
    function onKey(e) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // close the dropdowns when clicking somewhere else
  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function handleSignOut() {
    setMenuOpen(false);
    await logout();
    navigate('/');
  }

  function goToMovie(id) {
    setOpen(false);
    setQuery('');
    navigate(`/movie/${id}`);
  }

  function handleSearch(e) {
    e.preventDefault();
    setOpen(false);
    navigate(query.trim() ? `/?search=${encodeURIComponent(query.trim())}` : '/');
  }

  function onKeyDown(e) {
    if (!open || hits.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => (i + 1) % hits.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => (i - 1 + hits.length) % hits.length); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); goToMovie(hits[active].id); }
    else if (e.key === 'Escape') { setOpen(false); }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-cinema">CINEMA</span><span className="brand-book">BOOK</span>
      </Link>

      <div className="navbar-search-wrap" ref={boxRef}>
        <form className="navbar-search" onSubmit={handleSearch}>
          <svg className="search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#64748b" strokeWidth="1.5"/>
            <path d="M13.5 13.5L17 17" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search movies...  ( / )"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => query.trim() && setOpen(true)}
            onKeyDown={onKeyDown}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        {open && query.trim() && (
          <div className="search-suggest">
            {hits.length === 0 ? (
              <div className="suggest-empty">No matches for “{query.trim()}”</div>
            ) : (
              hits.map((m, i) => (
                <button
                  key={m.id}
                  className={`suggest-row ${i === active ? 'is-active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={() => goToMovie(m.id)}
                >
                  {m.posterUrl
                    ? <img className="suggest-thumb" src={m.posterUrl} alt="" />
                    : <span className="suggest-thumb suggest-thumb-blank" />}
                  <span className="suggest-text">
                    <span className="suggest-title">{m.title}</span>
                    <span className="suggest-meta">{m.genre}{m.rating ? ` · ${m.rating}` : ''}</span>
                  </span>
                  <span className="suggest-go">↵</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        {user?.role === 'ADMIN' && <Link to="/admin" className="nav-link">Admin</Link>}

        {user ? (
          <div className="nav-user-wrap" ref={menuRef}>
            <button
              className="nav-user-btn"
              onClick={() => setMenuOpen(v => !v)}
              title={`${user.firstName} ${user.lastName}`}
            >
              <span className="nav-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</span>
              <span className="nav-user-name">{user.firstName}</span>
              <span className={`nav-caret ${menuOpen ? 'up' : ''}`}>▾</span>
            </button>

            {menuOpen && (
              <div className="nav-user-menu">
                <Link to="/profile" className="nav-menu-item" onClick={() => setMenuOpen(false)}>My Profile</Link>
                <Link to="/profile#favorites" className="nav-menu-item" onClick={() => setMenuOpen(false)}>My Favorites</Link>
                <button className="nav-menu-item nav-menu-signout" onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="nav-link nav-link-signin">Sign In</Link>
        )}
      </div>
    </nav>
  );
}
