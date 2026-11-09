import { storage } from '../server/storage.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    await storage.init();

    // Auto-ingest latest draws on access
    try {
      const liveRes = await fetch(`https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=${Date.now()}`);
      if (liveRes.ok) {
        const liveJson = await liveRes.json();
        const list = liveJson.data?.list || [];
        for (const item of list) {
          await storage.saveRound(item);
        }
      }
    } catch {}

    const limit = Math.min(10000, Math.max(10, parseInt(req.query?.limit || '5000', 10)));
    const offset = Math.max(0, parseInt(req.query?.offset || '0', 10));
    const history = await storage.getHistory(limit, offset);

    return res.status(200).json({
      success: true,
      count: history.length,
      limit,
      offset,
      list: history
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

