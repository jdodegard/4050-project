import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { fetchSubscribers } from '../api/adminApi';
import './AdminPage.css';
import './AuthPages.css';

export default function AdminSubscribersPage() {
  const { ready } = useAdminGuard();
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    fetchSubscribers()
      .then(setSubs)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  return (
    <div className="admin-page">
      <p className="admin-kicker">Admin Portal</p>
      <h1 className="admin-title">Manage Subscribers</h1>
      <p className="admin-sub">
        Customers who opted in to promo emails. A new promotion goes to this list and nobody else.
      </p>

      {error && <div className="auth-error">{error}</div>}

      <div className="admin-list">
        <h2 className="admin-list-title">Subscribers ({subs.length})</h2>
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Account</th></tr>
          </thead>
          <tbody>
            {subs.map(u => (
              <tr key={u.id}>
                <td>{u.firstName} {u.lastName}</td>
                <td>{u.email}</td>
                <td>{u.status === 'ACTIVE' ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && subs.length === 0 && (
          <p className="admin-sub">Nobody has opted in yet.</p>
        )}
      </div>

      <Link to="/admin" className="admin-back">← Back to the admin portal</Link>
    </div>
  );
}
