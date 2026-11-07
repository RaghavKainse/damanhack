import { storage } from '../server/storage.js';
import { validateDraw } from '../src/utils/statisticalEngine.js';

async function verifyHistoryIntegrity() {
  await storage.init();
  const history = await storage.getHistory(1000);
  console.log(`Auditing ${history.length} stored draw records...`);

  let invalidCount = 0;
  let outOfOrderCount = 0;
  let duplicateCount = 0;
  let gapCount = 0;
  const seen = new Set();

  for (let i = 0; i < history.length; i++) {
    const item = history[i];

    // 1. Validation check
    const v = validateDraw(item);
    if (!v.valid) {
      console.warn(`Record [${i}] invalid:`, item, v.reason);
      invalidCount++;
    }

    // 2. Duplicate check
    const issue = String(item.issueNumber);
    if (seen.has(issue)) {
      console.warn(`Duplicate issue detected: ${issue}`);
      duplicateCount++;
    }
    seen.add(issue);

    // 3. Monotonic ordering check (history should be newest first: issue[i] > issue[i+1])
    if (i < history.length - 1) {
      const currentIssue = BigInt(item.issueNumber);
      const nextIssue = BigInt(history[i + 1].issueNumber);
      if (currentIssue <= nextIssue) {
        console.warn(`Ordering violation: #${currentIssue} comes before #${nextIssue}`);
        outOfOrderCount++;
      } else if (currentIssue - nextIssue > 1n) {
        // Gap in sequence
        gapCount++;
      }
    }
  }

  console.log('\n--- DATA INTEGRITY AUDIT RESULTS ---');
  console.log(`Total Rounds Checked: ${history.length}`);
  console.log(`Invalid Records:      ${invalidCount}`);
  console.log(`Duplicate Records:    ${duplicateCount}`);
  console.log(`Out-of-Order Records: ${outOfOrderCount}`);
  console.log(`Gaps (Missed Rounds): ${gapCount}`);
  if (history.length > 0) {
    console.log(`Newest Issue:         #${history[0].issueNumber}`);
    console.log(`Oldest Issue:         #${history[history.length - 1].issueNumber}`);
  }

  await storage.close();
  process.exit(0);
}

verifyHistoryIntegrity().catch(console.error);

