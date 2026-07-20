import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TICKET_TYPES } from './BookingPage';
import { loadDraft } from '../utils/bookingDraft';
import './CheckoutPage.css';

// Mockup only for this sprint - the form renders but nothing gets charged.
// Real payment processing + order confirmation land in the final demo.
export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const draft = loadDraft();

  if (!draft || !user) {
    return (
      <div className="booking-status">
        <p>Nothing to pay for yet.</p>
        <button onClick={() => navigate('/')}>Browse Movies</button>
      </div>
    );
  }

  const { quantities } = draft;
  const totalTickets = quantities.child + quantities.adult + quantities.senior;
  const subtotal = TICKET_TYPES.reduce((sum, t) => sum + t.price * quantities[t.key], 0);
  const total = subtotal + 1.5 * totalTickets + subtotal * 0.08;

  return (
    <div className="checkout-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to summary</button>
      <p className="checkout-kicker">Checkout · Step 2 of 2</p>
      <h1 className="checkout-title">Payment</h1>

      <div className="checkout-body">
        <section className="booking-card checkout-card payment-card">
          <h2 className="booking-section-title">Card Details</h2>

          <div className="field">
            <label htmlFor="pay-name">Name on card<span className="req">*</span></label>
            <input id="pay-name" type="text" placeholder="Full name" autoComplete="cc-name" />
          </div>

          <div className="field">
            <label htmlFor="pay-number">Card number<span className="req">*</span></label>
            <input id="pay-number" type="text" inputMode="numeric" placeholder="1234 5678 9012 3456" autoComplete="cc-number" />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="pay-exp">Expiry<span className="req">*</span></label>
              <input id="pay-exp" type="text" placeholder="MM/YY" autoComplete="cc-exp" />
            </div>
            <div className="field">
              <label htmlFor="pay-cvv">CVV<span className="req">*</span></label>
              <input id="pay-cvv" type="text" inputMode="numeric" placeholder="123" maxLength="4" />
            </div>
          </div>

          <button className="checkout-btn" disabled>
            Pay ${total.toFixed(2)}
          </button>

          <p className="payment-note">
            Payment processing ships with the final demo - this page is the
            end of the line for this sprint. Receipt would go to <strong>{draft.email}</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
