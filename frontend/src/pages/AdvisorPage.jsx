import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { cropAPI, recommendationAPI } from '../services/api';
import toast from 'react-hot-toast';
import RecommendationResult from '../components/RecommendationResult';
import FarmerResult from '../components/FarmerResult';

const SPACE_OPTIONS = [
  { value: 'POTS',       icon: '🪴', titleKey: 'space.pots',     subKey: 'space.pots_sub',     who: 'Home gardener' },
  { value: 'GARDEN_BED', icon: '🌿', titleKey: 'space.garden',   subKey: 'space.garden_sub',   who: 'Home gardener' },
  { value: 'RAISED_BED', icon: '🧱', titleKey: 'space.raised',   subKey: 'space.raised_sub',   who: 'Home gardener' },
  { value: 'INDOORS',    icon: '🏠', titleKey: 'space.indoors',  subKey: 'space.indoors_sub',  who: 'Home gardener' },
  { value: 'FARM_FIELD', icon: '🚜', titleKey: 'space.farm',     subKey: 'space.farm_sub',     who: 'Farmer' },
];

const SOIL_OPTIONS = [
  { value: 'unknown', icon: '❓', titleKey: 'soil.unknown', subKey: 'soil.unknown_sub' },
  { value: 'loamy',   icon: '🟫', titleKey: 'soil.loamy',   subKey: 'soil.loamy_sub' },
  { value: 'sandy',   icon: '🏜️', titleKey: 'soil.sandy',   subKey: 'soil.sandy_sub' },
  { value: 'clay',    icon: '🧱', titleKey: 'soil.clay',    subKey: 'soil.clay_sub' },
  { value: 'red',     icon: '🔴', titleKey: 'soil.red',     subKey: 'soil.red_sub' },
];

