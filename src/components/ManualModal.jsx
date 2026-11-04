import React, { useState } from 'react';
import { X, PlusCircle, Check } from 'lucide-react';
import { classifyNumber } from '../utils/engine';

export default function ManualModal({ isOpen, onClose, onAddResult, lastPeriod, language }) {
  const isHi = language === 'hi';
  const [selectedNum, setSelectedNum] = useState(0);
  const [customPeriod, setCustomPeriod] = useState('');

  if (!isOpen) return null;

  const defaultPeriod = lastPeriod 
    ? (BigInt(lastPeriod) + 1n).toString() 
    : `2026110110005${Date.now().toString().slice(-4)}`;

  const periodToUse = customPeriod || defaultPeriod;
  const classified = classifyNumber(selectedNum);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddResult({
      issueNumber: periodToUse,
      number: selectedNum.toString(),
      color: classified.isMixed ? `${classified.color},violet` : classified.color,
      premium: selectedNum.toString(),
      sum: 0
    });
    onClose();
  };

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
        maxWidth: '440px',
        width: '100%',
        padding: '24px',
        border: '1px solid var(--border-glow)',
        boxShadow: 'var(--glow-cyan), var(--glass-shadow)',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(0, 242, 254, 0.15)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--neon-cyan)'
          }}>
            <PlusCircle size={20} />
          </div>
          <div>
            <h3 className="font-heading" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {isHi ? 'मैन्युअल राउंड जोड़ें' : 'Add Manual Draw Result'}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {isHi ? 'कस्टम परिणाम दर्ज कर पैटर्न टेस्ट करें' : 'Record custom draw outcome to test predictive algorithms'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Period ID Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
              {isHi ? 'पीरियड नंबर' : 'Period Number'}
            </label>
            <input
              type="text"
              value={periodToUse}
              onChange={(e) => setCustomPeriod(e.target.value)}
              className="font-mono"
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Winning Number Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              {isHi ? 'विजेता संख्या चुनें (0 - 9)' : 'Select Winning Number (0 - 9)'}
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px'
            }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
                const c = classifyNumber(n);
                const isSelected = selectedNum === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSelectedNum(n)}
                    className={`ball-badge ${
                      c.isMixed 
                        ? (n === 0 ? 'ball-violet-red' : 'ball-violet-green')
                        : (c.color === 'green' ? 'ball-green' : 'ball-red')
                    }`}
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: isSelected ? '3px solid #ffffff' : 'none',
                      transform: isSelected ? 'scale(1.05)' : 'none',
                      boxShadow: isSelected ? '0 0 16px rgba(255, 255, 255, 0.8)' : 'none'
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Number Details */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-around',
            fontSize: '0.82rem'
          }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Type:</span>{' '}
              <strong style={{ color: classified.oddEven === 'ODD' ? 'var(--neon-cyan)' : 'var(--neon-gold)' }}>
                {classified.oddEven}
              </strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Size:</span>{' '}
              <strong>{classified.bigSmall}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8' }}>Color:</span>{' '}
              <strong style={{ color: classified.color === 'green' ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                {classified.colorLabel}
              </strong>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            <Check size={18} />
            <span>{isHi ? 'परिणाम रिकॉर्ड करें' : 'Record & Recalculate'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
