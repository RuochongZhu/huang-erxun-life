import { createAnalytics } from './analytics.mjs';
import { syncMusic } from './music-controller.mjs';
import { getSceneArt } from './scene-art.mjs';
import { formatProtagonistText } from './protagonist-copy.mjs';
import { cleanStoryCopy } from './display-story-copy.mjs';
import { getChoiceCopy } from './choice-copy.mjs';
import { STORY_EDITION, STORY_YEARS, getStepCount, getStoryChapters } from './story-timeline.mjs';
import { PREMISE, PROTAGONIST } from './narrative.mjs';
import { getLifePortrait } from './life-content.mjs';
import { getResourceHistory, resourceCandle, RESOURCE_LABELS } from './resource-history.mjs';
import { getPersonalityCard } from './personality-card.mjs';
import { lifeTrendsMarkup, bindLifeTrends } from './life-trends.mjs';
import { getWeightedLifeHistory, WEIGHTED_LIFE_SCALE } from './life-overview.mjs';
import { LIFE_VALUES } from './life-dynamics.mjs';
import { renderSectionEmotion } from './section-emotion.mjs';
import { createCardBlob, canShareCard, shareCard, canCopyCard, copyCard } from './card-export.mjs';
import { getLifeSummary, lifeValuesMarkup, valueRows, pressureStateMarkup, scoreMethodMarkup, resultImpactMarkup, highlightsMarkup, impactTextLines, resultLabelMarkup, resultLabelTextLines } from './life-summary-ui.mjs';
import {
  ACTIVE_LIMIT_MS, commitChoice, continueGame, createGame, endEarly, getReport,
  previewChoice, validateSave, getScene, getChoicePlan, previewChoices, commitChoices,
} from './life-engine.mjs';


const SAVE_KEY = 'jensen-game-save';
const PREP_RECEIPT_READ_KEY = 'jensen-game-prep-receipt-read';
const LIMIT_REASON = '达到26分钟活跃游玩上限';
const STAT_NAMES = {
  energy: '精力', stress: '压力', bonds: '合作支持', money: '资金', engineering: '工程',
  communication: '沟通', leadership: '领导力', ecosystem: '生态', reputation: '声誉', control: '控制权',
};
const ROUTES = {
  student: '求学', employee: '工程职涯', company: '创业', studio: '独立工作室',
  researcher: '研究与教学', sold: '出售公司后的生活',
};
const OUTCOME_NAMES = ['顺利', '勉强', '失利'];
const CHART_LABELS = { lifeIndex: '人生总积累', ...RESOURCE_LABELS };
const siteHeading = document.querySelector('#site-heading');
const main = document.querySelector('#main');
const notice = document.querySelector('#notice');
const announcement = document.querySelector('#announcement');
const dialog = document.querySelector('#modal');
const modalContent = document.querySelector('#modal-content');
const formatPercent = new Intl.NumberFormat('zh-CN', { style: 'percent', maximumFractionDigits: 1 });
const analytics = createAnalytics();

let game = null;
let screen = 'home';
let activeDialog = null;
let pendingChoice = null;
let clockStart = null;
let lastSavedElapsed = 0;
let storageMessage = '';
let report = null;
let modalReturnFocus = null;
let resourceHistory = [];
let weightedLifeHistory = [];
let cardCache = null;
let cardPreviewURL = null;
let cardRequest = 0;
let cardExportBusy = false;
let viewedPrepReceipt;

function resourceChartContent(key, selected) {
  const rows = key === 'lifeIndex' ? weightedLifeHistory : resourceHistory;
  const scale = key === 'lifeIndex' ? WEIGHTED_LIFE_SCALE : 100;
  const row = rows[selected];
  if (!row) return '<p class="subtle">还没有选择记录，做出选择后就能看到变化。</p>';
  const width = Math.max(420, rows.length * 62 + 72);
  const y = value => 190 - value / scale * 150;
  const candle = resourceCandle(row, key);
  return `<div class="chart-scroll"><svg viewBox="0 0 ${width} 240" style="min-width:${width}px" role="group" aria-label="${CHART_LABELS[key]} K线，点击年份查看选择">
    ${[0,.25,.5,.75,1].map(fraction=>{const value=fraction*scale;return `<line class="chart-gridline" x1="34" x2="${width-12}" y1="${y(value)}" y2="${y(value)}"/><text class="chart-tick" x="5" y="${y(value)+4}">${value}</text>`;}).join('')}
    ${rows.map((item,i)=>{
      const c=resourceCandle(item,key),x=65+i*62;
      return `<g class="candle ${c.close>c.open?'up':c.close<c.open?'down':'flat'} ${i===selected?'selected':''}" tabindex="0" role="button" data-resource-year="${i}" aria-label="${escapeHTML(item.year)}年，${CHART_LABELS[key]}从${c.open}到${c.close}，最高${c.high}，最低${c.low}">
        <rect class="candle-hit" x="${x-25}" y="15" width="50" height="217" rx="5"/>
        <line class="candle-wick" x1="${x}" x2="${x}" y1="${y(c.high)}" y2="${y(c.low)}"/>
        <rect class="candle-body" x="${x-9}" y="${y(Math.max(c.open,c.close))}" width="18" height="${Math.max(2,Math.abs(c.close-c.open)/scale*150)}"/>
        <text class="candle-year" x="${x}" y="215" text-anchor="middle">${escapeHTML(item.year)}</text>
      </g>`;
    }).join('')}
  </svg></div><div class="candle-detail" aria-live="polite">
    <h3>${escapeHTML(row.year)} · ${CHART_LABELS[key]} ${candle.open} → ${candle.close}${row.complete?'':' · 本站未完成'}</h3>
    <p class="subtle">最高 ${candle.high} · 最低 ${candle.low}</p>
    <ol class="resource-receipts">${row.points.map(point=>`<li><strong>${escapeHTML(point.label)} · ${point.stats[key]}</strong>${point.choiceTitle?`<p>${escapeHTML(point.choiceTitle)}</p>`:''}</li>`).join('')}</ol>
  </div>`;
}

function resourceChartMarkup() {
  resourceHistory = getResourceHistory(game);
  weightedLifeHistory = getWeightedLifeHistory(game);
  const metric = weightedLifeHistory.length ? 'lifeIndex' : 'money';
  const rows = metric === 'lifeIndex' ? weightedLifeHistory : resourceHistory;
  const labels = weightedLifeHistory.length ? CHART_LABELS : RESOURCE_LABELS;
  const selected = Math.max(0,rows.length-1);
  return `<details class="resource-history"${activeDialog === 'lifechart' ? ' open' : ''}><summary>${weightedLifeHistory.length ? '人生 K 线 · 一路的起落' : '资金、精力和压力的变化'}</summary>
    <p class="subtle">${weightedLifeHistory.length ? '人生总积累按六项现有权重合成，满分1000，与结局总分同一口径。' : ''}每根 K 线是一年：粗线连接开始与结束，细线保留实际选择后的最高与最低。点年份可以追溯变化。</p>
    ${weightedLifeHistory.length ? `<p class="chart-weight-note subtle">${LIFE_VALUES.map(item => `${escapeHTML(item.label)} ${Math.round(item.weight * 100)}%`).join(' · ')}</p>` : ''}
    ${game.migration?'<p class="subtle">旧存档保留原有的工作记录，生活记录从更新后开始。</p>':''}
    ${rows.length?`<div class="resource-controls"><label>查看指标<select id="resource-metric">${Object.entries(labels).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label>
      <label>查看年份<select id="resource-year">${rows.map((row,i)=>`<option value="${i}" ${i===selected?'selected':''}>${escapeHTML(row.year)} · 第 ${row.step+1} 站</option>`).join('')}</select></label></div>`:''}
    <div id="resource-chart-content">${resourceChartContent(metric,selected)}</div>
  </details>`;
}

function updateResourceChart(selected) {
  const metric=document.querySelector('#resource-metric'),year=document.querySelector('#resource-year');
  if (!metric || !year) return;
  const rows = metric.value === 'lifeIndex' ? weightedLifeHistory : resourceHistory;
  const index = Math.min(rows.length - 1, Math.max(0, selected ?? Number(year.value)));
  year.innerHTML = rows.map((row,i)=>`<option value="${i}" ${i===index?'selected':''}>${escapeHTML(row.year)} · 第 ${row.step+1} 站</option>`).join('');
  document.querySelector('#resource-chart-content').innerHTML=resourceChartContent(metric.value,Number(year.value));
}

function escapeHTML(value) {
  return formatProtagonistText(cleanStoryCopy(value)).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function twoDigits(value) {
  return String(value).padStart(2, '0');
}

function duration(ms, roundUp = false) {
  const seconds = Math[roundUp ? 'ceil' : 'floor'](Math.max(0, ms) / 1000);
  return `${twoDigits(Math.floor(seconds / 60))}:${twoDigits(seconds % 60)}`;
}

function showNotice(message) {
  notice.textContent = message;
  notice.hidden = !message;
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw === null) return;
    const restored = validateSave(raw);
    if (!restored.ok) {
      storageMessage = `无法读取上次存档。${restored.reason ? `原因：${restored.reason}。` : ''}你可以开始新人生。`;
      return;
    }
    game = restored.state;
    lastSavedElapsed = game.elapsedMs;
  } catch {
    storageMessage = '本地存档暂不可用。当前浏览器窗口仍可游玩。';
  }
}

