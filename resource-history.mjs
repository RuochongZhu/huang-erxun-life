import * as life from './life-engine.mjs';
import * as career from './engine.mjs';
import { getScene as careerScene } from './content.mjs';

export const RESOURCE_LABELS = { money: '资金', energy: '精力', stress: '压力' };

// Read an already validated game. Replay actual choices so old records and
// partial chapters retain their real resource values without invented history.
export function getResourceHistory(game) {
  const rows = [];
  const sample = (before, after, scene) => {
    let row = rows.find(item => item.step === before.step);
    if (!row) {
      row = { step: before.step, year: scene.year, title: scene.title, complete: false,
        points: [{ label: '这一站开始', choiceTitle: '', stats: { ...before.stats } }] };
      rows.push(row);
    }
    row.points.push({ label: before.phase === 'life' ? '生活取舍后' : before.phase === 'prep' ? '准备后' : '决定后（含时间成本）',
      choiceTitle: after.lastResult.title, stats: { ...after.stats } });
    if (after.phase === 'result') row.complete = true;
  };
  let state;
  if (game.legacyBase) {
    let old = career.createGame(game.legacyBase.name, game.legacyBase.seed);
    for (const entry of game.legacyBase.evidence) {
      if (old.step < entry.step) old = career.continueGame(old);
      const scene = careerScene(old);
      const next = career.commitChoice(old, entry.optionId);
      sample(old, next, scene);
      old = next;
    }
    const migrated = life.validateSave(game.legacyBase);
    if (!migrated.ok) throw new Error('旧存档无法生成处境记录');
    state = migrated.state;
  } else state = life.createGame(game.name, game.seed, { storyEdition: game.storyEdition ?? null, dynamicsEdition: game.dynamicsEdition ?? null, continuityEdition: game.continuityEdition ?? null, choicePlanEdition: game.choicePlanEdition ?? null });
  for (const action of game.actions) {
    state = { ...state, elapsedMs: action.elapsedMs };
    if (action.type === 'enable-combinations') state = life.enableCombinationChoices(state);
    else if (action.type === 'choice') {
      const scene = life.getScene(state);
      const next = action.optionIds ? life.commitChoices(state, action.optionIds) : life.commitChoice(state, action.optionId);
      sample(state, next, scene);
      state = next;
    } else if (action.type === 'continue') state = life.continueGame(state);
    else if (action.type === 'end') state = life.endEarly(state, action.reason);
  }
  return rows;
}

export function resourceCandle(row, key) {
  const values = row.points.map(point => point.stats[key]);
  return { open: values[0], close: values.at(-1), high: Math.max(...values), low: Math.min(...values) };
}
