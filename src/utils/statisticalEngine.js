/**
 * 🔬 STATISTICAL MACHINE LEARNING PREDICTION & EVALUATION ENGINE
 * 
 * Provides:
 * 1. Six Independent Statistical Models (A through F)
 * 2. Strict Chronological Walk-Forward Validation Engine
 * 3. Formal Scoring Metrics: Brier Score, Log Loss, Calibration, Confusion Matrix, Binomial Test
 * 4. Page-Hinkley Concept Drift Detector
 * 5. Model Version Control & Safe Promotion Registry
 * 6. Calibrated Probability & "NO CLEAR SIGNAL" Evidence Gater
 */

import { classifyNumber } from './engine.js';

// -------------------------------------------------------------
// 1. SIX INDEPENDENT STATISTICAL MODELS
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
  // Uniform Laplace smoothing (+1 / +2)
  const probA = (countA + 1) / (N + 2);
  const probB = 1 - probA;
  const choice = probA >= 0.5 ? valA : valB;
  const confidence = Math.round(Math.max(probA, probB) * 1000) / 10;

  return { model: 'HistoricalFrequency', probA, probB, choice, confidence };
}

/**
 * Model B: Rolling Window Probability Model
 * Finite local window (e.g. K = 25 or K = 50) with Laplace smoothing.
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
 * 1st-order P(Y_t | Y_{t-1}) and 2nd-order P(Y_t | Y_{t-1}, Y_{t-2}) with Laplace smoothing.
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

  // Chronological order: oldest [0] -> newest [N-1]
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
 * Model F: Statistical Baseline Model (Null Hypothesis Control)
 * Pure 50/50 unbiased benchmark.
 */
export function modelStatisticalBaseline(historyList, field = 'bigSmall') {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  return { model: 'StatisticalBaseline', probA: 0.5000, probB: 0.5000, choice: valA, confidence: 50.0 };
}

// -------------------------------------------------------------
// 2. MATHEMATICAL SCORING & CALIBRATION METRICS
// -------------------------------------------------------------

/**
 * Calculates Brier Score: Mean squared error between predicted prob and binary target.
 * Brier = (1 / N) * sum((p_i - y_i)^2). Optimal = 0.0, 50/50 baseline = 0.2500.
 */
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

/**
 * Calculates Log Loss (Cross-Entropy Loss): Penalizes confident wrong predictions.
 * LogLoss = -(1 / N) * sum(y * ln(p) + (1 - y) * ln(1 - p)). Baseline 50/50 = -ln(0.5) = 0.6931.
 */
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

/**
 * Calculates Confusion Matrix: TP, FP, TN, FN, Specificity, Sensitivity.
 */
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

/**
 * Calculates Probability Calibration & Expected Calibration Error (ECE) across M bins.
 */
