import { generatePrediction, classifyNumber } from '../src/utils/engine.js';

async function debug1418() {
  const res = await fetch('https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=' + Date.now());
  const json = await res.json();
  const list = json.data?.list || [];
  const idx = list.findIndex(x => x.issueNumber.endsWith('1418'));
  console.log('Index of 1418 in fetched list:', idx);
  if (idx !== -1) {
    const past = list.slice(idx + 1);
    const pred = generatePrediction(past, 'sniper', 'bigSmall');
    console.log('Prediction for 1418:', pred.prediction, 'Action:', pred.action, 'Confidence:', pred.confidence, 'Agree:', pred.agreementCount);
    for (const [k, v] of Object.entries(pred.signals)) {
      console.log(`  ${k.padEnd(16)}: choice=${v.choice} (A=${v.a}%, B=${v.b}%) wt=${v.weight}`);
    }
  }
}

debug1418();

