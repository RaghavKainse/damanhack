import { generatePrediction, classifyNumber } from '../src/utils/engine.js';

async function checkLiveWalkForward() {
  const res = await fetch('https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=' + Date.now());
  const json = await res.json();
  const list = json.data?.list || [];

  console.log(`Auditing recent live draws from #1412 to latest:\n`);

  for (let i = list.length - 2; i >= 0; i--) {
    const target = list[i];
    const pastSlice = list.slice(i + 1);
    const actual = classifyNumber(target.number);

    for (const mode of ['ultra_sniper', 'sniper', 'all']) {
      const pred = generatePrediction(pastSlice, mode, 'bigSmall');
      const isWin = pred.prediction === actual.bigSmall;
      console.log(`[${mode.padEnd(12)}] Issue #${target.issueNumber.slice(-4)} | Actual: ${actual.bigSmall.padEnd(5)} (${actual.number}) | Action: ${pred.action.padEnd(15)} | Pred: ${pred.prediction.padEnd(15)} | Conf: ${pred.confidence}% | Agree: ${pred.agreementCount}/8 | Win: ${pred.action.startsWith('CONFIRMED') ? (isWin ? '✅ WIN' : '❌ LOSS') : '⚪ SKIP'}`);
    }
    console.log('-'.repeat(100));
  }
}

checkLiveWalkForward();

