import fs from 'fs';

async function buildSeedData() {
  const store = JSON.parse(fs.readFileSync('data/learning_store.json', 'utf8'));
  const storeRounds = store.rounds || [];

  // Fetch current live 10 rounds
  let liveRounds = [];
  try {
    const res = await fetch('https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=' + Date.now());
    const j = await res.json();
    liveRounds = j.data?.list || [];
  } catch (e) {
    console.warn('Could not fetch live rounds:', e.message);
  }

  // Merge live rounds + store rounds, deduplicated
  const seen = new Set();
  const merged = [];

  for (const r of liveRounds) {
    if (!seen.has(r.issueNumber)) {
      seen.add(r.issueNumber);
      merged.push({
        issueNumber: r.issueNumber,
        number: String(r.number),
        colour: r.colour || (r.number == 0 ? 'red-violet' : r.number == 5 ? 'green-violet' : r.number % 2 === 0 ? 'red' : 'green')
      });
    }
  }

  for (const r of storeRounds) {
    if (!seen.has(r.issueNumber)) {
      seen.add(r.issueNumber);
      merged.push({
        issueNumber: r.issueNumber,
        number: String(r.number),
        colour: r.colour || (r.number == 0 ? 'red-violet' : r.number == 5 ? 'green-violet' : r.number % 2 === 0 ? 'red' : 'green')
      });
    }
  }

  // Take top 60 rounds
  const seedSlice = merged.slice(0, 60);
  console.log(`Prepared ${seedSlice.length} seed rounds. First: #${seedSlice[0]?.issueNumber}, Last: #${seedSlice[seedSlice.length - 1]?.issueNumber}`);

  const code = `// Pre-seeded verified WinGo historical draws to eliminate cold-start history starvation\nexport const INITIAL_SEED_HISTORY = ${JSON.stringify(seedSlice, null, 2)};\n`;
  if (!fs.existsSync('src/data')) {
    fs.mkdirSync('src/data', { recursive: true });
  }
  fs.writeFileSync('src/data/seedHistory.js', code, 'utf8');
  console.log('Successfully wrote src/data/seedHistory.js');
}

buildSeedData();
