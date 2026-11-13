import { DIMENSIONS, getScene } from './content.mjs';
import { getStepCount } from './story-timeline.mjs';

export const VERSION = '1.2.0';
export const ACTIVE_LIMIT_MS = 26 * 60 * 1000;

const STEP_COUNT = 12;
const NODE_COST = { energy: -3 };
const TIME_LIMIT_REASON = '达到26分钟活跃游玩上限';
const INITIAL_STATS = {
  energy: 72, stress: 25, bonds: 58, money: 50, engineering: 40,
  communication: 40, leadership: 35, ecosystem: 0, reputation: 30, control: 80,
};
const STAT_NAMES = {
  energy: '精力', stress: '压力', bonds: '关系', money: '资金', engineering: '工程',
  communication: '沟通', leadership: '领导力', ecosystem: '生态', reputation: '声誉', control: '控制权',
};
const STAT_KEYS = Object.keys(INITIAL_STATS);
const ROUTES = {
  student: '求学', employee: '职业', company: '创业', studio: '工作室',
  researcher: '研究与教学', sold: '出售公司后的生活',
};
const PHASES = ['prep', 'choice', 'result', 'ended'];
const QUALITY = ['good', 'mixed', 'bad'];
const PREPARATION_BONUSES = {
  engineering: [
    { tags: ['evidence'], label: '本轮验证准备', bonus: 0.08 },
    { tags: ['prototype'], label: '本轮原型准备', bonus: 0.06 },
  ],
  communication: [
    { tags: ['ask', 'listen'], label: '本轮求援或倾听准备', bonus: 0.06 },
  ],
  leadership: [
    { tags: ['plan'], label: '本轮计划准备', bonus: 0.04 },
  ],
};

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return Array.from(value.slice(0, maxLength * 4)
    .replace(/[\p{Cc}\u202a-\u202e\u2066-\u2069]/gu, '').trim()).slice(0, maxLength).join('');
}

