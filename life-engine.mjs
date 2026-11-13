import * as career from './engine.mjs';
import { getScene as getCareerScene } from './content.mjs';
import { createLifeState, getLifeScene, getLifePortrait } from './life-content.mjs';
import { STORY_EDITION, getStepCount } from './story-timeline.mjs';
import { getFutureEnding } from './story-endings.mjs';
import { DYNAMICS_EDITION, isDynamicGame, createLifeCourse, previewLifeImpact, applyLifeDynamics, getLifeScore } from './life-dynamics.mjs';
import { getWorldFeedback } from './story-feedback.mjs';
import { getContinuityFeedback } from './story-continuity.mjs';
import { CHOICE_PLAN_EDITION, isChoicePlanGame, buildChoicePlan, resolveChoicePlan, mergePlanImpact } from './choice-plan.mjs';
import { enrichLifeFeedback } from './life-feedback.mjs';
import { getIfEpilogue } from './story-if.mjs';
import { COMBINATION_EDITION, isCombinationGame, buildCombinedChoice, combinedReceipts } from './combined-choice.mjs';

export const VERSION = '2.0.0';
export const CONTINUITY_EDITION = '2026.11.bonds';
export { CHOICE_PLAN_EDITION, COMBINATION_EDITION };
export const ACTIVE_LIMIT_MS = career.ACTIVE_LIMIT_MS;

const STEP_COUNT = 12;
const TIME_LIMIT_REASON = '达到26分钟活跃游玩上限';
const PHASES = ['life', 'life-result', 'prep', 'choice', 'result', 'ended'];
const MIGRATION_NOTE = '旧版只记录了职业选择；此前的伴侣、婚育、家人相处和兴趣经历未记录。生活手记从升级后的新节点开始，不补写过去。';
const clone = value => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return Array.from(value.slice(0, maxLength * 4)
    .replace(/[\p{Cc}\u202a-\u202e\u2066-\u2069]/gu, '').trim()).slice(0, maxLength).join('');
}

function plainRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function ownValue(record, key) {
  return Object.getOwnPropertyDescriptor(record, key)?.value;
}

// Never evaluate a getter while reading an imported save. Exact shape comparison
// also rejects extra keys, sparse arrays, symbols and prototype pollution.
function sameSave(actual, expected) {
  if (expected === null || typeof expected !== 'object') return actual === expected;
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length
      || Reflect.ownKeys(actual).length !== expected.length + 1) return false;
    return expected.every((value, index) => sameSave(ownValue(actual, index), value));
  }
  if (!plainRecord(actual) || Reflect.ownKeys(actual).length !== Object.keys(expected).length) return false;
  return Object.entries(expected).every(([key, value]) => sameSave(ownValue(actual, key), value));
}

export function createGame(name, seed = 0, {
  storyEdition = STORY_EDITION,
  dynamicsEdition = storyEdition === STORY_EDITION ? DYNAMICS_EDITION : null,
  continuityEdition = dynamicsEdition === DYNAMICS_EDITION ? CONTINUITY_EDITION : null,
  choicePlanEdition = continuityEdition === CONTINUITY_EDITION ? CHOICE_PLAN_EDITION : null,
} = {}) {
  if (storyEdition !== null && storyEdition !== STORY_EDITION) throw new TypeError('未知剧情版本');
  if (dynamicsEdition !== null && (dynamicsEdition !== DYNAMICS_EDITION || storyEdition !== STORY_EDITION)) throw new TypeError('未知人生数值版本');
  if (continuityEdition !== null && (continuityEdition !== CONTINUITY_EDITION || dynamicsEdition !== DYNAMICS_EDITION)) throw new TypeError('未知人物记忆版本');
  if (choicePlanEdition !== null && (choicePlanEdition !== CHOICE_PLAN_EDITION || continuityEdition !== CONTINUITY_EDITION)) throw new TypeError('未知行动安排版本');
  return {
    ...career.createGame(name, seed), version: VERSION, phase: 'life',
    ...(storyEdition === STORY_EDITION ? { storyEdition } : {}),
    ...(dynamicsEdition === DYNAMICS_EDITION ? { dynamicsEdition, lifeCourse: createLifeCourse() } : {}),
    ...(continuityEdition === CONTINUITY_EDITION ? { continuityEdition } : {}),
    ...(choicePlanEdition === CHOICE_PLAN_EDITION ? { choicePlanEdition, supplementJournal: [], preparationJournal: [] } : {}),
    life: createLifeState(), lifeJournal: [], lifeEvidence: [], actions: [],
  };
}

function migrateLegacy(validatedState, sourceVersion = validatedState.version) {
  const legacyBase = clone(validatedState);
  const recordedFromStep = Math.min(STEP_COUNT, legacyBase.step + 1);
  return {
    ...legacyBase, version: VERSION,
    life: createLifeState({ legacy: true, recordedFromStep }),
    lifeJournal: [], lifeEvidence: [], actions: [], legacyBase,
    migration: { sourceVersion, recordedFromStep, note: MIGRATION_NOTE },
  };
}

function careerInput(state) {
  // Finish the chapter already in progress under its original contract. The
  // whole-life career overlay starts alongside the first new life chapter.
  if (state.migration && state.step < state.migration.recordedFromStep) {
    const { life, ...legacyChapter } = state;
    return { ...legacyChapter, elapsedMs: 0 };
  }
  return { ...state, elapsedMs: 0 };
}

export function getScene(state) {
  if (state.phase === 'life-result') {
    const entry = state.lifeJournal.at(-1);
    if (!entry || entry.step !== state.step) throw new Error('本节点没有生活选择记录');
    // A marriage or separation may change the available options immediately.
    // Result screens must retain the scene in which the decision was made.
    return { ...getLifeScene({
      ...state, phase: 'life', life: entry.lifeBefore, stats: entry.statsBefore,
      ...(entry.lifeCourseBefore ? { lifeCourse: { ...state.lifeCourse, ...entry.lifeCourseBefore } } : {}),
      lifeJournal: state.lifeJournal.slice(0, -1), lifeEvidence: state.lifeEvidence.slice(0, -1),
      ...(isChoicePlanGame(state) ? { supplementJournal: state.supplementJournal.filter(item => item.step !== state.step || item.phase !== 'life') } : {}),
      lastResult: null,
    }), chapter: Math.floor(state.step / 2) };
  }
  return state.phase === 'life'
    ? { ...getLifeScene(state), chapter: Math.floor(state.step / 2) } : getCareerScene(careerInput(state));
}

function lifeOption(state, optionId) {
  const scene = getScene(state);
  const option = scene.options.find(item => item.id === optionId);
  if (!option) throw new Error('找不到当前阶段的选项');
  return { scene, option };
}

function fundsRequired(option) {
  return Math.max(0, -(option.cost?.money ?? 0)) + Math.max(0, -(option.effects?.money ?? 0));
}

function lifeUnavailableReason(state, option) {
  if (state.elapsedMs >= ACTIVE_LIMIT_MS) return TIME_LIMIT_REASON;
  if (state.stats.money < fundsRequired(option)) return `资金不足，需要 ${fundsRequired(option)} 点资金`;
  return '';
}

function applyEffects(stats, ...changes) {
  return Object.fromEntries(Object.entries(stats).map(([key, value]) => [
    key, clamp(value + changes.reduce((sum, change) => sum + (change?.[key] ?? 0), 0), 0, 100),
  ]));
}

function delta(before, after) {
  return Object.fromEntries(Object.keys(before).filter(key => before[key] !== after[key])
    .map(key => [key, after[key] - before[key]]));
}

function previewSingleChoice(state, optionId) {
  if (!['life', 'prep', 'choice'].includes(state.phase)) throw new Error('当前阶段不能做选择');
  if (state.phase !== 'life') {
    const preview = career.previewChoice(careerInput(state), optionId);
    const ready = state.elapsedMs >= ACTIVE_LIMIT_MS
      ? { ...preview, available: false, reason: TIME_LIMIT_REASON } : preview;
    if (!isDynamicGame(state)) return ready;
    const scene = getScene(state);
    const option = (state.phase === 'prep' ? scene.prep : scene.choices).find(item => item.id === optionId);
    return { ...ready, lifeImpact: previewLifeImpact(state, option, scene) };
  }
  const { option } = lifeOption(state, optionId);
  const reason = lifeUnavailableReason(state, option);
  const effects = delta(state.stats, applyEffects(state.stats, option.cost, option.effects));
  const modifiers = ['生活安排按你的选择发生，不抽取婚恋或育儿的胜负。'];
  if (fundsRequired(option)) modifiers.push(`这项安排需要 ${fundsRequired(option)} 点资金`);
  if (effects.energy || effects.stress) modifiers.push('精力和压力会影响接下来事业决策的风险概率。');
  if (option.tradeoff) modifiers.push(option.tradeoff);
  return {
    available: !reason, reason, probabilities: [1], effects, modifiers,
    outcomes: [{ label: option.label || '生活安排已记下', text: option.text || option.consequence || option.description, effects: {} }],
    ...(isDynamicGame(state) ? { lifeImpact: previewLifeImpact(state, option, getScene(state)) } : {}),
  };
}

