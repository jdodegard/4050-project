import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TICKET_TYPES } from './BookingPage';
import { showDate, showTime } from '../utils/showFormat';
import { loadDraft, saveDraft } from '../utils/bookingDraft';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, checking } = useAuth();
  const draft = loadDraft();

  const [emailMode, setEmailMode] = useState('account');
  const [otherEmail, setOtherEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // checkout is the login gate: seats stay parked in the draft while the
  // user signs in, then they land right back here
  useEffect(() => {
    if (!checking && !user) {
      navigate('/login', { state: { next: '/checkout' } });
    }
  }, [user, checking, navigate]);

  if (checking || !user) return null;

  if (!draft) {
    return (
      <div className="booking-status">
        <p>Nothing to check out yet.</p>
        <button onClick={() => navigate('/')}>Browse Movies</button>
      </div>
    );
  }

  const { movie, show, quantities, seats } = draft;
  const totalTickets = quantities.child + quantities.adult + quantities.senior;
  const subtotal = TICKET_TYPES.reduce((sum, t) => sum + t.price * quantities[t.key], 0);
  const bookingFee = 1.5 * totalTickets;
  const tax = subtotal * 0.08;
  const total = subtotal + bookingFee + tax;

  function continueToPayment() {
    const email = emailMode === 'account' ? user.email : otherEmail.trim();
    if (emailMode === 'other' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError('');
    saveDraft({ ...draft, email });
    navigate('/payment');
  }

  return (
    <div className="checkout-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <p className="checkout-kicker">Checkout · Step 1 of 2</p>
      <h1 className="checkout-title">Order Summary</h1>

      <div className="checkout-body">
        <section className="booking-card checkout-card">
          <div className="summary-movie">
            {movie.posterUrl && (
              <img src={movie.posterUrl} alt={movie.title} className="summary-poster" />
            )}
            <div>
              <p className="summary-title">{movie.title}</p>
              <p className="summary-time">{showDate(show.startsAt)} · {showTime(show.startsAt)}</p>
              <p className="summary-time">{show.showroom.name}</p>
            </div>
          </div>

          <div className="summary-seats checkout-seats">
            <span className="summary-seats-label">Seats:</span>
            {seats.join(', ')}
          </div>

          <div className="summary-lines">
            {TICKET_TYPES.map(t => quantities[t.key] > 0 && (
              <div key={t.key} className="summary-line">
                <span>{t.label} × {quantities[t.key]} <span className="per-ticket">(${t.price.toFixed(2)} each)</span></span>
                <span>${(t.price * quantities[t.key]).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-line summary-line-minor">
              <span>Online Booking Fee</span>
              <span>${bookingFee.toFixed(2)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-line checkout-pretax">
              <span>Total before tax</span>
              <span>${(subtotal + bookingFee).toFixed(2)}</span>
            </div>
            <div className="summary-line summary-line-minor">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-line summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <section className="booking-card checkout-card">
          <h2 className="booking-section-title">Confirmation Email</h2>
          <p className="checkout-email-sub">Your tickets and receipt go to this address.</p>

          <label className={`email-option ${emailMode === 'account' ? 'is-active' : ''}`}>
            <input
              type="radio"
              name="email-mode"
              checked={emailMode === 'account'}
              onChange={() => setEmailMode('account')}
            />
            <span>
              Use my account email
              <span className="email-option-value">{user.email}</span>
            </span>
          </label>

          <label className={`email-option ${emailMode === 'other' ? 'is-active' : ''}`}>
            <input
              type="radio"
              name="email-mode"
              checked={emailMode === 'other'}
              onChange={() => setEmailMode('other')}
            />
            <span>Send to a different email</span>
          </label>

          {emailMode === 'other' && (
            <div className="field checkout-email-field">
              <input
                type="email"
                value={otherEmail}
                onChange={e => setOtherEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          )}

          {emailError && <div className="auth-error">{emailError}</div>}

          <button className="checkout-btn" onClick={continueToPayment}>
            Continue to Payment →
          </button>
        </section>
      </div>
    </div>
  );
}
