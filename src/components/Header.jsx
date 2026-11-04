import React from 'react';
import { 
  Activity, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Calculator, 
  PlusCircle, 
  RefreshCw,
  Globe,
  Sparkles
} from 'lucide-react';
import { GAME_MODES } from '../utils/api';

export default function Header({ 
  selectedGame, 
  onSelectGame, 
  isLive, 
  dataSource, 
  soundEnabled, 
  onToggleSound, 
  voiceEnabled, 
  onToggleVoice, 
  language, 
  onToggleLanguage, 
  onOpenCalculator, 
  onOpenManual,
  onRefresh,
  isRefreshing
}) {
  const isHi = language === 'hi';

  return (
    <header className="glass-panel" style={{ padding: '14px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Left: Brand & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #9d4edd 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)'
          }}>
            <Sparkles size={24} color="#051424" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                DAMAN <span className="glow-text-cyan">WinGo</span> <span className="glow-text-gold">AI TRACKER</span>
              </h1>
              <span style={{
                background: isLive ? 'rgba(0, 245, 155, 0.15)' : 'rgba(255, 183, 3, 0.15)',
                color: isLive ? 'var(--neon-green)' : 'var(--neon-gold)',
                border: `1px solid ${isLive ? 'rgba(0, 245, 155, 0.4)' : 'rgba(255, 183, 3, 0.4)'}`,
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isLive ? 'var(--neon-green)' : 'var(--neon-gold)',
                  boxShadow: `0 0 8px ${isLive ? 'var(--neon-green)' : 'var(--neon-gold)'}`
                }} />
                {isLive ? 'LIVE FEED' : 'SIMULATION'}
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              {isHi 
                ? '30 सेकंड ऑड-ईवन सटीक पैटर्न एनालिसिस और क्वांट प्रेडिक्शन' 
                : '30-Second Odd/Even Pattern Analytics & Quantitative Predictor'}
            </p>
          </div>
        </div>

        {/* Middle: Game Selector Tabs */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          gap: '4px'
        }}>
          {Object.values(GAME_MODES).map((g) => {
            const isSelected = selectedGame === g.id;
            return (
              <button
                key={g.id}
                onClick={() => onSelectGame(g.id)}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(79, 172, 254, 0.25))' : 'transparent',
                  color: isSelected ? 'var(--neon-cyan)' : '#94a3b8',
                  border: isSelected ? '1px solid rgba(0, 242, 254, 0.5)' : '1px solid transparent',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                {g.name}
              </button>
            );
          })}
        </div>

        {/* Right: Quick Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            title={isHi ? 'ताज़ा करें' : 'Refresh Data'}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.82rem' }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-slow' : ''} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? (isHi ? 'ध्वनि बंद करें' : 'Mute Sound') : (isHi ? 'ध्वनि चालू करें' : 'Unmute Sound')}
            className="btn-secondary"
            style={{
              padding: '8px 12px',
              fontSize: '0.82rem',
              color: soundEnabled ? 'var(--neon-cyan)' : '#64748b'
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Voice Speech Assistant Toggle */}
          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? (isHi ? 'वॉइस असिस्टेंट बंद करें' : 'Mute Voice') : (isHi ? 'वॉइस असिस्टेंट चालू करें' : 'Enable Voice')}
            className="btn-secondary"
            style={{
              padding: '8px 12px',
              fontSize: '0.82rem',
              color: voiceEnabled ? 'var(--neon-green)' : '#64748b'
            }}
          >
            {voiceEnabled ? <Mic size={16} /> : <MicOff size={16} />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            title="Switch Language"
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.82rem', gap: '6px' }}
          >
            <Globe size={15} />
            <span style={{ fontWeight: 700 }}>{isHi ? 'English' : 'हिन्दी'}</span>
          </button>

          {/* Manual Entry Button */}
          <button
            onClick={onOpenManual}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.82rem', gap: '6px' }}
          >
            <PlusCircle size={15} />
            <span>{isHi ? 'मैन्युअल' : 'Add'}</span>
          </button>

          {/* Martingale Calculator */}
          <button
            onClick={onOpenCalculator}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.82rem' }}
          >
            <Calculator size={15} />
            <span>{isHi ? 'मार्टिंगेल' : '3X Plan'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
