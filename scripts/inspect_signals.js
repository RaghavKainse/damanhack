import { generatePrediction, classifyNumber } from '../src/utils/engine.js';
import { storage } from '../server/storage.js';

async function inspectSignals() {
  await storage.init();
  const list = await storage.getHistory(30);
  for (let i = 0; i < 5; i++) {
    const past = list.slice(i + 1);
    const actual = classifyNumber(list[i].number);
    const pred = generatePrediction(past, 'sniper', 'bigSmall');
    console.log(`\nDraw #${list[i].issueNumber.slice(-4)} | Actual: ${actual.bigSmall} (${actual.number}) | Pred: ${pred.prediction} | Action: ${pred.action} | Agree: ${pred.agreementCount}/8`);
    for (const [k, v] of Object.entries(pred.signals)) {
      console.log(`  ${k.padEnd(16)}: ${v.choice} (A=${v.a}%, B=${v.b}%) wt=${v.weight}`);
    }
  }
}

inspectSignals();