const optionsAt = (state, scene) => state.phase === 'life' ? scene.options : state.phase === 'prep' ? scene.prep : scene.choices;

export function getChoicePlan(state) {
  if (!['life', 'prep', 'choice'].includes(state.phase)) return { enabled: false, phase: state.phase,
    budget: 0, maxSelections: isChoicePlanGame(state) ? 3 : 1, options: [] };
  const scene = getScene(state);
  const plan = buildChoicePlan(state, scene);
  return { ...plan, options: plan.options.map(option => {
    if (option.kind === 'primary') {
      const preview = previewSingleChoice(state, option.id);
      const selected = resolveChoicePlan(state, [option.id], plan, optionsAt(state, scene));
      return { ...option, available: preview.available && (!isChoicePlanGame(state) || selected.available),
        reason: preview.reason || (isChoicePlanGame(state) ? selected.reason : '') };
    }
    const money = Math.max(0, -(option.cost?.money || 0));
    const energy = Math.max(0, -(option.cost?.energy || 0));
    const reason = state.elapsedMs >= ACTIVE_LIMIT_MS ? TIME_LIMIT_REASON : state.stats.money < money
      ? `资金不足，需要 ${money} 点资金` : state.stats.energy < energy ? `精力不足，需要 ${energy} 点精力` : '';
    return { ...option, available: !reason, reason };
  }) };
}

// Optional arrangements are paid from the original balance before the main
// result. Their benefits arrive after that result. Main probabilities continue
// to use the original state; a last-minute extra cannot reroll the main risk.
function planResourceResult(state, primary, extras, outcomeIndex) {
  let reserved = { ...state.stats };
  const receipts = extras.map(item => {
    const next = applyEffects(reserved, item.cost);
    const effects = delta(reserved, next);
    reserved = next;
    return { id: item.id, title: item.title, kind: 'extra', points: item.points,
      actor: item.actor, text: item.text, effects };
  });
  const afterOption = applyEffects(reserved, primary.cost, primary.effects);
  const afterOutcome = state.phase === 'choice' && outcomeIndex >= 0
    ? applyEffects(afterOption, primary.outcomes[outcomeIndex]?.effects) : afterOption;
  const afterPrimary = state.phase === 'choice' ? applyEffects(afterOutcome, { energy: -3 }) : afterOutcome;
  let stats = afterPrimary;
  extras.forEach((item, index) => {
    const next = applyEffects(stats, item.effects);
    const benefit = delta(stats, next);
    receipts[index].effects = Object.fromEntries([...new Set([...Object.keys(receipts[index].effects), ...Object.keys(benefit)])]
      .map(key => [key, (receipts[index].effects[key] || 0) + (benefit[key] || 0)]).filter(([, value]) => value));
    stats = next;
  });
  return { stats, reserved, afterOutcome, afterPrimary, receipts, primaryEffects: delta(reserved, afterPrimary) };
}

