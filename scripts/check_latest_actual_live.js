async function checkLatestActual() {
  const res = await fetch('https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=' + Date.now());
  const json = await res.json();
  const list = json.data?.list || [];
  console.log(`Latest 10 Live Draws from Daman/AR-Lottery:`);
  for (const d of list) {
    const isBig = parseInt(d.number, 10) >= 5;
    console.log(`Issue #${d.issueNumber.slice(-4)} | Number: ${d.number} | Size: ${isBig ? 'BIG' : 'SMALL'} | Color: ${d.color}`);
  }
}

checkLatestActual();
