async function testParams() {
  const base = 'https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json';
  const paramCandidates = [
    'pageNo=2',
    'pageNo=2&pageSize=10',
    'page=2',
    'pageIndex=2',
    'p=2',
    'page_no=2',
    'pn=2',
    'pageNumber=2',
    'PageNo=2',
    'PageIndex=2'
  ];

  for (const q of paramCandidates) {
    try {
      const res = await fetch(`${base}?${q}`);
      const j = await res.json();
      const first = j.data?.list?.[0]?.issueNumber;
      console.log(`Param "${q}": pageNo in resp = ${j.data?.pageNo}, first = ${first}`);
    } catch (e) {
      console.log(`Param "${q}": ERROR ${e.message}`);
    }
  }
}
testParams();

