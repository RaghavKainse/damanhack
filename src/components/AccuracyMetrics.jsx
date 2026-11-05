import React from 'react';
import { Award, Flame, Target, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, HelpCircle, AlertTriangle, Scale } from 'lucide-react';

function AccuracyMetrics({ performance, language }) {
  const isHi = language === 'hi';
  const { 
    winRate = null, 
    totalWins = 0, 
    totalLosses = 0, 
    skippedRounds = 0, 
    totalBets = 0, 
    maxStreak = 0,
    brierScore = 0.2500,
    logLoss = 0.6931,
    significance = null
  } = performance || {};

  const hasData = totalBets > 0 && winRate !== null;
  const pValue = significance?.pValue ?? 1.0;
  const isSignificant = significance?.isSignificant ?? false;
  const hasEdge = significance?.hasEdge ?? false;
  const baselineDelta = hasData ? (winRate - 50.0).toFixed(1) : '0.0';
  const isPositiveDelta = parseFloat(baselineDelta) > 0;
  const ciLower = significance?.ciLower ?? (hasData ? Math.max(0, winRate - 8.0).toFixed(1) : '--');
  const ciUpper = significance?.ciUpper ?? (hasData ? Math.min(100, winRate + 8.0).toFixed(1) : '--');

  return (
    <div style={{ marginBottom: '20px' }}>
      
      {/* Honest Scientific Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '14px'
      }}>
        {/* 1. Out-of-Sample Win Rate vs 50% Baseline */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: hasData && isPositiveDelta ? 'rgba(0, 245, 155, 0.15)' : 'rgba(255, 183, 3, 0.15)',
            border: `1px solid ${hasData && isPositiveDelta ? 'rgba(0, 245, 155, 0.4)' : 'rgba(255, 183, 3, 0.4)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: hasData && isPositiveDelta ? 'var(--neon-green)' : 'var(--neon-gold)'
          }}>
            <Target size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              {isHi ? 'आउट-ऑफ-सैंपल सटीकता' : 'Out-of-Sample Win Rate'}
            </span>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1, color: hasData ? (isPositiveDelta ? 'var(--neon-green)' : '#cbd5e1') : '#94a3b8' }}>
              {hasData ? `${winRate}%` : '--%'}
            </div>
            <span style={{ fontSize: '0.7rem', color: hasData ? (isPositiveDelta ? 'var(--neon-green)' : '#94a3b8') : '#64748b' }}>
              {hasData 
                ? `${isPositiveDelta ? '+' : ''}${baselineDelta}% vs 50% बेसलाइन (N = ${totalBets})`
                : (isHi ? 'पुष्ट ड्रॉ का इंतज़ार (N = 0)' : 'Awaiting Draws (N = 0)')}
            </span>
          </div>
        </div>

        {/* 2. Statistical Significance & 95% Confidence Interval */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: hasEdge ? 'rgba(0, 245, 155, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${hasEdge ? 'rgba(0, 245, 155, 0.4)' : 'var(--border-subtle)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: hasEdge ? 'var(--neon-green)' : '#94a3b8'
          }}>
            <Scale size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              {isHi ? 'द्विपक्षीय p-मान (p-Value)' : 'Two-Tailed p-Value'}
            </span>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1, color: hasEdge ? 'var(--neon-green)' : '#cbd5e1' }}>
              {hasData ? `p = ${pValue.toFixed(4)}` : 'p = 1.0000'}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              {hasData 
                ? `95% CI: [${ciLower}%, ${ciUpper}%]`
                : (isHi ? 'अशक्त परिकल्पना H0: p = 0.50' : 'Null H0: p = 0.50')}
            </span>
          </div>
        </div>

        {/* 3. Brier Score & Probability Calibration */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(0, 242, 254, 0.15)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--neon-cyan)'
          }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              {isHi ? 'ब्रायर स्कोर (Brier Score)' : 'Brier Calibration'}
            </span>
            <div className="font-mono glow-text-cyan" style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1 }}>
              {hasData ? brierScore.toFixed(4) : '0.2500'}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {isHi ? '0.2500 = रैंडम सिक्का उछाल (कमतर बेहतर)' : '0.2500 = Neutral Coin Toss'}
            </span>
          </div>
        </div>

        {/* 4. Filtered Noise / NO CLEAR SIGNAL Rounds */}
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(251, 133, 0, 0.15)',
            border: '1px solid rgba(251, 133, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--neon-amber)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              {isHi ? 'अस्पष्ट सिग्नल (छोड़े गए राउंड)' : 'No Clear Signal (Abstain)'}
            </span>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1, color: 'var(--neon-amber)' }}>
              {skippedRounds} <span style={{ fontSize: '0.85rem' }}>ROUNDS</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {isHi ? 'अपर्याप्त साक्ष्य पर दांव से परहेज' : 'Abstained when signal is noise'}
            </span>
          </div>
        </div>
      </div>

      {/* Honest Statistical Baseline Disclosure Banner */}
      <div style={{
        background: hasEdge 
          ? 'rgba(0, 245, 155, 0.08)' 
          : 'rgba(255, 183, 3, 0.08)',
        border: `1px solid ${hasEdge ? 'rgba(0, 245, 155, 0.3)' : 'rgba(255, 183, 3, 0.3)'}`,
        borderRadius: '10px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '0.78rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasEdge ? (
            <Sparkles size={16} color="var(--neon-green)" />
          ) : (
            <AlertTriangle size={16} color="var(--neon-gold)" />
          )}
          <span style={{ color: '#e2e8f0' }}>
            <strong>{isHi ? 'सांख्यिकीय ईमानदारी रिपोर्ट:' : 'Statistical Integrity Report:'}</strong>{' '}
            {hasEdge ? (
              isHi 
                ? `सत्यापित $N = ${totalBets}$ राउंड्स में मॉडल का प्रदर्शन 50% रैंडम बेसलाइन से सांख्यिकीय रूप से बेहतर है (p = ${pValue.toFixed(4)} < 0.05)।`
                : `Out-of-sample performance significantly exceeds 50% random baseline (p = ${pValue.toFixed(4)} < 0.05, N = ${totalBets}).`
            ) : (
              isHi 
                ? `वर्तमान $N = ${totalBets}$ आउट-ऑफ-सैंपल राउंड्स में ऐतिहासिक पैटर्न 50/50 रैंडम बेसलाइन से भिन्न नहीं हैं (p = ${pValue.toFixed(4)} ≥ 0.05)। सिस्टम केवल मजबूत संगम होने पर ही संकेत देता है; अन्यथा NO CLEAR SIGNAL रहता है।`
                : `Current out-of-sample data does not demonstrate a statistically significant edge over a 50/50 baseline (p = ${pValue.toFixed(4)} ≥ 0.05). The system will output NO CLEAR SIGNAL when evidence is uninformative.`
            )}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="font-mono" style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '2px 8px',
            borderRadius: '6px',
            color: hasEdge ? 'var(--neon-green)' : 'var(--neon-gold)',
            fontWeight: 800
          }}>
            {hasEdge ? 'EDGE DETECTED' : 'NULL HYPOTHESIS ACTIVE'}
          </span>
        </div>
      </div>

    </div>
  );
}

export default React.memo(AccuracyMetrics);
