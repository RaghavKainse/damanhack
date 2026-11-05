import { readFileSync } from 'fs';
import { generatePrediction, classifyNumber, getLearnedWeights, updateLearningFromOutcome, analyzeFieldPatterns } from '../src/utils/engine.js';

// Let's load the 195 collected draws from test_always_all or fetch recent
const res = await fetch('https://draw.ar-lottery06.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?ts=' + Date.now());
const j = await res.json();
console.log('Current live count:', j.data?.list?.length);
