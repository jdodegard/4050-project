import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { fetchShowrooms, fetchSchedule, scheduleShow } from '../api/adminApi';
import { fetchAllMovies } from '../api/moviesApi';
import { showDate, showTime } from '../utils/showFormat';
import './AdminPage.css';
import './AuthPages.css';

export default function AdminShowtimesPage() {
  const { ready } = useAdminGuard();
  const [movies, setMovies] = useState([]);
  const [showrooms, setShowrooms] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [form, setForm] = useState({ movieId: '', showroomId: '', date: '', time: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ready) return;
    fetchAllMovies().then(setMovies).catch(() => {});
    fetchShowrooms().then(setShowrooms).catch(() => {});
    fetchSchedule().then(setSchedule).catch(() => {});
  }, [ready]);

  if (!ready) return null;

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.movieId) return setError('Pick a movie to schedule.');
    if (!form.showroomId) return setError('Pick a showroom.');
    if (!form.date || !form.time) return setError('Enter a date and time.');

    setBusy(true);
    try {
      const show = await scheduleShow({
        movieId: Number(form.movieId),
        showroomId: Number(form.showroomId),
        date: form.date,
        time: form.time,
      });
      setSuccess(`${show.movie.title} scheduled for ${showDate(show.startsAt)} at ${showTime(show.startsAt)} in ${show.showroom.name}.`);
      setForm(f => ({ ...f, date: '', time: '' }));
      setSchedule(await fetchSchedule());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="admin-page">
      <p className="admin-kicker">Admin Portal</p>
      <h1 className="admin-title">Manage Showtimes</h1>
      <p className="admin-sub">
        Pick a movie, a showroom and a start time. Double-booking a room gets rejected automatically.
      </p>

      <div className="admin-split">
        <form className="admin-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="admin-success">{success}</div>}

          <div className="field">
            <label htmlFor="st-movie">Movie<span className="req">*</span></label>
            <select id="st-movie" value={form.movieId} onChange={e => set('movieId', e.target.value)}>
              <option value="">Select a movie...</option>
              {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>

          <div className="field">
            <label htmlFor="st-room">Showroom<span className="req">*</span></label>
            <select id="st-room" value={form.showroomId} onChange={e => set('showroomId', e.target.value)}>
              <option value="">Select a showroom...</option>
              {showrooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} · {r.capacity} seats ({r.seatRows}×{r.seatsPerRow})
                </option>
              ))}
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="st-date">Date<span className="req">*</span></label>
              <input id="st-date" type="date" min={today} value={form.date}
                     onChange={e => set('date', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="st-time">Time<span className="req">*</span></label>
              <input id="st-time" type="time" value={form.time}
                     onChange={e => set('time', e.target.value)} />
            </div>
          </div>

          <button className="auth-btn" type="submit" disabled={busy}>
            {busy ? 'Scheduling...' : 'Add Showtime'}
          </button>
        </form>

        <div className="admin-list">
          <h2 className="admin-list-title">Schedule ({schedule.length})</h2>
          <table className="admin-table">
            <thead>
              <tr><th>When</th><th>Movie</th><th>Room</th></tr>
            </thead>
            <tbody>
              {schedule.map(s => (
                <tr key={s.id}>
                  <td>{showDate(s.startsAt)} · {showTime(s.startsAt)}</td>
                  <td>{s.movie.title}</td>
                  <td>{s.showroom.name}</td>
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
