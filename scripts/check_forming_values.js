import { classifyNumber, getLearnedWeights, updateLearningFromOutcome, analyzeFieldPatterns } from '../src/utils/engine.js';

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

for (let i = 8; i < allRounds.length; i++) {
  const historyBefore = allRounds.slice(0, i).reverse();
  const nextTarget = allRounds[i];
  const actualBS = parseInt(nextTarget.number, 10) >= 5 ? 'BIG' : 'SMALL';

  const values = historyBefore.map(h => parseInt(h.number, 10) >= 5 ? 'BIG' : 'SMALL');
  const v0 = values[0];
  const v1 = values[1];
  const v2 = values[2];
  const v3 = values[3];
  const isDoubleForming = (v1 === v2 && v0 !== v1);
  const isDoubleJump = (v0 === v1 && v2 === v3 && v0 !== v2);

  console.log(`Round #${nextTarget.issueNumber} (actual: ${actualBS}): v0=${v0}, v1=${v1}, v2=${v2} | isDoubleForming=${isDoubleForming}, isDoubleJump=${isDoubleJump}`);
}

