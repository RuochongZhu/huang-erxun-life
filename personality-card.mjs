// Personality copy uses the same observations as the 16-dimension report.
// The ending can supply its own art and palette without changing that assessment.
import { formatProtagonistText } from './protagonist-copy.mjs';
import { cleanStoryCopy } from './display-story-copy.mjs';
import { getPersonalityArt } from './personality-art.mjs';
import { getIfCardArt } from './if-card-art.mjs';
import { getResultLabel } from './result-labels.mjs';

export const SITE_URL = 'https://play.socialai.buzz/';
export const PORTRAIT_URL = new URL('./assets/jensen-guide.webp', import.meta.url).href;
export const QR_URL = new URL('./assets/site-entry-qr.png', import.meta.url).href;

const HABITS = [
  ['遇到风险，你会先留好退路', '有把握的事，你愿意多投入一些'],
  ['你更在意眼前的生活能不能过稳', '你愿意为以后的事提前准备'],
  ['你习惯按自己的计划做事', '你总能留意到新机会'],
  ['你愿意再试一阵', '走不通时，你会及时换办法'],
  ['发现自己想错了，你会改主意', '认准一件事，你会坚持做下去'],
  ['遇到困难，你习惯先自己想办法', '遇到困难，你会找人商量'],
  ['你常凭直觉做决定', '决定之前，你会先核对资料'],
  ['情况有变，你就跟着调整', '你习惯先排好计划，再逐步完成'],
  ['你愿意放手让别人负责', '重要的事，你更想自己负责'],
  ['你只答应自己能做到的事', '有机会时，你通常愿意先试试'],
  ['一起做事前，你会先把分工说清', '做决定时，你会考虑身边人的感受'],
  ['你更喜欢把手头的事做好', '需要出面沟通时，你愿意站出来'],
  ['你会给工作设个结束时间', '一忙起来，你容易忘记下班'],
  ['事情没做完，你会再撑一会儿', '累了的时候，你会先休息'],
  ['你的时间更多留给了工作', '再忙，你也会留时间给家人和自己'],
  ['事情过后，你习惯想想哪里可以改进', '一件事结束，你就开始准备下一件'],
];
const confidenceRank = { '充分': 3, '初步': 2, '有限': 1, '未观察': 0 };
// The neon palette belongs to the completed, fantastical outcomes.
const DARK_CARD_ENDINGS = new Set(['nightlife_success', 'research_global', 'president_elected', 'solar_city']);

export function getPersonalityCard(state, report) {
  const dimensions = report.dimensions.filter(d => d.score !== null)
    .sort((a, b) => confidenceRank[b.confidence] - confidenceRank[a.confidence]
      || Math.abs(b.score - 50) - Math.abs(a.score - 50) || a.id - b.id);
  const strong = dimensions.filter(d => d.confidence === '充分').slice(0, 2);
  const provisional = report.early || strong.length < 2;
  const traits = dimensions.slice(0, 3).map(d => ({
    id: d.id, name: d.name, label: d.score === 50 ? '两端都试过' : d.score > 50 ? d.high : d.low,
    confidence: d.confidence,
  }));
  const intro = strong.length === 2 ? strong.map(d => d.score === 50
    ? `在${d.name}上，你试过不同的做法`
    : HABITS[d.id][d.score > 50 ? 1 : 0]).join('；') + '。'
    : report.decisionCount ? '目前的选择还不多，这个称号先作参考。'
      : '你还没做出选择，暂时没有性格分析。';
  const evidence = [...state.evidence, ...state.lifeEvidence.map(e => ({ ...e, step: `life:${e.step}` }))];
  const receipts = [];
  const used = new Set();
  for (const d of dimensions) {
    // Match dimensionReport's first observation per step; never count a second
    // action from the same step as new evidence for the same dimension.
    const observations = new Map();
    for (const e of evidence) {
      const trait = e.traits.find(t => t.dim === d.id);
      if (trait && !observations.has(e.step)) observations.set(e.step, { e, trait });
    }
    const candidate = [...observations.values()].reverse().find(({ e, trait }) =>
      (d.score === 50 || Math.sign(trait.d) === Math.sign(d.score - 50))
      && !used.has(`${e.step}:${e.optionId}`));
    if (!candidate) continue;
    const { e } = candidate;
    used.add(`${e.step}:${e.optionId}`);
    receipts.push({ year: e.year, title: e.choiceTitle, dimension: d.name });
    if (receipts.length === 2) break;
  }
  return {
    name: state.name, title: report.archetype.title.replace('（暂定）', ''), intro,
    art: getIfCardArt(state, report) || getPersonalityArt(report),
    era: DARK_CARD_ENDINGS.has(getResultLabel(state, report).ending.id) ? 'if' : 'past',
    provisional, traits, receipts, decisionCount: report.decisionCount,
    completedSteps: report.completedSteps,
    note: '本局选择的趣味画像', siteURL: SITE_URL,
  };
}

const FONT = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
const INK = '#172623', GREEN = '#205543', PAPER = '#f5f3ec';
const graphemes = typeof Intl.Segmenter === 'function'
  ? text => [...new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(text)].map(s => s.segment)
  : text => Array.from(text);

