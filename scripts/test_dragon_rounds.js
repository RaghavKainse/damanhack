import { generatePrediction, getLearnedWeights, updateLearningFromOutcome } from '../src/utils/engine.js';

const allRounds = [
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
  { issueNumber: '20261105100051474', number: '4', colour: 'red' },
  { issueNumber: '20261105100051475', number: '2', colour: 'red' },
  { issueNumber: '20261105100051476', number: '3', colour: 'green' },
  { issueNumber: '20261105100051477', number: '2', colour: 'red' },
  { issueNumber: '20261105100051478', number: '6', colour: 'red' },
];

let weights = getLearnedWeights();
let wins = 0;
let total = 0;

for (let i = 8; i < allRounds.length; i++) {
  const historyBefore = allRounds.slice(0, i).reverse();
  const nextTarget = allRounds[i];
  const actualBS = parseInt(nextTarget.number, 10) >= 5 ? 'BIG' : 'SMALL';

  const pred = generatePrediction(historyBefore, 'all', 'bigSmall', weights);
  const isWin = pred.prediction === actualBS;
  if (isWin) wins++;
  total++;

  console.log(`Round #${nextTarget.issueNumber}: Predicted ${pred.prediction} (${pred.confidence}%) | Actual: ${actualBS} (${nextTarget.number}) -> ${isWin ? '✅ WIN' : '❌ LOSS'} | Pattern: ${pred.patternDetected || pred.reason.slice(0, 30)}`);
  weights = updateLearningFromOutcome(pred, nextTarget);
}

console.log(`\nScore: ${wins} wins / ${total} total (${Math.round((wins / total) * 100)}%)`);

