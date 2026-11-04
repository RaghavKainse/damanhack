import React from 'react';
import { Clock, Sun, TrendingUp, BarChart2, Flame, Snowflake, Compass, RefreshCw } from 'lucide-react';

function FullDayAnalytics({ fullDayDynamics, language }) {
  const isHi = language === 'hi';
  if (!fullDayDynamics) return null;

  const {
    drawIndex = 1,
    totalDailyDraws = 2880,
    progressPercent = 50,
    sessionName = 'सत्र विश्लेषण',
    sessionDesc = 'नियमित चक्र',
    bigPercent = 50,
    smallPercent = 50,
    oddPercent = 50,
    evenPercent = 50,
    hotDigits = [7, 8, 3],
    coldDigits = [0, 4, 9],
    modulo10 = 0,
    modulo30 = 0,
    totalRoundsAnalyzed = 100
  } = fullDayDynamics;

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.25), rgba(251, 133, 0, 0.25))',
            border: '1px solid rgba(255, 183, 3, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--neon-gold)'
          }}>
            <Clock size={22} className="pulse-badge" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {isHi ? '📊 24-घंटे का संपूर्ण दैनिक विश्लेषण (2,880 Rounds Dynamics)' : '📊 24-HOUR FULL-DAY INTRADAY DYNAMICS'}
              </h3>
              <span style={{
                background: 'rgba(255, 183, 3, 0.15)',
                color: 'var(--neon-gold)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: '1px solid rgba(255, 183, 3, 0.3)'
              }}>
                FULL DAY TRACKER
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              {isHi 
                ? 'पूरे दिन के 2,880 राउंड्स के क्रम, सत्र (Session), मीन-रिवर्शन संतुलन व PRNG चक्रों का विश्लेषण' 
                : 'Intraday session trends, 2,880 draw sequence progress & full-day equilibrium balance'}
            </p>
          </div>
        </div>

        {/* Day Draw Count */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '6px 14px',
          textAlign: 'right'
        }}>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            {isHi ? 'आज का दैनिक राउंड:' : "Today's Round:"}
          </span>
          <div className="font-mono glow-text-gold" style={{ fontSize: '1.1rem', fontWeight: 900 }}>
            #{drawIndex} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ {totalDailyDraws} ({progressPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Grid: 4 Metric Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px'
      }}>
        
        {/* 1. Active Session */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffb703', marginBottom: '6px' }}>
            <Sun size={15} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {isHi ? 'सक्रिय दैनिक सत्र' : 'Active Daily Session'}
            </span>
          </div>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
            {sessionName}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
            {sessionDesc}
          </div>
        </div>

        {/* 2. Full Day Big/Small Equilibrium */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--neon-green)', marginBottom: '6px' }}>
            <BarChart2 size={15} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {isHi ? 'दैनिक बड़ा / छोटा संतुलन' : 'Day Big/Small Ratio'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--neon-green)' }}>
              BIG: {bigPercent}%
            </span>
            <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--neon-blue)' }}>
              SMALL: {smallPercent}%
            </span>
          </div>
          {/* Ratio bar */}
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(79, 172, 254, 0.5)',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginTop: '8px'
          }}>
            <div style={{
              width: `${bigPercent}%`,
              height: '100%',
              background: 'var(--neon-green)',
              boxShadow: '0 0 8px var(--neon-green)'
            }} />
          </div>
        </div>

        {/* 3. Today's Hottest Numbers */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--neon-amber)', marginBottom: '6px' }}>
            <Flame size={15} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {isHi ? 'आज के सबसे गर्म नंबर' : "Today's Hot Numbers"}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            {hotDigits.map(d => (
              <div key={d} className={`ball-badge ${d === 0 || [2,4,6,8].includes(d) ? 'ball-red' : 'ball-green'}`} style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                {d}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px' }}>
            {isHi ? 'दिनभर में सबसे ज्यादा बार आए' : 'Maximum appearances today'}
          </div>
        </div>

        {/* 4. Today's Coldest Rebound Numbers */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--neon-cyan)', marginBottom: '6px' }}>
            <Snowflake size={15} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              {isHi ? 'रिवर्सल दबाव (ठंडे नंबर)' : 'Overdue Rebound Pull'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            {coldDigits.map(d => (
              <div key={d} className={`ball-badge ${d === 0 || [2,4,6,8].includes(d) ? 'ball-red' : 'ball-green'}`} style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                {d}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '6px' }}>
            {isHi ? 'उच्चतम वापसी (Rebound) दबाव' : 'High statistical reversion potential'}
          </div>
        </div>

      </div>

    </div>
  );
}

export default React.memo(FullDayAnalytics);
