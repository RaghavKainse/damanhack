import fs from 'fs';
import { storage } from '../server/storage.js';

async function updateSeedHistory() {
  await storage.init();
  const list = await storage.getHistory(300);
  
  // Find unbroken contiguous slice from list[0]
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

  console.log(`Found ${contiguous.length} contiguous draws from today.`);
  console.log(`Latest: ${contiguous[0].issueNumber}, Oldest: ${contiguous[contiguous.length - 1].issueNumber}`);

  const formatted = contiguous.map(item => ({
    issueNumber: String(item.issueNumber),
    number: String(item.number),
    colour: item.colour || (parseInt(item.number, 10) % 2 === 0 ? 'red' : 'green')
  }));

  const fileContent = `// Verified contiguous WinGo historical draws from official feed (newest first)
// Updated live on ${new Date().toISOString()} - ${formatted.length} contiguous rounds from today
export const INITIAL_SEED_HISTORY = ${JSON.stringify(formatted, null, 2)};
`;

  fs.writeFileSync('src/data/seedHistory.js', fileContent, 'utf8');
  console.log(`Successfully updated src/data/seedHistory.js with ${formatted.length} live draws!`);
  await storage.close();
}

updateSeedHistory().catch(console.error);

