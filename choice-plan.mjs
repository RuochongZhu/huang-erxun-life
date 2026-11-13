// A plan combines one main decision (or two reviewed career decisions) with
// small arrangements. No engine imports, random draws or mutations live here.
import { getPrimaryCompatibility, getCompatiblePrimaryPairs } from './choice-compatibility.mjs';
export const CHOICE_PLAN_EDITION = '2026.11.plans';
export const isChoicePlanGame = state => state?.choicePlanEdition === CHOICE_PLAN_EDITION;

const sum = (...records) => {
  const result = {};
  for (const record of records) for (const [key, value] of Object.entries(record || {})) {
    result[key] = (result[key] || 0) + value;
  }
  return result;
};
const spend = (option, key) => Math.max(0, -(option.cost?.[key] || 0))
  + Math.max(0, -(option.effects?.[key] || 0));
const extra = (id, title, description, points, cost, effects, text, actor = '你', lifeImpact = {}) => ({
  id, title, description, kind: 'extra', points, cost, effects, text, actor, lifeImpact,
});

export function buildChoicePlan(state, scene) {
  const active = ['life', 'prep', 'choice'].includes(state?.phase);
  const planned = isChoicePlanGame(state);
  const multiPrimary = active && state.phase === 'choice';
  const enabled = (planned || multiPrimary) && active;
  const options = active ? (state.phase === 'life' ? scene.options : state.phase === 'prep' ? scene.prep : scene.choices) : [];
  const primary = (options || []).map(option => ({
    id: option.id, title: option.title, description: option.description || '',
    kind: 'primary', points: 1, cost: { ...option.cost }, effects: { ...option.effects },
  }));
  const budget = planned ? (state.stats.energy < 25 || state.stats.stress >= 80 ? 2
    : state.stats.energy >= 65 && state.stats.stress < 45 ? 4 : 3) : multiPrimary ? 2 : 1;
  const limits = { multiPrimary, maxPrimary:multiPrimary ? 2 : 1,
    compatiblePairs:multiPrimary ? getCompatiblePrimaryPairs(state, scene) : [] };
  if (!planned) return { enabled, phase: state?.phase, year: scene?.year, budget,
    maxSelections:multiPrimary ? 2 : 1, options:primary, ...limits,
    rule:multiPrimary ? '可以选一项事业决定，或同时安排两项相容的决定；组合各占一半权重。' : '选择一项安排。' };
  const key = `plan-${scene.year}-${state.phase}-`;
  let extras;
  if (state.phase === 'life') {
    const actor = state.step < 2 ? 'Jeff' : '朋友';
    extras = [
      extra(key + 'check-in', `给${actor}留一个电话`, '主安排之外，用一小段清醒时间说近况，也听听对方最近怎样。', 1,
        { energy: -3 }, { bonds: 3, stress: -2 }, `你给${actor}打了电话，没有请对方替你解决难题。说完近况，你也把对方的话听完了。`, actor),
      extra(key + 'quiet', '给自己留一顿安静的饭', '花一点钱把这顿饭安排好，暂时放下电话，让身体缓过来。', 1,
        { money: -2 }, { energy: 6, stress: -4 }, '饭慢慢吃完了。手机没有摆在桌上，眼前这点安静确实留给了自己。'),
      extra(key + 'ledger', '把接下来的开销写清楚', '再花一点精力列出必须付的账，不把尚未到手的收入算进余额。', 1,
        { energy: -2 }, { control: 2, stress: 1 }, '你把固定开销和可推迟的支出分成两列；这张纸没有增加收入，但下一次承诺有了边界。', '你', { pressures: { leverage: -2 } }),
    ];
  } else if (state.phase === 'prep') {
    const school = state.step < 3;
    extras = [
      extra(key + 'check', school ? '多核对一道没弄懂的题' : '再核对一遍关键数字', '腾出精力找一个具体的疏漏，记录问题；这不是替正式结果作保证。', 1,
        { energy: -4 }, { engineering: 3, stress: -1 }, school ? '你把那道题重新做了一遍，圈出了真正没懂的一步。' : '你把报价、假设和测试记录逐项对齐，留下了一张待确认的问题清单。'),
      extra(key + 'consult', school ? '请教一次课外辅导' : '付费请人复核一小部分', '用资金和精力换一次范围明确的复核，接受对方指出的具体问题。', 2,
        { money: -5, energy: -2 }, { communication: 2, engineering: 3 }, '这次请教只解决了一小部分问题。你把对方指出的缺口记下来，没有把意见写成已经完成的成果。', school ? '辅导者' : '复核者'),
      extra(key + 'rest', '留出一段完整休息', '提前安排好一顿饭和返程，让准备结束后不再继续熬着。', 1,
        { money: -2 }, { energy: 5, stress: -4 }, '准备结束后，你按约定停了下来。没处理完的事写进清单，留给下一个清醒的时段。'),
    ];
  } else {
    const school = state.step < 3;
    extras = [
      extra(key + 'explain', school ? '把决定告诉一直关心你的人' : '向受影响的人解释这次决定', '主决定落定后，另外花时间讲清眼下的结果和限制，不许下新的保证。', 1,
        { energy: -3 }, { communication: 2, bonds: 2 }, '你把结果说清楚，也把仍然不确定的部分留在原话里。这次沟通没有替结果翻盘，却少了一层猜测。', school ? '家人或朋友' : '相关同伴'),
      extra(key + 'handoff', school ? '整理一份可复用的学习笔记' : '留下能让别人接手的记录', '花一点资金和精力整理做法、未完成项与下一位负责人的入口。', 2,
        { money: -3, energy: -3 }, { engineering: 2, leadership: 2 }, school ? '你把已经弄懂的做法与仍待解决的问题分开写下，留下了一份以后能重用的笔记。' : '交接页上同时写着已完成和未完成的部分；别人能顺着它继续查，不必等你记起每个细节。', school ? '你' : '团队', { values: { legacy: 1 } }),
      extra(key + 'stop', '给这一轮安排一个停点', '花一点钱把晚饭和返程安排妥当，决定之后不再追加一整晚的工作。', 1,
        { money: -2 }, { energy: 5, stress: -4 }, '这一轮到这里先停下。你收起桌上的东西，今晚没有再把明天的任务全搬过来。'),
    ];
  }
  return { enabled, phase: state.phase, year: scene.year, budget, maxSelections: 3, ...limits,
    options: [...primary, ...extras],
    rule: multiPrimary ? '最多两项相容的主决定，组合各占一半权重；主决定和补充安排总共不超过三项。资金与精力先预留，同批收益不能抵扣投入。'
      : '一项主决定，最多两项补充安排。补充所需资金与精力先从现有余量预留，同批收益不能抵扣投入。',
  };
}