function validSeed(seed) {
  return Number.isSafeInteger(seed)
    || (typeof seed === 'string' && seed.length > 0 && seed.length <= 128
      && !/\p{Cc}/u.test(seed));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getSituation(stats) {
  const resources = stats.money;
  const career = (Math.max(stats.engineering, stats.leadership) + stats.reputation) / 2;
  const relationships = stats.bonds;
  const sustainability = (stats.energy + 100 - stats.stress) / 2;
  const score = (resources + career + relationships + sustainability) / 4;
  return {
    score: Math.round(score * 10) / 10, resources, career, relationships, sustainability,
  };
}

function situationPoint(label, stats) {
  return { label, score: getSituation(stats).score };
}

export function createGame(name, seed = 0) {
  if (!validSeed(seed)) throw new TypeError('种子须为安全整数或不超过128字的非空字符串');
  const stats = { ...INITIAL_STATS };
  return {
    version: VERSION, name: cleanText(name, 32) || '黄二勋', seed,
    step: 0, phase: 'prep', route: 'student', stats,
    flags: {}, prepTags: [], journal: [], evidence: [], elapsedMs: 0, lastResult: null,
    candles: [], candlePoints: [situationPoint('节点开始', stats)],
  };
}

function statChanges(stats, ...changes) {
  return Object.fromEntries(STAT_KEYS.map(key => [
    key, clamp(stats[key] + changes.reduce((sum, change) => sum + (change?.[key] ?? 0), 0), 0, 100),
  ]));
}

function statDelta(before, after) {
  const effects = {};
  for (const key of STAT_KEYS) {
    if (before[key] !== after[key]) effects[key] = after[key] - before[key];
  }
  return effects;
}

function isAffordable(stats, option) {
  return stats.money >= -(option.cost?.money ?? 0);
}

function activeOptions(state, scene) {
  if (state.phase === 'prep') return scene.prep;
  if (state.phase === 'choice') return scene.choices;
  throw new Error('当前阶段不能做选择');
}

function findOption(state, scene, optionId) {
  const option = activeOptions(state, scene).find(item => item.id === optionId);
  if (!option) throw new Error('找不到当前阶段的选项');
  return option;
}

function percent(value) {
  return (value * 100).toFixed(1).replace(/\.0$/, '');
}

function preparationBonus(stat, tags) {
  // Entries are strongest first, so overlapping tags never stack.
  return PREPARATION_BONUSES[stat]?.find(preparation => preparation.tags.some(tag => tags.includes(tag)));
}

function riskProbabilities(check, state, modifiers = []) {
  const { stats, prepTags } = state;
  let success = check.base;
  modifiers.push(`基础顺利概率 ${percent(check.base)}%`);
  const adjustments = [];
  if (check.stat) {
    const distance = stats[check.stat] - 50;
    adjustments.push([STAT_NAMES[check.stat], (check.stat === 'stress' ? -distance : distance) * 0.003]);
  }
  if (check.kind === 'sega') {
    if (check.stat !== 'bonds') adjustments.push(['世嘉谈判的关系基础', (stats.bonds - 50) * 0.002]);
    if (check.stat !== 'stress') adjustments.push(['世嘉谈判的压力', (50 - stats.stress) * 0.002]);
  }
  const preparation = preparationBonus(check.stat, prepTags);
  if (preparation) adjustments.push([preparation.label, preparation.bonus]);
  if (stats.energy < 30) adjustments.push([`精力低于 30（当前 ${stats.energy}）`, -0.08]);
  if (stats.stress >= 70 && check.kind !== 'sega') {
    adjustments.push([`压力达到 70 或以上（当前 ${stats.stress}）`, -0.08]);
  }
  for (const [label, delta] of adjustments) {
    success += delta;
    modifiers.push(`${label} ${delta >= 0 ? '+' : '−'}${percent(Math.abs(delta))} 个百分点`);
  }
  const bounded = clamp(success, 0.05, 0.9);
  modifiers.push(success === bounded
    ? '风险选项的顺利概率最低 5%、最高 90%'
    : `合计 ${percent(success)}%，按 5%–90% 的范围调整为 ${percent(bounded)}%`);
  success = bounded;
  modifiers.push('未顺利的概率按 55% 勉强、45% 失利分配，再按千分位结算');

  const good = Math.round(success * 1000);
  const remaining = 1000 - good;
  const mixed = Math.round(remaining * 0.55);
  const first = good / 1000;
  const second = mixed / 1000;
  const third = (remaining - mixed) / 1000;
  // Close floating-point roundoff without shifting any per-mille bucket.
  return [first, second, first + second + third === 1 ? third : 1 - (first + second)];
}

function previewOption(state, option) {
  const available = isAffordable(state.stats, option) && state.elapsedMs < ACTIVE_LIMIT_MS;
  const modifiers = [];
  if (option.cost?.money) modifiers.push(`选择需要 ${-option.cost.money} 点资金`);
  const afterOption = statChanges(state.stats, option.cost, option.effects);
  if (state.phase === 'prep') {
    for (const stat of Object.keys(PREPARATION_BONUSES)) {
      const preparation = preparationBonus(stat, option.prepTags ?? []);
      if (preparation) {
        modifiers.push(`${preparation.label}使本轮${STAT_NAMES[stat]}类风险选项的顺利概率 +${percent(preparation.bonus)} 个百分点，同类准备取最高项`);
      }
    }
    return {
      available, reason: unavailableReason(state, option), probabilities: [1],
      effects: statDelta(state.stats, afterOption), modifiers, outcomes: [],
    };
  }

  const afterTime = statChanges(afterOption, NODE_COST);
  const probabilities = option.combination?.probabilities ?? (option.check ? riskProbabilities(option.check, state, modifiers) : [1]);
  modifiers.push('本节点结束消耗 3 点精力，最低降至 0');
  const outcomes = option.outcomes.map(outcome => ({
    ...outcome,
    ...(outcome.flags && { flags: [...outcome.flags] }),
    effects: statDelta(afterTime, statChanges(statChanges(afterOption, outcome.effects), NODE_COST)),
  }));
  return {
    available, reason: unavailableReason(state, option), probabilities,
    effects: statDelta(state.stats, afterTime), modifiers, outcomes,
  };
}

function unavailableReason(state, option) {
  if (state.elapsedMs >= ACTIVE_LIMIT_MS) return TIME_LIMIT_REASON;
  if (!isAffordable(state.stats, option)) return `资金不足，需要 ${-option.cost.money} 点资金`;
  return '';
}

export function previewChoice(state, optionId) {
  if (!['prep', 'choice'].includes(state.phase)) throw new Error('当前阶段不能做选择');
  return previewOption(state, findOption(state, getScene(state), optionId));
}

export function previewCombinedCareerChoice(state, option) {
  if (state.phase !== 'choice' || !option.combination) throw new Error('当前没有可预览的事业组合');
  return previewOption(state, option);
}

function rollPerMille(seed, step) {
  const key = JSON.stringify([seed, step]);
  let hash = 2166136261;
  for (let index = 0; index < key.length; index++) {
    hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
  }
  // Rejection avoids giving any per-mille bucket an extra 32-bit value.
  for (;;) {
    hash = (hash + 0x9e3779b9) | 0;
    let sample = Math.imul(hash ^ (hash >>> 16), 0x21f0aaad);
    sample = Math.imul(sample ^ (sample >>> 15), 0x735a2d97);
    sample = (sample ^ (sample >>> 15)) >>> 0;
    if (sample < 4294967000) return sample % 1000;
  }
}

function outcomeFor(state, probabilities) {
  if (probabilities.length === 1) return 0;
  const roll = rollPerMille(state.seed, state.step);
  let cutoff = 0;
  for (let index = 0; index < probabilities.length; index++) {
    cutoff += Math.round(probabilities[index] * 1000);
    if (roll < cutoff) return index;
  }
  throw new Error('结果概率不完整');
}

function withFlags(flags, ...additions) {
  return { ...flags, ...Object.fromEntries(additions.flat().map(flag => [flag, true])) };
}

function makeEvidence(state, scene, option) {
  const limited = activeOptions(state, scene).filter(item => isAffordable(state.stats, item)).length === 1;
  const stage = state.phase === 'prep' ? '准备' : '重大决策';
  return {
    step: state.step, phase: state.phase, optionId: option.id, year: scene.year, choiceTitle: option.title,
    context: `${scene.title} · ${stage}${limited ? ' · 资金限制下仅此项可选，本条证据降权' : ''}`,
    traits: option.traits.map(({ dim, d, w = 1 }) => ({ dim, d, w: w * (limited ? 0.5 : 1) })),
  };
}

function makeResult(scene, option, outcome, outcomeIndex, effects, probabilities, alternate) {
  return {
    title: option.title, text: outcome.text, label: outcome.label,
    quality: QUALITY[outcomeIndex], effects, probabilities, outcomeIndex,
    sceneTitle: scene.title, year: scene.year,
    ...(scene.echo && { echo: scene.echo }),
    fact: { ...scene.fact, sourceIds: [...scene.fact.sourceIds] },
    alternate,
  };
}

export function commitChoice(state, optionId) {
  if (!['prep', 'choice'].includes(state.phase)) throw new Error('当前阶段不能做选择');
  if (state.elapsedMs >= ACTIVE_LIMIT_MS) return endEarly(state, TIME_LIMIT_REASON);
  const scene = getScene(state);
  const option = findOption(state, scene, optionId);
  return commitCareerOption(state, scene, option);
}

export function commitCombinedCareerChoice(state, option) {
  if (state.phase !== 'choice' || !option.combination) throw new Error('当前没有可提交的事业组合');
  if (state.elapsedMs >= ACTIVE_LIMIT_MS) return endEarly(state, TIME_LIMIT_REASON);
  return commitCareerOption(state, getScene(state), option);
}

function commitCareerOption(state, scene, option) {
  if (!isAffordable(state.stats, option)) throw new Error(unavailableReason(state, option));

  const receipts = option.combination ? option.combination.options.map((part, index) => ({
    ...makeEvidence(state, scene, part), combinationId:option.id, weight:option.combination.weights[index],
    traits:part.traits.map(({dim,d,w=1}) => ({dim,d,w:w*option.combination.weights[index]})),
  })) : [makeEvidence(state, scene, option)];
  const evidence = [...state.evidence, ...receipts];
  const afterOption = statChanges(state.stats, option.cost, option.effects);
  if (state.phase === 'prep') {
    const flags = withFlags(state.flags, option.flags ?? []);
    const lastResult = makeResult(scene, option, { text: option.description, label: '准备完成' }, 0,
      statDelta(state.stats, afterOption), [1], scene.alternate || flags.counterfactual === true);
    return {
      ...state, phase: 'choice', stats: afterOption, route: option.route ?? state.route,
      flags, prepTags: [...(option.prepTags ?? [])],
      evidence, lastResult, candlePoints: [...state.candlePoints, situationPoint('准备后', afterOption)],
    };
  }

  const probabilities = option.combination?.probabilities ?? (option.check ? riskProbabilities(option.check, state) : [1]);
  const outcomeIndex = outcomeFor(state, probabilities);
  const outcome = option.outcomes[outcomeIndex];
  const afterDecision = statChanges(afterOption, outcome.effects);
  const stats = statChanges(afterDecision, NODE_COST);
  const route = outcome.route ?? option.route ?? state.route;
  const flags = withFlags(state.flags, option.flags ?? [], outcome.flags ?? []);
  const alternate = scene.alternate || flags.counterfactual === true;
  const effects = statDelta(state.stats, stats);
  const lastResult = makeResult(scene, option, outcome, outcomeIndex, effects, probabilities, alternate);
  const entry = {
    step: state.step, year: scene.year, title: scene.title, choiceTitle: option.title,
    prepTitle: state.lastResult.title, resultText: outcome.text, label: outcome.label,
    effects, route, fact: lastResult.fact, alternate,
    ...(option.combination ? {optionId:option.combination.primaryIds[0],optionIds:[...option.combination.primaryIds]} : {}),
  };
  const points = [...state.candlePoints, situationPoint('重大决策后', afterDecision),
    situationPoint('时间成本后', stats)];
  const { score: close, ...components } = getSituation(stats);
  const scores = points.map(point => point.score);
  const candle = {
    step: entry.step, year: entry.year, title: entry.title, open: points[0].score,
    high: Math.max(...scores), low: Math.min(...scores), close,
    choiceTitle: entry.choiceTitle, resultText: entry.resultText, route, components, points,
  };

  return {
    ...state, phase: 'result', stats, route, flags, evidence, lastResult,
    journal: [...state.journal, entry], candles: [...state.candles, candle], candlePoints: [],
  };
}

export function continueGame(state) {
  if (state.phase !== 'result') throw new Error('只有结算完成后才能继续');
  if (state.step === getStepCount(state) - 1) {
    return { ...state, phase: 'ended', elapsedMs: Math.min(state.elapsedMs, ACTIVE_LIMIT_MS) };
  }
  if (state.elapsedMs >= ACTIVE_LIMIT_MS) return endEarly(state, TIME_LIMIT_REASON);
  return {
    ...state, phase: 'prep', step: state.step + 1, prepTags: [], lastResult: null,
    candlePoints: [situationPoint('节点开始', state.stats)],
  };
}

export function endEarly(state, reason = '主动收束') {
  if (state.phase === 'ended') return state;
  return {
    ...state, phase: 'ended', elapsedMs: Math.min(state.elapsedMs, ACTIVE_LIMIT_MS),
    endReason: cleanText(reason, 80) || '主动收束',
  };
}

// Compare against a replayed, trusted state. Inspect only own data properties so
// stale fields, unexpected keys and accessor-backed inputs cannot enter the game.
function ownValue(record, key) {
  return Object.getOwnPropertyDescriptor(record, key)?.value;
}

function plainRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function sameSave(actual, expected, legacy = false, path = '') {
  // v1.2 changes prose only. Replay v1.1 choice IDs with the same seed and verify
  // every mechanical field; discard old display copy instead of discarding progress.
  if (legacy && path === 'version') return actual === '1.1.0';
  if (legacy && /^(?:(?:journal|candles)\.\d+\.(?:year|title|choiceTitle|prepTitle|resultText|label|fact)|evidence\.\d+\.(?:year|choiceTitle|context)|lastResult\.(?:title|text|label|sceneTitle|year|echo|fact))$/.test(path)) {
    return typeof expected === 'string' ? typeof actual === 'string' : plainRecord(actual);
  }
  if (expected === null || typeof expected !== 'object') return actual === expected;
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length
      || Reflect.ownKeys(actual).length !== expected.length + 1) return false;
    return expected.every((value, index) => sameSave(ownValue(actual, index), value, legacy, `${path}.${index}`));
  }
  if (!plainRecord(actual) || Reflect.ownKeys(actual).length !== Object.keys(expected).length) return false;
  return Object.entries(expected).every(([key, value]) => sameSave(ownValue(actual, key), value, legacy, path ? `${path}.${key}` : key));
}

