import { validateDraw } from './statisticalEngine.js';

/**
 * Real-time Data Connector for WinGo Draw Server (Daman / AR-Lottery)
 * Connects directly to the official draw backend:
 * 1. /WinGo/{gameCode}.json -> Official live countdown, issue numbers, and end time.
 * 2. /WinGo/{gameCode}/GetHistoryIssuePage.json -> Live winning numbers, colors, and server time.
 */

export const GAME_MODES = {
  'WinGo_30S': { id: 'WinGo_30S', name: 'Win Go 30s', duration: 30, codePrefix: '10005', title: 'WinGo 30 Second (Fast)' },
  'WinGo_1M': { id: 'WinGo_1M', name: 'Win Go 1Min', duration: 60, codePrefix: '10001', title: 'WinGo 1 Minute' },
  'WinGo_3M': { id: 'WinGo_3M', name: 'Win Go 3Min', duration: 180, codePrefix: '10002', title: 'WinGo 3 Minute' },
  'WinGo_5M': { id: 'WinGo_5M', name: 'Win Go 5Min', duration: 300, codePrefix: '10003', title: 'WinGo 5 Minute' },
};

/**
 * Fetch official server game state (exact current issue, next issue, and exact endTime timestamp)
 */
export async function fetchGameState(gameCode = 'WinGo_30S') {
  const ts = Date.now();
  const endpoints = [
    `/draw-api/WinGo/${gameCode}.json?ts=${ts}`,
    `https://draw.ar-lottery06.com/WinGo/${gameCode}.json?ts=${ts}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://draw.ar-lottery06.com/WinGo/${gameCode}.json?ts=${ts}`)}`
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json, text/plain, */*' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.current && json.current.issueNumber) {
          return {
            success: true,
            source: endpoint.startsWith('/draw-api') ? 'Vite Live Proxy' : 'Direct Server',
            current: json.current,
            previous: json.previous,
            next: json.next,
            intervalMinute: json.intervalMinute,
            state: json.state
          };
        }
      }
    } catch {
      // try next
    }
  }

  return { success: false };
}

/**
 * Fetch official draw history list
 */
export async function fetchLiveHistory(gameCode = 'WinGo_30S') {
  const ts = Date.now();
  const endpoints = [
    `/draw-api/WinGo/${gameCode}/GetHistoryIssuePage.json?ts=${ts}`,
    `https://draw.ar-lottery06.com/WinGo/${gameCode}/GetHistoryIssuePage.json?ts=${ts}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://draw.ar-lottery06.com/WinGo/${gameCode}/GetHistoryIssuePage.json?ts=${ts}`)}`
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json, text/plain, */*' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data.list) && json.data.list.length > 0) {
          const validatedList = json.data.list
            .filter(item => validateDraw(item).valid)
            .map(item => {
              const v = validateDraw(item);
              return {
                issueNumber: v.issueNumber,
                number: String(v.number),
                colour: v.colour,
                timestamp: v.timestamp
              };
            });

          if (validatedList.length > 0) {
            return {
              success: true,
              source: endpoint.startsWith('/draw-api') ? 'Daman Live CDN' : 'Direct Server',
              list: validatedList,
              totalPage: json.data.totalPage,
              totalCount: json.data.totalCount,
              serviceTime: json.serviceTime || Date.now()
            };
          }
        }
      }
    } catch {
      // Try next endpoint
    }
  }

  // Never pass simulated data as real live draw data
  return {
    success: false,
    source: 'Offline / Network Disconnected',
    list: [],
    totalPage: 0,
    totalCount: 0,
    serviceTime: Date.now()
  };
}

/**
 * High-fidelity realistic generator for offline/demo testing
 */
export function generateSimulatedList(count = 30) {
  const now = Date.now();
  const list = [];
  const basePeriod = Math.floor(now / 30000);
  
  for (let i = 0; i < count; i++) {
    const num = Math.floor(Math.random() * 10);
    let color = 'green';
    if (num === 0) color = 'red,violet';
    else if (num === 5) color = 'green,violet';
    else if ([1, 3, 7, 9].includes(num)) color = 'green';
    else color = 'red';

    const issueNumber = `2026110210005${(basePeriod - i).toString().slice(-4)}`;
    list.push({
      issueNumber,
      number: num.toString(),
      color,
      premium: num.toString(),
      sum: 0
    });
  }
  return list;
}

/**
 * Fetches deep historical draws (up to 5,000+ rounds) from local storage adapter or MongoDB
 */
export async function fetchFullDayServerHistory(limit = 5000) {
  const endpoints = [
    `/api/history?limit=${limit}`,
    `/api/learning/history?limit=${limit}`,
    `http://localhost:4001/api/learning/history?limit=${limit}`
  ];

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(ep, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.list) && json.list.length > 0) {
          return {
            success: true,
            source: 'Verified Server Storage',
            count: json.count || json.list.length,
            list: json.list
          };
        }
      }
    } catch {}
  }

  return { success: false, source: 'None', list: [] };
}
