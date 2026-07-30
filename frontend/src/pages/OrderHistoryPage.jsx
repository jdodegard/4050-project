import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchBookingHistory } from '../api/userApi';
import { showDate, showTime } from '../utils/showFormat';
import './ProfilePage.css';

export default function OrderHistoryPage() {
  const { user, checking } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(null);

  useEffect(() => {
    if (!checking && !user) navigate('/login');
  }, [user, checking, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchBookingHistory().then(setBookings).catch(() => setBookings([]));
  }, [user]);

  if (checking || !user || bookings === null) {
    return <div className="profile-loading"><div className="spinner" /><p>Loading your orders...</p></div>;
  }

  return (
    <div className="profile-page">
      <p className="profile-kicker">Member card</p>
      <h1 className="profile-title">Order History</h1>
      <p className="profile-sub">Everything you've booked, most recent first.</p>

      <div className="profile-sections">
        <section className="profile-card">
          <h2>Your Orders</h2>
          {bookings.length === 0 ? (
            <p className="profile-card-hint">No bookings yet - once you check out, they'll show up here.</p>
          ) : (
            <ul className="card-list">
              {bookings.map(b => (
                <li key={b.id} className="card-list-item">
                  <div>
                    <strong>{b.show.movie.title}</strong>
                    <p className="profile-card-hint">
                      {showDate(b.show.startsAt)} · {showTime(b.show.startsAt)} · {b.show.showroom.name}
                    </p>
                    <p className="profile-card-hint">
                      Seats: {b.tickets.map(t => t.seatLabel).join(', ')}
                    </p>
                    <p className="profile-card-hint">Booking #{b.id} · {b.status}</p>
                  </div>
                  <div>${b.totalAmount.toFixed(2)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
