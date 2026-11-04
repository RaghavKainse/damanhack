import { fetchGameState } from './src/utils/api.js';

async function testTimerLive() {
  console.log('Testing live timer against official Daman draw server...');
  const state = await fetchGameState('WinGo_30S');
  const now = Date.now();
  const durationSec = 30;
  const durationMs = durationSec * 1000;

  const cycleEnd = (Math.floor(now / durationMs) + 1) * durationMs;
  const cycleStart = cycleEnd - durationMs;
  const remainingMs = Math.max(0, cycleEnd - now);
  const remSec = Math.max(0, Math.min(durationSec, Math.ceil(remainingMs / 1000)));

  const cycleStartDate = new Date(cycleStart);
  const midnightUTC = Date.UTC(cycleStartDate.getUTCFullYear(), cycleStartDate.getUTCMonth(), cycleStartDate.getUTCDate());
  const secSinceMidnightUTC = Math.floor((cycleStart - midnightUTC) / 1000);
  const currentDrawIdx = Math.floor(secSinceMidnightUTC / durationSec) + 1;
  const yyyymmdd = cycleStartDate.toISOString().slice(0, 10).replace(/-/g, '');
  const activeIssue = `${yyyymmdd}10005${String(currentDrawIdx).padStart(4, '0')}`;

  console.log('Calculated Active Issue:', activeIssue);
  console.log('Official Server Issue:  ', state.current?.issueNumber);
  console.log('Issues Match?          ', activeIssue === state.current?.issueNumber);
  console.log('Remaining Seconds:     ', remSec, `(${String(Math.floor(remSec / 60)).padStart(2, '0')}:${String(remSec % 60).padStart(2, '0')})`);
  console.log('End Times Match?       ', cycleEnd === state.current?.endTime);
}

testTimerLive();

