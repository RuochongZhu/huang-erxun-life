import { LIFE_VALUES, createLifeCourse, isDynamicGame } from './life-dynamics.mjs';

// This is the same 0–1000 weighted index shown by getLifeScore. An opening
// point describes the position before a recorded decision; a game with no
// decisions has no candle and is not assigned an initial life score.
export const WEIGHTED_LIFE_SCALE = 1000;
const PHASES = ['life', 'prep', 'choice'];
const LABELS = { life: '生活取舍后', prep: '准备后', choice: '事业决定后' };
const rounded = value => Math.round(value * 10) / 10;
const weighted = values => Math.round(LIFE_VALUES.reduce((total, item) => total + values[item.key] * item.weight, 0) * 10);

function receiptFor(game, entry) {
  const phaseRecords = entry.phase === 'life' ? game.lifeJournal : entry.phase === 'prep' ? game.preparationJournal : game.journal;
  const evidence = (entry.phase === 'life' ? game.lifeEvidence : game.evidence)?.find(item =>
    item.step === entry.step && item.phase === entry.phase && item.optionId === entry.optionId);
  const receipt = phaseRecords?.find(item => item.step === entry.step
    && (item.optionId === entry.optionId || !item.optionId && evidence));
  return {
    title: receipt?.title || '',
    choiceTitle: receipt?.choiceTitle || evidence?.choiceTitle || '',
  };
}

/** Derive candles from completed, cumulative net changes, never from a projected
 * future or from the current values spread backwards over missing years.
 * Callers normally pass a validated game. If records are missing, only the
 * contiguous known prefix is usable: later changes have no reliable baseline.
 */
export function getWeightedLifeHistory(game) {
  const history = game?.lifeCourse?.history;
  if (!isDynamicGame(game) || !Array.isArray(history) || !history.length) return [];
  let values = { ...createLifeCourse().values };
  let expectedStep = 0, expectedPhase = 0;
  const rows = [];
  for (const entry of history) {
    if (!entry || entry.step !== expectedStep || entry.phase !== PHASES[expectedPhase]
      || entry.step > game.step || !['string', 'number'].includes(typeof entry.year)
      || !String(entry.year).trim() || !entry.values || typeof entry.values !== 'object') break;
    const next = {};
    let valid = true;
    for (const { key } of LIFE_VALUES) {
      const change = entry.values[key] ?? 0;
      if (!Number.isFinite(change)) { valid = false; break; }
      next[key] = rounded(values[key] + change);
      if (next[key] < 0 || next[key] > 100) { valid = false; break; }
    }
    if (!valid) break;
    const receipt = receiptFor(game, entry);
    let row = rows.at(-1);
    if (expectedPhase === 0) {
      row = { step: entry.step, year: String(entry.year), title: receipt.title || `${entry.year} 年`,
        complete: false, scale: WEIGHTED_LIFE_SCALE,
        points: [{ label: '这一站开始', choiceTitle: '', phase: 'start', optionId: null, stats: { lifeIndex: weighted(values) } }],
      };
      rows.push(row);
    } else if (row.year !== String(entry.year)) break;
    // Each history delta already includes the main decision, any supplemental
    // actions, and any accumulated event. Adding event.values again would count
    // the same crisis or breakthrough twice.
    values = next;
    row.points.push({ label: LABELS[entry.phase], choiceTitle: receipt.choiceTitle,
      phase: entry.phase, optionId: entry.optionId || '', stats: { lifeIndex: weighted(values) } });
    if (entry.phase === 'choice') {
      row.complete = true;
      expectedStep++;
      expectedPhase = 0;
    } else expectedPhase++;
  }
  return rows;
}
