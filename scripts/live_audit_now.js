import { generatePrediction, classifyNumber } from '../src/utils/engine.js';

async function liveAuditNow() {
  const ts = Date.now();
  const res = await fetch(`https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=${ts}`);
  const json = await res.json();
  const list = json.data?.list || [];

  console.log(`Live Check Time: ${new Date().toLocaleTimeString()} (IST)`);
  console.log(`Fetched ${list.length} recent rounds from AR-Lottery CDN.\n`);

  if (list.length === 0) {
    console.log('Failed to fetch live rounds.');
    return;
  }

  const latestSettled = list[0];
  console.log(`🏆 Latest Settled Draw on Server: #${latestSettled.issueNumber} -> Number: ${latestSettled.number} (${classifyNumber(latestSettled.number).bigSmall}, ${latestSettled.color})`);

  // Active prediction for upcoming round
  const predAll = generatePrediction(list, 'all', 'bigSmall');
  const predSniper = generatePrediction(list, 'sniper', 'bigSmall');

  console.log(`\n🔮 Active Prediction for Next Round (#${(BigInt(latestSettled.issueNumber) + 1n).toString().slice(-4)}):`);
  console.log(`   [All-Rounds Mode] : ${predAll.prediction} (${predAll.confidence}%) | Action: ${predAll.action} | Top Digit: ${predAll.topNumber?.number} | Agree: ${predAll.agreementCount}/8`);
  console.log(`   [Sniper Mode]     : ${predSniper.prediction} (${predSniper.confidence}%) | Action: ${predSniper.action} | Agree: ${predSniper.agreementCount}/8`);

  console.log('\n📊 Walk-Forward Verification on Last 10 Settled Draws:');
  console.log('='.repeat(75));
  console.log('ROUND  | ACTUAL    | PREDICTED | CONF  | AGREE | VERDICT');
  console.log('='.repeat(75));

  let wins = 0, bets = 0;
  for (let i = Math.min(10, list.length - 2); i >= 0; i--) {
    const target = list[i];
    const past = list.slice(i + 1);
    const actual = classifyNumber(target.number);
    const pred = generatePrediction(past, 'all', 'bigSmall');
    const isWin = pred.prediction === actual.bigSmall;
    bets++;
    if (isWin) wins++;

    console.log(
      `#${target.issueNumber.slice(-4)}  | ` +
      `${actual.bigSmall.padEnd(5)} (${actual.number}) | ` +
      `${pred.prediction.padEnd(9)} | ` +
      `${pred.confidence}%  | ` +
      `${pred.agreementCount}/8   | ` +
      `${isWin ? '✅ WIN' : '❌ LOSS'}`
    );
  }
  console.log('='.repeat(75));
  console.log(`Last 10 Draws Score: ${wins} Wins / ${bets} Rounds (${((wins / bets) * 100).toFixed(1)}% Accuracy)`);
}

liveAuditNow();

