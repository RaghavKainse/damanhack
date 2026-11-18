import assert from 'assert';
import {
  getTheoreticalProbability,
  classifyMultiplier,
  analyzeAviatorRegime,
  generateAviatorPrediction,
  calculateBracketProbabilities,
  calculateAviatorKellyStake,
  verifyProvablyFair,
  SEED_AVIATOR_HISTORY
} from '../src/utils/aviatorEngine.js';

console.log('\n======================================================');
console.log('✈️ RUNNING AVIATOR QUANTITATIVE ENGINE TEST SUITE');
console.log('======================================================\n');

// 1. Theoretical Probability Distribution (97% RTP)
console.log('📌 GROUP 1: Theoretical Pareto/Crash Probability Curves');
const p1 = getTheoreticalProbability(1.0);
assert.strictEqual(p1, 100.0, 'P(X >= 1.0x) must be 100%');

const p2 = getTheoreticalProbability(2.0);
assert(Math.abs(p2 - 48.5) < 0.1, `P(X >= 2.0x) must be ~48.5% (got ${p2})`);

const p10 = getTheoreticalProbability(10.0);
assert(Math.abs(p10 - 9.7) < 0.1, `P(X >= 10.0x) must be ~9.7% (got ${p10})`);
console.log('  ✅ PASS: Verified 97% RTP theoretical survival probabilities');

// 2. Multiplier Visual Classification
console.log('\n📌 GROUP 2: Multiplier Visual & Volatility Tiers');
assert.strictEqual(classifyMultiplier(1.05).tier, 'FLEA');
assert.strictEqual(classifyMultiplier(1.45).tier, 'LOW');
assert.strictEqual(classifyMultiplier(3.50).tier, 'MID');
assert.strictEqual(classifyMultiplier(18.2).tier, 'HIGH');
assert.strictEqual(classifyMultiplier(75.0).tier, 'JACKPOT');
console.log('  ✅ PASS: Categorized FLEA, LOW, MID, HIGH, and JACKPOT tiers');

// 3. Volatility Clustering & Regime Detection
console.log('\n📌 GROUP 3: Cold Flea-Crash Traps & Hot Rebound Regimes');
const coldHistory = [
  { multiplier: 1.05 },
  { multiplier: 1.12 },
  { multiplier: 1.01 },
  { multiplier: 1.85 },
  { multiplier: 1.40 }
];
const coldRegime = analyzeAviatorRegime(coldHistory);
assert.strictEqual(coldRegime.isColdTrap, true, '3 consecutive low crashes must trigger cold trap');
assert.strictEqual(coldRegime.regime, 'CRASH_STORM_COLD');

const surgeHistory = [
  { multiplier: 1.35 },
  { multiplier: 1.45 },
  { multiplier: 1.25 },
  { multiplier: 1.55 },
  { multiplier: 1.30 },
  { multiplier: 1.40 },
  { multiplier: 1.22 }
];
const surgeRegime = analyzeAviatorRegime(surgeHistory);
assert.strictEqual(surgeRegime.isHotSurge, true, '7 rounds without 2x+ must trigger surge rebound');
assert.strictEqual(surgeRegime.regime, 'FLY_HIGH_SURGE');
console.log('  ✅ PASS: Successfully detected Cold Crash Traps and Rebound Surge regimes');

// 4. Master Prediction & Continuous Active Multipliers (No Skips)
console.log('\n📌 GROUP 4: Master Prediction & Continuous Multipliers (No Skips)');
const coldPred = generateAviatorPrediction(coldHistory, 'safe');
assert.strictEqual(coldPred.action, 'CONFIRMED_BET', 'Must output confirmed active target even in cold traps');
assert.strictEqual(coldPred.badge, 'CRASH_TRAP_CAUTION');
assert(coldPred.recommendedCashout >= 1.15 && coldPred.recommendedCashout <= 1.30);

const normalPred = generateAviatorPrediction(SEED_AVIATOR_HISTORY, 'safe');
assert.strictEqual(normalPred.action, 'CONFIRMED_BET');
assert(normalPred.recommendedCashout >= 1.25 && normalPred.recommendedCashout <= 1.65);
assert(normalPred.top3Targets.length === 3, 'Must provide top 3 cashout targets');
console.log('  ✅ PASS: Enforces crash trap shields and calculates optimal cashout');

// 5. Quarter-Kelly Capital Sizing
console.log('\n📌 GROUP 5: Quarter-Kelly Capital Sizing');
const kelly = calculateAviatorKellyStake(10000, 1.50, 70);
assert(kelly.safeAmount > 0 && kelly.safeAmount <= 500, 'Quarter-Kelly must recommend safe 1-5% stake');
assert(kelly.percent <= 5.0, 'Stake percentage must not exceed 5%');
console.log('  ✅ PASS: Verified Quarter-Kelly capital protection formula');

// 6. Spribe HMAC-SHA512 Provably Fair Verification
console.log('\n📌 GROUP 6: Cryptographic Provably Fair SHA-512 Verification');
async function testProvablyFair() {
  const serverSeed = 'b1b6c7e2d4a5f8e91234567890abcdefb1b6c7e2d4a5f8e91234567890abcdef';
  const clientSeed = 'daman_player_test_seed_7719';
  const pf = await verifyProvablyFair(serverSeed, clientSeed, 1);
  assert.strictEqual(pf.valid, true, 'Provably fair computation must be valid');
  assert(pf.crashMultiplier >= 1.0, 'Crash multiplier must be >= 1.00x');
  assert(typeof pf.hashHex === 'string' && pf.hashHex.length === 128, 'HMAC-SHA512 must produce 128 hex chars');
  console.log(`  ✅ PASS: Verified Provably Fair math (Computed crash: ${pf.crashMultiplier}x)`);
}

await testProvablyFair();

console.log('\n======================================================');
console.log('🎉 ALL 6/6 AVIATOR QUANT ENGINE TESTS PASSED!');
console.log('======================================================\n');
