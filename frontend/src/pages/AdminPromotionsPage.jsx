import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { fetchPromotions, createPromotion } from '../api/adminApi';
import './AdminPage.css';
import './AuthPages.css';

const EMPTY = { code: '', discountPercent: '', startDate: '', endDate: '', description: '' };

export default function AdminPromotionsPage() {
  const { ready } = useAdminGuard();
  const [form, setForm] = useState(EMPTY);
  const [promos, setPromos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready) fetchPromotions().then(setPromos).catch(() => {});
  }, [ready]);

  if (!ready) return null;

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.code.trim()) return setError('Promo code is required.');
    const pct = Number(form.discountPercent);
    if (!pct || pct < 1 || pct > 100) return setError('Discount must be between 1 and 100 percent.');
    if (!form.startDate || !form.endDate) return setError('Enter start and end dates.');

    setBusy(true);
    try {
      const res = await createPromotion({ ...form, discountPercent: pct });
      setSuccess(res.message);
      setForm(EMPTY);
      setPromos(await fetchPromotions());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-page">
      <p className="admin-kicker">Admin Portal</p>
      <h1 className="admin-title">Manage Promotions</h1>
      <p className="admin-sub">
        New promotions get emailed to every user who opted in to promo emails - nobody else.
      </p>

      <div className="admin-split">
        <form className="admin-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="admin-success">{success}</div>}

          <div className="field-row">
            <div className="field">
              <label htmlFor="pr-code">Promo code<span className="req">*</span></label>
              <input id="pr-code" type="text" value={form.code}
                     onChange={e => set('code', e.target.value.toUpperCase())} placeholder="e.g. SUMMER25" />
            </div>
            <div className="field">
              <label htmlFor="pr-pct">Discount %<span className="req">*</span></label>
              <input id="pr-pct" type="number" min="1" max="100" value={form.discountPercent}
                     onChange={e => set('discountPercent', e.target.value)} placeholder="25" />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="pr-start">Starts<span className="req">*</span></label>
              <input id="pr-start" type="date" value={form.startDate}
                     onChange={e => set('startDate', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="pr-end">Ends<span className="req">*</span></label>
              <input id="pr-end" type="date" min={form.startDate} value={form.endDate}
                     onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="pr-desc">Description</label>
            <textarea id="pr-desc" rows="2" value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="What the deal is, goes in the email" />
          </div>

          <button className="auth-btn" type="submit" disabled={busy}>
            {busy ? 'Creating...' : 'Create & Email Subscribers'}
          </button>
        </form>

        <div className="admin-list">
          <h2 className="admin-list-title">Active Promotions ({promos.length})</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Code</th><th>Discount</th><th>Runs</th></tr>
            </thead>
            <tbody>
              {promos.map(p => (
                <tr key={p.id}>
                  <td>{p.code}</td>
                  <td>{p.discountPercent}%</td>
                  <td>{p.startDate} → {p.endDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link to="/admin" className="admin-back">← Back to the admin portal</Link>
    </div>
  );
}
