import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storePath = path.join(__dirname, '../data/learning_store.json');
if (!fs.existsSync(storePath)) {
  console.log('No learning_store.json found');
  process.exit(0);
}

const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const audits = data.predictionAudits || [];

console.log(`Analyzing ${audits.length} stored prediction audit settlements...`);

let wins = 0;
let losses = 0;
let skips = 0;
let noClearSignalCount = 0;
let confirmedBets = 0;

for (const a of audits) {
  if (a.action === 'NO_CLEAR_SIGNAL' || a.action === 'WAIT_SKIP' || a.predicted === 'NO CLEAR SIGNAL') {
    skips++;
    noClearSignalCount++;
  } else {
    confirmedBets++;
    if (a.isWin) wins++;
    else losses++;
  }
}

console.log('\n--- AUDIT SETTLEMENT ANALYSIS ---');
console.log(`Total Audits Logged:      ${audits.length}`);
console.log(`NO_CLEAR_SIGNAL (Skips):  ${skips} (${((skips / audits.length) * 100).toFixed(1)}%)`);
console.log(`Confirmed Bets:           ${confirmedBets}`);
console.log(`Confirmed Wins:           ${wins}`);
console.log(`Confirmed Losses:         ${losses}`);
if (confirmedBets > 0) {
  console.log(`Confirmed Win Rate:       ${((wins / confirmedBets) * 100).toFixed(1)}%`);
}

// Sample the most recent 10 audits
console.log('\nRecent 10 Prediction Audits:');
audits.slice(0, 10).forEach(a => {
  console.log(`Issue #${a.targetIssue} | Action: ${a.action} | Pred: ${a.predicted} | Actual: ${a.actual} (${a.actualNumber}) | Win: ${a.isWin} | Conf: ${a.calibratedConfidence}% | Brier: ${a.brierError}`);
});

