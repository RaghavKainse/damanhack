import { storage } from '../server/storage.js';
import { generateFieldPrediction, classifyNumber, getLearnedWeights } from '../src/utils/engine.js';
import { calculateBrierScore, calculateLogLoss, calculateBinomialSignificance } from '../src/utils/statisticalEngine.js';

async function runAudit() {
  await storage.init();
  const history = await storage.getHistory(1000);
  console.log(`Analyzing ${history.length} verified historical rounds from storage...`);

  // Chronological order: oldest [0] -> newest [N-1]
  const chron = [...history].sort((a, b) => {
    try {
      const aB = BigInt(a.issueNumber);
      const bB = BigInt(b.issueNumber);
      return aB > bB ? 1 : (aB < bB ? -1 : 0);
    } catch {
      return a.issueNumber.localeCompare(b.issueNumber);
    }
  });

  const modelKeys = [
    'crowdLiquidity',
    'markov2',
    'dragonTrend',
    'bayesianTrans',
    'nGram',
    'omissionRev',
    'clusterParity',
    'fourierCycle',
    'ENSEMBLE_ALL',
    'ULTRA_SNIPER'
  ];

  const stats = {};
  for (const k of modelKeys) {
    stats[k] = {
      predictions: [],
      probabilities: [],
      outcomes: [],
      wins: 0,
      losses: 0,
      skips: 0,
      total: 0
    };
  }

  for (let t = 20; t < chron.length; t++) {
    const past = chron.slice(0, t).reverse();
    const actualTarget = classifyNumber(chron[t].number).bigSmall;
    const isTargetA = actualTarget === 'BIG';

    // 1. Evaluate 'all' mode
    const predAll = generateFieldPrediction(past, 'bigSmall', 'all');

    for (const k of ['crowdLiquidity', 'markov2', 'dragonTrend', 'bayesianTrans', 'nGram', 'omissionRev', 'clusterParity', 'fourierCycle']) {
      const sig = predAll.signals[k];
      const win = sig.choice === actualTarget;
      const probA = sig.a / 100;

      stats[k].total++;
      if (win) stats[k].wins++; else stats[k].losses++;
      stats[k].probabilities.push(probA);
      stats[k].outcomes.push(isTargetA);
      stats[k].predictions.push(sig.choice);
    }

    const ensembleWin = predAll.prediction === actualTarget;
    stats['ENSEMBLE_ALL'].total++;
    if (ensembleWin) stats['ENSEMBLE_ALL'].wins++; else stats['ENSEMBLE_ALL'].losses++;
    stats['ENSEMBLE_ALL'].probabilities.push(predAll.signals.markov2.a / 100);
    stats['ENSEMBLE_ALL'].outcomes.push(isTargetA);
    stats['ENSEMBLE_ALL'].predictions.push(predAll.prediction);

    // 2. Evaluate 'ultra_sniper' mode
    const predSniper = generateFieldPrediction(past, 'bigSmall', 'ultra_sniper');
    if (predSniper.action === 'NO_CLEAR_SIGNAL' || predSniper.action === 'WAIT_SKIP') {
      stats['ULTRA_SNIPER'].skips++;
    } else {
      const sWin = predSniper.prediction === actualTarget;
      stats['ULTRA_SNIPER'].total++;
      if (sWin) stats['ULTRA_SNIPER'].wins++; else stats['ULTRA_SNIPER'].losses++;
      const probA = predSniper.prediction === 'BIG' ? (predSniper.confidence / 100) : (1 - predSniper.confidence / 100);
      stats['ULTRA_SNIPER'].probabilities.push(probA);
      stats['ULTRA_SNIPER'].outcomes.push(isTargetA);
      stats['ULTRA_SNIPER'].predictions.push(predSniper.prediction);
    }
  }

  console.log(`\n========================================================================================================`);
  console.log(`DEEP AUDIT REPORT: MODEL PERFORMANCE ON REAL DRAWS (Total Evaluated Steps: ${chron.length - 20})`);
  console.log(`========================================================================================================`);
  console.log(`Model Name         | Sample | Win Rate | Wins | Loss | Skips | Brier  | LogLoss | p-val  | Stat Sig?`);
  console.log(`-------------------|--------|----------|------|------|-------|--------|---------|--------|----------`);

  for (const k of modelKeys) {
    const s = stats[k];
    const n = s.total;
    if (n === 0) {
      console.log(`${k.padEnd(18)} |   0    |    N/A   |  0   |  0   | ${String(s.skips).padStart(5)} |   N/A  |   N/A   |  N/A   | No bets`);
      continue;
    }
    const winRate = ((s.wins / n) * 100).toFixed(1);
    const brier = calculateBrierScore(s.probabilities, s.outcomes).toFixed(4);
    const logLoss = calculateLogLoss(s.probabilities, s.outcomes).toFixed(4);
    const sig = calculateBinomialSignificance(s.wins, n, 0.50);
    const pVal = sig.pValue.toFixed(4);
    const sigStr = sig.isSignificant ? (sig.hasEdge ? '✅ EDGE' : '❌ WORSE') : '➖ NO EDGE';

    console.log(
      `${k.padEnd(18)} | ` +
      `${String(n).padStart(6)} | ` +
      `${(winRate + '%').padStart(8)} | ` +
      `${String(s.wins).padStart(4)} | ` +
      `${String(s.losses).padStart(4)} | ` +
      `${String(s.skips).padStart(5)} | ` +
      `${brier.padStart(6)} | ` +
      `${logLoss.padStart(7)} | ` +
      `${pVal.padStart(6)} | ` +
      `${sigStr}`
    );
  }

  console.log(`========================================================================================================\n`);
  await storage.close();
}

runAudit().catch(console.error);

