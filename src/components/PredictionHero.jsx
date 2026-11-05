import React, { useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Cpu, 
  ShieldCheck, 
  BarChart3, 
  Layers, 
  PauseCircle, 
  Crosshair, 
  Sparkles, 
  Maximize2, 
  Binary,
  Flame,
  ChevronDown,
  ChevronUp,
  Award,
  Crown,
  Database,
  AlertTriangle,
  Coins,
  Scale
} from 'lucide-react';

function PredictionHero({ 
  predictionData, 
  targetPeriod, 
  martingalePlan, 
  language,
  predictionMode = 'ultra_sniper',
  onTogglePredictionMode,
  targetType = 'bigSmall',
  onToggleTargetType
}) {
  const isHi = language === 'hi';
  const [showAllNumbers, setShowAllNumbers] = useState(false);

  if (!predictionData) {
    return (
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8' }}>
          {isHi ? 'क्वांट पैटर्न गणना हो रही है...' : 'Calculating predictive patterns...'}
        </p>
      </div>
    );
  }

  const { 
    action, 
    prediction, 
    confidence, 
    secondaryPrediction, 
    secondaryType, 
    topNumber, 
    secondaryNumbers = [], 
    goldenBasket = [],
    goldenBasketCoverage = 75,
    numberProbabilities = [], 
    signals = {}, 
    agreementCount = 0,
    reason, 
    badge,
    regime,
    shields = {}
  } = predictionData;

  const isWait = action === 'NO_CLEAR_SIGNAL' || action === 'WAIT_SKIP';
  const isBig = prediction === 'BIG';
  const isOdd = prediction === 'ODD';

  let primaryGlow = 'var(--glow-green)';
  let primaryColor = 'var(--neon-green)';
  let primaryBg = 'rgba(0, 245, 155, 0.12)';
  let primaryBorder = 'rgba(0, 245, 155, 0.45)';

  if (targetType === 'bigSmall') {
    if (isBig) {
      primaryGlow = '0 0 35px rgba(0, 245, 155, 0.45)';
      primaryColor = 'var(--neon-green)';
      primaryBg = 'rgba(0, 245, 155, 0.14)';
      primaryBorder = 'rgba(0, 245, 155, 0.55)';
    } else {
      primaryGlow = '0 0 35px rgba(79, 172, 254, 0.45)';
      primaryColor = 'var(--neon-blue)';
      primaryBg = 'rgba(79, 172, 254, 0.14)';
      primaryBorder = 'rgba(79, 172, 254, 0.55)';
    }
  } else {
    if (isOdd) {
      primaryGlow = 'var(--glow-cyan)';
      primaryColor = 'var(--neon-cyan)';
      primaryBg = 'rgba(0, 242, 254, 0.14)';
      primaryBorder = 'rgba(0, 242, 254, 0.5)';
    } else {
      primaryGlow = 'var(--glow-gold)';
      primaryColor = 'var(--neon-gold)';
      primaryBg = 'rgba(255, 183, 3, 0.14)';
      primaryBorder = 'rgba(255, 183, 3, 0.5)';
    }
  }

  if (isWait) {
    primaryGlow = '0 0 25px rgba(251, 133, 0, 0.35)';
    primaryBorder = 'rgba(251, 133, 0, 0.5)';
  }

  return (
    <div className="glass-panel" style={{
      padding: '24px 28px',
      marginBottom: '20px',
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${primaryBorder}`,
      boxShadow: `${primaryGlow}, var(--glass-shadow)`
    }}>
      {/* Decorative ambient rays */}
      <div style={{
        position: 'absolute',
        top: '-90px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '260px',
        background: `radial-gradient(circle, ${isWait ? 'rgba(251,133,0,0.18)' : (isBig ? 'rgba(0,245,155,0.22)' : 'rgba(79,172,254,0.22)')} 0%, transparent 70%)`,
        filter: 'blur(55px)',
        pointerEvents: 'none'
      }} />

      {/* Top Bar: Target Switcher, 3-Tier Precision Mode, Signal Quality */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        position: 'relative',
        zIndex: 2
      }}>
        
        {/* Left: Target Market Toggle (BIG/SMALL vs ODD/EVEN) */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.45)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          gap: '4px'
        }}>
          <button
            onClick={() => onToggleTargetType('bigSmall')}
            style={{
              background: targetType === 'bigSmall' 
                ? 'linear-gradient(135deg, rgba(0, 245, 155, 0.25), rgba(79, 172, 254, 0.25))' 
                : 'transparent',
              color: targetType === 'bigSmall' ? 'var(--neon-green)' : '#94a3b8',
              border: targetType === 'bigSmall' ? '1px solid rgba(0, 245, 155, 0.5)' : '1px solid transparent',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Maximize2 size={14} />
            <span>{isHi ? '🎯 BIG / SMALL (बड़ा / छोटा)' : 'BIG / SMALL (5-9 / 0-4)'}</span>
          </button>

          <button
            onClick={() => onToggleTargetType('oddEven')}
            style={{
              background: targetType === 'oddEven' 
                ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(255, 183, 3, 0.25))' 
                : 'transparent',
              color: targetType === 'oddEven' ? 'var(--neon-cyan)' : '#94a3b8',
              border: targetType === 'oddEven' ? '1px solid rgba(0, 242, 254, 0.5)' : '1px solid transparent',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Binary size={14} />
            <span>{isHi ? '⚡ ODD / EVEN (विषम / सम)' : 'ODD / EVEN'}</span>
          </button>
        </div>

        {/* Middle Mode Switcher: 3 Precision Modes */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          gap: '3px'
        }}>
          {/* 1. All Rounds Mode (Predicts Every Round) */}
          <button
            onClick={() => onTogglePredictionMode('all')}
            style={{
              background: predictionMode === 'all' 
                ? 'linear-gradient(135deg, rgba(255, 183, 3, 0.3), rgba(251, 133, 0, 0.3))' 
                : 'transparent',
              color: predictionMode === 'all' ? 'var(--neon-gold)' : '#94a3b8',
              border: predictionMode === 'all' ? '1px solid rgba(255, 183, 3, 0.6)' : '1px solid transparent',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Zap size={13} color="var(--neon-gold)" />
            <span>{isHi ? '⚡ हर राउंड प्रेडिक्ट (All Rounds)' : '⚡ All Rounds (Every Draw)'}</span>
          </button>

          {/* 2. Balanced Sniper Mode */}
          <button
            onClick={() => onTogglePredictionMode('sniper')}
            style={{
              background: predictionMode === 'sniper' ? 'rgba(0, 242, 254, 0.25)' : 'transparent',
              color: predictionMode === 'sniper' ? 'var(--neon-cyan)' : '#94a3b8',
              border: predictionMode === 'sniper' ? '1px solid rgba(0, 242, 254, 0.5)' : '1px solid transparent',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Crosshair size={12} />
            <span>{isHi ? '🎯 संतुलित (6/8 सहमति)' : 'Balanced (6/8)'}</span>
          </button>

          {/* 3. Zero-Loss Shield Mode */}
          <button
            onClick={() => onTogglePredictionMode('ultra_sniper')}
            style={{
              background: predictionMode === 'ultra_sniper' 
                ? 'linear-gradient(135deg, rgba(0, 245, 155, 0.3), rgba(0, 242, 254, 0.3))' 
                : 'transparent',
              color: predictionMode === 'ultra_sniper' ? 'var(--neon-green)' : '#94a3b8',
              border: predictionMode === 'ultra_sniper' ? '1px solid rgba(0, 245, 155, 0.6)' : '1px solid transparent',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Crown size={12} color="var(--neon-green)" />
            <span>{isHi ? '🛡️ जीरो-लॉस शील्ड (Zero-Loss)' : '🛡️ Zero-Loss Shield'}</span>
          </button>
        </div>

        {/* Right: Round ID & Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-mono glow-text-cyan" style={{ fontSize: '0.95rem', fontWeight: 800 }}>
            #{targetPeriod ? targetPeriod.slice(-4) : '---'}
          </span>

          {isWait ? (
            <span style={{
              background: 'rgba(251, 133, 0, 0.2)',
              color: 'var(--neon-amber)',
              border: '1px solid rgba(251, 133, 0, 0.6)',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <ShieldCheck size={14} color="var(--neon-gold)" />
              {shields?.isStreakExhausted 
                ? (isHi ? '🛡️ स्ट्रीक थकावट (SKIP)' : '🛡️ STREAK EXHAUSTION')
                : shields?.crowdOpposesPrediction
                ? (isHi ? '🛡️ कैसीनो ट्रैप (SKIP)' : '🛡️ CASINO TRAP')
                : shields?.isPingPongTrap
                ? (isHi ? '🛡️ पिंग-पोंग चॉप (SKIP)' : '🛡️ CHOP TRAP')
                : (isHi ? '🛡️ सुरक्षा शील्ड (SKIP)' : 'SHIELD SKIP')}
            </span>
          ) : (
            <span style={{
              background: badge === 'ULTRA_SNIPER' 
                ? 'linear-gradient(135deg, rgba(0, 245, 155, 0.25), rgba(255, 183, 3, 0.25))' 
                : 'rgba(0, 242, 254, 0.15)',
              color: badge === 'ULTRA_SNIPER' ? 'var(--neon-green)' : 'var(--neon-cyan)',
              border: `1px solid ${badge === 'ULTRA_SNIPER' ? 'rgba(0, 245, 155, 0.7)' : 'rgba(0, 242, 254, 0.4)'}`,
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Sparkles size={14} color="var(--neon-gold)" />
              {badge === 'ULTRA_SNIPER' 
                ? (isHi ? '💎 उच्च सर्वसम्मति पुष्ट' : '💎 HIGH CONSENSUS') 
                : (isHi ? 'पुष्टि' : 'CONFIRMED')}
            </span>
          )}
        </div>

      </div>

      {/* Main Prediction Display Grid - NUMBERS ARE ALWAYS PREDICTED ON EVERY ROUND */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        
        {/* Left Box: Active Target & Complete Number Forecast */}
        <div style={{
          background: isWait ? 'rgba(251, 133, 0, 0.08)' : primaryBg,
          border: `2px solid ${isWait ? 'rgba(251, 133, 0, 0.5)' : primaryBorder}`,
          borderRadius: '20px',
          padding: '22px 20px',
          textAlign: 'center',
          boxShadow: `0 8px 30px ${isWait ? 'rgba(251,133,0,0.18)' : (isBig ? 'rgba(0,245,155,0.25)' : 'rgba(79,172,254,0.25)')}`,
          position: 'relative'
        }}>
          
          {/* Status Alert Banner */}
          {isWait ? (
            <div style={{
              background: 'rgba(251, 133, 0, 0.18)',
              border: '1px solid rgba(251, 133, 0, 0.45)',
              borderRadius: '10px',
              padding: '6px 12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.76rem',
              color: 'var(--neon-amber)',
              fontWeight: 700
            }}>
              <ShieldCheck size={14} color="var(--neon-gold)" />
              <span>{shields?.shieldAlert || (isHi ? '⚠️ कम सहमति / चॉप राउंड (यह राउंड छोड़ें - दांव न लगाएं)' : '⚠️ Low Consensus / Chop Round (SKIP - Do Not Bet)')}</span>
            </div>
          ) : (
            <div style={{
              background: 'rgba(0, 245, 155, 0.15)',
              border: '1px solid rgba(0, 245, 155, 0.45)',
              borderRadius: '10px',
              padding: '6px 12px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.76rem',
              color: 'var(--neon-green)',
              fontWeight: 800
            }}>
              <Sparkles size={14} color="var(--neon-gold)" />
              <span>{badge === 'ULTRA_SNIPER' ? (isHi ? '💎 उच्च मॉडल सर्वसम्मति पुष्ट राउंड' : '💎 High Consensus Bet Confirmed') : (isHi ? 'पुष्ट राउंड' : 'Confirmed Bet')}</span>
            </div>
          )}

          <p style={{
            fontSize: '0.8rem',
            color: '#94a3b8',
            textTransform: 'uppercase',
            fontWeight: 800,
            letterSpacing: '1.5px',
            marginBottom: '4px'
          }}>
            {isWait
              ? (isHi ? '🛡️ सुरक्षा गार्ड सक्रिय' : '🛡️ SAFETY GUARD ACTIVE')
              : (isHi 
                  ? (targetType === 'bigSmall' ? '🎯 30 सेकंड बाद आएगा (बड़ा / छोटा)' : '⚡ 30 सेकंड बाद आएगा (विषम / सम)')
                  : '30-SECOND CONFIRMED FORECAST')}
          </p>

          {/* Big / Small Primary Text */}
          <div style={{ margin: '4px 0' }}>
            <h2 className="font-heading pulse-badge" style={{
              fontSize: isWait ? (action === 'NO_CLEAR_SIGNAL' ? '2.4rem' : '3.5rem') : '4.2rem',
              fontWeight: 900,
              color: isWait ? 'var(--neon-amber)' : primaryColor,
              lineHeight: 1.15,
              letterSpacing: '-1px',
              textShadow: `0 0 35px ${isWait ? 'var(--neon-amber)' : primaryColor}`
            }}>
              {action === 'NO_CLEAR_SIGNAL' ? '⏸️ NO CLEAR SIGNAL' : (isWait ? '⏸️ WAIT' : prediction)}
            </h2>

            <div style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: isWait ? 'var(--neon-amber)' : '#e2e8f0',
              marginTop: '4px'
            }}>
              {isWait ? (
                isHi ? '⚠️ सांख्यिकीय साक्ष्य अपर्याप्त (यह राउंड छोड़ें - कोई दांव न लगाएं)' : '⚠️ INSUFFICIENT EVIDENCE (Abstain from betting this round)'
              ) : (
                targetType === 'bigSmall' ? (
                  isBig ? 'बड़ी संख्याएं (BIG: 5, 6, 7, 8, 9)' : 'छोटी संख्याएं (SMALL: 0, 1, 2, 3, 4)'
                ) : (
                  isOdd ? 'विषम संख्याएं (ODD: 1, 3, 5, 7, 9)' : 'सम संख्याएं (EVEN: 0, 2, 4, 6, 8)'
                )
              )}
            </div>
          </div>

          {/* 🎯 EXACT PREDICTED NUMBER + GOLDEN BASKET */}
          {isWait ? (
            <div style={{
              marginTop: '14px',
              padding: '16px 14px',
              background: 'rgba(251, 133, 0, 0.08)',
              border: '1px dashed rgba(251, 133, 0, 0.45)',
              borderRadius: '14px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--neon-amber)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ShieldCheck size={18} color="var(--neon-gold)" />
                {isHi ? '⚠️ कमजोर संगम: इस राउंड कोई सिंगल डिजिट या बास्केट सक्रिय नहीं है' : 'INSUFFICIENT CONFLUENCE: No Digit Forecast Active'}
              </span>
              <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '6px', lineHeight: 1.4 }}>
                {isHi 
                  ? 'जब 6/8+ मॉडल एकमत नहीं होते, तब सिंगल नंबर पर दांव लगाने से नुकसान का जोखिम 90% होता है। कृपया पुष्ट सिग्नल का इंतज़ार करें।'
                  : 'Single digit betting carries high variance. Await high consensus signal before wagering.'}
              </p>
            </div>
          ) : topNumber && (
            <div style={{
              marginTop: '14px',
              padding: '12px 14px',
              background: 'rgba(0, 0, 0, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px'
            }}>
              {/* Top VIP Single Number */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.74rem', color: '#ffb703', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Crown size={13} color="#ffb703" /> {isHi ? 'मुख्य VIP सिंगल नंबर (Top Digit)' : 'PRIMARY VIP SINGLE NUMBER'}
                  </span>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    {isHi ? '2,880 दैनिक चक्र व बायेसियन गणना' : 'Full Day Bayesian Prediction'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={`ball-badge ${topNumber.color === 'green' ? 'ball-green' : 'ball-red'}`} style={{ width: '42px', height: '42px', fontSize: '1.35rem' }}>
                    {topNumber.number}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--neon-green)' }}>
                      {topNumber.prob}%
                    </span>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {topNumber.isBig ? 'BIG' : 'SMALL'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 🏆 3-NUMBER GOLDEN COMBO BASKET (9X PAYOUT) */}
              <div style={{ marginTop: '10px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--neon-cyan)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={13} color="var(--neon-cyan)" />
                    {isHi ? '🏆 टॉप 3 गोल्डन बास्केट (9x रिटर्न कॉम्बो)' : '🏆 Top 3 Golden Basket (9x Payout)'}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--neon-green)', fontWeight: 800 }}>
                    {goldenBasketCoverage}% {isHi ? 'कवरेज' : 'Coverage'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {goldenBasket.map((gb) => (
                      <div key={gb.number} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', padding: '3px 6px', borderRadius: '8px' }}>
                        <div className={`ball-badge ${gb.color === 'green' ? 'ball-green' : 'ball-red'}`} style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>
                          {gb.number}
                        </div>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700 }}>
                          {gb.prob}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.68rem', color: '#ffb703', fontWeight: 700, textAlign: 'right' }}>
                    {isHi ? '3 में से 1 पर भी 9x पेआउट!' : '9x payout on any hit!'}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Secondary Forecast Tags */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '14px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#f8fafc'
            }}>
              {secondaryType}: <strong style={{ color: isWait ? 'var(--neon-amber)' : 'var(--neon-cyan)' }}>{isWait ? 'PAUSE' : secondaryPrediction}</strong>
            </span>

            <button
              onClick={() => setShowAllNumbers(!showAllNumbers)}
              style={{
                background: 'rgba(0, 242, 254, 0.1)',
                color: 'var(--neon-cyan)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{isHi ? '0-9 सभी संख्याएं व ओमिशन' : '0-9 Prob & Omission'}</span>
              {showAllNumbers ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {/* Expandable 0-9 Probability & Omission Spectrum */}
          {showAllNumbers && (
            <div style={{
              marginTop: '12px',
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '12px',
              padding: '12px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {numberProbabilities.map(np => (
                  <div key={np.number} style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '6px 4px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: np.number === topNumber.number ? '1px solid var(--neon-green)' : '1px solid transparent'
                  }}>
                    <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 900, color: np.color === 'green' ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                      {np.number}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.72rem', color: '#f8fafc', fontWeight: 800 }}>
                      {np.prob}%
                    </div>
                    <div style={{ fontSize: '0.62rem', color: np.omission >= 15 ? 'var(--neon-gold)' : '#64748b' }}>
                      {isHi ? `छूटा: ${np.omission}` : `Om: ${np.omission}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Box: 90%+ Confidence Meter & 7 Adaptive Model Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Confidence Meter */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '16px 20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} color={isWait ? 'var(--neon-amber)' : 'var(--neon-green)'} />
                {isWait 
                  ? (isHi ? 'सिग्नल विश्वसनीयता (कमजोर सिग्नल / छोड़ें)' : 'Signal Reliability (Weak Signal / SKIP)')
                  : (isHi ? `${prediction} आने की सटीक संभावना (Calibrated Confidence)` : 'Calibrated Confluence')}
              </span>
              <span className="font-mono glow-text-green" style={{ fontSize: '1.45rem', fontWeight: 900, color: isWait ? 'var(--neon-amber)' : 'var(--neon-green)' }}>
                {confidence}%
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${confidence}%`,
                height: '100%',
                background: `linear-gradient(90deg, #4facfe 0%, #00f59b 100%)`,
                borderRadius: '9999px',
                transition: 'width 0.6s ease',
                boxShadow: `0 0 14px ${primaryColor}`
              }} />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '10px',
              fontSize: '0.74rem'
            }}>
              <span style={{ color: 'var(--neon-cyan)', fontWeight: 700 }}>
                {agreementCount}/8 {isHi ? 'क्वांट मॉडल्स एकमत' : 'Models Aligned'}
              </span>
              <span style={{ color: '#94a3b8' }}>
                {isHi ? 'दैनिक 2,880 डेटा सिंक' : '2,880 Daily Sync'}
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '8px', lineHeight: 1.45 }}>
              <strong>{isHi ? 'पैटर्न व बैटिंग विश्लेषण:' : 'Analysis:'}</strong> {reason}
            </p>
          </div>

          {/* 8 Models Breakdown Grid with Live Learned Weights */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))',
            gap: '8px'
          }}>
            {/* 1. Crowd Betting & House Risk Model */}
            <div style={{ background: 'rgba(255, 183, 3, 0.08)', border: '1px solid rgba(255, 183, 3, 0.45)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#ffb703', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 800 }}>
                <Coins size={11} /> {isHi ? 'बैटिंग पूल' : 'Betting Pool'}
              </div>
              <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {signals?.crowdLiquidity?.choice}: {signals?.crowdLiquidity?.choice === (targetType === 'bigSmall' ? 'BIG' : 'ODD') ? signals?.crowdLiquidity?.a : signals?.crowdLiquidity?.b}%
              </div>
              <span style={{ fontSize: '0.62rem', color: '#ffb703' }}>wt: {signals?.crowdLiquidity?.weight ?? 1.55}x</span>
            </div>

            {/* 2. Markov2 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Cpu size={11} /> {isHi ? '2nd मार्कोव' : 'Markov 2'}
              </div>
              <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {signals?.markov2?.choice}: {signals?.markov2?.choice === (targetType === 'bigSmall' ? 'BIG' : 'ODD') ? signals?.markov2?.a : signals?.markov2?.b}%
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--neon-cyan)' }}>wt: {signals?.markov2?.weight ?? 1.35}x</span>
            </div>

            {/* 3. Dragon Trend */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Layers size={11} /> {isHi ? 'ड्रैगन' : 'Dragon'}
              </div>
              <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {signals?.dragonTrend?.choice}: {signals?.dragonTrend?.choice === (targetType === 'bigSmall' ? 'BIG' : 'ODD') ? signals?.dragonTrend?.a : signals?.dragonTrend?.b}%
              </div>
              <span style={{ fontSize: '0.62rem', color: 'var(--neon-green)' }}>wt: {signals?.dragonTrend?.weight ?? 1.45}x</span>
            </div>

            {/* 4. Bayesian Matrix */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Database size={11} /> {isHi ? 'बायेसियन' : 'Bayesian'}
              </div>
              <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {signals?.bayesianTrans?.choice}: {signals?.bayesianTrans?.choice === (targetType === 'bigSmall' ? 'BIG' : 'ODD') ? signals?.bayesianTrans?.a : signals?.bayesianTrans?.b}%
              </div>
              <span style={{ fontSize: '0.62rem', color: '#ffb703' }}>wt: {signals?.bayesianTrans?.weight ?? 1.3}x</span>
            </div>

            {/* 5. N-Gram */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <BarChart3 size={11} /> {isHi ? 'एन-ग्राम' : 'N-Gram'}
              </div>
              <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {signals?.nGram?.choice}: {signals?.nGram?.choice === (targetType === 'bigSmall' ? 'BIG' : 'ODD') ? signals?.nGram?.a : signals?.nGram?.b}%
              </div>
              <span style={{ fontSize: '0.62rem', color: '#4facfe' }}>wt: {signals?.nGram?.weight ?? 1.15}x</span>
            </div>

            {/* 6. Omission Reversion */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={11} /> {isHi ? 'ओमिशन Z' : 'Omission'}
              </div>
              <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {signals?.omissionRev?.choice}: {signals?.omissionRev?.choice === (targetType === 'bigSmall' ? 'BIG' : 'ODD') ? signals?.omissionRev?.a : signals?.omissionRev?.b}%
              </div>
              <span style={{ fontSize: '0.62rem', color: '#ff3366' }}>wt: {signals?.omissionRev?.weight ?? 1.1}x</span>
            </div>

            {/* 7. Cluster Parity */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Sparkles size={11} /> {isHi ? 'क्लस्टर' : 'Cluster'}
              </div>
              <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {signals?.clusterParity?.choice}: {signals?.clusterParity?.choice === (targetType === 'bigSmall' ? 'BIG' : 'ODD') ? signals?.clusterParity?.a : signals?.clusterParity?.b}%
              </div>
              <span style={{ fontSize: '0.62rem', color: '#06d6a0' }}>wt: {signals?.clusterParity?.weight ?? 1.05}x</span>
            </div>

            {/* 8. Fourier Cycle */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Zap size={11} /> {isHi ? 'साइकिल' : 'Fourier'}
              </div>
              <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {signals?.fourierCycle?.choice}: {signals?.fourierCycle?.choice === (targetType === 'bigSmall' ? 'BIG' : 'ODD') ? signals?.fourierCycle?.a : signals?.fourierCycle?.b}%
              </div>
              <span style={{ fontSize: '0.62rem', color: '#9d4edd' }}>wt: {signals?.fourierCycle?.weight ?? 0.95}x</span>
            </div>
          </div>

          {/* Martingale Suggested Bet Level */}
          {martingalePlan && (
            <div style={{
              background: 'rgba(255, 183, 3, 0.08)',
              border: '1px solid rgba(255, 183, 3, 0.3)',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#ffb703', fontWeight: 700 }}>
                  {isHi ? 'अनुशंसित 3X बेट:' : 'Suggested 3X Bet:'}
                </span>
                <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 800, color: isWait ? 'var(--neon-amber)' : '#fff' }}>
                  {isWait 
                    ? (isHi ? '⚠️ यह राउंड छोड़ें (कोई बेट न लगाएं)' : '⚠️ SKIP (No Bet Recommended)')
                    : `Level ${martingalePlan.level} (₹${martingalePlan.betAmount}) on ${prediction}`}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {isHi ? 'अनुमानित रिटर्न:' : 'Net Return:'}
                </span>
                <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--neon-green)' }}>
                  +₹{martingalePlan.netProfit} Net
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default React.memo(PredictionHero);
