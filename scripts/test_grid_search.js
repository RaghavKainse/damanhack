import { storage } from '../server/storage.js';
import { generateFieldPrediction, classifyNumber, getContiguousHistory } from '../src/utils/engine.js';

async function gridSearch() {
  await storage.init();
  const rawList = await storage.getHistory(300);
  const list = getContiguousHistory(rawList);

  console.log(`Running Grid Search on ${list.length} contiguous draws...`);

  const trials = [];

  for (let wBayes of [1.5, 2.0, 2.5]) {
    for (let wOm of [1.5, 2.0, 2.5]) {
      for (let wML of [1.0, 1.5, 2.0]) {
        for (let wClust of [1.0, 1.5]) {
          for (let wDT of [0.0, 0.5, 1.0]) {
            for (let wMarkov of [0.0, 0.5]) {
              const weights = {
                bayesianTrans: wBayes,
                omissionRev: wOm,
                logisticML: wML,
                clusterParity: wClust,
                decisionTree: wDT,
                markov2: wMarkov,
                dragonTrend: 0.2,
                nGram: 0.2,
                poissonWait: 0.4
              };

              let winsBS = 0, totalBS = 0;
              let seqWinsBS = 0, seqLossesBS = 0, curStep = 0;

              for (let i = list.length - 25; i >= 0; i--) {
                const past = list.slice(i + 1);
                const actual = classifyNumber(list[i].number);
                const pred = generateFieldPrediction(past, 'bigSmall', 'all', null, null, weights);
                totalBS++;
                if (pred.prediction === actual.bigSmall) {
                  winsBS++;
                  seqWinsBS++;
                  curStep = 0;
                } else {
                  if (curStep === 2) {
                    seqLossesBS++;
                    curStep = 0;
                  } else {
                    curStep++;
                  }
                }
              }

              const rateBS = winsBS / totalBS;
              const seqRateBS = seqWinsBS / (seqWinsBS + seqLossesBS);
              trials.push({
                weights,
                rateBS,
                seqRateBS,
                winsBS,
                totalBS,
                seqWinsBS,
                seqLossesBS
              });
            }
          }
        }
      }
    }
  }

  // Sort by direct win rate descending
  trials.sort((a, b) => b.rateBS - a.rateBS || b.seqRateBS - a.seqRateBS);

  console.log(`\n=== TOP 5 WEIGHT CONFIGURATIONS FOR ALL ROUNDS ===`);
  for (let i = 0; i < 5; i++) {
    const t = trials[i];
    console.log(`Rank #${i + 1}: Direct ${(t.rateBS * 100).toFixed(1)}% (${t.winsBS}/${t.totalBS}) | 3-Step ${(t.seqRateBS * 100).toFixed(1)}% (${t.seqWinsBS}W / ${t.seqLossesBS}L)`);
    console.log(`  Weights:`, t.weights);
  }

  await storage.close();
}

gridSearch().catch(console.error);
