import { generatePrediction, classifyNumber, getLearnedWeights, updateLearningFromOutcome } from '../src/utils/engine.js';

// The draws in chronological order (oldest to newest):
const rounds = [
  { issueNumber: '20261105100051464', number: '6', colour: 'red' },
  { issueNumber: '20261105100051465', number: '1', colour: 'green' },
  { issueNumber: '20261105100051466', number: '6', colour: 'red' },
  { issueNumber: '20261105100051467', number: '3', colour: 'green' },
  { issueNumber: '20261105100051468', number: '6', colour: 'red' },
  { issueNumber: '20261105100051469', number: '2', colour: 'red' },
  { issueNumber: '20261105100051470', number: '9', colour: 'green' },
  { issueNumber: '20261105100051471', number: '7', colour: 'green' },
  { issueNumber: '20261105100051472', number: '3', colour: 'green' },
  { issueNumber: '20261105100051473', number: '2', colour: 'red' },
];

let weights = getLearnedWeights();
let wins = 0;
let total = 0;

console.log('--- REPLAYING ROUNDS 1465 TO 1473 ---');
for (let i = 1; i < rounds.length; i++) {
  // historyList available before round i is drawn (reverse chronological: index 0 is most recent)
  const historyBefore = rounds.slice(0, i).reverse();
  const nextTarget = rounds[i];
  const actualBS = parseInt(nextTarget.number, 10) >= 5 ? 'BIG' : 'SMALL';

  const pred = generatePrediction(historyBefore, 'all', 'bigSmall', weights);
  const isWin = pred.prediction === actualBS;
  if (isWin) wins++;
  total++;

  console.log(`Round #${nextTarget.issueNumber}: Predicted ${pred.prediction} (${pred.confidence}%, action=${pred.action}) | Actual: ${actualBS} (${nextTarget.number}) -> ${isWin ? '✅ WIN' : '❌ LOSS'}`);
  console.log(`  Signals: pingPong=${pred.patternDetected}, dragon=${pred.modelSignals?.dragonTrend?.choice}, markov=${pred.modelSignals?.markov2?.choice}, cluster=${pred.modelSignals?.clusterParity?.choice}, omission=${pred.modelSignals?.omissionRev?.choice}`);

  weights = updateLearningFromOutcome(pred, nextTarget);
}

console.log(`\nScore: ${wins} wins / ${total} total (${Math.round((wins / total) * 100)}%)`);

