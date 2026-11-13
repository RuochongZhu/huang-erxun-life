import { LIFE_VALUES, PRESSURE_LABELS, createLifeCourse, isDynamicGame } from './life-dynamics.mjs';
import { formatProtagonistText } from './protagonist-copy.mjs';
import { cleanStoryCopy } from './display-story-copy.mjs';

const escape = value => formatProtagonistText(cleanStoryCopy(String(value ?? ''))).replace(/[&<>"']/g,
  char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const round = value => Math.round(value * 10) / 10;
const keys = LIFE_VALUES.map(item => item.key);
const phaseNames = { life: '生活取舍', prep: '准备安排', choice: '事业决定' };
const signed = value => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}`;

// Describe existing rules only. A score dimension is not necessarily a gate;
// money, immediate energy and cumulative pressure remain separate quantities.
export const LIFE_VALUE_MECHANICS = {
  career: { text: '在相关年份，事业积累配合工程能力和质量记录，能带来续单；重新创业的转机也会看此前积累。', pressures: ['burden'] },
  wealth: { text: '这项记录长期的财务余地。眼前能花多少看资金；回款危机还会看财务悬空和已经许下的开支。', pressures: ['leverage'] },
  belonging: { text: '这项记录这些年留下的联系。关系是否疏远或修复，还会看失约留下的信任透支、支持网络和实际兑现的安排。', pressures: ['trustDebt', 'support'] },
  health: { text: '这项记录精力、压力和恢复留下的长期影响。过劳事件还会看积压负担、近期是否连续透支和当下精力；恢复需要留出真实的工作边界。', pressures: ['burden'] },
  freedom: { text: '这项记录你能否安排时间、划清承诺和交出职责。交接带来的转机还需要实际接班安排、支持网络和领导能力。', pressures: ['support'] },
  legacy: { text: '在相关年份，长期影响配合已经做过的工具或研究投入，以及工程和生态积累，能让过去的投入带来新的合作。', pressures: ['support'] },
};

function recordTitle(game, entry) {
  const records = entry.phase === 'life' ? game.lifeEvidence : game.evidence;
  const matches = (records || []).filter(record => record.step === entry.step && record.phase === entry.phase);
  const exact = matches.find(record => record.optionId === entry.optionId);
  return entry.choiceTitle || exact?.choiceTitle || (matches.length === 1 ? matches[0].choiceTitle : '') || phaseNames[entry.phase] || '已确认的选择';
}

function advance(values, changes, names) {
  const result = {};
  for (const key of names) {
    const change = changes?.[key] ?? 0;
    if (!Number.isFinite(change)) return null;
    const value = round(values[key] + change);
    // Actual net deltas already include saturation. Clamping again here would
    // hide invalid or incomplete records and can fabricate a plausible curve.
    if (value < 0 || value > 100) return null;
    result[key] = value;
  }
  return result;
}

/** Read the history produced by the engine's validated save replay. Never
 * replay actions again, run effects, resolve events or mutate game state. */
export function getLifeTrendData(game) {
  if (!isDynamicGame(game) || !game.lifeCourse) return null;
  const course = game.lifeCourse;
  const metrics = LIFE_VALUES.filter(item => Number.isFinite(course.values?.[item.key]))
    .map(item => ({ ...item, value: course.values[item.key] }));
  const base = { metrics, points: [], complete: false, decisionCount: 0 };
  if (metrics.length !== keys.length || !Array.isArray(course.history)) return base;
  const initial = createLifeCourse();
  let values = { ...initial.values }, pressures = { ...initial.pressures };
  const points = [{ index: 0, year: String(course.history[0]?.year || ''), phase: '',
    title: '人生起点', values, pressures, changes: {}, events: [], extras: [] }];
  for (const [index, entry] of course.history.entries()) {
    if (!entry || !Object.hasOwn(phaseNames, entry.phase)) return base;
    values = advance(values, entry.values, keys);
    pressures = advance(pressures, entry.pressures, Object.keys(PRESSURE_LABELS));
    if (!values || !pressures) return base;
    points.push({ index: index + 1, year: String(entry.year || ''), phase: entry.phase,
      title: recordTitle(game, entry), values, pressures,
      changes: { ...entry.values },
      events: (entry.events || []).map(event => ({ ...event, values: { ...event.values } })),
      extras: (game.supplementJournal || []).filter(item => item.step === entry.step && item.phase === entry.phase)
        .map(item => ({ title: item.title, optionId: item.optionId })),
    });
  }
  if (keys.some(key => values[key] !== course.values[key])
    || Object.keys(PRESSURE_LABELS).some(key => pressures[key] !== course.pressures?.[key])) return base;
  return { metrics, points, complete: true, decisionCount: course.history.length };
}

function graphMarkup(data, metric, selected) {
  const width = 560, height = 184, left = 36, right = 544, top = 18, bottom = 158;
  const x = index => left + index / Math.max(1, data.points.length - 1) * (right - left);
  const y = value => bottom - value / 100 * (bottom - top);
  const coordinates = data.points.map(point => `${x(point.index).toFixed(2)},${y(point.values[metric.key]).toFixed(2)}`);
  const point = data.points[selected];
  const changedEvents = data.points.filter(row => row.events.some(event => event.values?.[metric.key]));
  const first = data.points[0], last = data.points.at(-1);
  const label = `${metric.label}，从${first.values[metric.key]}到${last.values[metric.key]}。当前回看${point.year}年${point.title}，数值${point.values[metric.key]}。`;
  return `<svg class="life-trend-graph" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(label)}">
    ${[0, 50, 100].map(value => `<line class="life-trend-grid" x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}"/><text x="0" y="${y(value) + 4}">${value}</text>`).join('')}
    <polygon class="life-trend-fill" points="${left},${bottom} ${coordinates.join(' ')} ${right},${bottom}"/>
    <polyline class="life-trend-line" points="${coordinates.join(' ')}"/>
    ${changedEvents.map(row => `<path class="life-trend-event" d="M ${x(row.index)} ${y(row.values[metric.key]) - 5} l 5 5 -5 5 -5 -5 Z"/>`).join('')}
    <line class="life-trend-cursor" x1="${x(selected)}" x2="${x(selected)}" y1="${top}" y2="${bottom}"/>
    <circle class="life-trend-point" cx="${x(selected)}" cy="${y(point.values[metric.key])}" r="5"/>
    <text x="${left}" y="181">${escape(first.year)}</text><text x="${right}" y="181" text-anchor="end">${escape(last.year)}</text>
  </svg>`;
}

function pointMarkup(data, metric, selected) {
  const point = data.points[selected];
  const change = point.changes[metric.key] || 0;
  const events = point.events.filter(event => event.values?.[metric.key]);
  return `<div class="life-trend-receipt">
    <div class="life-trend-receipt-heading"><span>${escape(point.year)}${point.year ? ' · ' : ''}${escape(phaseNames[point.phase] || '起点')}</span>
      <span>当时 <strong>${point.values[metric.key]}</strong>${selected ? ` <span class="life-trend-delta">（${change ? signed(change) : '未变'}）</span>` : ''}</span></div>
    <p class="life-trend-choice">${escape(point.title)}</p>
    ${point.extras.length ? `<p class="life-trend-extras">同时安排：${point.extras.map(item => escape(item.title)).join('、')}。变化已合计。</p>` : ''}
    ${events.map(event => `<p class="life-trend-turn"><span aria-hidden="true">◆</span> ${escape(event.title)} <span>（${signed(event.values[metric.key])}，已计入本次变化）</span></p>`).join('')}
  </div>`;
}

function mechanicsMarkup(data, metric, selected) {
  const rule = LIFE_VALUE_MECHANICS[metric.key];
  const point = data.points[selected];
  return `<details class="life-trend-mechanics"><summary>这项积累会影响什么</summary>
    <p>${escape(rule.text)}</p>
    ${point ? `<p class="life-trend-context">${selected ? '当时' : '起点'}：${rule.pressures.map(key => `${PRESSURE_LABELS[key]} ${point.pressures[key]}`).join(' · ')}</p>` : ''}
    <p class="life-trend-weight">这项满分 100，占人生总分的 ${Math.round(metric.weight * 100)}%。</p>
  </details>`;
}

function detailMarkup(data, metric, selected) {
  if (!data.complete) return `<p class="life-trend-empty">这份进度没有完整的变化记录，目前只能查看现值。</p>${mechanicsMarkup(data, metric, selected)}`;
  if (!data.decisionCount) return `<p class="life-trend-empty">这是人生起点。确认第一个选择后，这里会留下变化。</p>${mechanicsMarkup(data, metric, 0)}`;
  return `<div class="life-trend-caption"><span>${escape(metric.label)}的变化</span><span>按已确认的决定排列</span></div>
    ${graphMarkup(data, metric, selected)}
    <label class="life-trend-select"><span>回看一次选择</span><select data-life-trend-point aria-label="回看一次选择">
      ${data.points.map(point => `<option value="${point.index}"${point.index === selected ? ' selected' : ''}>${point.index ? `${escape(point.year)} · ${escape(phaseNames[point.phase])}${point.events.some(event => event.values?.[metric.key]) ? ' · 有转折' : ''}` : '人生起点'}</option>`).join('')}
    </select></label>
    ${pointMarkup(data, metric, selected)}${mechanicsMarkup(data, metric, selected)}`;
}

/** Insert once per view. No global IDs; multiple independent instances work. */
export function lifeTrendsMarkup(game) {
  const data = getLifeTrendData(game);
  if (!data?.metrics.length) return '';
  const metric = data.metrics.find(item => item.key === 'health') || data.metrics[0];
  const selected = Math.max(0, data.points.length - 1);
  return `<section class="life-trends" data-life-trends aria-label="人生积累与长期变化">
    <p class="life-trends-hint">点一项，看看一路的变化。</p>
    <div class="life-trend-metrics" role="group" aria-label="选择要回看的人生积累">${data.metrics.map(item =>
      `<button type="button" data-life-trend-metric="${item.key}" aria-pressed="${item.key === metric.key}" aria-label="${escape(item.label)}，当前${item.value}，满分100"><span>${escape(item.label)}</span><strong>${item.value}</strong></button>`).join('')}</div>
    <div class="life-trend-detail" data-life-trend-detail>${detailMarkup(data, metric, selected)}</div>
    <p class="visually-hidden" data-life-trend-announcement role="status" aria-atomic="true"></p>
  </section>`;
}

const bindings = new WeakMap();
/** Bind after inserting markup; rebinding replaces old listeners. Returns
 * cleanup. Only reads the validated game passed in; never touches saves. */
export function bindLifeTrends(container, game) {
  bindings.get(container)?.();
  const data = getLifeTrendData(game);
  if (!data?.metrics.length) return () => {};
  const roots = container.matches?.('[data-life-trends]') ? [container] : [...container.querySelectorAll('[data-life-trends]')];
  const removals = roots.map(root => {
    let key = data.metrics.find(item => item.key === 'health')?.key || data.metrics[0].key;
    let selected = Math.max(0, data.points.length - 1);
    const render = () => {
      const expanded = root.querySelector('.life-trend-mechanics')?.open;
      root.querySelector('[data-life-trend-detail]').innerHTML = detailMarkup(data, data.metrics.find(item => item.key === key), selected);
      root.querySelector('.life-trend-mechanics').open = !!expanded;
      for (const button of root.querySelectorAll('[data-life-trend-metric]')) button.setAttribute('aria-pressed', String(button.dataset.lifeTrendMetric === key));
      const metric = data.metrics.find(item => item.key === key), point = data.points[selected];
      root.querySelector('[data-life-trend-announcement]').textContent = point
        ? `${metric.label}，${point.year ? `${point.year}年，` : ''}${point.title}，当时${point.values[key]}${selected ? `，本次${point.changes[key] ? signed(point.changes[key]) : '未变'}` : ''}。`
        : `${metric.label}，当前${metric.value}。`;
    };
    const click = event => {
      const button = event.target.closest('[data-life-trend-metric]');
      if (!button || !root.contains(button) || !data.metrics.some(item => item.key === button.dataset.lifeTrendMetric)) return;
      key = button.dataset.lifeTrendMetric;
      render(); // The focused button is retained; only the detail is replaced.
    };
    const change = event => {
      if (!event.target.matches('[data-life-trend-point]')) return;
      const index = Number(event.target.value);
      if (!Number.isInteger(index) || index < 0 || index >= data.points.length) return;
      selected = index;
      render();
      root.querySelector('[data-life-trend-point]')?.focus();
    };
    root.addEventListener('click', click);
    root.addEventListener('change', change);
    return () => { root.removeEventListener('click', click); root.removeEventListener('change', change); };
  });
  const cleanup = () => { removals.forEach(remove => remove()); if (bindings.get(container) === cleanup) bindings.delete(container); };
  bindings.set(container, cleanup);
  return cleanup;
}