function saveGame() {
  lastSavedElapsed = game.elapsedMs;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    if (storageMessage) {
      storageMessage = '';
      showNotice('');
    }
  } catch {
    storageMessage = '自动存档暂不可用。请保留当前页面，以免丢失进度。';
    if (notice.textContent !== storageMessage) showNotice(storageMessage);
  }
}

function startClock() {
  if (clockStart === null && screen === 'play' && !document.hidden && !['pause','if-ending','if-tragedy'].includes(activeDialog)) {
    clockStart = performance.now();
  }
}

function finishAtLimit() {
  game = game.phase === 'result' && game.step === getStepCount(game) - 1
    ? continueGame(game) : endEarly(game, LIMIT_REASON);
  clockStart = null;
  closeModal(false);
  screen = 'ending';
  saveGame();
  render(true);
}

function updateClock() {
  if (screen !== 'play') return;
  if (clockStart !== null) {
    const spent = Math.floor(performance.now() - clockStart);
    if (spent > 0) {
      clockStart += spent;
      game = { ...game, elapsedMs: Math.min(ACTIVE_LIMIT_MS, game.elapsedMs + spent) };
    }
  }
  if (game.elapsedMs >= ACTIVE_LIMIT_MS) {
    finishAtLimit();
    return;
  }
  const clock = document.querySelector('#remaining-time');
  const timeLeft = duration(ACTIVE_LIMIT_MS - game.elapsedMs, true);
  if (clock && clock.textContent !== timeLeft) clock.textContent = timeLeft;
  if (game.elapsedMs - lastSavedElapsed >= 5000) saveGame();
}

function stopClock() {
  updateClock();
  clockStart = null;
}

function actionButton(action, label, className = '', arrow = false) {
  return `<button type="button" class="btn ${className}" data-action="${action}">${label}${arrow ? ' <span aria-hidden="true">→</span>' : ''}</button>`;
}

function renderHome() {
  const resume = game
    ? actionButton('resume', game.phase === 'ended' ? '查看上次结局' : '继续上次进度', 'primary large', true)
    : '';
  const start = actionButton('new', '开始新人生', game ? 'large' : 'primary large', !game);
  return `
    <div class="home">
      <div class="home-opening">
        <h1 class="page-title" tabindex="-1"><span class="title-phrase">黄二勋的</span><span class="title-phrase">传奇人参</span></h1>
        <p class="home-intro">${PREMISE.lead}</p>
      </div>
      <figure class="home-art">
        <div class="home-art-surface"><img src="./assets/jensen-guide.webp" width="768" height="768" alt="银发、眼镜和黑色皮夹克的黄二勋插画小人" fetchpriority="high"></div>
      </figure>
      <div class="home-start">
        <div class="actions">${resume}${start}</div>
        <div class="life-prologue">
          <details><summary>故事背景</summary><p>${PREMISE.past}</p><p>${PREMISE.hope}</p></details>
        </div>
        <details class="home-explore"><summary>怎么玩</summary><p>${PREMISE.task}</p></details>
      </div>
    </div>`;
}

function chapterProgress(currentChapter) {
  const chapters = getStoryChapters(game);
  return `<details class="chapter-nav">
    <summary><span>第 ${game.step + 1} / ${getStepCount(game)} 站<span class="chapter-name"> · ${escapeHTML(chapters[currentChapter])}</span></span></summary>
    <ol class="chapter-list" aria-label="章节进度">
      ${chapters.map((chapter, index) => `<li${index === currentChapter ? ' aria-current="step"' :
        index < currentChapter ? ' class="past"' : ''}>${escapeHTML(chapter)}</li>`).join('')}
    </ol>
  </details>`;
}

function lifeCommitmentsMarkup() {
  if (!game?.life) return '';
  const portrait = getLifePortrait(game);
  const commitments = portrait.commitments ?? [];
  return commitments.length ? `<details class="life-commitments">
    <summary>现在的生活</summary>
    <dl>${commitments.map(item=>`<div><dt>${escapeHTML(item.label)}</dt><dd>${escapeHTML(item.value)}</dd></div>`).join('')}</dl>
  </details>` : '';
}

function effectText(effects = {}) {
  return Object.entries(STAT_NAMES)
    .filter(([key]) => effects[key])
    .map(([key, label]) => `${label} ${effects[key] > 0 ? '+' : '−'}${Math.abs(effects[key])}`)
    .join('、') || '状态数值不变';
}

function choiceRow(option, index, planItem = null, allowMultiple = false, scene = getScene(game)) {
  const extra = planItem?.kind === 'extra';
  const preview = planItem || previewChoice(game, option.id);
  const personal = game.phase === 'life';
  const copy = getChoiceCopy(game, scene, option);
  return `<label class="choice-row">
    <input class="visually-hidden" type="${extra || allowMultiple ? 'checkbox' : 'radio'}" name="${extra ? 'extra' : 'choice'}" value="${escapeHTML(option.id)}" ${planItem ? `data-plan-kind="${planItem.kind}"` : ''}
      aria-labelledby="option-title-${index}" aria-describedby="${preview.available ? '' : `option-reason-${index}`}"
      ${preview.available ? '' : 'disabled'}>
    <span class="choice-indicator" aria-hidden="true"></span>
    <span class="option-copy">
      <span id="option-title-${index}" class="option-title">${escapeHTML(copy.title)}</span>
      <span class="option-expanded" id="option-detail-${index}" hidden>
        <span id="option-description-${index}" class="option-description">${escapeHTML(copy.description)}</span>
        ${personal && copy.tradeoff ? `<span class="option-tradeoff">取舍：${escapeHTML(copy.tradeoff)}</span>` : ''}
        ${planItem ? `<span class="option-effort">需要 ${planItem.points} 点行动额度</span>` : ''}
      </span>
      ${preview.available ? '' : `<span id="option-reason-${index}" class="option-unavailable${extra ? ' plan-unavailable' : ''}">${escapeHTML(preview.reason || '当前无法选择')}</span>`}
    </span>
  </label>`;
}

function statGrid(keys) {
  return `<div class="stat-grid">${keys.map(key => `<label>
    <span>${STAT_NAMES[key]} ${escapeHTML(game.stats[key])}</span>
    <progress max="100" value="${escapeHTML(game.stats[key])}"></progress>
  </label>`).join('')}</div>`;
}

