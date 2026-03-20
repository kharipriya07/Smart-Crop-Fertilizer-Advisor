import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ACRE_TO_HECTARE = 0.4047;

const BASE_DOSES = {
  'Urea':                          { kg: 150,  costPerKg: 6  },
  'DAP (Di-ammonium Phosphate)':   { kg: 100,  costPerKg: 27 },
  'NPK 20-20-20':                  { kg: 200,  costPerKg: 35 },
  'Vermicompost':                  { kg: 2500, costPerKg: 8  },
  'Neem Cake':                     { kg: 200,  costPerKg: 18 },
  'MOP / KCl (Muriate of Potash)': { kg: 60,   costPerKg: 17 },
  'SSP (Single Super Phosphate)':  { kg: 250,  costPerKg: 12 },
  'CAN (Calcium Ammonium Nitrate)':{ kg: 120,  costPerKg: 20 },
  'Cow Dung Compost':              { kg: 5000, costPerKg: 3  },
  'Zinc Sulphate':                 { kg: 25,   costPerKg: 45 },
};

const FERT_DETAILS = {
  'Urea':                          { sideEffects: ['Soil acidification if overused','Burns roots near seeds','Nitrogen loss without irrigation'], precautions: ['Keep 5cm gap from seeds','Water immediately after applying','Split into 2-3 doses — never all at once','Apply in evening'] },
  'DAP (Di-ammonium Phosphate)':   { sideEffects: ['Blocks zinc/iron if overdosed','Phosphorus runoff in water bodies'], precautions: ['Mix 5-10cm deep before planting','Do not mix with urea','Avoid on alkaline soils (pH>7.5)'] },
  'NPK 20-20-20':                  { sideEffects: ['Salt buildup with prolonged use'], precautions: ['Do not exceed recommended dose','Take break every 3rd crop cycle'] },
  'Vermicompost':                  { sideEffects: ['Pathogen risk if not fully composted'], precautions: ['Use only fully composted material','Store in shade with 30-40% moisture'] },
  'Neem Cake':                     { sideEffects: ['Strong odor during application','Can inhibit germination near seeds'], precautions: ['Mix into soil 2 weeks before sowing','Use gloves when handling'] },
  'MOP / KCl (Muriate of Potash)': { sideEffects: ['Chloride toxicity in sensitive crops','Increases soil salinity'], precautions: ['Avoid on salt-sensitive crops','Apply in split doses for sandy soils'] },
  'SSP (Single Super Phosphate)':  { sideEffects: ['Contains fluoride as impurity','Slow to dissolve in dry soil'], precautions: ['Apply as basal dose and mix well','Do not store in damp conditions'] },
  'CAN (Calcium Ammonium Nitrate)':{ sideEffects: ['Oxidizer — fire risk near combustibles','Leaching risk on sandy soils'], precautions: ['Store away from flammables','Apply in split doses every 3 weeks'] },
  'Cow Dung Compost':              { sideEffects: ['Fresh manure burns plants and spreads pathogens','Weed seeds if poorly composted'], precautions: ['Use only well-composted (3+ months old)','Never apply fresh near roots'] },
  'Zinc Sulphate':                 { sideEffects: ['Excess zinc is toxic to soil organisms','Can reduce iron/manganese uptake'], precautions: ['Use only when deficiency symptoms appear','Do NOT mix with phosphatic fertilizers'] },
};

function getCropKey(n) {
  n = (n||'').toLowerCase();
  if (n.includes('tomato')) return 'tomato';
  if (n.includes('chilli')||n.includes('mirchi')||n.includes('capsicum')||n.includes('pepper')) return 'chilli';
  if (n.includes('rice')||n.includes('paddy')||n.includes('basmati')) return 'rice';
  if (n.includes('wheat')||n.includes('barley')||n.includes('oat')) return 'wheat';
  // Categorize unknown crops
  if (n.includes('spinach')||n.includes('palak')||n.includes('lettuce')||n.includes('cabbage')||
      n.includes('methi')||n.includes('coriander')||n.includes('mint')||n.includes('leafy')) return 'wheat'; // cool season
  if (n.includes('brinjal')||n.includes('eggplant')||n.includes('okra')||n.includes('bhindi')||
      n.includes('cucumber')||n.includes('gourd')||n.includes('pumpkin')||n.includes('squash')) return 'chilli'; // warm season veg
  if (n.includes('maize')||n.includes('corn')||n.includes('sorghum')||n.includes('millet')||
      n.includes('jowar')||n.includes('bajra')) return 'rice'; // kharif cereal
  if (n.includes('onion')||n.includes('garlic')||n.includes('potato')||n.includes('carrot')||
      n.includes('radish')||n.includes('turnip')||n.includes('beetroot')) return 'wheat'; // rabi veg
  if (n.includes('rose')||n.includes('marigold')||n.includes('jasmine')||n.includes('flower')||
      n.includes('sunflower')) return 'chilli'; // flowering - warm
  if (n.includes('mango')||n.includes('banana')||n.includes('papaya')||n.includes('guava')||
      n.includes('coconut')||n.includes('lemon')||n.includes('citrus')) return 'rice'; // tropical fruit
  return 'default';
}

