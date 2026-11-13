// Optional story expansion. Previous editions keep their exact replay contract.
// All additional conversations, relationships and family incidents are fiction.
export const RELATIONSHIP_SOURCES = [
  {id:'relationship-accountability-2026',title:'NVIDIA：2026年11月8日致员工信',url:'https://nvidianews.nvidia.com/news/a-message-to-our-company',note:'官方刊登的本人陈述；仅作2026公开背景，不补造真实家属反应和私密细节，玩家的婚姻与未来另行发展。'},
];

const EDITION = '2026.11';
const paired = life => ['dating', 'married'].includes(life.relationship) && ['lori', 'maya'].includes(life.partner);
const nameOf = life => life.partner === 'lori' ? 'Lori' : '麦雅';
const fictional = (name, role) => ({ name, role, kind:'虚构角色' });
const traits = (...values) => values.map(([dim,d]) => ({dim,d}));
const hasChoice = (state, ...ids) => (state.lifeJournal || []).some(entry => ids.includes(entry.optionId));

function option(year, key, title, description, tradeoff, text, effects, set, axes) {
  return { id:`life-${year}-story-${key}`, title, description, tradeoff, consequence:text,
    text, label:title, effects, set, traits:traits(...axes) };
}

function add(scene, story, options, extra = {}) {
  const { people = [], ...rest } = extra;
  return {
    ...scene, ...rest,
    story:scene.story + '\n' + story,
    people:[...(scene.people || []), ...people],
    options:[...scene.options, ...options].slice(0, 6),
    fact:{ ...scene.fact, text:scene.fact.text + ' 新增的约会、家庭协商和公众误读均为黄二勋的虚构剧情。' },
  };
}

function romanceEcho(state) {
  const life = state.life;
  if (!paired(life)) return '';
  const lastPromise = (state.lifeJournal || []).findLast(entry => entry.set?.romancePromise);
  if (!lastPromise) return '';
  // A promise belongs to the relationship in which it was made. Reuniting later
  // does not silently restore an old promise or erase a recorded separation.
  const after = (state.lifeJournal || []).filter(entry => entry.step > lastPromise.step);
  if (after.some(entry => entry.set?.relationship === 'separated'
    || (entry.set?.partner !== undefined && entry.set.partner !== life.partner))) return '';
  if (lastPromise.lifeAfter?.partner && lastPromise.lifeAfter.partner !== life.partner) return '';
  return {
    distance:'当年约定的异地见面还记在旧日历上。往后怎样住、怎样见面，不能只靠“以后再说”。',
    shared_city:'你曾答应和对方在同一座城市试着生活。新的职位和项目出现时，这个约定也要重新商量。',
    engaged:'你们曾把订婚与生育分开谈。那次答应的共同生活，需要今天的时间来兑现。',
    weekends:'你们给彼此留过完整的周末。新工作可以争取，那个周末也不是默认可取消的空档。',
    two_cities:'你们曾同意各自去争取职业机会，分居两地。下一次见面的安排仍需两个人一起决定。',
    shared_home:'你们曾决定把住在一起放在职业机会之前。今天的日程里还要有两个人各自的工作。',
  }[lastPromise.set.romancePromise] || '';
}

function familyFundingContext(state) {
  const exposure = state.life.familyExposure;
  if (exposure === 'separate') return '1993 年算启动开支时，你就把父母的积蓄和家人的担保划在外面。现在工作有了缺口，还是得从自己的预算里想办法。你还答应了家人留出今晚。';
  if (exposure !== 'capped') return '';
  // The same exposure marker is also used by a vague appeal for support.
  // Read the actual choice before describing a financial agreement.
  if (hasChoice(state, 'impact-1993-life-family-cheer')) return '1993 年那顿饭上，你把创业讲得很热闹，家人和朋友都说你可以试试。席间没谈定谁出钱，也没定用途和上限，父母没有承诺汇款。现在家里想听你说清，自己的钱够用多久，还打算开口请谁帮什么忙。';
  if (!hasChoice(state, 'life-1993-story-capped-family-support')) return '你翻出当年的家庭预算。谁答应过出钱、能用在哪儿、最多能拿多少，都还要核对。账上得分清已经收到的、还停在口头上的，以及已经花出去的。';
  const use = {
    company:'后来你开了图形芯片公司。试做、场地租金和没了固定工资后的生活费，你还没说清各用哪一笔钱，哪些开支已经有项目资金。',
    studio:'后来你开了工作室。设备租金和等客户付款期间的生活费，哪些用家里的支持、哪些该等客户款，你还没跟家里说清。',
    researcher:'后来你留校做图形研究。自己的生活费、要自掏腰包的实验准备和学校的项目经费，你还没跟家里说清哪些要动用他们的钱。',
    employee:'后来你保住了工作和工资，图形试验也还得走单位审批。有没有哪项个人开支需要父母帮忙，你还没跟家里说清。',
  }[state.route] || '工作换了安排，父母当时答应帮的那笔钱还要不要动、能用在哪些个人开支，你还没跟家里说清。';
  return `1993 年，父母来信说，可以从日常开支之外拿一笔钱，帮你过换工作的这一段。你把他们答应的数额单列在预算里，当时说好就到这个上限。${use}家里等你把账摊开说清楚，实际收到多少，付了哪些费用，还剩多少。尚未收到的部分还不能花，也不能临时请他们再加。`;
}

