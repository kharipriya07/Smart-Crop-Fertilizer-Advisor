import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
];

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    city: '', state: '', preferredLanguage: 'en'
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to GardenGuru! 🌱');
      navigate('/advisor');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Try again.');
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
      <div style={{ width: '100%', maxWidth: 480, animation: 'fadeIn 0.4s ease' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>
            {t('auth.new')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Join thousands of home gardeners growing successfully
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              <div className="form-group">
                <label className="form-label">{t('auth.fullname')} *</label>
                <input type="text" className="form-input" placeholder="Ramesh Kumar"
                  value={form.fullName} onChange={set('fullName')} required />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.email')} *</label>
                <input type="email" className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={set('email')} required />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.password')} *</label>
                <input type="password" className="form-input" placeholder="Min. 6 characters"
                  value={form.password} onChange={set('password')} required minLength={6} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">{t('auth.city')}</label>
                  <input type="text" className="form-input" placeholder="Hyderabad"
                    value={form.city} onChange={set('city')} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.state')}</label>
                  <input type="text" className="form-input" placeholder="Telangana"
                    value={form.state} onChange={set('state')} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.phone')}</label>
                <input type="tel" className="form-input" placeholder="+91 9876543210"
                  value={form.phone} onChange={set('phone')} />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.language')}</label>
                <select className="form-input" value={form.preferredLanguage} onChange={set('preferredLanguage')}>
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{ marginTop: 8, height: 48, fontSize: 16 }}
              >
                {loading ? <span className="spinner" /> : t('auth.register')}
              </button>
            </div>
          </form>

          <div className="divider" />

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
            {t('auth.have_account')}{' '}
            <Link to="/login" style={{ color: 'var(--green-300)', fontWeight: 600 }}>
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
