async function checkLive() {
  const res = await fetch('https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=' + Date.now());
  const j = await res.json();
  const list = j.data?.list || [];
  console.log(`Fetched ${list.length} latest rounds:`);
  list.forEach(r => {
    const num = parseInt(r.number, 10);
    const bs = num >= 5 ? 'BIG' : 'SMALL';
    const oe = num % 2 !== 0 ? 'ODD' : 'EVEN';
    console.log(`Issue #${r.issueNumber}: Number ${num} (${bs}, ${oe}, ${r.colour})`);
  });
}
checkLive();

