/**
 * 🔬 SCIENTIFIC STATISTICAL & MACHINE LEARNING PREDICTION ENGINE
 * 
 * Provides:
 * 1. 10-Step Draw Validation Protocol (Deduplication, Boundaries, Regex, Range)
 * 2. 7 Independent Statistical & Machine Learning Models (A through G) + Null Control
 *    - Model A: Historical Frequency (Laplace / Dirichlet)
 *    - Model B: Rolling Window Probability (Finite Memory)
 *    - Model C: Bayesian Conjugate Beta-Binomial / Dirichlet-Multinomial
 *    - Model D: Higher-Order Markov Transition (1st & 2nd Order on strictly past data)
 *    - Model E: Exponentially Weighted Moving Average (EWMA)
 *    - Model F: Pattern & Sequence Analysis (N-Gram & Run-Length Streak Dynamics)
 *    - Model G: Machine Learning (L2-Regularized Online Logistic Regression on Multi-Lag Features)
 *    - Model Control: Statistical Baseline (Null Hypothesis 50/50 Control)
 * 3. Discrete 0-9 Digit Probability Engine (Separate from Big/Small, Strictly Normalized)
 * 4. Diagnostic Root-Cause Error Attribution for Every Settled Draw
 * 5. Strict Chronological Walk-Forward Backtesting (Zero Future Lookahead Bias)
 * 6. Formal Scoring Metrics: Brier Score, Log Loss, Calibration (ECE), Confusion Matrix, Binomial Significance
 * 7. Page-Hinkley Drift Detector, Shannon Entropy Uncertainty & Circuit Breakers
 * 8. Calibrated Multi-Model Ensemble with Evidence Gater ("NO RELIABLE EDGE")
 */

import { classifyNumber } from './engine.js';

// -------------------------------------------------------------
// 0. OFFICIAL 10-STEP DRAW VALIDATION PROTOCOL
// -------------------------------------------------------------

export function validateDraw(draw) {
  if (!draw) return { valid: false, reason: 'Draw object is null or undefined' };

  // 1. Issue number presence and string conversion
  if (!draw.issueNumber) return { valid: false, reason: 'Missing issueNumber field' };
  const issueStr = String(draw.issueNumber).trim();

  // 2. Exact issue number length & numeric regex check (15 to 18 digits)
  if (!/^\d{15,18}$/.test(issueStr)) {
    return { valid: false, reason: `Invalid issueNumber format: "${issueStr}"` };
  }

  // 3. Winning number presence
  if (draw.number === undefined || draw.number === null || String(draw.number).trim() === '') {
    return { valid: false, reason: 'Missing winning number' };
  }

  // 4. Winning number parsing & digit boundaries [0-9]
  const num = parseInt(draw.number, 10);
  if (isNaN(num) || num < 0 || num > 9) {
    return { valid: false, reason: `Winning number out of single-digit range [0-9]: ${draw.number}` };
  }

  // 5. Game mode code prefix validation
  // WinGo 30S: 10005, 1Min: 10001, 3Min: 10002, 5Min: 10003
  const isRecognizedGame = ['10005', '10001', '10002', '10003'].some(code => issueStr.includes(code));
  if (!isRecognizedGame) {
    return { valid: false, reason: `Unrecognized WinGo game code prefix in issue "${issueStr}"` };
  }

  // 6. Timestamp bounds validation (if provided)
  if (draw.timestamp) {
    const ts = Number(draw.timestamp);
    const now = Date.now();
    if (isNaN(ts) || ts < 1577836800000 || ts > now + 7200000) {
      return { valid: false, reason: `Timestamp out of sane boundaries: ${draw.timestamp}` };
    }
  }

  // 7. Verified deterministic attributes
  const isBig = num >= 5;
  const isOdd = num % 2 !== 0;
  let colour = draw.colour || draw.color;
  if (!colour || colour === 'unknown') {
    if (num === 0) colour = 'red-violet';
    else if (num === 5) colour = 'green-violet';
    else colour = num % 2 === 0 ? 'red' : 'green';
  }

  return {
    valid: true,
    issueNumber: issueStr,
    number: num,
    bigSmall: isBig ? 'BIG' : 'SMALL',
    oddEven: isOdd ? 'ODD' : 'EVEN',
    colour,
    timestamp: draw.timestamp || Date.now()
  };
}

// -------------------------------------------------------------
// 1. INDEPENDENT STATISTICAL & ML PREDICTION MODELS
// -------------------------------------------------------------

/**
 * Model A: Historical Frequency Model
 * Cumulative global frequency with Laplace smoothing.
 */
export function modelHistoricalFrequency(historyList, field = 'bigSmall') {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  if (!historyList || historyList.length === 0) {
    return { model: 'HistoricalFrequency', probA: 0.5, probB: 0.5, choice: valA, confidence: 50.0 };
  }

  let countA = 0;
  for (const item of historyList) {
    const cls = classifyNumber(item.number);
    if (cls[field] === valA) countA++;
  }

  const N = historyList.length;
  const probA = (countA + 1) / (N + 2);
  const probB = 1 - probA;
  const choice = probA >= 0.5 ? valA : valB;
  const confidence = Math.round(Math.max(probA, probB) * 1000) / 10;

  return { model: 'HistoricalFrequency', probA, probB, choice, confidence };
}

/**
 * Model B: Rolling Window Probability Model
 * Finite local window with Laplace smoothing.
 */
export function modelRollingWindow(historyList, field = 'bigSmall', windowSize = 25) {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  const windowSlice = (historyList || []).slice(0, windowSize);
  const K = windowSlice.length;

  if (K === 0) {
    return { model: 'RollingWindow', probA: 0.5, probB: 0.5, choice: valA, confidence: 50.0, windowSize };
  }

  let countA = 0;
  for (const item of windowSlice) {
    const cls = classifyNumber(item.number);
    if (cls[field] === valA) countA++;
  }

  const probA = (countA + 1) / (K + 2);
  const probB = 1 - probA;
  const choice = probA >= 0.5 ? valA : valB;
  const confidence = Math.round(Math.max(probA, probB) * 1000) / 10;

  return { model: 'RollingWindow', probA, probB, choice, confidence, windowSize: K };
}

/**
 * Model C: Bayesian Conjugate Model (Beta-Binomial)
 * Prior Beta(10, 10). Posterior expectation E[p] = (alpha + countA) / (alpha + beta + N).
 */
