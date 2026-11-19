import { evaluateHistoryPerformance, generatePrediction, getLearnedWeights, replayUntrainedHistory } from './src/utils/engine.js';
import { INITIAL_SEED_HISTORY } from './src/data/seedHistory.js';

console.log('Total rounds in seed:', INITIAL_SEED_HISTORY.length);

const rAll = evaluateHistoryPerformance(INITIAL_SEED_HISTORY, 'all', 'bigSmall');
console.log('Mode ALL: WinRate:', rAll.winRate + '%', 'Wins:', rAll.totalWins, 'Losses:', rAll.totalLosses, 'TotalBets:', rAll.totalBets);

const rSniper = evaluateHistoryPerformance(INITIAL_SEED_HISTORY, 'sniper', 'bigSmall');
console.log('Mode SNIPER: WinRate:', rSniper.winRate + '%', 'Wins:', rSniper.totalWins, 'Losses:', rSniper.totalLosses, 'TotalBets:', rSniper.totalBets, 'Skips:', rSniper.skippedRounds);

const rUltra = evaluateHistoryPerformance(INITIAL_SEED_HISTORY, 'ultra_sniper', 'bigSmall');
console.log('Mode ULTRA: WinRate:', rUltra.winRate + '%', 'Wins:', rUltra.totalWins, 'Losses:', rUltra.totalLosses, 'TotalBets:', rUltra.totalBets, 'Skips:', rUltra.skippedRounds);

console.log('\nGolden Basket hits:', rAll.goldenBasketHits, 'out of', rAll.totalBets);
let topHits = 0;
let bsMismatch = 0;
for (const log of rAll.logs) {
  if (log.predictedNumber === log.number) topHits++;
  const predNum = parseInt(log.predictedNumber, 10);
  if (!isNaN(predNum)) {
    const isPredNumBig = predNum >= 5;
    const isPredBSBig = log.predicted === 'BIG';
    if (isPredNumBig !== isPredBSBig) {
      bsMismatch++;
    }
  }
}
console.log('Exact Top Number hits:', topHits, 'out of', rAll.totalBets);
console.log('Number vs Big/Small Mismatch count:', bsMismatch, 'out of', rAll.totalBets, `(${Math.round(bsMismatch/rAll.totalBets*100)}%)`);

// Check Odd/Even
let totalOdd = 0, totalEven = 0;
for (const h of INITIAL_SEED_HISTORY) {
  if (h.number % 2 === 1) totalOdd++; else totalEven++;
}
console.log(`Seed Distribution: Odd = ${totalOdd}, Even = ${totalEven}`);

const rOE = evaluateHistoryPerformance(INITIAL_SEED_HISTORY, 'all', 'oddEven');
console.log('Mode OE ALL: WinRate:', rOE.winRate + '%', 'Wins:', rOE.totalWins, 'Losses:', rOE.totalLosses);

const rOESniper = evaluateHistoryPerformance(INITIAL_SEED_HISTORY, 'sniper', 'oddEven');
console.log('Mode OE SNIPER: WinRate:', rOESniper.winRate + '%', 'Wins:', rOESniper.totalWins, 'Losses:', rOESniper.totalLosses, 'Skips:', rOESniper.skippedRounds);

const rOEUltra = evaluateHistoryPerformance(INITIAL_SEED_HISTORY, 'ultra_sniper', 'oddEven');
console.log('Mode OE ULTRA: WinRate:', rOEUltra.winRate + '%', 'Wins:', rOEUltra.totalWins, 'Losses:', rOEUltra.totalLosses, 'Skips:', rOEUltra.skippedRounds);

