import { fetchLiveHistory } from '../src/utils/api.js';
import { generatePrediction, classifyNumber } from '../src/utils/engine.js';

async function testWithoutPseudoCrowd() {
  const res = await fetchLiveHistory('WinGo_30S');
  const list = res.list;
  console.log(`Fetched ${list.length} live rounds.`);

  // Test with customWeights where crowdLiquidity is 0 vs 1.55
  console.log('\n--- EVALUATING WITHOUT SYNTHETIC CROWD NOISE ---');
  let winsNoCrowd = 0;
  let betsNoCrowd = 0;

  for (let i = list.length - 1; i >= 0; i--) {
    const past = list.slice(i + 1);
    if (past.length < 5) continue;

    const actual = classifyNumber(list[i].number);
    const pred = generatePrediction(past, 'sniper', 'bigSmall', {
      crowdLiquidity: 0.0, // Eliminate synthetic noise
      markov2: 1.5,
      dragonTrend: 1.3,
      bayesianTrans: 1.4,
      nGram: 1.2,
      omissionRev: 1.1,
      clusterParity: 1.1,
      fourierCycle: 0.8
    });

    const isWin = pred.prediction === actual.bigSmall;
    if (pred.action !== 'WAIT_SKIP') {
      betsNoCrowd++;
      if (isWin) winsNoCrowd++;
      console.log(`Round #${list[i].issueNumber.slice(-4)} | Actual: ${actual.bigSmall} (${actual.number}) | Pred: ${pred.prediction} | Win: ${isWin ? '✅' : '❌'} | Conf: ${pred.confidence}% | Agree: ${pred.agreementCount}/8`);
    } else {
      console.log(`Round #${list[i].issueNumber.slice(-4)} | Actual: ${actual.bigSmall} (${actual.number}) | SKIPPED`);
    }
  }

  console.log(`\nResults: ${winsNoCrowd} Wins / ${betsNoCrowd} Bets`);
  if (betsNoCrowd > 0) {
    console.log(`Win Rate: ${((winsNoCrowd / betsNoCrowd) * 100).toFixed(1)}%`);
  }
}

testWithoutPseudoCrowd();
