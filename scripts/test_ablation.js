import { storage } from '../server/storage.js';
import { classifyNumber } from '../src/utils/engine.js';
import { calculateBrierScore, calculateLogLoss, calculateBinomialSignificance } from '../src/utils/statisticalEngine.js';

async function testAblation() {
  await storage.init();
  const history = await storage.getHistory(1000);
  const chron = [...history].sort((a, b) => BigInt(a.issueNumber) > BigInt(b.issueNumber) ? 1 : -1);

  console.log(`Testing on ${chron.length} rounds...`);

  // Let's test combinations of models:
  // Combination 1: Full 8 models (original)
  // Combination 2: Without crowdLiquidity & fourierCycle
  // Combination 3: Markov + Bayesian + Dragon + NGram only
  // Combination 4: Dynamic Hedge with zero-weighting for models with Brier > 0.2500

  const configs = [
    { name: 'Original 8 Models', exclude: [] },
    { name: 'No Crowd (Real Data Only)', exclude: ['crowdLiquidity'] },
    { name: 'No Crowd & No Fourier', exclude: ['crowdLiquidity', 'fourierCycle'] },
    { name: 'Core Statistical (Markov+Bayes+Dragon+NGram)', includeOnly: ['markov2', 'dragonTrend', 'bayesianTrans', 'nGram'] }
  ];

  const { generateFieldPrediction } = await import('../src/utils/engine.js');

  for (const cfg of configs) {
    let wins = 0, total = 0, skips = 0;
    const probs = [];
    const outcomes = [];

    for (let t = 20; t < chron.length; t++) {
      const past = chron.slice(0, t).reverse();
      const actual = classifyNumber(chron[t].number).bigSmall;
      const isTargetA = actual === 'BIG';

      const pred = generateFieldPrediction(past, 'bigSmall', 'all');
      
      // Calculate ensemble probability according to cfg
      let totalW = 0;
      let weightedProbA = 0;

      for (const [key, sig] of Object.entries(pred.signals)) {
        if (cfg.exclude && cfg.exclude.includes(key)) continue;
        if (cfg.includeOnly && !cfg.includeOnly.includes(key)) continue;

        const w = sig.weight || 1.0;
        weightedProbA += (sig.a / 100) * w;
        totalW += w;
      }

      const ensA = totalW > 0 ? weightedProbA / totalW : 0.5;
      const choice = ensA >= 0.5 ? 'BIG' : 'SMALL';
      const isWin = choice === actual;

      total++;
      if (isWin) wins++;
      probs.push(ensA);
      outcomes.push(isTargetA);
    }

    const winRate = ((wins / total) * 100).toFixed(2);
    const brier = calculateBrierScore(probs, outcomes).toFixed(4);
    const logLoss = calculateLogLoss(probs, outcomes).toFixed(4);
    const sig = calculateBinomialSignificance(wins, total, 0.50);

    console.log(`${cfg.name.padEnd(46)} | Win Rate: ${winRate}% | Brier: ${brier} | LogLoss: ${logLoss} | p: ${sig.pValue.toFixed(4)}`);
  }

  await storage.close();
  process.exit(0);
}

testAblation().catch(console.error);

