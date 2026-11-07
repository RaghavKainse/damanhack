import { storage } from '../server/storage.js';
import { classifyNumber } from '../src/utils/engine.js';

async function check() {
  await storage.init();
  const history = await storage.getHistory(1000);
  let big = 0, small = 0, odd = 0, even = 0;
  for (const h of history) {
    const c = classifyNumber(h.number);
    if (c.bigSmall === 'BIG') big++; else small++;
    if (c.oddEven === 'ODD') odd++; else even++;
  }
  console.log(`Total: ${history.length} | BIG: ${big} (${(big/history.length*100).toFixed(1)}%) | SMALL: ${small} (${(small/history.length*100).toFixed(1)}%)`);
  console.log(`ODD: ${odd} (${(odd/history.length*100).toFixed(1)}%) | EVEN: ${even} (${(even/history.length*100).toFixed(1)}%)`);

  // Check digits distribution
  const digits = Array(10).fill(0);
  for (const h of history) {
    digits[parseInt(h.number, 10)]++;
  }
  console.log('Digits distribution 0-9:');
  digits.forEach((cnt, d) => {
    console.log(`  Digit ${d}: ${cnt} (${(cnt/history.length*100).toFixed(1)}%)`);
  });

  await storage.close();
  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });

