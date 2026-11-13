// Two compatible career decisions share one outcome tier. Numeric effects and
// personality signals use equal weights; identity and semantic compatibility
// are decided separately by the explicit compatibility rules.
export const COMBINATION_EDITION = '2026.11.pairs';
export const isCombinationGame = state => state?.combinationEdition === COMBINATION_EDITION;
const round = value => Math.round(value * 1e6) / 1e6;
const unique = values => [...new Set(values)];

export function weightedChanges(records, weights = records.map(() => 1 / records.length)) {
  const keys = unique(records.flatMap(record => Object.keys(record || {})));
  return Object.fromEntries(keys.map(key => [key, round(records.reduce((sum, record, i) => sum + (record?.[key] || 0) * weights[i], 0))])
    .filter(([, value]) => value !== 0));
}

// Splitting attention reduces expected gains, never the amount a supplier or
// teammate must actually receive before either decision can go ahead.
function committedChanges(records, weights, cost = false) {
  const contributions = records.map((record, index) => Object.fromEntries(Object.entries(record || {}).map(([key,value]) =>
    [key, value < 0 && (cost || key === 'money' || key === 'energy') ? value : value * weights[index]])));
  return weightedChanges(contributions, contributions.map(() => 1));
}

function weightedImpact(items, weights) {
  return { values:weightedChanges(items.map(item => item?.values), weights),
    pressures:weightedChanges(items.map(item => item?.pressures), weights),
    hint:unique(items.map(item => item?.hint).filter(Boolean)).join(' ') };
}

function weightedTraits(options, weights) {
  const dims = unique(options.flatMap(option => (option.traits || []).map(trait => trait.dim)));
  return dims.map(dim => {
    const rows = options.flatMap((option, index) => (option.traits || []).filter(trait => trait.dim === dim)
      .map(trait => ({ ...trait, w:(trait.w ?? 1) * weights[index] })));
    const w = rows.reduce((sum, row) => sum + row.w, 0);
    return { dim, w, d:w ? round(rows.reduce((sum, row) => sum + row.d * row.w, 0) / w) : 0 };
  });
}

export function buildCombinedChoice(state, options, previews, compatibility = {}) {
  if (state.phase !== 'choice' || options.length !== 2) throw new Error('组合需要两项相容的事业决定');
  const weights = [.5, .5];
  const risky = previews.some(preview => preview.probabilities.length > 1);
  const vectors = previews.map(preview => preview.probabilities.length === 1 ? [1,0,0] : preview.probabilities);
  const good = Math.round((vectors[0][0] + vectors[1][0]) * 500);
  const mixed = Math.round((vectors[0][1] + vectors[1][1]) * 500);
  const first = good / 1000, second = mixed / 1000, third = (1000 - good - mixed) / 1000;
  const probabilities = risky ? [first, second, first + second + third === 1 ? third : 1 - (first + second)] : [1];
  const outcomes = probabilities.map((_, tier) => {
    const selected = options.map(option => option.outcomes[option.outcomes.length === 1 ? 0 : tier]);
    if (selected.some(outcome => !outcome)) throw new Error('两项决定的结果档位不完整');
    const routes = unique(selected.map((outcome, i) => outcome.route ?? options[i].route).filter(Boolean));
    if (routes.length > 1) throw new Error('两项决定会进入不同的工作身份，不能同时执行');
    const authored = compatibility.jointOutcomes?.[tier];
    return {
      label:authored?.label || selected.map(outcome => outcome.label).join('；'),
      text:authored?.text || selected.map((outcome, i) => `${options[i].title}：${outcome.text}`).join('\n'),
      effects:weightedChanges(selected.map(outcome => outcome.effects), weights),
      flags:unique(selected.flatMap(outcome => outcome.flags || [])),
      ...(routes.length ? { route:routes[0] } : {}),
      lifeImpact:weightedImpact(selected.map(outcome => outcome.lifeImpact), weights),
    };
  });
  return {
    id:`pair:${options.map(option => option.id).join('+')}`,
    title:options.map(option => option.title).join(' ＋ '),
    description:options.map(option => option.description).filter(Boolean).join('\n'),
    cost:committedChanges(options.map(option => option.cost), weights, true),
    effects:committedChanges(options.map(option => option.effects), weights),
    traits:weightedTraits(options, weights), flags:unique(options.flatMap(option => option.flags || [])),
    lifeImpact:weightedImpact(options.map(option => option.lifeImpact), weights),
    ...(risky ? { check:{base:probabilities[0]} } : {}),
    outcomes, combination:{edition:COMBINATION_EDITION, probabilities, weights,
      primaryIds:options.map(option => option.id), options, ruleId:compatibility.ruleId || ''},
  };
}

export function combinedReceipts(option, outcomeIndex) {
  return option.combination.options.map((part, index) => {
    const selectedIndex = part.outcomes.length === 1 ? 0 : outcomeIndex;
    const outcome = part.outcomes[selectedIndex];
    return { id:part.id, title:part.title, kind:'primary', points:1,
      weight:option.combination.weights[index], outcomeIndex:selectedIndex,
      label:outcome.label, text:outcome.text,
      effects:weightedChanges([committedChanges([part.cost], [option.combination.weights[index]], true),
        committedChanges([part.effects], [option.combination.weights[index]]),
        weightedChanges([outcome.effects], [option.combination.weights[index]])], [1,1,1]) };
  });
}
