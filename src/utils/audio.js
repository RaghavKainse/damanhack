/**
 * Audio Synthesizer and Voice Assistant for WinGo Predictor
 * Uses Web Audio API for zero-dependency high-fidelity casino/quant sound effects
 * and SpeechSynthesis for real-time voice callouts.
 */

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundManager = {
  enabled: true,
  voiceEnabled: true,
  language: 'hi', // 'hi' or 'en'

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  },

  toggleVoice() {
    this.voiceEnabled = !this.voiceEnabled;
    return this.voiceEnabled;
  },

  setLanguage(lang) {
    this.language = lang;
  },

  // Soft beep for tick countdown
  playTick() {
    if (!this.enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio context might be restricted before interaction
    }
  },

  // Urgent warning beep for locked bet phase (5s to 0s)
  playWarning() {
    if (!this.enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  },

  // Win fanfare chord
  playWin() {
    if (!this.enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.09));
        gain.gain.setValueAtTime(0.12, ctx.currentTime + (idx * 0.09));
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx * 0.09) + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + (idx * 0.09));
        osc.stop(ctx.currentTime + (idx * 0.09) + 0.35);
      });
    } catch {}
  },

  // New prediction generated alert
  playSignal() {
    if (!this.enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  },

  // Voice speech announcement
  speakPrediction(prediction, confidence, action = 'CONFIRMED_BET', topNumber = null, isUltra = false) {
    if (!this.voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel(); // Cancel any existing speech
      
      let text = '';
      if (action === 'WAIT_SKIP') {
        text = this.language === 'hi' 
          ? 'अस्थिर राउंड है, 90 प्रतिशत एक्यूरेसी के लिए यह राउंड छोड़ें।' 
          : 'Choppy round. Skip this round to protect your accuracy.';
      } else {
        if (this.language === 'hi') {
          let typeHindi = prediction;
          if (prediction === 'BIG') typeHindi = 'बड़ा BIG (5, 6, 7, 8, 9)';
          else if (prediction === 'SMALL') typeHindi = 'छोटा SMALL (0, 1, 2, 3, 4)';
          else if (prediction === 'ODD') typeHindi = 'विषम - ODD';
          else if (prediction === 'EVEN') typeHindi = 'सम - EVEN';

          const numText = topNumber !== null && topNumber !== undefined ? `, मुख्य नंबर ${topNumber}` : '';
          const prefix = isUltra ? 'अल्ट्रा पक्का 90 प्रतिशत सिग्नल है' : 'पक्का सिग्नल है';
          text = `${prefix} ${typeHindi}${numText}, विश्वास दर ${confidence} प्रतिशत।`;
        } else {
          const numText = topNumber !== null && topNumber !== undefined ? `, top number ${topNumber}` : '';
          const prefix = isUltra ? 'Ultra Sniper confirmed signal is' : 'Confirmed signal is';
          text = `${prefix} ${prediction}${numText}, with ${confidence} percent confidence.`;
        }
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis unsupported or blocked
    }
  }
};
