async function testEndpoints() {
  const ts = Date.now();
  const testUrls = [
    'https://draw.ar-lottery06.com/WinGo/WinGo_30S.json',
    'https://draw.ar-lottery06.com/WinGo/WinGo_1M.json',
    'https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json',
    'https://draw.ar-lottery06.com/WinGo/WinGo_1M/GetHistoryIssuePage.json'
  ];

  for (const u of testUrls) {
    try {
      const res = await fetch(`${u}?ts=${ts}`);
      const j = await res.json();
      console.log(u, '->', j.data?.list?.length || Object.keys(j));
    } catch (e) {
      console.log(u, 'ERR:', e.message);
    }
  }
}
testEndpoints();
