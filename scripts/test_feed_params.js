async function testParams() {
  const params = [
    'pageNo=1&pageSize=50',
    'pageNo=1&pageSize=100',
    'page=1&size=50',
    'limit=50',
    'count=50'
  ];

  for (const p of params) {
    try {
      const url = `https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?${p}&ts=${Date.now()}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        console.log(`Param: ${p} -> returned count:`, json.data?.list?.length, 'totalCount:', json.data?.totalCount);
      }
    } catch (e) {
      console.log(`Param: ${p} -> error:`, e.message);
    }
  }
}

testParams();
