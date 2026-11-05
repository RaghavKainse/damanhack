import React from 'react';
import { Brain, Sparkles, RotateCcw, Activity, Shield, Zap, Database, TrendingUp, HelpCircle } from 'lucide-react';

function SelfLearningMatrix({ 
  learnedWeights, 
  onResetLearning, 
  regime, 
  language 
}) {
  const isHi = language === 'hi';
  const {
    crowdLiquidity = 0.25,
    markov2 = 1.50,
    dragonTrend = 1.05,
    bayesianTrans = 1.45,
    nGram = 1.20,
    omissionRev = 1.25,
    clusterParity = 1.30,
    fourierCycle = 0.85,
    learningRounds = 0,
    winScore = 0,
    lossScore = 0,
    recentAccuracy = 50.0,
    dailyRoundsTrained = 0
  } = learnedWeights || {};

  const models = [
    { key: 'markov2', name: isHi ? '2nd-ऑर्डर मार्कोव चेन' : '2nd-Order Markov', weight: markov2, color: '#00f2fe' },
    { key: 'bayesianTrans', name: isHi ? '10x10 बायेसियन मैट्रिक्स' : 'Bayesian 10x10 Matrix', weight: bayesianTrans, color: '#ffb703' },
    { key: 'clusterParity', name: isHi ? 'मल्टी-हॉरिजॉन क्लस्टर' : 'Multi-Horizon Cluster', weight: clusterParity, color: '#06d6a0' },
    { key: 'omissionRev', name: isHi ? 'ओमिशन रिवर्शन (Z-Score)' : 'Omission Reversion', weight: omissionRev, color: '#ff3366' },
    { key: 'nGram', name: isHi ? 'एन-ग्राम पैटर्न मैचर' : 'N-Gram Pattern', weight: nGram, color: '#4facfe' },
    { key: 'dragonTrend', name: isHi ? 'नियंत्रित ड्रैगन ट्रेंड' : 'Damped Dragon Trend', weight: dragonTrend, color: '#00f59b' },
    { key: 'fourierCycle', name: isHi ? 'हार्मोनिक चक्र वेव' : 'Fourier Harmonic', weight: fourierCycle, color: '#9d4edd' },
    { key: 'crowdLiquidity', name: isHi ? 'पूल मॉनिटर (कम वेट)' : 'Pool Monitor (Low Weight)', weight: crowdLiquidity, color: '#64748b' }
  ];

  // Regime Hindi labels
  const regimeLabels = {
    DRAGON_STREAK: isHi ? '🐉 ड्रैगन स्ट्रीक चरण (लगातार लड़ी सक्रिय - मोमेंटम 1.3x)' : '🐉 Dragon Streak Regime (1.3x Momentum)',
    PING_PONG_WAVE: isHi ? '🏓 पिंग-पोंग तरंग चरण (अदला-बदली सक्रिय - मार्कोव 1.5x)' : '🏓 Ping-Pong Wave Regime (1.5x Markov)',
    MEAN_REVERSION_SKEW: isHi ? '⚖️ मीन रिवर्शन असंतुलन (रिवर्सल निकट - ओमिशन 1.5x)' : '⚖️ Mean Reversion Skew (1.5x Omission)',
    OSCILLATION_CHOP: isHi ? '🌀 ऑसिलेशन शोर (अनिश्चित बाज़ार - कड़ा सांख्यिकीय फिल्टर)' : '🌀 Choppy Oscillation (Strict Evidence Filter Active)',
    EQUILIBRIUM: isHi ? '⚖️ संतुलित साम्यावस्था (Equilibrium)' : '⚖️ Equilibrium'
  };

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
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(157, 78, 221, 0.25))',
            border: '1px solid rgba(0, 242, 254, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--neon-cyan)'
          }}>
            <Brain size={22} className="pulse-badge" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                {isHi ? '🧠 सांख्यिकीय एडेप्टिव लर्निंग मैट्रिक्स (Adaptive Quant Matrix)' : '🧠 ADAPTIVE STATISTICAL QUANT MATRIX'}
              </h3>
              <span style={{
                background: 'rgba(0, 245, 155, 0.15)',
                color: 'var(--neon-green)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: '1px solid rgba(0, 245, 155, 0.3)'
              }}>
                CONTINUOUS ONLINE LEARNING
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              {isHi 
                ? 'यह एल्गोरिदम हर सत्यापित ड्रा से बायेसियन स्टेट्स सीखता है। यदि डेटा में कोई प्रमाणित बढ़त नहीं मिलती, तो सिस्टम NO CLEAR SIGNAL देता है।'
                : 'Second-order online gradient & 10x10 Bayesian transition engine adapts after verified rounds without lookahead bias.'}
            </p>
          </div>
        </div>

        {/* Learning Stats & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(0, 245, 155, 0.1)',
            border: '1px solid rgba(0, 245, 155, 0.3)',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--neon-green)'
          }}>
            {isHi ? '24/7 प्रशिक्षित ड्रा:' : '24/7 Trained Draws:'} <strong>{dailyRoundsTrained || learningRounds} / 2880</strong>
          </div>

          <div style={{
            background: 'rgba(0, 242, 254, 0.1)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--neon-cyan)'
          }}>
            {isHi ? 'रोलिंग सटीकता:' : 'Rolling Acc:'} <strong>{recentAccuracy}%</strong>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: '#cbd5e1'
          }}>
            {isHi ? 'कुल राउंड्स:' : 'Total Rounds:'} <strong style={{ color: 'var(--neon-gold)' }}>{learningRounds}</strong>
          </div>

          <button
            onClick={onResetLearning}
            title={isHi ? 'लर्निंग रीसेट करें' : 'Reset Learning Weights'}
            className="btn-secondary"
            style={{ padding: '6px 10px', fontSize: '0.75rem', gap: '4px' }}
          >
            <RotateCcw size={13} />
            <span>{isHi ? 'रीसेट' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* 4-Tier Statistical Guardrails Badge Strip */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(0, 245, 155, 0.08), rgba(0, 242, 254, 0.08))',
        border: '1px solid rgba(0, 245, 155, 0.25)',
        borderRadius: '8px',
        padding: '8px 12px',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '0.74rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--neon-green)', fontWeight: 700 }}>
          <Shield size={14} />
          <span>{isHi ? '🛡️ 4x सांख्यिकीय सुरक्षा गार्ड्स सक्रिय (Statistical Guardrails Active)' : '🛡️ 4x Statistical Guardrails Active'}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', color: '#94a3b8', flexWrap: 'wrap' }}>
          <span>✓ {isHi ? '5+ स्ट्रीक थकावट' : '5+ Streak'}</span>
          <span>✓ {isHi ? '4+ पिंग-पोंग चॉप' : '4+ PingPong'}</span>
          <span>✓ {isHi ? 'अति-दांव क्राउड ट्रैप' : 'Crowd Trap'}</span>
          <span>✓ {isHi ? 'सर्किट ब्रेकर (कम सहमति पर रोक)' : 'Circuit Breaker'}</span>
        </div>
      </div>

      {/* Current Market Regime Badge */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="var(--neon-gold)" />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {isHi ? 'वर्तमान बाज़ार स्थिति (Active Regime):' : 'Active Market Regime:'}
          </span>
          <strong className="glow-text-gold" style={{ fontSize: '0.85rem' }}>
            {regimeLabels[regime] || regimeLabels['EQUILIBRIUM']}
          </strong>
        </div>

        <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={12} color="var(--neon-cyan)" />
          <span>{isHi ? 'बायेसियन 10x10 स्टेट्स एक्टिव' : '10x10 Bayesian State Active'}</span>
        </div>
      </div>

      {/* 8 Models Adaptive Weights Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '10px'
      }}>
        {models.map(m => {
          const percent = Math.min(100, Math.round((m.weight / 2.5) * 100));
          return (
            <div
              key={m.key}
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '10px 12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600 }}>
                  {m.name}
                </span>
                <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: m.color }}>
                  {m.weight.toFixed(2)}x
                </span>
              </div>

              {/* Weight Power Bar */}
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '9999px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${percent}%`,
                  height: '100%',
                  background: m.color,
                  boxShadow: `0 0 8px ${m.color}`,
                  borderRadius: '9999px',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default React.memo(SelfLearningMatrix);