export function enrichRelationshipScene(original, state) {
  if (state?.storyEdition !== EDITION || !state.life || state.life.historyKnown === false) return original;
  const life = state.life;
  const couple = paired(life);
  const name = couple ? nameOf(life) : '';
  const children = life.children === 'parent';
  const year = Number(original.year);
  const oldEcho = romanceEcho(state);
  let scene = oldEcho && state.step > 2 ? { ...original, echo:[original.echo, oldEcho].filter(Boolean).join(' ') } : original;

  if (state.step === 2) return add(scene,
      '你把两座城市间的车程抄在求职资料背面。Lori 还想把最后一年的课读完，麦雅刚接下本地的设计项目。你一时答不出来，等工作定下来，下回见面得坐多久的车。', [
      option(1984,'distance','和 Lori 试着异地一年，先定下见面日期','两人同意开始交往，每月轮流安排一次见面；她毕业以后再决定是否搬到一起。','来回车费要自己承担，临时加班也不能总让对方改票。','你们在同一页日历上圈出三次见面。第一趟车票由你来买，她仍按自己的计划完成学业；一年后的城市还没有定下来。',{money:-5,energy:-4,bonds:7},{partner:'lori',formerPartner:'none',relationship:'dating',partnerCareer:'parallel',romancePromise:'distance'},[[7,1],[14,1]]),
      option(1984,'shared-city','和麦雅交往，认真找同一座城市的机会','先确认彼此愿意交往，再分别寻找能接受的工作；任何一人都可以拒绝不合适的岗位。','找工作的范围变小，也可能要晚一些搬走。','你们没有替对方投简历，只交换了各自不能放弃的条件。麦雅愿意一起看看机会；工作还没定，同城成了两个人要共同完成的计划。',{money:-2,energy:-5,bonds:6,stress:2},{partner:'maya',formerPartner:'none',relationship:'dating',partnerCareer:'parallel',romancePromise:'shared_city'},[[5,1],[9,-1],[14,1]]),
    ]);

  if (state.step === 3) {
    if (couple) return add(scene,
      `${name}把婚礼预算推过来，划掉了几项：“这些是他们想办的。你自己想请谁来？”父母想请亲戚，下个月还有房租和课费要交。`, [
        option(1992,'engage-first','先订婚，把婚礼与生育留到以后再谈','两人确认愿意继续走下去，先办一顿简单的家人聚餐；约定半年后再核对住处、工作和婚育打算。','订婚不是问题的解决办法，悬着的安排仍要如期谈清。','聚餐结束后，你们留下的是下一次谈话的日期。两人订婚但尚未结婚，也没有孩子；学业和工作仍照各自的进度往前走。',{energy:-3,bonds:5,stress:1},{relationship:'dating',romancePromise:'engaged',partnerCareer:'parallel',studyPace:'steady'},[[7,1],[9,-1],[14,1]]),
        option(1992,'small-wedding','办一场小婚礼，暂时不决定是否育儿','和双方家人解释预算，只邀请亲近的人；共同生活先从房租、家务与各自的工作安排开始。','有人会觉得太简单；未来是否育儿仍需另一次明确决定。','婚礼只用了一个下午。你们结婚，保留了两份职业计划；孩子没有因为婚礼而自动进入生活，家里的轮值表却从下周开始执行。',{money:-3,energy:-2,bonds:5},{relationship:'married',children:'undecided',childCount:0,childStartYear:0,romancePromise:'shared_home',partnerCareer:'parallel',studyPace:'steady',workBoundary:'shared'},[[9,-1],[10,1],[14,1]]),
      ]);
    return add(scene,
      '家里打电话问你，什么时候能带一个人回来吃饭。你不想为了交差开始一段关系，也不想把每次询问都用“工作忙”挡回去。陈立文说，周末那顿饭不必带谁来，你自己来就行。', [
        option(1992,'family-pressure','告诉父母暂时不相亲，照常回去吃饭','认真解释目前的打算，约好探望；不拿婚育承诺换取父母安心。','这次谈话可能不愉快，之后仍要面对重复的询问。','你没有答应年底带人回家，仍把下次探望定了下来。父母有些失望，电话却没有因此挂断；是否恋爱和是否关心家人可以分别回答。',{energy:-2,bonds:2,stress:1},{familyPractice:'scheduled',socialPractice:'close_circle',relationshipRepair:'own_pace'},[[9,-1],[10,1]]),
      ]);
  }

  if (state.step === 4) return add(scene,
    `${couple ? `${name}问你` : '陈立文帮你核对账单时问'}：“要是下一轮钱没进来，你还打算回家拿吗？”父母的信就压在账本旁边，只说愿意帮一点。你们还没谈清这笔钱付什么、最多出多少。`, [
      option(1993,'no-family-guarantee','不动父母积蓄，也不让家人替项目担保','缩小眼前计划，列出只能用个人资金完成的第一阶段；以后扩大投入也要重新商量。','试验规模缩小，进度和谈判余地都会受影响。','你把父母那封信收回抽屉，删掉预算里的家庭追加款。第一阶段少做两项功能，家人的日常开支却有了明确边界。',{money:-3,energy:-3,stress:-3},{familyExposure:'separate',familyPact:'limited_stake',workBoundary:'protected'},[[0,-1],[7,1],[9,-1]]),
      option(1993,'capped-family-support','接受一笔说清上限的家庭支持','只接受家人愿意提供、不会影响日常的一笔支持，写清用途、上限和复查日期；不同意临时追加。','即便金额有限，经营受挫也会影响亲人对你的信任。','钱进入了单独一栏，旁边是所有人同意的上限。你得到启动余地，也多了一项要如实汇报的承诺；之后不能用一句“再撑一下”索要追加。',{money:4,energy:-2,stress:4},{familyExposure:'capped',familyPact:'guardrail',familyPractice:'scheduled'},[[5,1],[7,1],[9,-1]]),
    ]);

  if (state.step === 5) {
    const backing = familyFundingContext(state);
    return add(scene,
      `${backing}${backing ? '\n' : ''}${couple ? `${name}说：“你忙你的，先告诉我今晚还等不等你。”` : 'Jeff 留了话：“你今晚还打不打来？我好安排时间。”'}你手边还是那份明天要用的故障记录。约好的时间快到了，电话还没回。`, [
        option(1996,'honest-night',couple ? `把这一晚留给${name}，听完对方的不满` : '先给 Jeff 打电话，听完他最近的难处',children ? '把孩子的接送和晚饭安排好，工作材料交给同事；谈清最近谁承担了哪些本来没有说好的事。' : '把手上的材料交给同事，保留半小时不接工作电话；先听对方说完，再解释自己的困难。','准备工作少一轮，谈话也可能暂时没有一致答案。',couple ? '这次你没有列出自己有多忙。两人把最近几次失约逐项说清，约好下周先调整一件事。问题还在，但对方不必靠猜测了解你的安排。' : 'Jeff 终于说到他自己的近况。你们没有只讨论你的危机；电话结束前，两人各定了下次能做到的联系时间。',{energy:-4,bonds:7,control:-2,stress:1},{relationshipRepair:'heard',workBoundary:'shared',familyPractice:'scheduled'},[[5,1],[8,-1],[10,1]]),
        option(1996,'postpone-again','今晚继续赶材料，明早再解释','发一条取消消息，继续完成工作；承认这一晚没能兑现，也暂时给不出补约日期。','对方仍要独自处理临时变动，信任不会因工作完成就恢复。','材料按时写完。第二天，你面对的不只是困倦，还有那条没有得到回复的消息。工作过关了，失约这件事仍留在你们之间。',{engineering:3,energy:-5,bonds:-5,stress:5},{relationshipRepair:'unrepaired',workBoundary:'seasonal'},[[12,1],[14,-1],[9,1]]),
    ]);
  }

  if (state.step === 6) {
    const missed = life.relationshipRepair === 'unrepaired' || hasChoice(state,'life-1996-reschedule');
    const repairText = missed ? '上次临时取消的那一晚还没有补上。' : '你们已经很久没有一起度过一个不用赶往下一站的下午。';
    if (couple) return add(scene,
      `${repairText}${name}翻开日历：“这回先挑一天吧。散个步、吃顿饭也行。”${children ? '那天谁来照看孩子，也得提前约好。' : ''}`, [
        option(1997,'make-up-weekend',missed ? '兑现那次补约，完整陪对方一个下午' : '安排一个不接工作电话的约会',children ? '提前和愿意帮忙的亲友商量照护时间，之后负责回请；地点选在步行可达的地方。' : '把日程提前告诉同事，选择不用订票的散步和晚饭；到约定时间就离开办公室。','要推迟一项工作；即使到场，之前的失望也可能仍需慢慢修复。','你按时出门，吃饭时没有把手机放在桌边。谈到上次的事，两人仍有不同看法；但这一次约会确实发生了，下一次也有了日期。',{energy:-3,bonds:6,stress:-3},{relationshipRepair:'repair_done',romancePromise:'weekends',workBoundary:'protected',familyPractice:'scheduled'},[[7,1],[10,1],[14,1]]),
        option(1997,'separate-with-care','认真谈过之后，结束这段关系',children ? '两人同意分开，整理住处与共同开支；孩子的照护继续共同承担，明确接送、联系与费用分工。' : '两人同意分开，归还物品、结清共同开支；之后的生活各自安排，不让对方继续等候。','失去日常亲近，重新安排生活要花时间；分开不会让所有争执立即消失。',children ? '你们分开了，孩子仍是你们共同照应的人。下一次接送由你负责，原定费用照付；关系的结束没有取消已经承担的家庭责任。' : '最后一箱东西搬走后，屋里安静下来。你们结束了恋人关系，没有继续许诺一个模糊的以后；接下来的周末需要重新安排。',{energy:-4,bonds:-5,stress:5},{formerPartner:life.partner,partner:'none',relationship:'separated',partnerCareer:'undecided',relationshipRepair:'separated',romancePromise:'none',...(children ? {coParenting:'scheduled',familyPractice:'scheduled'} : {})},[[3,1],[9,-1],[15,1]]),
      ]);
    return add(scene,
      `${life.relationship === 'separated' ? '你还在适应分开后的周末。' : '最近几次朋友聚餐，你总到得最晚。'}陈立文说，周日来做顿饭吧，不用带工作资料，也不用解释什么时候会开始恋爱。`, [
        option(1997,'friends-after-change','先把周末过好，和老朋友做一顿饭','提前回信确认到场，带上家里现成的食材；不急着用新恋情填满空出来的时间。','工作要少做一晚，也得接受朋友不会随时都有空。','你准时到了，帮忙切菜和收拾。饭桌上没有人替你安排下一段恋情。临走前，你主动约了下个月的饭。',{energy:3,bonds:4,stress:-4},{relationshipRepair:'own_pace',socialPractice:'open_table',familyPractice:'shared_table'},[[5,1],[13,1],[14,1]]),
      ]);
  }

  if (state.step === 7) {
    if (couple) return add(scene,
      `${name}拿到一个外地项目。${life.partner === 'maya' ? '设计团队想请她从头到尾负责一个作品，她很想接。' : '她想接这份工作，项目的时间却和你们现在的安排撞上了。'}她把对方给的日期拿给你看，等你说哪几天能腾出来。${life.relationshipRepair === 'unrepaired' ? '上次你也答应过留出时间，临时取消的事还没谈完。' : ''}`, [
        option(1999,'two-cities','支持对方去试一年，重新安排异地生活','两人同意保留这段关系，分别负责探望和日常；先试一年，再决定是否同城。','两地往返消耗钱和精力，想念与误会都可能增加。','对方接下了项目，你们把下一次见面写进日历。各自的工作继续，关系也继续；每天都有空聊天却不是这份安排的前提。',{money:-5,energy:-4,bonds:4,stress:3},{partnerCareer:'protected',romancePromise:'two_cities',relationshipRepair:'agreed',workBoundary:'shared'},[[8,-1],[10,1],[14,1]]),
        option(1999,'same-city-plan','自己调整一项工作，争取继续住在一起','问清岗位和项目能否调整，再决定搬迁；不要求对方放弃机会，也不许诺自己做不到的调动。','你可能放慢晋升或少接一个项目；同城也不代表生活从此没有冲突。','你推掉了一项需要长期驻外的工作，把可调整的部分逐项谈好。两人继续同城生活，这次为共同日常让出时间的人是你。',{money:-2,energy:-3,control:-2,bonds:6},{partnerCareer:'protected',romancePromise:'shared_home',workBoundary:'protected',relationshipRepair:'agreed'},[[0,-1],[8,-1],[14,1]]),
      ]);
    return add(scene,
      `${life.formerPartner === 'maya' ? '你和麦雅都记得上一次分开的原因。' : '这次与麦雅见面，两人都比从前更清楚自己的日程。'}她说可以先一起吃几次饭，不必在今晚给关系起名字。`, [
        option(1999,'slow-dates','愿意再见面，先不承诺恋爱或复合','双方同意先约三次见面，坦白现在能给出的时间；之后是否交往，再由两人决定。','对方可能改变主意，你也不能把这些见面当成已经恢复关系。','你们约好下次吃饭，但没有确认恋人关系。生活记录仍保留你现在的身份；三次见面之后，也允许有人说不继续。',{energy:-2,bonds:2,stress:1},{relationshipRepair:'slow_contact',socialPractice:'open_table'},[[7,1],[9,-1],[10,1]]),
        option(1999,'no-reunion','说明不想开始这段关系，保留适当距离','认真回复邀请，不用暧昧话让对方继续等待；如果双方都愿意，可以仍做普通朋友。','少了一个可能的同行者，之后的周末仍要自己安排。','你把不愿继续的部分说清。两人没有开始新的关系，也没有把朋友身份变成候补恋人；你把周末约回了自己的生活。',{energy:3,stress:-2,bonds:-1},{relationshipRepair:'own_pace',socialPractice:'close_circle',workBoundary:'protected'},[[9,-1],[13,1]]),
      ]);
  }

  if (state.step === 8) return add(scene,
    `${couple ? `${name}最近提过几次，想有个晚上一起吃饭，别一见面就对家务。` : '你翻了翻通话记录，最近几次找家人和朋友，都只说完要办的事就挂了。'}活动主办方这时来问，能不能把你和亲友的合影放进活动介绍。相片里的人还没看过那份介绍。`, [
      option(2007,'private-evening',couple ? `留一个晚上，和${name}重新约会` : '给家人朋友留一晚，只聊彼此近况',children ? '提前落实孩子的照护安排，再约一段不被工作打断的时间；不把对方当成家里默认值班的人。' : '把这一晚从工作安排里划出来，先问对方想怎么过，再一起决定。','少处理一轮工作邮件，第二天需要自己补上。',couple ? '这顿饭没有拿来开家庭会议。你们聊起最近喜欢的东西，也聊到不再合适的旧习惯；一起生活多年，仍有需要重新了解的部分。' : '你没有先讲项目进展，而是听完对方最近遇到的事。电话比平时长，下一次联系也不用等到谁有难处。',{energy:-3,bonds:5,stress:-3},{relationshipRepair:couple ? 'repair_done' : 'own_pace',workBoundary:'protected',familyPractice:'scheduled',...(couple ? {romancePromise:'weekends'} : {})},[[10,1],[14,1]]),
      option(2007,'photo-consent','合影先不发，逐一征求照片里的人同意','告诉主办方需要时间；有人不愿公开，就换成只拍自己的照片。','材料准备要重做，不能借家庭合影增加亲近感。','你没有代替别人回复同意。最终交出去的是一张独照，合影仍留在私人相册；以后公开家人的近况，也沿用这条约定。',{energy:-2,communication:2,control:-1},{publicBoundary:'consent',familyPractice:'scheduled'},[[8,-1],[9,-1],[10,1]]),
    ]);

  if (state.step === 9) return add(scene,
    `${couple ? `你和${name}也各有需要照应的长辈。她提醒你，照护表不能只写你这一边的家人。` : 'Jeff 提醒你，他也有不能改期的工作和个人安排。'}父母又说了一遍，不想因为你们担心，就把所有东西搬去一座陌生的城市。`, [
      option(2012,'care-rota',couple ? '把双方长辈的照护放在一张轮值表上' : '先问 Jeff 能承担多少，再排兄弟轮值','分别征求家人意见，再安排交通、联络和可请人协助的事项；没人被默认全天待命。','协调需要时间，自己的工作和假期也要作出让步。','表上不再只有“谁方便谁去”。每个人确认了自己能承担的事项，临时有变要主动联系替班；下一次探望也给彼此留了休息时间。',{energy:-4,bonds:5,stress:-2},{carePlan:'shared',careBalance:'shared_rota',familyPractice:'scheduled',workBoundary:'shared'},[[5,1],[7,1],[10,1]]),
      option(2012,'parents-stay','尊重父母暂不搬家，先陪他们试一种协助','从父母愿意接受的一项小事开始，约定一个月后再谈；不把搬来同住作为接受帮助的条件。','来回探望更费时间，你也无法随时知道家里的情况。','父母留下了熟悉的住处。你们先安排了一项得到同意的协助，约好下次复查；照顾家人没有变成替他们决定所有事。',{energy:-3,bonds:3,stress:2},{carePlan:'community',careBalance:'parents_choose',familyPractice:'weekly_call'},[[8,-1],[9,-1],[10,1]]),
    ]);

  if (state.step === 10) {
    const adultChild = children && life.childStartYear > 0 && year - life.childStartYear >= 18;
    if (adultChild) return add(scene,
      '景安说，他和交往多年的恋人准备搬到另一座城市。你替他高兴，回过神又想到家里会空一间房。临走前他还问了一句：“你熟的那个团队，有岗位吗？我想看看。”', [
        option(2016,'child-relationship','听孩子和伴侣一起讲计划，再说自己的担心','先约两人吃饭，问清搬迁和生活预算；给建议，不替他们决定是否继续这段感情。','你可能并不认同他们的安排，也得接受见面次数变少。','你听完了两个人的打算。饭后，景安仍按自己的计划准备搬家，你们则定下下一次见面；亲近没有以他留下为条件。',{energy:-3,bonds:5,stress:1},{parenting:'listen',familyPractice:'scheduled',childIndependence:'relationship'},[[8,-1],[10,1],[14,1]]),
        option(2016,'family-hiring','可以介绍岗位，但不替孩子安排录用和升职','只提供公开岗位信息，把评价交给实际负责人；家庭里的支持照常，不和录用结果绑定。','孩子可能失望，面试也可能没有结果；你不能再暗示团队特殊照顾。','你转发了岗位要求，没有打招呼索要一个名额。景安需要自己准备和选择，家里的饭照常吃；亲人的身份没有变成职位保证。',{energy:-2,leadership:3,control:-2,bonds:-1},{parenting:'support',familyEmployment:'open_hiring',workBoundary:'shared'},[[8,-1],[9,-1],[10,0]]),
      ]);
    if (children) return add(scene,
      '景安还在读书，这是他第一次认真提起喜欢的人。你刚想问对方成绩怎么样，他就停住了。桌上还放着他的升学资料。他说：“爸，我想先说完这件事。”', [
        option(2016,'teen-privacy','先听孩子说，不把谈心变成盘问','尊重他的隐私，聊清相处中的尊重和彼此边界；学习安排另找时间商量。','你无法知道所有细节，也不能保证他会听从每一条建议。','景安把话说完了。你没有索要对方的联系方式，也没有替他决定这段喜欢是否有意义；以后遇到难处，他知道可以继续找你谈。',{energy:-2,bonds:5,stress:1},{parenting:'listen',childIndependence:'privacy',familyPractice:'scheduled'},[[8,-1],[10,1]]),
      ]);
    return add(scene,
      couple ? `${name}翻出一张一直没用上的旅行清单。她问，接下新的带教和社区活动之前，能不能先确认那次两个人的短途旅行。` : '朋友们的生活各有变化，你也开始想，未来遇到临时住院、旅行改期或长时间独处，会先联系谁。几位朋友愿意聊聊，但每个人都有自己能承担的范围。', [
        option(2016,'shared-future',couple ? '先兑现两个人的假期，再答应新活动' : '和朋友说清今后愿意怎样相互照应',couple ? '选择预算内的近郊安排，先确认两人的空闲，再决定剩下能参与多少活动。' : '交换愿意承担的联系方式与事项，各自写下无法承担的部分；不把朋友变成随叫随到的家属。',couple ? '要拒绝一部分工作和社会活动，假期也未必完全按计划进行。' : '安排需要主动维持，你也要在别人需要时付出时间。',couple ? '出发日期终于定下来。两人选了近处，省下远途开销；新活动安排在回来之后，这次私人约定没有排到最后。' : '你们把可以联系的事说清，约好定期更新。没有配偶或孩子被补进这段人生，但需要帮助时，至少知道可以先问谁。',{energy:-3,bonds:5,stress:-3},{relationshipRepair:couple ? 'repair_done' : 'own_pace',workBoundary:'protected',socialPractice:'open_table',familyPractice:'help_network',...(couple ? {romancePromise:'weekends'} : {})},[[5,1],[9,-1],[14,1]]),
      ]);
  }

  if (state.step === 11) {
    scene = {...scene,fact:{...scene.fact,text:scene.fact.text.replace('2024年作为本局收束年份','2024年是人生继续展开的一个节点')}};
    const rumor = life.partner === 'maya' || !couple;
    const consentBefore = life.publicBoundary === 'consent';
    const event = rumor
      ? `一张活动合影被裁掉了其他人，只剩你和成年合作方许晴。论坛把它配成“新恋情”的标题，完整合影其实就存放在主办方相册里。${couple ? '麦雅先看见了转帖，她问你知不知道这件事。' : '朋友转来链接，问你需不需要帮忙。'}许晴也不想让自己的工作被这张照片盖过去。`
      : '主办方想把一段家人聚餐放进活动回顾，还想请你和伴侣在镜头前聊聊家里。对方已经来问能不能用。你看着片段里那一桌人，发现还没问过他们。';
    const lastEcho = life.relationshipRepair === 'unrepaired' && couple
      ? '以前没谈完的失约还在，这次更需要先把事情说清。'
      : consentBefore ? '你以前约定过，私人合影要先征求当事人同意；这次也照这条约定处理。' : '';
    return add(scene, `${event}${lastEcho}`, [
      option(2024,'private-first',rumor ? '先和当事人说清，再请主办方补回完整照片' : '先逐一问家人，愿意公开到哪一步',rumor ? `${couple ? '先向麦雅说明来龙去脉，再与许晴和主办方' : '先与许晴和主办方'}核对原图；更正活动事实，不公开私人聊天和行程。` : '让镜头里的每个人自己决定；没有得到同意的部分撤下，不用共同露面证明关系。','纠正需要时间，也不能保证所有看过转帖的人都看到更正。',rumor ? '主办方补上了完整合影和活动说明。你没有贴出任何人的私人消息，许晴也保留了自己的回应方式。误读没有立刻消失，但该解释的人先听到了事实。' : '视频只留下大家同意公开的部分。你们没有一起出面作生活展示，仍照原定安排见面吃饭；亲近不需要由观众确认。',{energy:-3,bonds:4,communication:3},{publicBoundary:'context',relationshipRepair:couple ? 'heard' : 'own_pace',nextChapter:life.nextChapter === 'undecided' ? 'ordinary' : life.nextChapter},[[6,1],[9,-1],[10,1]]),
      option(2024,'brief-statement',rumor ? '与当事人确认后，只发一份简短更正' : '只说明公开范围，婉拒家庭专访',rumor ? '说明这是公开工作活动，附主办方已有的完整照片；不回应网友对恋爱、婚姻的进一步猜测。' : '告诉主办方只谈工作，家人保留私人生活；不把对方是否出镜解释成关系好坏。','回应可能带来更多关注，需要克制继续争辩的冲动。',rumor ? '更正只交代了活动、照片与被裁切的部分。评论区仍有人猜测，你没有再补交私生活细节；之后的联系由当事人自己决定。' : '专访范围缩到了工作。家人不用为你的公开身份配合演出，原本要花在准备出镜上的那天留给了自己的安排。',{energy:-2,reputation:2,stress:2},{publicBoundary:'brief',workBoundary:'protected',nextChapter:life.nextChapter === 'undecided' ? 'ordinary' : life.nextChapter},[[9,-1],[11,1],[14,1]]),
      option(2024,'no-public-reply',rumor ? '私下核对并解释，暂不公开回应' : '不安排家人出镜，把日子留在镜头外',rumor ? `${couple ? '和麦雅、许晴' : '和许晴'}说明已知事实，保存完整照片；不参加评论区争论，按原计划过自己的日子。` : '明确拒绝这次家庭拍摄，替主办方另找工作素材；私人聚会照常进行。','外界的误读可能继续，沉默也不保证换来清静。',rumor ? '你没有发布声明，转帖也没有因此消失。该说明的事已经当面说明，完整照片留作核对；这个晚上，你照原来的约定离开了办公室。' : '摄像机没有进入私人聚会。你仍有要向家人兑现的普通约定，日程没有因为这次拒绝而变得更宏大。',{energy:2,stress:2,reputation:-2},{publicBoundary:'private',workBoundary:'protected',nextChapter:'ordinary'},[[11,-1],[13,1],[14,1]]),
    ], { people:rumor ? [fictional('许晴（Qing Xu）','成年活动合作方；合影误读情节为虚构，不影射真人绯闻')] : [] });
  }
  return scene;
}

