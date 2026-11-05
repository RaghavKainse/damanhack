import { storage } from '../server/storage.js';
import { generatePrediction, classifyNumber } from '../src/utils/engine.js';

async function testAlwaysPredictAll() {
  await storage.init();
  const list = await storage.getHistory(200);

  let bets = 0, wins = 0, losses = 0;
  let maxLossStreak = 0, currentLossStreak = 0;

  for (let i = list.length - 2; i >= 0; i--) {
    const pastSlice = list.slice(i + 1);
    if (pastSlice.length < 5) continue;
    const actual = classifyNumber(list[i].number);
    // In all mode without skip:
    const pred = generatePrediction(pastSlice, 'all', 'bigSmall');
    bets++;
    const isWin = pred.prediction === actual.bigSmall;
    if (isWin) {
      wins++;
      currentLossStreak = 0;
    } else {
      losses++;
      currentLossStreak++;
      if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
    }
  }

  console.log(`Evaluated ${bets} Consecutive Unbroken Rounds:`);
  console.log(`Wins: ${wins} | Losses: ${losses} | Win Rate: ${((wins / bets) * 100).toFixed(1)}%`);
  console.log(`Max Consecutive Loss Streak: ${maxLossStreak} rounds`);
}

testAlwaysPredictAll();
