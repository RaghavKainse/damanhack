import { storage } from '../server/storage.js';
import { generateFieldPrediction, classifyNumber, getContiguousHistory } from '../src/utils/engine.js';

async function testPnL() {
  await storage.init();
  const rawList = await storage.getHistory(300);
  const list = getContiguousHistory(rawList);

  const bestWeights = {
    bayesianTrans: 2.0,
    omissionRev: 2.5,
    logisticML: 1.0,
    clusterParity: 1.0,
    decisionTree: 0.0,
    markov2: 0.5,
    dragonTrend: 0.2,
    nGram: 0.2,
    poissonWait: 0.4
  };

  let wins = 0, total = 0;
  let seqWins = 0, seqLosses = 0;
  let curStep = 0;
  let netPnL = 0;
  const stakes = [10, 30, 80];

  for (let i = list.length - 25; i >= 0; i--) {
    const past = list.slice(i + 1);
    const actual = classifyNumber(list[i].number);
    const pred = generateFieldPrediction(past, 'bigSmall', 'all', null, null, bestWeights);
    total++;
    const isWin = pred.prediction === actual.bigSmall;
    if (isWin) {
      wins++;
      seqWins++;
      const invested = stakes.slice(0, curStep + 1).reduce((a, b) => a + b, 0);
      const won = stakes[curStep] * 1.96;
      netPnL += (won - invested);
      curStep = 0;
    } else {
      if (curStep === 2) {
        seqLosses++;
        netPnL -= 120;
        curStep = 0;
      } else {
        curStep++;
      }
    }
  }

  console.log(`=== PnL FOR RANK #1 WEIGHTS IN ALL ROUNDS ===`);
  console.log(`Total: ${total} | Direct Wins: ${wins} (${(wins / total * 100).toFixed(1)}%)`);
  console.log(`3-Step Sequences: ${seqWins}W / ${seqLosses}L (${(seqWins / (seqWins + seqLosses) * 100).toFixed(1)}%)`);
  console.log(`Net PnL with 3-Step Sequence: ₹${netPnL.toFixed(1)}`);

  await storage.close();
}

testPnL().catch(console.error);

