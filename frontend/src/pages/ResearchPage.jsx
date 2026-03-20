import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fertilizerAPI, cropAPI, recommendationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function NPKChip({ label, value, type }) {
  const colors = { n: 'npk-n', p: 'npk-p', k: 'npk-k' };
  return <span className={`npk-chip ${colors[type]}`}>{label} {value}%</span>;
}

function FertilizerCard({ fertilizer, selected, onClick }) {
  return (
    <div onClick={() => onClick(fertilizer)} style={{
      background: selected ? 'rgba(74,140,63,0.1)' : 'var(--bg-card)',
      border: `1.5px solid ${selected ? 'var(--green-500)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)', padding: '16px 18px', cursor: 'pointer', transition: 'all 0.2s',
    }}>
      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{fertilizer.name}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{fertilizer.type}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <NPKChip label="N" value={fertilizer.nitrogenPct} type="n" />
        <NPKChip label="P" value={fertilizer.phosphorusPct} type="p" />
        <NPKChip label="K" value={fertilizer.potassiumPct} type="k" />
      </div>
    </div>
  );
}

function FertilizerDetail({ fertilizer }) {
  const { t } = useTranslation();
  if (!fertilizer) return null;
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ background: 'linear-gradient(135deg, #2d5a2d, #1e3a1e)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 4 }}>{fertilizer.name}</div>
        <div style={{ color: 'var(--green-200)', fontSize: 13, marginBottom: 14 }}>{fertilizer.type} · NPK: {fertilizer.nitrogenPct}% N, {fertilizer.phosphorusPct}% P, {fertilizer.potassiumPct}% K</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <NPKChip label="N" value={fertilizer.nitrogenPct} type="n" />
          <NPKChip label="P" value={fertilizer.phosphorusPct} type="p" />
          <NPKChip label="K" value={fertilizer.potassiumPct} type="k" />
        </div>
      </div>
      {[
        { label: t('fert.how_it_works'), value: fertilizer.howItWorks, icon: '🔬' },
        { label: t('fert.best_soil'), value: fertilizer.bestSoil, icon: '🌍' },
        { label: t('fert.optimal_ph'), value: fertilizer.optimalPh, icon: '⚗️' },
        { label: t('fert.dosage'), value: fertilizer.dosageInstruction, icon: '⚖️' },
        { label: t('fert.timing'), value: fertilizer.timing, icon: '📅' },
        { label: t('fert.storage'), value: fertilizer.storageInstruction, icon: '📦' },
        { label: t('fert.cost_level'), value: fertilizer.costLevel, icon: '💰' },
      ].map(({ label, value, icon }) => (
        <div key={label} style={{ display: 'flex', gap: 20, padding: '14px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
          <span style={{ minWidth: 130, color: 'var(--text-muted)', fontWeight: 500 }}>{icon} {label}</span>
          <span style={{ color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>{value || '—'}</span>
        </div>
      ))}
      {fertilizer.bestForCrops && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{t('fert.best_for')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {fertilizer.bestForCrops.split(',').map(crop => (
              <span key={crop} className="badge badge-green" style={{ fontSize: 12 }}>{crop.trim()}</span>
            ))}
          </div>
        </div>
      )}
      {fertilizer.environmentalImpact && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{t('fert.env_impact')}</div>
          <div style={{ padding: '14px 18px', background: 'rgba(74,140,63,0.06)', borderLeft: '3px solid var(--green-500)', borderRadius: '0 8px 8px 0', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {fertilizer.environmentalImpact}
          </div>
        </div>
      )}
    </div>
  );
}

// Farmer field dose calculator
// Base doses per hectare (kg/ha) — standard agronomic values
const BASE_DOSES_PER_HECTARE = {
  'Urea': {
    kg: 150, costPerKg: 6,
    whyBest: 'Highest nitrogen content (46% N) — best for rapid leafy growth and green color. Most cost-effective nitrogen source.',
    sideEffects: ['Soil acidification over time if overused', 'Ammonia volatilization causes nitrogen loss', 'Can burn roots if applied too close to plants', 'Increases pest/disease pressure if overused'],
    precautions: ['Never apply near seeds — maintain 5cm gap', 'Apply in the evening to reduce volatilization', 'Water immediately after application', 'Split into 2-3 doses — never apply all at once', 'Test soil pH annually — add lime if below 6.0'],
  },
  'DAP (Di-ammonium Phosphate)': {
    kg: 100, costPerKg: 27,
    whyBest: 'Best phosphorus source for root development and flowering. Ideal as basal dose before planting.',
    sideEffects: ['Can block zinc and iron uptake if overused', 'Raises soil pH in acidic soils', 'Phosphorus runoff causes water body eutrophication'],
    precautions: ['Mix into soil 5-10cm deep before planting', 'Do not mix with urea — apply separately', 'Avoid overdose on alkaline soils (pH > 7.5)', 'Use soil test to confirm phosphorus deficiency first'],
  },
  'NPK 20-20-20': {
    kg: 200, costPerKg: 35,
    whyBest: 'Perfectly balanced for all-round crop health. Best choice when unsure — covers all 3 major nutrients equally.',
    sideEffects: ['Salt buildup in soil with prolonged use', 'Can cause nutrient imbalance if soil already has excess of one nutrient'],
    precautions: ['Dissolve in water for foliar spray — 5g per liter', 'Do not exceed recommended dose', 'Take a break every 3rd crop cycle — use organic alternatives'],
  },
  'Vermicompost': {
    kg: 2500, costPerKg: 8,
    whyBest: 'Best organic option — improves soil structure, adds beneficial microbes, and provides slow-release nutrients. Ideal for long-term soil health.',
    sideEffects: ['Pathogen risk if not fully composted', 'Weed seeds may be present in raw material', 'Very slow release — not for emergency correction'],
    precautions: ['Use only fully composted material (dark, earthy smell)', 'Store in shade with 30-40% moisture', 'Combine with targeted fertilizers for deficient soils', 'Check for foul smell — sign of incomplete composting'],
  },
  'Neem Cake': {
    kg: 200, costPerKg: 18,
    whyBest: 'Dual-action — fertilizes AND repels soil pests and nematodes naturally. Excellent for pest-prone crops.',
    sideEffects: ['Strong odor during application', 'May temporarily reduce soil pH', 'Can inhibit germination if applied too close to seeds'],
    precautions: ['Mix into soil 2 weeks before sowing', 'Keep away from germinating seeds', 'Store in dry place — moisture causes mold', 'Use gloves during handling'],
  },
  'MOP / KCl (Muriate of Potash)': {
    kg: 60, costPerKg: 17,
    whyBest: 'Best potassium source for fruit quality, disease resistance, and drought tolerance. Essential for fruiting crops.',
    sideEffects: ['Chloride toxicity in sensitive crops (beans, grapes)', 'Increases soil salinity with heavy use', 'Can compete with calcium and magnesium uptake'],
    precautions: ['Avoid on salt-sensitive crops', 'Do not use on saline/waterlogged soils', 'Apply in split doses for sandy soils', 'Monitor soil EC (electrical conductivity) annually'],
  },
  'SSP (Single Super Phosphate)': {
    kg: 250, costPerKg: 12,
    whyBest: 'Provides phosphorus + sulfur together. Best for legumes, oilseeds, and sulfur-deficient soils. Most affordable phosphate.',
    sideEffects: ['Contains fluoride as impurity — avoid excess', 'Slow to dissolve in dry soil', 'Risk of phosphorus fixation in acidic soils'],
    precautions: ['Apply as basal dose and mix well into soil', 'Avoid contact with alkaline materials like lime', 'Do not store in damp conditions — cakes up'],
  },
  'CAN (Calcium Ammonium Nitrate)': {
    kg: 120, costPerKg: 20,
    whyBest: 'Best nitrogen source for fruiting crops — provides calcium to prevent blossom end rot in tomato/capsicum while feeding nitrogen.',
    sideEffects: ['Excess nitrogen causes vegetative growth at expense of fruits', 'Oxidizer — fire risk if stored near combustibles', 'Leaching risk on sandy soils in heavy rain'],
    precautions: ['Store away from flammable materials', 'Apply in split doses every 3 weeks', 'Avoid on waterlogged soils', 'Do not mix with ammonium fertilizers'],
  },
  'Cow Dung Compost': {
    kg: 5000, costPerKg: 3,
    whyBest: 'Most affordable soil amendment. Dramatically improves water retention in sandy soils and drainage in clay soils. Adds millions of beneficial microbes.',
    sideEffects: ['Fresh manure burns plants and spreads pathogens', 'Weed seeds if poorly composted', 'Methane emissions during decomposition'],
    precautions: ['Use only well-composted (minimum 3 months old)', 'Never apply fresh cow dung near roots', 'Compost should be dark brown, crumbly, and odorless', 'Wear gloves and wash hands after handling'],
  },
  'Zinc Sulphate': {
    kg: 25, costPerKg: 45,
    whyBest: 'Corrects zinc deficiency — the most common micronutrient deficiency in Indian soils. Essential for enzyme function and grain filling.',
    sideEffects: ['Excess zinc is toxic to soil organisms and plants', 'Can reduce iron and manganese uptake'],
    precautions: ['Use only when deficiency symptoms appear (yellowing between leaf veins)', 'Do NOT mix with phosphatic fertilizers', 'Soil application: 25 kg/ha; foliar: 0.5g/liter only', 'Get soil test before applying'],
  },
};

function FertilizerRow({ r, calculated }) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const extra = BASE_DOSES_PER_HECTARE[Object.keys(BASE_DOSES_PER_HECTARE).find(k =>
    r.name?.includes(k.split(' ')[0]) || k.includes(r.name?.split(' ')[0])
  )] || {};

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
      padding: '18px 20px', marginBottom: 16,
      borderLeft: `4px solid ${r.priority === 'PRIMARY' ? 'var(--green-400)' : r.priority === 'SECONDARY' ? 'var(--accent-yellow)' : 'var(--accent-blue)'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{r.name}</div>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, fontWeight: 600, marginTop: 4, display: 'inline-block',
            background: r.priority === 'PRIMARY' ? 'rgba(74,140,63,0.2)' : 'rgba(212,168,67,0.15)',
            color: r.priority === 'PRIMARY' ? 'var(--green-300)' : 'var(--accent-yellow)',
          }}>{r.priority}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green-300)' }}>{r.totalKg} kg</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>total for {calculated.acres} acres</div>
        </div>
      </div>

      {extra.whyBest && (
        <div style={{ background: 'rgba(74,140,63,0.07)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--green-200)', lineHeight: 1.6 }}>
          ✅ <strong>{t('research.why_this')}:</strong> {extra.whyBest}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { label: t('research.per_acre'), value: `${r.perAcre} kg/acre`, icon: '📏' },
          { label: t('research.est_cost'), value: `₹${r.estimatedCost.toLocaleString('en-IN')}`, icon: '💰' },
          { label: t('research.bags_50'), value: `${r.bags50kg} bags`, icon: '🛄' },
          { label: t('research.bags_25'), value: `${r.bags25kg} bags`, icon: '🛍️' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{icon} {label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
          </div>
        ))}
      </div>

      <button onClick={() => setShowMore(!showMore)} style={{
        background: 'transparent', border: '1px solid var(--border)', borderRadius: 8,
        padding: '7px 14px', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)', width: '100%', textAlign: 'left',
      }}>
        {showMore ? '▲ Hide' : '▼ Show'} Side Effects & Precautions
      </button>

      {showMore && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {extra.sideEffects?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{`⚠️ ${t('research.side_effects')}`}</div>
              {extra.sideEffects.map((s, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 10, borderLeft: '3px solid var(--accent-red)' }}>{s}</div>
              ))}
            </div>
          )}
          {extra.precautions?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-yellow)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{`🛡️ ${t('research.precautions')}`}</div>
              {extra.precautions.map((p, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent-yellow)', fontWeight: 700 }}>•</span>{p}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function FarmerFieldCalculator({ fertilizers, cropName }) {
  const { t } = useTranslation();
  const [landAcres, setLandAcres] = useState('');
  const [soilType, setSoilType] = useState('loamy');
  const [calculated, setCalculated] = useState(null);

  // 1 acre = 0.4047 hectares
  const acreToHectare = 0.4047;

  const soilMultipliers = {
    loamy: 1.0,
    sandy: 1.3,   // Sandy needs more — drains faster
    clay: 0.8,    // Clay retains more
    red: 1.1,     // Red soil slightly deficient
  };

  const calculate = () => {
    if (!landAcres || isNaN(landAcres) || landAcres <= 0) {
      toast.error('Please enter a valid land area');
      return;
    }
    const hectares = parseFloat(landAcres) * acreToHectare;
    const multiplier = soilMultipliers[soilType] || 1.0;

    const results = fertilizers.slice(0, 5).map(f => {
      const baseName = Object.keys(BASE_DOSES_PER_HECTARE).find(k =>
        f.fertilizerName?.includes(k.split(' ')[0]) || k.includes(f.fertilizerName?.split(' ')[0])
      ) || f.fertilizerName;

      const base = BASE_DOSES_PER_HECTARE[baseName] || { kg: 100, unit: 'kg', costPerKg: 20 };
      const totalKg = Math.round(base.kg * hectares * multiplier);
      const bags50kg = Math.ceil(totalKg / 50);
      const bags25kg = Math.ceil(totalKg / 25);
      const estimatedCost = Math.round(totalKg * base.costPerKg);

      return {
        name: f.fertilizerName,
        priority: f.priority,
        totalKg,
        bags50kg,
        bags25kg,
        estimatedCost,
        perAcre: Math.round(base.kg * acreToHectare * multiplier),
      };
    });

    setCalculated({ results, hectares: hectares.toFixed(2), acres: landAcres });
  };

  return (
    <div style={{ marginTop: 24 }}>
      {/* Farmer mode banner */}
      <div style={{
        background: 'linear-gradient(135deg, #3a2800, #2a1e00)',
        border: '1px solid rgba(212,168,67,0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 28 }}>🚜</span>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--accent-yellow)', fontSize: 15 }}>{t('research.farmer_mode')}</div>
          <div style={{ fontSize: 12, color: 'rgba(212,168,67,0.7)', marginTop: 2 }}>
            {t('research.farmer_mode_sub')} for {cropName}
          </div>
        </div>
      </div>

      {/* Input fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div className="form-group">
          <label className="form-label">{t('research.land_acres')}</label>
          <input
            type="number"
            className="form-input"
            placeholder="e.g. 2.5"
            value={landAcres}
            min="0.1"
            step="0.1"
            onChange={e => { setLandAcres(e.target.value); setCalculated(null); }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">{t('research.soil_type')}</label>
          <select className="form-input" value={soilType} onChange={e => { setSoilType(e.target.value); setCalculated(null); }}>
            <option value="loamy">{t('soil.select.loamy')}</option>
            <option value="sandy">{t('soil.select.sandy')}</option>
            <option value="clay">{t('soil.select.clay')}</option>
            <option value="red">{t('soil.select.red')}</option>
          </select>
        </div>
      </div>

      <button className="btn btn-primary btn-full" onClick={calculate} style={{ height: 48, fontSize: 15, marginBottom: 20, background: '#c4961a' }}>
        🧮 {t('research.calculate')}
      </button>

      {/* Results */}
      {calculated && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          {/* Summary */}
          <div style={{
            background: 'rgba(212,168,67,0.08)',
            border: '1px solid rgba(212,168,67,0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            marginBottom: 16,
            fontSize: 13,
            color: 'var(--accent-yellow)',
          }}>
            📐 {calculated.acres} acres = {calculated.hectares} hectares · Soil adjustment applied for {soilType} soil
          </div>

          {/* Per fertilizer breakdown */}
          {calculated.results.map((r, i) => (
            <FertilizerRow key={i} r={r} calculated={calculated} />
          ))}

          {/* Total cost */}
          <div style={{
            background: 'rgba(74,140,63,0.08)',
            border: '1px solid rgba(74,140,63,0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{t('research.total_cost')}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>For {calculated.acres} acres of {cropName}</div>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--green-300)' }}>
              ₹{calculated.results.reduce((sum, r) => sum + r.estimatedCost, 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            ⚠️ {t('research.disclaimer')}
          </div>
        </div>
      )}
    </div>
  );
}

const GROWING_INSTRUCTIONS = {
  POTS: {
    icon: '🪴',
    title: 'How to Grow in Pots / Containers',
    steps: [
      { step: 1, title: 'Choose the Right Pot', desc: 'Pick a pot at least 12 inches deep for vegetables, 6 inches for herbs. Always ensure drainage holes at the bottom — no drainage = root rot.' },
      { step: 2, title: 'Prepare the Potting Mix', desc: 'Mix 60% potting soil + 20% vermicompost + 20% cocopeat. Never use plain garden soil in pots — it compacts and suffocates roots.' },
      { step: 3, title: 'Sowing / Planting', desc: 'Sow seeds 1-2cm deep or transplant seedlings gently. Water lightly after planting. Keep in shade for 2-3 days before moving to sunlight.' },
      { step: 4, title: 'Placement', desc: 'Place where the plant gets required sunlight (check the sunlight info above). South/west-facing balconies get the most sun in India.' },
      { step: 5, title: 'Watering', desc: 'Check daily — pots dry out faster than ground soil. Push finger 1 inch into soil — water only when it feels dry. Avoid waterlogging.' },
      { step: 6, title: 'Fertilizing', desc: 'Start fertilizing 2-3 weeks after planting. Use the fertilizers listed below at 1/4 of field dose. Apply every 2-3 weeks during growing season.' },
      { step: 7, title: 'Harvesting', desc: 'Harvest regularly to encourage more production. Do not let fruits/leaves overgrow — it signals the plant to stop producing.' },
    ],
    tips: ['Repot into a larger pot when roots start coming out of drainage holes', 'Group pots together to maintain humidity', 'Rotate pots every week for even sunlight exposure'],
    mistakes: ['Using pots without drainage holes', 'Overwatering — check before you water', 'Using garden soil instead of potting mix', 'Not fertilizing after 4 weeks'],
  },
  GARDEN_BED: {
    icon: '🌿',
    title: 'How to Grow in a Garden Bed',
    steps: [
      { step: 1, title: 'Choose the Spot', desc: 'Pick a spot that gets 6-8 hours of direct sunlight. Avoid areas near large trees — tree roots will compete for nutrients.' },
      { step: 2, title: 'Prepare the Soil', desc: 'Dig the bed 12 inches deep. Remove stones and weeds. Mix in 2-3 kg of compost per square meter. Let it rest for 1 week before planting.' },
      { step: 3, title: 'Test Soil pH', desc: 'Ideal pH is 6.0-7.0 for most vegetables. Add lime to raise pH (acidic soil) or sulfur to lower pH (alkaline soil). pH testing kits available at nurseries.' },
      { step: 4, title: 'Sowing / Planting', desc: 'Follow spacing instructions for each crop. Plant in rows for easy maintenance. Sow seeds at 2x their diameter depth.' },
      { step: 5, title: 'Mulching', desc: 'Cover soil with dry leaves, straw, or coco peat (2-3 inch layer). Mulch retains moisture, suppresses weeds, and keeps roots cool.' },
      { step: 6, title: 'Watering', desc: 'Water at the base of plants — never on leaves. Water in the morning. 2-3 times per week in normal weather, daily in peak summer.' },
      { step: 7, title: 'Apply Fertilizers', desc: 'Apply basal dose (DAP/SSP/Compost) before planting by mixing into soil. Top-dress with urea/NPK every 3 weeks during growth.' },
      { step: 8, title: 'Weed Control', desc: 'Remove weeds by hand every week — they compete for nutrients. Mulching greatly reduces weeding effort.' },
    ],
    tips: ['Make raised rows (beds) for better drainage in heavy rainfall areas', 'Plant companion crops (marigold near vegetables) to repel pests naturally', 'Mark rows with sticks and crop name + planting date'],
    mistakes: ['Not digging deep enough before planting', 'Planting in shade', 'Watering on leaves — causes fungal disease', 'Skipping mulching'],
  },
  RAISED_BED: {
    icon: '🧱',
    title: 'How to Grow in Raised Beds / Grow Bags',
    steps: [
      { step: 1, title: 'Set Up the Raised Bed', desc: 'For wooden planter: minimum 12 inches height. For grow bags: use 15-25 liter bags for vegetables, 5-10 liter for herbs. Place on a flat surface.' },
      { step: 2, title: 'Fill with Growing Medium', desc: 'Fill with: 40% garden soil + 30% compost + 20% cocopeat + 10% perlite. This mix drains well and holds nutrients. Never use only garden soil.' },
      { step: 3, title: 'Irrigation Setup', desc: 'Raised beds dry out faster. Consider drip irrigation or self-watering setup. Check moisture daily in summer.' },
      { step: 4, title: 'Planting', desc: 'You can plant closer than ground beds since soil is fresh and fertile. Follow half the recommended spacing for maximum yield.' },
      { step: 5, title: 'Fertilizing', desc: 'Apply 1/2 field dose since growing medium already has compost. Top-dress with NPK 20-20-20 every 3 weeks. Add vermicompost monthly.' },
      { step: 6, title: 'Pest Management', desc: 'Raised beds naturally have fewer soil pests. Inspect weekly. Use neem oil spray (5ml per liter water) for common pests.' },
      { step: 7, title: 'Refresh Soil Annually', desc: 'After each crop cycle, add fresh compost (2-3 kg) and mix it in. This replenishes nutrients for the next crop.' },
    ],
    tips: ['Line wooden raised beds with plastic sheet to prevent rotting', 'Install trellis for climbing crops (cucumber, beans) at the time of planting', 'Grow bags can be moved — shift to follow sunlight'],
    mistakes: ['Filling only with garden soil — becomes hard over time', 'Not refreshing soil between crops', 'Overplanting — crowded plants compete and yield less', 'Forgetting to water daily in summer'],
  },
  INDOORS: {
    icon: '🏠',
    title: 'How to Grow Indoors',
    steps: [
      { step: 1, title: 'Find the Right Spot', desc: 'Place near a south or west-facing window that gets 4-6 hours of sunlight. A windowsill, kitchen counter, or well-lit shelf works. If natural light is low, use a grow light (LED, 12-14 hrs/day).' },
      { step: 2, title: 'Choose the Right Container', desc: 'Use containers with drainage holes. Place a saucer underneath to collect water. For herbs: 6-inch pots. For small vegetables (chilli, cherry tomato): 10-12 inch pots.' },
      { step: 3, title: 'Use Indoor Potting Mix', desc: 'Mix 50% potting soil + 30% cocopeat + 20% perlite. This drains well and prevents root rot — the biggest indoor plant killer.' },
      { step: 4, title: 'Temperature & Humidity', desc: 'Most plants prefer 18-30°C indoors. Keep away from AC vents and heaters. Mist leaves lightly every 2-3 days in dry weather to maintain humidity.' },
      { step: 5, title: 'Watering Indoors', desc: 'Water less than outdoor plants — indoor soil stays moist longer. Water only when top 1 inch is dry. Use room temperature water, not cold water directly from tap.' },
      { step: 6, title: 'Fertilizing Indoors', desc: 'Use very diluted fertilizer — 1/8th of outdoor dose. Liquid NPK (2ml per liter) every 3 weeks. Overfeeding causes salt buildup and brown leaf tips.' },
      { step: 7, title: 'Air Circulation', desc: 'Open windows daily for at least 1 hour. Good air circulation prevents fungal diseases and strengthens stems. Gently fan the plant if room is very closed.' },
      { step: 8, title: 'Harvesting', desc: 'Harvest leaves regularly (herbs especially) to encourage bushy growth. Pick outer leaves first, leaving center to grow.' },
    ],
    tips: ['Wipe dusty leaves with a damp cloth monthly — dust blocks sunlight absorption', 'Rotate pot 180° every week for even growth', 'Group plants together to create a microclimate with higher humidity', 'Use white walls/reflective surfaces to boost light'],
    mistakes: ['Placing in dark corners — plants stretch and weaken', 'Overwatering — the #1 indoor plant killer', 'Using outdoor soil — it compacts and harbors pests', 'Cold water directly from tap — shocks roots'],
  },
};


function GrowingGuide({ spaceType, t }) {
  const guide = GROWING_INSTRUCTIONS[spaceType];
  if (!guide) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
        {guide.icon} {guide.title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {(guide.steps || []).map((s) => (
          <div key={s.step} style={{ display: 'flex', gap: 14, background: 'var(--bg-card)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ minWidth: 28, height: 28, borderRadius: '50%', background: 'var(--green-700)', color: 'var(--green-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{s.step}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 3 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      {guide.tips?.length > 0 && (
        <div style={{ background: 'rgba(74,140,63,0.07)', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green-300)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>💡 {t('research.pro_tips')}</div>
          {guide.tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--green-400)' }}>✓</span>{tip}
            </div>
          ))}
        </div>
      )}
      {guide.mistakes?.length > 0 && (
        <div style={{ background: 'rgba(201,87,87,0.06)', borderRadius: 10, padding: '14px 16px', borderLeft: '3px solid var(--accent-red)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>⚠️ {t('research.common_mistakes')}</div>
          {guide.mistakes.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-red)' }}>✗</span>{m}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function CropAdvicePanel({ crop, onClose, user }) {
  const { t } = useTranslation();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [spaceType, setSpaceType] = useState('POTS');

  const SPACE_OPTIONS = [
    { value: 'POTS', label: '🪴 Pots', desc: 'Balcony / Terrace' },
    { value: 'GARDEN_BED', label: '🌿 Garden Bed', desc: 'Front yard / Side strip' },
    { value: 'RAISED_BED', label: '🧱 Raised Bed', desc: 'Grow bag / Planter box' },
    { value: 'INDOORS', label: '🏠 Indoors', desc: 'Kitchen / Windowsill' },
    { value: 'FARM_FIELD', label: '🚜 Farmer Field', desc: 'Large outdoor acreage' },
  ];

  const isFarmerMode = spaceType === 'FARM_FIELD';

  const getAdvice = async () => {
    setLoading(true);
    try {
      const apiCall = user ? recommendationAPI.get : recommendationAPI.getPublic;
      const res = await apiCall({
        cropName: crop.name,
        spaceType: isFarmerMode ? 'GARDEN_BED' : spaceType,
        soilType: '',
        location: '',
        additionalNotes: isFarmerMode ? 'farmer_field' : '',
      });
      setRecommendation(res.data);
    } catch (err) {
      toast.error('Failed to get recommendation. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 700, maxHeight: '92vh', overflowY: 'auto', padding: 32 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{crop.iconEmoji || '🌿'}</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{crop.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{crop.category} · {crop.difficultyLevel}</p>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, fontFamily: 'var(--font-body)' }}>✕</button>
        </div>

        {/* Crop quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { icon: '⏱', label: 'Harvest', value: (crop.daysToHarvest || '—') + ' days' },
            { icon: '☀️', label: 'Sunlight', value: crop.sunlightRequirement || '—' },
            { icon: '💧', label: 'Water', value: crop.waterRequirement || '—' },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Space type selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t('research.where_grow')}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {SPACE_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => { setSpaceType(opt.value); setRecommendation(null); }} style={{
                padding: '10px 16px', borderRadius: 20,
                border: `1.5px solid ${spaceType === opt.value
                  ? opt.value === 'FARM_FIELD' ? 'var(--accent-yellow)' : 'var(--green-500)'
                  : 'var(--border)'}`,
                background: spaceType === opt.value
                  ? opt.value === 'FARM_FIELD' ? 'rgba(212,168,67,0.12)' : 'rgba(74,140,63,0.15)'
                  : 'var(--bg-card)',
                color: spaceType === opt.value
                  ? opt.value === 'FARM_FIELD' ? 'var(--accent-yellow)' : 'var(--green-300)'
                  : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <span style={{ fontSize: 13 }}>{opt.label}</span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FARMER FIELD MODE — show field calculator directly */}
        {isFarmerMode ? (
          <>
            {!recommendation ? (
              <button className="btn btn-full" onClick={getAdvice} disabled={loading} style={{
                height: 50, fontSize: 15, marginBottom: 4,
                background: '#c4961a', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              }}>
                {loading ? <><span className="spinner" /> {t('research.getting_field')}</> : t('research.get_field_advice')}
              </button>
            ) : (
              <FarmerFieldCalculator fertilizers={recommendation.fertilizers} cropName={crop.name} />
            )}
          </>
        ) : (
          /* HOME GARDEN MODE */
          <>
            {!recommendation ? (
              <button className="btn btn-primary btn-full" onClick={getAdvice} disabled={loading} style={{ height: 50, fontSize: 15 }}>
                {loading ? <><span className="spinner" /> {t('research.getting_advice')}</> : t('research.get_fertilizer_advice')}
              </button>
            ) : (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <div style={{ background: 'linear-gradient(135deg, #2d5a2d, #1e3a1e)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 20 }}>
                  <div style={{ color: 'var(--green-200)', fontSize: 13, marginBottom: 6 }}>Growing in: {spaceType.replace('_', ' ')}</div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.7 }}>{recommendation.generalTips}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 16, marginBottom: 6 }}>💧</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t('research.watering')}</div>
                    <p style={{ fontSize: 12 }}>{recommendation.wateringSchedule}</p>
                  </div>
                  <div className="card" style={{ padding: 16 }}>
                    <div style={{ fontSize: 16, marginBottom: 6 }}>🌱</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t('research.soil_prep')}</div>
                    <p style={{ fontSize: 12 }}>{recommendation.soilPreparation}</p>
                  </div>
                </div>

                {recommendation.fertilizers?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>🧪 {t('research.fertilizer_schedule')}</div>
                    {recommendation.fertilizers.map((f, i) => (
                      <div key={i} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 10,
                        borderLeft: `4px solid ${f.priority === 'PRIMARY' ? 'var(--green-400)' : f.priority === 'SECONDARY' ? 'var(--accent-yellow)' : 'var(--accent-blue)'}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 15 }}>{f.fertilizerName}</span>
                          <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 10, fontWeight: 600,
                            background: f.priority === 'PRIMARY' ? 'rgba(74,140,63,0.2)' : 'rgba(212,168,67,0.15)',
                            color: f.priority === 'PRIMARY' ? 'var(--green-300)' : 'var(--accent-yellow)',
                          }}>{f.priority}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                          <NPKChip label="N" value={f.nitrogenPct} type="n" />
                          <NPKChip label="P" value={f.phosphorusPct} type="p" />
                          <NPKChip label="K" value={f.potassiumPct} type="k" />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                          <div>⚖️ {f.dosage}</div>
                          <div>📅 {f.timing}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {recommendation.careTips?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>💡 {t('research.care_tips')}</div>
                    {recommendation.careTips.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--green-400)' }}>✓</span>{tip}
                      </div>
                    ))}
                  </div>
                )}

                {/* Growing Instructions */}
                <GrowingGuide spaceType={spaceType} t={t} />

                <button className="btn btn-outline btn-full" onClick={() => setRecommendation(null)} style={{ marginTop: 8 }}>{t('research.change_space')}</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ResearchPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [fertilizers, setFertilizers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedFert, setSelectedFert] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [activeTab, setActiveTab] = useState('fertilizers');
  const [loading, setLoading] = useState(true);
  const [cropSearch, setCropSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [customCrop, setCustomCrop] = useState({ name: '' });

  useEffect(() => {
    Promise.all([fertilizerAPI.getAll(), cropAPI.getAll()])
      .then(([f, c]) => {
        setFertilizers(f.data);
        const validCrops = c.data.filter(crop => crop.name && crop.name.toLowerCase() !== 'rice');
        setCrops(validCrops);
        if (f.data.length > 0) setSelectedFert(f.data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ background: 'linear-gradient(135deg, #2d5a2d, #1e3a1e)', padding: '40px 20px 32px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 28 }}>🌾</span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#fff' }}>{t('research.title')}</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 20, fontSize: 15 }}>{t('research.subtitle')}</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[`${fertilizers.length} Fertilizer Types`, `${crops.length}+ Crops`, '6 Soil Types', '5 Climate Zones'].map(b => (
              <span key={b} style={{ padding: '5px 14px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 20, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '0 20px 48px' }}>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 4, marginTop: 24, marginBottom: 28, width: 'fit-content' }}>
          {[{ id: 'fertilizers', label: t('research.fertilizers') }, { id: 'crops', label: t('research.crops') }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '10px 28px', borderRadius: 10, border: 'none',
              background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
            }}>{tab.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <div className="spinner" style={{ margin: '0 auto 16px', width: 36, height: 36 }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading research data...</p>
          </div>
        ) : activeTab === 'fertilizers' ? (
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>{t('research.tap_fertilizer')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 32 }}>
              {fertilizers.map(f => <FertilizerCard key={f.id} fertilizer={f} selected={selectedFert?.id === f.id} onClick={setSelectedFert} />)}
            </div>
            {selectedFert && <FertilizerDetail fertilizer={selectedFert} />}
          </div>
        ) : (
          <div>
            {/* Search bar + Add crop button */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
                <input
                  className="form-input"
                  placeholder="Search crops — tomato, rose, tulsi, chilli..."
                  value={cropSearch}
                  onChange={e => setCropSearch(e.target.value)}
                  style={{ paddingLeft: 40, fontSize: 14 }}
                />
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  padding: '10px 18px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: showAddForm ? 'var(--green-500)' : 'var(--bg-card)',
                  border: `1.5px solid ${showAddForm ? 'var(--green-400)' : 'var(--border)'}`,
                  color: showAddForm ? '#fff' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
                }}
              >
                {showAddForm ? t('research.cancel') : t('research.add_crop')}
              </button>
            </div>

            {/* Add Custom Crop Form */}
            {showAddForm && (
              <div style={{
                background: 'var(--bg-card)', border: '1.5px solid var(--green-600)',
                borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 28,
                animation: 'fadeIn 0.3s ease',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 6 }}>🌱 {t('research.add_crop_title')}</div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                  Just enter the crop/plant name — we'll give you fertilizer advice, growing steps, care tips, and common mistakes to avoid.
                </p>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">{t('research.crop_name_label')} *</label>
                  <input className="form-input" placeholder={t('research.crop_name_placeholder')}
                    value={customCrop.name}
                    autoFocus
                    onChange={e => setCustomCrop(c => ({ ...c, name: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && customCrop.name.trim()) {
                        const crop = { id: 'custom-' + Date.now(), name: customCrop.name.trim(), category: 'Other', difficultyLevel: 'BEGINNER', iconEmoji: '🌿' };
                        setSelectedCrop(crop); setShowAddForm(false); setCustomCrop({ name: '' });
                      }
                    }}
                  />
                </div>
                <button
                  className="btn btn-primary btn-full"
                  style={{ height: 48, fontSize: 15 }}
                  disabled={!customCrop.name.trim()}
                  onClick={() => {
                    const crop = { id: 'custom-' + Date.now(), name: customCrop.name.trim(), category: 'Other', difficultyLevel: 'BEGINNER', iconEmoji: '🌿' };
                    setSelectedCrop(crop); setShowAddForm(false); setCustomCrop({ name: '' });
                  }}
                >
                  🌱 {t('research.get_advice_btn')}
                </button>
              </div>
            )}

            {/* Crop count + filter label */}
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              {cropSearch
                ? `${crops.filter(c => c.name?.toLowerCase().includes(cropSearch.toLowerCase()) || c.category?.toLowerCase().includes(cropSearch.toLowerCase())).length} results for "${cropSearch}"`
                : `${crops.length} crops available — click any to get fertilizer advice`}
            </p>

            {/* Crop grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {crops
                .filter(crop => !cropSearch ||
                  crop.name?.toLowerCase().includes(cropSearch.toLowerCase()) ||
                  crop.category?.toLowerCase().includes(cropSearch.toLowerCase()))
                .map(crop => (
                  <div key={crop.id} className="card" onClick={() => setSelectedCrop(crop)}
                    style={{ textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green-500)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{crop.iconEmoji || '🌿'}</div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{crop.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{crop.category}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12 }}>
                      {crop.daysToHarvest && <div style={{ color: 'var(--text-secondary)' }}>⏱ {crop.daysToHarvest} days</div>}
                      {crop.sunlightRequirement && <div style={{ color: 'var(--text-secondary)' }}>☀️ {crop.sunlightRequirement}</div>}
                      {crop.growingSeason && <div style={{ color: 'var(--text-secondary)' }}>📅 {crop.growingSeason}</div>}
                    </div>
                    <span style={{ display: 'inline-block', marginTop: 12, padding: '3px 12px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                      background: crop.difficultyLevel === 'BEGINNER' ? 'rgba(74,140,63,0.15)' : 'rgba(212,168,67,0.12)',
                      color: crop.difficultyLevel === 'BEGINNER' ? 'var(--green-300)' : 'var(--accent-yellow)',
                    }}>{crop.difficultyLevel || 'BEGINNER'}</span>
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--green-400)', fontWeight: 500 }}>{t('research.tap_for_advice')}</div>
                  </div>
                ))}

              {/* No results — suggest adding */}
              {cropSearch && crops.filter(c =>
                c.name?.toLowerCase().includes(cropSearch.toLowerCase()) ||
                c.category?.toLowerCase().includes(cropSearch.toLowerCase())
              ).length === 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{
                    background: 'var(--bg-card)', border: '1.5px dashed var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>
                      "{cropSearch}" {t('research.not_found')}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
                      {t('research.not_found_sub')}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setCustomCrop({ name: cropSearch });
                        setShowAddForm(true);
                        setCropSearch('');
                      }}
                    >
                      + Add "{cropSearch}" and Get Advice
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedCrop && <CropAdvicePanel crop={selectedCrop} onClose={() => setSelectedCrop(null)} user={user} />}
    </div>
  );
}
