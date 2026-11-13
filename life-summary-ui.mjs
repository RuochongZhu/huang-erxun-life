import { LIFE_VALUES, PRESSURE_LABELS } from './life-dynamics.mjs';
import { formatProtagonistText } from './protagonist-copy.mjs';
import { cleanStoryCopy } from './display-story-copy.mjs';
import { SCORE_BANDS, getResultLabel } from './result-labels.mjs';

const escape = value => formatProtagonistText(cleanStoryCopy(value)).replace(/[&<>"']/g,
  char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const VALUE_LABELS = Object.fromEntries(LIFE_VALUES.map(item => [item.key, item.label]));
const TONES = { crisis: '危机', breakthrough: '转机', mixed: '变局' };
const number = value => Number.isFinite(value) ? value : null;

// Only present values already produced by the engine. Old saves deliberately
// have no score: never reconstruct achievements from resources or personality.
export function getLifeSummary(report, state) {
  const score = report.lifeScore;
  const decisionCount = report.decisionCount ?? score?.decisionCount ?? 0;
  const tragedy = !!report.ifEpilogue?.tragedy;
  const hasScore = !tragedy && !!score && decisionCount > 0 && Number.isFinite(score.score);
  const seen = new Set();
  return {
    scored: hasScore,
    score: hasScore ? number(score.score) : null,
    maxScore: hasScore ? number(score.maxScore) : null,
    grade: hasScore ? score.grade : '',
    title: report.ifEpilogue?.title || score?.title || report.lifePortrait?.title || report.ending?.title || '这一程，先到这里',
    comment: report.ifEpilogue?.cardText || report.ifEpilogue?.text || score?.comment || report.lifePortrait?.text || report.ending?.text || '',
    provisional: !!(score?.provisional ?? report.early),
    decisionCount,
    resultLabel: state ? getResultLabel(state, report) : report.resultLabel || null,
    values: hasScore ? (score.values || []).filter(item => Number.isFinite(item.value))
      .map(item => ({ ...item, value: number(item.value) })) : [],
    highlights: decisionCount && !tragedy ? (score?.highlights || []).filter(item => {
      const id = item.id || `${item.year}:${item.title}`;
      if (seen.has(id)) return false;
      seen.add(id); return true;
    }).slice(0, 3).map(item => ({ ...item, shortText: item.text?.match(/^.*?[。！？](?:[”」』])?/u)?.[0] || item.text || '' })) : [],
  };
}

export function valueRows(values = {}) {
  return LIFE_VALUES.filter(item => Number.isFinite(values[item.key]))
    .map(item => ({ ...item, value: number(values[item.key]) }));
}

export function resultLabelMarkup(label) {
  if (!label) return '';
  return `<div class="result-label" data-result-label="${escape(label.id)}">
    <p class="result-label-quip">${escape(label.quip)}</p>
    <details class="result-label-method"><summary>称号怎么来的</summary>
      <dl class="result-label-basis"><div><dt>结局标签</dt><dd>${escape(label.ending.label)}<span>${escape(label.outcome)}</span></dd></div>
      <div><dt>分段标签</dt><dd>${label.band ? `${escape(label.band.id)} · ${escape(label.band.label)}<span>${label.band.min}–${label.band.max} 分 · ${escape(label.band.quip)}</span>` : '未分段'}</dd></div></dl>
      <p class="subtle">${escape(label.note)}</p>
      ${label.band ? `<ol class="result-score-bands" aria-label="五个分数区间">${SCORE_BANDS.map(band => `<li${band.id === label.band.id ? ' aria-current="true"' : ''}><span>${band.id} · ${escape(band.label)}</span><span>${band.min}–${band.max} 分${band.id === label.band.id ? ' · 本局' : ''}</span></li>`).join('')}</ol>` : ''}
    </details>
  </div>`;
}

export function resultLabelTextLines(label) {
  if (!label) return [];
  return [`本局称号：${label.title}${label.provisional ? '（暂定）' : ''} · ${label.code}`, label.quip,
    `结局标签：${label.ending.label} · ${label.outcome}`,
    label.band ? `分段标签：${label.band.id} · ${label.band.label} · ${label.band.min}–${label.band.max} 分` : '分段标签：未分段', label.note];
}

export function lifeValuesMarkup(values, className = '') {
  if (!values?.length) return '';
  return `<dl class="life-value-list ${className}" aria-label="六项人生积累，各项满分100">${values.map(item =>
    `<div><dt>${escape(item.label)}</dt><dd>${escape(item.value)}<span class="visually-hidden"> / 100</span></dd></div>`).join('')}</dl>`;
}

export function pressureStateMarkup(pressures) {
  if (!pressures) return '';
  return `<details class="state-resources"><summary>负担与支持</summary><dl class="pressure-state">${Object.entries(PRESSURE_LABELS)
    .filter(([key]) => Number.isFinite(pressures[key]))
    .map(([key, label]) => `<div><dt>${escape(label)}</dt><dd>${escape(pressures[key])}</dd></div>`).join('')}</dl></details>`;
}

export function scoreMethodMarkup(summary) {
  if (!summary.scored) return '';
  return `<details class="score-method"><summary>总分怎么算</summary><p class="subtle">各项满分 100，按以下比重合为 1000 分。计入这局已发生的得失。</p><dl class="score-weights">${summary.values.map(item =>
    `<div><dt>${escape(item.label)} · ${Math.round(item.weight * 100)}%</dt><dd>${escape(item.description)}</dd></div>`).join('')}</dl></details>`;
}

export function deltaMarkup(values, labels, className = '') {
  const rows = Object.entries(labels).filter(([key]) => Number.isFinite(values?.[key]) && values[key] !== 0);
  if (!rows.length) return '';
  return `<ul class="value-deltas ${className}">${rows.map(([key, label]) => {
    const improved = ['stress', 'burden', 'trustDebt', 'leverage'].includes(key) ? values[key] < 0 : values[key] > 0;
    return `<li><span>${escape(label)}</span> <strong class="delta-${improved ? 'up' : 'down'}">${values[key] > 0 ? '+' : '−'}${escape(Math.abs(values[key]))}</strong></li>`;
  }).join('')}</ul>`;
}

export function resultImpactMarkup(impact, statNames = {}, options = {}) {
  if (!impact && !options.effects) return '';
  impact = impact || {};
  const changes = deltaMarkup(impact.values, VALUE_LABELS);
  const resources = deltaMarkup(options.effects, statNames, 'resource-deltas');
  const pressures = deltaMarkup(impact.pressures, PRESSURE_LABELS, 'pressure-deltas');
  return `<div class="choice-feedback">
    ${impact.environment ? `<p class="scene-after">${escape(impact.environment)}</p>` : ''}
    ${(impact.reactions || []).map(reaction => `<p class="person-reaction"><strong>${escape(reaction.speaker)}</strong><span>${escape(reaction.text)}</span></p>`).join('')}
    ${(impact.events || []).map(event => `<article class="turn-event" data-event-tone="${Object.hasOwn(TONES, event.tone) ? event.tone : 'mixed'}">
      <p class="event-kicker">${TONES[event.tone] || '变局'}</p>
      <h3>${escape(event.title)}</h3>
      <p class="story-text">${escape(event.text)}</p>
      ${event.cause ? `<p class="event-cause"><span>此前的积累</span> · ${escape(event.cause)}</p>` : ''}
      ${options.effects ? '' : deltaMarkup(event.statChanges, statNames, 'event-stat-deltas')}
    </article>`).join('')}
    ${(impact.checkpoints || []).length ? `<dl class="life-checkpoints">${impact.checkpoints.map(item => `<div><dt>${escape(item.label)}</dt><dd>${Number.isFinite(item.before) && Number.isFinite(item.after) ? `<span class="checkpoint-values">${escape(item.before)} → ${escape(item.after)}${item.unit ? ` ${escape(item.unit)}` : ''}</span>` : ''}${escape(item.text)}</dd></div>`).join('')}</dl>` : ''}
    ${resources || changes || pressures ? `<section class="turn-changes" aria-label="这次留下的变化">
      ${resources ? `<div class="change-group"><h3>当下的变化</h3>${resources}</div>` : ''}
      ${changes ? `<div class="change-group"><h3>人生的积累</h3>${changes}</div>` : ''}
      ${pressures ? `<details class="pressure-changes"><summary>负担与支持的变化</summary>${pressures}</details>` : ''}
    </section>` : ''}
  </div>`;
}

export function impactPreviewMarkup(impact) {
  if (!impact) return '';
  const changes = deltaMarkup(impact.values, VALUE_LABELS);
  const pressures = deltaMarkup(impact.pressures, PRESSURE_LABELS, 'pressure-deltas');
  return `<div class="impact-preview">${changes ? `<h3>即时人生影响</h3>${changes}` : ''}
    ${impact.hint ? `<p class="subtle">${escape(impact.hint)}</p>` : ''}
    ${pressures ? `<details class="pressure-changes"><summary>负担与支持</summary>${pressures}</details>` : ''}</div>`;
}

export function highlightsMarkup(highlights) {
  if (!highlights?.length) return '';
  return `<section class="life-highlights" aria-labelledby="highlights-title"><h2 id="highlights-title">这些年，留下三两件事</h2>
    <ol>${highlights.slice(0, 3).map(item => `<li><p class="highlight-title">${item.year ? `<span>${escape(item.year)}</span> ` : ''}<strong>${escape(item.title)}</strong></p>
      ${item.shortText || item.text ? `<p>${escape(item.shortText || item.text)}</p>` : ''}</li>`).join('')}</ol></section>`;
}

export function impactTextLines(impact) {
  if (!impact) return [];
  const deltas = (values, labels) => Object.entries(labels).filter(([key]) => values?.[key])
    .map(([key, label]) => `${label} ${values[key] > 0 ? '+' : '−'}${Math.abs(values[key])}`).join('、');
  return [impact.environment || '', ...(impact.reactions || []).map(item => `${item.speaker} · ${item.text}`),
    ...(impact.checkpoints || []).map(item => `${item.label} · ${item.text}`),
    ...(impact.events || []).flatMap(event => [`${TONES[event.tone] || '变局'} · ${event.title}`, event.text, event.cause || '']),
    ...(Object.keys(impact.values || {}).length ? [`人生积累 · ${deltas(impact.values, VALUE_LABELS)}`] : []),
    ...(Object.keys(impact.pressures || {}).length ? [`负担与支持 · ${deltas(impact.pressures, PRESSURE_LABELS)}`] : []),
  ].filter(Boolean);
}