export function validateSave(raw) {
  try {
    if (typeof raw === 'string') {
      if (raw.length > 512000) return { ok: false, reason: '存档大小异常' };
      raw = JSON.parse(raw);
    }
    if (!plainRecord(raw)) return { ok: false, reason: '存档格式不正确' };
    const legacy = ownValue(raw, 'version') === '1.1.0';
    if (!legacy && ownValue(raw, 'version') !== VERSION) return { ok: false, reason: '存档版本不匹配' };
    const name = ownValue(raw, 'name');
    const seed = ownValue(raw, 'seed');
    const phase = ownValue(raw, 'phase');
    const step = ownValue(raw, 'step');
    const evidence = ownValue(raw, 'evidence');
    const elapsedMs = ownValue(raw, 'elapsedMs');
    const reason = ownValue(raw, 'endReason');
    if (!name || name !== cleanText(name, 32) || !validSeed(seed) || !PHASES.includes(phase)
      || !Number.isInteger(step) || step < 0 || step >= STEP_COUNT
      || !Array.isArray(evidence) || evidence.length > 2 * STEP_COUNT
      || !Number.isFinite(elapsedMs) || elapsedMs < 0 || elapsedMs > ACTIVE_LIMIT_MS) {
      return { ok: false, reason: '存档的进度或基本资料不正确' };
    }

    let state = createGame(name, seed);
    for (let index = 0; index < evidence.length; index++) {
      if (state.phase === 'result') state = continueGame(state);
      const receipt = ownValue(evidence, index);
      const optionId = plainRecord(receipt) && ownValue(receipt, 'optionId');
      if (typeof optionId !== 'string' || !optionId || optionId.length > 256) {
        return { ok: false, reason: '存档的选择记录不完整' };
      }
      state = commitChoice(state, optionId);
    }
    if (state.phase === 'result' && (phase === 'prep' || step === state.step + 1
      || (phase === 'ended' && reason === undefined))) {
      state = continueGame(state);
    }
    state = { ...state, elapsedMs };
    if (phase === 'ended' && reason !== undefined) state = endEarly(state, reason);

    if (!sameSave(raw, state, legacy)) return { ok: false, reason: '存档与选择记录不一致' };
    if (state.phase !== 'ended' && elapsedMs === ACTIVE_LIMIT_MS) {
      state = endEarly(state, TIME_LIMIT_REASON);
    }
    return { ok: true, state };
  } catch {
    return { ok: false, reason: '无法读取存档的选择记录' };
  }
}

