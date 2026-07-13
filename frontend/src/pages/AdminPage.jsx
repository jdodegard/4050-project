import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminPage.css';

// prototype only for this sprint - shows the admin menu so the role-based
// redirect has somewhere real to land. The tools get built next sprint.
const SECTIONS = [
  { icon: '🎬', title: 'Manage Movies', blurb: 'Add, edit and remove movies in the catalog.' },
  { icon: '🕐', title: 'Showtimes', blurb: 'Schedule shows and assign showrooms.' },
  { icon: '🎟️', title: 'Promotions', blurb: 'Create promo codes and email subscribers.' },
  { icon: '👥', title: 'Users', blurb: 'Manage customer accounts and suspensions.' },
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
