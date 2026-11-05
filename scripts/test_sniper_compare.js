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

console.log('=== TESTING SNIPER MODE (SELECTIVE HIGH CONFLUENCE) ===');
let bets = 0, wins = 0, skips = 0;
let weights = getLearnedWeights();

for (let i = 8; i < allRounds.length; i++) {
  const historyBefore = allRounds.slice(0, i).reverse();
  const nextTarget = allRounds[i];
  const actualBS = parseInt(nextTarget.number, 10) >= 5 ? 'BIG' : 'SMALL';

  const pred = generatePrediction(historyBefore, 'sniper', 'bigSmall', weights);
  if (pred.action === 'NO_CLEAR_SIGNAL') {
    skips++;
    console.log(`Round #${nextTarget.issueNumber}: ⏸️ SKIPPED / NO CLEAR SIGNAL (0 LOSS SAFE PASS) | Actual was: ${actualBS}`);
  } else {
    bets++;
    const isWin = pred.prediction === actualBS;
    if (isWin) wins++;
    console.log(`Round #${nextTarget.issueNumber}: Bet ${pred.prediction} (${pred.confidence}%) | Actual was: ${actualBS} -> ${isWin ? '✅ WIN' : '❌ LOSS'}`);
  }
  weights = updateLearningFromOutcome(pred, nextTarget);
}

console.log(`\nResults: ${wins} wins / ${bets} bets (${bets > 0 ? ((wins / bets) * 100).toFixed(1) : 0}%) | ${skips} rounds safely skipped`);
