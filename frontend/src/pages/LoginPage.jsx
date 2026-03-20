import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🌱');
      navigate('/advisor');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 420, animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>
            {t('auth.welcome')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Sign in to access your garden advisor
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">{t('auth.email')}</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.password')}</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{ marginTop: 8, height: 48, fontSize: 16 }}
              >
                {loading ? <span className="spinner" /> : t('auth.login')}
              </button>
            </div>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            {t('auth.no_account')}{' '}
            <Link to="/register" style={{ color: 'var(--green-300)', fontWeight: 600 }}>
              {t('auth.register')}
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 20,
          padding: '12px 16px',
          background: 'rgba(74,140,63,0.08)',
          border: '1px solid rgba(74,140,63,0.2)',
          borderRadius: 'var(--radius-md)',
          fontSize: 13,
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          💡 New here? <Link to="/register" style={{ color: 'var(--green-300)' }}>Create a free account</Link> to save your recommendations
        </div>
      </div>
    </div>
  );
}
