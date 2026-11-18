import { classifyNumber } from './src/utils/engine.js';
import { INITIAL_SEED_HISTORY } from './src/data/seedHistory.js';

// Let's test a refined ensemble on INITIAL_SEED_HISTORY
console.log('Testing prototype on INITIAL_SEED_HISTORY (60 rounds)...');

function predictRound(history, field = 'bigSmall') {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  const N = history.length;
  if (N < 4) return { prediction: valA, confidence: 50 };

  const items = history.map(h => classifyNumber(h.number));
  const chrono = [...items].reverse(); // oldest [0] -> newest [N-1]
  const curVal = items[0][field];
  const lastNum = items[0].number;

  // 1. Full History Digit-to-Field Transition (Bayesian)
  let countA_num = 0;
  let total_num = 0;
  for (let i = 0; i < chrono.length - 1; i++) {
    if (chrono[i].number === lastNum) {
      total_num++;
      if (chrono[i + 1][field] === valA) countA_num++;
    }
  }
  // Bayesian with Beta(4, 4) prior
  const pBayesNumA = (countA_num + 4) / (total_num + 8);

  // 2. Markov Chain (Order 1 & Order 2) on Field
  const last1 = curVal;
  const last2 = items.length > 1 ? `${items[1][field]}->${items[0][field]}` : null;
  const last3 = items.length > 2 ? `${items[2][field]}->${items[1][field]}->${items[0][field]}` : null;

  let m1A = 0, m1Tot = 0;
  let m2A = 0, m2Tot = 0;
  let m3A = 0, m3Tot = 0;

  for (let i = 0; i < chrono.length - 1; i++) {
    if (chrono[i][field] === last1) {
      m1Tot++;
      if (chrono[i + 1][field] === valA) m1A++;
    }
  }
  for (let i = 0; i < chrono.length - 2; i++) {
    if (`${chrono[i][field]}->${chrono[i + 1][field]}` === last2) {
      m2Tot++;
      if (chrono[i + 2][field] === valA) m2A++;
    }
  }
  for (let i = 0; i < chrono.length - 3; i++) {
    if (`${chrono[i][field]}->${chrono[i + 1][field]}->${chrono[i + 2][field]}` === last3) {
      m3Tot++;
      if (chrono[i + 3][field] === valA) m3A++;
    }
  }

  const pM1 = (m1A + 2) / (m1Tot + 4);
  const pM2 = m2Tot >= 2 ? (m2A + 2) / (m2Tot + 4) : pM1;
  const pM3 = m3Tot >= 2 ? (m3A + 2) / (m3Tot + 4) : pM2;
  const pMarkov = pM3 * 0.45 + pM2 * 0.35 + pM1 * 0.20;

  // 3. Streak & Pattern Dynamics (Dragon / Ping-Pong / Double Jump)
  let streakLen = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i][field] === curVal) streakLen++;
    else break;
  }

  // Ping pong detection
  let pingPongLen = 1;
  for (let i = 1; i < items.length; i++) {
    if (items[i][field] !== items[i - 1][field]) pingPongLen++;
    else break;
  }

  let pPattern = 0.50;
  if (pingPongLen >= 4) {
    // Alternation continuation
    pPattern = curVal === valA ? 0.42 : 0.58;
  } else if (streakLen >= 2 && streakLen <= 4) {
    // Trend continuation
    pPattern = curVal === valA ? 0.56 : 0.44;
  } else if (streakLen >= 5) {
    // Deep dragon momentum (ride the trend, slight dampener)
    pPattern = curVal === valA ? 0.55 : 0.45;
  } else {
    // Single jump: check if forming double (A-A-B -> next B)
    if (items.length >= 4) {
      const v0 = items[0][field];
      const v1 = items[1][field];
      const v2 = items[2][field];
      const v3 = items[3][field];
      if (v1 === v2 && v0 !== v1 && v3 !== v2) {
        // Double forming: v0 is single after a pair of v1
        pPattern = v0 === valA ? 0.58 : 0.42;
      }
    }
  }

  // 4. Rolling Window Balance (EWMA / Cluster)
  const win10 = items.slice(0, Math.min(items.length, 12));
  const count10A = win10.filter(x => x[field] === valA).length;
  const pCluster = 0.50 + ((count10A / win10.length) - 0.50) * 0.35;

  // 5. Machine Learning (Signed L2 Logistic Regression on features)
  // Let's combine models
  const probA = pMarkov * 0.35 + pBayesNumA * 0.25 + pPattern * 0.25 + pCluster * 0.15;
  const prediction = probA >= 0.50 ? valA : valB;
  const confidence = Math.min(75, Math.max(50, Math.round(50 + Math.abs(probA - 0.50) * 100)));

  return { prediction, confidence, probA };
}

// Test walk-forward on INITIAL_SEED_HISTORY
for (const field of ['bigSmall', 'oddEven']) {
  let wins = 0;
  let total = 0;
  for (let i = 0; i < INITIAL_SEED_HISTORY.length - 10; i++) {
    const past = INITIAL_SEED_HISTORY.slice(i + 1);
    const actual = classifyNumber(INITIAL_SEED_HISTORY[i].number)[field];
    const pred = predictRound(past, field);
    if (pred.prediction === actual) wins++;
    total++;
  }
  console.log(`Field ${field}: WinRate = ${(wins/total*100).toFixed(1)}% (${wins}/${total})`);
}

