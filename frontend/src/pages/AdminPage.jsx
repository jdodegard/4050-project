import { Link } from 'react-router-dom';
import { useAdminGuard } from '../hooks/useAdminGuard';
import './AdminPage.css';

const SECTIONS = [
  {
    title: 'Manage Movies',
    blurb: 'Add movies to the catalog.',
    to: '/admin/movies',
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
    title: 'Manage Showtimes',
    blurb: 'Schedule shows and assign showrooms.',
    to: '/admin/showtimes',
    icon: (
      // clock
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    title: 'Manage Promotions',
    blurb: 'Create promo codes and email subscribers.',
    to: '/admin/promotions',
    icon: (
      // price tag
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.6 13.4L12 22 2 12V2h10l8.6 8.6a2 2 0 010 2.8z" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </svg>
    ),
  },
  {
    title: 'Manage Users',
    blurb: 'Manage customer accounts and suspensions.',
    to: null,   // not part of this sprint
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
  const { user, ready } = useAdminGuard();
  if (!ready) return null;

  return (
    <div className="admin-page">
      <p className="admin-kicker">Admin Portal</p>
      <h1 className="admin-title">Welcome, {user.firstName}</h1>
      <p className="admin-sub">Pick a section to manage.</p>

      <div className="admin-grid">
        {SECTIONS.map(s => (
          s.to ? (
            <Link key={s.title} to={s.to} className="admin-tile">
              <span className="admin-tile-icon">{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.blurb}</p>
              <span className="admin-tile-go">Open →</span>
            </Link>
          ) : (
            <div key={s.title} className="admin-tile admin-tile-disabled">
              <span className="admin-tile-icon">{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.blurb}</p>
              <span className="admin-tile-soon">Coming next sprint</span>
            </div>
          )
        ))}
      </div>

      <Link to="/" className="admin-back">← Back to the customer site</Link>
    </div>
  );
}
