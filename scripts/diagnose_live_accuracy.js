import { fetchLiveHistory } from '../src/utils/api.js';
import { generatePrediction, classifyNumber } from '../src/utils/engine.js';

async function diagnoseLiveAccuracy() {
  const res = await fetchLiveHistory('WinGo_30S');
  if (!res.success || !res.list) {
    console.log('Failed to fetch live history');
    return;
  }

  const list = res.list;
  console.log(`Fetched ${list.length} live rounds from official CDN.`);

  // Walk back across these rounds
  console.log('\n--- EVALUATING REAL RECENT ROUNDS ---');
  let confirmedBets = 0;
  let confirmedWins = 0;
  let confirmedLosses = 0;
  let skipped = 0;

  for (let i = list.length - 1; i >= 0; i--) {
    const past = list.slice(i + 1);
    if (past.length < 5) continue;

    const actual = classifyNumber(list[i].number);
    const pred = generatePrediction(past, 'ultra_sniper', 'bigSmall');
    const isWin = pred.prediction === actual.bigSmall;

    if (pred.action === 'WAIT_SKIP') {
      skipped++;
      console.log(`Round #${list[i].issueNumber.slice(-4)} | Actual: ${actual.bigSmall} (${actual.number}) | Pred: ${pred.prediction} | ACTION: [WAIT_SKIP] (Skipped)`);
    } else {
      confirmedBets++;
      if (isWin) confirmedWins++;
      else confirmedLosses++;
      console.log(`Round #${list[i].issueNumber.slice(-4)} | Actual: ${actual.bigSmall} (${actual.number}) | Pred: ${pred.prediction} | ACTION: [CONFIRMED_BET] | Result: ${isWin ? '✅ WIN' : '❌ LOSS'} | Conf: ${pred.confidence}% | Agree: ${pred.agreementCount}/8`);
    }
  }

  console.log('\nSummary:');
  console.log(`Total Rounds: ${list.length}`);
  console.log(`Skipped Rounds: ${skipped}`);
  console.log(`Confirmed Bets: ${confirmedBets}`);
  console.log(`Confirmed Wins: ${confirmedWins} | Losses: ${confirmedLosses}`);
  if (confirmedBets > 0) {
    console.log(`Win Rate on Confirmed Bets: ${((confirmedWins / confirmedBets) * 100).toFixed(1)}%`);
  }
}

diagnoseLiveAccuracy();
