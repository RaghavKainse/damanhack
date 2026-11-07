import { storage } from '../server/storage.js';
import { generateFieldPrediction, classifyNumber } from '../src/utils/engine.js';
import { calculateCalibration } from '../src/utils/statisticalEngine.js';

async function checkCalibration() {
  await storage.init();
  const history = await storage.getHistory(1000);
  const chron = [...history].sort((a, b) => BigInt(a.issueNumber) > BigInt(b.issueNumber) ? 1 : -1);

  const confidences = [];
  const wins = [];

  for (let t = 20; t < chron.length; t++) {
    const past = chron.slice(0, t).reverse();
    const actual = classifyNumber(chron[t].number).bigSmall;

    const pred = generateFieldPrediction(past, 'bigSmall', 'all');
    const isWin = pred.prediction === actual ? 1 : 0;
    const conf = pred.confidence / 100;

    confidences.push(conf);
    wins.push(isWin);
  }

  const cal = calculateCalibration(confidences, wins, 5);
  console.log('ECE (Expected Calibration Error):', (cal.ece * 100).toFixed(2) + '%');
  console.log('Calibration Bins:');
  console.table(cal.bins);

  await storage.close();
  process.exit(0);
}

checkCalibration().catch(console.error);

