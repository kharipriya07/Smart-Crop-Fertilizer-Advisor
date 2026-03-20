import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { recommendationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function HistoryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) return;
    recommendationAPI.getHistory()
      .then(res => setHistory(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 12 }}>Login to see your garden</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Your saved crop recommendations will appear here.</p>
          <Link to="/login" className="btn btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '40px 20px' }}>
      <div className="container" style={{ maxWidth: 700 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 8 }}>
            {t('history.title')}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            All your saved crop recommendations, {user.fullName?.split(' ')[0]}.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <div className="spinner" style={{ margin: '0 auto 16px', width: 32, height: 32 }} />
          </div>
        ) : history.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 10 }}>{t('history.empty')}</h3>
            <Link to="/advisor" className="btn btn-primary" style={{ marginTop: 8 }}>Start the Advisor</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {history.map((item, i) => {
              const date = new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              const isOpen = expanded === i;
              let parsed = null;
              try { parsed = JSON.parse(item.recommendationJson); } catch (e) {}

              return (
                <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : i)}
                    style={{
                      width: '100%', padding: '20px 24px',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                      }}>🌿</div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)' }}>{item.cropName}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                          {item.spaceType?.replace('_', ' ')} · {item.location || 'Location not set'} · {date}
                        </div>
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>{isOpen ? '▲' : '▼'}</span>
                  </button>

                  {isOpen && parsed && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ paddingTop: 20, fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
                        {parsed.generalTips}
                      </div>
                      {parsed.fertilizers?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                            Fertilizers Recommended
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {parsed.fertilizers.map(f => (
                              <span key={f.fertilizerName} className="badge badge-green">{f.fertilizerName}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <Link to="/advisor" className="btn btn-outline" style={{ marginTop: 16, fontSize: 13, padding: '8px 16px' }}>
                        Try Again
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
