import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';

import Header from './components/Header';
import LiveTimerCard from './components/LiveTimerCard';
import PredictionHero from './components/PredictionHero';
import FullDayAnalytics from './components/FullDayAnalytics';
import CrowdLiquidityCard from './components/CrowdLiquidityCard';
import SelfLearningMatrix from './components/SelfLearningMatrix';
import AccuracyMetrics from './components/AccuracyMetrics';
import TrendRoadmap from './components/TrendRoadmap';
import HistoryTable from './components/HistoryTable';
import MartingaleModal from './components/MartingaleModal';
import ManualModal from './components/ManualModal';

import { fetchLiveHistory, fetchGameState, GAME_MODES } from './utils/api';
import { 
  generatePrediction, 
  getMartingalePlan, 
  evaluateHistoryPerformance,
  classifyNumber,
  getLearnedWeights,
  updateLearningFromOutcome,
  replayUntrainedHistory,
  resetLearnedWeights
} from './utils/engine';
import { soundManager } from './utils/audio';

const STORAGE_ACCUM_HISTORY = 'wingo_accumulated_history_v3';
const STORAGE_CLOCK_OFFSET = 'wingo_server_clock_offset_v3';

function getSavedClockOffset() {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem(STORAGE_CLOCK_OFFSET);
    const parsed = val ? parseInt(val, 10) : 0;
    // Wipe and discard if contaminated with large CDN cache skew (> 2500ms)
    if (Math.abs(parsed) > 2500) {
      localStorage.removeItem(STORAGE_CLOCK_OFFSET);
      return 0;
    }
    return parsed;
  } catch {
    return 0;
  }
}

function getInitialHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_ACCUM_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export default function App() {
  const [selectedGame, setSelectedGame] = useState('WinGo_30S');
  const [historyList, setHistoryList] = useState(getInitialHistory);
  const [isLive, setIsLive] = useState(true);
  const [dataSource, setDataSource] = useState('Connecting to Daman...');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [language, setLanguage] = useState('hi'); // Default Hindi per user request
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [predictionMode, setPredictionMode] = useState('ultra_sniper'); // 'ultra_sniper' (90-98%), 'sniper', or 'all'
  const [targetType, setTargetType] = useState('bigSmall'); // 'bigSmall' (default) or 'oddEven'
  const [learnedWeights, setLearnedWeights] = useState(getLearnedWeights());

  // Modals
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  // Official Time & Period State
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [nextPeriod, setNextPeriod] = useState('');

  // Martingale State
  const [lossStreak, setLossStreak] = useState(0);

  // Prediction cache
  const [prediction, setPrediction] = useState(null);
  const [performance, setPerformance] = useState(null);

  // Synchronization Refs
  const prevIssueRef = useRef(null);
  const lastSpokenPeriodRef = useRef(null);
  const serverClockOffsetRef = useRef(getSavedClockOffset());
  const lastSecondRef = useRef(-1);
  const isFetchingRef = useRef(false);
  const prevActiveIssueRef = useRef(null);
  const gameStateRef = useRef(null);

  // Current game configuration
  const currentGame = GAME_MODES[selectedGame] || GAME_MODES['WinGo_30S'];
  const totalDuration = currentGame.duration;

  // Language update in sound manager
  useEffect(() => {
    soundManager.setLanguage(language);
  }, [language]);

  // Load official game state & history in parallel
  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const [historyRes, stateRes] = await Promise.all([
        fetchLiveHistory(selectedGame),
        fetchGameState(selectedGame)
      ]);

      // Cache official game state and synchronize clock against server round boundary
      if (stateRes && stateRes.success && stateRes.current) {
        gameStateRef.current = stateRes;
        if (stateRes.current.endTime) {
          const durationMs = totalDuration * 1000;
          const now = Date.now();
          const clientCycleEnd = (Math.floor(now / durationMs) + 1) * durationMs;
          const rawSkew = stateRes.current.endTime - clientCycleEnd;
          // Apply minor EWMA smoothing if local clock has slight drift (<= 2500ms)
          if (Math.abs(rawSkew) <= 2500) {
            serverClockOffsetRef.current = Math.round((serverClockOffsetRef.current || 0) * 0.7 + rawSkew * 0.3);
          } else {
            serverClockOffsetRef.current = 0;
          }
        }
      }

      // 2. Process draw history and check for settled results
      if (historyRes && historyRes.list && historyRes.list.length > 0) {
        setIsLive(historyRes.success);
        setDataSource(historyRes.source);

        // 24/7 Continuous Self-Training Catch-Up (Offline/Missed Rounds Experience Replay)
        try {
          const freshWeights = replayUntrainedHistory(historyRes.list, predictionMode, targetType);
          setLearnedWeights({ ...freshWeights });
        } catch (e) {
          console.warn('Continuous self-training replay error:', e);
        }

        const latestDraw = historyRes.list[0];
        if (latestDraw) {
          // Check if a new result just arrived!
          if (prevIssueRef.current && prevIssueRef.current !== latestDraw.issueNumber) {
            handleNewResultArrival(latestDraw);
          }
          prevIssueRef.current = latestDraw.issueNumber;
        }

        // Merge and accumulate history (up to 300 rounds for deep statistical accuracy)
        setHistoryList(prev => {
          const combined = [...historyRes.list];
          const seen = new Set(historyRes.list.map(x => x.issueNumber));
          for (const item of prev) {
            if (!seen.has(item.issueNumber)) {
              combined.push(item);
              seen.add(item.issueNumber);
            }
            if (combined.length >= 300) break;
          }
          try {
            localStorage.setItem(STORAGE_ACCUM_HISTORY, JSON.stringify(combined.slice(0, 300)));
          } catch {}
          return combined;
        });
      }
    } catch (err) {
      console.error('Failed to load official Daman data:', err);
    } finally {
      isFetchingRef.current = false;
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, [selectedGame]);

  // Handle new round settlement & trigger self-learning adaptation
  const handleNewResultArrival = (newDraw) => {
    const classified = classifyNumber(newDraw.number);
    
    // Update online reinforcement weights and Bayesian transition matrix dynamically!
    let freshWeights = learnedWeights;
    if (prediction) {
      freshWeights = updateLearningFromOutcome(prediction, newDraw);
      setLearnedWeights({ ...freshWeights });
    }

    // Immediately trigger deep historical re-analysis with new draw and updated weights
    setHistoryList(currentHistory => {
      const merged = [newDraw, ...currentHistory.filter(h => h.issueNumber !== newDraw.issueNumber)].slice(0, 300);
      const nextPred = generatePrediction(merged, predictionMode, targetType, freshWeights);
      setPrediction(nextPred);
      const nextPerf = evaluateHistoryPerformance(merged, predictionMode, targetType);
      setPerformance(nextPerf);
      try {
        localStorage.setItem(STORAGE_ACCUM_HISTORY, JSON.stringify(merged));
      } catch {}
      return merged;
    });

    // Check if previous prediction was active (if action was WAIT_SKIP, no bet was made!)
    if (prediction && prediction.action === 'CONFIRMED_BET') {
      const actualTarget = targetType === 'bigSmall' ? classified.bigSmall : classified.oddEven;
      const isWin = prediction.prediction === actualTarget;
      if (isWin) {
        setLossStreak(0);
        soundManager.playWin();
        // Confetti burst!
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 }
        });
      } else {
        setLossStreak(prev => prev + 1);
        soundManager.playWarning();
      }
    }
  };

  const handleResetLearning = () => {
    const resetW = resetLearnedWeights();
    setLearnedWeights({ ...resetW });
  };

  // Re-calculate predictions whenever historyList, predictionMode, targetType, OR learnedWeights change
  useEffect(() => {
    if (historyList && historyList.length > 0) {
      const pred = generatePrediction(historyList, predictionMode, targetType, learnedWeights);
      setPrediction(pred);

      const perf = evaluateHistoryPerformance(historyList, predictionMode, targetType);
      setPerformance(perf);
    }
  }, [historyList, predictionMode, targetType, learnedWeights]);

  // Background safety polling (every 10 seconds)
  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const lastRefreshedIssueRef = useRef('');
  const predictionRef = useRef(prediction);
  predictionRef.current = prediction;
  const loadDataRef = useRef(loadData);
  loadDataRef.current = loadData;

  // Ultra-smooth, non-stuttering monotonic countdown tick synced to Daman UTC schedule
  useEffect(() => {
    const updateCountdown = () => {
      const serverNow = Date.now() + (serverClockOffsetRef.current || 0);
      const durationMs = totalDuration * 1000;

      // Exact cycle boundaries aligned strictly to UTC midnight
      const cycleEnd = (Math.floor(serverNow / durationMs) + 1) * durationMs;
      const cycleStart = cycleEnd - durationMs;
      const remainingMs = Math.max(0, cycleEnd - serverNow);
      
      // Countdown smoothly from totalDuration down to 1
      const remSec = Math.max(0, Math.min(totalDuration, Math.ceil(remainingMs / 1000)));

      // Deterministic issue period calculation from UTC midnight
      const cycleStartDate = new Date(cycleStart);
      const midnightUTC = Date.UTC(cycleStartDate.getUTCFullYear(), cycleStartDate.getUTCMonth(), cycleStartDate.getUTCDate());
      const secSinceMidnightUTC = Math.floor((cycleStart - midnightUTC) / 1000);
      const currentDrawIdx = Math.floor(secSinceMidnightUTC / totalDuration) + 1;
      const yyyymmdd = cycleStartDate.toISOString().slice(0, 10).replace(/-/g, '');

      let codePrefix = '10005';
      if (selectedGame === 'WinGo_1M') codePrefix = '10001';
      else if (selectedGame === 'WinGo_3M') codePrefix = '10002'; // Official AR-Lottery 3M code
      else if (selectedGame === 'WinGo_5M') codePrefix = '10003'; // Official AR-Lottery 5M code

      // Align active and next issues with official live game state when available
      const serverState = gameStateRef.current;
      const hasLiveServerMatch = serverState?.success && serverState?.current?.issueNumber && 
        Math.abs((serverState?.current?.endTime || 0) - cycleEnd) < 2500;

      const activeIssue = hasLiveServerMatch 
        ? serverState.current.issueNumber 
        : `${yyyymmdd}${codePrefix}${String(currentDrawIdx).padStart(4, '0')}`;

      const nextIssue = (hasLiveServerMatch && serverState?.next?.issueNumber)
        ? serverState.next.issueNumber 
        : `${yyyymmdd}${codePrefix}${String(currentDrawIdx + 1).padStart(4, '0')}`;

      // ONLY update React state when the second value ACTUALLY changes!
      if (remSec !== lastSecondRef.current) {
        lastSecondRef.current = remSec;
        setRemainingSeconds(remSec);

        if (activeIssue !== prevActiveIssueRef.current) {
          prevActiveIssueRef.current = activeIssue;
          setCurrentPeriod(activeIssue);
          setNextPeriod(nextIssue);
        }

        // When a new round starts, fetch settled draw at remSec = totalDuration - 2, with retry at totalDuration - 5
        // This gives the official Daman draw server 2-5 seconds to settle RNG and write results
        if (remSec === totalDuration - 2 || remSec === totalDuration - 5) {
          loadDataRef.current();
        }

        // Audio beeps for last 5 seconds (lock phase)
        if (remSec <= 5 && remSec > 0) {
          soundManager.playWarning();
        }

        // Voice announcement at 12 seconds remaining
        const currentPred = predictionRef.current;
        if (remSec === 12 && currentPred && activeIssue !== lastSpokenPeriodRef.current) {
          soundManager.speakPrediction(
            currentPred.prediction, 
            currentPred.confidence, 
            currentPred.action,
            currentPred.topNumber?.number,
            currentPred.badge === 'ULTRA_SNIPER'
          );
          lastSpokenPeriodRef.current = activeIssue;
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 100);
    return () => clearInterval(interval);
  }, [totalDuration, selectedGame]);

  // Audio toggles
  const handleToggleSound = () => {
    setSoundEnabled(soundManager.toggleSound());
  };

  const handleToggleVoice = () => {
    setVoiceEnabled(soundManager.toggleVoice());
  };

  const handleToggleLanguage = () => {
    setLanguage(prev => (prev === 'hi' ? 'en' : 'hi'));
  };

  // Manual result entry
  const handleAddManualResult = (newItem) => {
    const updated = [newItem, ...historyList];
    setHistoryList(updated);
    setCurrentPeriod(newItem.issueNumber);
    try {
      setNextPeriod((BigInt(newItem.issueNumber) + 1n).toString());
    } catch {
      setNextPeriod('Next');
    }
    handleNewResultArrival(newItem);
  };

  // Martingale Plan calculation
  const martingalePlan = getMartingalePlan(10, lossStreak, 3);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 20px 60px' }}>
      
      {/* Top Navigation */}
      <Header
        selectedGame={selectedGame}
        onSelectGame={setSelectedGame}
        isLive={isLive}
        dataSource={dataSource}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        voiceEnabled={voiceEnabled}
        onToggleVoice={handleToggleVoice}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onOpenCalculator={() => setIsCalcOpen(true)}
        onOpenManual={() => setIsManualOpen(true)}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
      />

      {/* 1. Live Countdown & Period Bar (Synced to Daman Server) */}
      <LiveTimerCard
        currentPeriod={currentPeriod}
        nextPeriod={nextPeriod}
        remainingSeconds={remainingSeconds}
        totalDuration={totalDuration}
        lastResult={historyList[0]}
        language={language}
      />

      {/* 2. Hero Prediction Showcase (BIG/SMALL or ODD/EVEN) */}
      <div style={{ marginTop: '20px' }}>
        <PredictionHero
          predictionData={prediction}
          targetPeriod={currentPeriod}
          martingalePlan={martingalePlan}
          language={language}
          predictionMode={predictionMode}
          onTogglePredictionMode={setPredictionMode}
          targetType={targetType}
          onToggleTargetType={setTargetType}
        />
      </div>

      {/* 2.1 📊 24-Hour Full-Day Intraday Dynamics */}
      <FullDayAnalytics
        fullDayDynamics={prediction?.fullDayDynamics}
        language={language}
      />

      {/* 2.2 💰 Crowd Liquidity & House Risk Monitor */}
      <CrowdLiquidityCard
        crowdLiquidity={prediction?.crowdLiquidity}
        targetType={targetType}
        language={language}
        remainingSeconds={remainingSeconds}
        totalDuration={totalDuration}
      />

      {/* 2.5 🧠 Self-Learning Neural Matrix */}
      <SelfLearningMatrix
        learnedWeights={learnedWeights}
        onResetLearning={handleResetLearning}
        regime={prediction?.regime}
        language={language}
      />

      {/* 3. Accuracy & Performance Metrics */}
      <AccuracyMetrics
        performance={performance}
        language={language}
      />

      {/* 4. Pattern Roadmap (Bead Plate, Big Road, Hot/Cold) */}
      <TrendRoadmap
        historyList={historyList}
        language={language}
        targetType={targetType}
      />

      {/* 5. Detailed Audit Log & History Table */}
      <HistoryTable
        historyLogs={performance?.logs}
        language={language}
      />

      {/* Modals */}
      <MartingaleModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        language={language}
      />

      <ManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onAddResult={handleAddManualResult}
        lastPeriod={currentPeriod}
        language={language}
      />

      {/* Footer Disclaimer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 0 10px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.74rem',
        color: '#64748b'
      }}>
        <p>
          {language === 'hi' 
            ? 'अस्वीकरण: यह सॉफ्टवेयर केवल सांख्यिकीय पैटर्न ट्रैकिंग और ऐतिहासिक डेटा विश्लेषण के लिए है। किसी भी वित्तीय जोखिम के लिए उपयोगकर्ता स्वयं जिम्मेदार है।'
            : 'Disclaimer: This software is designed exclusively for quantitative statistical trend analysis and historical pattern tracking. Users are solely responsible for risk management.'}
        </p>
        <p style={{ marginTop: '4px', color: '#475569' }}>
          Daman WinGo 30S Quant Syndicate &copy; 2026. Connected to Official AR-Lottery Sync Engine.
        </p>
      </footer>

    </div>
  );
}
