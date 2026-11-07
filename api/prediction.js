import { storage } from '../server/storage.js';
import { generateCalibratedPrediction } from '../src/utils/statisticalEngine.js';
import { getLearnedWeights, setNodeLearningState } from '../src/utils/engine.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    await storage.init();
    const state = await storage.loadLearningState();
    if (state) {
      setNodeLearningState(state.weights, state.matrix);
    }
    const history = await storage.getHistory(300);
    const weights = getLearnedWeights();
    const pred = generateCalibratedPrediction(history, 'bigSmall', weights);
    return res.status(200).json(pred);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