const ENDINGS = {
  company: {
    id: 'company', title: '长跑仍在继续', subtitle: '经营独立公司',
    text: '你走完了经营一家公司的这一段。手记里留下的是你愿意坚持的方向，以及每次坚持所付出的代价。',
  },
  ecosystem: {
    id: 'ecosystem', title: '给后来者留一扇门', subtitle: '建设技术生态',
    text: '公司路线积累下来的生态，给外部伙伴留下了继续合作和开发的空间。接下来会长出什么，由使用这些工具的人决定。',
  },
  employee: {
    id: 'employee', title: '把问题一件件做完', subtitle: '职业工程路线',
    text: '这条职业路径把时间用在工程、交付和团队协作上。你的手记记录了哪些工作值得深挖，以及哪些时候适合收工。',
  },
  studio: {
    id: 'studio', title: '一张自己的工作台', subtitle: '独立工作室',
    text: '小规模工作给你机会选择手边的项目和节奏。沿途得失留在了你的手记里，下一份工作仍然可以慢慢挑。',
  },
  researcher: {
    id: 'researcher', title: '把问题交给下一届', subtitle: '研究与教学',
    text: '你选择把职业走向转入研究或教学。继续追问、积累证据、把经验交给后来的人，是这条路上的工作。',
  },
  sold: {
    id: 'sold', title: '签字之后还有生活', subtitle: '出售公司',
    text: '你作出了交接公司的选择。交易让公司进入下一段路，也把下一步如何安排时间的决定留给了你。',
  },
  life: {
    id: 'life', title: '今晚按时回家', subtitle: '把时间留给生活',
    text: '你在结尾选择给工作划一道边界。日历空出来的位置，可以由你留给亲近的人、休息和下一次想做的事。',
  },
};

