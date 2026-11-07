/**
 * 🏋️ FULL-DAY 24/7 CONTINUOUS LEARNING & MODEL TRAINING PIPELINE
 * 
 * 1. Connects to MongoDB Atlas cluster (loccomirror)
 * 2. Ingests official live draws & populates historical store
 * 3. Chronologically trains online Bayesian transition matrix & adaptive weights
 * 4. Records full-day rollup (2,880 rounds target) with hourly buckets
 * 5. Generates high-confidence calibrated prediction for the next round
 */

import { storage } from '../server/storage.js';
import { 
  validateDraw, 
  generateCalibratedPrediction, 
  runChronologicalWalkForward,
  calculateBrierScore,
  calculateLogLoss
} from '../src/utils/statisticalEngine.js';
import { 
  classifyNumber,
  generatePrediction,
  getLearnedWeights,
  saveLearnedWeights,
  updateLearningFromOutcome,
  getBayesianTransitionMatrix,
  saveBayesianTransitionMatrix,
  setNodeLearningState,
  getNodeLearningState
} from '../src/utils/engine.js';

async function fetchLiveOfficialDraws(gameCode = 'WinGo_30S') {
  const ts = Date.now();
  const endpoints = [
    `https://draw.ar-lottery06.com/WinGo/${gameCode}/GetHistoryIssuePage.json?ts=${ts}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://draw.ar-lottery06.com/WinGo/${gameCode}/GetHistoryIssuePage.json?ts=${ts}`)}`
  ];

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(ep, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json, text/plain, */*' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const list = json?.data?.list;
        if (Array.isArray(list) && list.length > 0) {
          return list;
        }
      }
    } catch {}
  }
  return null;
}

async function runTraining() {
  console.log('===============================================================');
  console.log('🚀 DAMANHACK 24/7 FULL-DAY CONTINUOUS MODEL TRAINING PIPELINE');
  console.log('===============================================================\n');

  // 1. Initialize Dual-Layer Storage with MongoDB Atlas
  const initRes = await storage.init();
  console.log(`📡 Storage Mode: ${initRes.storageMode} | Cached Rounds: ${initRes.roundsStored}`);
  console.log(`🌐 MongoDB Atlas Connected: ${storage.isMongoConnected ? 'YES (Active)' : 'NO (Falling back to ACID WAL)'}`);

  // 2. Fetch fresh live draws from official API
  console.log('\n📥 Ingesting latest verified draws from official mirror...');
  try {
    const liveDraws = await fetchLiveOfficialDraws();
    if (liveDraws && liveDraws.length > 0) {
      let savedCount = 0;
      // Ingest in chronological order (oldest to newest)
      const chrono = [...liveDraws].reverse();
      for (const d of chrono) {
        const isNew = await storage.saveRound(d);
        if (isNew) savedCount++;
      }
      console.log(`✅ Ingested ${liveDraws.length} live draws from API (${savedCount} newly committed to DB).`);
    } else {
      console.log('ℹ️ Live API temporarily busy. Using existing verified persistent rounds.');
    }
  } catch (err) {
    console.warn('Live fetch warning:', err.message);
  }

  // 3. Load entire verified history sorted chronologically
  const rawHistory = await storage.getHistory(1000);
  console.log(`\n📚 Total Verified Rounds in Database: ${rawHistory.length}`);

  if (rawHistory.length < 15) {
    console.error('❌ Insufficient historical rounds to train the model. Minimum 15 required.');
    await storage.close();
    process.exit(1);
  }

  // Chronological order: index 0 is oldest, index N-1 is newest
  const historyChrono = [...rawHistory].sort((a, b) => {
    try {
      const aBig = BigInt(a.issueNumber);
      const bBig = BigInt(b.issueNumber);
      return aBig > bBig ? 1 : (aBig < bBig ? -1 : 0);
    } catch {
      return a.issueNumber.localeCompare(b.issueNumber);
    }
  });

  // 4. Load or initialize learning state
  const previousState = await storage.loadLearningState();
  if (previousState) {
    setNodeLearningState(previousState.weights, previousState.matrix);
    console.log(`🧠 Loaded prior learning weights from ${previousState.source}`);
  } else {
    console.log('🌱 Initializing foundational prior weights and uniform Bayesian transition matrix.');
  }

  let weights = getLearnedWeights();

  console.log('\n🏋️ Starting Chronological Walk-Forward Online Training...');
  let trainedCount = 0;
  let simulatedHits = 0;
  let simulatedSkips = 0;
  let simulatedLosses = 0;
  const brierErrors = [];
  const auditsToSave = [];

  const todayStr = new Date().toISOString().slice(0, 10);
  const dailyRollup = {
    date: todayStr,
    totalDrawsProcessed: 0,
    targetDailyRounds: 2880,
    settledPredictions: 0,
    winCount: 0,
    lossCount: 0,
    skippedCount: 0,
    winRatePercent: 50.0,
    brierScoresSum: 0,
    meanBrierScore: 0.2500,
    hourlyBuckets: {},
    lastUpdated: Date.now()
  };

  // Walk forward from round index 10 to N-1
  for (let i = 10; i < historyChrono.length; i++) {
    const currentDraw = historyChrono[i];
    // Strictly past slice: all rounds up to i-1, ordered newest first
    const pastSlice = historyChrono.slice(0, i).reverse();

    // Generate prediction using calibrated model & current weights
    const pred = generatePrediction(pastSlice, 'ultra_sniper', 'bigSmall', weights);
    const classified = classifyNumber(currentDraw.number);
    const actualBS = classified.bigSmall;
    const isWin = pred.prediction === actualBS;
    const isSkip = pred.action === 'NO_CLEAR_SIGNAL' || pred.action === 'WAIT_SKIP';

    // Calculate prediction error
    const probBig = pred.probabilities?.BIG ?? 0.50;
    const actualBinary = actualBS === 'BIG' ? 1.0 : 0.0;
    const brier = Math.pow(probBig - actualBinary, 2);

    const ts = currentDraw.timestamp ? new Date(Number(currentDraw.timestamp)) : new Date();
    const hourStr = String(ts.getUTCHours()).padStart(2, '0');
    if (!dailyRollup.hourlyBuckets[hourStr]) {
      dailyRollup.hourlyBuckets[hourStr] = { draws: 0, wins: 0, losses: 0, skips: 0 };
    }
    dailyRollup.hourlyBuckets[hourStr].draws++;
    dailyRollup.totalDrawsProcessed++;

    if (isSkip) {
      simulatedSkips++;
      dailyRollup.skippedCount++;
      dailyRollup.hourlyBuckets[hourStr].skips++;
    } else {
      dailyRollup.settledPredictions++;
      if (isWin) {
        simulatedHits++;
        brierErrors.push(brier);
        dailyRollup.winCount++;
        dailyRollup.hourlyBuckets[hourStr].wins++;
      } else {
        simulatedLosses++;
        brierErrors.push(brier);
        dailyRollup.lossCount++;
        dailyRollup.hourlyBuckets[hourStr].losses++;
      }
      dailyRollup.brierScoresSum += brier;
    }

    // Update weights online via regularized exponentiated gradient
    weights = updateLearningFromOutcome(pred, currentDraw);
    trainedCount++;

    auditsToSave.push({
      targetIssue: String(currentDraw.issueNumber),
      predicted: pred.prediction,
      actual: actualBS,
      actualNumber: classified.number,
      probA: probBig,
      isWin,
      action: pred.action,
      brierError: Math.round(brier * 10000) / 10000,
      timestamp: currentDraw.timestamp || Date.now()
    });
  }

  // Finalize daily rollup stats
  dailyRollup.meanBrierScore = dailyRollup.settledPredictions > 0 
    ? Math.round((dailyRollup.brierScoresSum / dailyRollup.settledPredictions) * 10000) / 10000 
    : 0.2500;
  dailyRollup.winRatePercent = dailyRollup.settledPredictions > 0 
    ? Math.round((dailyRollup.winCount / dailyRollup.settledPredictions) * 1000) / 10 
    : 50.0;
  dailyRollup.completionPercent = Math.min(100.0, Math.round((dailyRollup.totalDrawsProcessed / 2880) * 1000) / 10);

  // 5. Persist to MongoDB Atlas in fast batch transactions
  console.log(`💾 Committing ${auditsToSave.length} audited rounds to MongoDB Atlas...`);
  await storage.savePredictionAuditsBatch(auditsToSave);
  await storage.saveDailyRollup(dailyRollup);

  saveLearnedWeights(weights);
  const bayesianMatrix = getBayesianTransitionMatrix();
  await storage.saveLearningState(weights, bayesianMatrix);

  const meanBrier = brierErrors.length > 0 
    ? brierErrors.reduce((a, b) => a + b, 0) / brierErrors.length 
    : 0.2500;
  const totalSettled = simulatedHits + simulatedLosses;
  const winRate = totalSettled > 0 ? Math.round((simulatedHits / totalSettled) * 1000) / 10 : 50.0;

  console.log('\n===============================================================');
  console.log('📊 TRAINING RESULTS SUMMARY & PERSISTENCE REPORT');
  console.log('===============================================================');
  console.log(`✅ Rounds Trained:             ${trainedCount}`);
  console.log(`🎯 Settled Predictions:        ${totalSettled}`);
  console.log(`✅ Winning Hits:               ${simulatedHits}`);
  console.log(`❌ Losses:                     ${simulatedLosses}`);
  console.log(`🛡️ Intelligent Skips (Noise):  ${simulatedSkips} (Protected against losses!)`);
  console.log(`📈 Settled Win Rate:           ${winRate}%`);
  console.log(`📉 Mean Brier Score:           ${meanBrier.toFixed(4)} (Baseline: 0.2500, Lower = Better)`);

  console.log('\n🧠 Optimized Adaptive Model Weights:');
  console.log(`   - Higher-Order Markov (markov2):        ${weights.markov2?.toFixed(2)}`);
  console.log(`   - 10x10 Bayesian Transition Matrix:     ${weights.bayesianTrans?.toFixed(2)}`);
  console.log(`   - Multi-Horizon Cluster Parity:         ${weights.clusterParity?.toFixed(2)}`);
  console.log(`   - Omission Chi-Square Reversion:        ${weights.omissionRev?.toFixed(2)}`);
  console.log(`   - N-Gram Pattern Resonance:             ${weights.nGram?.toFixed(2)}`);
  console.log(`   - Streak Momentum Survival:             ${weights.dragonTrend?.toFixed(2)}`);

  // 6. Inspect Today's Full-Day Rollup from MongoDB
  const savedDaily = await storage.getDailyProgress();
  console.log('\n📅 Full-Day (24h) Learning Status in MongoDB:');
  console.log(`   - Date:                     ${savedDaily.date}`);
  console.log(`   - Draws Processed:          ${savedDaily.totalDrawsProcessed} / 2,880 (${savedDaily.completionPercent}%)`);
  console.log(`   - Settled Wins / Losses:    ${savedDaily.winCount} W / ${savedDaily.lossCount} L`);
  console.log(`   - Active Hourly Buckets:    ${Object.keys(savedDaily.hourlyBuckets || {}).length} hours logged`);

  // 7. Generate Live Prediction for Next Upcoming Draw
  const latestHistory = await storage.getHistory(300);
  const nextPred = generateCalibratedPrediction(latestHistory, 'bigSmall', weights);
  const nextIssue = nextPred.targetIssue;

  console.log('\n===============================================================');
  console.log(`🔮 LIVE PREDICTION FOR NEXT UPCOMING ROUND: Issue #${nextIssue}`);
  console.log('===============================================================');
  console.log(`🎯 Forecast:          ${nextPred.prediction}`);
  console.log(`🛡️ Action:            ${nextPred.action}`);
  console.log(`📊 Confidence:        ${nextPred.calibratedConfidence}%`);
  console.log(`⚖️ Model Agreement:   ${nextPred.modelAgreement}`);
  console.log(`🎲 Probability (BIG): ${Math.round((nextPred.probabilities?.BIG ?? 0.5) * 100)}% | (SMALL): ${Math.round((nextPred.probabilities?.SMALL ?? 0.5) * 100)}%`);
  console.log(`💡 Entropy:           ${nextPred.entropy} (Low = High Certainty)`);
  console.log('===============================================================\n');

  await storage.close();
  console.log('💾 All weights, Bayesian matrices, and daily rollups committed to MongoDB Atlas.');
}

runTraining().catch(err => {
  console.error('Fatal training error:', err);
  process.exit(1);
});
