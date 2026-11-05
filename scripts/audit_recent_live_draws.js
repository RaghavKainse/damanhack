import { storage } from '../server/storage.js';
import { generatePrediction, classifyNumber } from '../src/utils/engine.js';

async function testAllModes() {
  await storage.init();
  const list = await storage.getHistory(100);
  console.log(`Auditing ${list.length} historical draws from persistent storage.\n`);

  for (const mode of ['ultra_sniper', 'sniper', 'all']) {
    let bets = 0, wins = 0, skips = 0;
    for (let i = Math.min(list.length - 2, 50); i >= 0; i--) {
      const pastSlice = list.slice(i + 1);
      if (pastSlice.length < 5) continue;
      const actual = classifyNumber(list[i].number);
      const pred = generatePrediction(pastSlice, mode, 'bigSmall');
      const isSkip = pred.action === 'NO_CLEAR_SIGNAL' || pred.action === 'WAIT_SKIP';
      if (isSkip) {
        skips++;
      } else {
        bets++;
        if (pred.prediction === actual.bigSmall) wins++;
      }
    }
    const winRate = bets > 0 ? ((wins / bets) * 100).toFixed(1) : 'N/A';
    console.log(`MODE: ${mode.padEnd(14)} | Bets: ${String(bets).padStart(2)} | Wins: ${String(wins).padStart(2)} | Losses: ${String(bets - wins).padStart(2)} | Skips: ${String(skips).padStart(2)} | Win Rate: ${winRate}%`);
  }
}

testAllModes();