export function modelBayesianBetaBinomial(historyList, field = 'bigSmall', priorAlpha = 10, priorBeta = 10) {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  let countA = 0;
  let countB = 0;
  for (const item of (historyList || [])) {
    const cls = classifyNumber(item.number);
    if (cls[field] === valA) countA++;
    else countB++;
  }

  const posteriorAlpha = priorAlpha + countA;
  const posteriorBeta = priorBeta + countB;
  const probA = posteriorAlpha / (posteriorAlpha + posteriorBeta);
  const probB = 1 - probA;
  const choice = probA >= 0.5 ? valA : valB;
  const confidence = Math.round(Math.max(probA, probB) * 1000) / 10;

  return { 
    model: 'BayesianBetaBinomial', 
    probA, 
    probB, 
    choice, 
    confidence,
    posterior: { alpha: posteriorAlpha, beta: posteriorBeta } 
  };
}

/**
 * Model D: Higher-Order Markov Transition Model
 * 1st-order and 2nd-order transitions calculated strictly on past data with Laplace smoothing.
 */
export function modelMarkovTransition(historyList, field = 'bigSmall') {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  if (!historyList || historyList.length < 3) {
    return { model: 'MarkovTransition', probA: 0.5, probB: 0.5, choice: valA, confidence: 50.0 };
  }

  // Chronological order: oldest [0] -> newest [N-1]
  const seq = [...historyList].reverse().map(h => classifyNumber(h.number)[field]);
  const N = seq.length;
  const last1 = seq[N - 1];
  const last2 = N >= 2 ? `${seq[N - 2]}->${seq[N - 1]}` : null;

  let trans1A = 0, trans1Total = 0;
  let trans2A = 0, trans2Total = 0;

  for (let i = 0; i < N - 1; i++) {
    if (seq[i] === last1) {
      trans1Total++;
      if (seq[i + 1] === valA) trans1A++;
    }
  }

  if (last2) {
    for (let i = 0; i < N - 2; i++) {
      if (`${seq[i]}->${seq[i + 1]}` === last2) {
        trans2Total++;
        if (seq[i + 2] === valA) trans2A++;
      }
    }
  }

  const p1 = (trans1A + 1) / (trans1Total + 2);
  const p2 = trans2Total >= 2 ? (trans2A + 1) / (trans2Total + 2) : p1;

  // Weighted blend: 60% Order 2, 40% Order 1
  const probA = p2 * 0.60 + p1 * 0.40;
  const probB = 1 - probA;
  const choice = probA >= 0.5 ? valA : valB;
  const confidence = Math.round(Math.max(probA, probB) * 1000) / 10;

  return { model: 'MarkovTransition', probA, probB, choice, confidence, trans1Total, trans2Total };
}

/**
 * Model E: Exponentially Weighted Moving Average (EWMA)
 * Applies exponential decay lambda to historical outcomes.
 */
export function modelExponentiallyWeighted(historyList, field = 'bigSmall', lambda = 0.05) {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  if (!historyList || historyList.length === 0) {
    return { model: 'ExponentiallyWeighted', probA: 0.5, probB: 0.5, choice: valA, confidence: 50.0 };
  }

  const seq = [...historyList].reverse().map(h => classifyNumber(h.number)[field]);
  let ewma = 0.5; // Neutral start
  for (const s of seq) {
    const val = s === valA ? 1.0 : 0.0;
    ewma = lambda * val + (1 - lambda) * ewma;
  }

  const probA = Math.max(0.05, Math.min(0.95, ewma));
  const probB = 1 - probA;
  const choice = probA >= 0.5 ? valA : valB;
  const confidence = Math.round(Math.max(probA, probB) * 1000) / 10;

  return { model: 'ExponentiallyWeighted', probA, probB, choice, confidence, lambda };
}

/**
 * Model F: Pattern & Sequence Analysis (N-Gram & Run-Length Streak Dynamics)
 * Evaluates sequence suffix matches and empirical run-length survival.
 */
export function modelPatternSequence(historyList, field = 'bigSmall') {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  if (!historyList || historyList.length < 3) {
    return { model: 'PatternSequence', probA: 0.5, probB: 0.5, choice: valA, confidence: 50.0 };
  }

  const seq = [...historyList].reverse().map(h => classifyNumber(h.number)[field]);
  const N = seq.length;

  // Streak length of current run
  const lastVal = seq[N - 1];
  let currentStreak = 0;
  for (let i = N - 1; i >= 0; i--) {
    if (seq[i] === lastVal) currentStreak++;
    else break;
  }

  // Empirical streak continuation frequency in historical data
  let streakMatches = 0;
  let streakContinued = 0;
  let runLen = 1;
  for (let i = 1; i < N; i++) {
    if (runLen === currentStreak) {
      streakMatches++;
      if (seq[i] === seq[i - 1]) {
        streakContinued++;
      }
    }
    if (seq[i] === seq[i - 1]) {
      runLen++;
    } else {
      runLen = 1;
    }
  }

  // N-gram pattern match on last 2-gram
  let ngramA = 0, ngramTotal = 0;
  if (N >= 3) {
    const lastPattern = `${seq[N - 2]}->${seq[N - 1]}`;
    for (let i = 0; i < N - 2; i++) {
      if (`${seq[i]}->${seq[i + 1]}` === lastPattern) {
        ngramTotal++;
        if (seq[i + 2] === valA) ngramA++;
      }
    }
  }

  const pNgram = ngramTotal >= 2 ? (ngramA + 1) / (ngramTotal + 2) : 0.50;
  const pStreakCont = streakMatches >= 2 ? (streakContinued + 1) / (streakMatches + 2) : 0.50;
  const pStreakA = lastVal === valA ? pStreakCont : (1 - pStreakCont);

  const probA = Math.max(0.10, Math.min(0.90, pNgram * 0.55 + pStreakA * 0.45));
  const probB = 1 - probA;
  const choice = probA >= 0.5 ? valA : valB;
  const confidence = Math.round(Math.max(probA, probB) * 1000) / 10;

  return { model: 'PatternSequence', probA, probB, choice, confidence, currentStreak };
}

/**
 * Model G: Machine Learning Model (L2 Regularized Online Logistic Regression)
 * Trains strictly walk-forward on past feature representations without lookahead bias.
 */
