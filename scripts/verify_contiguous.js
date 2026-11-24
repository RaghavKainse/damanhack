import { storage } from '../server/storage.js';

async function verifyContiguousSlice() {
  await storage.init();
  const list = await storage.getHistory(300);
  console.log('Query count:', list.length);
  
  // Find unbroken contiguous slice from list[0]
  const contiguous = [list[0]];
  for (let i = 1; i < list.length; i++) {
    const prev = BigInt(list[i - 1].issueNumber);
    const curr = BigInt(list[i].issueNumber);
    if (prev - curr === 1n) {
      contiguous.push(list[i]);
    } else {
      console.log(`Gap stopped contiguous chain at index ${i}: prev=${prev}, curr=${curr}, diff=${prev - curr}`);
      break;
    }
  }
  console.log(`Contiguous unbroken length from latest draw: ${contiguous.length}`);
  console.log(`Latest draw: issue ${contiguous[0].issueNumber}, num ${contiguous[0].number}`);
  console.log(`Oldest unbroken: issue ${contiguous[contiguous.length - 1].issueNumber}, num ${contiguous[contiguous.length - 1].number}`);
  
  await storage.close();
}

verifyContiguousSlice().catch(console.error);
