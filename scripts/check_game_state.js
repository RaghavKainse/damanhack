import { fetchGameState, fetchLiveHistory } from '../src/utils/api.js';

async function checkGameState() {
  const state = await fetchGameState('WinGo_30S');
  const history = await fetchLiveHistory('WinGo_30S');

  console.log('--- OFFICIAL GAME STATE ---');
  console.log('Previous settled issue:', state.previous?.issueNumber, 'number:', state.previous?.number);
  console.log('Current betting issue:', state.current?.issueNumber, 'endTime:', new Date(state.current?.endTime).toISOString());
  console.log('Next issue:', state.next?.issueNumber);

  console.log('\n--- LATEST HISTORY ISSUE ---');
  console.log('Latest history draw:', history.list?.[0]?.issueNumber, 'number:', history.list?.[0]?.number);
  console.log('Second history draw:', history.list?.[1]?.issueNumber, 'number:', history.list?.[1]?.number);
}

checkGameState();
