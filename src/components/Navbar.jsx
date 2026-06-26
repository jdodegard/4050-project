import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/');
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-cinema">CINEMA</span><span className="brand-book">BOOK</span>
      </Link>

      <form className="navbar-search" onSubmit={handleSearch}>
        <svg className="search-icon" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke="#64748b" strokeWidth="1.5"/>
          <path d="M13.5 13.5L17 17" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">Search</button>
      </form>

      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/login" className="nav-link nav-link-signin">Sign In</Link>
      </div>
    </nav>
  );
}
