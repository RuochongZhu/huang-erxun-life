import { getContinuityMemory } from './continuity-memory.mjs';
import { getWorldFeedback } from './story-feedback.mjs';
const EDITION='2026.11.bonds';
const last=items=>items?.at(-1);
const remember=r=>`${r.year}年那次“${r.title}”`;
const reaction=(speaker,text,tone='tense')=>({speaker,text,tone});
const feedback=(speaker,text,environment,tone='tense')=>({reactions:[reaction(speaker,text,tone)],environment});
const impact=(values,pressures,hint)=>({values,pressures,hint});
function personal(year,key,title,description,text,effects,set,world,values={},pressures={}) {
  return {id:`bond-${year}-life-${key}`,title,description,tradeoff:'这次的安排会被记住；别人同意的是说清的范围，之后仍然可以拒绝追加。',text,consequence:text,label:title,effects,set,
    traits:[{dim:9,d:key.includes('hide')||key.includes('extend')?1:-1},{dim:10,d:1}],feedback:world,
    lifeImpact:impact(values,pressures,description)};
}
function outcome(label,text,effects,flags,world,values={},pressures={}){return {label,text,effects,flags,feedback:world,lifeImpact:impact(values,pressures,'结果会留下新的交付记录，也改变亲近的人愿意支持到哪一步。')};}
function decisions(scene,state,domain,m) {
  const year=Number(scene.year),person=m.partner.name||'Jeff',crisis=last(m.career.crises);
  const reserve=last(m.family.reserve),shared=last(m.partner.careerSupport)||last(m.partner.sharedTime)||last(m.family.support);
  const support=m.support?.kind==='bounded'?m.support:null;
  const risk=last(m.partner.riskPacts)||last(m.family.riskPacts);
  const carry={bondActor:person,bondPartner:m.partner.id||null};
  if(domain==='life'&&year===1996&&risk)return [
    personal(year,'open-ledger','把当年约定的预算拿回饭桌，说明现在的缺口',`翻开${remember(risk)}的记录，把已花的钱、不能再动的生活费逐项说清。`,`${person}把杯子挪开，手指停在原来写下的上限上。你说：“這一筆不能再讓你們替我補。”今晚没有把所有问题解决，但复查的约定终于没有被下一场谈判盖过去。`,{energy:-3,stress:3,bonds:5,money:-2},{...carry,bondPact:'kept',familyExposure:'separate',workBoundary:'shared'},feedback(person,`你还记得${risk.year}年说过要重新商量。那先把最坏的情况讲完。`,'两张不同年份的预算纸并排放着，原来的字没有被擦掉。','warm'),{belonging:5,freedom:3},{trustDebt:-6,support:6}),
    personal(year,'hide-gap','先不提资金缺口，把家里的钱再算进一次计划',`${remember(risk)}里有过边界。你想先用那份支持撑过眼前，以后再解释。`,'电话接通前，你把预算纸翻了个面。眼前多了一点腾挪余地，家里却还按旧安排花钱；两份日历开始依赖不同的事实。',{money:7,stress:8,bonds:-5},{...carry,bondPact:'concealed',relationshipRepair:'unrepaired'},feedback(person,`还是按${risk.year}年说好的上限吧？你没有正面回答。`,'纸背透出的旧数字仍然看得清。'),{wealth:5,belonging:-6},{trustDebt:16,leverage:10}),
  ];
  if(domain==='life'&&year===1997&&crisis)return [
    personal(year,'crisis-at-home','把公司的坏结果带回家，一起重新安排这一周',`${remember(crisis)}已经发生。说明回款、工作时间和照护缺口，不把婚姻或亲情当成无限兜底。`,`${person}听到实际结果时很久没说话。后来，笔被推回你手边：工作可以重新排，但你得亲自划掉做不到的承诺。你取消了一段额外工作，把下一次见面写成确定的日期。`,{money:-3,energy:5,stress:-4,bonds:4},{...carry,bondPact:'reviewed',workBoundary:'protected',relationshipRepair:'heard'},feedback(person,`${crisis.year}年工作出了那件事，我知道。可你得告诉我，接下来哪一晚真的能回来。`,'工作电话仍在响，桌上的生活安排终于也占了一整页。'),{belonging:6,health:4},{burden:-6,trustDebt:-5,support:5}),
    personal(year,'hide-crisis','把失败说成小延误，先保住家里的平静',`不讲${remember(crisis)}到底损失了什么，照旧答应下一次见面。`,'对方暂时没有继续问。你得到一个安静的晚上，也把解释的期限推到了下一次落空；家里仍以为你能按原定时间到场。',{energy:8,stress:6,bonds:-4},{...carry,bondPact:'concealed',relationshipRepair:'unrepaired'},feedback(person,'那我们就照原来的安排。我会留出时间。','对方在日历上画了圈，你没有说出已经冲突的排期。'),{career:4,health:2,belonging:-7},{trustDebt:18,burden:10}),
  ];
  if(domain==='life'&&year===1999&&(m.partner.missed.length||m.pact)){
    const old=last(m.partner.missed)||m.pact;
    return [personal(year,'keep-return-date','这次先兑现旧约，把一项工作交出去',`先谈${remember(old)}留下的问题，再安排眼前的机会。让对方看见一段真实腾出的时间。`,`${person}提到旧事时，你没有再拿最近的成绩回答。你把一项工作交出去，接受少挣的钱和不同的做法。下一个周末，见面终于没有被一条工作消息取消。`,{money:-4,energy:6,bonds:7,control:-4},{...carry,bondPact:'kept',bondSupport:'bounded',relationshipRepair:'repair_done',workBoundary:'shared'},feedback(person,`我记得${old.year}年的那次。这一回你真的到了；下一段忙的时候，我们再商量怎么分。`,'新日期写在旧约旁边，旧约没有被撕掉。','warm'),{belonging:8,health:4},{trustDebt:-10,support:9,burden:-5})];
  }
  if(domain==='life'&&year===2026){
    const privacy=last(m.partner.privacy)||last(m.family.privacy);
    if(!privacy)return [];
    return [personal(year,'keep-private-line','照过去说好的，独自处理工作风波',`记起${remember(privacy)}，撤掉需要家人或伴侣替你表态的安排。`,`${person}先确认自己不会出现在那份公开说明里，才愿意继续听你讲工作上的难处。你少了一张容易得到同情的合影，多了一次关上门后不必表演的谈话。`,{reputation:-5,bonds:5,energy:-3},{...carry,bondPact:'kept',publicBoundary:'private'},feedback(person,`你${privacy.year}年说过，我的生活不用替你的工作作证。这次你守住了。`,'那把留给家人的发布会椅子被撤走，家里的灯仍为一次普通谈话亮着。','warm'),{belonging:6,legacy:4},{trustDebt:-8,support:6})];
  }
  if(domain==='life'&&year===2028){
    const anchor=shared||reserve; const who=anchor?.actor||person;
    const origin=anchor?`你想起${remember(anchor)}。`:'你没有把从前的名气当成别人应当帮忙的理由。';
    return [
      personal(year,'bounded-support','先问对方愿意怎样帮忙，不借钱也可以',`${origin}只请求一段能承担的时间：协助日常、听一次试讲，或者介绍一个愿意听需求的人。`,`${who}没有答应替你承担经营风险，只圈出每周能帮的一小段时间。你把自己的工作缩到能装进这段安排的大小。重来仍然要靠交付，这一次却不用一边做事、一边假装生活没有缺口。`,{energy:anchor?10:4,stress:-4,bonds:4},{bondActor:who,bondPartner:m.partner.id&&who===m.partner.name?m.partner.id:null,bondSupport:'bounded',bondPact:'reviewed',workBoundary:'shared'},feedback(who,anchor?`你在${anchor.year}年也给我的生活留过位置。这次我愿意帮这一段，但不能全部接下来。`:'我能帮你练一次说明，之后的事情还得一步步谈。','帮忙的时间写在日历上，金额那栏没有多出任何承诺。','warm'),{belonging:6,career:3},{support:8,burden:-6}),
      personal(year,'decline-guarantee','接受对方不担保，把重来的规模缩小',`${origin}听完拒绝，保留对方的储蓄、工作和退出的自由。`,`${who}说完不愿担保后，还在等你露出失望。你把资金计划缩小，说：“你不需要靠借錢給我，證明你在乎我。”重建会慢一点，关系没有因此被变成一张欠条。`,{money:-2,control:-4,bonds:4,stress:-3},{bondActor:who,bondPartner:m.partner.id&&who===m.partner.name?m.partner.id:null,bondSupport:'withdrawn',familyExposure:'separate',bondPact:'kept'},feedback(who,'钱我不能答应。可你愿意这样听完，我还愿意和你谈下一步。','预算里的一行被删掉，桌对面的人没有离开。','warm'),{freedom:5,belonging:4},{leverage:-7,trustDebt:-5}),
    ];
  }
  if(domain==='career'&&year===2028&&support)return [{
    id:'bond-2028-career-small-restart',title:'借这段被分担的时间，试着接一张小订单',description:`${support.actor}在${remember(support)}里同意的只是有限帮助。保留生活开支，用自己的预算验证客户需求。`,traits:[{dim:0,d:1},{dim:9,d:-1}],cost:{money:reserve?-6:-9},effects:{energy:-3},route:'studio',flags:['future_restart_plan','future_new_studio','bond_restart_bounded'],
    lifeImpact:impact({career:4,freedom:2},{burden:2},'支持会减少时间冲突；订单仍需检验，家人的储蓄不会自动变成公司资金。'),
    outcomes:[outcome('一张报价有人愿意认真谈','第一次试讲时你仍卡了两次，但这回有人帮你听完并指出最难懂的地方。客户留下需求，没有提前付一整年的钱；你可以从一件确实做得到的小事开始。',{engineering:6,communication:5,energy:5},[],feedback(support.actor,'这次按我们说好的范围来。忙不过来时，早点说。','新的报价单压在家庭日历旁边，没有盖住它。','hopeful'),{career:5},{support:3})],
  }];
  if(domain==='life'&&year===2032&&m.support){const old=m.support;return [
    personal(year,'repay-time','先把答应还回去的时间还给对方',`翻到${remember(old)}，核对哪些帮助已经超出原定范围；取消一项额外任务，接回自己的日常责任。`,`${old.actor}把那张旧日历拿出来。你这次没有先解释进度，而是把原来由对方代办的事情接回来。对方终于可以去做一件与你的项目无关的事，下一轮帮助也重新由双方决定。`,{money:-4,energy:-3,bonds:8,stress:-4},{bondActor:old.actor,bondPartner:m.partner.id&&old.actor===m.partner.name?m.partner.id:null,bondSupport:'bounded',bondPact:'kept',workBoundary:'shared'},feedback(old.actor,`我记得${old.year}年说的只是帮一段。你把这段时间还回来了，我们才有余地谈以后。`,'旧日历上，一项拖了很久的私人安排终于重新圈了日期。','warm'),{belonging:8,freedom:4},{support:10,trustDebt:-8,burden:-5}),
    personal(year,'extend-help','告诉对方快成了，请再无限期顶一阵',`把${remember(old)}里的有限帮助继续延长，先让工作保持速度。`,`${old.actor}没有再点头。你仍把这一轮事情排满，但从下周起，对方不再替你处理原本说好只是临时的责任。更多时间被工作占走，能叫来帮忙的人反而少了。`,{money:6,engineering:5,bonds:-12,stress:10},{bondActor:old.actor,bondPartner:m.partner.id&&old.actor===m.partner.name?m.partner.id:null,bondSupport:'withdrawn',bondPact:'broken',relationshipRepair:m.partner.id?'unrepaired':state.life.relationshipRepair},feedback(old.actor,`${old.year}年的“一段”到底到哪天？下周起，那些事情请你自己安排。`,'对方把自己的日程收好，没有再等你给一个模糊的日期。','angry'),{career:6,belonging:-12},{trustDebt:22,support:-15,burden:12}),
  ];}
  if(domain==='career'&&year===2032&&state.flags?.future_restart_plan&&support)return [{
    id:'bond-2032-career-delivery',title:'按共同留下的余力，完成一次小批交付',description:`${support.actor}记得你的承诺；这次只接能完成的一批，把延期与返工也写进计划。`,traits:[{dim:6,d:1},{dim:9,d:-1}],cost:{money:reserve?-4:-7},effects:{energy:-4},route:'studio',flags:['future_restart_attempt'],check:{stat:'engineering',base:state.life.bondPact==='kept'?.62:.48},
    lifeImpact:impact({}, {burden:3},'兑现过分工会增加可用于验证的余地，产品仍可能失败；支持不等于成功保证。'),outcomes:[
      outcome('第二张订单，终于不是靠旧头衔','客户按验收结果付了款。你把第一轮忙乱后的时间也还给了帮忙的人，新的事业开始有自己的收入，家里没有再被默认无限补位。',{money:18,engineering:10,reputation:8},['future_rebuilt_product','bond_rebuild_kept'],feedback(support.actor,'看到回款我也高兴。你答应的那个下午，这次也留下吧。','订单确认和私人日程一起被放在桌上，两张纸都没有被压到最下面。','hopeful'),{career:14,wealth:10,belonging:5},{support:4,leverage:-6}),
      outcome('能交付，规模仍得再小一点','客户付了试用款，续单还没确定。你保留能维护的范围，没有把缺的钱和时间自动转给家里。',{money:6,engineering:6,stress:4},['future_rebuild_small'],feedback(support.actor,'做小一点也可以，我们已经说好不再一起硬撑。','试用款到账后，扩大招聘的草稿仍留在抽屉里。','warm'),{career:6,wealth:4},{burden:4}),
      outcome('这次验证没通过，支持也有结束日期','问题没能按期解决。你承认这轮没做成，按说好的范围收尾；对方愿意陪你吃一顿饭，并没有同意替下一轮继续扛。',{money:-8,reputation:-6,stress:9},['future_rebuild_stalled'],feedback(support.actor,'失败可以说。但我们的约定仍然要算数，今晚先把后面的安排讲清楚。','样品留在桌上，支出与共同日程都需要重新核对。'),{career:-7,wealth:-7},{burden:6,leverage:5}),
    ],
  }];
  if(domain==='life'&&year===2036&&(m.support||crisis)){const old=m.support||crisis; const who=old.actor==='工作伙伴'?person:old.actor;return [personal(year,'remember-the-cost','把当年的帮助和代价，当面说给那个人听',`从${remember(old)}说起，不用一张总成绩单替那些具体的日子作答。`,`${who}记起的细节和你不同。你们没有争谁记得更准确，而是把还想一起做的事写到下一周。后来做成的项目没有抹去旧缺席，失败也没有抹去那一次真的有人伸手。`,{bonds:6,stress:-5,energy:3},{bondPact:'kept',lateLifeFocus:'family',workBoundary:'protected'},feedback(who,`你还记得${old.year}年那件事。我想听的，其实一直是你后来怎么看。`,'旧记录被合上，新的日历留在手边。','warm'),{belonging:7,legacy:5},{trustDebt:-6,support:4})];}
  return [];
}
export function enrichContinuityScene(scene,state,domain) {
  if(state?.continuityEdition!==EDITION)return scene;
  const m=getContinuityMemory(state),added=decisions(scene,state,domain,m);
  const field=domain==='life'?'options':'choices';let options=[...(scene[field]||[])];
  for(const item of added){if(options.length>=8){const index=options.findLastIndex(o=>o.id.startsWith('impact-'));if(index<0)continue;options.splice(index,1);}options.push(item);}
  const crisis=last(m.career.crises),old=domain==='life'?(crisis||m.support):m.support;
  const echoes=old&&[1997,1999,2028,2032,2036].includes(Number(scene.year))
    ?`${old.year===Number(scene.year)?`刚才“${old.title}”的约定还在眼前。`:`${remember(old)}没有随着年份过去。`}${domain==='life'?'那次工作和生活撞在一起留下的安排，今天仍有人想问清楚。':'说好的帮助有边界，眼前的排期也得给它留位置。'}`:'';
  return {...scene,[field]:options,...(echoes?{story:scene.story+'\n'+echoes}:{})};
}
export function getContinuityFeedback(before,after,option,scene) {
  if(before?.continuityEdition!==EDITION||before.phase==='prep')return null;
  const specific=option.outcomes?.[after.lastResult?.outcomeIndex]?.feedback||option.feedback;
  if(option.id.startsWith('bond-'))return specific||null;
  const m=getContinuityMemory(before),year=Number(scene.year);
  const old=before.phase==='life'?[1997,1999].includes(year)?last(m.career.crises):year===2036?m.support:null:[2028,2032].includes(year)?m.support:null;
  if(!old)return null;
  const speaker=old.actor==='工作伙伴'?(m.partner.name||'Jeff'):old.actor;
  // Keep the immediate reaction and add one grounded recollection, rather than
  // substituting a generic dinner scene for what actually just happened.
  const base=getWorldFeedback(before,after,option,scene);
  const initial=base.reactions?.[0];
  const reply=old.kind==='withdrawn'?`我记得${remember(old)}。那时说过不担保，今天这个边界也还在。`:`我还记得${remember(old)}。今天这份新安排，也别把当时说好的事挤掉。`;
  return {environment:base.environment,reactions:initial?.speaker===speaker
    ?[{...initial,text:initial.text+' '+reply}]
    :[...(initial?[{...initial}]:[]),reaction(speaker,reply)].slice(0,2)};
}