function getEnding(state) {
  if (state.journal.length < getStepCount(state)) {
    return {
      id: 'early', title: '手记停在这里',
      subtitle: `${ROUTES[state.route]}路线 · 完成 ${state.journal.length} 个节点`,
      text: `${state.endReason || '本局收束'}。这次手记收录到这里发生的经历。`,
    };
  }
  if (state.flags.ending_balance) {
    return { ...ENDINGS.life, subtitle: `${ROUTES[state.route]}路线 · 把时间留给生活` };
  }
  const ending = state.route === 'company' && state.stats.ecosystem >= 50
    ? ENDINGS.ecosystem : (ENDINGS[state.route] ?? ENDINGS.life);
  if (state.flags.ending_handoff) {
    const status = state.flags.handoff_in_progress ? '分阶段交接中' : '日常决定已交接';
    return { ...ending, subtitle: `${ending.subtitle} · ${status}`, text: state.journal.at(-1).resultText };
  }
  return { ...ending };
}

function dimensionReport(dimension, evidence) {
  const observations = new Map();
  for (const receipt of evidence) {
    if (receipt.combinationId) {
      const combined = evidence.filter(item => item.step === receipt.step && item.combinationId === receipt.combinationId);
      const traits = combined.flatMap(item => item.traits.filter(trait => trait.dim === dimension.id));
      if (traits.length) {
        const w = traits.reduce((sum, trait) => sum + trait.w, 0);
        observations.set(receipt.step, { receipt:{...receipt,
          choiceTitle:combined.map(item => item.choiceTitle).join(' ＋ '),
          context:`${receipt.context} · 两项决定共同留下的观察`},
        trait:{dim:dimension.id,w,d:w ? traits.reduce((sum, trait) => sum + trait.w * trait.d, 0) / w : 0} });
      }
      continue;
    }
    const trait = receipt.traits.find(item => item.dim === dimension.id);
    if (trait && !observations.has(receipt.step)) observations.set(receipt.step, { receipt, trait });
  }
  const entries = [...observations.values()];
  const count = entries.length;
  const totalWeight = entries.reduce((sum, { trait }) => sum + trait.w, 0);
  const weightedSignal = entries.reduce((sum, { trait }) => sum + trait.w * trait.d, 0);
  let confidence = '未观察';
  if (count >= 3 && totalWeight >= 2.5) confidence = '充分';
  else if (count >= 2) confidence = '初步';
  else if (count === 1) confidence = '有限';
  return {
    ...dimension, score: count ? Math.round(50 + 50 * weightedSignal / (1 + totalWeight)) : null,
    count, confidence,
    receipts: entries.map(({ receipt }) => ({
      year: receipt.year, choiceTitle: receipt.choiceTitle, context: receipt.context,
    })),
  };
}

