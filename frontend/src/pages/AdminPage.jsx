import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminPage.css';

// prototype only for this sprint - shows the admin menu so the role-based
// redirect has somewhere real to land. The tools get built next sprint.
const SECTIONS = [
  {
    title: 'Manage Movies',
    blurb: 'Add, edit and remove movies in the catalog.',
    icon: (
      // clapperboard
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M3 8l1.5-4L21 6l-1 2" />
        <path d="M8 4.6L6.8 8M12.5 5.1L11.3 8.4M17 5.6l-1.2 3.2" />
      </svg>
    ),
  },
  {
    title: 'Showtimes',
    blurb: 'Schedule shows and assign showrooms.',
    icon: (
      // clock
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    title: 'Promotions',
    blurb: 'Create promo codes and email subscribers.',
    icon: (
      // price tag
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.6 13.4L12 22 2 12V2h10l8.6 8.6a2 2 0 010 2.8z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </svg>
    ),
  },
  {
    title: 'Users',
    blurb: 'Manage customer accounts and suspensions.',
    icon: (
      // two people
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" />
        <path d="M16 5.2a3.5 3.5 0 010 5.6M18.5 15.4c1.6.8 2.7 2.4 3 4.6" />
      </svg>
    ),
  },
];

export default function AdminPage() {
  const { user, checking } = useAuth();
  const navigate = useNavigate();

  // customers don't belong here
  useEffect(() => {
    if (!checking && (!user || user.role !== 'ADMIN')) navigate('/');
  }, [user, checking, navigate]);

  if (checking || !user || user.role !== 'ADMIN') return null;

  return (
    <div className="admin-page">
      <p className="admin-kicker">Admin Portal</p>
      <h1 className="admin-title">Welcome, {user.firstName}</h1>
      <p className="admin-sub">Pick a section to manage. These tools arrive with the next sprint.</p>

      <div className="admin-grid">
        {SECTIONS.map(s => (
          <div key={s.title} className="admin-tile">
            <span className="admin-tile-icon">{s.icon}</span>
            <h3>{s.title}</h3>
            <p>{s.blurb}</p>
            <span className="admin-tile-soon">Coming next sprint</span>
          </div>
        ))}
      </div>

      <Link to="/" className="admin-back">← Back to the customer site</Link>
    </div>
  );
}
