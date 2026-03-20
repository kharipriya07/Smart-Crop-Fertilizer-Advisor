import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #2d5a2d 0%, #1e3a1e 40%, #141a12 100%)',
        borderRadius: '0 0 32px 32px',
        padding: '64px 20px 80px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background texture dots */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-300)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
            HOME GARDEN GUIDE
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 7vw, 64px)',
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: 20,
            whiteSpace: 'pre-line',
          }}>
            {t('hero.title')}
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
            {t('hero.subtitle')}
          </p>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {[
              { text: t('hero.badge1'), icon: '✓' },
              { text: t('hero.badge2'), icon: '📋' },
              { text: t('hero.badge3'), icon: '🔧' },
            ].map(b => (
              <span key={b.text} style={{
                padding: '7px 16px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 20,
                fontSize: 13,
                color: 'rgba(255,255,255,0.9)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}>
                {b.icon} {b.text}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/advisor" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              🌱 {t('hero.cta')}
            </Link>
            {!user && (
              <Link to="/login" className="btn btn-outline" style={{ fontSize: 16, padding: '14px 32px', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
                {t('hero.login_cta')}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container" style={{ padding: '64px 20px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, textAlign: 'center', marginBottom: 8 }}>
          {t('home.how_title')}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48, fontSize: 16 }}>
          {t('home.how_sub')}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {[
            { icon: '📍', step: '01', title: t('home.step1_title'), desc: t('home.step1_desc') },
            { icon: '🌿', step: '02', title: t('home.step2_title'), desc: t('home.step2_desc') },
            { icon: '🧪', step: '03', title: t('home.step3_title'), desc: t('home.step3_desc') },
          ].map(f => (
            <div key={f.step} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 16, right: 16,
                fontSize: 48, fontWeight: 900,
                color: 'rgba(255,255,255,0.04)',
                fontFamily: 'var(--font-display)',
              }}>{f.step}</div>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Crops Strip */}
      <section style={{ background: 'var(--bg-secondary)', padding: '48px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 24, textAlign: 'center' }}>
            {t('home.popular_title')}
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { emoji: '🍅', name: 'Tomato' }, { emoji: '🌶️', name: 'Chilli' }, { emoji: '🌿', name: 'Tulsi' },
              { emoji: '🌿', name: 'Coriander' }, { emoji: '🍆', name: 'Brinjal' }, { emoji: '🌼', name: 'Marigold' },
              { emoji: '🌿', name: 'Mint' }, { emoji: '🌿', name: 'Methi' }, { emoji: '🫑', name: 'Capsicum' },
              { emoji: '🍋', name: 'Lemon' }, { emoji: '🌹', name: 'Rose' }, { emoji: '🥒', name: 'Cucumber' },
            ].map(c => (
              <Link key={c.name} to={`/advisor?crop=${c.name}`} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 24,
                fontSize: 14,
                color: 'var(--text-secondary)',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--green-500)';
                e.currentTarget.style.color = 'var(--green-300)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}>
                {c.emoji} {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="container" style={{ padding: '64px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, marginBottom: 16 }}>
          {t('home.cta_title')}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
          {t('home.cta_sub')}
        </p>
        <Link to="/advisor" className="btn btn-primary" style={{ fontSize: 17, padding: '15px 36px' }}>
          {t('home.cta_btn')}
        </Link>
      </section>
    </div>
  );
}
