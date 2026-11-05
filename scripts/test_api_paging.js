async function testApiPaging() {
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageNo=${page}&ts=${Date.now()}`);
    const json = await res.json();
    const list = json.data?.list || [];
    console.log(`Page ${page}: Fetched ${list.length} rounds. First: #${list[0]?.issueNumber}, Last: #${list[list.length - 1]?.issueNumber}`);
  }
}

testApiPaging();