export function calculateCalibration(probabilities, outcomes, numBins = 5) {
  if (!probabilities || probabilities.length === 0) return { ece: 0, bins: [] };

  const bins = [];
  const binWidth = 0.5 / numBins; // Bins from 0.50 to 1.00 (confidence scale)

  for (let b = 0; b < numBins; b++) {
    const lower = 0.50 + b * binWidth;
    const upper = lower + binWidth;
    bins.push({ lower, upper, count: 0, sumProb: 0, sumHits: 0 });
  }

  for (let i = 0; i < probabilities.length; i++) {
    const rawProb = probabilities[i];
    const isWin = outcomes[i] ? 1 : 0;
    // Map probability to [0.5, 1.0] confidence
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

/**
 * Two-tailed Binomial test against random 50% baseline (H0: p = 0.50) with 95% Confidence Intervals
 */
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

  // Continuity correction
  const diff = Math.abs(wins - expected) - 0.5;
  const zScore = diff > 0 ? diff / stdDev : 0;

  // Approximate normal CDF complement for two-tailed p-value
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
  const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  const pValue = Math.min(1.0, Math.round(2 * prob * 10000) / 10000);

  // Wilson Score / Wald 95% Confidence Interval
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

// -------------------------------------------------------------
// 3. PAGE-HINKLEY CONCEPT DRIFT DETECTOR
// -------------------------------------------------------------

/**
 * Detects statistical regime changes / drift in prediction error series.
 */
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

// -------------------------------------------------------------
// 4. STRICT CHRONOLOGICAL WALK-FORWARD VALIDATION
// -------------------------------------------------------------

/**
 * Runs chronological walk-forward validation across all 6 models.
 * Strictly avoids data leakage: predicting round t uses only rounds 0..t-1.
 */
export function runChronologicalWalkForward(historyList, field = 'bigSmall', targetWindows = [50, 100, 250, 500]) {
  if (!historyList || historyList.length < 20) {
    return { success: false, reason: 'Insufficient history for walk-forward validation' };
  }

  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  // Chronological order: oldest [0] -> newest [N-1]
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
  const warmup = Math.min(20, Math.floor(totalRounds * 0.15));
  const evaluatableCount = totalRounds - warmup;

  const modelKeys = [
    'HistoricalFrequency',
    'RollingWindow',
    'BayesianBetaBinomial',
    'MarkovTransition',
    'ExponentiallyWeighted',
    'StatisticalBaseline'
  ];

  const resultsByModel = {};
  for (const k of modelKeys) {
    resultsByModel[k] = {
      predictions: [],
      probabilities: [],
      choices: [],
      outcomes: [],
      isWins: []
    };
  }

  // Walk forward step by step
  for (let t = warmup; t < totalRounds; t++) {
    // Strictly historical past: 0 to t-1
    // Invert slice so newest is at [0] (standard engine convention)
    const pastSlice = chronological.slice(0, t).reverse();
    const actualTarget = classifyNumber(chronological[t].number)[field];
    const isTargetA = actualTarget === valA;

    // Evaluate each model
    const mHist = modelHistoricalFrequency(pastSlice, field);
    const mRoll = modelRollingWindow(pastSlice, field, 25);
    const mBayes = modelBayesianBetaBinomial(pastSlice, field, 10, 10);
    const mMarkov = modelMarkovTransition(pastSlice, field);
    const mEWMA = modelExponentiallyWeighted(pastSlice, field, 0.05);
    const mBase = modelStatisticalBaseline(pastSlice, field);

    const modelRuns = [
      { key: 'HistoricalFrequency', res: mHist },
      { key: 'RollingWindow', res: mRoll },
      { key: 'BayesianBetaBinomial', res: mBayes },
      { key: 'MarkovTransition', res: mMarkov },
      { key: 'ExponentiallyWeighted', res: mEWMA },
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

  // Compile metrics per model across requested windows
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
// 5. CALIBRATED ENSEMBLE WITH "NO CLEAR SIGNAL" EVIDENCE GATER
// -------------------------------------------------------------

/**
 * Multi-model calibrated predictor with explicit evidence gating.
 * Returns action: 'NO_CLEAR_SIGNAL' when evidence is weak (delta < 2.5% or agreement <= 3/6).
 */
export function generateCalibratedPrediction(historyList, field = 'bigSmall', customWeights = null) {
  const isBS = field === 'bigSmall';
  const valA = isBS ? 'BIG' : 'ODD';
  const valB = isBS ? 'SMALL' : 'EVEN';

  const defaultWeights = {
    HistoricalFrequency: 1.0,
    RollingWindow: 1.1,
    BayesianBetaBinomial: 1.25,
    MarkovTransition: 1.25,
    ExponentiallyWeighted: 1.1,
    StatisticalBaseline: 0.8
  };
  const weights = customWeights || defaultWeights;

  const mHist = modelHistoricalFrequency(historyList, field);
  const mRoll = modelRollingWindow(historyList, field, 25);
  const mBayes = modelBayesianBetaBinomial(historyList, field, 10, 10);
  const mMarkov = modelMarkovTransition(historyList, field);
  const mEWMA = modelExponentiallyWeighted(historyList, field, 0.05);
  const mBase = modelStatisticalBaseline(historyList, field);

  const subModels = [
    { key: 'HistoricalFrequency', res: mHist, weight: weights.HistoricalFrequency || 1.0 },
    { key: 'RollingWindow', res: mRoll, weight: weights.RollingWindow || 1.1 },
    { key: 'BayesianBetaBinomial', res: mBayes, weight: weights.BayesianBetaBinomial || 1.25 },
    { key: 'MarkovTransition', res: mMarkov, weight: weights.MarkovTransition || 1.25 },
    { key: 'ExponentiallyWeighted', res: mEWMA, weight: weights.ExponentiallyWeighted || 1.1 },
    { key: 'StatisticalBaseline', res: mBase, weight: weights.StatisticalBaseline || 0.8 }
  ];

  let weightedSumA = 0;
  let totalW = 0;
  let votesA = 0;

  for (const sm of subModels) {
    weightedSumA += sm.res.probA * sm.weight;
    totalW += sm.weight;
    if (sm.res.choice === valA) votesA++;
  }

  const ensembleProbA = weightedSumA / totalW;
  const ensembleProbB = 1 - ensembleProbA;
  const rawDelta = Math.abs(ensembleProbA - 0.5);

  const prediction = ensembleProbA >= 0.5 ? valA : valB;
  const agreementCount = prediction === valA ? votesA : (6 - votesA);

  // Evidence Level & Gating Rule:
  // If raw delta < 2.5% (prob between 47.5% and 52.5%) or agreement <= 3/6, signal NO_CLEAR_SIGNAL
  let evidenceLevel = 'INSUFFICIENT';
  let action = 'NO_CLEAR_SIGNAL';

  if (rawDelta >= 0.040 && agreementCount >= 5) {
    evidenceLevel = 'HIGH';
    action = 'CONFIRMED_BET';
  } else if (rawDelta >= 0.025 && agreementCount >= 4) {
    evidenceLevel = 'MODERATE';
    action = 'CONFIRMED_BET';
  } else {
    evidenceLevel = 'INSUFFICIENT';
    action = 'NO_CLEAR_SIGNAL';
  }

  // Calibrated Probability & Confidence:
  // If evidence is insufficient (abstain), confidence is strictly 50.0% (uninformative null).
  // Otherwise, bounded strictly within realistic 52% - 62% empirical range.
  const calibratedConfidence = action === 'NO_CLEAR_SIGNAL'
    ? 50.0
    : Math.min(62.0, Math.max(50.0, Math.round((50.0 + rawDelta * 100 * 0.8) * 10) / 10));

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
    evidenceLevel,
    selectedModel: 'CalibratedEnsemble_v3',
    modelAgreement: `${agreementCount}/6`,
    observationsUsed: historyList.length,
    subModels: {
      historicalFrequency: { probA: Math.round(mHist.probA * 1000) / 10, choice: mHist.choice },
      rollingWindow: { probA: Math.round(mRoll.probA * 1000) / 10, choice: mRoll.choice },
      bayesian: { probA: Math.round(mBayes.probA * 1000) / 10, choice: mBayes.choice },
      markov: { probA: Math.round(mMarkov.probA * 1000) / 10, choice: mMarkov.choice },
      ewma: { probA: Math.round(mEWMA.probA * 1000) / 10, choice: mEWMA.choice },
      baseline: { probA: 50.0, choice: mBase.choice }
    }
  };
}