function statsMarkup() {
  const primary = ['energy', 'stress', 'money'];
  return `<div>
    ${statGrid(primary)}
    <details class="more-stats">
      <summary>更多数值</summary>
      ${statGrid(Object.keys(STAT_NAMES).filter(key => !primary.includes(key)))}
    </details>
  </div>`;
}

function choiceForm(scene) {
  const prep = game.phase === 'prep';
  const personal = game.phase === 'life';
  const plan = getChoicePlan(game);
  if (plan.enabled) {
    const primary = plan.options.filter(item => item.kind === 'primary');
    const extras = plan.options.filter(item => item.kind === 'extra');
    const original = personal ? scene.options : prep ? scene.prep : scene.choices;
    const multiPrimary = !!plan.multiPrimary && plan.maxPrimary > 1;
    return `<form id="choice-form" class="phase-form choice-plan" tabindex="-1">
      <p class="plan-intro">${multiPrimary ? '可选 1–2 项相容的决定。' : '先选 1 项决定。'}点选后看说明，再提交。</p>
      <fieldset class="options"><legend class="plan-legend">${personal ? '生活的主决定' : prep ? '这次先做的准备' : '这次的决定'}${multiPrimary ? '<span>最多选两项 · 相互冲突的安排不能一起做</span>' : ''}</legend>
        <div class="option-grid">${primary.map((item, index) => choiceRow(original.find(option => option.id === item.id) || item, index, item, multiPrimary, scene)).join('')}</div>
      </fieldset>
      ${extras.length ? `<fieldset class="options plan-extras"><legend class="plan-legend">再安排一点小事 <span>可选，最多 2 项</span><span id="extras-selection-count"></span></legend>
        <div class="option-grid">${extras.map((item, index) => choiceRow(item, primary.length + index, item, false, scene)).join('')}</div>
      </fieldset>` : ''}
      <details class="plan-outcomes" hidden><summary>查看可能的结果</summary><div id="plan-outcomes"></div></details>
      <div class="plan-dock">
        <div id="plan-feedback" class="plan-feedback" role="status" aria-live="polite" aria-atomic="true"><p>行动额度 <strong>${plan.budget} / ${plan.budget}</strong></p><p class="plan-cost">先选一项，再看还有哪些事能一起做。</p></div>
        <div class="turn-bar"><button id="choose-button" type="submit" class="btn primary large" disabled>提交安排 <span aria-hidden="true">→</span></button></div>
      </div>
    </form>`;
  }
  return `<form id="choice-form" class="phase-form" tabindex="-1">
    <fieldset class="options">
      <legend class="plan-legend">${personal ? '你打算怎么办？' : prep ? '先做什么准备？' : '你怎么选？'}</legend>
      <div class="option-grid">${(personal ? scene.options : prep ? scene.prep : scene.choices).map((option, index) => choiceRow(option, index, null, false, scene)).join('')}</div>
    </fieldset>
    <p id="choice-hint" class="visually-hidden" role="status">选一项，再核对影响。</p>
    <div class="turn-bar"><button id="choose-button" type="submit" class="btn primary large" disabled>看看这个选择 <span aria-hidden="true">→</span></button></div>
  </form>`;
}

function selectedPlanIds() {
  return Array.from(document.querySelectorAll('#choice-form input:checked'), input => input.value);
}

function updateChoicePlan() {
  syncChoiceDetails();
  const plan = getChoicePlan(game), ids = selectedPlanIds();
  if (!plan.enabled) return;
  const preview = previewChoices(game, ids);
  const primaryIds = ids.filter(id => plan.options.some(item => item.id === id && item.kind === 'primary'));
  const remaining = plan.budget - preview.points;
  const count = document.querySelector('#extras-selection-count');
  if (count) count.textContent = ids.length > primaryIds.length ? `已选 ${ids.length - primaryIds.length} 项` : '';
  const pairing = primaryIds.length === 2 ? plan.compatiblePairs?.find(pair => pair.ids.every(id => primaryIds.includes(id))) : null;
  const outcome = document.querySelector('#plan-outcomes');
  const outcomeDetails = outcome.closest('details');
  outcomeDetails.hidden = !preview.available || preview.probabilities.length < 2;
  outcome.innerHTML = outcomeDetails.hidden ? '' : choiceOutcomesMarkup(preview);
  document.querySelector('#choose-button').disabled = !preview.available;
  document.querySelector('#plan-feedback').innerHTML = `<p>已选 ${ids.length} 项 · 行动额度 <strong>${Math.max(0, remaining)} / ${plan.budget}</strong>${remaining < 0 ? ` · 超出 ${-remaining} 点` : ''}</p>
    <p class="plan-cost">${preview.available ? primaryIds.length > 1 ? escapeHTML(pairing?.reason || '两项一起推进，效果各占一半；资金和精力要够两份投入。') : '提交后安排立即生效。' : escapeHTML(preview.reason || '先选一项决定。')}</p>`;
  for (const input of document.querySelectorAll('#choice-form input[data-plan-kind]')) {
    const item = plan.options.find(option => option.id === input.value);
    const extra = item.kind === 'extra';
    const candidate = input.checked ? preview : extra && !primaryIds.length || !extra && !plan.multiPrimary ? null : previewChoices(game, [...ids, input.value]);
    const reason = input.checked ? '' : !item.available ? item.reason : extra && !primaryIds.length ? '先选一项决定' : candidate && !candidate.available ? candidate.reason : '';
    input.disabled = !!reason;
    const row = input.closest('.choice-row');
    row.querySelector('.option-unavailable')?.remove();
    const reasonId = input.getAttribute('aria-labelledby').replace('option-title-', 'option-reason-');
    input.setAttribute('aria-describedby', input.getAttribute('aria-describedby').split(' ').filter(id => id !== reasonId).concat(reason ? [reasonId] : []).join(' '));
    if (reason) row.querySelector('.option-copy').insertAdjacentHTML('beforeend', `<span id="${escapeHTML(reasonId)}" class="option-unavailable plan-unavailable${extra && !primaryIds.length ? ' visually-hidden' : ''}">${escapeHTML(reason)}</span>`);
  }
}

function combinedResultsMarkup(plan, readable = false) {
  const decisions = plan?.items?.filter(item => item.kind === 'primary') || [];
  return decisions.length > 1 ? `<div class="combined-results">${decisions.map(item => `<section><h3>${escapeHTML(item.title)}</h3>${readable ? storyMarkup(item.text) : `<p class="story-text">${escapeHTML(item.text)}</p>`}</section>`).join('')}</div>` : '';
}

function resultMarkup(result) {
  const personal = game.phase === 'life-result';
  return `<section class="result result-paper" aria-labelledby="result-title">
    <h2 id="result-title" class="visually-hidden" tabindex="-1">${escapeHTML(result.label)}</h2>
    ${combinedResultsMarkup(result.plan, true) || storyMarkup(result.text)}
    <details class="result-more"><summary>看看这次的影响</summary>${supplementResultsMarkup(result.plan)}
    ${resultImpactMarkup(result.impact, STAT_NAMES, { effects: result.effects })}
    ${renderSectionEmotion(result, game)}</details>
  </section>
  <div class="turn-bar">${actionButton('next', personal ? '接下来' : game.step === getStepCount(game) - 1 ? '看看这些年' : '继续', 'primary large', true)}</div>`;
}

function supplementResultsMarkup(plan) {
  const items = plan?.items?.filter(item => item.kind === 'extra') || [];
  return items.length ? `<div class="supplement-results">${items.map(item => `<p><span>${escapeHTML(item.title)}</span>${escapeHTML(item.text)}</p>`).join('')}</div>` : '';
}

