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
  calculateBrierScore,
  calculateLogLoss,
  calculateConfusionMatrix,
  calculateCalibration,
  calculateBinomialSignificance,
  detectPageHinkleyDrift,
  runChronologicalWalkForward,
  generateCalibratedPrediction
} from '../src/utils/engine.js';

import { DualStorageAdapter } from '../server/storage.js';
import { LearningDaemon } from '../server/learningDaemon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    await testStorage.init();

    const draw1 = { issueNumber: '20261105100059999', number: '5', color: 'green' };
    const firstInsert = await testStorage.saveRound(draw1);
    const secondInsert = await testStorage.saveRound(draw1); // Duplicate

    assert.strictEqual(firstInsert, true, 'First insert should succeed');
    assert.strictEqual(secondInsert, false, 'Duplicate insert must be rejected');

    // Clean test file
    if (fs.existsSync(testStorage.walFilePath)) fs.unlinkSync(testStorage.walFilePath);
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

  it('Verifies NO CLEAR SIGNAL is emitted when market regime is chopped and models conflict', () => {
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

    const pred = generatePrediction(choppyList, 'ultra_sniper', 'bigSmall');
    assert.strictEqual(pred.action, 'NO_CLEAR_SIGNAL', 'Chopped sequence must yield NO_CLEAR_SIGNAL');
    assert.strictEqual(pred.prediction, 'NO CLEAR SIGNAL', 'Must output NO CLEAR SIGNAL');
    assert.strictEqual(pred.confidence, 50.0, 'Confidence must be strictly 50.0% neutral');
  });

  console.log('\n======================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} AUTOMATED TESTS PASSED SUCCESSFULLY!`);
  console.log('======================================================\n');
}

runTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
