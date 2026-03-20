import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const priorityColor = {
  PRIMARY: { bg: 'rgba(74,140,63,0.15)', border: 'rgba(74,140,63,0.35)', text: 'var(--green-300)' },
  SECONDARY: { bg: 'rgba(212,168,67,0.1)', border: 'rgba(212,168,67,0.3)', text: 'var(--accent-yellow)' },
  OPTIONAL: { bg: 'rgba(90,155,196,0.1)', border: 'rgba(90,155,196,0.3)', text: 'var(--accent-blue)' },
};

function NPKChips({ n, p, k }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {n !== undefined && <span className="npk-chip npk-n">N {n}%</span>}
      {p !== undefined && <span className="npk-chip npk-p">P {p}%</span>}
      {k !== undefined && <span className="npk-chip npk-k">K {k}%</span>}
    </div>
  );
}

// Step key prefix mapping
const SPACE_KEYS = { POTS: 'p', INDOORS: 'i', GARDEN_BED: 'g', RAISED_BED: 'r' };
const STEP_COUNTS = {
  POTS:       { withFertilizer: 8, withoutFertilizer: 8 },
  INDOORS:    { withFertilizer: 8, withoutFertilizer: 7 },
  GARDEN_BED: { withFertilizer: 8, withoutFertilizer: 7 },
  RAISED_BED: { withFertilizer: 8, withoutFertilizer: 6 },
};

function getSteps(spaceType, mode, t) {
  const sk = SPACE_KEYS[spaceType];
  const mk = mode === 'withFertilizer' ? 'wf' : 'wo';
  if (!sk) return [];
  const count = STEP_COUNTS[spaceType]?.[mode] || 0;
  return Array.from({ length: count }, (_, i) => ({
    s: i + 1,
    title: t(`g.${sk}.${mk}.${i+1}.t`),
    desc: t(`g.${sk}.${mk}.${i+1}.d`),
  }));
}

function StepByStepGuide({ spaceType, cropName, fertilizers, t }) {
  const [mode, setMode] = useState('withFertilizer');
  if (!SPACE_KEYS[spaceType]) return null;
  const steps = getSteps(spaceType, mode, t);

  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 8 }}>
        📋 Step-by-Step Growing Guide
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
        Complete instructions to grow <strong style={{ color: 'var(--green-300)' }}>{cropName}</strong> in {spaceType?.replace('_', ' ').toLowerCase()}.
      </p>

      {/* Toggle */}
      <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, marginBottom: 20, width: 'fit-content', gap: 4 }}>
        {[
          { key: 'withFertilizer', label: t('guide.toggle.with'), color: 'var(--green-300)' },
          { key: 'withoutFertilizer', label: t('guide.toggle.without'), color: 'var(--accent-yellow)' },
        ].map(opt => (
          <button key={opt.key} onClick={() => setMode(opt.key)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: mode === opt.key ? 'var(--bg-card)' : 'transparent',
            color: mode === opt.key ? opt.color : 'var(--text-muted)',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
          }}>{opt.label}</button>
        ))}
      </div>

      {/* If with fertilizer, show fertilizer summary first */}
      {mode === 'withFertilizer' && fertilizers?.length > 0 && (
        <div style={{ background: 'rgba(74,140,63,0.07)', border: '1px solid rgba(74,140,63,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-300)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Fertilizers to Use</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {fertilizers.map(f => (
              <div key={f.fertilizerName} style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: f.priority === 'PRIMARY' ? 'rgba(74,140,63,0.2)' : 'rgba(212,168,67,0.15)',
                color: f.priority === 'PRIMARY' ? 'var(--green-300)' : 'var(--accent-yellow)',
                border: `1px solid ${f.priority === 'PRIMARY' ? 'rgba(74,140,63,0.3)' : 'rgba(212,168,67,0.3)'}`,
              }}>
                {f.fertilizerName} <span style={{ opacity: 0.7 }}>({f.priority})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, background: 'var(--bg-card)', borderRadius: 12, padding: '14px 18px' }}>
            <div style={{
              minWidth: 30, height: 30, borderRadius: '50%',
              background: mode === 'withFertilizer' ? 'var(--green-700)' : 'rgba(212,168,67,0.2)',
              color: mode === 'withFertilizer' ? 'var(--green-200)' : 'var(--accent-yellow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>{s.s}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Organic note */}
      {mode === 'withoutFertilizer' && (
        <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(212,168,67,0.06)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 10, fontSize: 13, color: 'var(--accent-yellow)', lineHeight: 1.6 }}>
          {t('guide.organic_note')}
        </div>
      )}
    </div>
  );
}