function futurePeople(life) {
  return [
    ...(paired(life) ? [{name:nameOf(life),role:'本局伴侣；以下谈话和未来安排均为平行剧情',kind:life.partner === 'lori' ? '历史人物' : '虚构角色'}] : [fictional('陈立文（Leo Chen）','老朋友；彼此仍有各自的日程')]),
    ...(life.children === 'parent' ? [fictional('黄景安（Jamie Huang）','本局虚构成年儿子；有自己的生活'),...(life.childCount > 1 ? [fictional('黄雨禾（Robin Huang）','本局虚构成年女儿；有自己的生活')] : [])] : []),
  ];
}

function futureScene(state, title, story, objective, options, extra = {}) {
  const year = [2026,2028,2032,2036][state.step - 12];
  const life = state.life;
  const {people = [], factText, ...rest} = extra;
  return {
    id:`life-${year}`,chapter:Math.floor(state.step / 2),lifeChapter:year === 2026 ? '信任与生活重新安排' : '如果人生继续这样走',
    year:String(year),age:year - 1963,date:year === 2026 ? '2026 年 · 公开事件之后，回到自己的生活' : `${year} 年 · 如果这条人生继续向前`,
    place:'圣克拉拉 · 约好的私人谈话',address:'圣克拉拉市内的虚构会面地点',
    addressNote:'私人场所不提供门牌；不代表任何真人住宅或未来行程。',
    title,story,people:[...futurePeople(life),...people],
    mission:{deadline:'给下一阶段作出承诺之前',objective,deliverable:'一项经当事人确认的关系或生活安排，以及需要自己承担的时间。'},
    fact:{text:factText || (year === 2026
      ? '2026年11月8日，NVIDIA官网刊登黄仁勋的致员工信：本人承认对妻子不忠、向家人和同事道歉，并请求家人隐私。此处只引用公开陈述，不推断调查结果或真人家庭反应。黄二勋的关系、谈话和选择是独立虚构，不默认复制真人行为。'
      : `${year}年的事件是根据玩家选择展开的“如果”剧情，不是新闻、预测或真人家庭生活的预言。关系能否继续由双方的明确选择决定，未记录的行为不会被补写成事实。`),sourceIds:year === 2026 ? ['relationship-accountability-2026'] : []},
    echo:romanceEcho(state) || '已经作出的承诺仍有分量；新的安排需要当事人各自同意。',
    options,...rest,
  };
}