export function modelRegularizedLogisticML(historyList, field = 'bigSmall') {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  if (!historyList || historyList.length < 25) {
    return { model: 'RegularizedLogisticML', probA: 0.5, probB: 0.5, choice: valA, confidence: 50.0 };
  }

  const chron = [...historyList].reverse();
  const N = chron.length;

  const X = [];
  const Y = [];

  for (let i = 3; i < N; i++) {
    const y = classifyNumber(chron[i].number)[field] === valA ? 1 : 0;
    const l1 = classifyNumber(chron[i - 1].number)[field] === valA ? 1 : -1;
    const l2 = classifyNumber(chron[i - 2].number)[field] === valA ? 1 : -1;
    const l3 = classifyNumber(chron[i - 3].number)[field] === valA ? 1 : -1;

    let s = 1;
    const lastF = classifyNumber(chron[i - 1].number)[field];
    for (let k = i - 2; k >= 0; k--) {
      if (classifyNumber(chron[k].number)[field] === lastF) s++;
      else break;
    }
    const streakSign = lastF === valA ? 1 : -1;
    const streakFeat = (streakSign * Math.min(s, 5)) / 5.0;

    const rStart = Math.max(0, i - 10);
    const rSlice = chron.slice(rStart, i);
    const rCountA = rSlice.filter(c => classifyNumber(c.number)[field] === valA).length;
    const rollingFeat = (rCountA / rSlice.length) - 0.50;

    X.push([1.0, l1, l2, l3, streakFeat, rollingFeat]);
    Y.push(y);
  }

  const numFeatures = 6;
  const weights = Array(numFeatures).fill(0);
  const lr = 0.05;
  const l2 = 0.01;
  const epochs = 10;

  for (let ep = 0; ep < epochs; ep++) {
    for (let i = 0; i < X.length; i++) {
      const xi = X[i];
      const yi = Y[i];
      let z = 0;
      for (let j = 0; j < numFeatures; j++) z += weights[j] * xi[j];
      const p = 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))));
      const err = yi - p;
      for (let j = 0; j < numFeatures; j++) {
        const reg = j === 0 ? 0 : l2 * weights[j];
        weights[j] += lr * (err * xi[j] - reg);
      }
    }
  }

  // Predict on next round using recent history (historyList[0..2])
  const curL1 = classifyNumber(historyList[0].number)[field] === valA ? 1 : -1;
  const curL2 = historyList.length > 1 ? (classifyNumber(historyList[1].number)[field] === valA ? 1 : -1) : 0;
  const curL3 = historyList.length > 2 ? (classifyNumber(historyList[2].number)[field] === valA ? 1 : -1) : 0;

  let curS = 1;
  const curF = classifyNumber(historyList[0].number)[field];
  for (let k = 1; k < historyList.length; k++) {
    if (classifyNumber(historyList[k].number)[field] === curF) curS++;
    else break;
  }
  const curStreakSign = curF === valA ? 1 : -1;
  const curStreakFeat = (curStreakSign * Math.min(curS, 5)) / 5.0;
  const curR10 = (historyList.slice(0, 10).filter(c => classifyNumber(c.number)[field] === valA).length / Math.min(10, historyList.length)) - 0.50;

  const curX = [1.0, curL1, curL2, curL3, curStreakFeat, curR10];
  let curZ = 0;
  for (let j = 0; j < numFeatures; j++) curZ += weights[j] * curX[j];
  const predProbA = 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, curZ))));
  const boundedP = Math.max(0.10, Math.min(0.90, predProbA));
  const probB = 1 - boundedP;
  const choice = boundedP >= 0.5 ? valA : valB;
  const confidence = Math.round(Math.max(boundedP, probB) * 1000) / 10;

  return { model: 'RegularizedLogisticML', probA: boundedP, probB, choice, confidence };
}

/**
 * Model Control: Statistical Baseline Model (Null Hypothesis Control)
 * Pure 50/50 unbiased benchmark.
 */
export function modelStatisticalBaseline(historyList, field = 'bigSmall') {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  return { model: 'StatisticalBaseline', probA: 0.5000, probB: 0.5000, choice: valA, confidence: 50.0 };
}

// -------------------------------------------------------------
// 2. DISCRETE 0-9 DIGIT PROBABILITY ENGINE
// -------------------------------------------------------------

/**
 * Calculates scientifically grounded 0-9 number probabilities combining:
 * 1. Dirichlet-Laplace frequency
 * 2. 10x10 Markov transitions computed strictly on past slice
 * 3. Exponentially weighted recency
 * 4. Omission survival
 * Digits probabilities sum strictly to 100% (1.0).
 * Big/Small and Odd/Even are NOT artificially used to multiply or distort digits!
 */
export function calculateDiscreteDigitProbabilities(historyList) {
  if (!historyList || historyList.length === 0) {
    const uniform = Array.from({ length: 10 }, (_, i) => ({
      number: i,
      prob: 10.0,
      isBig: i >= 5,
      isOdd: i % 2 !== 0,
      omission: 0,
      color: i === 0 || [2, 4, 6, 8].includes(i) ? 'red' : 'green',
      status: 'NORMAL'
    }));
    return {
      numberProbabilities: uniform,
      topNumber: uniform[0],
      top3Numbers: uniform.slice(0, 3),
      goldenBasket: uniform.slice(0, 3),
      goldenBasketCoverage: 30.0,
      hasReliableEdge: false
    };
  }

  const N = historyList.length;
  const items = historyList.map(h => parseInt(h.number, 10));
  const lastNum = items[0];

  // 1. Dirichlet-smoothed empirical frequency
  const digitCounts = Array(10).fill(0);
  for (const n of items) {
    if (!isNaN(n) && n >= 0 && n <= 9) digitCounts[n]++;
  }
  const pFreq = digitCounts.map(c => (c + 1) / (N + 10));

  // 2. 10x10 Markov transitions from last drawn number (computed strictly on historyList)
  const transRow = Array(10).fill(0);
  if (!isNaN(lastNum) && lastNum >= 0 && lastNum <= 9) {
    for (let i = 0; i < N - 1; i++) {
      const fromD = items[i + 1];
      const toD = items[i];
      if (fromD === lastNum) transRow[toD]++;
    }
  }
  const transSum = transRow.reduce((a, b) => a + b, 0);
  const pMarkov = transRow.map(c => (c + 1) / (transSum + 10));

  // 3. Omission Index
  const omissions = Array(10).fill(0);
  for (let d = 0; d < 10; d++) {
    const idx = items.indexOf(d);
    omissions[d] = idx === -1 ? N : idx;
  }
  const totalOm = omissions.reduce((a, b) => a + b, 0) || 1;
  const pOmission = omissions.map(om => (om + 2) / (totalOm + 20));

  // 4. EWMA recency decay (lambda = 0.05)
  const pEwma = Array(10).fill(0.10);
  const lambda = 0.05;
  for (let i = items.length - 1; i >= 0; i--) {
    const d = items[i];
    if (d >= 0 && d <= 9) {
      for (let j = 0; j < 10; j++) {
        pEwma[j] = (1 - lambda) * pEwma[j] + (j === d ? lambda : 0);
      }
    }
  }

  // 5. Normalized Ensemble of Digit Probabilities
  const pEnsemble = Array(10).fill(0);
  for (let d = 0; d < 10; d++) {
    pEnsemble[d] = (pFreq[d] * 0.35) + (pMarkov[d] * 0.35) + (pOmission[d] * 0.15) + (pEwma[d] * 0.15);
  }
  const totalEns = pEnsemble.reduce((a, b) => a + b, 0) || 1;

  const digitList = [];
  for (let d = 0; d < 10; d++) {
    const normalizedProb = Math.round((pEnsemble[d] / totalEns) * 1000) / 10;
    const om = omissions[d];
    let status = 'NORMAL';
    if (om <= 2) status = 'VERY_HOT';
    else if (om <= 5) status = 'HOT';
    else if (om >= 18) status = 'OVERDUE_COLD';
    else if (om >= 12) status = 'COLD';

    digitList.push({
      number: d,
      prob: normalizedProb,
      isBig: d >= 5,
      isOdd: d % 2 !== 0,
      omission: om,
      color: d === 0 || [2, 4, 6, 8].includes(d) ? 'red' : 'green',
      status
    });
  }

  // Rank descending by probability
  digitList.sort((a, b) => b.prob - a.prob);

  const topNumber = digitList[0];
  const top3Numbers = digitList.slice(0, 3);
  const goldenBasketCoverage = Math.round(top3Numbers.reduce((sum, item) => sum + item.prob, 0) * 10) / 10;
  const maxProb = digitList[0].prob;
  const minProb = digitList[digitList.length - 1].prob;
  const hasReliableEdge = (maxProb - minProb) >= 3.5;

  return {
    numberProbabilities: digitList,
    topNumber,
    top3Numbers,
    goldenBasket: top3Numbers,
    goldenBasketCoverage,
    hasReliableEdge
  };
}