export function previewChoices(state, ids) {
  if (!['life', 'prep', 'choice'].includes(state.phase)) throw new Error('当前阶段不能做选择');
  const scene = getScene(state), plan = buildChoicePlan(state, scene);
  const selected = resolveChoicePlan(state, ids, plan, optionsAt(state, scene));
  const { primary, primaries = [], compatibility, extras = [], items, ...summary } = selected;
  const decorated = items.map(item => ({ id: item.id, title: item.title, kind: item.kind,
    preview: item.kind === 'primary' ? previewSingleChoice(state, item.id) : {
      available: state.stats.money >= Math.max(0, -(item.cost?.money || 0)) && state.stats.energy >= Math.max(0, -(item.cost?.energy || 0)),
      reason: '', probabilities: [1], effects: delta(state.stats, applyEffects(state.stats, item.cost, item.effects)),
      outcomes: [], modifiers: [item.description],
    } }));
  if (!primary) return { ...summary, effects: {}, probabilities: [], outcomes: [], modifiers: [], items: decorated };
  const paired = primaries.length === 2;
  if (paired && !compatibility.compatible) return { ...summary, effects:{}, probabilities:[], outcomes:[], modifiers:[], items:decorated };
  const composite = paired ? buildCombinedChoice(state, primaries, primaries.map(item => previewSingleChoice(state, item.id)), compatibility) : primary;
  const single = paired ? { ...career.previewCombinedCareerChoice(careerInput(state), composite),
    ...(isDynamicGame(state) ? {lifeImpact:previewLifeImpact(state, composite, scene)} : {}) }
    : previewSingleChoice(state, primary.id);
  if (!isChoicePlanGame(state) && !paired) return { ...single, ...summary, available: single.available,
    reason: single.reason, items: decorated };
  const baseline = planResourceResult(state, composite, extras, -1);
  const outcomes = single.outcomes.map((outcome, index) => ({ ...outcome,
    effects: state.phase === 'choice' ? delta(baseline.stats, planResourceResult(state, composite, extras, index).stats) : outcome.effects,
  }));
  const modifiers = [...single.modifiers, `本组占用 ${selected.points}/${plan.budget} 点行动额度；最多 ${plan.maxSelections} 项。`];
  if (paired) modifiers.push('两项决定各占一半权重，共用一次结果档位；投入先从现有余量预留。');
  if (extras.length) modifiers.push('补充安排先预留资金与精力，完成后的恢复和收入不能支付同批投入；主要风险只按主决定结算一次。');
  let lifeImpact = single.lifeImpact;
  if (isDynamicGame(state) && extras.length) {
    const deterministic = state.phase === 'choice' && single.probabilities.length === 1;
    const target = deterministic ? planResourceResult(state, composite, extras, 0) : baseline;
    const projected = applyLifeDynamics(state, { ...state, stats: target.stats,
      // Keep the decision phase here: preview never resolves accumulated events.
      phase: state.phase, lastResult: { outcomeIndex: deterministic ? 0 : -1 } }, mergePlanImpact(composite, extras), scene);
    lifeImpact = { values: projected.impact.values, pressures: projected.impact.pressures, hint: single.lifeImpact?.hint || '' };
  }
  const timeReason = state.elapsedMs >= ACTIVE_LIMIT_MS ? TIME_LIMIT_REASON : '';
  return { ...single, ...summary, available: (paired || single.available) && selected.available && !timeReason,
    reason: timeReason || selected.reason || (paired ? '' : single.reason), effects: delta(state.stats, baseline.stats), outcomes, modifiers,
    ...(lifeImpact ? { lifeImpact } : {}), items: decorated };
}

export function previewChoice(state, optionId) {
  return isChoicePlanGame(state) ? previewChoices(state, [optionId]) : previewSingleChoice(state, optionId);
}

// Lifetime changes are committed with the same action as its ordinary result.
// Continue, refresh and report rendering never resolve a second event.
function applyDynamicResult(before, next, option, scene) {
  if (!isDynamicGame(before)) return next;
  const resolved = applyLifeDynamics(before, next, option, scene);
  const adjusted = { ...next, stats: resolved.stats, lifeCourse: resolved.lifeCourse };
  const feedback = option.combination ? option.combination.options.map(part => {
    const index = part.outcomes.length === 1 ? 0 : next.lastResult.outcomeIndex;
    const component = { ...adjusted, lastResult:{...adjusted.lastResult, outcomeIndex:index,
      title:part.title, label:part.outcomes[index].label, text:part.outcomes[index].text} };
    return getContinuityFeedback(before, component, part, scene) || getWorldFeedback(before, component, part, scene);
  }) : null;
  const joined = feedback ? {
    environment:[...new Set(feedback.map(item => item?.environment).filter(Boolean))].join(' '),
    reactions:feedback.flatMap(item => item?.reactions || []).filter((item, index, all) =>
      all.findIndex(other => other.speaker === item.speaker && other.text === item.text) === index),
  } : null;
  let impact = { ...resolved.impact, ...(joined || getContinuityFeedback(before, adjusted, option, scene) || getWorldFeedback(before, adjusted, option, scene)) };
  if (isChoicePlanGame(before)) impact = enrichLifeFeedback(before, adjusted, option, scene, impact);
  const effects = delta(before.stats, adjusted.stats);
  adjusted.lastResult = { ...next.lastResult, effects, impact };
  if (before.phase === 'life') {
    adjusted.lifeJournal = [...next.lifeJournal.slice(0, -1), {
      ...next.lifeJournal.at(-1), effects, impact,
      lifeCourseBefore: { values: { ...before.lifeCourse.values }, pressures: { ...before.lifeCourse.pressures } },
    }];
  } else if (before.phase === 'choice') {
    adjusted.journal = [...next.journal.slice(0, -1), { ...next.journal.at(-1), effects, impact,
      ...(before.continuityEdition === CONTINUITY_EDITION ? { outcomeIndex: next.lastResult.outcomeIndex,
        optionId: option.combination?.primaryIds[0] || option.id } : {}),
    }];
  } else if (before.phase === 'prep' && isChoicePlanGame(before)) {
    adjusted.preparationJournal = [...next.preparationJournal.slice(0, -1), { ...next.preparationJournal.at(-1), effects, impact }];
  }
  if (Object.keys(delta(next.stats, adjusted.stats)).length) {
    const point = { label: '后续变化落定', score: career.getSituation(adjusted.stats).score };
    if (before.phase === 'choice') {
      const last = next.candles.at(-1);
      const points = [...last.points, point];
      const { score: close, ...components } = career.getSituation(adjusted.stats);
      adjusted.candles = [...next.candles.slice(0, -1), {
        ...last, points, close, components,
        high: Math.max(...points.map(item => item.score)), low: Math.min(...points.map(item => item.score)),
      }];
    } else adjusted.candlePoints = [...next.candlePoints, point];
  }
  return adjusted;
}