function separateSet(life) {
  return {formerPartner:life.partner,partner:'none',relationship:'separated',partnerCareer:'undecided',
    marriageOutcome:life.relationship === 'married' ? 'divorced' : 'separated',livingArrangement:'independent',
    relationshipRepair:'separated',romancePromise:'none',workBoundary:'protected',
    ...(life.children === 'parent' ? {coParenting:'adult_contact',familyPractice:'scheduled'} : {})};
}

export function createFutureRelationshipScene(state) {
  if (state?.storyEdition !== EDITION || !state.life || !Number.isInteger(state.step) || state.step < 12 || state.step > 15) throw new RangeError('未来生活剧情须使用扩展版的2026至2036节点');
  const life = state.life;
  const couple = paired(life);
  const name = couple ? nameOf(life) : '';
  const married = life.relationship === 'married' && couple;
  const children = life.children === 'parent';
  const childNote = children ? '孩子已经成年，他们可以表达感受，却不负责替你们决定关系去留。' : '这里没有孩子需要替你们承担这段关系的决定。';

  if (state.step === 12) {
    if (couple) return futureScene(state,'关上门以后，这段关系怎样继续',
      `黄仁勋的公开消息传来后，你和${name}找了一晚坐下来谈自己的事。${life.relationshipRepair === 'unrepaired' ? '她又提起那次临时取消、后来也没补上的约定。' : '有件事你以为已经过去了，她今晚又提了起来。'}\n“外面怎么说，我都不想一起出来解释。”${name}说。你们还有自己的日子要过，这些年没谈完的话，今晚得听对方说完。${children ? '成年孩子也知道你们在谈，他们的感受可以另外听。' : ''}`,
      '听清对方的意愿，确认继续尝试、协议分居或结束关系；不要求对方马上原谅。',[
        option(2026,'repair','双方愿意继续试，先约定三个月怎样相处','两人确认愿意尝试修复，列清可以做和不能再做的事，固定谈话时间；需要时共同选择专业帮助。','工作要让出稳定时间，付出也不保证关系一定修复。','你们同意试三个月，没有宣布一切恢复正常。公开露面由各自决定，约定会谈与日程都写了下来；之后能不能继续，要看实际相处。',{energy:-5,bonds:3,stress:2},{marriageOutcome:'repairing',relationshipRepair:'trying',livingArrangement:'together',workBoundary:'protected',publicBoundary:'private',familyPractice:'scheduled'},[[5,1],[7,1],[14,1]]),
        option(2026,'live-apart','双方同意先分开住，保留下一次谈话','把住处、共同开支和联系频率说清；既不宣布和好，也不把暂时分居当成已经离婚。','两处生活消耗更多时间和费用，未来仍可能走向分开。',`${married ? '婚姻关系仍在，' : '两人还没有结束伴侣关系，'}住处暂时分开了。下一次谈话有了日期；是否继续，仍由两人各自作出决定。${children ? '成年孩子收到必要说明，没有被请来劝任何一方留下。' : ''}`,{money:-4,energy:-3,bonds:-2,stress:3},{marriageOutcome:'considering',livingArrangement:'apart',relationshipRepair:'space',workBoundary:'protected',publicBoundary:'private'},[[3,1],[9,-1],[14,1]]),
        option(2026,'end-marriage',married ? '决定离婚，认真处理共同事项' : '结束伴侣关系，处理共同事项',`${married ? '明确提出结束婚姻，在这条虚构人生里完成双方共同事项的处理。' : '双方确认结束交往，结清共同开支并归还物品。'}不以工作或舆论为理由要求对方继续留下。`,'关系结束带来失落和生活调整，也可能影响原定的工作安排。',`${married ? '你们结束了婚姻' : '你们结束了伴侣关系'}，住处和共同事项分别安排。${children ? '成年孩子仍是家人，联系与支持继续，不需要在两人之间选边。' : '之后的生活各自决定，不再让对方等待一个模糊的以后。'}`,{energy:-5,bonds:-5,stress:5},separateSet(life),[[3,1],[9,-1],[15,1]]),
        option(2026,'private-boundary','先拒绝公开站台，把谈话留在两人之间','不安排共同声明或家庭专访，先确认各自愿意在什么场合谈；关系的去留暂不抢着宣布。','外界可能继续猜测，私下的问题也仍需下一次面对。','你没有用一张合影宣布和好。两人保留各自的公开回应权，下一次谈话只为自己的生活安排，不给外界交一份结局。',{energy:-2,stress:1,bonds:2},{publicBoundary:'private',relationshipRepair:'heard',marriageOutcome:'considering',workBoundary:'protected'},[[8,-1],[9,-1],[11,-1]]),
      ]);
    return futureScene(state,'没有配偶，也有需要认真面对的人',
      `公开消息传来时，你想起从前的关系。${life.relationship === 'separated' ? '分开以后，你已经慢慢习惯了各过各的日子。' : '你现在独自生活，有阵子没和朋友坐下来好好吃一顿饭。'}陈立文打来电话：“这几天睡得怎么样？要不要出来吃饭？”${children ? '\n成年孩子也问你近况。你准备自己回他们的电话，外面的人要问，就让他们来找你。' : ''}`,
      '决定愿意接受怎样的陪伴，同时保留自己的公开边界。',[
        option(2026,'single-support','和信任的人吃顿饭，把近况说清','主动约一位老朋友，只谈自己愿意谈的事；不让对方替你回应公众。','要承认自己的困惑，也得听对方说自己的生活。','饭桌上没有人催你开始新恋情。你说清最近的安排，也问了朋友的近况；下一次联系有了约定。',{energy:-2,bonds:5,stress:-3},{relationshipRepair:'own_pace',socialPractice:'close_circle',familyPractice:'scheduled',publicBoundary:'private'},[[5,1],[10,1],[14,1]]),
        option(2026,'single-rest','先减少应酬，给自己一段安静生活','暂停非必要的公开活动，规律休息；给最常联系的人留一条可以找到你的方式。','少了一部分工作机会，独处也不会自动消除不安。','你取消了几场应酬，没有把自己和所有人断开。周末留下散步和睡觉，下一段关系仍没有被仓促决定。',{energy:6,stress:-4,bonds:-1},{relationshipRepair:'own_pace',workBoundary:'protected',publicBoundary:'private',livingArrangement:'independent'},[[13,1],[14,1]]),
        option(2026,'single-family','先把已经答应家人的事做完','兑现一次探望或长电话；只说明自己的近况，不让家人承担解释你生活的责任。','需要调开一段工作时间，家人也可能有不同看法。','你按约到了，也听完了家人的担心。没有人替你作出下一段关系的决定；一次探望先被好好完成。',{energy:-3,bonds:5,stress:-1},{familyPractice:'scheduled',relationshipRepair:'own_pace',publicBoundary:'consent',workBoundary:'shared'},[[9,-1],[10,1],[14,1]]),
      ]);
  }

  if (state.step === 13) {
    if (couple) return futureScene(state,'如果到了2028年，再看一次当年的约定',
      `两年过去，你和${name}${life.livingArrangement === 'apart' ? '仍各有住处，每次见面先约时间' : '仍在一起，日子照过，有些话也还是没谈完'}。${life.marriageOutcome === 'repairing' ? '上次写下的几条约定，有些一直做到了，也有几次没做成。' : '你把两年前的计划翻出来，有几件已经办妥，也有几行还留在原处。'}\n这次见面，她想听听你打算怎么过接下来的日子。${children ? childNote : ''}`,
      '根据两年的实际相处，重新确认双方愿意承担的关系。',[
        option(2028,'stay-together',married ? '双方确认继续婚姻，重新安排共同生活' : '双方确认继续交往，重新安排共同生活','先核对过去的约定，保留能坚持的部分；如果曾分居，只有双方愿意才重新同住。','继续需要长期时间，不等于抹去过去的不满。',`${name}和你都明确选择继续。你们重新安排了日常、独处和见面时间；过去没有被删掉，未来也没有被保证。`,{energy:-3,bonds:5,stress:-2},{marriageOutcome:'continuing',livingArrangement:'together',relationshipRepair:'repair_done',romancePromise:'shared_home',familyPractice:'scheduled',workBoundary:'shared'},[[7,1],[10,1],[14,1]]),
        option(2028,'apart-by-choice','继续这段关系，保留各自住处与节奏','双方同意不合并所有日程，明确见面、照应和共同开支；外界怎么称呼不替两人作决定。','来往费时，也要接受对方拥有不向你汇报的私人时间。','你们同意继续关系，也同意保留各自住处。联系不再靠随时待命，下一次见面由两个人共同安排。',{energy:-2,bonds:3,stress:1},{marriageOutcome:'continuing',livingArrangement:'apart',partnerCareer:'parallel',relationshipRepair:'agreed',workBoundary:'protected'},[[8,-1],[9,-1],[14,1]]),
        option(2028,'end-marriage',married ? '决定离婚，不再拖延共同事项' : '决定分手，不再延长等待','明确结束目前关系，处理剩下的共同安排；不把两年尝试变成必须继续的理由。','要面对失落和重新安顿，也可能承认这段努力没有带来共同未来。',`${married ? '你们结束了婚姻' : '你们结束了伴侣关系'}。两年的尝试仍有自己的记录，却没有要求任何人永远留下。${children ? '与成年孩子的联系继续，孩子不用替这段关系作裁判。' : '之后的日常和新的关系，各自决定。'}`,{energy:-4,bonds:-4,stress:4},separateSet(life),[[3,1],[9,-1],[15,1]]),
      ]);
    return futureScene(state,'如果到了2028年，下一段关系可以慢一点',
      `你花了两年重新安排生活。${life.marriageOutcome === 'divorced' ? '离婚以后，你也慢慢习惯了一个人的日程。' : '如今见朋友、回家吃饭，时间大多自己定。'}麦雅从老朋友那里听说你的近况。${life.formerPartner === 'maya' ? '你们都记得上次为什么分开。她说想先听听你现在过得怎么样。' : '她问你哪天有空，说先见一面再说。'}\n她把这周的空闲时间告诉了你，还等你回话。`,
      '选择明确同意的新交往、慢慢了解，或继续自己的生活。',[
        option(2028,'new-love',life.formerPartner === 'maya' ? '双方重新同意交往，保留上次分开的教训' : '双方愿意交往，和麦雅开始新的成年关系','两人先把当前关系状态、生活安排和能承担的时间说清；不自动结婚，也不自动合并财务。','要重新投入时间和信任，对方也可能提出与你不同的生活方式。','你们明确同意交往，各自保留住处和日常。新的关系有自己的开始，不取消从前的经历，也没有把婚姻或育儿写成附赠条件。',{energy:-3,bonds:5,stress:1},{partner:'maya',relationship:'dating',partnerCareer:'parallel',marriageOutcome:'new_relationship',livingArrangement:'apart',relationshipRepair:'agreed',romancePromise:'two_cities',workBoundary:'shared'},[[5,1],[9,-1],[14,1]]),
        option(2028,'slow-contact','先见几次面，不急着确认恋爱','双方同意慢慢了解，保留明确的拒绝空间；不把朋友介绍理解为已经恢复或开始交往。','没有立即确定的关系，也需要接受其中一人选择不继续。','你们约了下一次见面，没有宣布恋爱或复合。生活记录保留你现在的身份，后来的关系仍需另一次明确同意。',{energy:-2,bonds:2},{relationshipRepair:'slow_contact',socialPractice:'open_table',livingArrangement:'independent'},[[7,1],[9,-1]]),
        option(2028,'stay-single','继续单身，把时间留给朋友和自己','清楚回复邀请，固定参加一项自己喜欢的活动；主动维持少数可靠联系。','日常需要自己安排，偶尔孤单也没有默认同行的人。','你没有开始恋情。周末留给朋友和自己的兴趣，新生活不是对从前关系的判决，只是你这次明确愿意选择的安排。',{energy:5,stress:-4},{relationshipRepair:'own_pace',workBoundary:'protected',socialPractice:'open_table',livingArrangement:'independent'},[[9,-1],[13,1],[14,1]]),
      ],{people:[fictional('陈麦雅（Maya Chen）','成年虚构人物；两人的未来交往需要明确同意')]});
  }

  if (state.step === 14) return futureScene(state,'如果开始写回忆，哪些人生属于别人',
    `编辑来信问你愿不愿意写回忆录。她想知道项目为什么没做成，也想知道那几年谁在你身边。你翻出早年的信件，一句话刚抄下来，就想起这封信当时只寄给了一个人。\n${couple ? `${name}愿意听听你准备写什么。说到两个人的事，她问能不能先看看你打算放进书里的那一段。` : '从前的伴侣和老朋友也会出现在这些页里。哪几段能拿给编辑看，你还得开口问当事人。'}${children ? '孩子也想先看看书里会怎样提到他们。' : ''}`,
    '决定回忆录的私人边界，或先把记录留给自己和家人。',[
      option(2032,'memoir-consent','逐一征求同意，只写大家愿意公开的部分','把涉及他人的章节分别交给当事人；有人不愿公开，就改写为自己的感受或删去具体细节。','进度变慢，书也可能没有编辑期待的戏剧性。','几页私人对话被留了下来，没有进入公开稿。你仍可以写自己犯过的错和作过的决定，别人不必因此交出全部生活。',{energy:-4,communication:3,bonds:3},{memoirBoundary:'consent',publicBoundary:'consent',workBoundary:'shared',lateLifeFocus:'memoir'},[[6,1],[8,-1],[9,-1]]),
      option(2032,'memoir-work','只写自己负责的工作，不公开家人的私事','把书稿集中在选择、失败和学到的事；提及合作方时核对能公开的材料。','少了部分私人故事，整理工作资料也很费精力。','你删掉了没有得到同意的家庭段落，重新写了自己当时怎样决定。书稿更像一份认真回看的工作记录，私人关系保留在生活里。',{energy:-4,engineering:2,reputation:2},{memoirBoundary:'work_only',publicBoundary:'private',workBoundary:'protected',lateLifeFocus:'memoir'},[[6,1],[9,-1],[11,-1]]),
      option(2032,'family-archive','先不出版，把信件和照片整理给愿意收的人','确认哪些资料可以保存和传阅，给每个人留下修改或不收取的选择；不以留名为目标。','暂时放弃公开表达和出版机会，也要花时间整理。','你把照片背后的时间和人名补好，几封信仍封在自己的盒子里。记录有了去处，却没有全部变成公众故事。',{energy:-3,bonds:5,stress:-2},{memoirBoundary:'private_archive',publicBoundary:'private',familyPractice:'shared_table',workBoundary:'protected',lateLifeFocus:'family'},[[10,1],[11,-1],[14,1]]),
      option(2032,'new-hobby','先放下书稿，认真学一件不会的事','从做饭、画画或运动中选一项适合当前身体情况的活动，先体验一个月；不把每项兴趣都变成作品。','书稿暂时没有进度，新的活动也可能做得很普通。','你回复编辑，自己暂时不写。第一堂课里没有人等你交一份人生总结，你只需要从不会的地方开始。',{energy:4,stress:-5},{lateLifeFocus:'hobby',hobby:'cooking',hobbyPractice:'weekly',workBoundary:'protected',nextChapter:'explore'},[[13,1],[14,1],[15,1]]),
    ],{people:[fictional('周婉（Wan Zhou）','成年编辑；书稿邀约和出版安排均为未来虚构')]});

  const memory = life.memoirBoundary === 'private_archive' ? '你整理过的照片和信件已经有人收下，也有一些仍由你自己保管。'
    : life.memoirBoundary ? '你已经决定回忆里哪些部分可以公开，哪些应留给当事人自己。'
      : '旧日历和照片还放在手边，回忆录的几页纸夹在里面。';
  const options = [
    option(2036,'ordinary-days',couple ? `继续和${name}过日子，把每周安排说清` : '保留自己的住处与节奏，主动联系亲近的人',couple ? '双方确认愿意继续关系，保留各自兴趣和朋友；把一起吃饭、独处与照应时间分别安排。' : '定下愿意参与的朋友聚会和家庭联系，也留出独处；不因为到了这个年龄就补上一段婚姻。','可用于工作和公开活动的时间减少，普通日子仍会有磨合与孤单。',couple ? `你们选择继续这段关系，没有用长久相处保证以后一切顺利。${life.livingArrangement === 'apart' ? '各自的住处仍然保留，' : ''}日历上有共同的晚饭，也有各自的活动；明天怎样过，仍需要两个人一起安排。` : '你没有因为故事走到这里就突然成家。固定联系和自己的日常都留了下来，往后的日子继续由具体的一周组成。',{energy:5,stress:-4,bonds:3},{lateLifeFocus:'family',nextChapter:'ordinary',workBoundary:'protected',familyPractice:'scheduled',...(couple ? {marriageOutcome:'continuing',relationshipRepair:'agreed'} : {})},[[9,-1],[13,1],[14,1]]),
    option(2036,'learn-again','每周学一次新爱好，接受自己还不熟练','选一项愿意继续的课程，按身体和时间调整强度；和身边的人谈好各自需要的空间。','会遇到跟不上或做不好的时刻，也要减少一部分其他安排。','第一堂课并没有特别顺利。你还是把下周的时间留了下来；七十三岁可以继续做一个愿意练习的新手。',{energy:3,stress:-5},{lateLifeFocus:'hobby',nextChapter:'explore',hobby:life.hobby === 'cooking' ? 'walking' : 'cooking',hobbyPractice:'weekly',workBoundary:'protected'},[[13,1],[14,1],[15,1]]),
    option(2036,'limited-mentoring','保留每月一次带教，其余时间回到自己的生活','只接一项范围明确的支持，把组织和决定交给后来的人；每次答应前先核对日程。','仍然消耗精力，也要接受对方不照自己的方法做。','下一次见面定在一个月后。你留下愿意承担的部分，也留下对方自主决定的空间；这项支持不需要占满余下的生活。',{energy:-3,bonds:3,ecosystem:2},{lateLifeFocus:'mentoring',nextChapter:'share',socialPractice:'mentoring',workBoundary:'shared'},[[8,-1],[9,-1],[10,1]]),
    option(2036,'finish-memoir',life.memoirBoundary === 'private_archive' ? '完成私人回忆录，按约定交给愿意收的人' : '把愿意公开的回忆整理完，再放下笔','沿用已经说好的隐私范围；尚未征求同意的部分不写进交付稿，不为完整故事擅自补写别人。','写作需要稳定时间，有些未解的问题也只能如实留下。','你没有给每件往事安排一个答案。书稿保留了自己记得的选择和限制，涉及他人的部分遵守原来的约定；交出去之后，明天仍有新的日常。',{energy:-4,communication:3,stress:-1},{lateLifeFocus:'memoir',memoirBoundary:life.memoirBoundary || 'work_only',nextChapter:'share',workBoundary:'protected'},[[6,1],[9,-1],[15,1]]),
  ];
  if (couple) options.push(option(2036,'end-marriage',married ? '决定与现在的妻子离婚，各自安排往后生活' : '结束现在的伴侣关系，各自安排往后生活',`${married ? '认真处理离婚和共同事项' : '双方确认分手，处理剩下的共同安排'}；不因已经相处多年就要求继续，也不以公开身份或家庭联系施压。`,'会失去熟悉的陪伴，需要重新安顿；年纪和过去的投入都不能免去这段难处。',`${married ? '这条人生在这里结束了婚姻' : '这条人生在这里结束了伴侣关系'}。${children ? '与成年孩子的联系继续，他们不承担劝和或选边的任务。' : '你们各自保留朋友与日常，不再把未来写在同一张计划表上。'}这不是自动通向轻松的结局，而是一项需要自己承担的决定。`,{energy:-4,bonds:-4,stress:4},{...separateSet(life),lateLifeFocus:'independent',nextChapter:'ordinary'},[[3,1],[9,-1],[15,1]]));
  return futureScene(state,'如果到了2036年，七十三岁的普通一周',
    `${memory}\n${couple ? `你和${name}${life.livingArrangement === 'apart' ? '仍各有住处。想见面得先约日子。' : '还有常常一起做的事，也各自留了时间。'}` : `${life.marriageOutcome === 'divorced' ? '离婚后，你已经有了自己的日程。' : '你没有伴侣，平时常见的还是那几位朋友。'}亲友的时间也和以前不同了。`}${children ? '成年孩子周末有自己的安排，要见面也得先问一声。' : ''}\n你翻到下一周，有几天还是空着的。`,
    '确认关系去留、日常陪伴与个人兴趣；职业去向将在下一次决定中落实。',options);
}

