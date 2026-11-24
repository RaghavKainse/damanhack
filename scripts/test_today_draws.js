import { storage } from '../server/storage.js';
import { generatePrediction, classifyNumber } from '../src/utils/engine.js';

async function testContiguousWinRate() {
  await storage.init();
  const list = await storage.getHistory(300);
  
  const contiguous = [list[0]];
  for (let i = 1; i < list.length; i++) {
    const prev = BigInt(list[i - 1].issueNumber);
    const curr = BigInt(list[i].issueNumber);
    if (prev - curr === 1n) {
      contiguous.push(list[i]);
    } else {
      break;
    }
  }

  for (const mode of ['all', 'sniper', 'ultra_sniper']) {
    let totalBets = 0;
    let wins = 0;
    let losses = 0;
    let skipped = 0;
    
    let seqWins = 0;
    let seqLosses = 0;
    let currentStep = 0;
    let netPnL = 0;
    const stakes = [10, 30, 80];
    
    let basket8Hits = 0;
    let basket8Total = 0;

    for (let i = contiguous.length - 20; i >= 0; i--) {
      const past = contiguous.slice(i + 1);
      const actualDraw = contiguous[i];
      const actual = classifyNumber(actualDraw.number);
      
      const pred = generatePrediction(past, mode, 'bigSmall');
      
      if (pred.strategy80 && pred.strategy80.digitBasket8) {
        basket8Total++;
        if (pred.strategy80.digitBasket8.digits.includes(actual.number)) {
          basket8Hits++;
        }
      }
      
      const isSkip = pred.action === 'NO_CLEAR_SIGNAL' || pred.action === 'WAIT_SKIP' || pred.prediction === 'NO CLEAR SIGNAL';
      if (isSkip) {
        skipped++;
        continue;
      }
      
      totalBets++;
      const isWin = pred.prediction === actual.bigSmall;
      if (isWin) {
        wins++;
        seqWins++;
        netPnL += (stakes[currentStep] * 1.96) - stakes.slice(0, currentStep + 1).reduce((a, b) => a + b, 0);
        currentStep = 0;
      } else {
        losses++;
        if (currentStep === 2) {
          seqLosses++;
          netPnL -= (10 + 30 + 80);
          currentStep = 0;
        } else {
          currentStep++;
        }
      }
    }

    console.log(`\n--- MODE: ${mode.toUpperCase()} ---`);
    console.log(`Bets: ${totalBets} | Skipped: ${skipped} | Win Rate: ${(wins / Math.max(1, totalBets) * 100).toFixed(1)}%`);
    console.log(`3-Step Sequences: Won ${seqWins} | Failed ${seqLosses} | Win Rate: ${(seqWins / Math.max(1, seqWins + seqLosses) * 100).toFixed(1)}%`);
    console.log(`3-Step Simulated Net PnL: ₹${netPnL.toFixed(1)}`);
  }
  
  await storage.close();
}

testContiguousWinRate().catch(console.error);