function attachPlanResult(before, next, option, scene, selection) {
  const resources = planResourceResult(before, option, selection.extras, next.lastResult.outcomeIndex);
  const primary = { id: option.id, title: option.title, kind: 'primary', points: 1,
    text: next.lastResult.text, effects: resources.primaryEffects };
  const pair = option.combination;
  const plan = { ids: [...selection.ids], primaryId: pair?.primaryIds[0] || option.id,
    ...(pair ? { primaryIds:[...pair.primaryIds], weights:[...pair.weights], ruleId:pair.ruleId } : {}),
    points: selection.points, budget: selection.budget,
    required: { ...selection.required }, items: [...(pair ? combinedReceipts(option, next.lastResult.outcomeIndex) : [primary]), ...resources.receipts] };
  const effects = delta(before.stats, resources.stats);
  const supplementJournal = [...(before.supplementJournal || []), ...resources.receipts.map(item => ({
    step: before.step, year: scene.year, phase: before.phase, optionId: item.id,
    title: item.title, text: item.text, actor: item.actor, effects: { ...item.effects },
  }))];
  const adjusted = { ...next, stats: resources.stats,
    ...(isChoicePlanGame(before) ? {supplementJournal} : {}),
    lastResult: { ...next.lastResult, effects, plan } };
  if (before.phase === 'life') adjusted.lifeJournal = [...next.lifeJournal.slice(0, -1), {
    ...next.lifeJournal.at(-1), effects, plan,
  }];
  if (before.phase === 'choice') adjusted.journal = [...next.journal.slice(0, -1), {
    ...next.journal.at(-1), effects, plan,
  }];
  if (before.phase === 'prep') adjusted.preparationJournal = [...before.preparationJournal, {
    step: before.step, year: scene.year, title: scene.title, choiceTitle: option.title, optionId: option.id,
    resultText: next.lastResult.text, effects, plan,
  }];
  if (selection.extras.length) {
    const point = (label, stats) => ({ label, score: career.getSituation(stats).score });
    const points = [...before.candlePoints, point('补充安排投入', resources.reserved),
      point(before.phase === 'life' ? '生活主安排后' : before.phase === 'prep' ? '主要准备后' : '主要决定后', resources.afterOutcome)];
    if (before.phase === 'choice') points.push(point('时间成本后', resources.afterPrimary));
    points.push(point('补充安排完成', resources.stats));
    if (before.phase === 'choice') {
      const { score: close, ...components } = career.getSituation(resources.stats);
      adjusted.candles = [...next.candles.slice(0, -1), { ...next.candles.at(-1), points, close, components,
        high: Math.max(...points.map(item => item.score)), low: Math.min(...points.map(item => item.score)) }];
    } else adjusted.candlePoints = points;
  }
  return adjusted;
}

function finishChoice(before, next, option, scene, selection) {
  const planned = selection ? attachPlanResult(before, next, option, scene, selection) : next;
  const dynamicOption = selection ? mergePlanImpact(option, selection.extras) : option;
  return recordAction(before, applyDynamicResult(before, planned, dynamicOption, scene), {
    type: 'choice', optionId: option.combination?.primaryIds[0] || option.id, ...(selection ? { optionIds: [...selection.ids] } : {}),
  });
}

function recordAction(before, after, action) {
  return {
    ...after, version: VERSION,
    actions: [...before.actions, {
      ...action, phase: before.phase, step: before.step,
      elapsedMs: Math.min(before.elapsedMs, ACTIVE_LIMIT_MS),
    }],
  };
}

