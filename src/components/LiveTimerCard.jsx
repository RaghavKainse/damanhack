import React from 'react';
import { Clock, ShieldAlert, Zap, History } from 'lucide-react';
import { classifyNumber } from '../utils/engine';

function LiveTimerCard({ 
  currentPeriod, 
  nextPeriod, 
  remainingSeconds, 
  totalDuration = 30, 
  lastResult, 
  language 
}) {
  const isHi = language === 'hi';
  const isLocked = remainingSeconds <= 5;
  const isResetting = remainingSeconds >= totalDuration - 1;
  const progressPercent = (remainingSeconds / totalDuration) * 100;
  
  // SVG circular properties
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  let strokeColor = 'var(--neon-cyan)';
  if (remainingSeconds <= 5) {
    strokeColor = 'var(--neon-red)';
  } else if (remainingSeconds <= 10) {
    strokeColor = 'var(--neon-gold)';
  }

  const lastClassified = lastResult ? classifyNumber(lastResult.number) : null;

  return (
    <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        background: isLocked ? 'radial-gradient(circle, rgba(255,51,102,0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,242,254,0.15) 0%, transparent 70%)',
        filter: 'blur(30px)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* Left: Period & Status Info */}
        <div style={{ flex: '1 1 240px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(0, 242, 254, 0.12)',
              border: '1px solid rgba(0, 242, 254, 0.35)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--neon-cyan)',
              fontFamily: 'var(--font-mono)'
            }}>
              {isHi ? '🎯 सक्रिय बेटिंग पीरियड (Active Period)' : '🎯 ACTIVE BETTING PERIOD'}
            </span>
            <span className="font-mono glow-text-cyan" style={{ fontSize: '1.35rem', fontWeight: 900 }}>
              {currentPeriod || 'Loading...'}
            </span>
          </div>

          {lastResult && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {isHi ? '🏆 पिछला ड्रा (Last Draw):' : '🏆 Last Settled Draw:'}
              </span>
              <span className="font-mono" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                #{lastResult.issueNumber?.slice(-4)} ➔ <strong style={{ color: lastResult.color === 'green' ? 'var(--neon-green)' : 'var(--neon-red)' }}>{lastResult.number}</strong> ({lastResult.color?.toUpperCase()})
              </span>
            </div>
          )}

          {/* Phase Badge */}
          <div style={{ marginTop: '14px' }}>
            {isLocked ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 51, 102, 0.16)',
                border: '1px solid rgba(255, 51, 102, 0.5)',
                color: 'var(--neon-red)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem',
                letterSpacing: '0.5px'
              }} className="pulse-badge">
                <ShieldAlert size={16} />
                <span>{isHi ? 'बेट लॉक - ड्रा चालू है (रुके)' : 'BETS LOCKED - DRAWING RESULT'}</span>
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0, 245, 155, 0.12)',
                border: '1px solid rgba(0, 245, 155, 0.4)',
                color: 'var(--neon-green)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem'
              }}>
                <Zap size={16} />
                <span>{isHi ? 'बेटिंग ओपन - आर्डर लगाएं' : 'BETTING OPEN - PLACE ORDER'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Circular Countdown Timer */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '150px'
        }}>
          <div style={{ position: 'relative', width: '130px', height: '130px' }}>
            <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background track circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
                fill="none"
              />
              {/* Dynamic countdown stroke */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={strokeColor}
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: isResetting ? 'none' : 'stroke-dashoffset 0.95s linear, stroke 0.2s ease'
                }}
              />
            </svg>

            {/* Inner Timer Digits */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <span className="font-mono" style={{
                fontSize: '1.85rem',
                fontWeight: 900,
                color: strokeColor,
                lineHeight: 1,
                display: 'block',
                textShadow: `0 0 16px ${strokeColor}`,
                letterSpacing: '1px'
              }}>
                {String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:{String(remainingSeconds % 60).padStart(2, '0')}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>
                {isHi ? 'उलटी गिनती' : 'TIME LEFT'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Last Round Result Highlight */}
        {lastClassified && (
          <div style={{
            flex: '1 1 200px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <History size={13} /> {isHi ? 'पिछला परिणाम' : 'Last Draw Result'}
              </span>
              <span className="font-mono" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                #{lastResult?.issueNumber?.slice(-4)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Ball */}
              <div className={`ball-badge ${
                lastClassified.isMixed 
                  ? (lastClassified.number === 0 ? 'ball-violet-red' : 'ball-violet-green')
                  : (lastClassified.color === 'green' ? 'ball-green' : 'ball-red')
              }`}>
                {lastClassified.number}
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={lastClassified.oddEven === 'ODD' ? 'pill-odd' : 'pill-even'} style={{ padding: '2px 8px', fontSize: '0.75rem' }}>
                    {lastClassified.oddEven}
                  </span>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}>
                    {lastClassified.bigSmall}
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {lastClassified.colorLabel}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default React.memo(LiveTimerCard);
