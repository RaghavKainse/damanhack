import React, { useState } from 'react';
import { X, Calculator, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MartingaleModal({ isOpen, onClose, language }) {
  const isHi = language === 'hi';
  const [balance, setBalance] = useState(1000);
  const [baseBet, setBaseBet] = useState(10);
  const [multiplier, setMultiplier] = useState(3);

  if (!isOpen) return null;

  // Generate levels 1 to 7
  let cumulative = 0;
  const levels = [];
  for (let lvl = 1; lvl <= 7; lvl++) {
    const bet = baseBet * Math.pow(multiplier, lvl - 1);
    cumulative += bet;
    const payout = bet * 1.96;
    const net = payout - cumulative;
    const canAfford = cumulative <= balance;

    levels.push({
      level: lvl,
      bet,
      cumulative,
      payout: Math.round(payout),
      net: Math.round(net),
      canAfford
    });
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        border: '1px solid var(--border-accent)',
        boxShadow: 'var(--glow-gold), var(--glass-shadow)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(255, 183, 3, 0.15)',
            border: '1px solid rgba(255, 183, 3, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--neon-gold)'
          }}>
            <Calculator size={20} />
          </div>
          <div>
            <h3 className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {isHi ? '3X मार्टिंगेल मनी मैनेजमेंट प्लानर' : '3X Martingale Risk & Bet Calculator'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {isHi ? 'हारने पर अगले राउंड में निवेश रिकवर करने की रणनीति' : 'Calculates multi-level recovery bet amounts and risk limits'}
            </p>
          </div>
        </div>

        {/* Input Parameters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              {isHi ? 'वॉलेट बैलेंस (₹)' : 'Wallet Balance (₹)'}
            </label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(Math.max(10, Number(e.target.value)))}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '8px 10px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              {isHi ? 'शुरुआती बेस बेट (₹)' : 'Base Bet (₹)'}
            </label>
            <input
              type="number"
              value={baseBet}
              onChange={(e) => setBaseBet(Math.max(1, Number(e.target.value)))}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '8px 10px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              {isHi ? 'मल्टीप्लायर (गुणा)' : 'Multiplier'}
            </label>
            <select
              value={multiplier}
              onChange={(e) => setMultiplier(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '8px 10px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                outline: 'none'
              }}
            >
              <option value={2}>2X (Conservative)</option>
              <option value={2.5}>2.5X (Moderate)</option>
              <option value={3}>3X (Standard WinGo)</option>
            </select>
          </div>
        </div>

        {/* Levels Table */}
        <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#94a3b8' }}>
                <th style={{ padding: '8px 10px' }}>Level</th>
                <th style={{ padding: '8px 10px' }}>Bet (₹)</th>
                <th style={{ padding: '8px 10px' }}>Total Spent</th>
                <th style={{ padding: '8px 10px' }}>Net Profit</th>
                <th style={{ padding: '8px 10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((lvl) => (
                <tr
                  key={lvl.level}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: lvl.canAfford ? 'transparent' : 'rgba(255, 51, 102, 0.08)'
                  }}
                >
                  <td style={{ padding: '8px 10px', fontWeight: 800, color: 'var(--neon-gold)' }}>
                    L{lvl.level}
                  </td>
                  <td className="font-mono" style={{ padding: '8px 10px', fontWeight: 700 }}>
                    ₹{lvl.bet.toLocaleString()}
                  </td>
                  <td className="font-mono" style={{ padding: '8px 10px', color: '#94a3b8' }}>
                    ₹{lvl.cumulative.toLocaleString()}
                  </td>
                  <td className="font-mono" style={{ padding: '8px 10px', color: 'var(--neon-green)', fontWeight: 700 }}>
                    +₹{lvl.net.toLocaleString()}
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    {lvl.canAfford ? (
                      <span style={{ color: 'var(--neon-green)', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle size={12} /> Safe
                      </span>
                    ) : (
                      <span style={{ color: 'var(--neon-red)', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <AlertTriangle size={12} /> Low Balance
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Responsible Gaming & Risk Advisory */}
        <div style={{
          background: 'rgba(255, 51, 102, 0.08)',
          border: '1px solid rgba(255, 51, 102, 0.3)',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <ShieldAlert size={20} color="var(--neon-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
            <strong style={{ color: 'var(--neon-red)' }}>
              {isHi ? 'जोखिम चेतावनी (Risk Warning):' : 'Strict Money Management Rule:'}
            </strong>{' '}
            {isHi 
              ? 'मार्टिंगेल कभी भी 4 या 5 लेवल से आगे न ले जाएं। एक सीमा के बाद स्टॉप-लॉस अवश्य लगाएं। लॉटरी आरएनजी-आधारित प्रणाली है, जिम्मेदार बनें।'
              : 'Never exceed Level 4 or 5 without hard stop-loss. Color prediction outcomes are generated by server RNG. Set daily profit targets and never bet essential capital.'}
          </div>
        </div>

      </div>
    </div>
  );
}
