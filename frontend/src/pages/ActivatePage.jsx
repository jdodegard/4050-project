import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { activate } from '../api/authApi';
import './AuthPages.css';

export default function ActivatePage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState('working'); // working | done | failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('failed');
      setMessage('This confirmation link is missing its token. Try the link from your email again.');
      return;
    }
    activate(token)
      .then(res => { setState('done'); setMessage(res.message); })
      .catch(err => { setState('failed'); setMessage(err.message); });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-status">
          {state === 'working' && (
            <>
              <span className="status-icon">⏳</span>
              <h1 className="auth-title">Confirming your account...</h1>
            </>
          )}
          {state === 'done' && (
            <>
              <span className="status-icon">🎉</span>
              <h1 className="auth-title">You're all set!</h1>
              <p className="auth-sub">{message}</p>
              <div className="auth-links">
                <Link to="/login">Sign in now</Link>
              </div>
            </>
          )}
          {state === 'failed' && (
            <>
              <span className="status-icon">😕</span>
              <h1 className="auth-title">Couldn't confirm</h1>
              <p className="auth-sub">{message}</p>
              <div className="auth-links">
                <Link to="/register">Back to registration</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
