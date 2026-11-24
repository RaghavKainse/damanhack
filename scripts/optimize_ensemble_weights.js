import { storage } from '../server/storage.js';
import { generateFieldPrediction, classifyNumber, getContiguousHistory } from '../src/utils/engine.js';

async function optimizeWeights() {
  await storage.init();
  const rawList = await storage.getHistory(300);
  const list = getContiguousHistory(rawList);
  console.log(`Optimizing weights on ${list.length} unbroken draws...`);

  // Let's test different model weight combinations
  const weightSets = [
    {
      name: 'Current Learned Weights',
      weights: { decisionTree: 1.85, markov2: 1.80, nGram: 1.60, logisticML: 1.40, dragonTrend: 1.20, poissonWait: 0.80, clusterParity: 0.60, bayesianTrans: 0.50, omissionRev: 0.50 }
    },
    {
      name: 'High Bayesian + Omission',
      weights: { bayesianTrans: 2.00, omissionRev: 2.00, clusterParity: 1.50, logisticML: 1.50, decisionTree: 1.00, markov2: 0.80, nGram: 0.80, dragonTrend: 0.80, poissonWait: 0.50 }
    },
    {
      name: 'Equal Balanced Weights',
      weights: { decisionTree: 1.0, markov2: 1.0, nGram: 1.0, logisticML: 1.0, dragonTrend: 1.0, poissonWait: 1.0, clusterParity: 1.0, bayesianTrans: 1.0, omissionRev: 1.0 }
    },
    {
      name: 'Only Top 4 Quant Models',
      weights: { bayesianTrans: 2.0, omissionRev: 2.0, logisticML: 1.8, clusterParity: 1.5, decisionTree: 0.0, markov2: 0.0, nGram: 0.0, dragonTrend: 0.0, poissonWait: 0.0 }
    },
    {
      name: 'Bayesian Transition + Logistic ML + Decision Tree',
      weights: { bayesianTrans: 2.2, logisticML: 1.8, decisionTree: 1.5, omissionRev: 1.5, markov2: 1.0, nGram: 1.0, clusterParity: 1.0, dragonTrend: 0.5, poissonWait: 0.5 }
    },
    {
      name: 'Pure Anti-Streak Reversion in Chop',
      weights: { omissionRev: 2.5, bayesianTrans: 2.2, clusterParity: 1.8, logisticML: 1.6, markov2: 0.5, nGram: 0.5, dragonTrend: 0.2, decisionTree: 0.8, poissonWait: 0.5 }
    }
  ];

  for (const ws of weightSets) {
    let wins = 0;
    let losses = 0;
    let total = 0;

    let seqWins = 0;
    let seqLosses = 0;
    let curStep = 0;

    for (let i = list.length - 25; i >= 0; i--) {
      const past = list.slice(i + 1);
      const actualDraw = list[i];
      const actual = classifyNumber(actualDraw.number);
      
      const pred = generateFieldPrediction(past, 'bigSmall', 'all', null, null, ws.weights);
      total++;
      const isWin = pred.prediction === actual.bigSmall;
      if (isWin) {
        wins++;
        seqWins++;
        curStep = 0;
      } else {
        losses++;
        if (curStep === 2) {
          seqLosses++;
          curStep = 0;
        } else {
          curStep++;
        }
      }
    }

    const winRate = (wins / total * 100).toFixed(1);
    const seqRate = (seqWins / (seqWins + seqLosses) * 100).toFixed(1);
    console.log(`\nConfig: ${ws.name}`);
    console.log(`  All-Rounds Direct Win Rate: ${wins}/${total} (${winRate}%)`);
    console.log(`  3-Step Sequence Win Rate: ${seqWins}W / ${seqLosses}L (${seqRate}%)`);
  }

  await storage.close();
}

optimizeWeights().catch(console.error);