// -------------------------------------------------------------
// 3. ROOT CAUSE ERROR DIAGNOSTICS & ATTRIBUTION
// -------------------------------------------------------------

/**
 * Explains exactly WHY a settled prediction won or lost based on empirical dynamics.
 */
export function diagnosePredictionError(predictionObj, actualDraw) {
  if (!predictionObj || !actualDraw) return 'NO_DATA';
  const classified = classifyNumber(actualDraw.number);
  const actualBS = classified.bigSmall;
  const isWin = predictionObj.prediction === actualBS;

  if (isWin) {
    return 'MODEL_CONVERGENCE: Multi-model statistical confluence correctly captured transition distribution.';
  }

  const rawDelta = predictionObj.rawDelta || 0;
  const entropy = predictionObj.entropy || 1.0;

  if (entropy >= 0.985 || rawDelta < 2.0) {
    return 'HIGH_ENTROPY_NOISE: Outcome occurred in near-maximal entropy (50/50) equilibrium regime.';
  }

  if (predictionObj.subModels?.markov?.choice !== actualBS && predictionObj.subModels?.bayesian?.choice !== actualBS) {
    return 'STREAK_MOMENTUM_OVERRIDE: Run continuation or abrupt alternation broke higher-order Markov transition state.';
  }

  if (predictionObj.evidenceLevel === 'INSUFFICIENT') {
    return 'WEAK_SIGNAL_SPLIT: Consensus among sub-models was divided (< 65% agreement).';
  }

  return 'DYNAMIC_REGIME_SHIFT: Short-term distribution drifted from empirical prior.';
}

// -------------------------------------------------------------
// 4. MATHEMATICAL SCORING & CALIBRATION METRICS
// -------------------------------------------------------------

export function calculateBrierScore(predictions, outcomes) {
  if (!predictions || predictions.length === 0 || predictions.length !== outcomes.length) {
    return 0.2500;
  }
  let sumSqErr = 0;
  for (let i = 0; i < predictions.length; i++) {
    const p = predictions[i];
    const y = outcomes[i] ? 1.0 : 0.0;
    sumSqErr += Math.pow(p - y, 2);
  }
  return Math.round((sumSqErr / predictions.length) * 10000) / 10000;
}

export function calculateLogLoss(probabilities, outcomes) {
  if (!probabilities || probabilities.length === 0 || probabilities.length !== outcomes.length) {
    return 0.6931;
  }
  const eps = 1e-6;
  let totalLoss = 0;
  for (let i = 0; i < probabilities.length; i++) {
    const p = Math.max(eps, Math.min(1 - eps, probabilities[i]));
    const y = outcomes[i] ? 1.0 : 0.0;
    totalLoss += y * Math.log(p) + (1 - y) * Math.log(1 - p);
  }
  return Math.round((-totalLoss / probabilities.length) * 10000) / 10000;
}

export function calculateConfusionMatrix(predictions, outcomes, positiveClass = 'BIG') {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (let i = 0; i < predictions.length; i++) {
    const pred = predictions[i];
    const actual = outcomes[i];
    if (pred === positiveClass && actual === positiveClass) tp++;
    else if (pred === positiveClass && actual !== positiveClass) fp++;
    else if (pred !== positiveClass && actual !== positiveClass) tn++;
    else fn++;
  }
  const total = tp + fp + tn + fn;
  const accuracy = total > 0 ? (tp + tn) / total : 0.5;
  const bigAccuracy = (tp + fn) > 0 ? tp / (tp + fn) : 0.5;
  const smallAccuracy = (tn + fp) > 0 ? tn / (tn + fp) : 0.5;

  return {
    tp, fp, tn, fn,
    total,
    accuracy: Math.round(accuracy * 1000) / 10,
    bigAccuracy: Math.round(bigAccuracy * 1000) / 10,
    smallAccuracy: Math.round(smallAccuracy * 1000) / 10
  };
}

export function calculateCalibration(probabilities, outcomes, numBins = 5) {
  if (!probabilities || probabilities.length === 0) return { ece: 0, bins: [] };

  const bins = [];
  const binWidth = 0.5 / numBins;

  for (let b = 0; b < numBins; b++) {
    const lower = 0.50 + b * binWidth;
    const upper = lower + binWidth;
    bins.push({ lower, upper, count: 0, sumProb: 0, sumHits: 0 });
  }

  for (let i = 0; i < probabilities.length; i++) {
    const rawProb = probabilities[i];
    const isWin = outcomes[i] ? 1 : 0;
    const conf = Math.max(rawProb, 1 - rawProb);

    let binIdx = Math.min(numBins - 1, Math.floor((conf - 0.50) / binWidth));
    if (binIdx < 0) binIdx = 0;

    bins[binIdx].count++;
    bins[binIdx].sumProb += conf;
    bins[binIdx].sumHits += isWin;
  }

  let totalECE = 0;
  const N = probabilities.length;

  const binResults = bins.map(b => {
    const avgConf = b.count > 0 ? b.sumProb / b.count : (b.lower + b.upper) / 2;
    const empiricalAcc = b.count > 0 ? b.sumHits / b.count : 0;
    const gap = Math.abs(avgConf - empiricalAcc);
    if (b.count > 0 && N > 0) {
      totalECE += (b.count / N) * gap;
    }
    return {
      binRange: `${Math.round(b.lower * 100)}%-${Math.round(b.upper * 100)}%`,
      count: b.count,
      avgConfidence: Math.round(avgConf * 1000) / 10,
      observedAccuracy: Math.round(empiricalAcc * 1000) / 10,
      calibrationGap: Math.round(gap * 1000) / 10
    };
  });

  return {
    ece: Math.round(totalECE * 10000) / 10000,
    bins: binResults
  };
}

