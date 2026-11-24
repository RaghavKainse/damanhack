import { storage } from '../server/storage.js';

async function checkLatest() {
  await storage.init();
  const history = await storage.getHistory(10);
  console.log('Latest 10 in DB:');
  history.forEach(h => console.log(`  Issue: ${h.issueNumber} | Num: ${h.number}`));
  await storage.close();
}

checkLatest().catch(console.error);

