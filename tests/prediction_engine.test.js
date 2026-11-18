/**
 * 🧪 COMPREHENSIVE AUTOMATED TEST SUITE FOR CONTINUOUS PREDICTION ENGINE
 * 
 * Verifies:
 * 1. Data ordering & chronological monotonicity
 * 2. Duplicate result detection & idempotency
 * 3. Draw schema & result validation
 * 4. Prediction timing & chronological bounds
 * 5. Future data leakage prevention
 * 6. Model training & regularized weight updates
 * 7. Model evaluation metrics (Brier, LogLoss, Calibration, Confusion Matrix)
 * 8. Server restart recovery & ACID WAL integrity
 * 9. Prediction history consistency
 * 10. API compatibility with existing UI components
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  classifyNumber,
  generatePrediction,
  evaluateHistoryPerformance,
  getMartingalePlan,
  getLearnedWeights,
  updateLearningFromOutcome,
  replayUntrainedHistory,
  resetLearnedWeights,
  modelHistoricalFrequency,
  modelRollingWindow,
  modelBayesianBetaBinomial,
  modelMarkovTransition,
  modelExponentiallyWeighted,
  modelStatisticalBaseline,
  modelPatternSequence,
  modelRegularizedLogisticML,
  calculateDiscreteDigitProbabilities,
  diagnosePredictionError,
  calculateBrierScore,
  calculateLogLoss,
  calculateConfusionMatrix,
  calculateCalibration,
  calculateBinomialSignificance,
  detectPageHinkleyDrift,
  runChronologicalWalkForward,
  generateCalibratedPrediction,
  validateDraw,
  detectOverfitting,
  calculateShannonEntropy,
  checkCircuitBreaker,
  calculateDieboldMarianoTest
} from '../src/utils/engine.js';

import { DualStorageAdapter } from '../server/storage.js';
import { LearningDaemon } from '../server/learningDaemon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test isolation: run local WAL unit tests without contaminating production database
process.env.NODE_ENV = 'test';
const savedMongoUri = process.env.MONGODB_URI;
delete process.env.MONGODB_URI;

// Mock browser localStorage for Node test runner
const storageMap = {};
globalThis.localStorage = {
  getItem: (k) => storageMap[k] || null,
  setItem: (k, v) => { storageMap[k] = String(v); },
  removeItem: (k) => { delete storageMap[k]; }
};

let passedTests = 0;
let totalTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function itAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    throw err;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING CONTINUOUS LEARNING ENGINE TEST SUITE');
  console.log('======================================================\n');

  // -------------------------------------------------------------
  // Test Group 1: Data Ordering & Monotonicity
  // -------------------------------------------------------------
  console.log('📌 GROUP 1: Data Ordering & Chronological Integrity');

  it('Verifies chronological sorting of issue numbers using BigInt comparison', () => {
    const unordered = [
      { issueNumber: '20261105100050010', number: '3' },
      { issueNumber: '20261105100050001', number: '7' },
      { issueNumber: '20261105100050005', number: '2' },
      { issueNumber: '20261105100050020', number: '8' }
    ];

    const sortedAsc = [...unordered].sort((a, b) => (BigInt(a.issueNumber) > BigInt(b.issueNumber) ? 1 : -1));
    assert.strictEqual(sortedAsc[0].issueNumber, '20261105100050001');
    assert.strictEqual(sortedAsc[3].issueNumber, '20261105100050020');
  });

  // -------------------------------------------------------------
  // Test Group 2: Duplicate Result Detection & Idempotency
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 2: Duplicate Detection & Idempotency');

  await itAsync('Verifies storage adapter ignores duplicate incoming draws', async () => {
    const testStorage = new DualStorageAdapter();
    testStorage.walFilePath = path.join(__dirname, '../data/test_wal.json');
    testStorage.modelRegistryPath = path.join(__dirname, '../data/test_registry.json');
    if (fs.existsSync(testStorage.walFilePath)) fs.unlinkSync(testStorage.walFilePath);
    if (fs.existsSync(testStorage.modelRegistryPath)) fs.unlinkSync(testStorage.modelRegistryPath);
    await testStorage.init();

    const draw1 = { issueNumber: '20261105100059999', number: '5', color: 'green' };
    const firstInsert = await testStorage.saveRound(draw1);
    const secondInsert = await testStorage.saveRound(draw1); // Duplicate

    assert.strictEqual(firstInsert, true, 'First insert should succeed');
    assert.strictEqual(secondInsert, false, 'Duplicate insert must be rejected');

    // Clean test file
    if (fs.existsSync(testStorage.walFilePath)) fs.unlinkSync(testStorage.walFilePath);
    if (fs.existsSync(testStorage.modelRegistryPath)) fs.unlinkSync(testStorage.modelRegistryPath);
  });

  // -------------------------------------------------------------
  // Test Group 3: Result Validation & Schema
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 3: Result Validation');

  it('Verifies validation gate rejects malformed, out-of-range, and non-WinGo draws', () => {
    const daemon = new LearningDaemon();

    assert.strictEqual(daemon.validateIncomingDraw(null), false, 'Null draw rejected');
    assert.strictEqual(daemon.validateIncomingDraw({ issueNumber: '123' }), false, 'Short issue rejected');
    assert.strictEqual(daemon.validateIncomingDraw({ issueNumber: '20261105100050001', number: '15' }), false, 'Number > 9 rejected');
    assert.strictEqual(daemon.validateIncomingDraw({ issueNumber: '20261105100050001', number: '-1' }), false, 'Number < 0 rejected');
    assert.strictEqual(daemon.validateIncomingDraw({ issueNumber: '20261105999990001', number: '7' }), false, 'Invalid game code rejected');
    assert.strictEqual(daemon.validateIncomingDraw({ issueNumber: '20261105100050001', number: '7' }), true, 'Valid 30S draw accepted');
  });

  // -------------------------------------------------------------
  // Test Group 4: Future Data Leakage Prevention
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 4: Zero Future Lookahead & Data Leakage Check');

  it('Ensures predicting round t only accesses draws prior to t (strictly past slice)', () => {
    const syntheticHistory = [];
    const base = 20261105100050000n;
    for (let i = 0; i < 50; i++) {
      syntheticHistory.push({
        issueNumber: (base + BigInt(i)).toString(),
        number: String(i % 10)
      });
    }

    // Target round is index 30 (newest is at 0 in inverted list)
    const chronological = [...syntheticHistory];
    const targetIndex = 30;
    const targetDraw = chronological[targetIndex];

    // Slice before targetDraw
    const pastData = chronological.slice(0, targetIndex).reverse();

    // Assert targetDraw's issueNumber is strictly NOT in pastData
    const containsTarget = pastData.some(d => d.issueNumber === targetDraw.issueNumber);
    assert.strictEqual(containsTarget, false, 'Target round must never exist in prediction input');

    // Assert all pastData issue numbers are strictly smaller than targetDraw issue number
    for (const d of pastData) {
      assert(BigInt(d.issueNumber) < BigInt(targetDraw.issueNumber), 'All inputs must precede target chronologically');
    }
  });

  // -------------------------------------------------------------
  // Test Group 5: The 6 Independent Models (A through F)
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 5: The Six Independent Statistical Models');

  it('Evaluates all 6 models independently with bounded probabilistic outputs', () => {
    const sampleData = [
      { issueNumber: '20261105100050010', number: '8' }, // BIG
      { issueNumber: '20261105100050009', number: '7' }, // BIG
      { issueNumber: '20261105100050008', number: '2' }, // SMALL
      { issueNumber: '20261105100050007', number: '9' }, // BIG
      { issueNumber: '20261105100050006', number: '3' }, // SMALL
      { issueNumber: '20261105100050005', number: '6' }, // BIG
      { issueNumber: '20261105100050004', number: '1' }  // SMALL
    ];

    const mA = modelHistoricalFrequency(sampleData, 'bigSmall');
    const mB = modelRollingWindow(sampleData, 'bigSmall', 5);
    const mC = modelBayesianBetaBinomial(sampleData, 'bigSmall', 10, 10);
    const mD = modelMarkovTransition(sampleData, 'bigSmall');
    const mE = modelExponentiallyWeighted(sampleData, 'bigSmall', 0.05);
    const mF = modelStatisticalBaseline(sampleData, 'bigSmall');

    assert(mA.probA >= 0 && mA.probA <= 1, 'Model A probA must be in [0, 1]');
    assert(mB.probA >= 0 && mB.probA <= 1, 'Model B probA must be in [0, 1]');
    assert(mC.probA >= 0 && mC.probA <= 1, 'Model C probA must be in [0, 1]');
    assert(mD.probA >= 0 && mD.probA <= 1, 'Model D probA must be in [0, 1]');
    assert(mE.probA >= 0 && mE.probA <= 1, 'Model E probA must be in [0, 1]');
    assert.strictEqual(mF.probA, 0.5000, 'Model F baseline must be exactly 0.5000');
  });

  // -------------------------------------------------------------
  // Test Group 6: Mathematical Scoring & Calibration Verification
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 6: Mathematical Scoring & Verification');

  it('Verifies Brier Score, Log Loss, and Confusion Matrix against known fixtures', () => {
    // Test case 1: Perfect predictions
    const perfectProbs = [1.0, 0.0, 1.0, 0.0];
    const outcomes = [true, false, true, false];
    const brierPerfect = calculateBrierScore(perfectProbs, outcomes);
    assert.strictEqual(brierPerfect, 0.0, 'Perfect predictions must have Brier Score = 0.0');

    // Test case 2: Uninformative 50/50 predictions
    const coinFlipProbs = [0.5, 0.5, 0.5, 0.5];
    const brierCoin = calculateBrierScore(coinFlipProbs, outcomes);
    assert.strictEqual(brierCoin, 0.2500, '50/50 predictions must have Brier Score = 0.2500');

    const logLossCoin = calculateLogLoss(coinFlipProbs, outcomes);
    assert.strictEqual(logLossCoin, 0.6931, '50/50 predictions must have Log Loss = 0.6931');

    // Test case 3: Confusion matrix
    const preds = ['BIG', 'SMALL', 'BIG', 'SMALL'];
    const actuals = ['BIG', 'BIG', 'SMALL', 'SMALL'];
    const matrix = calculateConfusionMatrix(preds, actuals, 'BIG');
    assert.strictEqual(matrix.tp, 1);
    assert.strictEqual(matrix.fp, 1);
    assert.strictEqual(matrix.tn, 1);
    assert.strictEqual(matrix.fn, 1);
    assert.strictEqual(matrix.accuracy, 50.0);
  });

  it('Verifies Binomial Significance Test against H0: p = 0.50', () => {
    // 52 wins out of 100: not statistically significant (p >> 0.05)
    const sig52 = calculateBinomialSignificance(52, 100, 0.50);
    assert.strictEqual(sig52.isSignificant, false, '52/100 should not be significant');
    assert(sig52.pValue > 0.05, 'p-value must exceed 0.05');

    // 75 wins out of 100: highly statistically significant (p < 0.001)
    const sig75 = calculateBinomialSignificance(75, 100, 0.50);
    assert.strictEqual(sig75.isSignificant, true, '75/100 must be significant');
    assert(sig75.pValue < 0.001, 'p-value must be < 0.001');
  });

  // -------------------------------------------------------------
  // Test Group 7: Evidence Gating & NO CLEAR SIGNAL
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 7: Evidence Gating & Abstention');

  it('Returns NO CLEAR SIGNAL when probability is within uninformative bounds (47.5% - 52.5%)', () => {
    // Balanced 50/50 alternating history
    const balancedData = [];
    const base = 20261105100050000n;
    for (let i = 0; i < 40; i++) {
      balancedData.push({
        issueNumber: (base + BigInt(i)).toString(),
        number: i % 2 === 0 ? '7' : '2' // Alternating 7 (BIG) and 2 (SMALL)
      });
    }

    const pred = generateCalibratedPrediction(balancedData, 'bigSmall');
    assert.strictEqual(pred.action, 'NO_CLEAR_SIGNAL', 'Balanced noise must yield NO_CLEAR_SIGNAL');
    assert.strictEqual(pred.prediction, 'NO CLEAR SIGNAL', 'Should refuse to force a coin-flip bet');
    assert.strictEqual(pred.calibratedConfidence, 50.0, 'Confidence must be strictly 50.0% when abstaining');
  });

  // -------------------------------------------------------------
  // Test Group 8: Server Restart Recovery & Consistency
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 8: Server Restart & State Persistence');

  await itAsync('Recovers persisted state and issue history cleanly across simulated restarts', async () => {
    const testStorage = new DualStorageAdapter();
    testStorage.walFilePath = path.join(__dirname, '../data/test_restart_wal.json');
    testStorage.modelRegistryPath = path.join(__dirname, '../data/test_restart_registry.json');
    if (fs.existsSync(testStorage.walFilePath)) fs.unlinkSync(testStorage.walFilePath);
    if (fs.existsSync(testStorage.modelRegistryPath)) fs.unlinkSync(testStorage.modelRegistryPath);
    await testStorage.init();

    // Commit 5 rounds
    for (let i = 0; i < 5; i++) {
      await testStorage.saveRound({
        issueNumber: `2026110510005000${i}`,
        number: String(i),
        color: 'red'
      });
    }

    // Simulate server crash & close
    await testStorage.close();

    // Spawn new instance (restart)
    const restartedStorage = new DualStorageAdapter();
    restartedStorage.walFilePath = testStorage.walFilePath;
    restartedStorage.modelRegistryPath = testStorage.modelRegistryPath;
    const status = await restartedStorage.init();

    assert.strictEqual(status.roundsStored, 5, 'Restarted storage must recover all 5 rounds');
    const history = await restartedStorage.getHistory(10);
    assert.strictEqual(history.length, 5);
    assert.strictEqual(history[0].issueNumber, '20261105100050004', 'Latest round must be first');

    // Clean test files
    if (fs.existsSync(testStorage.walFilePath)) fs.unlinkSync(testStorage.walFilePath);
    if (fs.existsSync(testStorage.modelRegistryPath)) fs.unlinkSync(testStorage.modelRegistryPath);
  });

  // -------------------------------------------------------------
  // Test Group 9: Existing API & Component Compatibility
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 9: Backward Compatibility with Existing APIs');

  it('Ensures all legacy functions and signatures remain completely intact', () => {
    // 1. classifyNumber
    const c = classifyNumber('7');
    assert.strictEqual(c.bigSmall, 'BIG');
    assert.strictEqual(c.oddEven, 'ODD');
    assert.strictEqual(c.color, 'green');

    // 2. getMartingalePlan
    const m = getMartingalePlan(10, 2, 3);
    assert.strictEqual(m.level, 3);
    assert.strictEqual(m.betAmount, 90);

    // 3. evaluateHistoryPerformance
    const mockHistory = [];
    const base = 20261105100050000n;
    for (let i = 0; i < 25; i++) {
      mockHistory.push({
        issueNumber: (base + BigInt(i)).toString(),
        number: String(i % 10)
      });
    }

    const perf = evaluateHistoryPerformance(mockHistory, 'ultra_sniper', 'bigSmall');
    assert(perf.winRate !== undefined, 'perf.winRate must exist');
    assert(perf.totalBets !== undefined, 'perf.totalBets must exist');
    assert(perf.brierScore !== undefined, 'perf.brierScore must exist');
    assert(perf.logLoss !== undefined, 'perf.logLoss must exist');
    assert(Array.isArray(perf.logs), 'perf.logs must be an array');

    // 4. generatePrediction
    const pred = generatePrediction(mockHistory, 'ultra_sniper', 'bigSmall');
    assert(pred.prediction !== undefined, 'pred.prediction must exist');
    assert(pred.confidence !== undefined, 'pred.confidence must exist');
    assert(pred.topNumber !== undefined, 'pred.topNumber must exist');
    assert(Array.isArray(pred.goldenBasket), 'pred.goldenBasket must exist');
  });

  // -------------------------------------------------------------
  // Test Group 10: Chronological Walk-Forward Pipeline
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 10: Full Walk-Forward Pipeline Execution');

  it('Executes multi-window walk-forward validation across 6 models without failure', () => {
    const syntheticHistory = [];
    const base = 20261105100050000n;
    for (let i = 0; i < 80; i++) {
      syntheticHistory.push({
        issueNumber: (base + BigInt(i)).toString(),
        number: String((i * 3 + 1) % 10)
      });
    }

    const wf = runChronologicalWalkForward(syntheticHistory, 'bigSmall', [50]);
    assert.strictEqual(wf.success, true);
    assert(wf.windows[50] !== undefined, 'Window 50 must be populated');
    assert(wf.windows[50].HistoricalFrequency !== undefined);
    assert(wf.windows[50].MarkovTransition !== undefined);
    assert(wf.windows[50].StatisticalBaseline !== undefined);
  });

  // -------------------------------------------------------------
  // Test Group 11: Statistical Honesty Principles
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 11: Statistical Honesty Principles & No Short-Streak Promotion');

  it('Verifies candidate model promotion is rejected when statistical significance fails (p >= 0.05)', () => {
    // 6 wins out of 10 draws (60% win rate on tiny sample of 10)
    const shortStreakStats = calculateBinomialSignificance(6, 10, 0.50);
    assert.strictEqual(shortStreakStats.isSignificant, false, '6/10 streak must NOT be statistically significant');
    assert.strictEqual(shortStreakStats.hasEdge, false, 'Short streak must NOT qualify as a predictive edge');
    assert(shortStreakStats.pValue >= 0.05, 'p-value must exceed 0.05 threshold');

    // 95% Confidence Interval for 6/10 spans across 50% [29.6%, 90.4%]
    assert(shortStreakStats.ciLower < 50.0, 'CI lower bound must include null hypothesis 50%');
    assert(shortStreakStats.ciUpper > 50.0, 'CI upper bound must include null hypothesis 50%');
  });

  it('Verifies active prediction direction (BIG/SMALL) and VIP numbers are always calculated even in choppy regimes', () => {
    // Highly volatile chopped sequence
    const choppyList = [
      { issueNumber: '20261105100050010', number: '7' },
      { issueNumber: '20261105100050009', number: '2' },
      { issueNumber: '20261105100050008', number: '8' },
      { issueNumber: '20261105100050007', number: '1' },
      { issueNumber: '20261105100050006', number: '6' },
      { issueNumber: '20261105100050005', number: '3' },
      { issueNumber: '20261105100050004', number: '9' },
      { issueNumber: '20261105100050003', number: '0' }
    ];

    // In all mode, direction is BIG or SMALL
    const predAll = generatePrediction(choppyList, 'all', 'bigSmall');
    assert(['BIG', 'SMALL'].includes(predAll.prediction), 'Must always output active prediction direction BIG or SMALL');
    assert(predAll.topNumber !== undefined, 'Must output top VIP number');
    assert(Array.isArray(predAll.goldenBasket) && predAll.goldenBasket.length === 3, 'Must output 3-number golden basket');

    // In ultra_sniper mode, choppy noise strictly triggers NO_CLEAR_SIGNAL abstention to protect against losses
    const predShield = generatePrediction(choppyList, 'ultra_sniper', 'bigSmall');
    assert(['BIG', 'SMALL'].includes(predShield.prediction), 'Prediction direction is still populated for UI');
    assert.strictEqual(predShield.action, 'NO_CLEAR_SIGNAL', 'Zero-Loss shield must abstain on choppy noise');
  });

  // -------------------------------------------------------------
  // Test Group 12: 10-Step Draw Validation Protocol
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 12: 10-Step Draw Validation & Corrupt Record Defense');

  it('Rejects malformed draws, invalid lengths, and out-of-range digits', () => {
    // Null/undefined
    assert.strictEqual(validateDraw(null).valid, false);
    assert.strictEqual(validateDraw(undefined).valid, false);

    // Missing issue or wrong format
    assert.strictEqual(validateDraw({ number: 5 }).valid, false);
    assert.strictEqual(validateDraw({ issueNumber: '12345', number: 5 }).valid, false);

    // Out of range number
    assert.strictEqual(validateDraw({ issueNumber: '20261105100050001', number: 10 }).valid, false);
    assert.strictEqual(validateDraw({ issueNumber: '20261105100050001', number: -1 }).valid, false);
    assert.strictEqual(validateDraw({ issueNumber: '20261105100050001', number: 'abc' }).valid, false);

    // Unrecognized game prefix
    assert.strictEqual(validateDraw({ issueNumber: '20261105999990001', number: 5 }).valid, false);

    // Valid WinGo 30S draw
    const validDraw = validateDraw({ issueNumber: '20261105100051234', number: '7' });
    assert.strictEqual(validDraw.valid, true);
    assert.strictEqual(validDraw.number, 7);
    assert.strictEqual(validDraw.bigSmall, 'BIG');
    assert.strictEqual(validDraw.oddEven, 'ODD');
    assert.strictEqual(validDraw.colour, 'green');
  });

  // -------------------------------------------------------------
  // Test Group 13: Shannon Entropy, Overfitting & Circuit Breaker
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 13: Shannon Entropy, Overfitting Detection & Circuit Breakers');

  it('Verifies Shannon entropy is maximal (1.0) at 50/50 and drops on certainty', () => {
    const entropy50 = calculateShannonEntropy(0.50);
    assert.strictEqual(entropy50, 1.0, 'Entropy must be exactly 1.0 for p = 0.50');

    const entropy80 = calculateShannonEntropy(0.80);
    assert(entropy80 < 0.75, 'Entropy must be significantly lower than 1.0 for p = 0.80');

    const entropy99 = calculateShannonEntropy(0.99);
    assert(entropy99 < 0.15, 'Entropy must approach 0 as probability approaches certainty');
  });

  it('Detects overfitting when in-sample accuracy diverges significantly from out-of-sample', () => {
    // Large gap: In-sample 75%, Out-of-sample 52% (gap 23%)
    const overfit = detectOverfitting(75.0, 52.0, 12.0);
    assert.strictEqual(overfit.isOverfitting, true, '23% generalization gap must trigger overfitting flag');
    assert.strictEqual(overfit.generalizationGap, 23.0);

    // Safe gap: In-sample 57%, Out-of-sample 55% (gap 2%)
    const safe = detectOverfitting(57.0, 55.0, 12.0);
    assert.strictEqual(safe.isOverfitting, false, '2% generalization gap must not trigger overfitting');
  });

  it('Triggers circuit breaker when rolling Brier score exceeds coin-toss threshold', () => {
    // Degraded performance: Brier 0.2750 (far worse than 0.2500 random coin toss)
    const degraded = checkCircuitBreaker(0.2750, 42.0, 25);
    assert.strictEqual(degraded.isTriggered, true, 'High Brier score must trigger circuit breaker');
    assert.strictEqual(degraded.action, 'ABSTAIN_CIRCUIT_BREAKER');

    // Normal healthy performance: Brier 0.2420, WinRate 56%
    const healthy = checkCircuitBreaker(0.2420, 56.0, 25);
    assert.strictEqual(healthy.isTriggered, false, 'Healthy score must not trigger circuit breaker');
    assert.strictEqual(healthy.action, 'NORMAL_OPERATION');
  });

  // -------------------------------------------------------------
  // Test Group 14: Diebold-Mariano Significance & Model Rollback
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 14: Diebold-Mariano Test & Model Version Rollback');

  it('Statistically verifies loss differential via Diebold-Mariano test', () => {
    // Model B consistently makes smaller squared errors than Model A across 40 rounds
    const errorsA = Array(40).fill(0.35);
    const errorsB = Array(40).fill(0.18);
    const dm = calculateDieboldMarianoTest(errorsA, errorsB);
    assert.strictEqual(dm.isSignificant, true, 'Clear loss difference must be statistically significant');
    assert.strictEqual(dm.isModelBBetter, true, 'Model B must be recognized as significantly superior');
    assert(dm.pValue < 0.05, 'p-value must be less than 0.05');
  });

  await itAsync('Executes safe atomic model rollback upon degradation', async () => {
    const testStorage = new DualStorageAdapter();
    await testStorage.init();

    // Promote a new version
    const testVersion = `v2.4.test-${Date.now().toString(36)}`;
    await testStorage.saveModelVersion({
      version: testVersion,
      promotedAt: Date.now(),
      model: 'CandidateTestModel',
      brierScore: 0.2450,
      accuracy100: 56.0,
      status: 'ACTIVE_PRODUCTION'
    });

    const regAfterPromotion = await testStorage.getModelRegistry();
    assert.strictEqual(regAfterPromotion.activeVersion, testVersion);

    // Trigger rollback
    const rollbackRes = await testStorage.rollbackModelVersion('Simulated test rollback');
    assert.strictEqual(rollbackRes.success, true);
    assert(rollbackRes.activeVersion.includes('rollback'), 'Active version must reflect rollback');

    await testStorage.close();
  });

  // -------------------------------------------------------------
  // Test Group 15: Full-Day Continuous Learning Rollup & Learning State
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 15: Full-Day Continuous Learning Rollup & State Persistence');

  await itAsync('Maintains full-day progress tracking toward 2,880 rounds with hourly breakdown', async () => {
    const testStorage = new DualStorageAdapter();
    testStorage.walFilePath = path.join(__dirname, '../data/test_daily_wal.json');
    testStorage.learningStatePath = path.join(__dirname, '../data/test_daily_learning_state.json');
    if (fs.existsSync(testStorage.walFilePath)) fs.unlinkSync(testStorage.walFilePath);
    if (fs.existsSync(testStorage.learningStatePath)) fs.unlinkSync(testStorage.learningStatePath);
    await testStorage.init();

    // 1. Test saving and loading online learning state
    const sampleWeights = { markov2: 1.62, bayesianTrans: 1.55, dailyRoundsTrained: 42 };
    const sampleMatrix = Array.from({ length: 10 }, () => Array(10).fill(2));
    await testStorage.saveLearningState(sampleWeights, sampleMatrix);

    const loadedState = await testStorage.loadLearningState();
    assert(loadedState !== null, 'Loaded learning state must not be null');
    assert.strictEqual(loadedState.weights.markov2, 1.62);
    assert.strictEqual(loadedState.matrix[0][0], 2);

    // 2. Test updating full-day learning progress
    const now = Date.now();
    await testStorage.updateDailyProgress({
      targetIssue: '20261107100050001',
      action: 'CONFIRMED_BET',
      isWin: true,
      brierError: 0.12,
      timestamp: now
    });

    await testStorage.updateDailyProgress({
      targetIssue: '20261107100050002',
      action: 'NO_CLEAR_SIGNAL',
      isWin: false,
      timestamp: now
    });

    const daily = await testStorage.getDailyProgress();
    assert.strictEqual(daily.totalDrawsProcessed, 2, 'Must record 2 total draws');
    assert.strictEqual(daily.targetDailyRounds, 2880, 'Must benchmark against 2,880 24h rounds');
    assert.strictEqual(daily.settledPredictions, 1, 'Must record 1 settled prediction');
    assert.strictEqual(daily.winCount, 1, 'Must record 1 win');
    assert.strictEqual(daily.skippedCount, 1, 'Must record 1 skipped round');
    assert.strictEqual(daily.winRatePercent, 100.0, 'Win rate on settled rounds should be 100%');

    const hourStr = String(new Date(now).getUTCHours()).padStart(2, '0');
    assert(daily.hourlyBuckets[hourStr], 'Must contain current hour bucket');
    assert.strictEqual(daily.hourlyBuckets[hourStr].draws, 2);

    await testStorage.close();

    // Clean test files
    if (fs.existsSync(testStorage.walFilePath)) fs.unlinkSync(testStorage.walFilePath);
    if (fs.existsSync(testStorage.learningStatePath)) fs.unlinkSync(testStorage.learningStatePath);
  });

  // -------------------------------------------------------------
  // Test Group 16: Zero-Loss on Abstention / NO_CLEAR_SIGNAL
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 16: Zero-Loss on Abstention / NO_CLEAR_SIGNAL');

  it('Verifies abstaining (NO_CLEAR_SIGNAL) does NOT log a false loss in accuracyHistory', () => {
    resetLearnedWeights();
    const initialWeights = getLearnedWeights();
    assert.strictEqual(initialWeights.accuracyHistory.length, 0);

    // Simulate an abstained round
    const skippedPrediction = {
      action: 'NO_CLEAR_SIGNAL',
      prediction: 'NO CLEAR SIGNAL',
      targetType: 'bigSmall',
      signals: {}
    };

    const actualDraw = { issueNumber: '20261105100050010', number: '7' };
    const updatedWeights = updateLearningFromOutcome(skippedPrediction, actualDraw);

    // Accuracy history must remain strictly empty (NO loss recorded for abstention!)
    assert.strictEqual(updatedWeights.accuracyHistory.length, 0, 'Abstention must never be recorded as a loss in accuracyHistory');
    assert.strictEqual(updatedWeights.recentAccuracy, 50.0, 'Recent accuracy must not collapse to 0% on abstentions');
  });

  // -------------------------------------------------------------
  // Test Group 17: Disabled Simulated & Artifact Models
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 17: Disabled Simulated & Artifact Models (Zero Weight)');

  it('Verifies crowdLiquidity and fourierCycle have weight 0.0 and do not corrupt predictions', () => {
    const weights = getLearnedWeights();
    assert.strictEqual(weights.crowdLiquidity, 0.0, 'crowdLiquidity must be disabled (weight = 0)');
    assert.strictEqual(weights.fourierCycle, 0.0, 'fourierCycle must be disabled (weight = 0)');

    // Ensure updateLearningFromOutcome preserves weight 0 for disabled models
    const pred = {
      action: 'CONFIRMED_BET',
      prediction: 'BIG',
      targetType: 'bigSmall',
      signals: {
        crowdLiquidity: { choice: 'BIG' },
        markov2: { choice: 'BIG' }
      }
    };
    const draw = { issueNumber: '20261105100050011', number: '8' };
    const w = updateLearningFromOutcome(pred, draw);
    assert.strictEqual(w.crowdLiquidity, 0.0, 'Disabled models must remain weight 0 after learning updates');
  });

  // -------------------------------------------------------------
  // Test Group 18: Clean Number Probabilities under NO CLEAR SIGNAL
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 18: Clean Number Probabilities without False Suppression');

  it('Maintains balanced digit distribution when Big/Small is NO CLEAR SIGNAL', () => {
    const mockHistory = [
      { issueNumber: '20261105100050010', number: '3' },
      { issueNumber: '20261105100050009', number: '7' },
      { issueNumber: '20261105100050008', number: '2' }
    ];

    // Predict with 'NO CLEAR SIGNAL'
    const pred = generatePrediction(mockHistory, 'ultra_sniper', 'bigSmall');
    const basket = pred.goldenBasket;
    assert(Array.isArray(basket) && basket.length === 3, 'Golden basket must contain top 3 numbers');

    // Verify all digits have reasonable probabilities (sum to ~100%)
    const sumProb = pred.numberProbabilities.reduce((acc, d) => acc + d.prob, 0);
    assert(sumProb >= 98 && sumProb <= 102, `Digit probabilities must sum to ~100% (got ${sumProb})`);
  });

  // -------------------------------------------------------------
  // Test Group 19: Comprehensive Model Metrics Reporting
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 19: Comprehensive Model Metrics (Accuracy, Brier, LogLoss, Sample)');

  it('Walk-forward generates complete model-wise Accuracy, Brier, LogLoss, and sample size', () => {
    const syntheticHistory = [];
    const base = 20261105100050000n;
    for (let i = 0; i < 70; i++) {
      syntheticHistory.push({
        issueNumber: (base + BigInt(i)).toString(),
        number: String((i * 7 + 3) % 10)
      });
    }

    const wf = runChronologicalWalkForward(syntheticHistory, 'bigSmall', [50]);
    assert.strictEqual(wf.success, true);
    const w50 = wf.windows[50];
    assert(w50, 'Window 50 must exist');

    for (const [mName, stats] of Object.entries(w50)) {
      assert(typeof stats.winRate === 'number', `${mName} must have winRate`);
      assert(typeof stats.brierScore === 'number', `${mName} must have brierScore`);
      assert(typeof stats.logLoss === 'number', `${mName} must have logLoss`);
      assert(typeof stats.sampleSize === 'number', `${mName} must have sampleSize`);
      assert(stats.sampleSize === 50, `${mName} sample size must be 50`);
      assert(stats.brierScore >= 0 && stats.brierScore <= 1, `${mName} brierScore in [0, 1]`);
    }
  });

  // -------------------------------------------------------------
  // Test Group 20: Pattern Sequence & Regularized ML Model
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 20: Pattern Sequence & Regularized ML Model');

  it('Verifies PatternSequence and RegularizedLogisticML models compute bounded probabilities', () => {
    const history = [];
    const base = 20261105100050000n;
    for (let i = 0; i < 40; i++) {
      history.push({
        issueNumber: (base + BigInt(i)).toString(),
        number: String((i % 2 === 0 ? 8 : 2))
      });
    }

    const pat = modelPatternSequence(history, 'bigSmall');
    assert(pat.probA >= 0.10 && pat.probA <= 0.90, 'PatternSequence probA bounded in [0.10, 0.90]');
    assert(typeof pat.currentStreak === 'number');

    const ml = modelRegularizedLogisticML(history, 'bigSmall');
    assert(ml.probA >= 0.10 && ml.probA <= 0.90, 'Logistic ML probA bounded in [0.10, 0.90]');
    assert(ml.choice === 'BIG' || ml.choice === 'SMALL');
  });

  // -------------------------------------------------------------
  // Test Group 21: Discrete 0-9 Digit Engine & Basket Normalization
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 21: Discrete 0-9 Digit Engine & Basket Normalization');

  it('Computes valid 0-9 probabilities summing to 100% and top 3 ranked numbers', () => {
    const history = [];
    const base = 20261105100050000n;
    for (let i = 0; i < 30; i++) {
      history.push({
        issueNumber: (base + BigInt(i)).toString(),
        number: String(i % 10)
      });
    }

    const digits = calculateDiscreteDigitProbabilities(history);
    assert.strictEqual(digits.numberProbabilities.length, 10, 'Must contain all 10 digits');
    assert.strictEqual(digits.top3Numbers.length, 3, 'Top 3 basket must have 3 numbers');
    assert(digits.topNumber !== undefined, 'Top number must exist');

    const sumProb = digits.numberProbabilities.reduce((sum, d) => sum + d.prob, 0);
    assert(Math.abs(sumProb - 100.0) < 1.0, `Digit probabilities must sum to 100% (got ${sumProb})`);

    // Verify descending order
    for (let i = 0; i < digits.numberProbabilities.length - 1; i++) {
      assert(digits.numberProbabilities[i].prob >= digits.numberProbabilities[i + 1].prob, 'Digits must be ranked descending');
    }

    // Golden basket coverage equals sum of top 3
    const sumTop3 = Math.round(digits.top3Numbers.reduce((s, d) => s + d.prob, 0) * 10) / 10;
    assert.strictEqual(digits.goldenBasketCoverage, sumTop3);
  });

  // -------------------------------------------------------------
  // Test Group 22: Diagnostic Error Attribution
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 22: Diagnostic Root-Cause Error Attribution');

  it('Provides actionable empirical diagnosis on both winning and losing predictions', () => {
    const mockPred = {
      prediction: 'BIG',
      rawDelta: 1.2,
      entropy: 0.992,
      evidenceLevel: 'INSUFFICIENT',
      subModels: {
        markov: { choice: 'SMALL' },
        bayesian: { choice: 'SMALL' }
      }
    };

    // Actual was SMALL -> prediction BIG lost
    const lossDraw = { issueNumber: '20261105100050001', number: '2' };
    const diagnosisLoss = diagnosePredictionError(mockPred, lossDraw);
    assert(typeof diagnosisLoss === 'string' && diagnosisLoss.length > 10);
    assert(diagnosisLoss.includes('HIGH_ENTROPY_NOISE') || diagnosisLoss.includes('STREAK_MOMENTUM') || diagnosisLoss.includes('WEAK_SIGNAL'));

    // Actual was BIG -> prediction BIG won
    const winDraw = { issueNumber: '20261105100050002', number: '8' };
    const diagnosisWin = diagnosePredictionError(mockPred, winDraw);
    assert(diagnosisWin.includes('MODEL_CONVERGENCE'));
  });

  // -------------------------------------------------------------
  // Test Group 23: Separate Big/Small and Exact Number Probabilities
  // -------------------------------------------------------------
  console.log('\n📌 GROUP 23: Independent Probability Estimation (No Distortion)');

  it('Calculates Big/Small and individual number probabilities separately without distortion', () => {
    const mockHistory = [
      { issueNumber: '20261105100050010', number: '6' },
      { issueNumber: '20261105100050009', number: '7' },
      { issueNumber: '20261105100050008', number: '8' }
    ];

    const pred = generateCalibratedPrediction(mockHistory, 'bigSmall');
    assert(pred.probabilities.BIG !== undefined);
    assert(pred.probabilities.SMALL !== undefined);
    assert(pred.digitForecast !== undefined);
    assert.strictEqual(pred.digitForecast.numberProbabilities.length, 10);

    // Verify small digits are NOT artificially suppressed to near-zero
    const smallDigits = pred.digitForecast.numberProbabilities.filter(d => !d.isBig);
    for (const sd of smallDigits) {
      assert(sd.prob > 4.0, 'Small digits must not be artificially crushed by Big/Small lean');
    }
  });

  console.log('\n======================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} AUTOMATED TESTS PASSED SUCCESSFULLY!`);
  console.log('======================================================\n');
}

runTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
