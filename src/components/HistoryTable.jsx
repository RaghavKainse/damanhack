import React, { useState } from 'react';
import { Download, Search, CheckCircle, XCircle, Filter, FileSpreadsheet } from 'lucide-react';
import { classifyNumber } from '../utils/engine';

function HistoryTable({ historyLogs, language }) {
  const isHi = language === 'hi';
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'WINS', 'LOSSES', 'ODD', 'EVEN'
  const [searchQuery, setSearchQuery] = useState('');

  if (!historyLogs || historyLogs.length === 0) {
    return null;
  }

  // Filter logs
  const filtered = historyLogs.filter(log => {
    // Search query
    if (searchQuery && !log.issueNumber.includes(searchQuery)) {
      return false;
    }
    // Type filter
    if (filterType === 'WINS') return log.isWin;
    if (filterType === 'LOSSES') return !log.isWin;
    if (filterType === 'BIG') return log.actualBigSmall === 'BIG';
    if (filterType === 'SMALL') return log.actualBigSmall === 'SMALL';
    if (filterType === 'ODD') return log.actualOddEven === 'ODD';
    if (filterType === 'EVEN') return log.actualOddEven === 'EVEN';
    return true;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Period', 'Winning_Number', 'Actual_OddEven', 'Actual_BigSmall', 'Predicted_Target', 'Predicted_Number', 'Confidence', 'Verdict', 'Reason'];
    const rows = filtered.map(log => [
      log.issueNumber,
      log.number,
      log.actualOddEven,
      log.actualBigSmall,
      log.predicted,
      log.predictedNumber || '---',
      `${log.confidence}%`,
      log.action === 'SKIP' ? 'SKIPPED' : (log.isWin ? 'WIN' : 'LOSS'),
      `"${(log.pattern || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WinGo_30S_Tracked_Rounds_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
      
      {/* Table Header Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div>
          <h3 className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
            {isHi ? 'विस्तृत ड्रा हिस्ट्री एवं प्रेडिक्शन ऑडिट' : 'DRAW HISTORY & PREDICTION AUDIT LOG'}
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {isHi ? 'प्रत्येक 30 सेकंड राउंड के परिणाम और एल्गोरिदम का सटीक मिलान' : 'Audited comparison of algorithm predictions vs actual lottery results'}
          </p>
        </div>

        {/* Search & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* Search Input */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px' }} />
            <input
              type="text"
              placeholder={isHi ? 'पीरियड खोजें...' : 'Search Period...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '6px 12px 6px 30px',
                color: '#fff',
                fontSize: '0.8rem',
                outline: 'none',
                fontFamily: 'var(--font-mono)',
                width: '140px'
              }}
            />
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            <Download size={14} />
            <span>{isHi ? 'CSV डाउनलोड' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Filter Badges Bar */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '14px',
        overflowX: 'auto',
        paddingBottom: '4px'
      }}>
        {[
          { id: 'ALL', label: isHi ? 'सभी' : 'All Draws' },
          { id: 'WINS', label: isHi ? 'सटीक जीत (WINS)' : 'Wins Only' },
          { id: 'BIG', label: isHi ? 'केवल बड़ा (BIG 5-9)' : 'Big Only' },
          { id: 'SMALL', label: isHi ? 'केवल छोटा (SMALL 0-4)' : 'Small Only' },
          { id: 'ODD', label: isHi ? 'विषम (ODD)' : 'Odd Only' },
          { id: 'EVEN', label: isHi ? 'सम (EVEN)' : 'Even Only' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            style={{
              background: filterType === tab.id ? 'rgba(0, 242, 254, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              color: filterType === tab.id ? 'var(--neon-cyan)' : '#94a3b8',
              border: filterType === tab.id ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid var(--border-subtle)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.82rem',
          textAlign: 'left'
        }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid var(--border-subtle)',
              color: '#94a3b8',
              fontSize: '0.74rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <th style={{ padding: '10px 12px' }}>{isHi ? 'पीरियड नंबर' : 'Period ID'}</th>
              <th style={{ padding: '10px 12px' }}>{isHi ? 'ड्रॉ संख्या' : 'Winning Number'}</th>
              <th style={{ padding: '10px 12px' }}>{isHi ? 'परिणाम' : 'Odd / Even'}</th>
              <th style={{ padding: '10px 12px' }}>{isHi ? 'आकार' : 'Size'}</th>
              <th style={{ padding: '10px 12px' }}>{isHi ? 'अनुमानित' : 'AI Prediction'}</th>
              <th style={{ padding: '10px 12px' }}>{isHi ? 'कॉन्फिडेंस' : 'Confidence'}</th>
              <th style={{ padding: '10px 12px' }}>{isHi ? 'निर्णय' : 'Result'}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 30).map((log, index) => {
              const isOdd = log.actualOddEven === 'ODD';
              const num = parseInt(log.number, 10);
              const isMixed = num === 0 || num === 5;

              return (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: index % 2 === 0 ? 'rgba(0, 0, 0, 0.15)' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'rgba(0, 0, 0, 0.15)' : 'transparent'}
                >
                  {/* Period ID */}
                  <td className="font-mono" style={{ padding: '10px 12px', color: '#cbd5e1' }}>
                    {log.issueNumber}
                  </td>

                  {/* Winning Ball Number */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={`ball-badge ${
                        isMixed 
                          ? (num === 0 ? 'ball-violet-red' : 'ball-violet-green')
                          : (log.actualColor === 'green' ? 'ball-green' : 'ball-red')
                      }`} style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                        {num}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {log.actualColor}
                      </span>
                    </div>
                  </td>

                  {/* Odd / Even Result */}
                  <td style={{ padding: '10px 12px' }}>
                    <span className={isOdd ? 'pill-odd' : 'pill-even'} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                      {log.actualOddEven}
                    </span>
                  </td>

                  {/* Big / Small */}
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#e2e8f0',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      {log.actualBigSmall}
                    </span>
                  </td>

                  {/* Predicted */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        color: log.predicted === 'BIG' ? 'var(--neon-green)' : (log.predicted === 'SMALL' ? 'var(--neon-blue)' : (log.predicted === 'ODD' ? 'var(--neon-cyan)' : 'var(--neon-gold)')),
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {log.predicted}
                      </span>
                      {log.predictedNumber && log.predictedNumber !== '---' && (
                        <span style={{
                          background: 'rgba(255, 183, 3, 0.15)',
                          color: '#ffb703',
                          border: '1px solid rgba(255, 183, 3, 0.35)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          #{log.predictedNumber}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Confidence */}
                  <td className="font-mono" style={{ padding: '10px 12px', color: '#94a3b8' }}>
                    {log.confidence}%
                  </td>

                  {/* Win / Loss Verdict */}
                  <td style={{ padding: '10px 12px' }}>
                    {log.action === 'SKIP' ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(251, 133, 0, 0.15)',
                        color: 'var(--neon-amber)',
                        border: '1px solid rgba(251, 133, 0, 0.4)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.72rem'
                      }}>
                        ⏸️ SKIPPED
                      </span>
                    ) : log.isWin ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(0, 245, 155, 0.15)',
                        color: 'var(--neon-green)',
                        border: '1px solid rgba(0, 245, 155, 0.4)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.72rem'
                      }}>
                        <CheckCircle size={12} /> WIN
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(255, 51, 102, 0.12)',
                        color: 'var(--neon-red)',
                        border: '1px solid rgba(255, 51, 102, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.72rem'
                      }}>
                        <XCircle size={12} /> LOSS
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            {isHi ? 'कोई मेल नहीं मिला' : 'No records match your criteria'}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(HistoryTable);
