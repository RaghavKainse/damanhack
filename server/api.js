/**
 * 📊 INTERNAL PERFORMANCE DASHBOARD & METRICS API
 * 
 * Provides verifiable, non-fabricated telemetry endpoints:
 * - GET /api/learning/status -> Daemon status & storage info
 * - GET /api/learning/metrics -> Latest multi-model evaluation metrics (50, 100, 250, 500)
 * - GET /api/learning/prediction -> Latest calibrated prediction with probabilities
 * - GET /api/learning/models -> Model version registry and promotion history
 * - GET /api/learning/report -> Comprehensive HTML performance report
 */

import http from 'http';
import { storage } from './storage.js';
import { generateCalibratedPrediction, runChronologicalWalkForward } from '../src/utils/statisticalEngine.js';

export function createMetricsServer(port = 4001) {
  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    try {
      if (url.pathname === '/api/learning/status') {
        const history = await storage.getHistory(10);
        const latestRound = await storage.getLatestRound();
        const registry = await storage.getModelRegistry();
        const evalReport = await storage.getLatestEvaluation();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ONLINE',
          storageMode: storage.isMongoConnected ? 'MongoDB' : 'ACID_WAL_Store',
          activeVersion: registry.activeVersion,
          totalVerifiedRounds: storage.walCache.rounds.length,
          latestRound,
          lastEvaluationAt: evalReport?.evaluatedAt || null,
          uptimeSeconds: Math.floor(process.uptime())
        }, null, 2));
        return;
      }

      if (url.pathname === '/api/learning/metrics') {
        let evalReport = await storage.getLatestEvaluation();
        if (!evalReport) {
          const history = await storage.getHistory(500);
          if (history.length >= 20) {
            const wf = runChronologicalWalkForward(history, 'bigSmall', [50, 100, 250, 500]);
            evalReport = {
              evaluatedAt: new Date().toISOString(),
              totalVerifiedDraws: history.length,
              windows: wf.windows
            };
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(evalReport || { message: 'Collecting initial history...' }, null, 2));
        return;
      }

      if (url.pathname === '/api/learning/prediction') {
        const history = await storage.getHistory(300);
        const pred = generateCalibratedPrediction(history, 'bigSmall');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pred, null, 2));
        return;
      }

      if (url.pathname === '/api/learning/models') {
        const registry = await storage.getModelRegistry();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(registry, null, 2));
        return;
      }

      // Default 404
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint not found' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  });

  server.listen(port, () => {
    console.log(`📡 Metrics API Server listening at http://localhost:${port}/api/learning/status`);
  });

  return server;
}

if (process.argv[1] && process.argv[1].endsWith('api.js')) {
  storage.init().then(() => {
    createMetricsServer(4001);
  });
}
