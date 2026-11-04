import React, { useState } from 'react';
import { Activity, Flame, Snowflake } from 'lucide-react';
import { classifyNumber } from '../utils/engine';

function TrendRoadmap({ historyList, language, targetType = 'bigSmall' }) {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState('bigroad'); // 'bigroad', 'bead', 'frequency'

  if (!historyList || historyList.length === 0) {
    return null;
  }

  const isBS = targetType === 'bigSmall';
  const targetField = isBS ? 'bigSmall' : 'oddEven';

  // Convert history items (chronological: oldest to newest for roadmaps)
  const chronological = [...historyList].reverse();
  const classifiedChronological = chronological.map(item => ({
    ...classifyNumber(item.number),
    issueNumber: item.issueNumber
  }));

  // Build Big Road (大路) matrix based on targetField:
  const bigRoadColumns = [];
  let currentCol = [];
  let currentVal = null;

  classifiedChronological.forEach(item => {
    const val = item[targetField];
    if (currentVal === null) {
      currentVal = val;
      currentCol.push(item);
    } else if (val === currentVal) {
      currentCol.push(item);
    } else {
      bigRoadColumns.push(currentCol);
      currentVal = val;
      currentCol = [item];
    }
  });
  if (currentCol.length > 0) {
    bigRoadColumns.push(currentCol);
  }

  // Hot & Cold Number Frequency over sample
  const numberCounts = Array(10).fill(0);
  historyList.forEach(item => {
    const n = parseInt(item.number, 10);
    if (!isNaN(n) && n >= 0 && n <= 9) {
      numberCounts[n]++;
    }
  });

  const maxCount = Math.max(...numberCounts, 1);
  const minCount = Math.min(...numberCounts);

  // Distribution counts
  const firstCount = historyList.filter(i => {
    const c = classifyNumber(i.number);
    return isBS ? c.bigSmall === 'BIG' : c.oddEven === 'ODD';
  }).length;
  const secondCount = historyList.length - firstCount;
  const firstPercent = Math.round((firstCount / historyList.length) * 100);
  const secondPercent = 100 - firstPercent;

  const firstLabel = isBS ? (isHi ? 'बड़ा (BIG 5-9)' : 'BIG (5-9)') : (isHi ? 'विषम (ODD)' : 'ODD');
  const secondLabel = isBS ? (isHi ? 'छोटा (SMALL 0-4)' : 'SMALL (0-4)') : (isHi ? 'सम (EVEN)' : 'EVEN');

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      
      {/* Header & Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--neon-green)" />
          <h3 className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
            {isHi ? `${isBS ? 'BIG / SMALL' : 'ODD / EVEN'} पैटर्न रोडमैप एवं ट्रेंड चार्ट` : `${isBS ? 'BIG / SMALL' : 'ODD / EVEN'} TREND ROADMAP`}
          </h3>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px',
          borderRadius: '10px',
          gap: '4px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('bigroad')}
            style={{
              background: activeTab === 'bigroad' ? 'rgba(0, 245, 155, 0.2)' : 'transparent',
              color: activeTab === 'bigroad' ? 'var(--neon-green)' : '#94a3b8',
              border: activeTab === 'bigroad' ? '1px solid rgba(0, 245, 155, 0.4)' : '1px solid transparent',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isHi ? 'बिग रोड (ड्रैगन स्ट्रीक)' : 'Big Road (Dragon Streak)'}
          </button>

          <button
            onClick={() => setActiveTab('bead')}
            style={{
              background: activeTab === 'bead' ? 'rgba(0, 242, 254, 0.2)' : 'transparent',
              color: activeTab === 'bead' ? 'var(--neon-cyan)' : '#94a3b8',
              border: activeTab === 'bead' ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid transparent',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isHi ? 'बीड प्लेट (क्रम)' : 'Bead Plate (Grid)'}
          </button>

          <button
            onClick={() => setActiveTab('frequency')}
            style={{
              background: activeTab === 'frequency' ? 'rgba(255, 183, 3, 0.2)' : 'transparent',
              color: activeTab === 'frequency' ? 'var(--neon-gold)' : '#94a3b8',
              border: activeTab === 'frequency' ? '1px solid rgba(255, 183, 3, 0.4)' : '1px solid transparent',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isHi ? 'संख्या आवृत्ति (0-9)' : 'Hot & Cold (0-9)'}
          </button>
        </div>
      </div>

      {/* Target Balance Distribution Bar */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '16px',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '6px' }}>
          <span style={{ color: isBS ? 'var(--neon-green)' : 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {firstLabel}: {firstCount} ({firstPercent}%)
          </span>
          <span style={{ color: isBS ? 'var(--neon-blue)' : 'var(--neon-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {secondLabel}: {secondCount} ({secondPercent}%)
          </span>
        </div>

        {/* Dual Bar */}
        <div style={{
          width: '100%',
          height: '10px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
          display: 'flex'
        }}>
          <div style={{
            width: `${firstPercent}%`,
            background: isBS ? 'linear-gradient(90deg, #00f59b, #00a86b)' : 'linear-gradient(90deg, #00f2fe, #4facfe)',
            boxShadow: isBS ? '0 0 10px rgba(0, 245, 155, 0.5)' : '0 0 10px rgba(0, 242, 254, 0.5)'
          }} />
          <div style={{
            width: `${secondPercent}%`,
            background: isBS ? 'linear-gradient(90deg, #4facfe, #0072ff)' : 'linear-gradient(90deg, #ffb703, #fb8500)',
            boxShadow: isBS ? '0 0 10px rgba(79, 172, 254, 0.5)' : '0 0 10px rgba(255, 183, 3, 0.5)'
          }} />
        </div>
      </div>

      {/* TAB 1: Big Road Dragon Spotter */}
      {activeTab === 'bigroad' && (
        <div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>
            {isHi 
              ? `बिग रोड: जब तक एक ही परिणाम (${isBS ? 'Big या Small' : 'Odd या Even'}) रहता है, वह नीचे जुड़ता है (ड्रैगन)। बदलने पर नया कॉलम शुरू होता है।` 
              : 'Big Road: Consecutive identical outcomes drop down in the same column (Dragon). Swaps create a new column.'}
          </p>
          <div className="big-road-grid">
            {bigRoadColumns.map((col, colIdx) => (
              <React.Fragment key={colIdx}>
                {col.map((cell, rowIdx) => {
                  const isFirst = isBS ? cell.bigSmall === 'BIG' : cell.oddEven === 'ODD';
                  const letter = isBS ? (cell.bigSmall === 'BIG' ? 'B' : 'S') : (cell.oddEven === 'ODD' ? 'O' : 'E');
                  return (
                    <div
                      key={rowIdx}
                      className="big-road-cell"
                      style={{
                        gridRow: Math.min(rowIdx + 1, 6),
                        borderColor: isBS 
                          ? (isFirst ? 'var(--neon-green)' : 'var(--neon-blue)')
                          : (isFirst ? '#00f2fe' : '#ffb703'),
                        color: isBS 
                          ? (isFirst ? 'var(--neon-green)' : 'var(--neon-blue)')
                          : (isFirst ? '#00f2fe' : '#ffb703'),
                        background: isBS 
                          ? (isFirst ? 'rgba(0, 245, 155, 0.15)' : 'rgba(79, 172, 254, 0.15)')
                          : (isFirst ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 183, 3, 0.12)')
                      }}
                      title={`Period: ${cell.issueNumber} | ${cell.bigSmall} / ${cell.oddEven} (${cell.number})`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Bead Plate Grid */}
      {activeTab === 'bead' && (
        <div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>
            {isHi 
              ? 'बीड प्लेट: पिछले परिणामों का समय अनुसार क्रम (ऊपर से नीचे, बाएं से दाएं)' 
              : 'Bead Plate: Chronological draw results mapped vertically top-to-bottom, left-to-right'}
          </p>
          <div className="bead-grid">
            {classifiedChronological.map((item, idx) => (
              <div
                key={idx}
                className={`bead-cell ${
                  item.isMixed
                    ? (item.number === 0 ? 'ball-violet-red' : 'ball-violet-green')
                    : (item.color === 'green' ? 'ball-green' : 'ball-red')
                }`}
                title={`Period: ${item.issueNumber} | Num: ${item.number} | ${item.bigSmall} | ${item.oddEven}`}
              >
                {item.number}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Hot & Cold Number Matrix (0 - 9) */}
      {activeTab === 'frequency' && (
        <div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '12px' }}>
            {isHi ? 'संख्या आवृत्ति (0-9): कौन सी संख्या सबसे ज्यादा या कम आ रही है' : 'Number Frequency (0-9): Hot and cold numbers based on recent draw history'}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '10px'
          }}>
            {numberCounts.map((count, num) => {
              const isHot = count === maxCount && count > 0;
              const isCold = count === minCount;
              const isNumBig = num >= 5;

              return (
                <div
                  key={num}
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '12px',
                    padding: '12px 8px',
                    textAlign: 'center',
                    border: isHot 
                      ? '1px solid rgba(255, 51, 102, 0.6)' 
                      : (isCold ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid var(--border-subtle)'),
                    boxShadow: isHot ? '0 0 12px rgba(255, 51, 102, 0.25)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                    <div className={`ball-badge ${num % 2 !== 0 ? 'ball-green' : 'ball-red'}`} style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>
                      {num}
                    </div>
                  </div>

                  <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                    {count} <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>hits</span>
                  </div>

                  <div style={{ marginTop: '4px' }}>
                    {isHot && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--neon-red)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <Flame size={10} /> HOT
                      </span>
                    )}
                    {isCold && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--neon-cyan)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <Snowflake size={10} /> COLD
                      </span>
                    )}
                    {!isHot && !isCold && (
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                        {isNumBig ? 'BIG' : 'SMALL'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default React.memo(TrendRoadmap);