function getSoilKey(n) {
  n = (n||'').toLowerCase();
  if (n.includes('tomato')||n.includes('chilli')||n.includes('capsicum')||n.includes('brinjal')) return 'tomato';
  if (n.includes('rice')||n.includes('paddy')) return 'rice';
  if (n.includes('wheat')) return 'wheat';
  return 'default';
}

function getSeasonKey(n) {
  n = (n||'').toLowerCase();
  if (n.includes('tomato')) return 'season.tomato';
  if (n.includes('chilli')||n.includes('capsicum')) return 'season.chilli';
  if (n.includes('rice')) return 'season.rice';
  if (n.includes('wheat')) return 'season.wheat';
  if (n.includes('spinach')||n.includes('methi')||n.includes('coriander')) return 'season.spinach';
  return 'season.default';
}

function getCropData(cropName, t) {
  const ck = getCropKey(cropName);
  const counts = { tomato:4, chilli:3, rice:4, wheat:3, default:4 };
  const count = counts[ck]||4;
  return {
    waterPerAcre: t(`cd.${ck}.water`),
    irrigationSchedule: t(`cd.${ck}.irr`),
    bestFertilizerKey: t(`cd.${ck}.best`),
    fertilizerTiming: Array.from({length:count},(_,i)=>({
      timeKey: t(`ft.${ck}.${i+1}.t`),
      dose:    t(`ft.${ck}.${i+1}.d`),
    })),
  };
}

function getFertKey(fertName) {
  return Object.keys(BASE_DOSES).find(k =>
    (fertName||'').toLowerCase().includes(k.split(' ')[0].toLowerCase()) ||
    k.toLowerCase().includes((fertName||'').split(' ')[0].toLowerCase())
  );
}

