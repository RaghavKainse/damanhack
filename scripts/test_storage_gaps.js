import { storage } from '../server/storage.js';

async function testStorage() {
  await storage.init();
  const list = await storage.getHistory(500);
  console.log('Total in storage query:', list.length);
  if (list.length > 0) {
    console.log('First 5:', list.slice(0, 5).map(x => ({ issue: x.issueNumber, num: x.number })));
    console.log('Last 5:', list.slice(-5).map(x => ({ issue: x.issueNumber, num: x.number })));
    
    // Check for gaps
    let gaps = 0;
    for (let i = 0; i < list.length - 1; i++) {
      const diff = BigInt(list[i].issueNumber) - BigInt(list[i + 1].issueNumber);
      if (diff !== 1n) {
        gaps++;
        if (gaps <= 10) {
          console.log(`GAP at index ${i}: issue ${list[i].issueNumber} -> ${list[i+1].issueNumber} (diff = ${diff})`);
        }
      }
    }
    console.log('Total gaps found in query:', gaps);
  }
  await storage.close();
}

testStorage().catch(console.error);
