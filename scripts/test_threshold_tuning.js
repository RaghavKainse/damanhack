import { storage } from '../server/storage.js';
import { generatePrediction, classifyNumber } from '../src/utils/engine.js';

async function testThresholds() {
  await storage.init();
  const list = await storage.getHistory(300);
  console.log(`Testing Confluence Gating Thresholds on ${list.length} historical draws:\n`);

  for (const minAgree of [5, 6, 7]) {
    for (const minDelta of [1.5, 2.0, 2.5]) {
      let bets = 0, wins = 0;
      for (let i = list.length - 2; i >= 0; i--) {
        const pastSlice = list.slice(i + 1);
        if (pastSlice.length < 5) continue;
        const actual = classifyNumber(list[i].number);
        const pred = generatePrediction(pastSlice, 'all', 'bigSmall'); // check raw ensemble
        
        const rawDelta = pred.rawDelta !== undefined ? pred.rawDelta : Math.abs(pred.confidence - 50);
        if (pred.agreementCount >= minAgree && rawDelta >= minDelta) {
          bets++;
          if (pred.prediction === actual.bigSmall) wins++;
        }
      }
      const acc = bets > 0 ? ((wins / bets) * 100).toFixed(1) : '0.0';
      console.log(`Agree >= ${minAgree}/8 | Delta >= ${minDelta}% -> Bets: ${String(bets).padStart(3)} | Wins: ${String(wins).padStart(3)} | Losses: ${String(bets - wins).padStart(3)} | Accuracy: ${acc}%`);
    }
  }
}

testThresholds();
