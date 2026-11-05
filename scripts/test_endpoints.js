async function testEndpoints() {
  const candidates = [
    'https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage_2.json',
    'https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage/2.json',
    'https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageSize=50',
    'https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?size=50',
    'https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryList.json',
    'https://draw.ar-lottery06.com/WinGo/WinGo_30S/History.json',
    'https://draw.ar-lottery06.com/WinGo/WinGo_30S/history.json',
    'https://draw.ar-lottery06.com/WinGo/WinGo_30S/list.json',
    'https://draw.ar-lottery06.com/WinGo/WinGo_30S.json'
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      console.log(`URL: ${url} -> status ${res.status}`);
      if (res.ok) {
        const j = await res.json();
        console.log(`  Keys:`, Object.keys(j), `list len:`, j.data?.list?.length || j.list?.length || 'no list');
      }
    } catch (e) {
      console.log(`URL: ${url} -> ERROR ${e.message}`);
    }
  }
}
testEndpoints();

