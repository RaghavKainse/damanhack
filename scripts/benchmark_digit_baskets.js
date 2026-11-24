import { storage } from '../server/storage.js';
import { generatePrediction } from '../src/utils/engine.js';

async function testDigitBaskets() {
  await storage.init();
  const history = await storage.getHistory(1000);
  const chron = [...history].sort((a, b) => BigInt(a.issueNumber) > BigInt(b.issueNumber) ? 1 : -1);

  console.log(`Evaluating Digit Baskets across ${chron.length} draws...`);

  for (const winSize of [100, 200, 500, chron.length - 25]) {
    const startT = chron.length - winSize;
    let top1Wins = 0;
    let top3Wins = 0;
    let top5Wins = 0;
    let top7Wins = 0;
    let top8Wins = 0;
    let total = 0;

    for (let t = startT; t < chron.length; t++) {
      const past = chron.slice(0, t).reverse();
      const actualNum = parseInt(chron[t].number, 10);

      const pred = generatePrediction(past, 'all');
      const probs = pred.numberProbabilities || [];
      const sortedDigits = [...probs].sort((a, b) => b.probability - a.probability).map(p => p.number);

      total++;
      if (sortedDigits.slice(0, 1).includes(actualNum)) top1Wins++;
      if (sortedDigits.slice(0, 3).includes(actualNum)) top3Wins++;
      if (sortedDigits.slice(0, 5).includes(actualNum)) top5Wins++;
      if (sortedDigits.slice(0, 7).includes(actualNum)) top7Wins++;
      if (sortedDigits.slice(0, 8).includes(actualNum)) top8Wins++;
    }

    console.log(`\n======================================================`);
    console.log(`WINDOW: LAST ${winSize} ROUNDS`);
    console.log(`======================================================`);
    console.log(`Top-1 Exact Digit (9x payout): ${top1Wins} / ${total} (${((top1Wins / total) * 100).toFixed(1)}%) | Break-even: 11.1%`);
    console.log(`Top-3 Golden Basket (9x payout): ${top3Wins} / ${total} (${((top3Wins / total) * 100).toFixed(1)}%) | Break-even: 33.3%`);
    console.log(`Top-5 Half Basket: ${top5Wins} / ${total} (${((top5Wins / total) * 100).toFixed(1)}%) | Break-even: 50.0%`);
    console.log(`Top-7 High-Probability Basket: ${top7Wins} / ${total} (${((top7Wins / total) * 100).toFixed(1)}%) | Break-even: 70.0%`);
    console.log(`Top-8 Super-Safe Basket: ${top8Wins} / ${total} (${((top8Wins / total) * 100).toFixed(1)}%) | Break-even: 80.0%`);
  }

  await storage.close();
}

testDigitBaskets().catch(console.error);

