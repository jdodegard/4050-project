import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { addMovie } from '../api/adminApi';
import { fetchAllMovies } from '../api/moviesApi';
import './AdminPage.css';
import './AuthPages.css';

const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

const EMPTY = {
  title: '', genre: '', rating: '', status: 'CURRENTLY_RUNNING',
  description: '', posterUrl: '', trailerUrl: '',
};

export default function AdminMoviesPage() {
  const { ready } = useAdminGuard();
  const [form, setForm] = useState(EMPTY);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready) fetchAllMovies().then(setMovies).catch(() => {});
  }, [ready]);

  if (!ready) return null;

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaved(null);

    if (!form.title.trim()) return setError('Title is required.');
    if (!form.genre.trim()) return setError('Genre is required.');
    if (!form.rating) return setError('Pick an MPAA rating.');

    setBusy(true);
    try {
      const movie = await addMovie(form);
      setSaved(movie);
      setForm(EMPTY);
      setMovies(await fetchAllMovies());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-page">
      <p className="admin-kicker">Admin Portal</p>
      <h1 className="admin-title">Manage Movies</h1>
      <p className="admin-sub">Add a movie to the catalog. It shows up on the customer site right away.</p>

      <div className="admin-split">
        <form className="admin-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error">{error}</div>}
          {saved && (
            <div className="admin-success">
              "{saved.title}" saved. <Link to={`/movie/${saved.id}`}>View it on the site →</Link>
            </div>
          )}

          <div className="field">
            <label htmlFor="mv-title">Title<span className="req">*</span></label>
            <input id="mv-title" type="text" value={form.title}
                   onChange={e => set('title', e.target.value)} placeholder="Movie title" />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="mv-genre">Genre<span className="req">*</span></label>
              <input id="mv-genre" type="text" value={form.genre}
                     onChange={e => set('genre', e.target.value)} placeholder="e.g. Sci-Fi" />
            </div>
            <div className="field">
              <label htmlFor="mv-rating">Rating<span className="req">*</span></label>
              <select id="mv-rating" value={form.rating} onChange={e => set('rating', e.target.value)}>
                <option value="">Select...</option>
                {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="mv-status">Status<span className="req">*</span></label>
            <select id="mv-status" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="CURRENTLY_RUNNING">Currently Running</option>
              <option value="COMING_SOON">Coming Soon</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="mv-desc">Description</label>
            <textarea id="mv-desc" rows="3" value={form.description}
                      onChange={e => set('description', e.target.value)} placeholder="Short synopsis" />
          </div>

          <div className="field">
            <label htmlFor="mv-poster">Poster URL</label>
            <input id="mv-poster" type="url" value={form.posterUrl}
                   onChange={e => set('posterUrl', e.target.value)} placeholder="https://..." />
            <span className="field-hint">leave blank to auto-pull the poster from TMDB</span>
          </div>

          <div className="field">
            <label htmlFor="mv-trailer">Trailer URL</label>
            <input id="mv-trailer" type="url" value={form.trailerUrl}
                   onChange={e => set('trailerUrl', e.target.value)} placeholder="https://youtube.com/..." />
          </div>

          <button className="auth-btn" type="submit" disabled={busy}>
            {busy ? 'Saving...' : 'Add Movie'}
          </button>
        </form>

        <div className="admin-list">
          <h2 className="admin-list-title">Catalog ({movies.length})</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Title</th><th>Genre</th><th>Rating</th><th>Status</th></tr>
            </thead>
            <tbody>
              {movies.map(m => (
                <tr key={m.id}>
                  <td>{m.title}</td>
                  <td>{m.genre}</td>
                  <td>{m.rating}</td>
                  <td>{m.status === 'CURRENTLY_RUNNING' ? 'Running' : 'Coming Soon'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link to="/admin" className="admin-back">← Back to the admin portal</Link>
    </div>
  );
}
