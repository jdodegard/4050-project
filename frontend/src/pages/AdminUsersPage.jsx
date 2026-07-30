import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { fetchUsers, setUserStatus } from '../api/adminApi';
import './AdminPage.css';
import './AuthPages.css';

const LABEL = {
  ACTIVE: 'Active',
  INACTIVE: 'Unconfirmed',
  SUSPENDED: 'Suspended',
};

export default function AdminUsersPage() {
  const { user, ready } = useAdminGuard();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (ready) fetchUsers().then(setUsers).catch(err => setError(err.message));
  }, [ready]);

  if (!ready) return null;

  async function changeStatus(target, status) {
    setError('');
    setSuccess('');
    setBusyId(target.id);
    try {
      const updated = await setUserStatus(target.id, status);
      setUsers(list => list.map(u => (u.id === updated.id ? updated : u)));
      setSuccess(`${updated.email} is now ${LABEL[updated.status].toLowerCase()}. We emailed them about it.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-page">
      <p className="admin-kicker">Admin Portal</p>
      <h1 className="admin-title">Manage Users</h1>
      <p className="admin-sub">
        Suspend an account to block it at login, or bring it back. Admins and your own account are off limits.
      </p>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="admin-success">{success}</div>}

      <div className="admin-list">
        <h2 className="admin-list-title">Accounts ({users.length})</h2>
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {users.map(u => {
              const self = u.id === user.id;
              const admin = u.role === 'ADMIN';
              return (
                <tr key={u.id}>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{admin ? 'Admin' : 'Customer'}</td>
                  <td>
                    <span className={`user-pill user-pill-${u.status.toLowerCase()}`}>
                      {LABEL[u.status]}
                    </span>
                  </td>
                  <td>
                    {self || admin ? (
                      <span className="user-locked">{self ? 'you' : 'admin'}</span>
                    ) : u.status === 'SUSPENDED' ? (
                      <button className="row-btn" disabled={busyId === u.id}
                              onClick={() => changeStatus(u, 'ACTIVE')}>
                        {busyId === u.id ? '...' : 'Reactivate'}
                      </button>
                    ) : (
                      <button className="row-btn row-btn-danger" disabled={busyId === u.id}
                              onClick={() => changeStatus(u, 'SUSPENDED')}>
                        {busyId === u.id ? '...' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Link to="/admin" className="admin-back">← Back to the admin portal</Link>
    </div>
  );
}
