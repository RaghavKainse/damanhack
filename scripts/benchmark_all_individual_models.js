import { storage } from '../server/storage.js';
import { generateFieldPrediction, classifyNumber } from '../src/utils/engine.js';

async function benchmarkAllModels() {
  await storage.init();
  const history = await storage.getHistory(1000);
  const chron = [...history].sort((a, b) => BigInt(a.issueNumber) > BigInt(b.issueNumber) ? 1 : -1);

  console.log(`Evaluating all individual models on ${chron.length} rounds...`);

  const models = [
    'markov2', 'dragonTrend', 'bayesianTrans', 'nGram',
    'omissionRev', 'clusterParity', 'logisticML', 'decisionTree',
    'poissonWait', 'crowdLiquidity', 'fourierCycle'
  ];

  const windows = [100, 200, 500, chron.length - 25];

  for (const winSize of windows) {
    const startT = chron.length - winSize;
    const stats = {};
    for (const m of models) stats[m] = { wins: 0, total: 0 };
    stats['ENSEMBLE'] = { wins: 0, total: 0 };

    for (let t = startT; t < chron.length; t++) {
      const past = chron.slice(0, t).reverse();
      const actual = classifyNumber(chron[t].number).bigSmall;

      const pred = generateFieldPrediction(past, 'bigSmall', 'all');

      for (const m of models) {
        const sig = pred.signals[m];
        if (!sig) continue;
        if (sig.choice === actual) stats[m].wins++;
        stats[m].total++;
      }

      if (pred.prediction === actual) stats['ENSEMBLE'].wins++;
      stats['ENSEMBLE'].total++;
    }

    console.log(`\n======================================================`);
    console.log(`WINDOW: LAST ${winSize} ROUNDS`);
    console.log(`======================================================`);
    console.log(`Model               | Wins | Total | Win Rate`);
    console.log(`--------------------+------+-------+---------`);
    for (const [m, s] of Object.entries(stats)) {
      const rate = ((s.wins / s.total) * 100).toFixed(1);
      console.log(`${m.padEnd(19)} | ${String(s.wins).padStart(4)} | ${String(s.total).padStart(5)} | ${rate.padStart(6)}%`);
    }
  }

  await storage.close();
}

benchmarkAllModels().catch(console.error);

