import { storage } from '../server/storage.js';
import { classifyNumber } from '../src/utils/engine.js';

async function testDigitPredictions() {
  await storage.init();
  const history = await storage.getHistory(1000);
  const chron = [...history].sort((a, b) => BigInt(a.issueNumber) > BigInt(b.issueNumber) ? 1 : -1);

  console.log(`\n======================================================`);
  console.log(`🎯 0-9 DIGIT PREDICTION BENCHMARK (N = ${chron.length})`);
  console.log(`======================================================\n`);

  const warmup = 30;
  let top1HitsFreq = 0;
  let top3HitsFreq = 0;

  let top1HitsMarkov = 0;
  let top3HitsMarkov = 0;

  let top1HitsOmission = 0;
  let top3HitsOmission = 0;

  let top1HitsEnsemble = 0;
  let top3HitsEnsemble = 0;

  let totalSteps = 0;

  for (let t = warmup; t < chron.length; t++) {
    const past = chron.slice(0, t).reverse();
    const actualDigit = parseInt(chron[t].number, 10);
    totalSteps++;

    // 1. Digit Historical Dirichlet-Laplace frequency
    const digitCounts = Array(10).fill(0);
    for (const p of past) digitCounts[parseInt(p.number, 10)]++;
    const pFreq = digitCounts.map(c => (c + 1) / (past.length + 10));

    // 2. 10x10 Markov Transitions from last digit
    const lastDigit = parseInt(past[0].number, 10);
    const transRow = Array(10).fill(0);
    for (let i = 0; i < past.length - 1; i++) {
      const fromD = parseInt(past[i + 1].number, 10);
      const toD = parseInt(past[i].number, 10);
      if (fromD === lastDigit) transRow[toD]++;
    }
    const rowSum = transRow.reduce((a, b) => a + b, 0);
    const pMarkov = transRow.map(c => (c + 1) / (rowSum + 10));

    // 3. Omission Model
    const omissions = Array(10).fill(0);
    for (let d = 0; d < 10; d++) {
      let om = past.findIndex(p => parseInt(p.number, 10) === d);
      omissions[d] = om === -1 ? past.length : om;
    }
    // High omission = reversion score
    const pOmission = omissions.map(om => (om + 5) / (omissions.reduce((a, b) => a + b, 0) + 50));

    // 4. Calibrated Ensemble
    const pEnsemble = Array(10).fill(0);
    for (let d = 0; d < 10; d++) {
      pEnsemble[d] = 0.40 * pFreq[d] + 0.40 * pMarkov[d] + 0.20 * pOmission[d];
    }
    const sumEns = pEnsemble.reduce((a, b) => a + b, 0);
    for (let d = 0; d < 10; d++) pEnsemble[d] /= sumEns;

    // Evaluate Top 1 and Top 3
    const rankIndices = (arr) => arr.map((p, idx) => ({ idx, p })).sort((a, b) => b.p - a.p).map(x => x.idx);

    const rFreq = rankIndices(pFreq);
    if (rFreq[0] === actualDigit) top1HitsFreq++;
    if (rFreq.slice(0, 3).includes(actualDigit)) top3HitsFreq++;

    const rMarkov = rankIndices(pMarkov);
    if (rMarkov[0] === actualDigit) top1HitsMarkov++;
    if (rMarkov.slice(0, 3).includes(actualDigit)) top3HitsMarkov++;

    const rOmission = rankIndices(pOmission);
    if (rOmission[0] === actualDigit) top1HitsOmission++;
    if (rOmission.slice(0, 3).includes(actualDigit)) top3HitsOmission++;

    const rEnsemble = rankIndices(pEnsemble);
    if (rEnsemble[0] === actualDigit) top1HitsEnsemble++;
    if (rEnsemble.slice(0, 3).includes(actualDigit)) top3HitsEnsemble++;
  }

  console.log(`Evaluated Sample: ${totalSteps} Rounds`);
  console.log(`Model               | Top-1 Acc (Exp 10%) | Top-3 Basket Acc (Exp 30%)`);
  console.log(`--------------------|---------------------|---------------------------`);
  console.log(`Frequency (Dirichlet)| ${String(top1HitsFreq).padStart(3)}/${totalSteps} (${((top1HitsFreq/totalSteps)*100).toFixed(1)}%)     | ${String(top3HitsFreq).padStart(3)}/${totalSteps} (${((top3HitsFreq/totalSteps)*100).toFixed(1)}%)`);
  console.log(`Markov 10x10 Matrix | ${String(top1HitsMarkov).padStart(3)}/${totalSteps} (${((top1HitsMarkov/totalSteps)*100).toFixed(1)}%)     | ${String(top3HitsMarkov).padStart(3)}/${totalSteps} (${((top3HitsMarkov/totalSteps)*100).toFixed(1)}%)`);
  console.log(`Omission Reversion  | ${String(top1HitsOmission).padStart(3)}/${totalSteps} (${((top1HitsOmission/totalSteps)*100).toFixed(1)}%)     | ${String(top3HitsOmission).padStart(3)}/${totalSteps} (${((top3HitsOmission/totalSteps)*100).toFixed(1)}%)`);
  console.log(`Calibrated Ensemble | ${String(top1HitsEnsemble).padStart(3)}/${totalSteps} (${((top1HitsEnsemble/totalSteps)*100).toFixed(1)}%)     | ${String(top3HitsEnsemble).padStart(3)}/${totalSteps} (${((top3HitsEnsemble/totalSteps)*100).toFixed(1)}%)`);
  console.log(`------------------------------------------------------------------`);
  console.log(`Random Baseline     | 10.0%               | 30.0%`);

  process.exit(0);
}

testDigitPredictions();

