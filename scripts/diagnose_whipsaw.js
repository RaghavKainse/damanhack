import { generatePrediction, classifyNumber } from '../src/utils/engine.js';

async function diagnoseWhipsaw() {
  const res = await fetch(`https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=${Date.now()}`);
  const json = await res.json();
  const list = json.data?.list || [];

  for (const issueTarget of ['1462', '1463', '1464', '1465']) {
    const idx = list.findIndex(x => x.issueNumber.endsWith(issueTarget));
    if (idx === -1) continue;
    const target = list[idx];
    const past = list.slice(idx + 1);
    const actual = classifyNumber(target.number);
    const pred = generatePrediction(past, 'all', 'bigSmall');

    console.log(`\n=================== ROUND #${issueTarget} ===================`);
    console.log(`Actual Draw   : ${actual.bigSmall} (${actual.number})`);
    console.log(`Model Predicted: ${pred.prediction} (Confidence: ${pred.confidence}%, RawDelta: ${pred.rawDelta}%)`);
    console.log(`Regime Detected: ${pred.regime}`);
    console.log(`Reason Given   : ${pred.reason}`);
    console.log(`Model Breakdown:`);
    for (const [mName, sig] of Object.entries(pred.signals)) {
      console.log(`   ${mName.padEnd(16)}: Choice=${sig.choice.padEnd(5)} | A=${sig.a}%, B=${sig.b}% | Weight=${sig.weight}`);
    }
  }
}

diagnoseWhipsaw();
