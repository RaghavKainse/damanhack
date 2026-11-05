import { generateFieldPrediction } from '../src/utils/engine.js';

const rounds = [
  { issueNumber: '20261105100051464', number: '6', colour: 'red', bigSmall: 'BIG' },
  { issueNumber: '20261105100051465', number: '1', colour: 'green', bigSmall: 'SMALL' },
  { issueNumber: '20261105100051466', number: '6', colour: 'red', bigSmall: 'BIG' },
  { issueNumber: '20261105100051467', number: '3', colour: 'green', bigSmall: 'SMALL' },
  { issueNumber: '20261105100051468', number: '6', colour: 'red', bigSmall: 'BIG' },
  { issueNumber: '20261105100051469', number: '2', colour: 'red', bigSmall: 'SMALL' },
  { issueNumber: '20261105100051470', number: '9', colour: 'green', bigSmall: 'BIG' },
  { issueNumber: '20261105100051471', number: '7', colour: 'green', bigSmall: 'BIG' },
  { issueNumber: '20261105100051472', number: '3', colour: 'green', bigSmall: 'SMALL' },
];

const historyBefore1473 = [...rounds].reverse();
const pred = generateFieldPrediction(historyBefore1473, 'bigSmall', 'all');

console.log('--- DIAGNOSIS FOR ROUND 1473 ---');
console.log('Prediction:', pred.prediction, 'Confidence:', pred.confidence, '%');
console.log('Signals:', pred.signals);
console.log('Reason:', pred.reason);
console.log('Pattern Detected:', pred.patternDetected);