function getSpaceKey(spaceType) {
  if (!spaceType) return 'pots';
  const s = spaceType.toUpperCase();
  if (s.includes('GARDEN')) return 'garden';
  if (s.includes('RAISED')) return 'raised';
  if (s.includes('INDOOR')) return 'indoors';
  return 'pots';
}

function getTranslatedCareTips(spaceType, t) {
  const sk = getSpaceKey(spaceType);
  return [1,2,3,4,5].map(i => t(`ct.${sk}.${i}`)).filter(v => !v.startsWith('ct.'));
}

function getTranslatedMistakes(spaceType, t) {
  const sk = getSpaceKey(spaceType);
  return [1,2,3,4,5].map(i => t(`cm.${sk}.${i}`)).filter(v => !v.startsWith('cm.'));
}


function getSoilKeyRR(cropName) {
  const n = (cropName || '').toLowerCase();
  if (n.includes('tomato')||n.includes('chilli')||n.includes('capsicum')||n.includes('brinjal')||
      n.includes('okra')||n.includes('bhindi')||n.includes('cucumber')||n.includes('gourd')) return 'tomato';
  if (n.includes('rice')||n.includes('paddy')||n.includes('basmati')||
      n.includes('maize')||n.includes('corn')||n.includes('mango')||n.includes('banana')) return 'rice';
  if (n.includes('wheat')||n.includes('barley')||n.includes('spinach')||n.includes('palak')||
      n.includes('coriander')||n.includes('methi')||n.includes('lettuce')||n.includes('carrot')||
      n.includes('onion')||n.includes('potato')||n.includes('radish')) return 'wheat';
  if (n.includes('rose')||n.includes('marigold')||n.includes('jasmine')||n.includes('flower')||
      n.includes('sunflower')||n.includes('tulsi')||n.includes('mint')||n.includes('basil')) return 'flower';
  if (n.includes('mango')||n.includes('banana')||n.includes('papaya')||n.includes('coconut')||
      n.includes('lemon')||n.includes('citrus')||n.includes('guava')) return 'tropical';
  return 'default';
}
function getSeasonKeyRR(cropName) {
  const n = (cropName || '').toLowerCase();
  if (n.includes('tomato')) return 'season.tomato';
  if (n.includes('chilli')||n.includes('mirchi')||n.includes('capsicum')||n.includes('pepper')) return 'season.chilli';
  if (n.includes('rice')||n.includes('paddy')||n.includes('basmati')) return 'season.rice';
  if (n.includes('wheat')||n.includes('barley')||n.includes('oat')) return 'season.wheat';
  if (n.includes('spinach')||n.includes('palak')||n.includes('methi')||n.includes('coriander')||
      n.includes('lettuce')||n.includes('cabbage')||n.includes('carrot')||n.includes('onion')||
      n.includes('potato')||n.includes('radish')) return 'season.spinach';
  if (n.includes('okra')||n.includes('bhindi')||n.includes('cucumber')||n.includes('gourd')||
      n.includes('pumpkin')||n.includes('brinjal')||n.includes('maize')||n.includes('corn')) return 'season.tomato';
  if (n.includes('mango')||n.includes('banana')||n.includes('papaya')||n.includes('coconut')) return 'season.rice';
  if (n.includes('rose')||n.includes('marigold')||n.includes('jasmine')) return 'season.chilli';
  if (n.includes('mint')||n.includes('tulsi')||n.includes('basil')) return 'season.yearround';
  return 'season.default';
}
function RecommendSoilCard({ cropName, t }) {
  const key = getSoilKeyRR(cropName);
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>🌍</span>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{t('soil.best_title')}</div>
      </div>
      <div style={{ fontSize: 14, color: 'var(--green-300)', fontWeight: 600, marginBottom: 8 }}>{t(`soil.content.${key}`)}</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{t(`soil.reason.${key}`)}</p>
    </div>
  );
}
function RecommendClimateCard({ cropName, t }) {
  const key = getSoilKeyRR(cropName);
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>🌤️</span>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{t('soil.best_climate')}</div>
      </div>
      <div style={{ fontSize: 14, color: 'var(--accent-blue)', fontWeight: 600, marginBottom: 8 }}>{t(`climate.content.${key}`)}</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{t(`climate.reason.${key}`)}</p>
    </div>
  );
}


