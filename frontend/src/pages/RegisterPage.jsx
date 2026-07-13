import { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '../api/authApi';
import './AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirm: '', promoOptIn: false,
    street: '', city: '', state: '', zip: '',
    cardNumber: '', expMonth: '', expYear: '',
  });
  const [showAddress, setShowAddress] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);

  function set(key) {
    return e => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm(f => ({ ...f, [key]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        promoOptIn: form.promoOptIn,
      };
      // the optional sections only go along if they were actually filled in
      if (showAddress && form.street.trim()) {
        payload.address = { street: form.street, city: form.city, state: form.state, zip: form.zip };
      }
      if (showCard && form.cardNumber.trim()) {
        payload.card = {
          cardNumber: form.cardNumber,
          expMonth: Number(form.expMonth),
          expYear: Number(form.expYear),
        };
      }
      const res = await register(payload);
      setDone(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-status">
            <span className="status-icon">📬</span>
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-sub">{done}</p>
            <div className="auth-links">
              <Link to="/login">Back to sign in</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-wide">
        <p className="auth-kicker">Join CinemaBook</p>
        <h1 className="auth-title">Create Your Account</h1>
        <p className="auth-sub">
          Fields marked <span className="req">*</span> are required. Address and payment info
          are optional - you can always add them later from your profile.
        </p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error">{error}</div>}

          <div className="field-row">
            <div className="field">
              <label htmlFor="reg-first">First name<span className="req">*</span></label>
              <input id="reg-first" value={form.firstName} onChange={set('firstName')} placeholder="First name" required />
            </div>
            <div className="field">
              <label htmlFor="reg-last">Last name<span className="req">*</span></label>
              <input id="reg-last" value={form.lastName} onChange={set('lastName')} placeholder="Last name" required />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="reg-email">Email<span className="req">*</span></label>
              <input id="reg-email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" required />
              <span className="field-hint">We'll send your confirmation link here. It can't be changed later.</span>
            </div>
            <div className="field">
              <label htmlFor="reg-phone">Phone</label>
              <input id="reg-phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 555-5555" autoComplete="tel" />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="reg-password">Password<span className="req">*</span></label>
              <input id="reg-password" type="password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" autoComplete="new-password" required />
            </div>
            <div className="field">
              <label htmlFor="reg-confirm">Confirm password<span className="req">*</span></label>
              <input id="reg-confirm" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Same password again" autoComplete="new-password" required />
            </div>
          </div>

          <div className="auth-section">
            <button type="button" className="auth-section-toggle" onClick={() => setShowAddress(v => !v)}>
              <span>Home address (optional)</span>
              <span>{showAddress ? 'hide −' : 'add +'}</span>
            </button>
            {showAddress && (
              <div className="auth-section-body">
                <div className="field">
                  <label htmlFor="reg-street">Street</label>
                  <input id="reg-street" value={form.street} onChange={set('street')} placeholder="123 Main St" autoComplete="street-address" />
                </div>
                <div className="field-row-3">
                  <div className="field">
                    <label htmlFor="reg-city">City</label>
                    <input id="reg-city" value={form.city} onChange={set('city')} placeholder="Athens" />
                  </div>
                  <div className="field">
                    <label htmlFor="reg-state">State</label>
                    <input id="reg-state" value={form.state} onChange={set('state')} placeholder="GA" />
                  </div>
                  <div className="field">
                    <label htmlFor="reg-zip">ZIP</label>
                    <input id="reg-zip" value={form.zip} onChange={set('zip')} placeholder="30602" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="auth-section">
            <button type="button" className="auth-section-toggle" onClick={() => setShowCard(v => !v)}>
              <span>Payment card (optional)</span>
              <span>{showCard ? 'hide −' : 'add +'}</span>
            </button>
            {showCard && (
              <div className="auth-section-body">
                <div className="field">
                  <label htmlFor="reg-card">Card number</label>
                  <input id="reg-card" inputMode="numeric" value={form.cardNumber} onChange={set('cardNumber')} placeholder="1234 5678 9012 3456" autoComplete="cc-number" />
                  <span className="field-hint">Stored encrypted. Up to 3 cards per account.</span>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="reg-exp-month">Exp. month</label>
                    <input id="reg-exp-month" inputMode="numeric" value={form.expMonth} onChange={set('expMonth')} placeholder="MM" />
                  </div>
                  <div className="field">
                    <label htmlFor="reg-exp-year">Exp. year</label>
                    <input id="reg-exp-year" inputMode="numeric" value={form.expYear} onChange={set('expYear')} placeholder="YYYY" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <label className="check-field">
            <input type="checkbox" checked={form.promoOptIn} onChange={set('promoOptIn')} />
            Email me about promotions and deals
          </label>

          <button className="auth-btn" type="submit" disabled={busy}>
            {busy ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-links">
          <span>Already have an account? <Link to="/login">Sign in</Link></span>
        </div>
      </div>
    </div>
  );
}
