import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function devApiPlugin() {
  let timer = null;

  async function pollAndIngest() {
    try {
      const { storage } = await import('./server/storage.js');
      const { generateCalibratedPrediction, diagnosePredictionError } = await import('./src/utils/statisticalEngine.js');
      const { classifyNumber, getLearnedWeights, updateLearningFromOutcome, saveLearnedWeights, getBayesianTransitionMatrix } = await import('./src/utils/engine.js');
      
      await storage.init();
      const res = await fetch(`https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        const list = json.data?.list || [];
        const chrono = [...list].reverse();
        for (const raw of chrono) {
          const priorHistory = await storage.getHistory(50);
          const currentWeights = getLearnedWeights();
          const pred = generateCalibratedPrediction(priorHistory, 'bigSmall', currentWeights);

          const isNew = await storage.saveRound(raw);
          if (isNew) {
            const classified = classifyNumber(raw.number);
            const isSkip = pred.action === 'NO_CLEAR_SIGNAL' || pred.action === 'WAIT_SKIP' || pred.prediction === 'NO CLEAR SIGNAL';
            const isWin = isSkip ? null : (pred.prediction === classified.bigSmall);
            const probBig = pred.probabilities?.BIG ?? 0.50;
            const actualBinary = classified.bigSmall === 'BIG' ? 1.0 : 0.0;
            const brier = Math.pow(probBig - actualBinary, 2);
            const diagnosis = diagnosePredictionError(pred, raw);

            const auditRec = {
              targetIssue: String(raw.issueNumber),
              predicted: pred.prediction,
              actual: classified.bigSmall,
              actualNumber: classified.number,
              probA: probBig,
              isWin,
              action: pred.action,
              brierError: Math.round(brier * 10000) / 10000,
              calibratedConfidence: pred.calibratedConfidence,
              diagnosis,
              timestamp: Date.now()
            };

            await storage.savePredictionAudit(auditRec);
            await storage.updateDailyProgress(auditRec);

            try {
              const updatedWeights = updateLearningFromOutcome(pred, raw);
              saveLearnedWeights(updatedWeights);
              await storage.saveLearningState(updatedWeights, getBayesianTransitionMatrix());
            } catch {}
          }
        }
      }
    } catch {}
  }

  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      pollAndIngest();
      timer = setInterval(pollAndIngest, 15000);
      server.httpServer?.on('close', () => {
        if (timer) clearInterval(timer);
      });

      server.middlewares.use(async (req, res, next) => {
        const host = req.headers.host || 'localhost:5173';
        const url = new URL(req.url, `http://${host}`);

        // Settlement endpoint: commits each live prediction & draw outcome to MongoDB & WAL
        if ((url.pathname === '/api/record-prediction-result' || url.pathname === '/api/learning/record-prediction' || url.pathname === '/api/prediction/settle') && req.method === 'POST') {
          try {
            const data = await readJsonBody(req);
            const { storage } = await import('./server/storage.js');
            const { classifyNumber, updateLearningFromOutcome, getBayesianTransitionMatrix, saveLearnedWeights } = await import('./src/utils/engine.js');
            const { diagnosePredictionError } = await import('./src/utils/statisticalEngine.js');

            await storage.init();

            const targetIssue = String(data.targetIssue || '');
            const rawDraw = data.rawDraw || {
              issueNumber: targetIssue,
              number: String(data.actualNumber ?? 0),
              color: 'unknown'
            };

            // 1. Commit round to draw_rounds in MongoDB
            await storage.saveRound(rawDraw);

            const classified = classifyNumber(rawDraw.number);
            const actualBS = classified.bigSmall;
            const predicted = data.predicted || 'NO CLEAR SIGNAL';
            const action = data.action || 'CONFIRMED_BET';
            const isSkip = action === 'NO_CLEAR_SIGNAL' || action === 'WAIT_SKIP' || predicted === 'NO CLEAR SIGNAL';
            const isWin = isSkip ? null : (predicted === actualBS);

            const probA = typeof data.probA === 'number' ? data.probA : 0.50;
            const actualBinary = actualBS === 'BIG' ? 1.0 : 0.0;
            const brierError = Math.round(Math.pow(probA - actualBinary, 2) * 10000) / 10000;
            const boundedP = Math.max(1e-6, Math.min(1 - 1e-6, probA));
            const logLossError = Math.round(-(actualBinary * Math.log(boundedP) + (1 - actualBinary) * Math.log(1 - boundedP)) * 10000) / 10000;

            const diagnosis = diagnosePredictionError({ prediction: predicted, probA, action, confidence: data.confidence }, rawDraw);

            const auditRecord = {
              targetIssue,
              predicted,
              actual: actualBS,
              actualNumber: classified.number,
              probA,
              isWin,
              action,
              brierError,
              logLossError,
              calibratedConfidence: data.confidence || 50,
              diagnosis,
              timestamp: Date.now()
            };

            // 2. Upsert prediction audit into prediction_audits in MongoDB
            await storage.savePredictionAudit(auditRecord);

            // 3. Update daily learning rollups in MongoDB
            const daily = await storage.updateDailyProgress(auditRecord);

            // 4. Update online learning weights & transition matrix
            try {
              const freshWeights = updateLearningFromOutcome({ prediction: predicted }, rawDraw);
              saveLearnedWeights(freshWeights);
              await storage.saveLearningState(freshWeights, getBayesianTransitionMatrix());
            } catch {}

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              targetIssue,
              isWin,
              storageMode: storage.isMongoConnected ? `MongoDB (${storage.dbName})` : 'ACID_WAL_Store',
              auditRecord,
              daily
            }));
            return;
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
            return;
          }
        }

        if (url.pathname === '/api/learning/status') {
          try {
            const { storage } = await import('./server/storage.js');
            const { getLearnedWeights } = await import('./src/utils/engine.js');
            await storage.init();
            const latestRound = await storage.getLatestRound();
            const daily = await storage.getDailyProgress();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              status: 'ONLINE',
              storageMode: storage.isMongoConnected ? `MongoDB (${storage.dbName})` : 'ACID_WAL_Store',
              isMongoConnected: storage.isMongoConnected,
              totalVerifiedRounds: storage.walCache.rounds.length,
              latestRound,
              dailyProgress: daily,
              learnedWeights: getLearnedWeights()
            }));
            return;
          } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
            return;
          }
        }

        if (url.pathname === '/api/learning/audits') {
          try {
            const { storage } = await import('./server/storage.js');
            await storage.init();
            const limit = parseInt(url.searchParams.get('limit') || '50', 10);
            const audits = await storage.getPredictionAudits(limit);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ count: audits.length, audits }));
            return;
          } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
            return;
          }
        }

        if (url.pathname === '/api/history' || url.pathname === '/api/learning/history') {
          try {
            const { storage } = await import('./server/storage.js');
            await storage.init();
            const limit = Math.min(10000, Math.max(10, parseInt(url.searchParams.get('limit') || '5000', 10)));
            const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));
            const history = await storage.getHistory(limit, offset);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, count: history.length, limit, offset, list: history }));
            return;
          } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
            return;
          }
        }

        if (url.pathname === '/api/day' || url.pathname === '/api/learning/day') {
          try {
            const { storage } = await import('./server/storage.js');
            await storage.init();
            const daily = await storage.getDailyProgress(url.searchParams.get('date'));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(daily));
            return;
          } catch (e) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
            return;
          }
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApiPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/draw-api': {
        target: 'https://draw.ar-lottery06.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/draw-api/, ''),
        secure: false,
      }
    }
  }
})
