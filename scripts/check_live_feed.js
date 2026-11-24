async function checkFeed() {
  try {
    const res = await fetch(`https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=${Date.now()}`);
    if (!res.ok) {
      console.log('HTTP status:', res.status);
      return;
    }
    const json = await res.json();
    console.log('Success! Draws count:', json.data?.list?.length);
    console.log('Top 5 live draws:', json.data?.list?.slice(0, 5));
  } catch (e) {
    console.error('Error fetching live feed:', e.message);
  }
}

checkFeed();

