async function testPages() {
  for (let page = 1; page <= 5; page++) {
    const url = `https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageNo=${page}&ts=${Date.now()}`;
    const res = await fetch(url);
    const json = await res.json();
    const list = json.data?.list || [];
    console.log(`Page ${page}: length=${list.length}, first=${list[0]?.issueNumber}, last=${list[list.length-1]?.issueNumber}`);
  }
}

testPages();