export default function RecommendationResult({ result, onReset }) {
  const { t } = useTranslation();

  if (!result) return null;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', animation: 'slideUp 0.5s ease' }}>
      {/* Result header */}
      <div style={{
        background: 'linear-gradient(135deg, #2d5a2d, #1e3a1e)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 32px 28px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--green-300)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              {t('result.your_growing_plan')}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: '#fff', marginBottom: 8 }}>
              {result.cropName} 🌱
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 500 }}>
              {result.generalTips}
            </p>
          </div>
          <button className="btn btn-outline" onClick={onReset} style={{ borderColor: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: 13 }}>
            {t('btn.new_search')}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: t('result.harvest_label'), value: result.harvestTime },
            { label: t('result.watering_label'), value: result.wateringSchedule?.split('.')[0] },
            { label: t('result.sunlight_label'), value: result.sunlightNeeds },
          ].map(({ label, value }) => value && (
            <div key={label} style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 20,
              fontSize: 13,
              color: 'rgba(255,255,255,0.85)',
            }}>
              {label}: <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Quick info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 20, marginBottom: 10 }}>💧</div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
            {t('result.watering')}
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>{result.wateringSchedule}</p>
        </div>
        <div className="card">
          <div style={{ fontSize: 20, marginBottom: 10 }}>🌱</div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
            {t('result.soil_prep')}
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>{result.soilPreparation}</p>
        </div>
      </div>

      {/* Soil & Climate Recommendation — shown when user selects unknown soil */}
      {(result.recommendedSoilType || result.recommendedClimate) && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(90,155,196,0.08), rgba(74,140,63,0.06))',
          border: '1.5px solid rgba(90,155,196,0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px 24px',
          marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent-blue)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            {`🔬 ${t('soil.recommended_title')} — ${result.cropName}`}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {/* Soil recommendation */}
            <RecommendSoilCard cropName={result.cropName} t={t} />
            {/* Climate recommendation */}
            <RecommendClimateCard cropName={result.cropName} t={t} />
          </div>

          {/* Best planting season */}
          {result.bestPlantingSeason && (
            <div style={{ marginTop: 14, padding: '10px 16px', background: 'rgba(74,140,63,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>📅</span>
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{`${t('soil.best_planting')}: `}</span>
                <span style={{ fontSize: 13, color: 'var(--green-300)', fontWeight: 600 }}>{result.bestPlantingSeason || t(getSeasonKeyRR(result.cropName))}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fertilizer Schedule */}
      {result.fertilizers?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 6 }}>
            {t('result.fertilizers')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 18 }}>
            Tap any fertilizer to see full details. Apply in the order listed below.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {result.fertilizers.map((fert, i) => {
              const colors = priorityColor[fert.priority] || priorityColor.OPTIONAL;
              return (
                <div key={i} style={{
                  background: 'var(--bg-card)',
                  border: `1.5px solid ${colors.border}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 22px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: 4, height: '100%',
                    background: colors.text,
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                          {fert.fertilizerName}
                        </span>
                        <span style={{
                          padding: '2px 10px', borderRadius: 10,
                          background: colors.bg, color: colors.text,
                          fontSize: 11, fontWeight: 600,
                        }}>
                          {fert.priority}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{fert.type}</div>
                      <NPKChips n={fert.nitrogenPct} p={fert.phosphorusPct} k={fert.potassiumPct} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: 13 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 3, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('result.purpose')}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{fert.purpose}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 3, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('result.dosage')}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{fert.dosage}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 3, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('result.when_to_apply')}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{fert.timing}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step by Step Guide */}
      <StepByStepGuide spaceType={result.spaceType} cropName={result.cropName} fertilizers={result.fertilizers} t={t} />

      {/* Care Tips + Common Mistakes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>💡</span> {t('result.care_tips')}
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {getTranslatedCareTips(result.spaceType, t).map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--green-400)', fontWeight: 700, marginTop: 1 }}>✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        <div className="card" style={{ borderColor: 'rgba(201,87,87,0.2)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠️</span> {t('result.mistakes')}
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {getTranslatedMistakes(result.spaceType, t).map((m, i) => (
                <li key={i} style={{
                  display: 'flex', gap: 10, fontSize: 13,
                  color: 'var(--text-secondary)', lineHeight: 1.6,
                  paddingLeft: 12,
                  borderLeft: '3px solid var(--accent-red)',
                }}>
                  {m}
                </li>
              ))}
            </ul>
          </div>
      </div>

      <button className="btn btn-primary btn-full" onClick={onReset} style={{ height: 52, fontSize: 16 }}>
        {t('result.advise_another')}
      </button>
    </div>
  );
}
