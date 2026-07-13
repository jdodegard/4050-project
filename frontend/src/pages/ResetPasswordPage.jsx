import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/authApi';
import './AuthPages.css';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const res = await resetPassword(token, password);
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-kicker">Password reset</p>
        <h1 className="auth-title">Choose a New Password</h1>

        {message ? (
          <>
            <div className="auth-success">{message}</div>
            <div className="auth-links">
              <Link to="/login">Go to sign in</Link>
            </div>
          </>
        ) : (
          <>
            <p className="auth-sub">Pick something at least 8 characters long.</p>
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {error && <div className="auth-error">{error}</div>}

              <div className="field">
                <label htmlFor="reset-password">New password<span className="req">*</span></label>
                <input
                  id="reset-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="reset-confirm">Confirm new password<span className="req">*</span></label>
                <input
                  id="reset-confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Same password again"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button className="auth-btn" type="submit" disabled={busy}>
                {busy ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            <div className="auth-links">
              <Link to="/forgot-password">Need a new link?</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