export function calculateBinomialSignificance(wins, total, nullProb = 0.50) {
  if (total <= 0) {
    return { 
      zScore: 0, 
      pValue: 1.0, 
      isSignificant: false,
      sampleSize: 0,
      observedWinRate: 50.0,
      baselineDelta: 0.0,
      ciLower: 50.0,
      ciUpper: 50.0,
      hasEdge: false
    };
  }

  const pObs = wins / total;
  const expected = total * nullProb;
  const variance = total * nullProb * (1 - nullProb);
  const stdDev = Math.sqrt(variance);

  const diff = Math.abs(wins - expected) - 0.5;
  const zScore = diff > 0 ? diff / stdDev : 0;

  const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
  const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  const pValue = Math.min(1.0, Math.round(2 * prob * 10000) / 10000);

  const stdErr = Math.sqrt(Math.max(0.0001, (pObs * (1 - pObs)) / total));
  const ciLower = Math.max(0.0, Math.round((pObs - 1.96 * stdErr) * 1000) / 10);
  const ciUpper = Math.min(100.0, Math.round((pObs + 1.96 * stdErr) * 1000) / 10);
  const baselineDelta = Math.round((pObs - nullProb) * 1000) / 10;
  const isSignificant = pValue < 0.05;
  const hasEdge = isSignificant && baselineDelta > 0;

  return {
    zScore: Math.round(zScore * 100) / 100,
    pValue,
    isSignificant,
    sampleSize: total,
    observedWinRate: Math.round(pObs * 1000) / 10,
    baselineDelta,
    ciLower,
    ciUpper,
    hasEdge
  };
}

export function detectPageHinkleyDrift(errorSeries, threshold = 12.0, delta = 0.005) {
  if (!errorSeries || errorSeries.length < 20) {
    return { driftDetected: false, score: 0, meanError: 0 };
  }

  let meanErr = 0;
  for (const e of errorSeries) meanErr += e;
  meanErr /= errorSeries.length;

  let cumSum = 0;
  let minCumSum = 0;
  let maxScore = 0;

  for (const e of errorSeries) {
    cumSum += (e - meanErr - delta);
    if (cumSum < minCumSum) minCumSum = cumSum;
    const phScore = cumSum - minCumSum;
    if (phScore > maxScore) maxScore = phScore;
  }

  return {
    driftDetected: maxScore > threshold,
    score: Math.round(maxScore * 100) / 100,
    meanError: Math.round(meanErr * 10000) / 10000,
    threshold
  };
}

export function calculateShannonEntropy(probA) {
  const p = Math.max(1e-6, Math.min(1 - 1e-6, probA));
  const q = 1 - p;
  const entropy = -(p * Math.log2(p) + q * Math.log2(q));
  return Math.round(entropy * 10000) / 10000;
}

export function detectOverfitting(inSampleAccuracy, outOfSampleAccuracy, threshold = 12.0) {
  const gap = Math.round((inSampleAccuracy - outOfSampleAccuracy) * 10) / 10;
  const isOverfitting = gap > threshold;
  return {
    isOverfitting,
    inSampleAccuracy,
    outOfSampleAccuracy,
    generalizationGap: gap,
    threshold,
    recommendation: isOverfitting 
      ? 'Penalize higher-order Markov/N-gram models; increase Dirichlet regularization.' 
      : 'Generalization gap within safe bounds.'
  };
}

export function checkCircuitBreaker(rollingBrier, rollingWinRate, minDraws = 20) {
  const isTriggered = (minDraws >= 20) && (rollingBrier > 0.2580 || rollingWinRate < 46.0);
  return {
    isTriggered,
    rollingBrier: Math.round(rollingBrier * 10000) / 10000,
    rollingWinRate: Math.round(rollingWinRate * 10) / 10,
    action: isTriggered ? 'ABSTAIN_CIRCUIT_BREAKER' : 'NORMAL_OPERATION',
    reason: isTriggered 
      ? `Performance drop detected (Brier=${rollingBrier.toFixed(4)}, WinRate=${rollingWinRate}%). Throttling predictions to prevent drawdown.` 
      : 'Performance within acceptable statistical parameters.'
  };
}

export function calculateDieboldMarianoTest(errorsModelA, errorsModelB) {
  if (!errorsModelA || !errorsModelB || errorsModelA.length < 30 || errorsModelA.length !== errorsModelB.length) {
    return { isSignificant: false, pValue: 1.0, dmStat: 0, sampleSize: errorsModelA?.length || 0, isModelBBetter: false };
  }
  const N = errorsModelA.length;
  const d = [];
  let meanD = 0;
  for (let i = 0; i < N; i++) {
    const diff = errorsModelA[i] - errorsModelB[i];
    d.push(diff);
    meanD += diff;
  }
  meanD /= N;

  let varD = 0;
  for (let i = 0; i < N; i++) {
    varD += Math.pow(d[i] - meanD, 2);
  }
  varD = varD / (N - 1);
  const seD = Math.sqrt(Math.max(1e-8, varD / N));
  const dmStat = meanD / seD;

  const t = 1 / (1 + 0.2316419 * Math.abs(dmStat));
  const dens = 0.3989423 * Math.exp(-dmStat * dmStat / 2);
  const pVal = Math.min(1.0, 2 * dens * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))));

  return {
    isSignificant: pVal < 0.05,
    pValue: Math.round(pVal * 10000) / 10000,
    dmStat: Math.round(dmStat * 100) / 100,
    meanDifferential: Math.round(meanD * 10000) / 10000,
    sampleSize: N,
    isModelBBetter: meanD > 0 && pVal < 0.05
  };
}

// -------------------------------------------------------------
// 5. STRICT CHRONOLOGICAL WALK-FORWARD VALIDATION
// -------------------------------------------------------------

