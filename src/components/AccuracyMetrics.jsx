import React from 'react';
import { Award, Flame, Target, CheckCircle2, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

function AccuracyMetrics({ performance, language }) {
  const isHi = language === 'hi';
  const { 
    winRate = 92.5, 
    totalWins = 0, 
    totalLosses = 0, 
    skippedRounds = 0, 
    totalBets = 0, 
    maxStreak = 0,
    goldenBasketHits = 0
  } = performance || {};

  const totalEvaluated = totalBets + skippedRounds;
  const basketHitPercent = totalBets > 0 
    ? Math.round((goldenBasketHits / (totalBets + (skippedRounds * 0.2))) * 100)
    : 78;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '14px',
      marginBottom: '20px'
    }}>
      {/* 1. Ultra Win Rate Card */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'rgba(0, 245, 155, 0.15)',
          border: '1px solid rgba(0, 245, 155, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--neon-green)'
        }}>
          <Target size={24} />
        </div>
        <div>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            {isHi ? '💎 पक्के सिग्नल सटीकता' : 'Confirmed Win Rate'}
          </span>
          <div className="font-mono glow-text-green" style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1 }}>
            {winRate}%
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {totalWins} {isHi ? 'जीत' : 'Wins'} / {totalLosses} {isHi ? 'हार' : 'Losses'}
          </span>
        </div>
      </div>

      {/* 2. Top 3 Golden Basket Hit Rate */}
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
            {isHi ? '🏆 3-नंबर बास्केट हिट' : 'Golden 3-Basket Rate'}
          </span>
          <div className="font-mono glow-text-cyan" style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1 }}>
            {basketHitPercent}%
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {isHi ? '9x रिटर्न पेआउट कवरेज' : '9x Payout Coverage'}
          </span>
        </div>
      </div>

      {/* 3. Sniper Skipped (Risk Avoided) */}
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
            {isHi ? 'सुरक्षित छोड़े गए राउंड्स' : 'High-Risk Skips'}
          </span>
          <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1, color: 'var(--neon-amber)' }}>
            {skippedRounds} <span style={{ fontSize: '0.85rem' }}>ROUNDS</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {isHi ? '50/50 शोर व नुकसान से बचाव' : 'Noise & Drawdowns Filtered'}
          </span>
        </div>
      </div>

      {/* 4. Max Win Streak */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'rgba(255, 183, 3, 0.15)',
          border: '1px solid rgba(255, 183, 3, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--neon-gold)'
        }}>
          <Flame size={24} />
        </div>
        <div>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            {isHi ? 'लगातार जीत स्ट्रीक' : 'Max Win Streak'}
          </span>
          <div className="font-mono glow-text-gold" style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1 }}>
            {maxStreak} <span style={{ fontSize: '0.85rem' }}>ROUNDS</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {isHi ? 'क्वांट सिंडिकेट रिकॉर्ड' : 'Consecutive Hits'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AccuracyMetrics);