function newReceipts(state, fields) {
  return (state.lifeJournal || []).filter(entry => fields.some(field => Object.hasOwn(entry.set || {}, field)))
    .map(entry => ({year:String(entry.year),title:entry.choiceTitle,text:entry.resultText}));
}

function mergeReceipts(before, added) {
  const seen = new Set();
  return [...(before || []), ...added].filter(entry => {
    const key = `${entry.year}:${entry.title}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).sort((a,b) => Number(a.year) - Number(b.year));
}

export function enrichRelationshipPortrait(original, state) {
  if (state?.storyEdition !== EDITION || !state.life || state.life.historyKnown === false) return original;
  const life = state.life;
  const relationSummary = {
    heard:'你曾留出时间，认真听完亲近的人没有说完的话。',
    unrepaired:'有一次失约，你选择先完成工作；这件事尚未在记录中得到修复。',
    repair_done:'你把一次约定落实到了自己的日程里，留下了一次真正到场的记录。',
    separated:'你曾结束一段关系，重新安排之后的生活。',
    slow_contact:'你愿意慢慢了解对方，但没有把几次见面直接写成恋爱或复合。',
    agreed:'你们为职业与生活重新商量过安排，也各自承担了其中的代价。',
    trying:'双方同意试着修复，但这份记录没有宣告问题已解决或对方已经原谅。',
    space:'双方同意暂时分开住，关系去留仍待共同决定。',
    own_pace:'你给关系保留了自己的节奏，也主动安排了家人朋友的联系。',
  }[life.relationshipRepair] || '';
  const financeSummary = {
    separate:'你没有把父母积蓄和家庭担保计入事业计划。',
    capped:hasChoice(state,'impact-1993-life-family-cheer') ? '你曾争取家人的热情支持，但没有把谁出钱、用途和上限谈清。' : hasChoice(state,'life-1993-story-capped-family-support') ? '你接受过一笔有明确上限的家庭支持，约定需要定期交代用途。' : '家庭支持的出资约定与实际用途，仍需按当时记录核对。',
  }[life.familyExposure] || '';
  const familySummary = [financeSummary,
    life.coParenting === 'scheduled' ? '关系结束后，你仍保留了已有孩子的照护分工。' : '',
    life.coParenting === 'adult_contact' ? '关系结束后，与成年孩子的联系和支持继续，他们不用在父母之间选边。' : '',
    life.familyEmployment === 'open_hiring' ? '你介绍过工作机会，但没有承诺孩子一定录用或升职。' : '',
    life.childIndependence === 'privacy' ? '你听孩子谈过喜欢的人，保留了对方的隐私。' : '',
    life.childIndependence === 'relationship' ? '你听过成年孩子与伴侣的共同计划，没有替他们作最后决定。' : '',
  ].filter(Boolean).join('');
  const publicSummary = {
    consent:'合影公开前，先征求每位当事人的同意。',
    context:'先与当事人解释，再补足公开活动的上下文。',
    brief:'只回应必要事实，私人生活不随回应一起公开。',
    private:'私下说明情况，保留不公开回应的选择。',
  }[life.publicBoundary];
  const facets = original.facets.map(facet => {
    if (facet.id === 'relationship') {
      const status = life.marriageOutcome === 'divorced' && !paired(life) ? '已离婚，目前没有伴侣'
        : paired(life) && life.livingArrangement === 'apart' ? `${facet.status}；双方保留不同住处` : facet.status;
      const text = life.marriageOutcome === 'divorced' && !paired(life)
        ? '你在这条人生里决定结束婚姻，重新安排之后的住处与联系。'
        : facet.text;
      return {...facet,status,label:status,
        text:[text,relationSummary].filter(Boolean).join(''),
        receipts:mergeReceipts(facet.receipts,newReceipts(state,['romancePromise','relationshipRepair','marriageOutcome','livingArrangement']))};
    }
    if (facet.id === 'family') return {...facet,
      text:[facet.text,familySummary].filter(Boolean).join(''),
      receipts:mergeReceipts(facet.receipts,newReceipts(state,['familyExposure','careBalance','coParenting','familyEmployment','childIndependence']))};
    return facet;
  });
  if (publicSummary) facets.push({id:'public-boundary',title:'公开与私下',status:publicSummary,label:publicSummary,
    text:'当工作和私生活一起进入公众视线时，你留下了这些具体决定。',
    receipts:newReceipts(state,['publicBoundary'])});
  const lateSummary = {
    family:'把普通日常留给自己与亲近的人',hobby:'继续学习一项新的爱好',mentoring:'保留有边界的带教与支持',
    memoir:'整理愿意留下的回忆',independent:'关系结束后，重新安排独立生活',
  }[life.lateLifeFocus];
  const memoirSummary = {
    consent:'涉及他人的内容先征得同意',work_only:'公开自己的工作选择，保留家人私事',
    private_archive:'先留作私人记录，不自动公开',
  }[life.memoirBoundary];
  if (lateSummary) facets.push({id:'later-life',title:'往后的日子',status:lateSummary,label:lateSummary,
    text:[lateSummary+'。',memoirSummary ? memoirSummary+'。' : '','未来仍会变化，这里只记录本局已经作出的安排。'].join(''),
    receipts:newReceipts(state,['lateLifeFocus','memoirBoundary'])});
  const oldRelation = original.facets.find(facet => facet.id === 'relationship')?.status;
  const newRelation = facets.find(facet => facet.id === 'relationship')?.status;
  const text = oldRelation && newRelation && original.text.startsWith(oldRelation)
    ? newRelation + original.text.slice(oldRelation.length) : original.text;
  return {...original,facets,text,
    ...(life.marriageOutcome === 'divorced' && !paired(life) ? {title:'离婚之后，重新安排自己的日子'} : {}),
    commitments:[...original.commitments,...(publicSummary ? [{label:'私人生活公开到哪里',value:publicSummary}] : []),
      ...(lateSummary ? [{label:'往后想怎样生活',value:lateSummary}] : [])]};
}
