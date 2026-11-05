import { fetchLiveHistory } from '../src/utils/api.js';
import { classifyNumber } from '../src/utils/engine.js';

async function checkRound1334() {
  const res = await fetchLiveHistory('WinGo_30S');
  const list = res.list;
  console.log('Recent 10 rounds:');
  for (const h of list) {
    const c = classifyNumber(h.number);
    console.log(`Issue #${h.issueNumber.slice(-4)}: number=${h.number} (${c.bigSmall}, ${c.oddEven}, ${c.color})`);
  }
}

checkRound1334();

