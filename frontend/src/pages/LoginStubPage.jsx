import { useNavigate } from 'react-router-dom';

export default function LoginStubPage() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: 'calc(100vh - 60px)',
      gap: '0.75rem', color: '#475569',
    }}>
      <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.4rem', margin: 0 }}>Sign In</h2>
      <p style={{ margin: 0, fontSize: '0.9rem' }}>Authentication will be available in a future sprint.</p>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '0.5rem', padding: '0.5rem 1.4rem',
          background: '#2563eb', border: 'none', borderRadius: '6px',
          color: '#fff', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
        }}
      >
        Back to Home
      </button>
    </div>
  );
}
