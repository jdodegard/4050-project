import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { processMockPayment } from '../api/checkoutApi';
import { fetchCards } from '../api/userApi';
import { TICKET_TYPES } from './BookingPage';
import { clearDraft, loadDraft } from '../utils/bookingDraft';
import './CheckoutPage.css';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const draft = loadDraft();
  const [form, setForm] = useState({ nameOnCard: '', cardNumber: '', expiry: '', cvv: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [cards, setCards] = useState([]);
  // 'new' means the manual entry form below; otherwise it's a saved card's id
  const [selectedCardId, setSelectedCardId] = useState('new');

  useEffect(() => {
    if (!user) return;
    fetchCards()
      .then(list => {
        setCards(list || []);
        if (list && list.length > 0) setSelectedCardId(String(list[0].id));
      })
      .catch(() => {}); // no saved cards to show is fine, falls back to manual entry
  }, [user]);

  function set(key) {
    return e => setForm(current => ({ ...current, [key]: e.target.value }));
  }

  async function pay(e) {
    e.preventDefault();
    setError('');
    setErrorCode('');
    setBusy(true);
    try {
      const usingSavedCard = selectedCardId !== 'new';
      const result = await processMockPayment({
        showId: draft.show.id,
        seats: draft.seats,
        quantities: draft.quantities,
        email: draft.email,
        cvv: form.cvv,
        ...(usingSavedCard
          ? { savedCardId: Number(selectedCardId) }
          : { nameOnCard: form.nameOnCard, cardNumber: form.cardNumber, expiry: form.expiry }),
      });
      clearDraft();
      setConfirmation(result);
    } catch (err) {
      setError(err.message);
      setErrorCode(err.code || '');
    } finally {
      setBusy(false);
    }
  }

  if ((!draft && !confirmation) || !user) {
    return (
      <div className="booking-status">
        <p>Nothing to pay for yet.</p>
        <button onClick={() => navigate('/')}>Browse Movies</button>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="checkout-page">
        <p className="checkout-kicker">Order confirmed</p>
        <h1 className="checkout-title">Enjoy the Show!</h1>
        <section className="booking-card checkout-card payment-success">
          <div className="payment-success-mark">✓</div>
          <h2>Payment accepted</h2>
          <p>Your seats <strong>{confirmation.seats.join(', ')}</strong> are now reserved.</p>
          <p>Booking #{confirmation.bookingId}</p>
          <p className="payment-reference">{confirmation.paymentReference}</p>
          <button className="checkout-btn" onClick={() => navigate('/')}>
            Return Home
          </button>
        </section>
      </div>
    );
  }

  const { quantities } = draft;
  const totalTickets = quantities.child + quantities.adult + quantities.senior;
  const subtotal = TICKET_TYPES.reduce((sum, t) => sum + t.price * quantities[t.key], 0);
  const total = subtotal + 1.5 * totalTickets + subtotal * 0.08;
  const usingSavedCard = selectedCardId !== 'new';

  return (
    <div className="checkout-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to summary</button>
      <p className="checkout-kicker">Checkout · Step 2 of 2</p>
      <h1 className="checkout-title">Payment</h1>

      <div className="checkout-body">
        <form className="booking-card checkout-card payment-card" onSubmit={pay}>
          <h2 className="booking-section-title">Card Details</h2>

          {error && <div className="auth-error">{error}</div>}
          {errorCode === 'SEATS_UNAVAILABLE' && (
            <button type="button" className="payment-reselect" onClick={() => navigate('/booking')}>
              Choose different seats
            </button>
          )}

          {cards.length > 0 && (
            <div className="field">
              <label htmlFor="pay-saved-card">Pay with</label>
              <select id="pay-saved-card" value={selectedCardId}
                      onChange={e => setSelectedCardId(e.target.value)}>
                {cards.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.cardType} •••• {c.last4} (exp {String(c.expMonth).padStart(2, '0')}/{c.expYear})
                  </option>
                ))}
                <option value="new">Use a different card</option>
              </select>
            </div>
          )}

          {!usingSavedCard && (
            <>
              <div className="field">
                <label htmlFor="pay-name">Name on card<span className="req">*</span></label>
                <input id="pay-name" type="text" placeholder="Full name" autoComplete="cc-name"
                       value={form.nameOnCard} onChange={set('nameOnCard')} required />
              </div>

              <div className="field">
                <label htmlFor="pay-number">Card number<span className="req">*</span></label>
                <input id="pay-number" type="text" inputMode="numeric"
                       placeholder="4242 4242 4242 4242" autoComplete="cc-number"
                       value={form.cardNumber} onChange={set('cardNumber')} required />
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="pay-exp">Expiry<span className="req">*</span></label>
                  <input id="pay-exp" type="text" placeholder="MM/YY" autoComplete="cc-exp"
                         value={form.expiry} onChange={set('expiry')} required />
                </div>
                <div className="field">
                  <label htmlFor="pay-cvv">CVV<span className="req">*</span></label>
                  <input id="pay-cvv" type="text" inputMode="numeric" placeholder="123" maxLength="4"
                         value={form.cvv} onChange={set('cvv')} required />
                </div>
              </div>
            </>
          )}

          {usingSavedCard && (
            <div className="field">
              <label htmlFor="pay-cvv">CVV<span className="req">*</span></label>
              <input id="pay-cvv" type="text" inputMode="numeric" placeholder="123" maxLength="4"
                     value={form.cvv} onChange={set('cvv')} required />
              <span className="field-hint">Confirm the security code for this card.</span>
            </div>
          )}

          <button className="checkout-btn" disabled={busy}>
            {busy ? 'Processing...' : `Pay $${total.toFixed(2)}`}
          </button>

          <p className="payment-note">
            Mock payment only—no card is charged or stored. Use
            <strong> 4242 4242 4242 4242</strong> with a future expiry to accept,
            or <strong>4000 0000 0000 0002</strong> to simulate a decline.
            Receipt goes to <strong>{draft.email}</strong>.
          </p>
        </form>
      </div>
    </div>
  );
}
