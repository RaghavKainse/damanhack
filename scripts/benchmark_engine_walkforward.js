import { storage } from '../server/storage.js';
import { generateFieldPrediction, classifyNumber } from '../src/utils/engine.js';
import { calculateBrierScore, calculateLogLoss, calculateBinomialSignificance, calculateConfusionMatrix } from '../src/utils/statisticalEngine.js';

async function runEngineBenchmark() {
  await storage.init();
  const history = await storage.getHistory(1000);
  const chron = [...history].sort((a, b) => BigInt(a.issueNumber) > BigInt(b.issueNumber) ? 1 : -1);

  console.log(`\n======================================================`);
  console.log(`📈 CHRONOLOGICAL WALK-FORWARD OF PRODUCTION ENGINE`);
  console.log(`======================================================\n`);
  console.log(`Total Draws Analyzed: ${chron.length} | Evaluated Steps: ${chron.length - 20}\n`);

  const windows = [50, 100, 200];
  const evalModels = ['markov2', 'bayesianTrans', 'dragonTrend', 'nGram', 'omissionRev', 'clusterParity', 'ENSEMBLE_ALL', 'ULTRA_SNIPER'];

  for (const winSize of windows) {
    if (chron.length - 20 < winSize) continue;

    const startT = chron.length - winSize;
    const store = {};
    for (const m of evalModels) {
      store[m] = { wins: 0, losses: 0, skips: 0, total: 0, probs: [], outcomes: [], preds: [], actuals: [] };
    }

    for (let t = startT; t < chron.length; t++) {
      const past = chron.slice(0, t).reverse();
      const actual = classifyNumber(chron[t].number).bigSmall;
      const isTargetA = actual === 'BIG';

      const predAll = generateFieldPrediction(past, 'bigSmall', 'all');

      for (const m of ['markov2', 'bayesianTrans', 'dragonTrend', 'nGram', 'omissionRev', 'clusterParity']) {
        const sig = predAll.signals[m];
        const win = sig.choice === actual;
        const probA = sig.a / 100;
        store[m].total++;
        if (win) store[m].wins++; else store[m].losses++;
        store[m].probs.push(probA);
        store[m].outcomes.push(isTargetA);
        store[m].preds.push(sig.choice);
        store[m].actuals.push(actual);
      }

      const ensWin = predAll.prediction === actual;
      store['ENSEMBLE_ALL'].total++;
      if (ensWin) store['ENSEMBLE_ALL'].wins++; else store['ENSEMBLE_ALL'].losses++;
      store['ENSEMBLE_ALL'].probs.push(predAll.signals.markov2.a / 100);
      store['ENSEMBLE_ALL'].outcomes.push(isTargetA);
      store['ENSEMBLE_ALL'].preds.push(predAll.prediction);
      store['ENSEMBLE_ALL'].actuals.push(actual);

      const predSniper = generateFieldPrediction(past, 'bigSmall', 'ultra_sniper');
      if (predSniper.action === 'NO_CLEAR_SIGNAL' || predSniper.action === 'WAIT_SKIP') {
        store['ULTRA_SNIPER'].skips++;
      } else {
        const sWin = predSniper.prediction === actual;
        store['ULTRA_SNIPER'].total++;
        if (sWin) store['ULTRA_SNIPER'].wins++; else store['ULTRA_SNIPER'].losses++;
        const probA = predSniper.prediction === 'BIG' ? (predSniper.confidence / 100) : (1 - predSniper.confidence / 100);
        store['ULTRA_SNIPER'].probs.push(probA);
        store['ULTRA_SNIPER'].outcomes.push(isTargetA);
        store['ULTRA_SNIPER'].preds.push(predSniper.prediction);
        store['ULTRA_SNIPER'].actuals.push(actual);
      }
    }

    console.log(`--------------------------------------------------------------------------------------------------------`);
    console.log(`CHRONOLOGICAL WINDOW: LAST ${winSize} ROUNDS`);
    console.log(`--------------------------------------------------------------------------------------------------------`);
    console.log(`Model Name         | Sample | Win Rate | Big Acc | Small Acc | Brier  | LogLoss | Skips | p-val (vs 50%)`);
    console.log(`-------------------|--------|----------|---------|-----------|--------|---------|-------|---------------`);

    for (const m of evalModels) {
      const s = store[m];
      const n = s.total;
      if (n === 0) {
        console.log(`${m.padEnd(18)} |   0    |    N/A   |   N/A   |    N/A    |   N/A  |   N/A   | ${String(s.skips).padStart(5)} |      N/A      `);
        continue;
      }
      const winRate = ((s.wins / n) * 100).toFixed(1);
      const conf = calculateConfusionMatrix(s.preds, s.actuals, 'BIG');
      const brier = calculateBrierScore(s.probs, s.outcomes).toFixed(4);
      const logLoss = calculateLogLoss(s.probs, s.outcomes).toFixed(4);
      const sig = calculateBinomialSignificance(s.wins, n, 0.50);
      const pVal = sig.pValue.toFixed(4);

      console.log(
        `${m.padEnd(18)} | ` +
        `${String(n).padStart(6)} | ` +
        `${(winRate + '%').padStart(8)} | ` +
        `${(conf.bigAccuracy + '%').padStart(7)} | ` +
        `${(conf.smallAccuracy + '%').padStart(9)} | ` +
        `${brier.padStart(6)} | ` +
        `${logLoss.padStart(7)} | ` +
        `${String(s.skips).padStart(5)} | ` +
        `${pVal.padStart(13)}`
      );
    }
    console.log('');
  }

  await storage.close();
  process.exit(0);
}

runEngineBenchmark().catch(console.error);

