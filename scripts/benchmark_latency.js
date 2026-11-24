import { generatePrediction, evaluateHistoryPerformance } from '../src/utils/engine.js';

const dummyHistory = Array.from({ length: 500 }, (_, i) => ({
  issueNumber: String(20261124100050000n + BigInt(i)),
  number: String(i % 10)
}));

const t0 = performance.now();
for (let i = 0; i < 10; i++) {
  generatePrediction(dummyHistory, 'sniper');
}
const t1 = performance.now();
evaluateHistoryPerformance(dummyHistory, 'sniper');
const t2 = performance.now();

console.log(`⚡ 10 generatePrediction calls: ${(t1 - t0).toFixed(2)}ms (${((t1 - t0) / 10).toFixed(2)}ms per call)`);
console.log(`⚡ evaluateHistoryPerformance call: ${(t2 - t1).toFixed(2)}ms`);

