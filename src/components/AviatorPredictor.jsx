import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plane, 
  Rocket, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  TrendingUp, 
  Gauge, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Calculator, 
  Hash, 
  RefreshCw, 
  Play, 
  Plus, 
  Sparkles,
  Award,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import { 
  generateAviatorPrediction, 
  classifyMultiplier, 
  getInitialAviatorHistory, 
  calculateAviatorKellyStake, 
  verifyProvablyFair,
  STORAGE_AVIATOR_HISTORY 
} from '../utils/aviatorEngine';

export default function AviatorPredictor({ language = 'hi', soundEnabled = true }) {
  const isHi = language === 'hi';

  const [history, setHistory] = useState(getInitialAviatorHistory);
  const [predictionMode, setPredictionMode] = useState('safe'); // 'safe', 'balanced', or 'aggressive'
  const [bankroll, setBankroll] = useState(5000);
  const [inputMultiplier, setInputMultiplier] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSettlement, setLastSettlement] = useState(null);

  // Provably Fair Verifier State
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [verifyServerSeed, setVerifyServerSeed] = useState('spribe_server_seed_demo_2026_x89a');
  const [verifyClientSeed, setVerifyClientSeed] = useState('daman_player_seed_9938');
  const [verifyResult, setVerifyResult] = useState(null);

  // Save history to localStorage
  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_AVIATOR_HISTORY, JSON.stringify(newHistory.slice(0, 500)));
    } catch {}
  };

  // Generate current prediction
  const prediction = useMemo(() => {
    return generateAviatorPrediction(history, predictionMode);
  }, [history, predictionMode]);

  // Kelly stake calculation
  const kelly = useMemo(() => {
    return calculateAviatorKellyStake(bankroll, prediction.recommendedCashout, prediction.confidence);
  }, [bankroll, prediction.recommendedCashout, prediction.confidence]);

  // Add new multiplier result
  const handleAddMultiplier = (val) => {
    const m = parseFloat(val);
    if (isNaN(m) || m < 1.0) return;

    const roundId = (Date.now() % 100000).toString();
    const newEntry = {
      id: roundId,
      multiplier: Math.round(m * 100) / 100,
      timestamp: Date.now()
    };

    // Settle against current prediction
    const target = prediction.recommendedCashout;
    const isWin = prediction.action === 'CONFIRMED_BET' ? (m >= target) : null;
    setLastSettlement({
      id: roundId,
      actual: m,
      target,
      isWin,
      action: prediction.action
    });

    const updated = [newEntry, ...history].slice(0, 500);
    saveHistory(updated);
    setInputMultiplier('');
  };

  // Simulate a realistic live round using Spribe's cryptographic PRNG formula
  const handleSimulateFlight = async () => {
    setIsSimulating(true);
    try {
      // Generate random seeds
      const randHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const client = `daman_${Date.now()}`;
      const res = await verifyProvablyFair(randHex, client, Math.floor(Math.random() * 1000));
      
      setTimeout(() => {
        setIsSimulating(false);
        if (res && res.valid) {
          handleAddMultiplier(res.crashMultiplier);
        }
      }, 700);
    } catch {
      setIsSimulating(false);
    }
  };

  // Run Provably Fair Verification
  const handleRunVerify = async () => {
    const res = await verifyProvablyFair(verifyServerSeed, verifyClientSeed, 1);
    setVerifyResult(res);
  };

  const isColdTrap = prediction.isColdTrap;
  const isSurge = prediction.isHotSurge;

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* Top Banner: Aviator Flight Radar Header */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${isColdTrap ? 'rgba(251, 133, 0, 0.45)' : (isSurge ? 'rgba(0, 245, 155, 0.5)' : 'rgba(244, 63, 94, 0.45)')}`,
        boxShadow: `0 0 35px ${isColdTrap ? 'rgba(251, 133, 0, 0.2)' : (isSurge ? 'rgba(0, 245, 155, 0.25)' : 'rgba(244, 63, 94, 0.25)')}, var(--glass-shadow)`
      }}>
        {/* Glow ambient background */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '5%',
          width: '450px',
          height: '240px',
          background: isColdTrap ? 'radial-gradient(circle, rgba(251,133,0,0.18) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(244,63,94,0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        {/* Top Control Bar: Title, Mode Toggle, Verifier Button */}
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
          {/* Left: Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(244, 63, 94, 0.5)'
            }}>
              <Plane size={24} color="#ffffff" style={{ transform: 'rotate(-25deg)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
                  AVIATOR <span style={{ color: '#f43f5e' }}>QUANT CRASH</span> <span className="glow-text-gold">PREDICTOR</span>
                </h2>
                <span style={{
                  background: 'rgba(244, 63, 94, 0.15)',
                  color: '#fb7185',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  PARETO 97% RTP
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                {isHi 
                  ? 'क्रैश मल्टीप्लायर प्रोबेबिलिटी विश्लेषण, ऑटो-कैशआउट ऑप्टिमाइज़र एवं क्रैश ट्रैप शील्ड'
                  : 'Crash Multiplier Probability Engine, Optimal Auto-Cashout & Volatility Trap Shield'}
              </p>
            </div>
          </div>

          {/* Middle: 3 Target Modes */}
          <div style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            gap: '3px'
          }}>
            {/* 1. Safe Mode */}
            <button
              onClick={() => setPredictionMode('safe')}
              style={{
                background: predictionMode === 'safe' 
                  ? 'linear-gradient(135deg, rgba(0, 245, 155, 0.3), rgba(0, 242, 254, 0.3))' 
                  : 'transparent',
                color: predictionMode === 'safe' ? 'var(--neon-green)' : '#94a3b8',
                border: predictionMode === 'safe' ? '1px solid rgba(0, 245, 155, 0.6)' : '1px solid transparent',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <ShieldCheck size={14} color="var(--neon-green)" />
              <span>{isHi ? '🛡️ सेफ कैशआउट (1.2x-1.5x)' : '🛡️ Safe (1.2x-1.5x)'}</span>
            </button>

            {/* 2. Balanced Mode */}
            <button
              onClick={() => setPredictionMode('balanced')}
              style={{
                background: predictionMode === 'balanced' 
                  ? 'rgba(0, 242, 254, 0.25)' 
                  : 'transparent',
                color: predictionMode === 'balanced' ? 'var(--neon-cyan)' : '#94a3b8',
                border: predictionMode === 'balanced' ? '1px solid rgba(0, 242, 254, 0.5)' : '1px solid transparent',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Gauge size={14} />
              <span>{isHi ? '🎯 संतुलित (1.6x-2.2x)' : '🎯 Balanced (1.6x-2.2x)'}</span>
            </button>

            {/* 3. Aggressive Moonshot */}
            <button
              onClick={() => setPredictionMode('aggressive')}
              style={{
                background: predictionMode === 'aggressive' 
                  ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.3), rgba(251, 133, 0, 0.3))' 
                  : 'transparent',
                color: predictionMode === 'aggressive' ? '#f43f5e' : '#94a3b8',
                border: predictionMode === 'aggressive' ? '1px solid rgba(244, 63, 94, 0.6)' : '1px solid transparent',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Rocket size={14} color="#f43f5e" />
              <span>{isHi ? '🚀 मूनशॉट वेव (3x-8x)' : '🚀 Moonshot (3x-8x)'}</span>
            </button>
          </div>

          {/* Right: Provably Fair Verifier Trigger */}
          <button
            onClick={() => setIsVerifierOpen(true)}
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.78rem', gap: '6px' }}
          >
            <Hash size={14} color="var(--neon-gold)" />
            <span>{isHi ? 'SHA-512 फेयरनेस वेल्डर' : 'SHA-512 Verifier'}</span>
          </button>
        </div>

        {/* Status Shield Warning Banner */}
        {isColdTrap ? (
          <div style={{
            background: 'rgba(251, 133, 0, 0.18)',
            border: '1px solid rgba(251, 133, 0, 0.55)',
            borderRadius: '12px',
            padding: '10px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.82rem',
            color: 'var(--neon-gold)'
          }}>
            <ShieldAlert size={18} color="var(--neon-gold)" style={{ flexShrink: 0 }} />
            <div>
              <strong>{isHi ? '🛡️ क्रैश ट्रैप शील्ड सक्रिय (दांव से परहेज करें):' : '🛡️ Crash Trap Shield Active (Abstain from Betting):'}</strong>{' '}
              {prediction.reason}
            </div>
          </div>
        ) : isSurge ? (
          <div style={{
            background: 'rgba(0, 245, 155, 0.12)',
            border: '1px solid rgba(0, 245, 155, 0.45)',
            borderRadius: '12px',
            padding: '10px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.82rem',
            color: 'var(--neon-green)'
          }}>
            <Sparkles size={18} color="var(--neon-green)" style={{ flexShrink: 0 }} />
            <div>
              <strong>{isHi ? '🚀 रिबाउंड वेव सक्रिय:' : '🚀 Rebound Surge Active:'}</strong>{' '}
              {prediction.reason}
            </div>
          </div>
        ) : null}

        {/* Main Radar Grid: Target Cashout Hero + 3 Top Targets */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Main Hero Multiplier Forecast Card */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: `2px solid ${isColdTrap ? 'rgba(251, 133, 0, 0.5)' : (isSurge ? 'rgba(0, 245, 155, 0.5)' : 'rgba(244, 63, 94, 0.45)')}`,
            borderRadius: '18px',
            padding: '24px 22px',
            textAlign: 'center',
            boxShadow: `0 8px 30px ${isColdTrap ? 'rgba(251, 133, 0, 0.15)' : 'rgba(244, 63, 94, 0.2)'}`
          }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
              {isHi ? '🎯 सर्वोत्तम ऑटो-कैशआउट मल्टीप्लायर' : '🎯 OPTIMAL AUTO-CASHOUT TARGET'}
            </span>

            {/* Glowing Big Multiplier */}
            <div className="font-mono" style={{
              fontSize: '3.6rem',
              fontWeight: 900,
              lineHeight: 1.05,
              margin: '10px 0 6px',
              color: isColdTrap ? 'var(--neon-gold)' : (isSurge ? 'var(--neon-green)' : '#f43f5e'),
              textShadow: isColdTrap ? '0 0 25px rgba(251, 133, 0, 0.6)' : '0 0 30px rgba(244, 63, 94, 0.6)'
            }}>
              {`${prediction.recommendedCashout.toFixed(2)}x`}
            </div>

            {/* Predicted Bracket Range */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              color: '#cbd5e1',
              marginBottom: '14px'
            }}>
              <span>{isHi ? 'अनुमानित सुरक्षित दायरा:' : 'Forecast Range:'}</span>
              <strong className="font-mono" style={{ color: 'var(--neon-cyan)' }}>
                {prediction.predictedRange.min.toFixed(2)}x — {prediction.predictedRange.max.toFixed(2)}x
              </strong>
            </div>

            {/* Metrics Row: Confidence & Mathematical EV */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '14px',
              textAlign: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                  {isHi ? 'कॉन्फिडेंस' : 'Confidence'}
                </span>
                <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--neon-green)' }}>
                  {prediction.confidence}%
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                  {isHi ? 'अपेक्षित रिटर्न (EV)' : 'Exp. Value'}
                </span>
                <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: prediction.expectedValue.startsWith('+') ? 'var(--neon-green)' : '#94a3b8' }}>
                  {prediction.expectedValue}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                  {isHi ? 'निर्णय स्थिति' : 'Action'}
                </span>
                <div className="font-mono" style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  marginTop: '4px',
                  color: 'var(--neon-green)'
                }}>
                  CONFIRMED 🎯
                </div>
              </div>
            </div>
          </div>

          {/* Right Box: Top 3 Cashout Targets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {prediction.top3Targets.map((target, idx) => (
              <div 
                key={idx}
                className="glass-panel"
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: idx === 0 ? '1px solid rgba(0, 245, 155, 0.4)' : '1px solid var(--border-subtle)',
                  background: idx === 0 ? 'rgba(0, 245, 155, 0.06)' : 'rgba(0, 0, 0, 0.25)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '2px' }}>
                    {target.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {isHi ? `सांख्यिकीय प्रोबेबिलिटी: ${target.probability}%` : `Survival Prob: ${target.probability}%`}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono" style={{
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    color: idx === 0 ? 'var(--neon-green)' : (idx === 1 ? 'var(--neon-cyan)' : '#f43f5e')
                  }}>
                    {target.multiplier.toFixed(2)}x
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 800,
                    background: idx === 0 ? 'rgba(0, 245, 155, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: idx === 0 ? 'var(--neon-green)' : '#94a3b8'
                  }}>
                    {target.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Crash Multipliers Stream (Official Aviator Badges) */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--neon-cyan)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isHi ? 'हालिया क्रैश मल्टीप्लायर्स (लाइव स्ट्रीम)' : 'Recent Crash Multipliers (Live Stream)'}
            </span>
          </div>

          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {isHi ? `कुल रिकॉर्डेड: ${history.length} राउंड्स | औसत: ${prediction.regimeData?.meanLast20 || 2.0}x` : `Recorded: ${history.length} | Avg: ${prediction.regimeData?.meanLast20 || 2.0}x`}
          </span>
        </div>

        {/* Scrollable Badges Strip */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {history.slice(0, 24).map((item, idx) => {
            const cls = classifyMultiplier(item.multiplier);
            return (
              <div
                key={item.id || idx}
                style={{
                  background: cls.tier === 'FLEA' 
                    ? 'rgba(255, 51, 102, 0.15)' 
                    : (cls.tier === 'LOW' 
                    ? 'rgba(56, 189, 248, 0.15)' 
                    : (cls.tier === 'MID' 
                    ? 'rgba(192, 132, 252, 0.18)' 
                    : 'rgba(244, 63, 94, 0.25)')),
                  color: cls.color,
                  border: `1px solid ${cls.color}55`,
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                  boxShadow: cls.tier === 'HIGH' || cls.tier === 'JACKPOT' ? `0 0 12px ${cls.color}66` : 'none',
                  flexShrink: 0
                }}
              >
                {parseFloat(item.multiplier).toFixed(2)}x
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Ladder & Stake Sizing vs Quick Input */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        
        {/* Left Column: Survival Probability Ladder */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Layers size={18} color="var(--neon-green)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>
              {isHi ? 'मल्टीप्लायर सर्वाइवल प्रोबेबिलिटी लैडर' : 'Multiplier Survival Probability Ladder'}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {prediction.ladder.slice(0, 6).map((step, idx) => {
              const hitPercent = step.empiricalProb;
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '4px' }}>
                    <span className="font-mono" style={{ fontWeight: 800, color: '#e2e8f0' }}>
                      &ge; {step.targetMultiplier.toFixed(2)}x
                    </span>
                    <span style={{ color: step.isPositiveEdge ? 'var(--neon-green)' : '#94a3b8' }}>
                      {hitPercent}% {isHi ? 'सटीकता' : 'Hit'} ({step.isPositiveEdge ? `+${step.delta}%` : `${step.delta}%`} vs 97% RTP)
                    </span>
                  </div>

                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '9999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(100, hitPercent)}%`,
                      height: '100%',
                      background: hitPercent >= 60 
                        ? 'linear-gradient(90deg, #00f2fe, #00f59b)' 
                        : (hitPercent >= 45 
                        ? 'linear-gradient(90deg, #38bdf8, #818cf8)' 
                        : 'linear-gradient(90deg, #f43f5e, #fb7185)'),
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Fast Result Ingestion & Flight Simulator */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} color="var(--neon-cyan)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>
                {isHi ? 'ताज़ा क्रैश परिणाम दर्ज करें (लाइव इनपुट)' : 'Record Actual Crash (Live Input)'}
              </h3>
            </div>

            <button
              onClick={handleSimulateFlight}
              disabled={isSimulating}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.72rem', gap: '4px' }}
            >
              <Play size={12} className={isSimulating ? 'spin-slow' : ''} />
              <span>{isSimulating ? (isHi ? 'उड़ान जारी...' : 'Flying...') : (isHi ? 'सिम्युलेट फ्लाइट' : 'Simulate Round')}</span>
            </button>
          </div>

          {/* Input Bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <input
              type="number"
              step="0.01"
              min="1.00"
              placeholder={isHi ? 'क्रैश मल्टीप्लायर दर्ज करें (e.g. 1.85)' : 'Enter crash (e.g. 1.85)'}
              value={inputMultiplier}
              onChange={(e) => setInputMultiplier(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddMultiplier(inputMultiplier);
              }}
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem'
              }}
            />
            <button
              onClick={() => handleAddMultiplier(inputMultiplier)}
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
            >
              {isHi ? 'जोड़ें' : 'Add'}
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', flexWrap: 'wrap' }}>
            {[1.08, 1.25, 1.45, 1.85, 2.40, 5.20, 14.50].map(val => (
              <button
                key={val}
                onClick={() => handleAddMultiplier(val)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: '#cbd5e1',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer'
                }}
              >
                +{val.toFixed(2)}x
              </button>
            ))}
          </div>

          {/* Quarter-Kelly Capital Protection Box */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#94a3b8', fontWeight: 700 }}>
                <Calculator size={14} color="var(--neon-gold)" />
                <span>{isHi ? 'क्वार्टर-केली बैंकरोल सुरक्षित दांव साइजिंग:' : 'Quarter-Kelly Capital Sizing:'}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Bankroll: ₹</span>
                <input
                  type="number"
                  value={bankroll}
                  onChange={(e) => setBankroll(Math.max(100, parseInt(e.target.value) || 0))}
                  style={{
                    width: '75px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--neon-gold)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    textAlign: 'right'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                {kelly.recommendation}
              </span>
              <strong className="font-mono" style={{ fontSize: '1.1rem', color: 'var(--neon-gold)' }}>
                ₹{kelly.safeAmount}
              </strong>
            </div>
          </div>

        </div>

      </div>

      {/* Provably Fair SHA-512 Verification Modal */}
      {isVerifierOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '560px',
            width: '100%',
            padding: '24px',
            borderRadius: '18px',
            border: '1px solid rgba(0, 242, 254, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hash size={20} color="var(--neon-cyan)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  {isHi ? 'Spribe Aviator SHA-512 फेयरनेस वेल्डर' : 'Spribe Provably Fair SHA-512 Auditor'}
                </h3>
              </div>
              <button
                onClick={() => setIsVerifierOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '16px' }}>
              {isHi 
                ? 'Aviator का परिणाम HMAC-SHA512 हैश से निकाला जाता है। आप सर्वर सीड और क्लाइंट सीड डालकर किसी भी राउंड का सटीक मल्टीप्लायर स्वतंत्र रूप से सत्यापित कर सकते हैं:'
                : 'Aviator crash points are generated via HMAC-SHA512. Enter the server and client seed to verify exact multipliers independently:'}
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Server Seed</label>
              <input
                type="text"
                value={verifyServerSeed}
                onChange={(e) => setVerifyServerSeed(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  marginTop: '4px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Client Seed</label>
              <input
                type="text"
                value={verifyClientSeed}
                onChange={(e) => setVerifyClientSeed(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  marginTop: '4px'
                }}
              />
            </div>

            <button
              onClick={handleRunVerify}
              className="btn-primary"
              style={{ width: '100%', padding: '10px', fontSize: '0.85rem', marginBottom: '16px' }}
            >
              {isHi ? 'क्रिप्टोग्राफिक मल्टीप्लायर सत्यापित करें' : 'Verify Cryptographic Multiplier'}
            </button>

            {verifyResult && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(0, 245, 155, 0.4)',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '0.78rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{isHi ? 'सत्यापित क्रैश पॉइंट:' : 'Verified Multiplier:'}</span>
                  <strong className="font-mono" style={{ fontSize: '1.2rem', color: 'var(--neon-green)' }}>
                    {verifyResult.crashMultiplier.toFixed(2)}x
                  </strong>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', wordBreak: 'break-all' }}>
                  HMAC-SHA512: {verifyResult.hashHex ? verifyResult.hashHex.slice(0, 32) : ''}...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scientific Honesty & Risk Notice */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '14px 18px',
        fontSize: '0.75rem',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Info size={20} color="var(--neon-cyan)" style={{ flexShrink: 0 }} />
        <div>
          <strong>{isHi ? 'सांख्यिकीय ईमानदारी घोषणा:' : 'Statistical Integrity Declaration:'}</strong>{' '}
          {isHi 
            ? 'Aviator का क्रैश मल्टीप्लायर स्पाइब (Spribe) के प्रोवेबली फेयर SHA-512 क्रिप्टोग्राफिक एल्गोरिदम द्वारा निर्धारित होता है। कोई भी सिस्टम अगले राउंड का दशमलव क्रैश पॉइंट 100% पहले से नहीं जान सकता। यह सिस्टम वास्तविक 97% आरटीपी सर्वाइवल कर्व, पारेतो डिस्ट्रीब्यूशन, और क्रैश-क्लस्टर शील्ड के जरिए सुरक्षित ऑटो-कैशआउट टारगेट प्रदान करता है।'
            : 'Aviator crash multipliers are governed by Spribe Provably Fair SHA-512 cryptographic PRNG. No system can pre-determine exact decimal points. This predictor provides mathematical survival probabilities, volatility trap shields, and optimal auto-cashout targets for disciplined bankroll management.'}
        </div>
      </div>

    </div>
  );
}

