import { storage } from '../server/storage.js';
import { generateFieldPrediction, classifyNumber, updateLearningFromOutcome, resetLearnedWeights } from '../src/utils/engine.js';
import { calculateBrierScore, calculateLogLoss, calculateBinomialSignificance, calculateConfusionMatrix } from '../src/utils/statisticalEngine.js';

async function runOnlineWalkForward() {
  await storage.init();
  const history = await storage.getHistory(1000);
  const chron = [...history].sort((a, b) => BigInt(a.issueNumber) > BigInt(b.issueNumber) ? 1 : -1);

  resetLearnedWeights();
  let currentWeights = null;

  const store = { wins: 0, losses: 0, skips: 0, total: 0, probs: [], outcomes: [], preds: [], actuals: [] };
  const storeAll = { wins: 0, losses: 0, skips: 0, total: 0, probs: [], outcomes: [], preds: [], actuals: [] };

  for (let t = 20; t < chron.length; t++) {
    const past = chron.slice(0, t).reverse();
    const actualDraw = chron[t];
    const actualTarget = classifyNumber(actualDraw.number).bigSmall;
    const isTargetA = actualTarget === 'BIG';

    // 1. Predict with 'ultra_sniper'
    const predSniper = generateFieldPrediction(past, 'bigSmall', 'ultra_sniper', null, null, currentWeights);
    const isSkip = predSniper.action === 'NO_CLEAR_SIGNAL' || predSniper.action === 'WAIT_SKIP' || predSniper.prediction === 'NO CLEAR SIGNAL';

    if (isSkip) {
      store.skips++;
    } else {
      const isWin = predSniper.prediction === actualTarget;
      store.total++;
      if (isWin) store.wins++; else store.losses++;
      const probA = predSniper.prediction === 'BIG' ? (predSniper.confidence / 100) : (1 - predSniper.confidence / 100);
      store.probs.push(probA);
      store.outcomes.push(isTargetA);
      store.preds.push(predSniper.prediction);
      store.actuals.push(actualTarget);
    }

    // 2. Predict with 'all'
    const predAll = generateFieldPrediction(past, 'bigSmall', 'all', null, null, currentWeights);
    const allWin = predAll.prediction === actualTarget;
    storeAll.total++;
    if (allWin) storeAll.wins++; else storeAll.losses++;
    storeAll.probs.push(predAll.signals.markov2 ? (predAll.signals.markov2.a / 100) : 0.5);
    storeAll.outcomes.push(isTargetA);
    storeAll.preds.push(predAll.prediction);
    storeAll.actuals.push(actualTarget);

    // Online adaptation
    currentWeights = updateLearningFromOutcome(predSniper, actualDraw);
  }

  console.log(`\n========================================================================================================`);
  console.log(`CHRONOLOGICAL ONLINE WALK-FORWARD BENCHMARK WITH CONTINUOUS LEARNING (${chron.length - 20} Steps)`);
  console.log(`========================================================================================================`);
  
  // All mode
  const confAll = calculateConfusionMatrix(storeAll.preds, storeAll.actuals, 'BIG');
  const brierAll = calculateBrierScore(storeAll.probs, storeAll.outcomes);
  const logLossAll = calculateLogLoss(storeAll.probs, storeAll.outcomes);
  const sigAll = calculateBinomialSignificance(storeAll.wins, storeAll.total, 0.50);
  console.log(`Continuous Mode ('all'):`);
  console.log(`  Sample: ${storeAll.total} | Wins: ${storeAll.wins} | Losses: ${storeAll.losses}`);
  console.log(`  Win Rate: ${((storeAll.wins / storeAll.total) * 100).toFixed(1)}% (Big: ${confAll.bigAccuracy}%, Small: ${confAll.smallAccuracy}%)`);
  console.log(`  Brier Score: ${brierAll.toFixed(4)} | Log Loss: ${logLossAll.toFixed(4)} | p-value: ${sigAll.pValue.toFixed(4)}`);

  // Sniper mode
  const confSniper = calculateConfusionMatrix(store.preds, store.actuals, 'BIG');
  const brierSniper = calculateBrierScore(store.probs, store.outcomes);
  const logLossSniper = calculateLogLoss(store.probs, store.outcomes);
  const sigSniper = calculateBinomialSignificance(store.wins, store.total, 0.50);
  console.log(`\nSelective Mode ('ultra_sniper'):`);
  console.log(`  Total Evaluated: ${store.total + store.skips} | Confirmed Bets: ${store.total} | Skips: ${store.skips} (${((store.skips / (store.total + store.skips)) * 100).toFixed(1)}%)`);
  console.log(`  Wins: ${store.wins} | Losses: ${store.losses}`);
  console.log(`  Win Rate on Confirmed Bets: ${((store.wins / store.total) * 100).toFixed(1)}% (Big: ${confSniper.bigAccuracy}%, Small: ${confSniper.smallAccuracy}%)`);
  console.log(`  Brier Score: ${brierSniper.toFixed(4)} | Log Loss: ${logLossSniper.toFixed(4)} | p-value: ${sigSniper.pValue.toFixed(4)}`);
  console.log(`  Statistically Significant Edge: ${sigSniper.isSignificant ? 'YES' : 'NO (within normal random variance)'}`);

  await storage.close();
  process.exit(0);
}

runOnlineWalkForward().catch(console.error);

