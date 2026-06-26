import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SeatMap from '../components/SeatMap';
import './BookingPage.css';

const TICKET_TYPES = [
  { key: 'child',  label: 'Child',  price: 8.99,  note: 'Ages 12 & under' },
  { key: 'adult',  label: 'Adult',  price: 12.99, note: 'Ages 13–64' },
  { key: 'senior', label: 'Senior', price: 9.99,  note: 'Ages 65+' },
];

export default function BookingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const movie    = state?.movie    || null;
  const showtime = state?.showtime || null;

  const [quantities, setQuantities] = useState({ child: 0, adult: 0, senior: 0 });
  const [selectedSeats, setSelectedSeats] = useState(new Set());

  const totalTickets = quantities.child + quantities.adult + quantities.senior;
  const subtotal = TICKET_TYPES.reduce((sum, t) => sum + t.price * quantities[t.key], 0);
  const bookingFee = totalTickets > 0 ? 1.5 * totalTickets : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + bookingFee + tax;

  function changeQty(key, delta) {
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta),
    }));
  }

  if (!movie || !showtime) {
    return (
      <div className="booking-status">
        <p>No booking information found.</p>
        <button onClick={() => navigate('/')}>Browse Movies</button>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="booking-header-info">
          <h1>{movie.title}</h1>
          <p className="booking-showtime">
            <span className="showtime-chip">{showtime}</span>
            {movie.genre && <span className="genre-chip">{movie.genre}</span>}
            {movie.rating && <span className="rating-chip">{movie.rating}</span>}
          </p>
        </div>
      </div>

      <div className="booking-body">
        {/* Left column: Ticket selection + Seat map */}
        <div className="booking-left">
          <section className="booking-card">
            <h2 className="booking-section-title">Select Tickets</h2>
            <div className="ticket-types">
              {TICKET_TYPES.map(t => (
                <div key={t.key} className="ticket-row">
                  <div className="ticket-label">
                    <span className="ticket-name">{t.label}</span>
                    <span className="ticket-note">{t.note}</span>
                  </div>
                  <span className="ticket-price">${t.price.toFixed(2)}</span>
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() => changeQty(t.key, -1)}
                      disabled={quantities[t.key] === 0}
                    >
                      −
                    </button>
                    <span className="qty-value">{quantities[t.key]}</span>
                    <button
                      className="qty-btn"
                      onClick={() => changeQty(t.key, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {totalTickets > 0 && (
              <p className="select-seats-hint">
                Select {totalTickets} seat{totalTickets !== 1 ? 's' : ''} below
                {selectedSeats.size > 0 && ` (${selectedSeats.size} chosen)`}
              </p>
            )}
          </section>

          <section className="booking-card">
            <h2 className="booking-section-title">Choose Your Seats</h2>
            {totalTickets === 0 ? (
              <p className="seat-hint">Add tickets above to enable seat selection.</p>
            ) : (
              <SeatMap
                totalTickets={totalTickets}
                onSelectionChange={setSelectedSeats}
              />
            )}
          </section>
        </div>

        {/* Right column: Order summary */}
        <div className="booking-right">
          <section className="booking-card summary-card">
            <h2 className="booking-section-title">Order Summary</h2>

            <div className="summary-movie">
              {movie.posterUrl && (
                <img src={movie.posterUrl} alt={movie.title} className="summary-poster" />
              )}
              <div>
                <p className="summary-title">{movie.title}</p>
                <p className="summary-time">{showtime}</p>
              </div>
            </div>

            <div className="summary-lines">
              {TICKET_TYPES.map(t => quantities[t.key] > 0 && (
                <div key={t.key} className="summary-line">
                  <span>{t.label} × {quantities[t.key]}</span>
                  <span>${(t.price * quantities[t.key]).toFixed(2)}</span>
                </div>
              ))}

              {totalTickets > 0 && (
                <>
                  <div className="summary-line summary-line-minor">
                    <span>Online Booking Fee</span>
                    <span>${bookingFee.toFixed(2)}</span>
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
                </>
              )}

              {totalTickets === 0 && (
                <p className="summary-empty">No tickets selected yet.</p>
              )}
            </div>

            {selectedSeats.size > 0 && (
              <div className="summary-seats">
                <span className="summary-seats-label">Seats:</span>
                {Array.from(selectedSeats).sort().join(', ')}
              </div>
            )}

            <button
              className="checkout-btn"
              disabled={totalTickets === 0 || selectedSeats.size !== totalTickets}
              onClick={() => alert('Checkout will be available in the next sprint!')}
            >
              {totalTickets === 0
                ? 'Select Tickets to Continue'
                : selectedSeats.size !== totalTickets
                  ? `Select ${totalTickets - selectedSeats.size} More Seat${totalTickets - selectedSeats.size !== 1 ? 's' : ''}`
                  : 'Proceed to Checkout →'}
            </button>

            <p className="checkout-note">
              Sign in required to complete checkout
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