function prepReceiptId() {
  return JSON.stringify([game.seed, game.name, game.storyEdition, game.step, game.actions.length, game.lastResult.title]);
}

function prepReceiptButtonMarkup() {
  if (viewedPrepReceipt === undefined) {
    try { viewedPrepReceipt = localStorage.getItem(PREP_RECEIPT_READ_KEY); }
    catch { viewedPrepReceipt = null; }
  }
  const read = viewedPrepReceipt === prepReceiptId();
  return `<button type="button" class="prep-receipt-trigger" data-action="prep-receipt" data-read="${read}" aria-haspopup="dialog" aria-controls="modal"><span>查看刚才的行动与影响</span><span class="prep-receipt-status">${read ? '已查看' : '未查看'}</span></button>`;
}

function showPrepReceipt() {
  if (screen !== 'play' || game.phase !== 'choice' || !game.choicePlanEdition || !game.lastResult || dialog.open) return;
  const result = game.lastResult;
  openModal('prep-receipt', '刚才的准备', `<div class="prep-receipt"><p>${escapeHTML(result.title)}</p>${supplementResultsMarkup(result.plan)}<p class="prep-effects">${escapeHTML(effectText(result.effects))}</p>${(result.impact?.reactions || []).slice(0, 1).map(item => `<p class="prep-checkpoint">${escapeHTML(item.speaker)}：${escapeHTML(item.text)}</p>`).join('')}${(result.impact?.checkpoints || []).slice(0, 1).map(item => `<p class="prep-checkpoint">${escapeHTML(item.text)}</p>`).join('')}</div>`, actionButton('close', '关闭'));
  viewedPrepReceipt = prepReceiptId();
  try { localStorage.setItem(PREP_RECEIPT_READ_KEY, viewedPrepReceipt); }
  catch { /* Keep the read state in memory when browser storage is unavailable. */ }
  const button = main.querySelector('[data-action="prep-receipt"]');
  if (button) {
    button.dataset.read = 'true';
    button.querySelector('.prep-receipt-status').textContent = '已查看';
  }
}

function supplementJournalMarkup(timeline) {
  if (!timeline?.length) return '';
  return `<h3 class="career-journal-heading">那些一起做的小事</h3><ol class="journal">${timeline.map(item => `<li class="journal-entry"><details><summary>${escapeHTML(item.year)} · ${escapeHTML(item.title)}</summary><div class="journal-detail"><p>${escapeHTML(item.text)}</p><p class="subtle">${escapeHTML(effectText(item.effects))}</p></div></details></li>`).join('')}</ol>`;
}

function artworkMarkup(art, className = '') {
  return art ? `<figure class="scene-art ${className}" data-art="${escapeHTML(art.id)}"><img src="${escapeHTML(art.src)}" width="1200" height="800" alt="${escapeHTML(art.alt)}" decoding="async"></figure>` : '';
}

function playMarkup(scene) {
  const result = ['result','life-result'].includes(game.phase) ? game.lastResult : null;
  const art = getSceneArt(game, scene);
  const year = result?.year ?? scene.year;
  const story = game.phase === 'prep' && scene.prepStory ? scene.prepStory : scene.story;
  return `<div class="game-layout reader">
    <header class="reader-header">
      <div class="scene-heading">
        <h1 class="page-title" tabindex="-1">${escapeHTML(result?.sceneTitle ?? scene.title)}</h1>
        <p class="scene-meta">${escapeHTML(year)} 年 · ${escapeHTML(scene.age)} 岁</p>
      </div>
      ${utilityMarkup()}
    </header>
    ${isIfEra() ? `<div class="if-era-label"><span>IF / ${escapeHTML(year)}</span><p>${game.step === 12 && !game.flags?.if_2026_layoff ? '2026 · 第四季度。灯光变了，人生还没有答案。' : '这条未来，由你已经做过的选择继续生长。'}</p></div>` : ''}
    <div class="scene-spread${result ? ' scene-spread-result' : ''}">
      ${artworkMarkup(art)}
      <div class="scene-reading">
        ${result ? resultMarkup(result) : storyMarkup(story)}
        ${!result && game.phase === 'choice' && game.choicePlanEdition && game.lastResult ? prepReceiptButtonMarkup() : ''}
      </div>
    </div>
    ${result ? '' : `<section class="decision-stage" aria-label="你的选择">${choiceForm(scene)}</section>`}
  </div>`;
}

function storyMarkup(story) {
  const paragraphs = String(story ?? '').split(/\n+/).filter(Boolean);
  return `<div class="scene-story story-text">${paragraphs.map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join('')}</div>`;
}

function syncChoiceDetails() {
  for (const input of document.querySelectorAll('#choice-form input')) {
    const row = input.closest('.choice-row');
    const expanded = row?.querySelector('.option-expanded');
    if (!expanded) continue;
    expanded.hidden = !input.checked;
    const reason = row.querySelector('.option-unavailable');
    input.setAttribute('aria-describedby', [input.checked ? expanded.id : '', reason?.id].filter(Boolean).join(' '));
  }
}

function utilityMarkup() {
  return `<nav class="reader-tools" aria-label="辅助操作">${actionButton('state','我的状态')}${actionButton('details','故事详情')}${game.lifeCourse?.history?.length ? actionButton('lifechart','人生 K 线') : ''}${actionButton('journal','手记')}${actionButton('pause','暂停')}${isIfEra() ? actionButton('if-ending','写下结局') : ''}</nav>`;
}

function isIfEra() { return game?.storyEdition === STORY_EDITION && game.step >= 12; }
function routeLabel(entry) { return entry.route === 'sold' && Number(entry.year) >= 2026 && game.flags?.if_2026_layoff ? '离职后的过渡期' : ROUTES[entry.route]; }

function sceneContextMarkup(scene) {
  return `<details class="scene-context"><summary>人物和地点</summary><div class="context-body">
    <p class="scene-date">${escapeHTML(scene.date)} · ${PROTAGONIST} ${scene.age} 岁</p>
    <p><strong>${escapeHTML(scene.place)}</strong><br><span class="street-address">${escapeHTML(scene.address)}</span></p>
    <p class="cast-line"><strong>相关人物</strong> · ${scene.people.map(person => escapeHTML(person.name)).join('；')}</p>
  </div></details>`;
}

function missionMarkup(mission) {
  if (!mission) return '';
  return `<section class="scene-mission" aria-labelledby="mission-title">
    <h2 id="mission-title">${escapeHTML(mission.deadline)}</h2>
    <p>${escapeHTML(mission.objective)}</p>
  </section>`;
}

function journalMarkup(timeline) {
  if (!timeline.length) return '<p class="subtle">做出工作选择后，这里会记下结果。</p>';
  return `<ol class="journal">
    ${timeline.map(entry => `<li class="journal-entry"><details>
      <summary><strong>${escapeHTML(entry.year)}</strong> · ${escapeHTML(entry.title)}</summary>
      <div class="journal-detail">
        <p class="subtle">准备 · ${escapeHTML(entry.prepTitle)}</p>
        <p><strong>决定 · ${escapeHTML(entry.choiceTitle)}</strong></p>
        ${combinedResultsMarkup(entry.plan) || `<p class="story-text">${escapeHTML(entry.label)} · ${escapeHTML(entry.resultText)}</p>`}
        ${resultImpactMarkup(entry.impact, STAT_NAMES)}
        <p class="subtle">${escapeHTML(effectText(entry.effects))}</p>
        <p class="subtle">去向 · ${escapeHTML(routeLabel(entry))}</p>
      </div>
    </details></li>`).join('')}
  </ol>`;
}

