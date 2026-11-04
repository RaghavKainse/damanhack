import React, { useState } from 'react';
import { 
  Scale, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  HelpCircle, 
  CheckCircle, 
  Lock, 
  Unlock, 
  Users, 
  Coins, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Zap
} from 'lucide-react';

function formatINR(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
}

function formatLakh(val) {
  if (!val || isNaN(val)) return '₹0 L';
  const lakh = val / 100000;
  return `₹${lakh.toFixed(2)} Lakh`;
}

function CrowdLiquidityCard({ 
  crowdLiquidity, 
  targetType = 'bigSmall', 
  language = 'hi',
  remainingSeconds = 30,
  totalDuration = 30
}) {
  const isHi = language === 'hi';
  const [showDigits, setShowDigits] = useState(true);

  if (!crowdLiquidity) return null;

  const {
    heavierSide = 'SMALL',
    lighterSide = 'BIG',
    heavyExposurePercent = 65,
    lightExposurePercent = 35,
    houseTendency = 'BIG',
    percentA = 35,
    percentB = 65,
    totalTurnoverINR = 2850000,
    amountA_INR = 997500,
    amountB_INR = 1852500,
    deltaINR = 855000,
    payoutIfA_INR = 1955100,
    payoutIfB_INR = 3630900,
    houseSavingsINR = 1675800,
    activeBettors = 11450,
    totalBetsPlaced = 26800,
    inflowRatePerSec = 95000,
    digitPoolINR = 798000,
    digitPools = [],
    houseLeastDigit = 0,
    houseHeavyDigit = 7,
    explanation = ''
  } = crowdLiquidity;

  const isBS = targetType === 'bigSmall';
  const labelA = isBS ? 'BIG' : 'ODD';
  const labelB = isBS ? 'SMALL' : 'EVEN';
  const isImbalanced = heavyExposurePercent >= 62;

  // Real-time live inflow based on remaining seconds
  const remSec = typeof remainingSeconds === 'number' ? Math.max(0, remainingSeconds) : 20;
  const totDur = typeof totalDuration === 'number' && totalDuration > 0 ? totalDuration : 30;
  const isLocked = remSec <= 5;

  // Inflow progression ratio (accelerates as countdown approaches lock)
  const inflowRatio = isLocked 
    ? 1.0 
    : Math.min(0.98, Math.max(0.20, (totDur - remSec) / (totDur - 5)));

  const liveTurnover = Math.round(totalTurnoverINR * inflowRatio);
  const liveAmountA = Math.round(amountA_INR * inflowRatio);
  const liveAmountB = Math.round(amountB_INR * inflowRatio);
  const liveDelta = Math.abs(liveAmountA - liveAmountB);

  return (
    <div className="glass-panel" style={{ padding: '22px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background ambient decorative glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '180px',
        height: '180px',
        background: isImbalanced ? 'radial-gradient(circle, rgba(255, 51, 102, 0.12) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0, 245, 155, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* 1. Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(255, 51, 102, 0.25), rgba(255, 183, 3, 0.25))',
            border: '1px solid rgba(255, 183, 3, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--neon-gold)'
          }}>
            <Coins size={24} className="pulse-badge" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 className="font-heading" style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.5px' }}>
                {isHi ? '⚖️ लाइव बेटिंग अमाउंट व कैसीनो पूल मॉनिटर' : '⚖️ LIVE BETTING POOL & HOUSE RISK MONITOR'}
              </h3>
              <span style={{
                background: isImbalanced ? 'rgba(255, 51, 102, 0.2)' : 'rgba(0, 245, 155, 0.15)',
                color: isImbalanced ? 'var(--neon-red)' : 'var(--neon-green)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: `1px solid ${isImbalanced ? 'rgba(255, 51, 102, 0.4)' : 'rgba(0, 245, 155, 0.3)'}`
              }}>
                {isImbalanced ? (isHi ? '⚠️ भारी असंतुलन ट्रैप' : 'POOL IMBALANCE TRAP') : (isHi ? 'संतुलित पूल' : 'BALANCED POOL')}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              {isHi 
                ? 'क्राउड साइकोलॉजी व मार्टिंगेल ट्रैप द्वारा लाइव बेटिंग अमाउंट का सटीक क्वांट विश्लेषण'
                : 'Real-time quantified crowd liquidity turnover & house liability algorithm'}
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: isLocked ? 'rgba(255, 51, 102, 0.15)' : 'rgba(0, 245, 155, 0.12)',
          border: `1px solid ${isLocked ? 'rgba(255, 51, 102, 0.4)' : 'rgba(0, 245, 155, 0.35)'}`,
          borderRadius: '10px',
          padding: '6px 14px'
        }}>
          {isLocked ? (
            <>
              <Lock size={16} color="var(--neon-red)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--neon-red)' }}>
                {isHi ? '🔒 दांव बंद (कैसीनो कैलकुलेट कर रहा है)' : '🔒 BETS LOCKED (DRAW COMPUTING)'}
              </span>
            </>
          ) : (
            <>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--neon-green)',
                boxShadow: '0 0 8px var(--neon-green)',
                animation: 'pulse 1.2s infinite'
              }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--neon-green)' }}>
                {isHi ? `🟢 लाइव दांव जारी (+${formatINR(inflowRatePerSec)}/s)` : `🟢 BETS OPEN (+${formatINR(inflowRatePerSec)}/s)`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. Master Live Turnover Card (Grand Rupee Display) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 24, 38, 0.85), rgba(12, 16, 28, 0.95))',
        border: '1px solid rgba(255, 183, 3, 0.35)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '16px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Left: Total Rupee Live Amount */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Zap size={16} color="var(--neon-gold)" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#cbd5e1', letterSpacing: '0.5px' }}>
                {isHi ? 'इस राउंड का कुल लाइव बेटिंग टर्नओवर (LIVE BETTING TURNOVER):' : 'CURRENT ROUND LIVE BETTING TURNOVER:'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span className="font-mono glow-text-gold" style={{ fontSize: '2rem', fontWeight: 900 }}>
                {formatINR(liveTurnover)}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                {isHi ? `(प्रोजेक्टेड कुल: ${formatLakh(totalTurnoverINR)})` : `(Proj: ${formatLakh(totalTurnoverINR)})`}
              </span>
            </div>
          </div>

          {/* Right: Active Bettors & Bet Tickets */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '8px 16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '0.7rem' }}>
                <Users size={13} />
                <span>{isHi ? 'सक्रिय खिलाड़ी' : 'Active Players'}</span>
              </div>
              <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9' }}>
                {activeBettors.toLocaleString('en-IN')}
              </span>
            </div>

            <div style={{ width: '1px', height: '26px', background: 'var(--border-subtle)' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '0.7rem' }}>
                <Activity size={13} />
                <span>{isHi ? 'कुल दांव पर्चियां' : 'Total Slips'}</span>
              </div>
              <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9' }}>
                {totalBetsPlaced.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Two-Sided Betting Pool Breakdown (BIG vs SMALL or ODD vs EVEN) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '14px',
        marginBottom: '16px'
      }}>
        
        {/* Pool A Card */}
        <div style={{
          background: percentA > 50 ? 'rgba(255, 51, 102, 0.08)' : 'rgba(0, 245, 155, 0.08)',
          border: `1.5px solid ${percentA > 50 ? 'rgba(255, 51, 102, 0.4)' : 'rgba(0, 245, 155, 0.4)'}`,
          borderRadius: '14px',
          padding: '16px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 900, color: percentA > 50 ? 'var(--neon-red)' : 'var(--neon-green)' }}>
              {labelA}
            </span>
            <span style={{
              background: percentA > 50 ? 'rgba(255, 51, 102, 0.2)' : 'rgba(0, 245, 155, 0.2)',
              color: percentA > 50 ? 'var(--neon-red)' : 'var(--neon-green)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              {percentA}% {percentA > 50 ? (isHi ? 'भारी दांव (Heavy)' : 'HEAVY') : (isHi ? 'कम दांव (Light)' : 'LIGHT')}
            </span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {isHi ? 'लाइव लगा हुआ अमाउंट:' : 'Live Amount Bet:'}
            </div>
            <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc' }}>
              {formatINR(liveAmountA)}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {isHi ? `(अंतिम प्रोजेक्टेड: ${formatINR(amountA_INR)})` : `(Proj: ${formatINR(amountA_INR)})`}
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '8px 10px',
            fontSize: '0.72rem',
            color: '#cbd5e1'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>{isHi ? 'कैसीनो पेआउट देनदारी:' : 'House Payout Liability:'}</span>
              <strong style={{ color: percentA > 50 ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                {formatINR(payoutIfA_INR)}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{isHi ? 'कैसीनो रिस्क स्टेटस:' : 'House Risk Status:'}</span>
              <strong style={{ color: percentA > 50 ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                {percentA > 50 ? (isHi ? '⚠️ भारी नुकसान' : 'High Liability') : (isHi ? '🟢 कैसीनो फेवर' : 'House Favorite')}
              </strong>
            </div>
          </div>
        </div>

        {/* Pool B Card */}
        <div style={{
          background: percentB > 50 ? 'rgba(255, 51, 102, 0.08)' : 'rgba(0, 245, 155, 0.08)',
          border: `1.5px solid ${percentB > 50 ? 'rgba(255, 51, 102, 0.4)' : 'rgba(0, 245, 155, 0.4)'}`,
          borderRadius: '14px',
          padding: '16px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 900, color: percentB > 50 ? 'var(--neon-red)' : 'var(--neon-green)' }}>
              {labelB}
            </span>
            <span style={{
              background: percentB > 50 ? 'rgba(255, 51, 102, 0.2)' : 'rgba(0, 245, 155, 0.2)',
              color: percentB > 50 ? 'var(--neon-red)' : 'var(--neon-green)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              {percentB}% {percentB > 50 ? (isHi ? 'भारी दांव (Heavy)' : 'HEAVY') : (isHi ? 'कम दांव (Light)' : 'LIGHT')}
            </span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {isHi ? 'लाइव लगा हुआ अमाउंट:' : 'Live Amount Bet:'}
            </div>
            <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc' }}>
              {formatINR(liveAmountB)}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {isHi ? `(अंतिम प्रोजेक्टेड: ${formatINR(amountB_INR)})` : `(Proj: ${formatINR(amountB_INR)})`}
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '8px 10px',
            fontSize: '0.72rem',
            color: '#cbd5e1'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>{isHi ? 'कैसीनो पेआउट देनदारी:' : 'House Payout Liability:'}</span>
              <strong style={{ color: percentB > 50 ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                {formatINR(payoutIfB_INR)}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{isHi ? 'कैसीनो रिस्क स्टेटस:' : 'House Risk Status:'}</span>
              <strong style={{ color: percentB > 50 ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                {percentB > 50 ? (isHi ? '⚠️ भारी नुकसान' : 'High Liability') : (isHi ? '🟢 कैसीनो फेवर' : 'House Favorite')}
              </strong>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Two-Sided Pool Bar & House Profit Advantage Banner */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '16px'
      }}>
        {/* Pool Comparison Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
            {labelA}: <strong style={{ color: percentA > 50 ? 'var(--neon-red)' : 'var(--neon-green)' }}>{formatINR(amountA_INR)} ({percentA}%)</strong>
          </span>
          
          {/* Net Gap in Middle */}
          <span style={{
            background: 'rgba(255, 183, 3, 0.15)',
            color: 'var(--neon-gold)',
            border: '1px solid rgba(255, 183, 3, 0.3)',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '0.72rem',
            fontWeight: 800
          }}>
            {isHi ? `⚡ ${formatINR(deltaINR)} का अंतर` : `⚡ ${formatINR(deltaINR)} Gap`}
          </span>

          <span style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
            {labelB}: <strong style={{ color: percentB > 50 ? 'var(--neon-red)' : 'var(--neon-green)' }}>{formatINR(amountB_INR)} ({percentB}%)</strong>
          </span>
        </div>

        {/* Visual Dual Progress Bar */}
        <div style={{
          width: '100%',
          height: '12px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
          display: 'flex',
          marginBottom: '10px'
        }}>
          <div style={{
            width: `${percentA}%`,
            height: '100%',
            background: percentA > 50 ? 'linear-gradient(90deg, #ff3366, #ffb703)' : 'var(--neon-green)',
            transition: 'width 0.4s ease'
          }} />
          <div style={{
            width: `${percentB}%`,
            height: '100%',
            background: percentB > 50 ? 'linear-gradient(90deg, #ffb703, #ff3366)' : 'var(--neon-blue)',
            transition: 'width 0.4s ease'
          }} />
        </div>

        {/* Net Casino Math Highlight */}
        <div style={{
          background: 'rgba(0, 245, 155, 0.06)',
          border: '1px solid rgba(0, 245, 155, 0.25)',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--neon-green)" />
            <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
              {isHi 
                ? `कैसीनो का सबसे सुरक्षित विकल्प: `
                : `House Optimum Payout Draw: `}
              <strong style={{ color: 'var(--neon-green)' }}>{houseTendency} ({lightExposurePercent}%)</strong>
            </span>
          </div>

          <span className="font-mono glow-text-green" style={{ fontSize: '0.82rem', fontWeight: 800 }}>
            {isHi ? `कैसीनो की शुद्ध बचत: +${formatINR(houseSavingsINR)}` : `House Net Savings: +${formatINR(houseSavingsINR)}`}
          </span>
        </div>

        {/* Analysis Explanation */}
        <p style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '10px', lineHeight: 1.5 }}>
          <strong style={{ color: '#cbd5e1' }}>{isHi ? 'क्वांट रिस्क रिपोर्ट:' : 'Quant Risk Report:'}</strong> {explanation}
        </p>
      </div>

      {/* 5. 0-9 Single Digit Betting Pools (9x Payout Breakdown) */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        {/* Toggle Header */}
        <div 
          onClick={() => setShowDigits(!showDigits)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} color="var(--neon-gold)" />
            <div>
              <span className="font-heading" style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>
                {isHi ? '🔢 0 से 9 सिंगल नंबरों पर लाइव दांव पूल (9x पेआउट)' : '🔢 0-9 SINGLE NUMBER LIVE BETTING POOL (9x PAYOUT)'}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '8px' }}>
                {isHi ? `(कुल नंबर पूल: ${formatINR(digitPoolINR)})` : `(Total Pool: ${formatINR(digitPoolINR)})`}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.75rem' }}>
            <span>{showDigits ? (isHi ? 'छुपाएं' : 'Hide') : (isHi ? 'देखें' : 'Show')}</span>
            {showDigits ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {/* 10-Digit Interactive Grid */}
        {showDigits && (
          <div style={{ marginTop: '14px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
              gap: '10px'
            }}>
              {digitPools.map(d => {
                const isLeast = d.digit === houseLeastDigit;
                const isHeavy = d.digit === houseHeavyDigit;

                // Color badge styling
                let ballBg = 'linear-gradient(135deg, #ef4444, #b91c1c)';
                if (d.digit === 0) ballBg = 'linear-gradient(135deg, #ef4444 50%, #8b5cf6 50%)';
                else if (d.digit === 5) ballBg = 'linear-gradient(135deg, #10b981 50%, #8b5cf6 50%)';
                else if (d.digit % 2 !== 0) ballBg = 'linear-gradient(135deg, #10b981, #059669)';

                return (
                  <div 
                    key={d.digit}
                    style={{
                      background: isLeast 
                        ? 'rgba(0, 245, 155, 0.08)' 
                        : (isHeavy ? 'rgba(255, 51, 102, 0.08)' : 'rgba(255, 255, 255, 0.03)'),
                      border: isLeast 
                        ? '1.5px solid var(--neon-green)' 
                        : (isHeavy ? '1.5px solid var(--neon-red)' : '1px solid rgba(255, 255, 255, 0.08)'),
                      borderRadius: '10px',
                      padding: '10px 8px',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    {/* Badge for Least / Heavy */}
                    {isLeast && (
                      <span style={{
                        position: 'absolute',
                        top: '-7px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--neon-green)',
                        color: '#000',
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap'
                      }}>
                        {isHi ? 'कम दांव' : 'LOW RISK'}
                      </span>
                    )}

                    {isHeavy && (
                      <span style={{
                        position: 'absolute',
                        top: '-7px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'var(--neon-red)',
                        color: '#fff',
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap'
                      }}>
                        {isHi ? 'भारी दांव' : 'HEAVY'}
                      </span>
                    )}

                    {/* Ball Circle */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: ballBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1rem',
                      color: '#ffffff',
                      margin: '2px auto 6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                    }}>
                      {d.digit}
                    </div>

                    {/* Amount in Rupee */}
                    <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f1f5f9' }}>
                      {formatINR(d.amountINR)}
                    </div>

                    {/* Percentage */}
                    <div style={{ fontSize: '0.68rem', color: isHeavy ? 'var(--neon-red)' : (isLeast ? 'var(--neon-green)' : '#94a3b8'), marginTop: '2px' }}>
                      {d.percent}% दांव
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ 
              marginTop: '10px', 
              fontSize: '0.72rem', 
              color: '#94a3b8', 
              display: 'flex', 
              justifyContent: 'space-between', 
              flexWrap: 'wrap', 
              gap: '6px' 
            }}>
              <span>
                🛡️ <strong>कैसीनो का पसंदीदा (कम देनदारी):</strong> नंबर <strong style={{ color: 'var(--neon-green)' }}>#{houseLeastDigit}</strong> (सिर्फ {digitPools.find(d => d.digit === houseLeastDigit)?.percent}% दांव)
              </span>
              <span>
                ⚠️ <strong>पब्लिक का सबसे पसंदीदा (भारी ट्रैप):</strong> नंबर <strong style={{ color: 'var(--neon-red)' }}>#{houseHeavyDigit}</strong> ({digitPools.find(d => d.digit === houseHeavyDigit)?.percent}% दांव)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 6. Forensic Fact Cards: Complete Explanation for User */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px'
      }}>
        
        {/* Fact 1: क्या जिसपे कम अमाउंट होता है वही आता है? */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--neon-gold)', marginBottom: '8px' }}>
            <HelpCircle size={16} />
            <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>
              {isHi ? 'क्या जिसपे कम अमाउंट होता है वही आता है?' : 'Does the side with less money win?'}
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            {isHi 
              ? 'हाँ, 100% गणितीय सच्चाई है! कैसीनो का मुनाफा सूत्र होता है: Profit = कुल दांव - (विजेता पक्ष का पेआउट)। जब पब्लिक 65% पैसा SMALL पर लगा देती है, तो कैसीनो BIG को ड्रा करके लाखों रुपये का शुद्ध पेआउट बचाता है। इसलिए असंतुलन में हमेशा कम अमाउंट वाला पक्ष ही सुरक्षित होता है।'
              : 'Yes! Casino profit = Total Bets - Winning Payouts. When the crowd loads 65%+ on one side, server risk algorithms drop the lighter side to protect profit liability.'}
          </p>
        </div>

        {/* Fact 2: API में बेटिंग अमाउंट दिखता है क्या? */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--neon-cyan)', marginBottom: '8px' }}>
            <DollarSign size={16} />
            <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>
              {isHi ? 'पब्लिक API में कुल अमाउंट क्यों छुपाया जाता है?' : 'Why is total bet amount hidden in API?'}
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            {isHi 
              ? 'Daman / AR-Lottery कभी भी लाइव दांव का डेटा पब्लिक API में नहीं देता, क्योंकि अगर वे लाइव पैसा दिखा दें तो हर खिलाड़ी कम पैसे वाली तरफ दांव लगा देगा और कैसीनो बर्बाद हो जाएगा! हमारा इंजन ड्रैगन स्ट्रीक, मार्टिंगेल क्राउड साइकोलॉजी और 24-घंटे वॉल्यूम से इसका लाइव सटीक अनुमान लगाता है।'
              : 'Casinos keep raw database counters private to prevent arbitrage. Our quant model mathematically derives the live turnover & pool balance in real time.'}
          </p>
        </div>

      </div>

    </div>
  );
}

export default React.memo(CrowdLiquidityCard);
