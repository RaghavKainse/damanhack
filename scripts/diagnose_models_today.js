import { storage } from '../server/storage.js';
import { generateFieldPrediction, classifyNumber, getContiguousHistory } from '../src/utils/engine.js';

async function diagnoseAllRounds() {
  await storage.init();
  const rawList = await storage.getHistory(300);
  const list = getContiguousHistory(rawList);
  console.log(`Analyzing ${list.length} unbroken draws...`);

  const models = ['decisionTree', 'markov2', 'nGram', 'logisticML', 'dragonTrend', 'poissonWait', 'clusterParity', 'bayesianTrans', 'omissionRev'];
  const stats = {};
  models.forEach(m => { stats[m] = { wins: 0, losses: 0, total: 0 }; });

  let ensembleWins = 0;
  let ensembleLosses = 0;
  let total = 0;

  for (let i = list.length - 25; i >= 0; i--) {
    const past = list.slice(i + 1);
    const actualDraw = list[i];
    const actual = classifyNumber(actualDraw.number);
    const actualBS = actual.bigSmall;

    const pred = generateFieldPrediction(past, 'bigSmall', 'all');
    total++;

    if (pred.prediction === actualBS) ensembleWins++;
    else ensembleLosses++;

    // Check individual model picks
    const signals = pred.signals || {};
    for (const m of models) {
      const sig = signals[m];
      if (sig && sig.choice && sig.choice !== 'NEUTRAL') {
        stats[m].total++;
        if (sig.choice === actualBS) stats[m].wins++;
        else stats[m].losses++;
      }
    }
  }

  console.log(`\n=== ENSEMBLE OVERALL IN 'ALL' MODE ===`);
  console.log(`Total: ${total} | Wins: ${ensembleWins} | Losses: ${ensembleLosses} | Win Rate: ${(ensembleWins / total * 100).toFixed(1)}%`);

  console.log(`\n=== INDIVIDUAL MODEL PERFORMANCE ON TODAY'S DRAWS ===`);
  for (const m of models) {
    const s = stats[m];
    const rate = s.total > 0 ? (s.wins / s.total * 100).toFixed(1) : 'N/A';
    console.log(`- ${m.padEnd(16)}: ${s.wins}W / ${s.losses}L (Total: ${s.total}) -> ${rate}%`);
  }

  await storage.close();
}

diagnoseAllRounds().catch(console.error);