function commitSingleChoice(state, optionId, selection = null) {
  if (!['life', 'prep', 'choice'].includes(state.phase)) throw new Error('当前阶段不能做选择');
  if (state.elapsedMs >= ACTIVE_LIMIT_MS) return endEarly(state, TIME_LIMIT_REASON);
  if (state.phase !== 'life') {
    const scene = getScene(state);
    const option = (state.phase === 'prep' ? scene.prep : scene.choices).find(item => item.id === optionId);
    const next = career.commitChoice(careerInput(state), optionId);
    return finishChoice(state, { ...next, life: state.life, elapsedMs: state.elapsedMs }, option, scene, selection);
  }
  if (state.lifeJournal.some(entry => entry.step === state.step)) throw new Error('本节点的生活选择已经完成');
  const { scene, option } = lifeOption(state, optionId);
  const preview = previewSingleChoice(state, optionId);
  if (!preview.available) throw new Error(preview.reason);
  const stats = applyEffects(state.stats, option.cost, option.effects);
  const life = { ...state.life, ...clone(option.set || {}) };
  const text = option.text || option.consequence || option.description;
  const label = option.label || '生活安排已记下';
  const fact = clone(scene.fact || { text: '生活对话和个人选择为游戏创作。', sourceIds: [] });
  const limited = scene.options.filter(item => !lifeUnavailableReason(state, item)).length === 1;
  const evidence = {
    step: state.step, phase: 'life', optionId, year: scene.year, choiceTitle: option.title,
    context: `${scene.title} · 生活选择${limited ? ' · 资金限制下仅此项可选，本条证据降权' : ''}`,
    traits: (option.traits || []).map(({ dim, d, w = 1 }) => ({ dim, d, w: w * (limited ? 0.5 : 1) })),
  };
  const entry = {
    step: state.step, year: scene.year, title: scene.title, choiceTitle: option.title,
    optionId, resultText: text, label, effects: preview.effects, set: clone(option.set || {}),
    ...(option.tradeoff ? { tradeoff: option.tradeoff } : {}),
    ...(option.consequence ? { consequence: option.consequence } : {}),
    lifeBefore: clone(state.life), lifeAfter: clone(life), statsBefore: { ...state.stats }, fact,
  };
  const lastResult = {
    kind: 'life', title: option.title, text, label, quality: 'personal',
    effects: preview.effects, probabilities: [1], outcomeIndex: 0,
    sceneTitle: scene.title, year: scene.year, fact, alternate: true,
    ...(scene.echo ? { echo: scene.echo } : {}),
  };
  const next = {
    ...state, phase: 'life-result', life, stats, lastResult,
    lifeJournal: [...state.lifeJournal, entry], lifeEvidence: [...state.lifeEvidence, evidence],
    // Retain the old chart data only for consumers of the compatibility fields.
    // The report's life portrait does not derive an overall life score from it.
    candlePoints: [...state.candlePoints, { label: '生活安排后', score: career.getSituation(stats).score }],
  };
  return finishChoice(state, next, option, scene, selection);
}

export function commitChoices(state, ids) {
  if (!['life', 'prep', 'choice'].includes(state.phase)) throw new Error('当前阶段不能做选择');
  if (state.elapsedMs >= ACTIVE_LIMIT_MS) return endEarly(state, TIME_LIMIT_REASON);
  const preview = previewChoices(state, ids);
  if (!preview.available) throw new Error(preview.reason);
  const scene = getScene(state), plan = buildChoicePlan(state, scene);
  const selected = resolveChoicePlan(state, ids, plan, optionsAt(state, scene));
  if (selected.primaries.length === 2) {
    const activated = enableCombinationChoices(state);
    const option = buildCombinedChoice(activated, selected.primaries,
      selected.primaries.map(item => previewSingleChoice(activated, item.id)), selected.compatibility);
    const next = career.commitCombinedCareerChoice(careerInput(activated), option);
    return finishChoice(activated, {...next, life:activated.life, elapsedMs:activated.elapsedMs}, option, scene, selected);
  }
  if (!isChoicePlanGame(state)) return commitSingleChoice(state, preview.primaryId);
  return commitSingleChoice(state, selected.primaryId, selected);
}

// Activation is an explicit, replayable boundary. Merely viewing a plan or
// submitting one old decision does not change an existing save's contract.
export function enableCombinationChoices(state) {
  if (isCombinationGame(state)) return state;
  if (state.phase !== 'choice') throw new Error('只有事业决定阶段可以启用组合');
  if (state.elapsedMs >= ACTIVE_LIMIT_MS) throw new Error(TIME_LIMIT_REASON);
  return recordAction(state, {...state, combinationEdition:COMBINATION_EDITION}, {type:'enable-combinations'});
}

export function commitChoice(state, optionId) {
  return isChoicePlanGame(state) ? commitChoices(state, [optionId]) : commitSingleChoice(state, optionId);
}

