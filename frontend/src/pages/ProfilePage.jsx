import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userApi from '../api/userApi';
import './AuthPages.css';
import './ProfilePage.css';

// one save button per section, each with its own little status message so
// it's obvious what got saved
function useStatus() {
  const [status, setStatus] = useState(null); // {ok, text}
  function ok(text) { setStatus({ ok: true, text }); setTimeout(() => setStatus(null), 4000); }
  function fail(text) { setStatus({ ok: false, text }); }
  return [status, ok, fail, () => setStatus(null)];
}

export default function ProfilePage() {
  const { user, setUser, checking, favIds, toggleFavorite } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // personal info form
  const [info, setInfo] = useState({ firstName: '', lastName: '', phone: '', promoOptIn: false });
  const [infoStatus, infoOk, infoFail, infoClear] = useStatus();

  // password form
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwStatus, pwOk, pwFail, pwClear] = useStatus();

  // address form
  const [addr, setAddr] = useState({ street: '', city: '', state: '', zip: '' });
  const [addrStatus, addrOk, addrFail, addrClear] = useStatus();

  // cards
  const [cards, setCards] = useState([]);
  const [newCard, setNewCard] = useState({ cardNumber: '', expMonth: '', expYear: '' });
  const [cardStatus, cardOk, cardFail, cardClear] = useStatus();

  const [favStatus, , favFail] = useStatus();

  // profile is behind sign-in
  useEffect(() => {
    if (!checking && !user) navigate('/login');
  }, [user, checking, navigate]);

  useEffect(() => {
    if (!user) return;
    userApi.fetchProfile().then(p => {
      setProfile(p);
      setInfo({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        phone: p.phone || '',
        promoOptIn: !!p.promoOptIn,
      });
      if (p.address) {
        setAddr({ street: p.address.street, city: p.address.city, state: p.address.state, zip: p.address.zip });
      }
      setCards(p.cards || []);
    }).catch(() => {});
    userApi.fetchFavorites().then(setFavorites).catch(() => {});
  }, [user]);

  if (checking || !user || !profile) {
    return <div className="profile-loading"><div className="spinner" /><p>Loading your profile...</p></div>;
  }

  async function saveInfo(e) {
    e.preventDefault();
    infoClear();
    try {
      await userApi.updateProfile(info);
      // keep the navbar greeting in sync
      setUser(u => ({ ...u, firstName: info.firstName, lastName: info.lastName }));
      infoOk('Profile saved. A confirmation email is on its way.');
    } catch (err) { infoFail(err.message); }
  }

  async function savePassword(e) {
    e.preventDefault();
    pwClear();
    if (pw.next !== pw.confirm) { pwFail('New passwords do not match.'); return; }
    try {
      await userApi.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      pwOk('Password changed.');
    } catch (err) { pwFail(err.message); }
  }

  async function saveAddress(e) {
    e.preventDefault();
    addrClear();
    try {
      await userApi.saveAddress(addr);
      addrOk('Address saved.');
    } catch (err) { addrFail(err.message); }
  }

  async function removeAddress() {
    addrClear();
    try {
      await userApi.deleteAddress();
      setAddr({ street: '', city: '', state: '', zip: '' });
      addrOk('Address removed.');
    } catch (err) { addrFail(err.message); }
  }

  async function submitCard(e) {
    e.preventDefault();
    cardClear();
    try {
      const card = await userApi.addCard({
        cardNumber: newCard.cardNumber,
        expMonth: Number(newCard.expMonth),
        expYear: Number(newCard.expYear),
      });
      setCards(cs => [...cs, card]);
      setNewCard({ cardNumber: '', expMonth: '', expYear: '' });
      cardOk('Card added.');
    } catch (err) { cardFail(err.message); }
  }

  async function removeCard(id) {
    cardClear();
    try {
      await userApi.deleteCard(id);
      setCards(cs => cs.filter(c => c.id !== id));
      cardOk('Card removed.');
    } catch (err) { cardFail(err.message); }
  }

  async function unfavorite(movieId) {
    try {
      await toggleFavorite(movieId);
      setFavorites(fs => fs.filter(m => m.id !== movieId));
    } catch (err) { favFail(err.message); }
  }

  const statusLine = s => s && (
    <div className={s.ok ? 'auth-success' : 'auth-error'}>{s.text}</div>
  );

  return (
    <div className="profile-page">
      <p className="profile-kicker">Your account</p>
      <h1 className="profile-title">Hi, {profile.firstName}</h1>
      <p className="profile-sub">Manage your info, security, payment methods and favorites.</p>

      <div className="profile-sections">

        <section className="profile-card" id="info">
          <h2>Personal Info</h2>
          <form className="auth-form" onSubmit={saveInfo} noValidate>
            {statusLine(infoStatus)}
            <div className="field-row">
              <div className="field">
                <label htmlFor="pf-first">First name<span className="req">*</span></label>
                <input id="pf-first" value={info.firstName} onChange={e => setInfo(i => ({ ...i, firstName: e.target.value }))} required />
              </div>
              <div className="field">
                <label htmlFor="pf-last">Last name<span className="req">*</span></label>
                <input id="pf-last" value={info.lastName} onChange={e => setInfo(i => ({ ...i, lastName: e.target.value }))} required />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="pf-email">Email</label>
                <input id="pf-email" value={profile.email} disabled />
                <span className="field-hint">Email is tied to your account and can't be changed.</span>
              </div>
              <div className="field">
                <label htmlFor="pf-phone">Phone</label>
                <input id="pf-phone" type="tel" value={info.phone} onChange={e => setInfo(i => ({ ...i, phone: e.target.value }))} placeholder="(555) 555-5555" />
              </div>
            </div>
            <label className="check-field">
              <input type="checkbox" checked={info.promoOptIn} onChange={e => setInfo(i => ({ ...i, promoOptIn: e.target.checked }))} />
              Email me about promotions and deals
            </label>
            <button className="auth-btn profile-save" type="submit">Save Changes</button>
          </form>
        </section>

        <section className="profile-card" id="password">
          <h2>Change Password</h2>
          <form className="auth-form" onSubmit={savePassword} noValidate>
            {statusLine(pwStatus)}
            <div className="field">
              <label htmlFor="pf-pw-current">Current password<span className="req">*</span></label>
              <input id="pf-pw-current" type="password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} autoComplete="current-password" required />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="pf-pw-next">New password<span className="req">*</span></label>
                <input id="pf-pw-next" type="password" value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} placeholder="At least 8 characters" autoComplete="new-password" required />
              </div>
              <div className="field">
                <label htmlFor="pf-pw-confirm">Confirm new password<span className="req">*</span></label>
                <input id="pf-pw-confirm" type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" required />
              </div>
            </div>
            <button className="auth-btn profile-save" type="submit">Update Password</button>
          </form>
        </section>

        <section className="profile-card" id="address">
          <h2>Home Address</h2>
          <p className="profile-card-hint">One address per account, used for billing.</p>
          <form className="auth-form" onSubmit={saveAddress} noValidate>
            {statusLine(addrStatus)}
            <div className="field">
              <label htmlFor="pf-street">Street<span className="req">*</span></label>
              <input id="pf-street" value={addr.street} onChange={e => setAddr(a => ({ ...a, street: e.target.value }))} placeholder="123 Main St" required />
            </div>
            <div className="field-row-3">
              <div className="field">
                <label htmlFor="pf-city">City<span className="req">*</span></label>
                <input id="pf-city" value={addr.city} onChange={e => setAddr(a => ({ ...a, city: e.target.value }))} required />
              </div>
              <div className="field">
                <label htmlFor="pf-state">State<span className="req">*</span></label>
                <input id="pf-state" value={addr.state} onChange={e => setAddr(a => ({ ...a, state: e.target.value }))} required />
              </div>
              <div className="field">
                <label htmlFor="pf-zip">ZIP<span className="req">*</span></label>
                <input id="pf-zip" value={addr.zip} onChange={e => setAddr(a => ({ ...a, zip: e.target.value }))} required />
              </div>
            </div>
            <div className="profile-btn-row">
              <button className="auth-btn profile-save" type="submit">Save Address</button>
              {profile.address && (
                <button type="button" className="profile-danger-btn" onClick={removeAddress}>Remove</button>
              )}
            </div>
          </form>
        </section>

        <section className="profile-card" id="cards">
          <h2>Payment Cards</h2>
          <p className="profile-card-hint">
            Up to 3 cards. Numbers are encrypted - we only ever show the last 4 digits.
          </p>
          {statusLine(cardStatus)}

          {cards.length > 0 && (
            <ul className="card-list">
              {cards.map(c => (
                <li key={c.id} className="card-row">
                  <span className="card-chip">{c.cardType || 'Card'}</span>
                  <span className="card-num">•••• {c.last4}</span>
                  <span className="card-exp">exp {String(c.expMonth).padStart(2, '0')}/{c.expYear}</span>
                  <button className="card-remove" onClick={() => removeCard(c.id)} title="Remove this card">✕</button>
                </li>
              ))}
            </ul>
          )}

          {cards.length < 3 ? (
            <form className="auth-form" onSubmit={submitCard} noValidate>
              <div className="field">
                <label htmlFor="pf-card">Card number<span className="req">*</span></label>
                <input id="pf-card" inputMode="numeric" value={newCard.cardNumber} onChange={e => setNewCard(c => ({ ...c, cardNumber: e.target.value }))} placeholder="1234 5678 9012 3456" required />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="pf-exp-month">Exp. month<span className="req">*</span></label>
                  <input id="pf-exp-month" inputMode="numeric" value={newCard.expMonth} onChange={e => setNewCard(c => ({ ...c, expMonth: e.target.value }))} placeholder="MM" required />
                </div>
                <div className="field">
                  <label htmlFor="pf-exp-year">Exp. year<span className="req">*</span></label>
                  <input id="pf-exp-year" inputMode="numeric" value={newCard.expYear} onChange={e => setNewCard(c => ({ ...c, expYear: e.target.value }))} placeholder="YYYY" required />
                </div>
              </div>
              <button className="auth-btn profile-save" type="submit">Add Card</button>
            </form>
          ) : (
            <p className="profile-card-hint">Card limit reached - remove one to add another.</p>
          )}
        </section>

        <section className="profile-card" id="favorites">
          <h2>Favorite Movies</h2>
          {statusLine(favStatus)}
          {favorites.length === 0 ? (
            <p className="profile-card-hint">
              Nothing here yet. Tap the <span className="fav-inline-heart">♥</span> on any movie while browsing to save it.
            </p>
          ) : (
            <div className="fav-grid">
              {favorites.map(m => (
                <div key={m.id} className="fav-tile">
                  <Link to={`/movie/${m.id}`} className="fav-poster">
                    {m.posterUrl && !m.posterUrl.startsWith('/assets/')
                      ? <img src={m.posterUrl} alt={m.title} />
                      : <span className="fav-poster-blank">CES</span>}
                  </Link>
                  <div className="fav-info">
                    <Link to={`/movie/${m.id}`} className="fav-title">{m.title}</Link>
                    <span className="fav-genre">{m.genre}</span>
                  </div>
                  <button
                    className="fav-remove"
                    onClick={() => unfavorite(m.id)}
                    title="Remove from favorites"
                  >♥</button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
