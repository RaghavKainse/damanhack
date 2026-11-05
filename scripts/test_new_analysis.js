import { classifyNumber } from '../src/utils/engine.js';

function analyzeFieldPatternsTest(list, field = 'bigSmall') {
  if (!list || list.length === 0) {
    return { currentStreak: { type: 'NONE', count: 0 }, isPingPong: false, pingPongCount: 0, isDoubleJump: false, isDoubleForming: false, isMirror: false, firstRatio: 50, secondRatio: 50, firstCount: 0, secondCount: 0, regime: 'EQUILIBRIUM' };
  }
  const items = list.map(item => classifyNumber(item.number));
  const values = items.map(i => i[field]);
  const firstValue = values[0];
  const isTargetFirst = field === 'bigSmall' ? 'BIG' : 'ODD';
  const isTargetSecond = field === 'bigSmall' ? 'SMALL' : 'EVEN';

  let streakCount = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] === firstValue) streakCount++;
    else break;
  }

  let pingPongCount = 1;
  for (let i = 1; i < Math.min(values.length, 14); i++) {
    if (values[i] !== values[i - 1]) pingPongCount++;
    else break;
  }
  const isPingPong = pingPongCount >= 3;

  let isDoubleJump = false;
  if (values.length >= 4) {
    const v0 = values[0], v1 = values[1], v2 = values[2], v3 = values[3];
    if (v0 === v1 && v2 === v3 && v0 !== v2) isDoubleJump = true;
  }

  let isDoubleForming = false;
  if (values.length >= 3) {
    const v0 = values[0], v1 = values[1], v2 = values[2];
    if (v1 === v2 && v0 !== v1) isDoubleForming = true;
  }

  let isMirror = false;
  if (values.length >= 3) {
    if (values[0] === values[2] && values[0] !== values[1]) isMirror = true;
  }

  const sample = values.slice(0, 50);
  const firstCount = sample.filter(v => v === isTargetFirst).length;
  const secondCount = sample.length - firstCount;
  const firstRatio = Math.round((firstCount / sample.length) * 100);
  const secondRatio = 100 - firstRatio;

  let regime = 'EQUILIBRIUM';
  if (streakCount >= 4) regime = 'DRAGON_STREAK';
  else if (isPingPong) regime = 'PING_PONG_WAVE';
  else if (isDoubleJump || isDoubleForming) regime = 'DOUBLE_JUMP';
  else if (Math.abs(firstRatio - 50) >= 16) regime = 'MEAN_REVERSION_SKEW';
  else regime = 'OSCILLATION_CHOP';

  return {
    currentStreak: { type: firstValue, count: streakCount },
    isPingPong,
    pingPongCount,
    isDoubleJump,
    isDoubleForming,
    isMirror,
    firstCount,
    secondCount,
    firstRatio,
    secondRatio,
    regime
  };
}

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

  const analysis = analyzeFieldPatternsTest(historyBefore, 'bigSmall');
  console.log(`Round #${nextTarget.issueNumber} (actual: ${actualBS}): regime=${analysis.regime}, isDoubleForming=${analysis.isDoubleForming}, isDoubleJump=${analysis.isDoubleJump}, streak=${analysis.currentStreak.type}x${analysis.currentStreak.count}`);
}
