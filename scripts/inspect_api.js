async function inspect() {
  const res = await fetch('https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json');
  const j = await res.json();
  console.log('Top keys:', Object.keys(j));
  console.log('data keys:', Object.keys(j.data || {}));
  console.log('data details:', {
    totalPage: j.data?.totalPage,
    totalCount: j.data?.totalCount,
    listLen: j.data?.list?.length,
    firstIssue: j.data?.list?.[0]?.issueNumber,
    lastIssue: j.data?.list?.[j.data?.list?.length - 1]?.issueNumber
  });

  // Try POST
  try {
    const postRes = await fetch('https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageNo: 2, pageSize: 20 })
    });
    console.log('POST status:', postRes.status);
    if (postRes.ok) {
      const postJ = await postRes.json();
      console.log('POST listLen:', postJ.data?.list?.length, 'first:', postJ.data?.list?.[0]?.issueNumber);
    }
  } catch (err) {
    console.log('POST error:', err.message);
  }
}
inspect();