function lifeJournalMarkup(timeline) {
  if (!timeline?.length) return '<p class="subtle">还没有生活记录。做出选择后，会记在这里。</p>';
  return `<ol class="journal">${timeline.map(entry=>`<li class="journal-entry"><details>
    <summary><strong>${escapeHTML(entry.year)}</strong> · ${escapeHTML(entry.choiceTitle || entry.title)}</summary>
    <div class="journal-detail"><p class="story-text">${escapeHTML(entry.resultText || entry.text)}</p>
      ${resultImpactMarkup(entry.impact, STAT_NAMES)}
      ${entry.tradeoff?`<p class="subtle">当时的取舍 · ${escapeHTML(entry.tradeoff)}</p>`:''}
      ${entry.consequence?`<p class="subtle">留下的影响 · ${escapeHTML(entry.consequence)}</p>`:''}
      </div>
    </details></li>`).join('')}</ol>`;
}

function lifeFacetsMarkup(portrait) {
  return `<section id="life-portrait" class="life-facets" aria-label="人生的不同方面">
    ${(portrait.facets??[]).map(facet=>`<article class="life-facet">
      <h3>${escapeHTML(facet.title)}</h3>
      <p class="facet-status">${escapeHTML(facet.status)}</p><p>${escapeHTML(facet.text)}</p>
      ${facet.receipts?.length?`<details><summary>查看 ${facet.receipts.length} 次选择</summary><ul>${facet.receipts.map(receipt=>`<li><strong>${escapeHTML(receipt.year)} · ${escapeHTML(receipt.title)}</strong>${receipt.text?`<p>${escapeHTML(receipt.text)}</p>`:''}</li>`).join('')}</ul></details>`:''}
    </article>`).join('')}
  </section>`;
}

function dimensionMarkup(dimension) {
  const observed = dimension.score !== null;
  return `<details class="dimension">
    <summary>${escapeHTML(dimension.name)}
      <span class="dimension-meta">
        ${escapeHTML(dimension.count)} 条选择证据 · ${escapeHTML(dimension.confidence)}
      </span>
      ${observed ? `<span class="meter-track dimension-meter" aria-hidden="true"><span style="width:${Math.max(0, Math.min(100, dimension.score))}%"></span></span>
        <span class="dimension-scale"><span>${escapeHTML(dimension.low)}</span><span>${escapeHTML(dimension.high)}</span></span>` : ''}
    </summary>
    <div class="dimension-body">
      ${dimension.receipts.length ? `<ul>${dimension.receipts.map(receipt => `<li>
        <strong>${escapeHTML(receipt.year)} · ${escapeHTML(receipt.choiceTitle)}</strong>
        ${receipt.context ? `<p class="subtle">${escapeHTML(receipt.context)}</p>` : ''}
      </li>`).join('')}</ul>` : '<p class="subtle">已完成的选择还未触及这个维度。</p>'}
    </div>
  </details>`;
}

function dimensionGroups(dimensions) {
  const groups = new Map();
  for (const dimension of dimensions) {
    if (!groups.has(dimension.group)) groups.set(dimension.group, []);
    groups.get(dimension.group).push(dimension);
  }
  return Array.from(groups, ([group, items]) => `<section class="dimension-group">
    <h3>${escapeHTML(group)}</h3>
    ${items.map(dimensionMarkup).join('')}
  </section>`).join('');
}

function endingMarkup() {
  const { ending, archetype, dimensions, timeline, completedSteps, decisionCount, elapsedMs, early } = report;
  const portrait = report.lifePortrait ?? getLifePortrait(game);
  const summary = getLifeSummary({ ...report, lifePortrait: portrait }, game);
  const card = getPersonalityCard(game, report);
  const lifeTimeline = report.lifeTimeline ?? game.lifeJournal ?? [];
  const tragedy = !!report.ifEpilogue?.tragedy;
  const record = lifeValuesMarkup(summary.values) + highlightsMarkup(summary.highlights);
  return `<div class="ending-layout compact-ending">
    <section class="life-summary" aria-labelledby="ending-title">
      <div class="summary-overview">
        <div class="summary-heading">
          ${tragedy ? '' : `<figure class="summary-portrait"><img src="${escapeHTML(card.art.src)}" width="768" height="768" alt="${escapeHTML(card.art.alt)}" data-personality-art="${escapeHTML(card.art.id)}"></figure>`}
          <div>
            <h1 id="ending-title" class="page-title" tabindex="-1">${escapeHTML(summary.resultLabel?.title || summary.title)}</h1>
            ${summary.resultLabel ? `<p class="result-label-code">${escapeHTML(summary.resultLabel.code)}${summary.resultLabel.provisional ? ' · 阶段称号' : ''}</p>` : ''}
            ${summary.scored ? `<p class="summary-score"><strong>${summary.score}</strong><span> / ${summary.maxScore} · ${summary.provisional ? '阶段总分' : '人生总分'}</span></p>` : ''}
          </div>
        </div>
        ${resultLabelMarkup(summary.resultLabel)}
        ${summary.resultLabel ? `<h2 class="summary-story-title">${escapeHTML(summary.title)}</h2>` : ''}
        <p class="summary-comment">${escapeHTML(summary.comment)}</p>
        ${decisionCount && !tragedy ? `<p class="summary-personality">${escapeHTML(game.name)} · <span id="personality-title">${escapeHTML(card.title)}${card.provisional ? '（暂定）' : ''}</span></p>` : ''}
        ${early && game.endReason ? `<p class="summary-stop subtle">${escapeHTML(game.endReason)}</p>` : ''}
      </div>
      ${record ? `<div class="summary-record">${record}</div>` : ''}
      <div class="actions summary-actions">${decisionCount > 0 && !tragedy ? actionButton('card', '生成分享卡', 'primary', true) : ''}${actionButton('new', '开始新人生', decisionCount && !tragedy ? 'quiet' : 'primary')}</div>
    </section>
    ${tragedy ? '' : resourceChartMarkup()}
    <details class="ending-archive"><summary>展开人生手记</summary><div class="archive-content">
      <p class="subtle">${completedSteps} / ${getStepCount(game)} 站 · ${decisionCount} 次选择 · 用时 ${duration(elapsedMs)}</p>
      ${report.migrationNote ? `<p class="subtle">${escapeHTML(report.migrationNote)}</p>` : ''}
      ${summary.scored ? `<p class="story-text">${escapeHTML(portrait.text)}</p>` : ''}
      ${scoreMethodMarkup(summary)}
      ${lifeFacetsMarkup(portrait)}
      ${tragedy ? '' : `<section class="career-reflection"><h2>${escapeHTML(ending.title)}</h2><p class="story-text">${escapeHTML(ending.text)}</p></section>`}
      <section class="ending-journal" aria-labelledby="life-journal-title">
        <h2 id="life-journal-title" class="journal-heading">生活记录</h2>${lifeJournalMarkup(lifeTimeline)}
        <h2 class="journal-heading career-journal-heading">工作记录</h2>${journalMarkup(timeline)}
        ${game.preparationJournal?.length ? `<h3 class="career-journal-heading">每次出发前的准备</h3>${lifeJournalMarkup(game.preparationJournal)}` : ''}${supplementJournalMarkup(game.supplementJournal)}
      </section>
      <details id="dimension-report" class="dimension-report"><summary>16 项性格分析</summary>
        <p class="story-text">${escapeHTML(archetype.text)}</p><div class="dimension-columns">${dimensionGroups(dimensions)}</div>
      </details>
      <div class="actions">${game.lifeCourse ? actionButton('state', '回看人生变化') : ''}${actionButton('export', '导出完整手记')}</div>
    </div></details>
  </div>`;
}