// ── Fertilizer row ──────────────────────────────────────────────────
function FertilizerRow({ r, acres }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const key = getFertKey(r.fertilizerName);
  const base   = BASE_DOSES[key]    || { kg:100, costPerKg:20 };
  const detail = FERT_DETAILS[key]  || {};
  const ha      = parseFloat(acres) * ACRE_TO_HECTARE;
  const totalKg = Math.round(base.kg * ha);
  const bags50  = Math.ceil(totalKg/50);
  const bags25  = Math.ceil(totalKg/25);
  const cost    = Math.round(totalKg * base.costPerKg);
  const perAcre = Math.round(base.kg * ACRE_TO_HECTARE);

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'18px 20px', marginBottom:14,
      borderLeft:`4px solid ${r.priority==='PRIMARY'?'var(--green-400)':r.priority==='SECONDARY'?'var(--accent-yellow)':'var(--accent-blue)'}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:16, color:'var(--text-primary)', marginBottom:4 }}>{r.fertilizerName}</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{r.type}</div>
          <span style={{ fontSize:11, padding:'2px 10px', borderRadius:8, fontWeight:600,
            background: r.priority==='PRIMARY'?'rgba(74,140,63,0.2)':'rgba(212,168,67,0.15)',
            color:       r.priority==='PRIMARY'?'var(--green-300)':'var(--accent-yellow)' }}>{r.priority}</span>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:26, fontWeight:700, color:'var(--green-300)' }}>{totalKg} kg</div>
          <div style={{ fontSize:11, color:'var(--text-muted)' }}>{t('research.total_for')} {acres} acres</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
        {[
          { label:t('research.per_acre'), value:`${perAcre} kg/acre`, icon:'📏' },
          { label:t('research.est_cost'),  value:`₹${cost.toLocaleString('en-IN')}`, icon:'💰' },
          { label:t('research.bags_50'),   value:`${bags50} bags`, icon:'🛄' },
          { label:t('research.bags_25'),   value:`${bags25} bags`, icon:'🛍️' },
        ].map(({label,value,icon})=>(
          <div key={label} style={{ background:'var(--bg-secondary)', borderRadius:8, padding:'10px 12px' }}>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{icon} {label}</div>
            <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:12, lineHeight:1.8 }}>
        <div>⚖️ {r.dosage}</div><div>📅 {r.timing}</div>
      </div>
      <button onClick={()=>setOpen(!open)} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontSize:12, color:'var(--text-muted)', fontFamily:'var(--font-body)', width:'100%', textAlign:'left' }}>
        {open ? t('research.hide_side_effects') : t('research.show_side_effects')}
      </button>
      {open && (
        <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:12 }}>
          {detail.sideEffects?.length>0 && (
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--accent-red)', textTransform:'uppercase', marginBottom:8 }}>⚠️ {t('research.side_effects')}</div>
              {detail.sideEffects.map((s,i)=>(
                <div key={i} style={{ display:'flex', gap:8, marginBottom:6, fontSize:13, color:'var(--text-secondary)', paddingLeft:10, borderLeft:'3px solid var(--accent-red)' }}>{s}</div>
              ))}
            </div>
          )}
          {detail.precautions?.length>0 && (
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--accent-yellow)', textTransform:'uppercase', marginBottom:8 }}>🛡️ {t('research.precautions')}</div>
              {detail.precautions.map((p,i)=>(
                <div key={i} style={{ display:'flex', gap:8, marginBottom:6, fontSize:13, color:'var(--text-secondary)' }}>
                  <span style={{ color:'var(--accent-yellow)' }}>•</span>{p}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────
export default function FarmerResult({ result, onReset }) {
  const { t } = useTranslation();
  const acres    = result.landAcres || 1;
  const hectares = (parseFloat(acres) * ACRE_TO_HECTARE).toFixed(2);
  const cropData = getCropData(result.cropName, t);

  const totalCost = (result.fertilizers||[]).reduce((sum, r) => {
    const key  = getFertKey(r.fertilizerName);
    const base = BASE_DOSES[key] || { kg:100, costPerKg:20 };
    return sum + Math.round(base.kg * parseFloat(acres) * ACRE_TO_HECTARE * base.costPerKg);
  }, 0);

  // Steps from i18n keys
  const STEP_KEYS    = ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10','s11','s12'];
  const MISTAKE_KEYS = ['m1','m2','m3','m4','m5','m6','m7'];
  const allSteps     = STEP_KEYS.map(k=>({ key:k, title:t(`fs.d.${k}.t`), desc:t(`fs.d.${k}.d`) }));
  const allMistakes  = MISTAKE_KEYS.map(k=>t(`fs.d.${k}`));

  // Soil / climate from i18n keys
  const soilKey      = getSoilKey(result.cropName);
  const seasonKey    = getSeasonKey(result.cropName);
  const season       = result.bestPlantingSeason || t(seasonKey);

  return (
    <div style={{ maxWidth:780, margin:'0 auto', animation:'slideUp 0.5s ease' }}>

      {/* ── Header ── */}
      <div style={{ background:'linear-gradient(135deg,#3a2800,#2a1e00)', border:'1px solid rgba(212,168,67,0.3)', borderRadius:'var(--radius-xl)', padding:'28px 32px', marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:12, color:'var(--accent-yellow)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>🚜 {t('farmer.plan_title')}</div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:34, color:'#fff', marginBottom:8 }}>{result.cropName}</h1>
            <p style={{ color:'rgba(255,255,255,0.7)', fontSize:14, maxWidth:480, lineHeight:1.7 }}>{result.generalTips}</p>
          </div>
          <button className="btn btn-outline" onClick={onReset} style={{ borderColor:'rgba(255,255,255,0.2)', color:'#fff', fontSize:13 }}>
            {t('farmer.new_search')}
          </button>
        </div>
        <div style={{ display:'flex', gap:12, marginTop:20, flexWrap:'wrap' }}>
          {[
            { label:`📐 ${t('farmer.land')}`,       value:`${acres} acres (${hectares} ha)` },
            { label:`⏱ ${t('farmer.harvest')}`,      value:result.harvestTime },
            { label:`💰 ${t('farmer.total_cost')}`,  value:`₹${totalCost.toLocaleString('en-IN')}` },
          ].map(({label,value})=>value&&(
            <div key={label} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.1)', borderRadius:20, fontSize:13, color:'rgba(255,255,255,0.85)' }}>
              {label}: <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* ── Water & Best Fertilizer ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
        <div className="card">
          <div style={{ fontSize:20, marginBottom:8 }}>💧</div>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:6 }}>{t('fs.water_per_acre')}</div>
          <p style={{ fontSize:13, marginBottom:8 }}>{cropData.waterPerAcre}</p>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', marginBottom:4 }}>{t('fs.irrigation_schedule')}</div>
          <p style={{ fontSize:12, color:'var(--text-muted)' }}>{cropData.irrigationSchedule}</p>
        </div>
        <div className="card" style={{ borderColor:'rgba(74,140,63,0.3)' }}>
          <div style={{ fontSize:20, marginBottom:8 }}>⭐</div>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:8, color:'var(--green-300)' }}>{t('fs.best_fert')}</div>
          <p style={{ fontSize:13, color:'var(--green-200)', lineHeight:1.6 }}>{cropData.bestFertilizerKey}</p>
        </div>
      </div>

      {/* ── Soil & Climate ── */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, marginBottom:14 }}>🌍 {t('soil.recommended_title')}</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginBottom:16 }}>
          <div style={{ background:'var(--bg-card)', border:'1.5px solid rgba(74,140,63,0.3)', borderRadius:14, padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <span style={{ fontSize:24 }}>🌍</span>
              <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>{t('soil.best_title')}</div>
            </div>
            <div style={{ fontSize:15, color:'var(--green-300)', fontWeight:700, marginBottom:8 }}>{t(`soil.content.${soilKey}`)}</div>
            <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>{t(`soil.reason.${soilKey}`)}</p>
          </div>
          <div style={{ background:'var(--bg-card)', border:'1.5px solid rgba(90,155,196,0.3)', borderRadius:14, padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <span style={{ fontSize:24 }}>🌤️</span>
              <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>{t('soil.best_climate')}</div>
            </div>
            <div style={{ fontSize:15, color:'var(--accent-blue)', fontWeight:700, marginBottom:8 }}>{t(`climate.content.${soilKey}`)}</div>
            <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>{t(`climate.reason.${soilKey}`)}</p>
          </div>
        </div>
        <div style={{ padding:'14px 18px', background:'rgba(74,140,63,0.08)', border:'1px solid rgba(74,140,63,0.2)', borderRadius:10, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:22 }}>📅</span>
          <div>
            <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>{t('soil.best_planting')}</div>
            <div style={{ fontSize:15, color:'var(--green-300)', fontWeight:700, marginTop:3 }}>{season}</div>
          </div>
        </div>
      </div>

      {/* ── Fertilizer Timing ── */}
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, marginBottom:14 }}>📅 {t('fs.fert_schedule')}</h2>
        {cropData.fertilizerTiming.map((item,i)=>(
          <div key={i} style={{ display:'flex', gap:16, background:'var(--bg-card)', borderRadius:10, padding:'12px 16px', marginBottom:8, borderLeft:'4px solid var(--green-500)' }}>
            <div style={{ minWidth:200, fontWeight:600, fontSize:13, color:'var(--green-300)', flexShrink:0 }}>{item.timeKey}</div>
            <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{item.dose}</div>
          </div>
        ))}
      </div>

      {/* ── Fertilizer Quantity Cards ── */}
      {(result.fertilizers||[]).length>0 && (
        <div style={{ marginBottom:28 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:6 }}>🧪 {t('research.fertilizer_schedule')}</h2>
          <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:18 }}>{t('research.total_for')} {acres} acres</p>
          {result.fertilizers.map((f,i)=>(
            <FertilizerRow key={i} r={f} acres={acres} />
          ))}
          <div style={{ background:'rgba(74,140,63,0.08)', border:'1px solid rgba(74,140,63,0.25)', borderRadius:'var(--radius-md)', padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
            <div>
              <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:15 }}>{t('research.total_cost')}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>{acres} acres — {result.cropName}</div>
            </div>
            <div style={{ fontSize:28, fontWeight:700, color:'var(--green-300)' }}>₹{totalCost.toLocaleString('en-IN')}</div>
          </div>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:10, lineHeight:1.7 }}>⚠️ {t('research.disclaimer')}</p>
        </div>
      )}

      {/* ── Step-by-step guide ── */}
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:26, marginBottom:6 }}>📋 {t('farmer.step_guide')}</h2>
        <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:18 }}>{t('farmer.step_guide_sub')} — {result.cropName}</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {allSteps.map((s,i)=>(
            <div key={s.key} style={{ display:'flex', gap:16, background:'var(--bg-card)', borderRadius:12, padding:'14px 18px' }}>
              <div style={{ minWidth:32, height:32, borderRadius:'50%', background:'var(--green-700)', color:'var(--green-200)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>{i+1}</div>
              <div>
                <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:4 }}>{s.title}</div>
                <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Common mistakes ── */}
      <div className="card" style={{ borderColor:'rgba(201,87,87,0.2)', marginBottom:24 }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
          ⚠️ {t('farmer.common_mistakes')}
        </h3>
        {allMistakes.map((m,i)=>(
          <div key={i} style={{ display:'flex', gap:10, fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, paddingLeft:12, borderLeft:'3px solid var(--accent-red)', marginBottom:10 }}>{m}</div>
        ))}
      </div>

      <button className="btn btn-primary btn-full" onClick={onReset} style={{ height:52, fontSize:16 }}>
        🌾 {t('farmer.plan_another')}
      </button>
    </div>
  );
}