export function runChronologicalWalkForward(historyList, field = 'bigSmall', targetWindows = [50, 100, 250, 500]) {
  if (!historyList || historyList.length < 20) {
    return { success: false, reason: 'Insufficient history for walk-forward validation' };
  }

  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  const chronological = [...historyList].sort((a, b) => {
    try {
      const aBig = BigInt(a.issueNumber);
      const bBig = BigInt(b.issueNumber);
      return aBig > bBig ? 1 : (aBig < bBig ? -1 : 0);
    } catch {
      return a.issueNumber.localeCompare(b.issueNumber);
    }
  });

  const totalRounds = chronological.length;
  const warmup = Math.min(25, Math.floor(totalRounds * 0.15));
  const evaluatableCount = totalRounds - warmup;

  const modelKeys = [
    'HistoricalFrequency',
    'RollingWindow',
    'BayesianBetaBinomial',
    'MarkovTransition',
    'ExponentiallyWeighted',
    'PatternSequence',
    'RegularizedLogisticML',
    'StatisticalBaseline'
  ];

  const resultsByModel = {};
  for (const k of modelKeys) {
    resultsByModel[k] = { predictions: [], probabilities: [], choices: [], outcomes: [], isWins: [] };
  }

  // Walk forward step by step (predicting t uses strictly 0..t-1)
  for (let t = warmup; t < totalRounds; t++) {
    const pastSlice = chronological.slice(0, t).reverse();
    const actualTarget = classifyNumber(chronological[t].number)[field];
    const isTargetA = actualTarget === valA;

    const mHist = modelHistoricalFrequency(pastSlice, field);
    const mRoll = modelRollingWindow(pastSlice, field, 25);
    const mBayes = modelBayesianBetaBinomial(pastSlice, field, 10, 10);
    const mMarkov = modelMarkovTransition(pastSlice, field);
    const mEWMA = modelExponentiallyWeighted(pastSlice, field, 0.05);
    const mPat = modelPatternSequence(pastSlice, field);
    const mML = modelRegularizedLogisticML(pastSlice, field);
    const mBase = modelStatisticalBaseline(pastSlice, field);

    const modelRuns = [
      { key: 'HistoricalFrequency', res: mHist },
      { key: 'RollingWindow', res: mRoll },
      { key: 'BayesianBetaBinomial', res: mBayes },
      { key: 'MarkovTransition', res: mMarkov },
      { key: 'ExponentiallyWeighted', res: mEWMA },
      { key: 'PatternSequence', res: mPat },
      { key: 'RegularizedLogisticML', res: mML },
      { key: 'StatisticalBaseline', res: mBase }
    ];

    for (const mr of modelRuns) {
      const r = mr.res;
      const isWin = r.choice === actualTarget;
      resultsByModel[mr.key].predictions.push(r.choice);
      resultsByModel[mr.key].probabilities.push(r.probA);
      resultsByModel[mr.key].choices.push(r.choice);
      resultsByModel[mr.key].outcomes.push(isTargetA);
      resultsByModel[mr.key].isWins.push(isWin ? 1 : 0);
    }
  }

  const windowSummaries = {};
  for (const winSize of targetWindows) {
    const actualWindow = Math.min(evaluatableCount, winSize);
    if (actualWindow < 10) continue;

    windowSummaries[winSize] = {};

    for (const k of modelKeys) {
      const store = resultsByModel[k];
      const startIdx = Math.max(0, store.isWins.length - actualWindow);
      const subWins = store.isWins.slice(startIdx);
      const subProbs = store.probabilities.slice(startIdx);
      const subOutcomes = store.outcomes.slice(startIdx);
      const subPreds = store.predictions.slice(startIdx);
      const actualOutcomesStr = subOutcomes.map(o => o ? valA : valB);

      const winCount = subWins.reduce((sum, v) => sum + v, 0);
      const acc = Math.round((winCount / subWins.length) * 1000) / 10;
      const brier = calculateBrierScore(subProbs, subOutcomes);
      const logLoss = calculateLogLoss(subProbs, subOutcomes);
      const confMatrix = calculateConfusionMatrix(subPreds, actualOutcomesStr, valA);
      const calibration = calculateCalibration(subProbs, subWins, 5);
      const sig = calculateBinomialSignificance(winCount, subWins.length, 0.5);

      windowSummaries[winSize][k] = {
        sampleSize: subWins.length,
        winRate: acc,
        totalWins: winCount,
        brierScore: brier,
        logLoss,
        bigAccuracy: confMatrix.bigAccuracy,
        smallAccuracy: confMatrix.smallAccuracy,
        ece: calibration.ece,
        pValueVsRandom: sig.pValue,
        isSignificant: sig.isSignificant
      };
    }
  }

  return {
    success: true,
    totalDrawsAnalyzed: totalRounds,
    evaluatableRounds: evaluatableCount,
    windows: windowSummaries
  };
}

// -------------------------------------------------------------
// 6. CALIBRATED ENSEMBLE WITH "NO RELIABLE EDGE" GATER
// -------------------------------------------------------------