export function continueGame(state) {
  if (!['life-result', 'result'].includes(state.phase)) throw new Error('只有结算完成后才能继续');
  const finished = state.phase === 'result' && state.step === getStepCount(state) - 1;
  if (!finished && state.elapsedMs >= ACTIVE_LIMIT_MS) return endEarly(state, TIME_LIMIT_REASON);
  if (state.phase === 'life-result') {
    return recordAction(state, { ...state, phase: 'prep', lastResult: null }, { type: 'continue' });
  }
  const next = career.continueGame(careerInput(state));
  return recordAction(state, {
    ...next, life: state.life, phase: next.phase === 'prep' ? 'life' : next.phase,
    elapsedMs: Math.min(state.elapsedMs, ACTIVE_LIMIT_MS),
  }, { type: 'continue' });
}

export function endEarly(state, reason = '主动收束') {
  if (state.phase === 'ended') return state;
  const endReason = cleanText(reason, 80) || '主动收束';
  return recordAction(state, {
    ...state, phase: 'ended', elapsedMs: Math.min(state.elapsedMs, ACTIVE_LIMIT_MS), endReason,
  }, { type: 'end', reason: endReason });
}

export function validateSave(raw) {
  try {
    if (typeof raw === 'string') {
      if (raw.length > 768000) return { ok: false, reason: '存档大小异常' };
      raw = JSON.parse(raw);
    }
    if (!plainRecord(raw)) return { ok: false, reason: '存档格式不正确' };
    const version = ownValue(raw, 'version');
    if (['1.1.0', career.VERSION].includes(version)) {
      const legacy = career.validateSave(raw);
      return legacy.ok ? { ok: true, state: migrateLegacy(legacy.state, version) } : legacy;
    }
    if (version !== VERSION) return { ok: false, reason: '存档版本不匹配' };
    const name = ownValue(raw, 'name');
    const seed = ownValue(raw, 'seed');
    const phase = ownValue(raw, 'phase');
    const step = ownValue(raw, 'step');
    const elapsedMs = ownValue(raw, 'elapsedMs');
    const actions = ownValue(raw, 'actions');
    const storyEdition = ownValue(raw, 'storyEdition');
    if (storyEdition !== undefined && storyEdition !== STORY_EDITION) return { ok: false, reason: '剧情版本不匹配' };
    const dynamicsEdition = ownValue(raw, 'dynamicsEdition');
    if (dynamicsEdition !== undefined && (dynamicsEdition !== DYNAMICS_EDITION || storyEdition !== STORY_EDITION)) return { ok: false, reason: '人生数值版本不匹配' };
    const continuityEdition = ownValue(raw, 'continuityEdition');
    if (continuityEdition !== undefined && (continuityEdition !== CONTINUITY_EDITION || dynamicsEdition !== DYNAMICS_EDITION)) return { ok: false, reason: '人物记忆版本不匹配' };
    const choicePlanEdition = ownValue(raw, 'choicePlanEdition');
    if (choicePlanEdition !== undefined && (choicePlanEdition !== CHOICE_PLAN_EDITION || continuityEdition !== CONTINUITY_EDITION)) return { ok: false, reason: '行动安排版本不匹配' };
    const combinationEdition = ownValue(raw, 'combinationEdition');
    if (combinationEdition !== undefined && combinationEdition !== COMBINATION_EDITION) return {ok:false, reason:'组合决定版本不匹配'};
    const stepCount = getStepCount({ storyEdition });
    if (!name || name !== cleanText(name, 32) || !PHASES.includes(phase)
      || !Number.isInteger(step) || step < 0 || step >= stepCount
      || !Array.isArray(actions) || actions.length > stepCount * 5 + 1 + Number(combinationEdition === COMBINATION_EDITION)
      || !Number.isFinite(elapsedMs) || elapsedMs < 0 || elapsedMs > ACTIVE_LIMIT_MS) {
      return { ok: false, reason: '存档的进度或基本资料不正确' };
    }
    let state;
    const legacyBase = ownValue(raw, 'legacyBase');
    if (legacyBase !== undefined) {
      const legacy = career.validateSave(legacyBase);
      const migration = ownValue(raw, 'migration');
      const sourceVersion = plainRecord(migration) && ownValue(migration, 'sourceVersion');
      if (!legacy.ok || !['1.1.0', career.VERSION].includes(sourceVersion)
        || !sameSave(legacyBase, legacy.state)) return { ok: false, reason: '旧版存档基础记录不正确' };
      state = migrateLegacy(legacy.state, sourceVersion);
    } else {
      state = createGame(name, seed, { storyEdition: storyEdition ?? null, dynamicsEdition: dynamicsEdition ?? null, continuityEdition: continuityEdition ?? null, choicePlanEdition: choicePlanEdition ?? null });
    }
    for (let index = 0; index < actions.length; index++) {
      const action = ownValue(actions, index);
      if (!plainRecord(action)) return { ok: false, reason: '存档的操作记录不完整' };
      const type = ownValue(action, 'type');
      const actionTime = ownValue(action, 'elapsedMs');
      if (!Number.isFinite(actionTime) || actionTime < state.elapsedMs || actionTime > elapsedMs
        || ownValue(action, 'phase') !== state.phase || ownValue(action, 'step') !== state.step) {
        return { ok: false, reason: '存档的操作次序或时间不正确' };
      }
      state = { ...state, elapsedMs: actionTime };
      if (type === 'choice') {
        const optionId = ownValue(action, 'optionId');
        if (typeof optionId !== 'string' || !optionId || optionId.length > 256) {
          return { ok: false, reason: '存档的选择记录不完整' };
        }
        if (choicePlanEdition === CHOICE_PLAN_EDITION || ownValue(action, 'optionIds') !== undefined) {
          const optionIds = ownValue(action, 'optionIds');
          if (!Array.isArray(optionIds) || optionIds.length < 1 || optionIds.length > 3
            || Array.from({ length: optionIds.length }, (_, itemIndex) => typeof ownValue(optionIds, itemIndex) !== 'string').some(Boolean)) return { ok: false, reason: '存档的整组安排记录不完整' };
          const safeIds = Array.from({ length: optionIds.length }, (_, itemIndex) => ownValue(optionIds, itemIndex));
          if (safeIds[0] !== optionId) return { ok: false, reason: '存档的主决定顺序不正确' };
          const scene = getScene(state);
          const mainIds = safeIds.filter(id => optionsAt(state, scene).some(option => option.id === id));
          if (mainIds.length > 1 && !isCombinationGame(state)) return {ok:false, reason:'组合决定缺少启用记录'};
          state = commitChoices(state, safeIds);
        } else state = commitChoice(state, optionId);
      } else if (type === 'enable-combinations') {
        if (combinationEdition !== COMBINATION_EDITION || isCombinationGame(state)) return {ok:false, reason:'组合决定启用记录不正确'};
        state = enableCombinationChoices(state);
      } else if (type === 'continue') {
        state = continueGame(state);
      } else if (type === 'end') {
        const reason = ownValue(action, 'reason');
        if (typeof reason !== 'string' || !reason || reason !== cleanText(reason, 80)) {
          return { ok: false, reason: '存档的收束记录不正确' };
        }
        state = endEarly(state, reason);
      } else return { ok: false, reason: '存档包含未知操作' };
    }
    if (elapsedMs < state.elapsedMs || (state.phase === 'ended' && elapsedMs !== state.elapsedMs)) {
      return { ok: false, reason: '存档的活跃时间不正确' };
    }
    state = { ...state, elapsedMs };
    if (!sameSave(raw, state)) return { ok: false, reason: '存档与选择记录不一致' };
    if (state.phase !== 'ended' && elapsedMs === ACTIVE_LIMIT_MS) {
      state = state.phase === 'result' && state.step === getStepCount(state) - 1
        ? continueGame(state) : endEarly(state, TIME_LIMIT_REASON);
    }
    return { ok: true, state };
  } catch {
    return { ok: false, reason: '无法读取存档的选择记录' };
  }
}

