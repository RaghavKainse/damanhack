import { storage } from '../server/storage.js';
import { classifyNumber, getContiguousHistory } from '../src/utils/engine.js';

async function analyzeRegimesToday() {
  await storage.init();
  const rawList = await storage.getHistory(300);
  const list = getContiguousHistory(rawList);
  console.log(`Total unbroken draws: ${list.length}`);

  const items = list.map(h => classifyNumber(h.number));
  // chronological: oldest [0] to newest [N-1]
  const chron = [...items].reverse();

  let alternations = 0;
  let continuations = 0;
  let streaks = [];
  let curStreak = 1;

  for (let i = 1; i < chron.length; i++) {
    if (chron[i].bigSmall === chron[i - 1].bigSmall) {
      continuations++;
      curStreak++;
    } else {
      alternations++;
      streaks.push(curStreak);
      curStreak = 1;
    }
  }
  streaks.push(curStreak);

  console.log(`\n=== REGIME STATISTICS TODAY ===`);
  console.log(`Continuations (Streak): ${continuations} (${(continuations / (continuations + alternations) * 100).toFixed(1)}%)`);
  console.log(`Alternations (Chop/Ping-Pong): ${alternations} (${(alternations / (continuations + alternations) * 100).toFixed(1)}%)`);
  
  const streakCounts = {};
  streaks.forEach(s => { streakCounts[s] = (streakCounts[s] || 0) + 1; });
  console.log(`Streak distribution:`, streakCounts);

  // Check simple strategies:
  // Strategy 1: Always predict streak continuation (Trend Following)
  let trendWins = continuations;
  // Strategy 2: Always predict alternation (Fade the trend)
  let fadeWins = alternations;
  // Strategy 3: Alternation following (If previous was an alternation, predict alternation; if streak >= 2, predict continuation up to 3)
  let adaptiveWins = 0;
  let adaptiveTotal = 0;
  for (let i = 2; i < chron.length; i++) {
    adaptiveTotal++;
    const prev1 = chron[i - 1].bigSmall;
    const prev2 = chron[i - 2].bigSmall;
    let guess = prev1;
    if (prev1 !== prev2) {
      // Was an alternation -> predict alternation!
      guess = prev1 === 'BIG' ? 'SMALL' : 'BIG';
    } else {
      // Was a continuation -> if streak <= 3, predict continuation; if >= 4, predict break!
      let len = 0;
      for (let j = i - 1; j >= 0; j--) {
        if (chron[j].bigSmall === prev1) len++;
        else break;
      }
      if (len >= 3) {
        guess = prev1 === 'BIG' ? 'SMALL' : 'BIG'; // Break streak
      } else {
        guess = prev1; // Continue streak
      }
    }
    if (guess === chron[i].bigSmall) adaptiveWins++;
  }

  console.log(`\nAdaptive Regime Strategy: ${adaptiveWins} / ${adaptiveTotal} (${(adaptiveWins / adaptiveTotal * 100).toFixed(1)}%)`);

  await storage.close();
}

analyzeRegimesToday().catch(console.error);