export function evidenceDecisionCount(evidence) {
  return new Set(evidence.map((entry, index) => entry.combinationId ? `${entry.step}:${entry.combinationId}` : index)).size;
}

// Per dimension: low/high modifiers, then low/high roles for a two-axis title.
const ARCHETYPE_WORDS = [
  ['揣着安全垫的', '一把推满的', '安全垫批发商', '押注队长'], // 梭哈浓度
  ['先把饭吃了的', '预约十年后的', '当日饭票管理员', '远期饭局召集人'], // 远期胃口
  ['自己造风的', '闻风就出门的', '小气候工程师', '风口气象员'], // 风口敏感度
  ['守到最后一班的', '先上救生艇的', '沉船值班员', '救生艇船长'], // 止损手速
  ['当场改口的', '等地球认错的', '改口速记员', '嘴硬维修员'], // 嘴硬厚度
  ['单机开荒的', '翻遍通讯录的', '单机冒险家', '摇人总机'], // 求援开口度
  ['凭直觉开箱的', '抱着实验报告的', '直觉试驾员', '证据仓库管理员'], // 证据胃口
  ['边走边改的', '按表开工的', '临场改图师', '流程焊接工'], // 计划黏性
  ['放心交钥匙的', '紧握方向盘的', '副驾体验官', '方向盘保管员'], // 方向盘占有欲
  ['按量接单的', '先答应再开会的', '承诺配额员', '日程扩建师'], // 承诺膨胀率
  ['照章办事的', '先安顿同伴的', '合同管理员', '人情后勤部长'], // 人情温度
  ['在机房潜水的', '扛着话筒的', '机房隐身人', '发布会驻场嘉宾'], // 镜头磁力
  ['下班就打卡的', '住在工位的', '下班打铃员', '工位常住居民'], // 内卷燃料
  ['红血还赶路的', '补满睡眠的', '红血冲刺手', '回血站站长'], // 回血自觉
  ['日历排满的', '准点回家的', '日历填格师', '晚饭保卫员'], // 生活留白
  ['复盘到天亮的', '转身开下一局的', '复盘夜班员', '下一局发牌员'], // 翻篇速度
];

