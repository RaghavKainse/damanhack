import { analyzeFieldPatterns } from '../src/utils/engine.js';

// Double jump pattern: S, S, B, B
const list = [
  { number: '2', bigSmall: 'SMALL' },
  { number: '3', bigSmall: 'SMALL' },
  { number: '6', bigSmall: 'BIG' },
  { number: '7', bigSmall: 'BIG' },
];

const analysis = analyzeFieldPatterns(list, 'bigSmall');
console.log('analysis:', {
  streak: analysis.currentStreak,
  isDoubleJump: analysis.isDoubleJump,
  isMirror: analysis.isMirror,
});
