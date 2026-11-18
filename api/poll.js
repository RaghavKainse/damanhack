import { storage } from '../server/storage.js';
import { 
  validateDraw, 
  generateCalibratedPrediction,
  diagnosePredictionError
} from '../src/utils/statisticalEngine.js';
import { 
  classifyNumber,
  getLearnedWeights,
  saveLearnedWeights,
  updateLearningFromOutcome,
  getBayesianTransitionMatrix,
  setNodeLearningState 
} from '../src/utils/engine.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    // 1. Initialize Storage (MongoDB Atlas loccomirror)
    await storage.init();

    // 2. Load prior learning state (weights + 10x10 Bayesian transition matrix)
    const priorState = await storage.loadLearningState();
    if (priorState) {
      setNodeLearningState(priorState.weights, priorState.matrix);
    }

    // 3. Fetch latest live draws from redundant mirrors
    const ts = Date.now();
    const gameCode = 'WinGo_30S';
    const endpoints = [
      `https://draw.ar-lottery06.com/WinGo/${gameCode}/GetHistoryIssuePage.json?ts=${ts}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://draw.ar-lottery06.com/WinGo/${gameCode}/GetHistoryIssuePage.json?ts=${ts}`)}`
    ];

    let rawList = null;
    for (const ep of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const fetchRes = await fetch(ep, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json, text/plain, */*' }
        });
        clearTimeout(timeoutId);

        if (fetchRes.ok) {
          const json = await fetchRes.json();
          const list = json?.data?.list;
          if (Array.isArray(list) && list.length > 0) {
            rawList = list;
            break;
          }
        }
      } catch {}
    }

    let newlyCommitted = 0;
    if (rawList && rawList.length > 0) {
      // Ingest chronologically: oldest first
      const chrono = [...rawList].reverse();
      for (const raw of chrono) {
        const v = validateDraw(raw);
        if (!v.valid) continue;
        // Zero data leakage: generate prediction strictly using past history BEFORE committing new round
        const priorHistory = await storage.getHistory(50);
        const currentWeights = getLearnedWeights();
        const pred = generateCalibratedPrediction(priorHistory, 'bigSmall', currentWeights);

        const isNew = await storage.saveRound(raw);
        if (isNew) {
          newlyCommitted++;
          // Settle & online learn
          const updatedWeights = updateLearningFromOutcome(pred, raw);
          saveLearnedWeights(updatedWeights);

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
        }
      }

      if (newlyCommitted > 0) {
        await storage.saveLearningState(getLearnedWeights(), getBayesianTransitionMatrix());
      }
    }

    // 4. Generate next upcoming prediction
    const history = await storage.getHistory(300);
    const weights = getLearnedWeights();
    const nextPred = generateCalibratedPrediction(history, 'bigSmall', weights);
    const daily = await storage.getDailyProgress();

    return res.status(200).json({
      status: 'ONLINE',
      cloud: 'Vercel_Serverless_Edge',
      storageMode: storage.isMongoConnected ? `MongoDB (${storage.dbName})` : 'ACID_WAL_Store',
      timestamp: Date.now(),
      newDrawsIngested: newlyCommitted,
      totalVerifiedDraws: storage.walCache.rounds.length,
      dailyProgress: {
        date: daily.date,
        totalDrawsProcessed: daily.totalDrawsProcessed,
        targetDailyRounds: 2880,
        completionPercent: daily.completionPercent,
        winRatePercent: daily.winRatePercent,
        winCount: daily.winCount,
        lossCount: daily.lossCount,
        skippedCount: daily.skippedCount
      },
      nextPrediction: {
        targetIssue: nextPred.targetIssue,
        action: nextPred.action,
        forecast: nextPred.prediction,
        confidence: nextPred.calibratedConfidence,
        probabilities: nextPred.probabilities,
        modelAgreement: nextPred.modelAgreement,
        entropy: nextPred.entropy
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

