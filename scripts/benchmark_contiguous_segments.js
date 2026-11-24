import { storage } from '../server/storage.js';
import { generateFieldPrediction, classifyNumber } from '../src/utils/engine.js';

async function testContiguous() {
  await storage.init();
  const history = await storage.getHistory(1500);
  const chron = [...history].sort((a, b) => BigInt(a.issueNumber) > BigInt(b.issueNumber) ? 1 : -1);

  // Group into contiguous segments
  const contiguousSegments = [];
  let curSegment = [chron[0]];

  for (let i = 1; i < chron.length; i++) {
    const prevIssue = BigInt(chron[i - 1].issueNumber);
    const curIssue = BigInt(chron[i].issueNumber);
    if (curIssue - prevIssue === 1n) {
      curSegment.push(chron[i]);
    } else {
      if (curSegment.length >= 25) contiguousSegments.push(curSegment);
      curSegment = [chron[i]];
    }
  }
  if (curSegment.length >= 25) contiguousSegments.push(curSegment);

  console.log(`\n======================================================`);
  console.log(`📈 EVALUATING CONTIGUOUS LIVE SEGMENTS (${contiguousSegments.length} Segments)`);
  console.log(`======================================================\n`);

  for (const field of ['bigSmall', 'oddEven']) {
    console.log(`--- MARKET: ${field.toUpperCase()} ---`);
    let totalWins = 0, totalBets = 0;
    let sniperWins = 0, sniperBets = 0, sniperSkips = 0;

    for (let sIdx = 0; sIdx < contiguousSegments.length; sIdx++) {
      const seg = contiguousSegments[sIdx];
      let segWins = 0, segBets = 0;
      let segSniperWins = 0, segSniperBets = 0;

      for (let t = 15; t < seg.length; t++) {
        const past = seg.slice(0, t).reverse();
        const actual = classifyNumber(seg[t].number)[field];

        const pred = generateFieldPrediction(past, field, 'all');
        if (pred.prediction === actual) {
          totalWins++;
          segWins++;
        }
        totalBets++;
        segBets++;

        const predSniper = generateFieldPrediction(past, field, 'ultra_sniper');
        if (predSniper.action === 'CONFIRMED_BET') {
          sniperBets++;
          segSniperBets++;
          if (predSniper.prediction === actual) {
            sniperWins++;
            segSniperWins++;
          }
        } else {
          sniperSkips++;
        }
      }

      console.log(`  Segment ${sIdx + 1} (${seg.length} rounds): ALL = ${segWins}/${segBets} (${((segWins/segBets)*100).toFixed(1)}%) | SNIPER = ${segSniperWins}/${segSniperBets} (${segSniperBets > 0 ? ((segSniperWins/segSniperBets)*100).toFixed(1) : 0}%)`);
    }

    const wrAll = ((totalWins / totalBets) * 100).toFixed(1);
    const wrSniper = sniperBets > 0 ? ((sniperWins / sniperBets) * 100).toFixed(1) : '0.0';
    console.log(`\n  TOTAL ${field.toUpperCase()} ALL:    ${totalWins}/${totalBets} (${wrAll}%)`);
    console.log(`  TOTAL ${field.toUpperCase()} SNIPER: ${sniperWins}/${sniperBets} (${wrSniper}%) [Skips: ${sniperSkips}]\n`);
  }

  await storage.close();
}

testContiguous().catch(console.error);

