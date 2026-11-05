import { storage } from '../server/storage.js';
import { generatePrediction, classifyNumber } from '../src/utils/engine.js';

async function auditHistoricalPredictions() {
  await storage.init();
  const list = await storage.getHistory(300);
  console.log(`Analyzing ${list.length} historical draws from persistent WAL store...\n`);

  for (const mode of ['ultra_sniper', 'sniper', 'all']) {
    let bets = 0, wins = 0, losses = 0, skips = 0;
    const betDetails = [];

    // Evaluate walk-forward (from oldest past to newest)
    for (let i = list.length - 2; i >= 0; i--) {
      const pastSlice = list.slice(i + 1);
      if (pastSlice.length < 5) continue;

      const target = list[i];
      const actual = classifyNumber(target.number);
      const pred = generatePrediction(pastSlice, mode, 'bigSmall');

      const isSkip = pred.action === 'NO_CLEAR_SIGNAL' || pred.action === 'WAIT_SKIP';
      if (isSkip) {
        skips++;
      } else {
        bets++;
        const isWin = pred.prediction === actual.bigSmall;
        if (isWin) wins++; else losses++;
        betDetails.push({
          issue: target.issueNumber.slice(-4),
          pred: pred.prediction,
          actual: actual.bigSmall,
          num: actual.number,
          win: isWin,
          conf: pred.confidence,
          agree: pred.agreementCount
        });
      }
    }

    const winRate = bets > 0 ? ((wins / bets) * 100).toFixed(1) : 'N/A';
    console.log(`========================================================================`);
    console.log(`MODE: ${mode.toUpperCase()}`);
    console.log(`Total Rounds Evaluated: ${list.length - 5} | Bets Placed: ${bets} | Skips: ${skips}`);
    console.log(`Wins: ${wins} | Losses: ${losses} | Win Rate: ${winRate}%`);
    console.log(`========================================================================`);

    // Show last 10 bets
    if (betDetails.length > 0) {
      console.log('Last 10 Bets Placed:');
      for (const b of betDetails.slice(-10)) {
        console.log(`  Issue #${b.issue}: Predicted ${b.pred} (${b.conf}%, Agree ${b.agree}/8) -> Actual ${b.actual} (${b.num}) [${b.win ? '✅ WIN' : '❌ LOSS'}]`);
      }
    }
    console.log('\n');
  }
}

auditHistoricalPredictions();
