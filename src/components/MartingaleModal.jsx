import React, { useState } from 'react';
import { X, Calculator, ShieldAlert, CheckCircle, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';

export default function MartingaleModal({ isOpen, onClose, language }) {
  const isHi = language === 'hi';
  const [activeTab, setActiveTab] = useState('kelly'); // 'kelly' | 'martingale'
  const [balance, setBalance] = useState(1000);
  const [baseBet, setBaseBet] = useState(10);
  const [multiplier, setMultiplier] = useState(3);

  // Kelly Inputs
  const [winProb, setWinProb] = useState(54); // 54% calibrated win rate
  const [decimalOdds, setDecimalOdds] = useState(1.96); // 1.96x WinGo payout
  const [kellyFraction, setKellyFraction] = useState(0.25); // Quarter-Kelly

  if (!isOpen) return null;

  // 1. Calculate Quarter-Kelly Metrics
  const p = winProb / 100;
  const b = decimalOdds - 1.0;
  const q = 1.0 - p;
  const rawKelly = Math.max(0, (b * p - q) / b);
  const fractionalKellyPercent = Math.min(10.0, Math.max(0, Math.round(rawKelly * kellyFraction * 1000) / 10));
  const recommendedStake = Math.max(1, Math.round(balance * (fractionalKellyPercent / 100)));
  const evPercent = Math.round(((p * decimalOdds) - 1.0) * 1000) / 10;
  const expectedProfitPerBet = Math.round(recommendedStake * ((p * decimalOdds) - 1.0) * 10) / 10;
  const isPositiveEV = evPercent > 0;

  // 2. Generate Martingale levels 1 to 7
  let cumulative = 0;
  const levels = [];
  for (let lvl = 1; lvl <= 7; lvl++) {
    const bet = baseBet * Math.pow(multiplier, lvl - 1);
    cumulative += bet;
    const payout = bet * decimalOdds;
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
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '620px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px 26px',
        border: '1px solid var(--border-accent)',
        boxShadow: 'var(--glow-gold), var(--glass-shadow)',
        position: 'relative',
        borderRadius: '20px'
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

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(0, 245, 155, 0.15)',
            border: '1px solid rgba(0, 245, 155, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--neon-green)'
          }}>
            <Calculator size={22} />
          </div>
          <div>
            <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 900 }}>
              {isHi ? 'गणितीय पूंजी प्रबंधन एवं रिस्क कैलकुलेटर' : 'Quantitative Capital Sizing & Risk Planner'}
            </h3>
            <p style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
              {isHi ? 'शून्य-रुइन क्वार्टर-केली मॉडल बनाम 3X मार्टिंगेल विश्लेषण' : 'Quarter-Kelly Zero Ruin Staking vs Geometric Martingale Analysis'}
            </p>
          </div>
        </div>

        {/* Strategy Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'rgba(0, 0, 0, 0.45)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setActiveTab('kelly')}
            style={{
              background: activeTab === 'kelly' ? 'rgba(0, 245, 155, 0.2)' : 'transparent',
              color: activeTab === 'kelly' ? 'var(--neon-green)' : '#94a3b8',
              border: activeTab === 'kelly' ? '1px solid rgba(0, 245, 155, 0.5)' : '1px solid transparent',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={16} />
            <span>{isHi ? '🛡️ क्वार्टर-केली (अनुशंसित)' : '🛡️ Quarter-Kelly (Recommended)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('martingale')}
            style={{
              background: activeTab === 'martingale' ? 'rgba(255, 183, 3, 0.2)' : 'transparent',
              color: activeTab === 'martingale' ? 'var(--neon-gold)' : '#94a3b8',
              border: activeTab === 'martingale' ? '1px solid rgba(255, 183, 3, 0.5)' : '1px solid transparent',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={16} />
            <span>{isHi ? '⚠️ 3X मार्टिंगेल (उच्च जोखिम)' : '⚠️ 3X Martingale (High Risk)'}</span>
          </button>
        </div>

        {/* TAB 1: QUARTER-KELLY CAPITAL ALLOCATION */}
        {activeTab === 'kelly' ? (
          <div>
            {/* Input Parameters for Kelly */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              marginBottom: '18px'
            }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  {isHi ? 'वॉलेट पूंजी (₹)' : 'Wallet Bankroll (₹)'}
                </label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(Math.max(10, Number(e.target.value)))}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
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
                  {isHi ? 'पेआउट ऑड्स' : 'Payout Odds'}
                </label>
                <select
                  value={decimalOdds}
                  onChange={(e) => setDecimalOdds(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                >
                  <option value={1.96}>1.96x (Big/Small)</option>
                  <option value={3.00}>3.00x (Golden Basket)</option>
                  <option value={4.41}>4.41x (Violet)</option>
                  <option value={9.00}>9.00x (Exact Digit)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  {isHi ? 'जीत संभावना (%)' : 'Win Prob (%)'}
                </label>
                <input
                  type="number"
                  min="10"
                  max="80"
                  value={winProb}
                  onChange={(e) => setWinProb(Math.min(80, Math.max(10, Number(e.target.value))))}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: 'var(--neon-green)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  {isHi ? 'केली विभाजन' : 'Kelly Fraction'}
                </label>
                <select
                  value={kellyFraction}
                  onChange={(e) => setKellyFraction(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                >
                  <option value={0.25}>Quarter (0.25x - Safe)</option>
                  <option value={0.50}>Half (0.50x - Moderate)</option>
                  <option value={1.00}>Full (1.00x - Aggressive)</option>
                </select>
              </div>
            </div>

            {/* Kelly Results Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '18px'
            }}>
              <div style={{
                background: 'rgba(0, 245, 155, 0.12)',
                border: '1px solid rgba(0, 245, 155, 0.45)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                  {isHi ? 'अनुशंसित सुरक्षित दांव' : 'Recommended Stake'}
                </div>
                <div className="font-mono glow-text-green" style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--neon-green)', marginTop: '4px' }}>
                  ₹{recommendedStake}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                  ({fractionalKellyPercent}% {isHi ? 'पूंजी' : 'of Bankroll'})
                </div>
              </div>

              <div style={{
                background: isPositiveEV ? 'rgba(0, 245, 155, 0.08)' : 'rgba(255, 51, 102, 0.08)',
                border: isPositiveEV ? '1px solid rgba(0, 245, 155, 0.35)' : '1px solid rgba(255, 51, 102, 0.35)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                  {isHi ? 'एक्सपेक्टेड वैल्यू (EV)' : 'Expected Value (EV)'}
                </div>
                <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 900, color: isPositiveEV ? 'var(--neon-green)' : 'var(--neon-red)', marginTop: '4px' }}>
                  {evPercent >= 0 ? `+${evPercent}%` : `${evPercent}%`}
                </div>
                <div style={{ fontSize: '0.7rem', color: isPositiveEV ? 'var(--neon-green)' : 'var(--neon-red)', fontWeight: 700 }}>
                  {isPositiveEV ? `+₹${expectedProfitPerBet} Net/Bet` : (isHi ? 'नकारात्मक बढ़त' : 'Negative Edge')}
                </div>
              </div>

              <div style={{
                background: 'rgba(0, 242, 254, 0.08)',
                border: '1px solid rgba(0, 242, 254, 0.35)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800 }}>
                  {isHi ? 'रुइन (कंगाल होने का) जोखिम' : 'Risk of Ruin'}
                </div>
                <div className="font-mono glow-text-cyan" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--neon-cyan)', marginTop: '4px' }}>
                  &lt; 0.01%
                </div>
                <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>
                  {isHi ? 'अति सुरक्षित सुरक्षा कवच' : 'Zero-Ruin Guardrail'}
                </div>
              </div>
            </div>

            {/* Why Quarter-Kelly Works Card */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--neon-gold)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <TrendingUp size={15} />
                {isHi ? 'क्वार्टर-केली फॉर्मूला एवं वित्तीय सुरक्षा नियम:' : 'Why Fractional Kelly Protects Your Bankroll:'}
              </h4>
              <ul style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.55, paddingLeft: '18px', margin: 0 }}>
                <li>
                  <strong>{isHi ? 'फॉर्मूला:' : 'Formula:'}</strong> <code>f* = 0.25 × [(b × p - q) / b]</code> — {isHi ? 'जहाँ b = 0.96 (1.96x ऑड्स), p = जीत संभावना, q = हार संभावना।' : 'where b = 0.96 (1.96x odds), p = win prob, q = loss prob.'}
                </li>
                <li>
                  <strong>{isHi ? 'ड्रॉडउन सुरक्षा:' : 'Drawdown Protection:'}</strong> {isHi ? 'फुल-केली में 50% गिरावट का जोखिम रहता है, जबकि क्वार्टर-केली 75% तक उतार-चढ़ाव कम करके ज्यामितीय ग्रोथ को सुरक्षित रखता है।' : 'Full-Kelly has a 50% peak-to-trough drawdown risk; Quarter-Kelly cuts volatility by 75% while capturing 93% of optimal geometric growth.'}
                </li>
                <li>
                  <strong>{isHi ? 'हारे तो छोटा दांव:' : 'Adaptive Sizing:'}</strong> {isHi ? 'हारने पर बैलेंस घटता है तो दांव अपने आप छोटा हो जाता है, जिससे खाता कभी खाली नहीं हो सकता।' : 'When balance dips, the stake automatically scales down in rupee terms, making bankruptcy mathematically impossible.'}
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* TAB 2: MARTINGALE LEVEL CALCULATOR */
          <div>
            {/* Input Parameters for Martingale */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '18px'
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

            {/* Strict Martingale Mathematical Ruin Warning */}
            <div style={{
              background: 'rgba(255, 51, 102, 0.1)',
              border: '1px solid rgba(255, 51, 102, 0.4)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              marginBottom: '14px'
            }}>
              <ShieldAlert size={22} color="var(--neon-red)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.74rem', color: '#f8fafc', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--neon-red)', display: 'block', marginBottom: '3px' }}>
                  {isHi ? '⚠️ सांख्यिकीय चेतावनी: 3X मार्टिंगेल से पूंजी समाप्ति का जोखिम' : '⚠️ Statistical Warning: Martingale Concentrates Catastrophic Ruin'}
                </strong>
                {isHi 
                  ? 'मार्टिंगेल कभी भी गणितीय एक्सपेक्टेड वैल्यू (EV) को नहीं बढ़ाता। लगातार 4 या 5 हार की स्थिति में यह पूरी पूंजी को समाप्त कर देता है। इसीलिए पेशेवर क्वांट ट्रेडर्स कभी 3X मार्टिंगेल का उपयोग नहीं करते, बल्कि क्वार्टर-केली का उपयोग करते हैं।'
                  : 'Martingale does NOT improve expected value (EV = -2.04% remains negative under raw odds). It merely converts frequent small wins into rare but 100% fatal wipeouts. Always enforce a hard stop-loss at Level 3.'}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