export function getReport(state) {
  if (state.phase !== 'ended') throw new Error('游戏收束后才能查看报告');
  // Career evidence still contributes at most once per chapter/dimension. Life
  // decisions form a separate observation in that chapter, independent of luck.
  const lifeEvidence = state.lifeEvidence.map(entry => ({ ...entry, step: `life:${entry.step}` }));
  const report = career.getReport({ ...state, evidence: [...state.evidence, ...lifeEvidence] });
  const lifePortrait = getLifePortrait(state);
  const ifEpilogue = getIfEpilogue(state);
  return {
    ...report, ending: getFutureEnding(state, report.ending), lifePortrait, lifeTimeline: state.lifeJournal,
    ...(isDynamicGame(state) ? { lifeScore: getLifeScore(state) } : {}),
    ...(ifEpilogue ? { ifEpilogue } : {}),
    completedLifeSteps: state.lifeJournal.length,
    ...(isChoicePlanGame(state) ? { supplementTimeline: state.supplementJournal, preparationTimeline: state.preparationJournal } : {}),
    lifeDecisionCount: state.lifeEvidence.length, careerDecisionCount: career.evidenceDecisionCount(state.evidence),
    allTimeline: [
      ...state.lifeJournal.map(entry => ({ ...entry, domain: 'life' })),
      ...state.journal.map(entry => ({ ...entry, domain: 'career' })),
    ].sort((a, b) => a.step - b.step || Number(a.domain === 'career') - Number(b.domain === 'career')),
    ...(state.migration ? { migrationNote: MIGRATION_NOTE } : {}),
  };
}