export function wrapCardText(ctx, text, width) {
  const closing = /^[，。！？；：、）》】」』,.!?;:%”’]$/u;
  const opening = /^[（《【「『“‘]$/u;
  return formatProtagonistText(cleanStoryCopy(text)).split('\n').flatMap(paragraph => {
    const lines = [];
    let line = '';
    for (const char of graphemes(paragraph)) {
      if (line && ctx.measureText(line + char).width > width) {
        const previous = graphemes(line);
        let carry = '';
        if (closing.test(char) && previous.length > 1) carry = previous.pop();
        while (previous.length > 1 && opening.test(previous.at(-1))) carry = previous.pop() + carry;
        lines.push(previous.join(''));
        line = carry + char;
      } else line += char;
    }
    if (line || !paragraph) lines.push(line);
    // A trailing punctuation mark or one-character fragment gets balanced with
    // its preceding line, without dropping text or allowing a wider line.
    if (lines.length > 1 && graphemes(lines.at(-1)).length < 4) {
      const joined = graphemes(lines.at(-2) + lines.at(-1));
      let best = null;
      for (let i = 1; i < joined.length; i++) {
        if (opening.test(joined[i - 1]) || closing.test(joined[i])) continue;
        const left = joined.slice(0, i).join(''), right = joined.slice(i).join('');
        const a = ctx.measureText(left).width, b = ctx.measureText(right).width;
        if (a <= width && b <= width && (!best || Math.abs(a - b) < best.gap)) best = { left, right, gap: Math.abs(a - b) };
      }
      if (best) lines.splice(-2, 2, best.left, best.right);
    }
    return lines;
  });
}

// The browser and PNG export use the same summary as the ending page.
// Keep complete text; the canvas grows only for unusually long names or copy.
export function drawPersonalityCard(canvas, data, { portrait, qr }) {
  const width = 1080, margin = 64, contentWidth = width - margin * 2;
  const palette = data.era === 'if'
    ? { ink: '#e6ebf3', accent: '#78e4d5', paper: '#101321', muted: '#a6aebb', rule: '#344052' }
    : { ink: INK, accent: GREEN, paper: PAPER, muted: '#4d5b54', rule: '#d4d5c9' };
  let ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('当前浏览器无法生成图片');
  const blocks = [], traitRows = [];
  const summary = data.summary || { title: data.title, comment: data.intro, values: [], scored: false };
  const block = (text, x, y, size, lineHeight, maxWidth = contentWidth, weight = 400, align = 'left', color = palette.ink) => {
    ctx.font = `${weight} ${size}px ${FONT}`;
    const lines = wrapCardText(ctx, String(text ?? ''), maxWidth);
    blocks.push({ lines, x, y, size, lineHeight, maxWidth, weight, align, color });
    return y + lines.length * lineHeight;
  };
  block('黄二勋的传奇人参', margin, 34, 42, 56, contentWidth, 700);
  const resultLabel = summary.resultLabel;
  const portraitTop = 138, portraitSize = 244;
  const headerX = 348, headerWidth = width - margin - headerX;
  const headerStart = blocks.length;
  let headerEnd = block(resultLabel?.title || summary.title, headerX, portraitTop, 54, 74, headerWidth, 700, 'left', palette.accent);
  if (summary.scored) {
    const scoreLabel = summary.provisional ? '阶段总分' : '人生总分';
    headerEnd = block(`${summary.score} / ${summary.maxScore} · ${scoreLabel}`, headerX, headerEnd + 10, 42, 58, headerWidth, 700);
  }
  const portraitBottom = portraitTop + portraitSize;
  const headerOffset = Math.max(0, (portraitBottom - headerEnd) / 2);
  for (const item of blocks.slice(headerStart)) item.y += headerOffset;

  let y = Math.max(portraitBottom, headerEnd + headerOffset) + 30;
  if (resultLabel) {
    y = block(resultLabel.quip, margin, y, 38, 56, contentWidth) + 22;
    y = block(summary.title, margin, y, 40, 56, contentWidth, 700) + 16;
  }
  y = block(summary.comment, margin, y, 38, 56, contentWidth) + 26;
  const gridY = y;
  for (const [index, item] of (summary.values || []).entries()) {
    const columnWidth = (contentWidth - 64) / 2;
    const x = margin + (index % 2) * (columnWidth + 64);
    const rowY = gridY + Math.floor(index / 2) * 88;
    block(item.label, x, rowY + 17, 32, 44, columnWidth - 156, 400, 'left', palette.muted);
    block(item.value, x + columnWidth, rowY + 8, 46, 58, 148, 700, 'right', palette.accent);
    traitRows.push({ x, y: rowY + 74, width: columnWidth });
  }
  if (summary.values?.length) y += Math.ceil(summary.values.length / 2) * 88 + 14;
  const footerY = y + 12;
  const qrRect = { x: margin, y: footerY + 24, width: 224, height: 224 };
  block('扫码开始你的人生', 326, qrRect.y + (qrRect.height - 54) / 2, 40, 54, 690, 700);
  canvas.width = width;
  canvas.height = footerY + 276;
  ctx = canvas.getContext('2d');
  ctx.fillStyle = palette.paper; ctx.fillRect(0, 0, width, canvas.height);
  ctx.fillStyle = palette.accent;
  ctx.fillRect(margin, 108, contentWidth, 2);
  ctx.fillRect(margin, footerY, contentWidth, 2);
  ctx.drawImage(portrait, margin, portraitTop, portraitSize, portraitSize);
  ctx.fillStyle = palette.rule;
  for (const row of traitRows) ctx.fillRect(row.x, row.y, row.width, 1);
  ctx.textBaseline = 'top';
  for (const b of blocks) {
    ctx.font = `${b.weight} ${b.size}px ${FONT}`;
    ctx.fillStyle = b.color; ctx.textAlign = b.align;
    b.lines.forEach((line, i) => ctx.fillText(line, b.x, b.y + i * b.lineHeight));
  }
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrRect.x, qrRect.y, qrRect.width, qrRect.height);
  ctx.drawImage(qr, qrRect.x, qrRect.y, qrRect.width, qrRect.height);
  return { width, height: canvas.height, blocks, traitRows, qrRect };
}
