import { storage } from '../server/storage.js';
import { generatePrediction, classifyNumber, getContiguousHistory } from '../src/utils/engine.js';

async function test100Latency() {
  await storage.init();
  const rawList = await storage.getHistory(300);
  const list = getContiguousHistory(rawList);

  const t0 = performance.now();
  const testWindow = Math.min(list.length - 1, 100);
  let wins = 0, total = 0;
  const logs = [];

  for (let i = testWindow - 1; i >= 0; i--) {
    const past = list.slice(i + 1);
    const actual = classifyNumber(list[i].number);
    const pred = generatePrediction(past, 'all', 'bigSmall');
    total++;
    const isWin = pred.prediction === actual.bigSmall;
    if (isWin) wins++;
    logs.unshift({
      issueNumber: list[i].issueNumber,
      number: actual.number,
      actualOddEven: actual.oddEven,
      actualBigSmall: actual.bigSmall,
      actualColor: actual.color,
      predicted: pred.prediction,
      predictedNumber: pred.topNumber?.number ?? '---',
      confidence: pred.confidence,
      isWin,
      action: 'CONFIRMED_BET'
    });
  }
  const t1 = performance.now();

  console.log(`Evaluated ${total} rounds in ${(t1 - t0).toFixed(2)}ms!`);
  console.log(`Direct Wins: ${wins}/${total} (${(wins / total * 100).toFixed(1)}%)`);

  await storage.close();
}

test100Latency().catch(console.error);