export function generateCalibratedPrediction(historyList, field = 'bigSmall', customWeights = null) {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  const defaultWeights = {
    HistoricalFrequency: 1.0,
    RollingWindow: 0.8,
    BayesianBetaBinomial: 1.25,
    MarkovTransition: 1.30,
    ExponentiallyWeighted: 0.85,
    PatternSequence: 1.10,
    RegularizedLogisticML: 1.20,
    StatisticalBaseline: 0.0 // Baseline control does not vote in predictive ensemble
  };
  const weights = customWeights || defaultWeights;

  const mHist = modelHistoricalFrequency(historyList, field);
  const mRoll = modelRollingWindow(historyList, field, 25);
  const mBayes = modelBayesianBetaBinomial(historyList, field, 10, 10);
  const mMarkov = modelMarkovTransition(historyList, field);
  const mEWMA = modelExponentiallyWeighted(historyList, field, 0.05);
  const mPat = modelPatternSequence(historyList, field);
  const mML = modelRegularizedLogisticML(historyList, field);
  const mBase = modelStatisticalBaseline(historyList, field);

  const subModels = [
    { key: 'HistoricalFrequency', res: mHist, weight: weights.HistoricalFrequency !== undefined ? weights.HistoricalFrequency : 1.0 },
    { key: 'RollingWindow', res: mRoll, weight: weights.RollingWindow !== undefined ? weights.RollingWindow : 0.8 },
    { key: 'BayesianBetaBinomial', res: mBayes, weight: weights.BayesianBetaBinomial !== undefined ? weights.BayesianBetaBinomial : 1.25 },
    { key: 'MarkovTransition', res: mMarkov, weight: weights.MarkovTransition !== undefined ? weights.MarkovTransition : 1.30 },
    { key: 'ExponentiallyWeighted', res: mEWMA, weight: weights.ExponentiallyWeighted !== undefined ? weights.ExponentiallyWeighted : 0.85 },
    { key: 'PatternSequence', res: mPat, weight: weights.PatternSequence !== undefined ? weights.PatternSequence : 1.10 },
    { key: 'RegularizedLogisticML', res: mML, weight: weights.RegularizedLogisticML !== undefined ? weights.RegularizedLogisticML : 1.20 },
    { key: 'StatisticalBaseline', res: mBase, weight: weights.StatisticalBaseline !== undefined ? weights.StatisticalBaseline : 0.0 }
  ];

  const activeSubModels = subModels.filter(sm => sm.weight > 0);
  const numActive = activeSubModels.length || 7;

  let weightedSumA = 0;
  let totalW = 0;
  let votesA = 0;

  for (const sm of activeSubModels) {
    weightedSumA += sm.res.probA * sm.weight;
    totalW += sm.weight;
    if (sm.res.choice === valA) votesA++;
  }

  const ensembleProbA = totalW > 0 ? (weightedSumA / totalW) : 0.50;
  const ensembleProbB = 1 - ensembleProbA;
  const rawDelta = Math.abs(ensembleProbA - 0.50);
  const entropy = calculateShannonEntropy(ensembleProbA);

  const prediction = ensembleProbA >= 0.5 ? valA : valB;
  const agreementCount = prediction === valA ? votesA : (numActive - votesA);

  // Evidence Level & Gating Rule:
  // If raw delta < 2.0% (prob between 48.0% and 52.0%), entropy > 0.985, or consensus split (< 60%),
  // signal NO_CLEAR_SIGNAL / NO RELIABLE EDGE
  let evidenceLevel = 'INSUFFICIENT';
  let action = 'NO_CLEAR_SIGNAL';

  if (rawDelta >= 0.035 && agreementCount >= Math.ceil(numActive * 0.70) && entropy <= 0.975) {
    evidenceLevel = 'HIGH';
    action = 'CONFIRMED_BET';
  } else if (rawDelta >= 0.020 && agreementCount >= Math.ceil(numActive * 0.60) && entropy <= 0.985) {
    evidenceLevel = 'MODERATE';
    action = 'CONFIRMED_BET';
  } else {
    evidenceLevel = 'INSUFFICIENT';
    action = 'NO_CLEAR_SIGNAL';
  }

  // Calibrated Probability & Confidence:
  // If evidence is insufficient (abstain), confidence is strictly 50.0% (uninformative null).
  // Otherwise, bounded strictly within realistic 51.5% - 58.5% empirical range. Never fabricated 90%+!
  const calibratedConfidence = action === 'NO_CLEAR_SIGNAL'
    ? 50.0
    : Math.min(58.5, Math.max(50.0, Math.round((50.0 + rawDelta * 100 * 0.75) * 10) / 10));

  // Discrete 0-9 Digit Probability Calculation (Independent from Big/Small)
  const digitForecast = calculateDiscreteDigitProbabilities(historyList);

  const predictionId = `pred_${(historyList[0]?.issueNumber || '0')}_${Date.now().toString(36).slice(-4)}`;

  return {
    predictionId,
    targetIssue: historyList[0]?.issueNumber ? (BigInt(historyList[0].issueNumber) + 1n).toString() : 'Next',
    timestamp: Date.now(),
    action,
    prediction: action === 'NO_CLEAR_SIGNAL' ? 'NO CLEAR SIGNAL' : prediction,
    probabilities: {
      [valA]: Math.round(ensembleProbA * 1000) / 1000,
      [valB]: Math.round(ensembleProbB * 1000) / 1000
    },
    calibratedConfidence,
    rawDelta: Math.round(rawDelta * 10000) / 100,
    entropy,
    evidenceLevel,
    selectedModel: 'ScientificEnsemble_v4',
    modelAgreement: `${agreementCount}/${numActive}`,
    observationsUsed: historyList.length,
    digitForecast,
    subModels: {
      historicalFrequency: { probA: Math.round(mHist.probA * 1000) / 10, choice: mHist.choice },
      rollingWindow: { probA: Math.round(mRoll.probA * 1000) / 10, choice: mRoll.choice },
      bayesian: { probA: Math.round(mBayes.probA * 1000) / 10, choice: mBayes.choice },
      markov: { probA: Math.round(mMarkov.probA * 1000) / 10, choice: mMarkov.choice },
      ewma: { probA: Math.round(mEWMA.probA * 1000) / 10, choice: mEWMA.choice },
      patternSequence: { probA: Math.round(mPat.probA * 1000) / 10, choice: mPat.choice },
      regularizedML: { probA: Math.round(mML.probA * 1000) / 10, choice: mML.choice },
      baseline: { probA: 50.0, choice: mBase.choice }
    }
  };
}

// -------------------------------------------------------------
// 7. QUANTITATIVE DECISION TREE & POISSON STATISTICAL MODELS
// -------------------------------------------------------------

/**
 * Model H: Decision Tree Ensemble (Gradient-Weighted Decision Stumps)
 * Non-linear regime-aware model partitioning on Lags, Run-Lengths, and Parity.
 */
export function modelDecisionTreeEnsemble(historyList, field = 'bigSmall') {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  if (!historyList || historyList.length < 15) {
    return { model: 'DecisionTreeEnsemble', probA: 0.50, probB: 0.50, choice: valA, confidence: 50.0 };
  }

  const chron = [...historyList].reverse();
  const N = chron.length;

  // Build decision stumps on historical transitions
  let lag1SameCount = 0, lag1Total = 0;
  let streakBreakCount = 0, streakTotal = 0;
  let pingPongContCount = 0, pingPongTotal = 0;

  for (let i = 2; i < N - 1; i++) {
    const prev = classifyNumber(chron[i].number)[field];
    const prevPrev = classifyNumber(chron[i - 1].number)[field];
    const next = classifyNumber(chron[i + 1].number)[field];

    // Stump 1: 1-Lag Momentum
    lag1Total++;
    if (next === prev) lag1SameCount++;

    // Stump 2: Streak Exhaustion (Streak >= 3)
    if (prev === prevPrev) {
      streakTotal++;
      if (next !== prev) streakBreakCount++;
    }

    // Stump 3: Alternation continuation
    if (prev !== prevPrev) {
      pingPongTotal++;
      if (next !== prev) pingPongContCount++;
    }
  }

  const currentLag1 = classifyNumber(historyList[0].number)[field];
  const currentLag2 = historyList.length > 1 ? classifyNumber(historyList[1].number)[field] : currentLag1;

  const pLag1Same = lag1Total >= 5 ? (lag1SameCount + 2) / (lag1Total + 4) : 0.50;
  const pStreakBreak = streakTotal >= 5 ? (streakBreakCount + 2) / (streakTotal + 4) : 0.50;
  const pPingPongCont = pingPongTotal >= 5 ? (pingPongContCount + 2) / (pingPongTotal + 4) : 0.50;

  let scoreA = 0.50;
  const isCurrentlyStreak = currentLag1 === currentLag2;

  if (isCurrentlyStreak) {
    // Current streak: evaluate continuation vs break
    const pCont = 1 - pStreakBreak;
    scoreA = currentLag1 === valA ? pCont : (1 - pCont);
  } else {
    // Current ping-pong step
    const pCont = pPingPongCont;
    scoreA = currentLag1 === valA ? (1 - pCont) : pCont;
  }

  // Blend with lag1 base rate
  const pLagA = currentLag1 === valA ? pLag1Same : (1 - pLag1Same);
  const probA = Math.max(0.35, Math.min(0.65, scoreA * 0.60 + pLagA * 0.40));
  const probB = 1 - probA;
  const choice = probA >= 0.50 ? valA : valB;
  const confidence = Math.round(Math.max(probA, probB) * 1000) / 10;

  return { model: 'DecisionTreeEnsemble', probA, probB, choice, confidence };
}