function archetypeFor(dimensions, early) {
  const strongest = dimensions.filter(dimension => dimension.confidence === '充分')
    .sort((left, right) => Math.abs(right.score - 50) - Math.abs(left.score - 50) || left.id - right.id)
    .slice(0, 2);
  if (strongest.length < 2) {
    return {
      title: '画像观察中（暂定）',
      text: '目前充分观察的维度还不足两个，组合称号暂定。已发生的选择保留在逐维证据中。',
    };
  }
  const [first, second] = strongest;
  const modifier = first.score === 50 ? '在两头挪板凳的' : ARCHETYPE_WORDS[first.id][first.score > 50 ? 1 : 0];
  const role = second.score === 50 ? '中场调度员' : ARCHETYPE_WORDS[second.id][second.score > 50 ? 3 : 2];
  const basis = strongest.map(dimension => {
    const direction = dimension.score === 50 ? '两端均衡'
      : `偏向「${dimension.score > 50 ? dimension.high : dimension.low}」`;
    return `「${dimension.name}」${direction}，有 ${dimension.count} 条选择记录`;
  }).join('。');
  return {
    title: `${modifier}${role}${early ? '（暂定）' : ''}`,
    text: `${basis}。称号由这两个充分观察的维度组合。${early ? '本局提前收束，称号暂定。' : '画像描述本局的选择倾向。'}`,
  };
}

function highlightsFor(journal, evidence) {
  if (!journal.length) {
    return evidence.slice(0, 1).map(entry => ({
      title: `${entry.year} · ${entry.choiceTitle}`, text: entry.context,
    }));
  }
  const last = journal.length - 1;
  const entries = [...new Set([0, 4, 5, last].filter(index => index <= last))];
  return entries.map(index => ({
    title: `${journal[index].year} · ${journal[index].choiceTitle}`, text: journal[index].resultText,
  }));
}

export function getReport(state) {
  if (state.phase !== 'ended') throw new Error('游戏收束后才能查看报告');
  const dimensions = DIMENSIONS.map(dimension => dimensionReport(dimension, state.evidence));
  const early = state.journal.length < getStepCount(state);
  return {
    ending: getEnding(state), archetype: archetypeFor(dimensions, early), dimensions,
    highlights: highlightsFor(state.journal, state.evidence), timeline: state.journal,
    completedSteps: state.journal.length, decisionCount: evidenceDecisionCount(state.evidence),
    elapsedMs: state.elapsedMs, early, candles: state.candles,
  };
}