function render(focus = false, focusResult = false) {
  syncMusic(game, screen);
  showNotice(storageMessage);
  document.documentElement.dataset.era = screen !== 'home' && isIfEra() ? 'if' : 'past';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', document.documentElement.dataset.era === 'if' ? '#101321' : '#f7f5ef');
  if (screen === 'play') {
    const scene = getScene(game);
    siteHeading.innerHTML = chapterProgress(scene.chapter);
    main.innerHTML = playMarkup(scene);
    if (document.querySelector('#choice-form.choice-plan')) updateChoicePlan();
  } else {
    siteHeading.innerHTML = '<span class="site-name">再活一次</span>';
    if (screen === 'ending') {
      report = getReport(game);
      main.innerHTML = endingMarkup();
    } else {
      report = null;
      main.innerHTML = renderHome();
    }
  }
  if (screen === 'play' || screen === 'ending') analytics.observeGame(game, screen === 'ending' ? { report, summary: getLifeSummary(report, game) } : null);
  if (focus) {
    main.querySelector(focusResult ? '#result-title' : '.page-title')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

function openModal(kind, title, body, actions = '') {
  if (dialog.open) return;
  modalReturnFocus = document.activeElement;
  activeDialog = kind;
  dialog.dataset.kind = kind;
  dialog.classList.toggle('share-card-modal', kind === 'card');
  modalContent.innerHTML = `<div class="modal-head"><h2 id="modal-title"${['state', 'prep-receipt'].includes(kind) ? ' tabindex="-1" autofocus' : ''}>${escapeHTML(title)}</h2></div>
    <div class="modal-body">${body}</div>
    ${actions ? `<div class="actions">${actions}</div>` : ''}`;
  dialog.showModal();
}

function closeModal(restoreClock = true) {
  if (activeDialog === 'card') {
    cardRequest++;
    cardExportBusy = false;
    if (cardPreviewURL) URL.revokeObjectURL(cardPreviewURL);
    cardPreviewURL = null;
  }
  activeDialog = null;
  pendingChoice = null;
  if (dialog.open) dialog.close();
  if (modalReturnFocus?.isConnected) modalReturnFocus.focus({ preventScroll: true });
  if (restoreClock) startClock();
}

function newGameDialog() {
  const details = `从 ${STORY_YEARS[0]} 年到 ${STORY_YEARS.at(-1)} 年，陪${PROTAGONIST}走过 ${getStepCount({ storyEdition: STORY_EDITION })} 站人生。${game ? '开始后，将替换本浏览器的上次存档。' : '每一步，由你来选。'}`;
  openModal('new', '开始新人生', `
    <p class="subtle">${details}</p>
    <form id="nickname-form">
      <label class="field">怎么称呼你（选填）
        <input name="nickname" maxlength="32" placeholder="黄二勋" autocomplete="off" autofocus>
      </label>
    </form>`, `${actionButton('close', '取消')}<button type="submit" form="nickname-form" class="btn primary">开始新人生</button>`);
}

function choiceOutcomesMarkup(preview) {
  return `<ol class="confirm-outcomes" aria-label="可能的结果">
    ${preview.outcomes.map((outcome, index) => `<li>
      <strong class="subtle">${['如果顺利', '如果有波折', '如果受挫'][index]}</strong>
      <p>${escapeHTML(outcome.label)}${preview.probabilities?.[index] !== undefined ? ` · ${formatPercent.format(preview.probabilities[index])}` : ''}</p>
    </li>`).join('')}
  </ol>`;
}

function showConfirm(optionId) {
  updateClock();
  if (screen !== 'play' || !['life', 'prep', 'choice'].includes(game.phase)) return;
  const scene = getScene(game);
  const personal = game.phase === 'life';
  const preview = previewChoice(game, optionId);
  const availableOptions = personal ? scene.options : game.phase === 'prep' ? scene.prep : scene.choices;
  const option = availableOptions.find(item => item.id === optionId);
  if (!option || !preview.available) return;
  const copy = getChoiceCopy(game, scene, option);
  pendingChoice = optionId;
  openModal('confirm', '确认选择', `
    <p><strong>${escapeHTML(copy.title)}</strong></p>
    <p class="subtle">${escapeHTML(copy.description)}</p>
    ${personal && copy.tradeoff ? `<p class="confirm-effects">${escapeHTML(copy.tradeoff)}</p>` : ''}
    ${preview.probabilities.length > 1 ? choiceOutcomesMarkup(preview) : ''}`,
  actionButton('close', '返回选项') + actionButton('commit', '确认选择', 'primary'));
  dialog.querySelector('[data-action="close"]')?.focus();
}

function applyChoice() {
  if (activeDialog !== 'confirm' || pendingChoice === null) return;
  const optionId = pendingChoice;
  closeModal(false);
  submitChoice(optionId);
}

function submitChoice(optionId) {
  updateClock();
  if (screen !== 'play' || !['life', 'prep', 'choice'].includes(game.phase)) return;
  try {
    game = Array.isArray(optionId) ? commitChoices(game, optionId) : commitChoice(game, optionId);
  } catch (error) {
    showNotice(error.message || '这次选择未能记录，请重新选择。');
    return;
  }
  if (game.phase === 'ended') {
    clockStart = null;
    screen = 'ending';
  }
  saveGame();
  render(true, ['result','life-result'].includes(game.phase));
}

function resumeGame() {
  if (!game) return;
  screen = game.phase === 'ended' ? 'ending' : 'play';
  if (screen === 'play' && game.elapsedMs >= ACTIVE_LIMIT_MS) {
    finishAtLimit();
    return;
  }
  startClock();
  render(true);
}

function showDetails() {
  if (screen !== 'play') return;
  const scene = getScene(game);
  const result = ['result','life-result'].includes(game.phase) ? game.lastResult : null;
  const story = String(scene.story || '').split(/\n+/).filter(Boolean).map(text => `<p>${escapeHTML(text)}</p>`).join('');
  const prep = game.phase === 'prep' && scene.prepStory ? `<p>${escapeHTML(scene.prepStory)}</p>` : '';
  const settlement = result ? `<p><strong>这次的变化</strong> · ${escapeHTML(effectText(result.effects))}</p>${result.probabilities.length > 1 ? `<p>触发结果：${OUTCOME_NAMES[result.outcomeIndex]}，当时概率 ${formatPercent.format(result.probabilities[result.outcomeIndex])}。</p>` : ''}` : '';
  openModal('details','故事详情', `${story}${prep}${missionMarkup(scene.mission)}${settlement}
    ${sceneContextMarkup(scene)}
    ${scene.echo ? `<p>${escapeHTML(scene.echo)}</p>` : ''}
    `, actionButton('close','关闭'));
}

function showState() {
  if (!['play', 'ending'].includes(screen)) return;
  const course = game.lifeCourse ? `<h3 class="state-heading">人生积累</h3>${lifeTrendsMarkup(game)}${pressureStateMarkup(game.lifeCourse.pressures)}<details class="state-resources"><summary>眼前的资源</summary>${statsMarkup()}</details>` : statsMarkup();
  openModal('state','我的状态', `<p>已走到第 ${game.step + 1} / ${getStepCount(game)} 站。</p>${course}${lifeCommitmentsMarkup()}`, actionButton('close','关闭'));
  bindLifeTrends(modalContent, game);
  if (screen === 'play' && getWeightedLifeHistory(game).length) modalContent.querySelector('.actions')?.insertAdjacentHTML('afterbegin', actionButton('lifechart', '查看人生 K 线'));
}

function showLifeChart() {
  if (screen !== 'play') return;
  closeModal(false);
  openModal('lifechart', '人生 K 线', resourceChartMarkup(), actionButton('close', '关闭'));
  modalContent.querySelector('.resource-history')?.setAttribute('open', '');
}

function showPause() {
  if (screen !== 'play') return;
  stopClock();
  if (screen !== 'play') return;
  saveGame();
  openModal('pause', '已暂停', `<p>计时已暂停。剩余 ${duration(ACTIVE_LIMIT_MS - game.elapsedMs, true)}。</p>
    <p class="subtle">${storageMessage ? escapeHTML(storageMessage) : '已保存当前进度。'}</p>`,
  actionButton('home', '返回首页') + actionButton('close', '继续游玩', 'primary'));
  dialog.querySelector('[data-action="close"]')?.focus();
}

function showIfEnding() {
  if (screen !== 'play' || !isIfEra()) return;
  stopClock();
  if (screen !== 'play') return;
  openModal('if-ending', '未来，还要往哪里去', `<p>你可以继续走到 2036 年，也可以在这一刻合上手记。直接结算会保留已经发生的得失。</p><div class="if-ending-options"><p>另有一条非具象的悲剧结局：虚构主角自杀，故事转入留下的人与未完成的事。没有过程描写，也不会因此获得加分或奖励。</p></div>`, actionButton('if-settle','就在这里结算') + actionButton('if-tragedy-confirm','选择悲剧结局') + actionButton('close','继续人生','primary'));
}

function confirmIfTragedy() {
  if (activeDialog !== 'if-ending') return;
  closeModal(false);
  openModal('if-tragedy', '留下的空位', '<p>这条虚构结局会结束当前故事，记下亲友面对的失去。你也可以回到尚未结束的人生。</p>', actionButton('close','回到人生','primary') + actionButton('if-tragedy','进入悲剧终章'));
}

function settleIf(tragedy = false) {
  if (screen !== 'play' || !isIfEra() || activeDialog !== (tragedy ? 'if-tragedy' : 'if-ending')) return;
  game = endEarly(game, tragedy ? 'IF终章：悲剧落幕' : 'IF终章：选择停在这里');
  clockStart = null;
  closeModal(false);
  screen = 'ending';
  saveGame();
  render(true);
}

function showJournal() {
  if (screen !== 'play') return;
  openModal('journal', '人生手记', '<h3>生活里的决定</h3>'+lifeJournalMarkup(game.lifeJournal)+'<h3 class="career-journal-heading">工作记录</h3>'+journalMarkup(game.journal)+(game.preparationJournal?.length ? '<h3 class="career-journal-heading">每次出发前的准备</h3>'+lifeJournalMarkup(game.preparationJournal) : '')+supplementJournalMarkup(game.supplementJournal), actionButton('close', '关闭'));
}

function nextScene() {
  updateClock();
  if (screen !== 'play' || !['result','life-result'].includes(game.phase)) return;
  game = continueGame(game);
  if (game.phase === 'ended') {
    clockStart = null;
    screen = 'ending';
  }
  saveGame();
  render(true);
}

function exportReport() {
  if (screen !== 'ending' || !report) return;
  const { ending, archetype, dimensions, completedSteps, decisionCount, elapsedMs, timeline, early } = report;
  const portrait = report.lifePortrait ?? getLifePortrait(game);
  const summary = getLifeSummary(report, game);
  const lines = [
    '黄二勋的传奇人参｜人生手记',
    `${game.name} · ${early ? '阶段手记' : '人生手记'}`,
    ...resultLabelTextLines(summary.resultLabel),
    portrait.title, portrait.text,
    ...(report.ifEpilogue ? [report.ifEpilogue.title, report.ifEpilogue.text] : []),
    ...(summary.scored ? [`总分 ${summary.score} / ${summary.maxScore} · ${summary.title}`, summary.comment,
      ...summary.values.map(item => `${item.label} ${item.value} / 100`),
      ...summary.highlights.map(item => `${item.year || ''} · ${item.title} · ${item.text || ''}`)] : []),
    `完成 ${completedSteps} / ${getStepCount(game)} 个节点 · ${decisionCount} 次选择 · 活跃 ${duration(elapsedMs)}`,
    ...(early && game.endReason ? [`结束原因： ${game.endReason}`] : []),
    ...(report.migrationNote ? [report.migrationNote] : []),
    '', '人生的不同方面',
    ...(portrait.facets??[]).flatMap(facet=>[
      `${facet.title} · ${facet.status}`,facet.text,
      ...(facet.receipts??[]).map(receipt=>`${receipt.year} · ${receipt.title} · ${receipt.text??''}`),'',
    ]),
    '', '工作这一面', ending.title, ending.subtitle, ending.text,
    '', '本局处境变化 · 按实际选择记录',
    ...getWeightedLifeHistory(game).map(row => { const c = resourceCandle(row, 'lifeIndex'); return `${row.year} · 人生总积累 / 1000：开始 ${c.open}，最高 ${c.high}，最低 ${c.low}，最后 ${c.close}`; }),
    ...resourceHistory.flatMap(row=>[`${row.year}${row.complete?'':' · 本站未完成'}`,
      ...Object.entries(RESOURCE_LABELS).map(([key,label])=>{const c=resourceCandle(row,key);return `${label}：开始 ${c.open}，最高 ${c.high}，最低 ${c.low}，最后 ${c.close}`;}),
      ...row.points.map(point=>`${point.label} · ${point.choiceTitle || '起始状态'}：资金 ${point.stats.money}，精力 ${point.stats.energy}，压力 ${point.stats.stress}`),'']),
    '', '生活里的决定',
    ...(report.lifeTimeline ?? game.lifeJournal ?? []).flatMap(entry=>[
      `${entry.year} · ${entry.title}`,`选择 · ${entry.choiceTitle}`,entry.resultText??entry.text,
      ...impactTextLines(entry.impact),
      `当时的取舍 · ${entry.tradeoff??''}`,`留下的影响 · ${entry.consequence??''}`,'',
    ]),
    '', '工作记录',
    ...timeline.flatMap(entry => [
      `${entry.year} · ${entry.title}`,
      `准备 · ${entry.prepTitle}`, `决定 · ${entry.choiceTitle}`,
      ...(entry.plan?.items?.filter(item => item.kind === 'primary').length > 1
        ? entry.plan.items.filter(item => item.kind === 'primary').map(item => `${item.title}：${item.text}`)
        : [`${entry.label} · ${entry.resultText}`]),
      ...impactTextLines(entry.impact),
      `去向 · ${routeLabel(entry)}`, '',
    ]),
    ...(game.preparationJournal?.length ? ['', '每次出发前的准备', ...game.preparationJournal.flatMap(item => [`${item.year} · ${item.choiceTitle}`, item.resultText, ...impactTextLines(item.impact), effectText(item.effects), ''])] : []),
    ...(game.supplementJournal?.length ? ['', '那些一起做的小事', ...game.supplementJournal.flatMap(item => [`${item.year} · ${item.title}`, item.text, effectText(item.effects), ''])] : []),
    '', '选择留下的性格痕迹', archetype.title, archetype.text,
    ...dimensions.flatMap(dimension => [
      `${dimension.name} · ${dimension.count} 条选择证据 · ${dimension.confidence}`,
      ...dimension.receipts.map(receipt => `  ${receipt.year} · ${receipt.choiceTitle} · ${receipt.context}`),
    ]),
  ];
  const url = URL.createObjectURL(new Blob(['\uFEFF', formatProtagonistText(cleanStoryCopy(lines.join('\n')))], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = '黄二勋的传奇人参-人生手记.txt';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announcement.textContent = '已请求下载人生手记。';
}

async function showPersonalityCard() {
  if (screen !== 'ending' || !report || report.decisionCount <= 0 || dialog.open) return;
  const request = ++cardRequest;
  const currentGame = game;
  const card = { ...getPersonalityCard(game, report), summary: getLifeSummary(report, game) };
  openModal('card', '你的分享卡', '<p role="status">正在生成图片……</p>', actionButton('close', '关闭'));
  try {
    if (cardCache?.state !== currentGame) {
      const blob = await createCardBlob(card);
      if (request !== cardRequest || activeDialog !== 'card') return;
      cardCache = { state: currentGame, blob,
        file: typeof File === 'function' ? new File([blob], '黄二勋的传奇人参-人生总结.png', { type: 'image/png' }) : null };
    }
    if (request !== cardRequest || activeDialog !== 'card') return;
    cardPreviewURL = URL.createObjectURL(cardCache.blob);
    const nativeShare = canShareCard(cardCache.file);
    const directCopy = canCopyCard(cardCache.blob);
    modalContent.innerHTML = `<div class="modal-head"><h2 id="modal-title" tabindex="-1">你的分享卡</h2></div>
      <div class="modal-body"><img class="share-card-image" src="${cardPreviewURL}" alt="${card.summary.resultLabel ? `${escapeHTML(card.summary.resultLabel.title)} · ${escapeHTML(card.summary.resultLabel.code)}。` : ''}${escapeHTML(card.summary.title)}。${card.summary.scored ? `总分 ${card.summary.score} / ${card.summary.maxScore}。` : ''}${escapeHTML(card.summary.comment)}。带有网站入口二维码的人生总结。">
        <p class="share-card-help">也可以长按图片保存，或 <a href="${cardPreviewURL}" target="_blank" rel="noopener">打开原图</a>。扫码开始新人生。</p>
      </div>
      <div class="share-card-footer"><p id="card-status" class="subtle" role="status">${directCopy ? '图片已生成，可以直接复制后粘贴。' : nativeShare ? '图片已生成，可以保存或分享。' : '图片已生成，可以保存后发给朋友。'}</p>
        <div class="actions">${actionButton('close', '关闭')}
          <a class="btn${nativeShare || directCopy ? '' : ' primary'}" href="${cardPreviewURL}" download="黄二勋的传奇人参-人生总结.png" data-action="card-save">保存图片</a>
          ${directCopy ? actionButton('card-copy', '复制图片', 'primary') : ''}
          ${nativeShare ? actionButton('card-share', '分享图片', directCopy ? '' : 'primary') : ''}
        </div>
      </div>`;
    modalContent.querySelector('#modal-title')?.focus({ preventScroll: true });
  } catch {
    if (request !== cardRequest || activeDialog !== 'card') return;
    modalContent.querySelector('.modal-body').innerHTML = '<p role="status">图片暂时未能生成，请重试。进度已保留。</p>';
    modalContent.querySelector('.actions').innerHTML = actionButton('close', '关闭') + actionButton('card-retry', '重新生成', 'primary');
  }
}

function setCardExportBusy(busy) {
  cardExportBusy = busy;
  for (const button of modalContent.querySelectorAll('[data-action="card-share"], [data-action="card-copy"]')) button.disabled = busy;
}

function copyCurrentCard() {
  if (activeDialog !== 'card' || !cardCache || cardExportBusy) return;
  const request = cardRequest;
  setCardExportBusy(true);
  modalContent.querySelector('#card-status').textContent = '正在复制图片……';
  copyCard(cardCache.blob).then(result => {
    if (request !== cardRequest || activeDialog !== 'card') return;
    setCardExportBusy(false);
    modalContent.querySelector('#card-status').textContent = {
      copied: '已复制图片，可以粘贴了。',
      failed: '未能复制图片，请重试或保存图片。',
      unsupported: '当前浏览器不支持复制图片，请保存图片后分享。',
    }[result];
  });
}

function shareCurrentCard() {
  if (activeDialog !== 'card' || !cardCache || cardExportBusy) return;
  const request = cardRequest;
  setCardExportBusy(true);
  // shareCard invokes navigator.share synchronously within this user's click.
  shareCard(cardCache.file).then(result => {
    if (request !== cardRequest || activeDialog !== 'card') return;
    setCardExportBusy(false);
    modalContent.querySelector('#card-status').textContent = {
      shared: '已交给系统分享。', cancelled: '已取消分享，图片仍可保存或再次分享。',
      failed: '暂时无法调用分享，请保存图片或长按图片后分享。',
      unsupported: '当前浏览器不支持图片分享，请保存图片后分享。',
    }[result];
  });
}

function returnHome() {
  if (activeDialog !== 'pause') return;
  closeModal(false);
  screen = 'home';
  render(true);
}

const actions = {
  new: newGameDialog, resume: resumeGame, close: closeModal, commit: applyChoice,
  pause: showPause, journal: showJournal, details: showDetails, state: showState, next: nextScene,
  lifechart: showLifeChart,
  'prep-receipt': showPrepReceipt,
  'if-ending': showIfEnding, 'if-settle': () => settleIf(false),
  'if-tragedy-confirm': confirmIfTragedy, 'if-tragedy': () => settleIf(true),
  export: exportReport, home: returnHome,
  card: showPersonalityCard, 'card-share': shareCurrentCard, 'card-copy': copyCurrentCard,
  'card-retry': () => { closeModal(false); showPersonalityCard(); },
  'card-save': () => { const status = modalContent.querySelector('#card-status'); if (status) status.textContent = '已请求保存图片。如果未下载，可长按图片保存或打开原图。'; },
};

document.addEventListener('click', event => {
  const candle=event.target.closest('[data-resource-year]');
  if (candle) updateResourceChart(Number(candle.dataset.resourceYear));
  const button = event.target.closest('[data-action]');
  if (button && Object.hasOwn(actions, button.dataset.action)) actions[button.dataset.action]();
});

document.addEventListener('change', event => {
  if (event.target.matches('#resource-metric, #resource-year')) { updateResourceChart(); return; }
  if (!event.target.matches('#choice-form input[name="choice"], #choice-form input[name="extra"]')) return;
  if (event.target.closest('.choice-plan')) { updateChoicePlan(); return; }
  syncChoiceDetails();
  document.querySelector('#choose-button').disabled = false;
  document.querySelector('#choice-hint').textContent = '已选好。下一步可核对影响，再确认选择。';
});

document.addEventListener('focusin', event => {
  if (!event.target.matches('#choice-form input:focus-visible')) return;
  event.target.closest('.choice-row').scrollIntoView({ block: 'nearest' });
});

document.addEventListener('keydown', event => {
  const candle=event.target.closest('[data-resource-year]');
  if (candle && ['Enter',' '].includes(event.key)) {
    event.preventDefault();
    const selected=Number(candle.dataset.resourceYear);
    updateResourceChart(selected);
    document.querySelector(`[data-resource-year="${selected}"]`)?.focus();
  }
});

// A missing optional illustration never blocks the story or leaves a broken-image icon.
document.addEventListener('error', event => {
  if (event.target instanceof HTMLImageElement) event.target.closest('figure')?.setAttribute('hidden', '');
}, true);

document.addEventListener('submit', event => {
  if (event.target.id === 'choice-form') {
    event.preventDefault();
    if (!event.target.isConnected || dialog.open) return;
    if (event.target.classList.contains('choice-plan')) {
      if (!event.target.querySelector('#choose-button').disabled) submitChoice(selectedPlanIds());
      return;
    }
    const optionId = new FormData(event.target).get('choice');
    if (optionId !== null) showConfirm(optionId);
  } else if (event.target.id === 'nickname-form') {
    event.preventDefault();
    const name = new FormData(event.target).get('nickname');
    const [seed] = crypto.getRandomValues(new Uint32Array(1));
    game = createGame(name, seed);
    analytics.newGame(game);
    cardCache = null;
    closeModal(false);
    clockStart = null;
    screen = 'play';
    saveGame();
    startClock();
    render(true);
  }
});

dialog.addEventListener('cancel', event => {
  event.preventDefault();
  closeModal();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && clockStart !== null) {
    stopClock();
    saveGame();
  } else {
    startClock();
  }
});
window.addEventListener('pagehide', () => {
  if (clockStart === null) return;
  stopClock();
  saveGame();
});
window.addEventListener('pageshow', startClock);

loadSave();
render();
setInterval(updateClock, 1000);
