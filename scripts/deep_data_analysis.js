import { storage } from '../server/storage.js';
import { classifyNumber } from '../src/utils/engine.js';

async function runDeepAnalysis() {
  await storage.init();
  const history = await storage.getHistory(10000);
  console.log(`\n======================================================`);
  console.log(`📊 DEEP HISTORICAL DATA ANALYSIS (Total Rounds: ${history.length})`);
  console.log(`======================================================\n`);

  if (history.length === 0) {
    console.log('No historical rounds available.');
    process.exit(0);
  }

  // Chronological order: oldest [0] -> newest [N-1]
  const chron = [...history].sort((a, b) => {
    try {
      return BigInt(a.issueNumber) > BigInt(b.issueNumber) ? 1 : -1;
    } catch {
      return a.issueNumber.localeCompare(b.issueNumber);
    }
  });

  console.log(`Earliest Issue: ${chron[0].issueNumber} | Latest Issue: ${chron[chron.length - 1].issueNumber}`);

  // 1. Digit frequency 0-9
  const digitCounts = Array(10).fill(0);
  let bigCount = 0;
  let smallCount = 0;
  let oddCount = 0;
  let evenCount = 0;

  for (const item of chron) {
    const num = parseInt(item.number, 10);
    digitCounts[num]++;
    if (num >= 5) bigCount++; else smallCount++;
    if (num % 2 !== 0) oddCount++; else evenCount++;
  }

  const N = chron.length;
  console.log(`\n--- 1. DIGIT FREQUENCIES (0-9) ---`);
  console.log(`Digit | Count | Observed % | Expected % | Chi-Square Contribution`);
  let chiSquareTotal = 0;
  const expectedPerDigit = N / 10;
  for (let d = 0; d < 10; d++) {
    const obs = digitCounts[d];
    const pct = ((obs / N) * 100).toFixed(2);
    const chi = Math.pow(obs - expectedPerDigit, 2) / expectedPerDigit;
    chiSquareTotal += chi;
    console.log(`  ${d}   | ${String(obs).padStart(5)} |   ${pct.padStart(6)}%  |   10.00%   | ${chi.toFixed(3)}`);
  }
  console.log(`Total Chi-Square: ${chiSquareTotal.toFixed(3)} (degrees of freedom: 9, critical at 0.05 is 16.92)`);
  console.log(`Distribution is ${chiSquareTotal > 16.92 ? '⚠️ NON-UNIFORM (ANOMALOUS)' : '✅ STATISTICALLY CONSISTENT WITH UNIFORM'}`);

  console.log(`\n--- 2. BIG / SMALL & ODD / EVEN DISTRIBUTION ---`);
  console.log(`BIG:   ${bigCount} (${((bigCount / N) * 100).toFixed(2)}%) | Expected: 50.00%`);
  console.log(`SMALL: ${smallCount} (${((smallCount / N) * 100).toFixed(2)}%) | Expected: 50.00%`);
  console.log(`ODD:   ${oddCount} (${((oddCount / N) * 100).toFixed(2)}%) | Expected: 50.00%`);
  console.log(`EVEN:  ${evenCount} (${((evenCount / N) * 100).toFixed(2)}%) | Expected: 50.00%`);

  // Binomial test for Big/Small
  const diffBS = Math.abs(bigCount - N * 0.5) - 0.5;
  const zBS = diffBS / Math.sqrt(N * 0.25);
  console.log(`Big/Small z-score: ${zBS.toFixed(3)} (${zBS > 1.96 ? '⚠️ Statistically Imbalanced' : '✅ Balanced'})`);

  // 2. Big/Small Transitions: P(next | prev)
  let bb = 0, bs = 0, sb = 0, ss = 0;
  for (let i = 0; i < N - 1; i++) {
    const prevBS = parseInt(chron[i].number, 10) >= 5 ? 'BIG' : 'SMALL';
    const nextBS = parseInt(chron[i + 1].number, 10) >= 5 ? 'BIG' : 'SMALL';
    if (prevBS === 'BIG' && nextBS === 'BIG') bb++;
    else if (prevBS === 'BIG' && nextBS === 'SMALL') bs++;
    else if (prevBS === 'SMALL' && nextBS === 'BIG') sb++;
    else if (prevBS === 'SMALL' && nextBS === 'SMALL') ss++;
  }
  const totalFromB = bb + bs;
  const totalFromS = sb + ss;
  console.log(`\n--- 3. 1ST ORDER TRANSITIONS (BIG/SMALL) ---`);
  console.log(`P(BIG -> BIG):   ${bb}/${totalFromB} = ${((bb / totalFromB) * 100).toFixed(2)}%`);
  console.log(`P(BIG -> SMALL): ${bs}/${totalFromB} = ${((bs / totalFromB) * 100).toFixed(2)}%`);
  console.log(`P(SMALL -> BIG):   ${sb}/${totalFromS} = ${((sb / totalFromS) * 100).toFixed(2)}%`);
  console.log(`P(SMALL -> SMALL): ${ss}/${totalFromS} = ${((ss / totalFromS) * 100).toFixed(2)}%`);

  // 3. 2nd Order Transitions P(next | prev2, prev1)
  console.log(`\n--- 4. 2ND ORDER TRANSITIONS ---`);
  const pairCounts = { 'BB': { B: 0, S: 0 }, 'BS': { B: 0, S: 0 }, 'SB': { B: 0, S: 0 }, 'SS': { B: 0, S: 0 } };
  for (let i = 0; i < N - 2; i++) {
    const p2 = parseInt(chron[i].number, 10) >= 5 ? 'B' : 'S';
    const p1 = parseInt(chron[i + 1].number, 10) >= 5 ? 'B' : 'S';
    const next = parseInt(chron[i + 2].number, 10) >= 5 ? 'B' : 'S';
    pairCounts[`${p2}${p1}`][next]++;
  }
  for (const pair of ['BB', 'BS', 'SB', 'SS']) {
    const tot = pairCounts[pair].B + pairCounts[pair].S;
    console.log(`P(next | ${pair}): B=${pairCounts[pair].B}/${tot} (${((pairCounts[pair].B/tot)*100).toFixed(1)}%), S=${pairCounts[pair].S}/${tot} (${((pairCounts[pair].S/tot)*100).toFixed(1)}%)`);
  }

  // 4. Streak / Run Length Distribution
  console.log(`\n--- 5. STREAK LENGTH DISTRIBUTION (DRAGONS) ---`);
  const streakLengths = {};
  let currentStreak = 1;
  let currentType = parseInt(chron[0].number, 10) >= 5 ? 'BIG' : 'SMALL';
  for (let i = 1; i < N; i++) {
    const t = parseInt(chron[i].number, 10) >= 5 ? 'BIG' : 'SMALL';
    if (t === currentType) {
      currentStreak++;
    } else {
      streakLengths[currentStreak] = (streakLengths[currentStreak] || 0) + 1;
      currentStreak = 1;
      currentType = t;
    }
  }
  streakLengths[currentStreak] = (streakLengths[currentStreak] || 0) + 1;

  const totalStreaks = Object.values(streakLengths).reduce((a, b) => a + b, 0);
  console.log(`Length | Count | Observed % | Geometric Expected (0.5^k)`);
  for (let k = 1; k <= 10; k++) {
    const cnt = streakLengths[k] || 0;
    const obsPct = ((cnt / totalStreaks) * 100).toFixed(2);
    const expPct = (Math.pow(0.5, k) * 100).toFixed(2);
    console.log(`  ${String(k).padStart(2)}   | ${String(cnt).padStart(5)} |   ${obsPct.padStart(6)}%  |   ${expPct.padStart(6)}%`);
  }

  // 5. Digit Transitions: 10x10 Matrix
  console.log(`\n--- 6. DIGIT TRANSITION 10x10 SPARSITY & BIAS ---`);
  const trans10 = Array.from({ length: 10 }, () => Array(10).fill(0));
  for (let i = 0; i < N - 1; i++) {
    const d1 = parseInt(chron[i].number, 10);
    const d2 = parseInt(chron[i + 1].number, 10);
    trans10[d1][d2]++;
  }

  // Check max and min transition row deviations
  for (let d = 0; d < 10; d++) {
    const row = trans10[d];
    const rowTot = row.reduce((a, b) => a + b, 0);
    const maxVal = Math.max(...row);
    const maxIdx = row.indexOf(maxVal);
    const minVal = Math.min(...row);
    const minIdx = row.indexOf(minVal);
    const bigProb = row.slice(5).reduce((a, b) => a + b, 0) / (rowTot || 1);
    console.log(`From ${d} (N=${rowTot}): Top next -> ${maxIdx} (${maxVal}/${rowTot} = ${((maxVal/rowTot)*100).toFixed(1)}%), P(BIG) = ${((bigProb)*100).toFixed(1)}%`);
  }

  process.exit(0);
}

runDeepAnalysis();