export default function AdvisorPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [crops, setCrops] = useState([]);
  const [cropSearch, setCropSearch] = useState('');
  const [form, setForm] = useState({
    spaceType: '',
    cropName: searchParams.get('crop') || '',
    soilType: 'unknown',
    location: user?.city || '',
    climate: '',
    landAcres: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const isFarmer = form.spaceType === 'FARM_FIELD';

  useEffect(() => {
    cropAPI.getAll().then(res => setCrops(res.data)).catch(() => {});
  }, []);

  const filteredCrops = crops.filter(c =>
    c.name?.toLowerCase().includes(cropSearch.toLowerCase()) ||
    c.category?.toLowerCase().includes(cropSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const apiCall = user ? recommendationAPI.get : recommendationAPI.getPublic;
      const res = await apiCall({
        cropName: form.cropName,
        spaceType: isFarmer ? 'GARDEN_BED' : form.spaceType,
        soilType: form.soilType !== 'unknown' ? form.soilType : '',
        location: form.location,
        climate: form.climate,
        additionalNotes: isFarmer ? 'farmer_field' : '',
      });
      setResult({ ...res.data, isFarmer, landAcres: form.landAcres, spaceTypeOriginal: form.spaceType });
      setStep(6);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to get recommendation. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setStep(1);
    setForm({ spaceType: '', cropName: '', soilType: 'unknown', location: user?.city || '', climate: '', landAcres: '' });
  };

  const Stepper = () => (
    <div className="stepper">
      {[1, 2, 3, 4, 5].map((n, i) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center' }}>
          <div className={`step-node ${step === n ? 'active' : step > n ? 'done' : ''}`}>
            {step > n ? '✓' : n}
          </div>
          {i < 4 && <div className={`step-line ${step > n ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  );

  const StepHeader = ({ title, sub }) => (
    <div style={{ marginBottom: 28 }}>
      <p style={{ color: 'var(--green-300)', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
        Step {step} — {title}
      </p>
      <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{sub}</p>
    </div>
  );

  if (result && step === 6) {
    if (result.isFarmer) {
      return (
        <div className="container" style={{ padding: '40px 20px' }}>
          <FarmerResult result={result} onReset={reset} />
        </div>
      );
    }
    return (
      <div className="container" style={{ padding: '40px 20px' }}>
        <RecommendationResult result={result} onReset={reset} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', padding: '0 0 60px' }}>
      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(135deg, #2d5a2d 0%, #1e3a1e 60%)', padding: '40px 20px 48px' }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-300)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            {t('advisor.label')}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 5vw, 44px)', color: '#fff', marginBottom: 12, lineHeight: 1.15 }}>
            {t('hero.title')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 20, maxWidth: 560 }}>
            {t('hero.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[t('hero.badge1'), t('hero.badge2'), t('hero.badge3')].map(b => (
              <span key={b} style={{ padding: '5px 14px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 700 }}>
        <Stepper />

        {/* ── STEP 1: Space Type ── */}
        {step === 1 && (
          <div className="fade-in">
            <StepHeader title={t('step.where')} sub={t('step.where_sub')} />

            {/* Home gardener section */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              {t('space.home_gardeners')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              {SPACE_OPTIONS.filter(o => o.who === 'Home gardener').map(opt => (
                <div key={opt.value}
                  className={`option-card ${form.spaceType === opt.value ? 'selected' : ''}`}
                  onClick={() => { setForm(f => ({ ...f, spaceType: opt.value })); setStep(2); }}>
                  <div className="option-icon">{opt.icon}</div>
                  <div className="option-title">{t(opt.titleKey)}</div>
                  <div className="option-sub">{t(opt.subKey)}</div>
                </div>
              ))}
            </div>

            {/* Farmer section */}
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-yellow)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              {t('space.farmers_label')}
            </div>
            <div
              className={`option-card ${form.spaceType === 'FARM_FIELD' ? 'selected' : ''}`}
              onClick={() => { setForm(f => ({ ...f, spaceType: 'FARM_FIELD' })); setStep(2); }}
              style={{
                flexDirection: 'row', gap: 16, textAlign: 'left', padding: '20px 24px',
                border: `2px solid ${form.spaceType === 'FARM_FIELD' ? 'var(--accent-yellow)' : 'rgba(212,168,67,0.3)'}`,
                background: form.spaceType === 'FARM_FIELD' ? 'rgba(212,168,67,0.08)' : 'var(--bg-card)',
              }}
            >
              <div style={{ fontSize: 40 }}>🚜</div>
              <div>
                <div className="option-title" style={{ fontSize: 16, marginBottom: 4 }}>{t('space.farm_title')}</div>
                <div className="option-sub" style={{ fontSize: 13 }}>{t('space.farm_desc')}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Crop Selection ── */}
        {step === 2 && (
          <div className="fade-in">
            <StepHeader title={t('step.what')} sub={t('step.what_sub')} />
            <input
              className="form-input"
              placeholder="🔍 Search: tomato, rose, tulsi, chilli, wheat, rice..."
              value={cropSearch}
              onChange={e => setCropSearch(e.target.value)}
              style={{ marginBottom: 16, fontSize: 15 }}
              autoFocus
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, maxHeight: 380, overflowY: 'auto' }}>
              {(cropSearch ? filteredCrops : crops).map(crop => (
                <div key={crop.id}
                  className={`option-card ${form.cropName === crop.name ? 'selected' : ''}`}
                  onClick={() => { setForm(f => ({ ...f, cropName: crop.name })); setStep(3); }}
                  style={{ padding: '16px 12px' }}>
                  <div style={{ fontSize: 28 }}>{crop.iconEmoji || '🌿'}</div>
                  <div className="option-title" style={{ fontSize: 13 }}>{crop.name}</div>
                  <div className="option-sub" style={{ fontSize: 11 }}>{crop.category}</div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, marginTop: 4,
                    background: crop.difficultyLevel === 'BEGINNER' ? 'rgba(74,140,63,0.2)' : 'rgba(212,168,67,0.15)',
                    color: crop.difficultyLevel === 'BEGINNER' ? 'var(--green-300)' : 'var(--accent-yellow)',
                  }}>{crop.difficultyLevel}</span>
                </div>
              ))}
              {/* Not found — use custom */}
              {cropSearch && filteredCrops.length === 0 && (
                <div className="option-card"
                  onClick={() => { setForm(f => ({ ...f, cropName: cropSearch })); setStep(3); }}
                  style={{ gridColumn: '1 / -1', flexDirection: 'row', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>🌱</span>
                  <div>
                    <div className="option-title">Use "{cropSearch}"</div>
                    <div className="option-sub">Not in our list — we'll still give you advice!</div>
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ marginTop: 20 }}>{t('btn.back')}</button>
          </div>
        )}

        {/* ── STEP 3: Soil Type ── */}
        {step === 3 && (
          <div className="fade-in">
            <StepHeader title={t('step.soil')} sub={t('step.soil_sub')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
              {SOIL_OPTIONS.map(opt => (
                <div key={opt.value}
                  className={`option-card ${form.soilType === opt.value ? 'selected' : ''}`}
                  onClick={() => { setForm(f => ({ ...f, soilType: opt.value })); setStep(4); }}>
                  <div className="option-icon" style={{ fontSize: 28 }}>{opt.icon}</div>
                  <div className="option-title" style={{ fontSize: 13 }}>{t(opt.titleKey)}</div>
                  <div className="option-sub">{t(opt.subKey)}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost" onClick={() => setStep(2)} style={{ marginTop: 20 }}>{t('btn.back')}</button>
          </div>
        )}

        {/* ── STEP 4: Location + Farmer extras ── */}
        {step === 4 && (
          <div className="fade-in">
            <StepHeader title={t('step.location')} sub={t('step.location_sub')} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">{t('auth.city')} / {t('auth.state')}</label>
                <input className="form-input" placeholder="e.g. Hyderabad, Warangal, Pune"
                  value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Climate</label>
                <select className="form-input" value={form.climate} onChange={e => setForm(f => ({ ...f, climate: e.target.value }))}>
                  {[['','climate.select'],['tropical','climate.tropical'],['semi-arid','climate.semi_arid'],['subtropical','climate.subtropical'],['highland','climate.highland']].map(([v,k])=><option key={v} value={v}>{t(k)}</option>)}
                </select>
              </div>

              {/* Extra field for farmers */}
              {isFarmer && (
                <div className="form-group" style={{
                  padding: '16px 18px',
                  background: 'rgba(212,168,67,0.06)',
                  border: '1px solid rgba(212,168,67,0.25)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <label className="form-label" style={{ color: 'var(--accent-yellow)' }}>🚜 Land Area (in Acres) *</label>
                  <input className="form-input" placeholder="e.g. 2.5"
                    type="number" min="0.1" step="0.1"
                    value={form.landAcres}
                    onChange={e => setForm(f => ({ ...f, landAcres: e.target.value }))} />
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    We'll calculate exact fertilizer quantity, number of bags, and total cost for your field.
                  </p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={() => setStep(3)}>{t('btn.back')}</button>
              <button className="btn btn-primary" onClick={() => setStep(5)}
                disabled={isFarmer && !form.landAcres}
                style={{ flex: 1 }}>{t('btn.next')}</button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Confirm ── */}
        {step === 5 && (
          <div className="fade-in">
            <StepHeader title={t('step.confirm')} sub={t('step.confirm_sub')} />

            <div className="card" style={{ marginBottom: 20 }}>
              {[
                { label: 'Growing space', value: SPACE_OPTIONS.find(s => s.value === form.spaceType)?.icon + ' ' + (form.spaceType === isFarmer ? t('space.farm_title') : t(SPACE_OPTIONS.find(s => s.value === form.spaceType)?.titleKey || '')) },
                { label: 'Crop', value: (crops.find(c => c.name === form.cropName)?.iconEmoji || '🌿') + ' ' + form.cropName },
                { label: 'Soil type', value: t(SOIL_OPTIONS.find(s => s.value === form.soilType)?.titleKey || '') },
                { label: 'Location', value: form.location || 'Not specified' },
                ...(isFarmer ? [{ label: 'Land area', value: form.landAcres + ' acres' }] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 15 }}>{value}</span>
                </div>
              ))}
            </div>

            {!user && (
              <div style={{ padding: '14px 18px', marginBottom: 16, background: 'rgba(232,131,74,0.1)', border: '1px solid rgba(232,131,74,0.25)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--accent-orange)' }}>
                ⚠️ Not logged in. <a href="/login" style={{ color: 'inherit', fontWeight: 600 }}>Login</a> to save your recommendations.
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost" onClick={() => setStep(4)}>{t('btn.back')}</button>
              <button className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading || !form.cropName || !form.spaceType}
                style={{ flex: 1, height: 52, fontSize: 16,
                  ...(isFarmer ? { background: '#c4961a' } : {}),
                }}>
                {loading ? <><span className="spinner" /> Getting your plan...</> :
                  isFarmer ? '🌾 Get Field Recommendation' : t('btn.get_recommendation')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
