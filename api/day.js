import { storage } from '../server/storage.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    await storage.init();
    const dateParam = req.query?.date;
    const daily = await storage.getDailyProgress(dateParam);
    return res.status(200).json(daily);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

