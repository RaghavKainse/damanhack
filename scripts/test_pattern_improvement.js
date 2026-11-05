import fs from 'fs';
import { generatePrediction, classifyNumber, getLearnedWeights, updateLearningFromOutcome } from '../src/utils/engine.js';

const store = JSON.parse(fs.readFileSync('data/learning_store.json', 'utf8'));
const rounds = store.rounds || [];
console.log(`Loaded ${rounds.length} historical rounds from store.`);

// Test current engine on store rounds
let bets = 0, wins = 0, losses = 0;
let maxLossStreak = 0, currentLossStreak = 0;
let weights = getLearnedWeights();

// Evaluate chronologically
for (let i = rounds.length - 1; i >= 1; i--) {
  // history before round i
  const historyBefore = rounds.slice(i);
  if (historyBefore.length < 5) continue;
  const target = rounds[i - 1];
  const actualBS = parseInt(target.number, 10) >= 5 ? 'BIG' : 'SMALL';

  const pred = generatePrediction(historyBefore, 'all', 'bigSmall', weights);
  bets++;
  const isWin = pred.prediction === actualBS;
  if (isWin) {
    wins++;
    currentLossStreak = 0;
  } else {
    losses++;
    currentLossStreak++;
    if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
  }
  weights = updateLearningFromOutcome(pred, target);
}

console.log(`\n--- BASELINE RESULTS ON ${bets} STORE ROUNDS ---`);
console.log(`Wins: ${wins} / ${bets} (${((wins / bets) * 100).toFixed(1)}%) | Losses: ${losses}`);
console.log(`Max Loss Streak: ${maxLossStreak}`);

