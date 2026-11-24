import fs from 'fs';

const content = fs.readFileSync('src/utils/engine.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('function generate') || l.includes('function evaluateHistoryPerformance')) {
    console.log(`${i + 1}: ${l.trim()}`);
  }
});

