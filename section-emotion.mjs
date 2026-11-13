import { formatProtagonistText } from './protagonist-copy.mjs';
import { cleanStoryCopy } from './display-story-copy.mjs';

// A reading of this settled moment, never a new event, score or saved memory.
// The face is an age-neutral expression sketch for the speaker already present.
const escape = value => formatProtagonistText(cleanStoryCopy(value)).replace(/[&<>"']/g,
  char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const list = value => Array.isArray(value) ? value : [];
const finite = value => typeof value === 'number' && Number.isFinite(value);
const change = (values, key) => finite(values?.[key]) ? values[key] : 0;
const validReaction = item => item && typeof item.speaker === 'string' && item.speaker.trim()
  && typeof item.text === 'string' && item.text.trim();

const EXPRESSIONS = Object.freeze({
  warm: {
    label: '温柔', face: '眼尾松下来，嘴角带着一点笑意。', voice: '声音放轻了，话里有暖意。', message: '字句里透着暖意。',
    eyes: 'M22 28q3-4 6 0M36 28q3-4 6 0', brows: 'M21 22q4-2 8 0M35 22q4-2 8 0', mouth: 'M25 37q7 8 14 0',
  },
  hopeful: {
    label: '期待', face: '眉梢扬起，眼神亮了一点。', voice: '语调扬起来，带着一点期待。', message: '字句里带着一点期待。',
    eyes: 'M25 27v2M39 27v2', brows: 'M21 21q4-4 8-1M35 20q4-3 8 1', mouth: 'M25 36q7 10 14 0Z',
  },
  tense: {
    label: '紧张', face: '眉头微微收紧，嘴角抿着。', voice: '声音有些绷紧，每句话都说得认真。', message: '措辞很认真，透着尚未放下的担心。',
    eyes: 'M25 28v2M39 28v2', brows: 'M21 24l8-3M35 21l8 3', mouth: 'M26 39q6-2 12 0',
  },
  angry: {
    label: '愠怒', face: '眉压得很低，嘴唇抿成了一条线。', voice: '语气压得很低，火气没有藏住。', message: '话很短，字里已有了火气。',
    eyes: 'M25 28v2M39 28v2', brows: 'M21 21l8 4M35 25l8-4', mouth: 'M25 40h14',
  },
  wry: {
    label: '苦笑', face: '一边眉梢抬起来，嘴角挂着一丝苦笑。', voice: '话里带着一点苦笑。', message: '字句里有一点自嘲的笑意。',
    eyes: 'M25 28v2M36 29h6', brows: 'M21 21q4-3 8 0M35 24h8', mouth: 'M25 39q8 3 14-3',
  },
  quiet: {
    label: '平静', face: '神情安静，听着这一次的安排。', voice: '声音平静，话说得很慢。', message: '字句平静，意思说得清楚。',
    eyes: 'M25 28v2M39 28v2', brows: 'M21 22h8M35 22h8', mouth: 'M27 38h10',
  },
});

const EVENT_COMMENTS = Object.freeze({
  'delivery-breakdown': '最难受的是，拼到这么晚，东西还是没能送出去；这次得带着失落把残局收好。',
  'financing-gap': '那笔没到账的钱，终于成了眼前的窘迫；心再急，也得先把今天撑过去。',
  'relationship-distance': '等候真的停下时，才听见那句“下次”有多轻；这一次，空下来的位置让人难受。',
  exhaustion: '连熟悉的话都接不住了，疲惫终于有了重量；这一回，停下来也需要勇气。',
  'governance-freeze': '握惯了的决定权忽然松了手，难堪和失落一起涌上来；这回得认真面对留下的问题。',
  'expansion-overhang': '曾经抢着要的机会，如今成了舍不得又扛不起的成本；缩回去，心里不会好受。',
  'team-runway-halts': '想让所有人留下的心是真的，撑不住的余额也是真的；这一刻尤其难开口。',
  'team-rescue': '损失还在，可这次有人接住了你；终于能喘口气，不必一个人把夜熬完。',
  'quality-dividend': '当初咬牙守住的标准，终于换来下一次信任；这口气，今天才算松下来。',
  'research-return': '有人独自跑通了你的方法，那份高兴很安静，却比一句夸奖留得更久。',
  'relationship-return': '又一次被算进周六的安排，心里有了小小的回暖；过去仍在，这次邀请也是真的。',
  'rebuild-orders': '这回真的站住了一点；失去的没有退回来，重新开始却终于有了着落。',
  'recovery-breath': '不用再靠熬夜补完一周，原来能让人这么松快；这点余力，终于留给了自己。',
  'team-stays-together': '这一次，一起留下不用靠硬撑；预算落定时，舍不得的人终于有了位置。',
  'handoff-dividend': '有人接得住，你终于可以松开手；少一点被需要，也多回一整个属于自己的下午。',
});

function currentChoice(result, game) {
  const journal = list(game?.lifeJournal).findLast(entry => entry?.step === game.step
    && String(entry.year) === String(result.year) && entry.choiceTitle === result.title);
  return { id: result.plan?.primaryId || journal?.optionId || '', set: journal?.set || {} };
}

function choiceComment(result, game, choice) {
  const { id, set } = choice;
  const life = game?.life || {};
  const personal = result.kind === 'life' || result.quality === 'personal';
  if (!personal) return '';
  if (id === 'life-1973-letter') return '把“我很想家”写出来，也有一点勇敢；难过终于不用全留在自己这里。';
  if (id === 'life-1973-brother') return '那顿饭没有让陌生的地方变熟，却让今晚不必一个人熬过去。';
  if (id === 'life-1973-date') return '心事还没讲完，今晚先允许自己睡个好觉；想念有了下一次落笔的日子。';
  if (id === 'life-1978-extra-shift') return '工资多了一点，那个想去玩的下午也确实空过去了；提前说好的取舍，仍会让人舍不得。';
  if (id === 'life-1978-table-tennis') return '打得好不好，今天没那么要紧；那个属于自己的下午，已经让人有了盼头。';
  if (id === 'life-1978-cooking') return '一锅有点咸的饭，也能让人舍不得散桌；这点热闹，值得记住。';
  if (id === 'life-1996-show-up' && !game?.life) return '这次答应过的陪伴，终于没有错过；那份被认真对待的感觉，值得留住。';
  if (id === 'life-1996-show-up') return life.children === 'parent'
    ? '台上看见你的那一眼，比解释更让人安心；这一晚，你没有错过。'
    : ['lori', 'maya'].includes(life.partner) && ['dating', 'married'].includes(life.relationship)
      ? '那份紧张里有了你的陪伴；这一次，对方想分享的时刻，你在场。'
      : '电话那头的小事终于被听完；有些亲近，就藏在这段没有匆匆挂断的时间里。';
  if (id === 'life-1996-reschedule') return '提前说清让人不必白等，失落却不会立刻散去；补约的那一天，仍值得认真留着。';
  if (/postpone-again|one-last-sacrifice/.test(id)) return '眼前的事留住了，这次的约定却落了空；对方那句失望，听着会刺痛。';
  if (set.relationship === 'separated' || set.marriageOutcome === 'divorced') return '把分开说清了，心里也未必立刻轻松；舍不得和继续往前，可以同时存在。';
  if (set.livingArrangement === 'apart') return '先分开住，是把彼此的空间还回去；话已经说清，心里的滋味还要慢慢消化。';
  if (set.relationshipRepair === 'trying' || set.marriageOutcome === 'repairing') return '愿意再谈一次，已经很不容易；盼头有了，旧伤仍需要时间。';
  if (set.partner && set.partner !== 'none' && set.relationship === 'dating') return '下一次见面有了日期，那点期待也有了着落；你们从这里慢慢靠近。';
  if (set.relationship === 'married') return set.children === 'parent'
    ? '亲近和手忙脚乱一起走进日子；这份心动，开始有了要共同承担的重量。'
    : '一起过日子的约定落下了，心里的暖意很具体；以后的小事，也要一起认真过。';
  if (set.partner === 'none' && set.relationship === 'single') return '把日子留给自己，也是一种认真的选择；这片空白，可以按自己的心意慢慢填。';
  if (set.partnerCareer) return '把对方想认真做的事放进安排里，那份期待终于有了位置。';
  if (set.relationshipRepair === 'repair_done') return '这次说到的，你真的做到了；亲近回来的那一点，很轻，也很珍贵。';
  if (set.memoirBoundary) return '有些话留下，有些话收好；回望这一程，也终于容得下那些没写完的地方。';
  if (set.publicBoundary) return '把公开的边界说清后，私人生活终于多了一点能自在呼吸的空间。';
  if (set.hobbyPractice && set.hobbyPractice !== 'dormant') return '日子里又有了一件只因喜欢而做的事；这点期待，不必向谁交代成绩。';
  return '';
}

function summarize(result, game, reaction) {
  const impact = result.impact || {};
  const events = list(impact.events).filter(event => event && typeof event === 'object');
  const crisis = events.find(event => event.tone === 'crisis');
  const breakthrough = events.find(event => event.tone === 'breakthrough');
  if (crisis && breakthrough) return '难处与转机在同一刻落下来，心还悬着，却终于看见一点亮；这一节，苦和暖都是真的。';
  const event = crisis || breakthrough;
  if (event) return Object.hasOwn(EVENT_COMMENTS, event.id) ? EVENT_COMMENTS[event.id]
    : crisis ? '这次的波折让人心里一沉；眼前的难处，得从这一刻慢慢收拾。'
      : '熬过的日子终于透进一点亮；这次的转机，值得让自己高兴一下。';
  if (result.quality === 'bad') return '这次没能如愿，失落可以先留一会儿；下一步，从还在手里的东西开始。';
  const specific = choiceComment(result, game, currentChoice(result, game));
  if (specific) return specific;
  if (result.quality === 'mixed') return '做成了一部分，也留下了不甘心；这一节的滋味，没法只用好坏讲完。';
  if (reaction?.tone === 'angry') return '话里已经带了火气；这次的决定，也留下了一段需要认真面对的隔阂。';
  const effects = result.effects || {};
  if (result.quality === 'good') {
    if (change(effects, 'bonds') < 0) return '事情往前走了，心里却没能一起轻松；那句不满，也是这次结果的一部分。';
    if (change(effects, 'stress') >= 8 || change(effects, 'energy') <= -8) return '终于做成了，疲惫也跟着落下来；高兴是真的，想歇一会儿也是真的。';
    return '这一步终于有了回响，前面的用力没有白费；先让自己高兴这一会儿。';
  }
  if (change(effects, 'bonds') > 0) return '这次相处多留下一点亲近，心也跟着暖了一点；往后的日子，仍要一回一回认真过。';
  if (change(effects, 'bonds') < 0) return '安排落定了，心里却还有一点空落；关系里那些没说完的话，仍值得被听见。';
  if (change(effects, 'energy') > 0 || change(effects, 'stress') < 0) return '终于给自己留了一点余地；不用立刻赶下一件事，也能让心里松快一些。';
  if (reaction?.tone === 'wry') return '没那么体面的这一刻，也可以笑一笑；不急着把自己写成一个完美的人。';
  return '这一步落定了，心里的滋味还没散；先把这一刻记下，再往前走。';
}

function delivery(result, reaction) {
  const scene = [result.text, result.impact?.environment, reaction.text].filter(value => typeof value === 'string').join(' ');
  if (/电话那头|电话两端|电话接通|电话一直|电话没有|通话|听筒|打给|挂断|线上会面|视频通话/.test(scene)) return 'voice';
  if (/消息(?:停在|里|中|发出|发来|送到)|发来|收到.{0,12}(?:消息|邮件|短信|字条)|回了.{0,5}(?:条|封)|来信|回信|邮件|短信|字条|留言|来了一封/.test(scene)) return 'message';
  return 'face';
}

export function getSectionEmotion(result, game = null) {
  if (!result || typeof result !== 'object' || !(result.text || result.label)) return null;
  if (game?.phase && !['result', 'life-result'].includes(game.phase)) return null;
  const reaction = list(result.impact?.reactions).find(validReaction);
  const tone = reaction && Object.hasOwn(EXPRESSIONS, reaction.tone) ? reaction.tone : 'quiet';
  const expression = EXPRESSIONS[tone];
  const medium = reaction ? delivery(result, reaction) : null;
  return {
    tone,
    speaker: reaction?.speaker || '',
    expression: reaction ? expression[medium] : '',
    expressionLabel: reaction ? expression.label : '',
    medium,
    comment: summarize(result, game, reaction),
  };
}

function faceMarkup(tone) {
  const face = EXPRESSIONS[tone];
  return `<svg class="section-emotion-face" viewBox="0 0 64 68" width="52" height="56" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path class="section-emotion-silhouette" d="M15 30c-2-17 6-24 17-24s19 7 17 24M18 28v6c0 13 7 19 14 19s14-6 14-19v-6M18 29c-7-3-7 12 1 11M46 29c7-3 7 12-1 11M12 65c1-8 8-11 14-12m12 0c6 1 13 4 14 12M17 20q10-9 24-5"/>
    <path d="${face.brows}"/><path d="${face.eyes}"/><path d="M32 29l-1 5h3" opacity="0.65"/><path d="${face.mouth}"/>
  </svg>`;
}

export function renderSectionEmotion(result, game = null) {
  const emotion = getSectionEmotion(result, game);
  if (!emotion) return '';
  return `<div class="section-emotion${emotion.speaker ? '' : ' section-emotion-no-speaker'}" data-emotion="${emotion.tone}" role="group" aria-label="这一节的表情与评语">
    ${emotion.speaker ? faceMarkup(emotion.tone) : ''}
    <div class="section-emotion-copy">
      ${emotion.speaker ? `<p class="section-emotion-person"><span class="section-emotion-speaker">${escape(emotion.speaker)}</span><span>${escape(emotion.expression)}</span></p>` : ''}
      <p class="section-emotion-comment"><span class="section-emotion-caption">这一节</span>${escape(emotion.comment)}</p>
    </div>
  </div>`;
}

export function sectionEmotionText(result, game = null) {
  const emotion = getSectionEmotion(result, game);
  return emotion ? [emotion.speaker ? `${emotion.speaker} · ${emotion.expression}` : '', `这一节 · ${emotion.comment}`].filter(Boolean) : [];
}