export function resolveChoicePlan(state, ids, plan, primaryOptions) {
  const empty = { available: false, reason: '', ids: [], primaryId: null, primaryIds:[], weights:[], points: 0, budget: plan.budget,
    maxSelections: plan.maxSelections, items: [], required: { money: 0, energy: 0 } };
  const reject = reason => ({ ...empty, reason });
  if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string' || !id)) return reject('选择记录不正确');
  if (!ids.length) return reject('请先选一项主决定');
  if (new Set(ids).size !== ids.length) return reject('同一项安排不能重复选择');
  const unknown = ids.find(id => !plan.options.some(option => option.id === id));
  if (unknown) return reject('找不到当前阶段的选项');
  const chosen = plan.options.filter(option => ids.includes(option.id));
  const mains = chosen.filter(option => option.kind === 'primary');
  if (!mains.length || mains.length > (plan.maxPrimary || 1)) return { ...empty, ids: chosen.map(item => item.id), items: chosen,
    points: chosen.reduce((total, item) => total + item.points, 0),
    required: { money: chosen.reduce((total, item) => total + spend(item, 'money'), 0),
      energy: chosen.reduce((total, item) => total + spend(item, 'energy'), 0) },
    reason: mains.length ? (plan.multiPrimary ? '每次最多选择两项相容的主决定' : '生活和准备阶段的主决定互斥，仍只能选一项') : '请再选一项主决定',
  };
  const primaryIds = mains.map(item => item.id);
  const weights = mains.map(() => 1 / mains.length);
  const optionKey = state.phase === 'life' ? 'options' : state.phase === 'prep' ? 'prep' : 'choices';
  const compatibility = getPrimaryCompatibility(state, primaryIds, {year:plan.year,[optionKey]:primaryOptions});
  const primaryId = mains[0].id;
  const extras = chosen.filter(option => option.kind === 'extra');
  const items = [...mains, ...extras];
  const primary = primaryOptions.find(option => option.id === primaryId);
  const primaries = primaryIds.map(id => primaryOptions.find(option => option.id === id));
  const points = items.reduce((total, item) => total + item.points, 0);
  const primaryMoney = primaries.reduce((total, item) => total + spend(item, 'money'), 0);
  const primaryEnergy = primaries.reduce((total, item) => total + spend(item, 'energy'), 0)
    + (state.phase === 'choice' ? 3 : 0);
  const required = { money: primaryMoney + extras.reduce((total, item) => total + spend(item, 'money'), 0),
    energy: (mains.length === 1 ? Math.min(state.stats.energy, primaryEnergy) : primaryEnergy)
      + extras.reduce((total, item) => total + spend(item, 'energy'), 0) };
  let reason = '';
  if (!compatibility.compatible) reason = compatibility.reason;
  else if (items.length > plan.maxSelections) reason = `一次最多安排 ${plan.maxSelections} 项`;
  else if (points > plan.budget) reason = `行动额度不足：需要 ${points}，本轮只有 ${plan.budget}`;
  else if (state.stats.money < required.money) reason = `资金不足：整组安排需先留出 ${required.money} 点，现有 ${state.stats.money} 点；同批收入不能抵扣`;
  // Original primary decisions remain playable when exhausted. An optional
  // arrangement can only use the energy left after the primary commitment.
  else if ((extras.length || mains.length > 1) && state.stats.energy < required.energy) reason = `精力不足：整组安排需留出 ${required.energy} 点，现有 ${state.stats.energy} 点；可以只做一项主决定`;
  return { available: !reason, reason, ids: items.map(item => item.id), primaryId, primaryIds, weights, points,
    budget: plan.budget, maxSelections: plan.maxSelections, items, required, primary, primaries, extras, compatibility };
}

export function mergePlanImpact(primary, extras) {
  return { ...primary, lifeImpact: {
    ...primary.lifeImpact,
    values: sum(primary.lifeImpact?.values, ...extras.map(item => item.lifeImpact?.values)),
    pressures: sum(primary.lifeImpact?.pressures, ...extras.map(item => item.lifeImpact?.pressures)),
  } };
}