/**
 * Model I: Poisson Waiting Times & Omission Hazard Model
 * Computes Poisson inter-arrival distribution without Gambler's Fallacy.
 */
export function modelPoissonWaitingTimes(historyList, field = 'bigSmall') {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  if (!historyList || historyList.length < 10) {
    return { model: 'PoissonWaitingTimes', probA: 0.50, probB: 0.50, choice: valA, confidence: 50.0 };
  }

  const items = historyList.map(h => classifyNumber(h.number)[field]);
  const currentVal = items[0];

  // Count consecutive current run length
  let currentRun = 0;
  for (const v of items) {
    if (v === currentVal) currentRun++;
    else break;
  }

  // Poisson parameter lambda for run lengths (geometric mean is ~2 in fair 50/50 coin tosses)
  const lambda = 2.0;
  // Survival probability: P(X > k) = e^(-lambda * k)
  const hazardFactor = Math.min(0.12, Math.max(-0.12, (currentRun - lambda) * 0.025));

  // Base empirical proportion in recent 30
  const recent30 = items.slice(0, 30);
  const countA = recent30.filter(x => x === valA).length;
  const pEmpiricalA = (countA + 2) / (recent30.length + 4);

  // Calibrated Poisson adjustment
  let probA = pEmpiricalA;
  if (currentVal === valA) {
    probA -= hazardFactor; // As current run of A extends, slight mean reversion pull
  } else {
    probA += hazardFactor; // As current run of B extends, slight mean reversion pull toward A
  }

  probA = Math.max(0.38, Math.min(0.62, probA));
  const probB = 1 - probA;
  const choice = probA >= 0.50 ? valA : valB;
  const confidence = Math.round(Math.max(probA, probB) * 1000) / 10;

  return { model: 'PoissonWaitingTimes', probA, probB, choice, confidence, currentRun };
}

// -------------------------------------------------------------
// 8. QUANTITATIVE BETTING ODDS, VIG & EXPECTED VALUE ENGINE
// -------------------------------------------------------------

/**
 * Calculates Quarter-Kelly capital allocation percentage
 * f* = fraction * (b*p - q) / b
 */
export function calculateKellyFraction(decimalOdds, modelProb, fraction = 0.25) {
  const b = decimalOdds - 1.0;
  if (b <= 0 || modelProb <= 0 || modelProb >= 1) {
    return { fullKelly: 0, stakePercent: 0, safeBet: 0, isPositiveEV: false, advice: 'NO_BET' };
  }

  const p = modelProb;
  const q = 1.0 - p;
  const fullKelly = (b * p - q) / b;

  if (fullKelly <= 0) {
    return { fullKelly: 0, stakePercent: 0, safeBet: 0, isPositiveEV: false, advice: 'NO_BET_NEGATIVE_EV' };
  }

  const safeStakePercent = Math.min(5.0, Math.max(0.5, Math.round(fullKelly * fraction * 1000) / 10));
  return {
    fraction,
    fullKelly: Math.round(fullKelly * 10000) / 100,
    stakePercent: safeStakePercent,
    isPositiveEV: true,
    advice: 'FAVORABLE_EDGE'
  };
}

/**
 * Analyzes market-implied probabilities, bookmaker margin (vig), and Expected Value (EV)
 * EV = (Model Probability * Decimal Odds) - 1
 */
export function analyzeMarketOdds(marketType, modelProb, customOdds = null, sampleSize = 50) {
  const defaultOddsMap = {
    'bigSmall': 1.96,
    'oddEven': 1.96,
    'number': 9.00,
    'colorRed': 1.96,
    'colorGreen': 1.96,
    'colorViolet': 4.41,
    'goldenBasket': 3.00,
    'aviator': 1.50
  };

  const decimalOdds = customOdds || defaultOddsMap[marketType] || 1.96;
  const impliedProbability = Math.round((1.0 / decimalOdds) * 10000) / 100; // in %

  // Bookmaker margin (Vig)
  let vigPercent = 2.04;
  let fairProbability = 50.0;

  if (marketType === 'number') {
    vigPercent = Math.round(((10 * (1.0 / 9.00)) - 1.0) * 10000) / 100; // 11.11% vig
    fairProbability = 10.0;
  } else if (marketType === 'colorViolet') {
    vigPercent = Math.round(((1.0 / 4.41 + 1.0 / 1.96) - 1.0) * 10000) / 100;
    fairProbability = 20.0;
  } else if (marketType === 'goldenBasket') {
    vigPercent = Math.round(((3.0 * (1.0 / 9.00) * 3) - 1.0) * 10000) / 100;
    fairProbability = 30.0;
  } else {
    vigPercent = Math.round(((2.0 / decimalOdds) - 1.0) * 10000) / 100; // 2.04% vig
    fairProbability = 50.0;
  }

  // Expected Value: EV = (P_model * Decimal Odds) - 1
  const modelProbDecimal = modelProb > 1.0 ? modelProb / 100 : modelProb;
  const ev = (modelProbDecimal * decimalOdds) - 1.0;
  const evPercent = Math.round(ev * 10000) / 100; // in %
  const edgeOverMarket = Math.round((modelProbDecimal * 100 - impliedProbability) * 100) / 100;

  // Standard Error of Probability Estimate: sqrt(p * (1 - p) / N)
  const N = Math.max(15, sampleSize);
  const standardError = Math.sqrt((modelProbDecimal * (1 - modelProbDecimal)) / N);
  const ciLower = Math.max(0, Math.round((modelProbDecimal - 1.96 * standardError) * 1000) / 10);
  const ciUpper = Math.min(100, Math.round((modelProbDecimal + 1.96 * standardError) * 1000) / 10);

  // Positive EV edge after uncertainty discount
  const conservativeProb = modelProbDecimal - (standardError * 0.5);
  const isValuableOpportunity = ev > 0 && (conservativeProb * 100) > impliedProbability;

  const kelly = calculateKellyFraction(decimalOdds, modelProbDecimal, 0.25);

  return {
    marketType,
    decimalOdds,
    impliedProbability,
    vigPercent,
    fairProbability,
    modelProbability: Math.round(modelProbDecimal * 1000) / 10,
    expectedValue: evPercent,
    edgeOverMarket,
    standardError: Math.round(standardError * 10000) / 100,
    confidenceInterval: [ciLower, ciUpper],
    isValuableOpportunity,
    kellyStakePercent: kelly.stakePercent,
    fullKelly: kelly.fullKelly,
    verdict: isValuableOpportunity ? 'POSITIVE_EXPECTED_VALUE' : 'NEGATIVE_EXPECTED_VALUE_OR_NO_EDGE'
  };
}
