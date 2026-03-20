import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🌿' },
  { code: 'ta', label: 'தமிழ்', flag: '🌺' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🌸' },
  { code: 'mr', label: 'मराठी', flag: '🏵️' },
];

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout, changeLanguage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLang, setShowLang] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { i18n: i18nInstance } = useTranslation();
  const currentLang = LANGUAGES.find(l => l.code === i18nInstance.language) || LANGUAGES[0];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'rgba(20,26,18,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
          <span style={{ fontSize: 28 }}>🌿</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-primary)' }}>
            GardenGuru
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { path: '/', label: t('nav.home') },
            { path: '/advisor', label: t('nav.advisor') },
            { path: '/research', label: t('nav.research') },
            ...(user ? [{ path: '/history', label: t('nav.history') }] : []),
          ].map(({ path, label }) => (
            <Link key={path} to={path} style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 14,
              fontWeight: 500,
              color: isActive(path) ? 'var(--green-300)' : 'var(--text-secondary)',
              background: isActive(path) ? 'rgba(74,140,63,0.1)' : 'transparent',
              transition: 'all 0.2s',
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right side: Language + Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Language selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLang(!showLang)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
              }}
            >
              <span>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
            </button>

            {showLang && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 8,
                minWidth: 160,
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
              }}>
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setShowLang(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 12px',
                      background: lang.code === currentLang.code ? 'rgba(74,140,63,0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      color: lang.code === currentLang.code ? 'var(--green-300)' : 'var(--text-primary)',
                      fontSize: 14,
                      fontFamily: 'var(--font-body)',
                      textAlign: 'left',
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth buttons */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                👋 {user.fullName?.split(' ')[0]}
              </span>
              <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '7px 16px', fontSize: 13 }}>
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-ghost" style={{ padding: '7px 16px', fontSize: 13 }}>
                {t('nav.login')}
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {showLang && (
        <div
          onClick={() => setShowLang(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 150 }}
        />
      )}
    </nav>
  );
}
