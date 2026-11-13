// Pure, deterministic accumulation. An edition is part of the save contract;
// games without this exact marker never acquire scores or new consequences.
export const DYNAMICS_EDITION = '2026.11.impact';
export const LIFE_VALUES = [
  {key:'career',label:'事业成就',weight:.22,description:'技术、交付与带队逐步留下的成果；失约和重大经营挫折也会改变它。'},
  {key:'wealth',label:'财务底气',weight:.18,description:'收入、缓冲与承受损失的余地；不把下一份尚未兑现的承诺算成现金。'},
  {key:'belonging',label:'亲密联结',weight:.18,description:'与伴侣、家人、朋友和同伴保持的真实联系；婚姻与育儿身份本身不加减分。'},
  {key:'health',label:'身心状态',weight:.18,description:'精力、压力与长期恢复的积累；一次休息不能抹去所有透支。'},
  {key:'freedom',label:'生活自主',weight:.12,description:'能否安排自己的时间、划清承诺和交出职责；不等同于职位高低。'},
  {key:'legacy',label:'长期影响',weight:.12,description:'可复用的工具、研究、培养的人与诚实留下的经验。'},
];
export const PRESSURE_LABELS = {burden:'积压负担',trustDebt:'信任透支',leverage:'财务悬空',support:'支持网络'};

const VALUE_KEYS=LIFE_VALUES.map(value=>value.key);
const PRESSURE_KEYS=Object.keys(PRESSURE_LABELS);
const STAT_KEYS=['energy','stress','bonds','money','engineering','communication','leadership','ecosystem','reputation','control'];
const round=value=>Math.round(value*10)/10;
const clamp=(value,min=0,max=100)=>Math.max(min,Math.min(max,value));
const finite=value=>typeof value==='number'&&Number.isFinite(value)?value:0;
const delta=(before,after,keys)=>Object.fromEntries(keys.map(key=>[key,round(finite(after[key])-finite(before[key]))]).filter(([,value])=>value!==0));
const add=(before,changes,keys)=>Object.fromEntries(keys.map(key=>[key,round(clamp(finite(before[key])+finite(changes?.[key])))]));
const merge=(keys,...changes)=>Object.fromEntries(keys.map(key=>[key,round(changes.reduce((total,change)=>total+finite(change?.[key]),0))]));

export function isDynamicGame(state) { return state?.dynamicsEdition===DYNAMICS_EDITION; }

export function createLifeCourse() {
  return {
    values:{career:20,wealth:35,belonging:50,health:68,freedom:48,legacy:12},
    pressures:{burden:20,trustDebt:12,leverage:18,support:44},
    resolved:[],history:[],
  };
}

function courseOf(state) {
  const initial=createLifeCourse();
  const course=state.lifeCourse;
  if(!course)return initial;
  return {
    values:Object.fromEntries(VALUE_KEYS.map(key=>[key,round(clamp(Number.isFinite(course.values?.[key])?course.values[key]:initial.values[key]))])),
    pressures:Object.fromEntries(PRESSURE_KEYS.map(key=>[key,round(clamp(Number.isFinite(course.pressures?.[key])?course.pressures[key]:initial.pressures[key]))])),
    resolved:Array.isArray(course.resolved)?[...course.resolved]:[],
    history:Array.isArray(course.history)?[...course.history]:[],
  };
}

function trait(option,dim) {
  return (option.traits||[]).filter(item=>item.dim===dim)
    .reduce((sum,item)=>sum+finite(item.d)*clamp(item.w===undefined?1:finite(item.w),0,1),0);
}

function lifePracticeImpact(before,option) {
  const set=option.set||{};
  const values={};const pressures={};
  const inc=(bucket,key,value)=>{bucket[key]=finite(bucket[key])+value;};
  // Identity is deliberately absent: single/married, children/childfree and
  // a partner's name never change these values by themselves.
  if(set.workBoundary==='protected'){inc(values,'freedom',1.2);inc(pressures,'burden',-1.3);}
  if(set.workBoundary==='shared'){inc(values,'freedom',.6);inc(pressures,'support',1);}
  if(set.workBoundary==='seasonal'||set.workBoundary==='porous')inc(pressures,'burden',1);
  if(['scheduled','weekly_call','shared_table','help_network'].includes(set.familyPractice))inc(pressures,'support',1.1);
  if(['open_table','mentoring'].includes(set.socialPractice)){inc(pressures,'support',1);inc(values,'legacy',.5);}
  if(set.hobbyPractice==='weekly'){inc(values,'health',.8);inc(values,'freedom',.6);}
  if(set.relationshipRepair==='unrepaired'){inc(pressures,'trustDebt',3.5);inc(pressures,'support',-1);}
  if(['heard','agreed','repair_done','own_pace'].includes(set.relationshipRepair)){
    inc(pressures,'trustDebt',set.relationshipRepair==='repair_done'?-3:-1);
    inc(pressures,'support',.7);
  }
  if(set.publicBoundary==='private'||set.publicBoundary==='consent')inc(pressures,'trustDebt',-.7);
  if(set.familyExposure==='separate')inc(pressures,'leverage',-2);
  if(set.familyExposure==='capped')inc(pressures,'leverage',-.5);
  if(['shared','community'].includes(set.carePlan))inc(pressures,'support',1.5);
  return {values,pressures};
}

function ordinaryImpact(before,after,option) {
  const course=courseOf(before);
  const d=delta(before.stats||{},after.stats||{},STAT_KEYS);
  const s=after.stats||{};
  const prep=before.phase==='prep';
  const major=before.phase==='choice';
  const stillPushing=finite(d.energy)<=0&&finite(d.stress)>=0;
  const recovering=finite(d.energy)>0&&finite(d.stress)<0;
  const scale=prep?.38:1;
  const growth=major&&before.step>=2?.55:0;
  const values={
    career:(finite(d.engineering)*.22+finite(d.reputation)*.22+finite(d.leadership)*.16+finite(d.ecosystem)*.08+growth)*scale,
    wealth:(finite(d.money)*.34+(major&&s.money>=70?.35:0))*scale,
    belonging:(finite(d.bonds)*.40+finite(d.communication)*.06+trait(option,10)*.35)*scale,
    health:(finite(d.energy)*.26-finite(d.stress)*.24+(major&&s.energy<25?-.8:0))*scale,
    freedom:(finite(d.control)*.08+trait(option,14)*.55-trait(option,9)*.30-trait(option,12)*.30)*scale,
    legacy:(finite(d.ecosystem)*.20+finite(d.engineering)*.07+finite(d.leadership)*.10+trait(option,1)*.4+growth*.5)*scale,
  };
  const pressures={
    burden:(finite(d.stress)*.32-finite(d.energy)*.25+trait(option,12)*.5+(major?.4:0)
      +(!prep&&stillPushing?Math.max(0,finite(s.stress)-55)*.045+Math.max(0,40-finite(s.energy))*.045:0)
      +(!prep&&recovering?-1.2:0))*scale,
    trustDebt:(-finite(d.bonds)*.30+trait(option,9)*.8+(major&&before.life?.relationshipRepair==='unrepaired'?1.3:0))*scale,
    leverage:(-finite(d.money)*.42+Math.max(0,-finite(option.cost?.money))*.12+trait(option,0)*.4
      +(major?Math.max(0,25-finite(s.money))*.10:0))*scale,
    support:(finite(d.bonds)*.28+finite(d.leadership)*.07+finite(d.communication)*.05-trait(option,8)*.30)*scale,
  };
  const practices=lifePracticeImpact(before,option);
  const outcome=!prep?option.outcomes?.[after.lastResult?.outcomeIndex??0]:null;
  const explicit=option.lifeImpact||{};
  const outcomeImpact=outcome?.lifeImpact||{};
  const v=merge(VALUE_KEYS,values,practices.values);
  const p=merge(PRESSURE_KEYS,pressures,practices.pressures);
  const explicitValues=merge(VALUE_KEYS,explicit.values,outcomeImpact.values);
  const explicitPressures=merge(PRESSURE_KEYS,explicit.pressures,outcomeImpact.pressures);
  const valueLimit=prep?2.5:12;
  const pressureLimit=prep?2.5:12;
  for(const key of VALUE_KEYS){
    // Ordinary progress slows near the top; earned milestones can still make
    // large changes. No hidden penalty is applied when computing the score.
    const softened=v[key]>0?v[key]*(1-Math.max(0,course.values[key]-70)/70):v[key];
    const combined=clamp(softened,-valueLimit,valueLimit)+explicitValues[key];
    v[key]=round(prep?clamp(combined,-valueLimit,valueLimit):combined);
  }
  for(const key of PRESSURE_KEYS){
    const combined=clamp(p[key],-pressureLimit,pressureLimit)+explicitPressures[key];
    p[key]=round(prep?clamp(combined,-pressureLimit,pressureLimit):combined);
  }
  return {values:v,pressures:p,hint:[explicit.hint,outcomeImpact.hint].filter(value=>typeof value==='string'&&value).join(' ')};
}

function previewAfter(state,option) {
  const deterministic=state.phase==='choice'&&(!option.check||option.outcomes?.length===1);
  const outcome=deterministic?option.outcomes?.[0]:null;
  let stats=add(state.stats||{},merge(STAT_KEYS,option.cost,option.effects),STAT_KEYS);
  if(outcome)stats=add(stats,outcome.effects,STAT_KEYS);
  if(state.phase==='choice')stats=add(stats,{energy:-3},STAT_KEYS);
  return {...state,stats,lastResult:{outcomeIndex:deterministic?0:-1}};
}

export function previewLifeImpact(state,option,scene) {
  if(!isDynamicGame(state))return {values:{},pressures:{},hint:''};
  const before=courseOf(state);
  const impact=ordinaryImpact(state,previewAfter(state,option),option);
  const values=delta(before.values,add(before.values,impact.values,VALUE_KEYS),VALUE_KEYS);
  const pressures=delta(before.pressures,add(before.pressures,impact.pressures,PRESSURE_KEYS),PRESSURE_KEYS);
  const hints=[];
  if(impact.hint)hints.push(impact.hint);
  if(option.check){
    const outcomes=option.outcomes||[];
    const unavoidable=outcomes.length?['burden','trustDebt','leverage'].filter(key=>outcomes.every(outcome=>finite(outcome.lifeImpact?.pressures?.[key])>0)):[];
    if(unavoidable.length)hints.push(`无论结果如何，这次都会增加${unavoidable.map(key=>PRESSURE_LABELS[key]).join('、')}。`);
    if(outcomes.length&&outcomes.every(outcome=>finite(outcome.lifeImpact?.pressures?.support)<0))hints.push('各结果都会削弱现有的支持网络。');
    hints.push('这里显示当下投入；结果与多年积累引发的事件会在结算时另计。');
  }
  else hints.push(state.phase==='prep'?'准备只带来小幅积累，不会在这里触发重大事件。':'这些变化会积累到后面的年份，关键事件要等事业决定结算。');
  return {values,pressures,hint:hints.join(' ')};
}

const has=(context,...flags)=>flags.some(flag=>context.state.flags?.[flag]);
const had=(context,id)=>context.beforeCourse.resolved.includes(id);
const adult=context=>context.state.step>=4&&context.beforeCourse.history.length>=10;
const persistent=(context,key,threshold)=>context.beforeCourse.pressures[key]>=threshold&&context.course.pressures[key]>=threshold-5;
const recentOverwork=context=>context.beforeCourse.history.filter(entry=>entry.phase!=='prep').slice(-6)
  .filter(entry=>finite(entry.values?.health)<=-2&&finite(entry.pressures?.burden)>=2
    &&!(entry.events||[]).some(event=>event.tone==='crisis')).length;
const relationPerson=state=>['dating','married'].includes(state.life?.relationship)&&state.life?.partner!=='none'
  ?state.life.partner==='lori'?'Lori':state.life.partner==='maya'?'麦雅':'亲近的人':'一直来往的家人或朋友';
function receipt(state,pattern) {
  const records=[...(state.lifeJournal||[]),...(state.evidence||[])].filter(entry=>entry.step<state.step&&pattern.test(entry.choiceTitle||''));
  records.sort((a,b)=>b.step-a.step);
  const entry=records[0];
  return entry?` 这份积累也能追溯到${entry.year}年的“${entry.choiceTitle}”。`:'';
}

// Conditions use accumulation from BEFORE the current decision as well as its
// remaining pressure. A single choice never directly rolls an extra punishment.
const EVENTS=[
  {
    id:'delivery-breakdown',tone:'crisis',priority:100,
    when:c=>adult(c)&&[6,7,8,9].includes(c.state.step)&&c.state.route!=='researcher'
      &&persistent(c,'burden',57)&&(c.stats.energy<38||c.stats.stress>68)&&!has(c,'supply_quality_gate','org_quality_owner','impact_1997_red-button'),
    title:'凌晨两点，整批交付被按下暂停',
    text:c=>`测试负责人打来电话：漏掉的故障在使用方那里连续出现。你赶回去，${c.state.route==='company'?'看见原本准备发走的箱子又堆在门边':'看见准备交付的版本重新被标成了待修复'}。回款或项目支持被推迟，已经许过的日期必须重新解释；这一次，几年的紧绷终于撞上了一次真正的交付。`,
    cause:c=>`此前积压负担${c.beforeCourse.pressures.burden}，本次精力${c.stats.energy}、压力${c.stats.stress}；没有独立质量放行安排。`,
    stats:{money:-19,reputation:-20,energy:-10,stress:15,bonds:-5},
    values:{career:-24,wealth:-13,health:-8,belonging:-3},pressures:{burden:10,leverage:12,trustDebt:5},
  },
  {
    id:'financing-gap',tone:'crisis',priority:90,
    when:c=>adult(c)&&[4,5,7,8,10,11,13,14].includes(c.state.step)&&persistent(c,'leverage',52)&&c.stats.money<34,
    title:'该付的账到了，等的那笔钱还没进来',
    text:'余额旁边，没有再附那句“应该快了”。你重算一遍，仍填不上已经承诺的开支。项目得停掉一部分，伙伴开始要求更短的账期；账面上的机会不能替今天的付款签字。',
    cause:c=>`此前财务悬空${c.beforeCourse.pressures.leverage}，本次可用资金仅${c.stats.money}；多笔承诺一直依赖后续回款。`,
    stats:{money:-15,reputation:-11,control:-12,stress:17},
    values:{career:-18,wealth:-21,freedom:-8,health:-5},pressures:{leverage:8,burden:7,trustDebt:5},
  },
  {
    id:'relationship-distance',tone:'crisis',priority:85,
    when:c=>adult(c)&&[5,7,8,10,12,14].includes(c.state.step)&&persistent(c,'trustDebt',42)&&c.course.pressures.support<65,
    title:'这次，没有人再替你留那个位置',
    text:c=>`${relationPerson(c.state)}发来很短的一条消息：“不用再赶过来了，我们已经重新安排。”没有吵架，也没有要求你解释。你翻看之前几次改期，才发现别人已经不再围着你的忙碌等候。你盯着输入框很久，最后没再发那句“忙完这阵就好了”。`,
    cause:c=>`此前信任透支${c.beforeCourse.pressures.trustDebt}，当前支持网络${c.course.pressures.support}；未兑现的联系已经累积。`,
    stats:{bonds:-22,stress:12,energy:-5},
    values:{belonging:-26,health:-8,freedom:-4},pressures:{support:-13,trustDebt:7},
  },
  {
    id:'exhaustion',tone:'crisis',priority:80,
    when:c=>adult(c)&&[5,6,8,9,11,13,14].includes(c.state.step)&&persistent(c,'burden',65)&&c.stats.energy<=27
      &&recentOverwork(c)>=3&&c.ordinary.values.health<=-2,
    title:'你在熟悉的会议上，忽然接不住下一句话',
    text:'同事重复了一遍问题，你仍没能把屏幕上的几行字连起来。会议提前结束，一段已经排好的工作不得不交出去。它不是一个可以靠再喝杯咖啡追回的晚上；接下来的安排必须先容得下恢复。',
    cause:c=>`此前积压负担${c.beforeCourse.pressures.burden}，最近六次生活或事业决定里有${recentOverwork(c)}次继续透支；这次仍在消耗，精力降到${c.stats.energy}。`,
    stats:{energy:-15,stress:12,engineering:-8,reputation:-6,money:-6},
    values:{health:-27,career:-15,freedom:-8},pressures:{burden:8},
  },
  {
    id:'governance-freeze',tone:'crisis',priority:110,
    when:c=>adult(c)&&[11,12,13].includes(c.state.step)&&persistent(c,'trustDebt',40)&&c.stats.control>=58
      &&!has(c,'future_governance_independent','future_handoff_done','org_quality_owner'),
    title:'那张熟悉的签字单，这次没有送到你面前',
    text:'负责复核的人暂停了几项由你批准的安排，要求补交依据。团队仍要继续工作，你却不能再用一句“我负责”让流程越过去。对方把缺少依据的几页退了回来，你拿着文件站了一会儿，才去找下一位能签字的人。',
    cause:c=>`此前信任透支${c.beforeCourse.pressures.trustDebt}，控制权${c.stats.control}；缺少独立复核或已落实的交接。`,
    stats:{control:-25,reputation:-20,money:-8,stress:15},
    values:{career:-27,freedom:-12,wealth:-7,legacy:-8},pressures:{burden:6,trustDebt:5},
  },
  {
    id:'expansion-overhang',tone:'crisis',priority:75,
    when:c=>adult(c)&&[8,10,11,14].includes(c.state.step)&&persistent(c,'leverage',43)&&persistent(c,'burden',48)
      &&has(c,'supply_reserved','supply_idle_capacity','supply_capacity_plan','company_next_committed','future_restart_plan','impact_2024_presale'),
    title:'预订的窗口到了，订单却少了一半',
    text:'合作方按约留出了排期，客户却把计划往后移。部分预款无法取回，空着的时间仍要付钱。你把扩张表上一行一行划掉；先前争来的主动，现在变成了需要承担的成本。',
    cause:c=>`此前财务悬空${c.beforeCourse.pressures.leverage}、积压负担${c.beforeCourse.pressures.burden}，仍有提前锁定的资源或重建投入。`,
    stats:{money:-23,stress:11,reputation:-7,control:-6},
    values:{wealth:-25,career:-17,freedom:-6},pressures:{leverage:10,burden:6},
  },
  {
    id:'team-rescue',tone:'breakthrough',priority:100,
    when:c=>adult(c)&&[5,6,8,9,11,12,14].includes(c.state.step)&&persistent(c,'support',60)
      &&(c.beforeCourse.pressures.burden>=45||c.crisisOccurred)
      &&has(c,'org_joint_lead','org_project_owners','org_delegated_budget','shared_ownership','mentored','future_successor_in_place','impact_1992_empty-chair','impact_1999_rival-table'),
    title:'你还没开口，群里已经有人接下了值守',
    text:'一位同事接走客户电话，另一位把返工排期重新写好。他们不是突然成了救兵：以前你让他们独立决定，也在他们需要时到过场。这一次，项目不必全靠你熬过今晚；已经付出的损失仍在，但有人和你一起收拾。',
    cause:c=>`此前支持网络${c.beforeCourse.pressures.support}，已有授权或带教记录；压力出现时，团队能够实际接手。${receipt(c.state,/共同负责|负责人|预算|交给|带教|后辈|轮流|分工/)}`,
    stats:{energy:17,stress:-16,leadership:10,bonds:8,reputation:4},
    values:{career:16,belonging:13,health:12,legacy:7},pressures:{burden:-20,support:5,trustDebt:-5},
  },
  {
    id:'quality-dividend',tone:'breakthrough',priority:85,
    when:c=>adult(c)&&[7,8,9,10,11].includes(c.state.step)&&c.beforeCourse.values.career>=32
      &&has(c,'supply_quality_gate','supply_pilot_passed','release_bounded','impact_1997_red-button')&&c.stats.engineering>=58&&c.course.pressures.burden<72,
    title:'客户带着旧验收表，签下了下一批',
    text:'对方没有再让你重讲愿景，只问能不能沿用上次的测试标准。以前为了验证少交的一批、写清的限制和保留的故障记录，终于省掉这轮争执。回款和信任一起来了，维护责任也继续留在合同里。',
    cause:c=>`此前事业成就${c.beforeCourse.values.career}，已有质量或有界交付记录；当前工程能力${c.stats.engineering}。${receipt(c.state,/质量|试产|验证|测试|锁定范围|验收/)}`,
    stats:{money:17,reputation:14,ecosystem:8,stress:-6},
    values:{career:21,wealth:15,legacy:10},pressures:{leverage:-13,trustDebt:-5,burden:-5},
  },
  {
    id:'research-return',tone:'breakthrough',priority:90,
    when:c=>adult(c)&&[10,11,13,14].includes(c.state.step)&&c.beforeCourse.values.legacy>=26
      &&has(c,'rd_shared_tools','rd_research_grants','platform_adoption','future_academic_path','impact_2007_wild-lab','impact_2012_skeptic-seat','impact_2016_grumpy-users')&&c.stats.engineering>=60&&c.stats.ecosystem>=22,
    title:'一个陌生团队，把你的方法重新跑通了',
    text:'邮件附着完整步骤，最后一句是：“我们不需要再请你远程操作了。”几年里补过的工具、维护过的说明和支持过的人，终于变成别人能独立使用的东西。接下来有人邀请你共同研究；影响开始走到你不在场的地方。',
    cause:c=>`此前长期影响${c.beforeCourse.values.legacy}，已有工具或研究投入；当前生态${c.stats.ecosystem}、工程能力${c.stats.engineering}。${receipt(c.state,/工具|文档|研究|复现|论文/)}`,
    stats:{ecosystem:19,reputation:14,money:7,leadership:7},
    values:{legacy:24,career:18,wealth:6,freedom:5},pressures:{support:7,burden:-4},
  },
  {
    id:'relationship-return',tone:'breakthrough',priority:80,
    when:c=>adult(c)&&[7,8,10,11,13,14,15].includes(c.state.step)
      &&(had(c,'relationship-distance')||c.beforeCourse.history.some(entry=>finite(entry.pressures?.trustDebt)>=3))
      &&c.beforeCourse.pressures.trustDebt<=28&&c.course.pressures.support>=58
      &&['repair_done','agreed','own_pace'].includes(c.state.life?.relationshipRepair),
    title:'对方又问了一次：“周六，你会来吗？”',
    text:'这次邀请来得很普通。你翻了日历，确认可以到场，才回复。之前的几次兑现没有让过去消失，但关系不再只剩解释；无论同行的是伴侣、亲人还是老朋友，都有人重新愿意把你算进下一次安排。',
    cause:c=>`曾有关系疏远或明显失约记录；此前信任透支已降到${c.beforeCourse.pressures.trustDebt}，当前支持网络${c.course.pressures.support}，并有实际修复安排。${receipt(c.state,/兑现|修复|约会|朋友|来往|吃顿饭|见面/)}`,
    stats:{bonds:17,stress:-11,energy:8},
    values:{belonging:22,health:11,freedom:5},pressures:{trustDebt:-12,support:8,burden:-7},
  },
  {
    id:'rebuild-orders',tone:'breakthrough',priority:105,
    when:c=>adult(c)&&[14,15].includes(c.state.step)&&has(c,'future_restart_plan')
      &&has(c,'future_rebuilt_product','future_comeback_working')&&c.beforeCourse.values.career>=25
      &&c.course.pressures.leverage<65&&c.stats.money>=12,
    title:'第二笔钱到账时，你才敢说这回站住了',
    text:'客户按新合同付了款，不是看在你以前的头衔上。小团队把工资发完，还留下一点可以返工的余钱。过去的损失没有被退回来，新的收入却证明：这一次重新开张，已经不只是你一个人的执念。',
    cause:c=>`2028年已有重建计划，后来做出产品或获得续单；此前事业成就${c.beforeCourse.values.career}，当前资金${c.stats.money}，财务悬空${c.course.pressures.leverage}。${receipt(c.state,/重新组|第一款产品|独立做一个小产品|重新验证/)}`,
    stats:{money:18,reputation:16,leadership:9,stress:-8},
    values:{career:24,wealth:20,freedom:10,legacy:8},pressures:{leverage:-17,burden:-8,support:5},
  },
  {
    id:'recovery-breath',tone:'breakthrough',priority:70,
    when:c=>adult(c)&&[8,9,10,11,13,14,15].includes(c.state.step)&&(had(c,'exhaustion')||had(c,'delivery-breakdown'))
      &&c.beforeCourse.pressures.burden<=58&&c.course.pressures.burden<=48&&c.stats.energy>=48&&c.stats.stress<62
      &&['protected','shared'].includes(c.state.life?.workBoundary),
    title:'这周过去了，没有再靠熬夜把它补完',
    text:'你按约离开，也让其他人把剩下的事做完。早晨醒来，积在身上的疲惫终于不再盖住整天。已经错过的机会不会补发，新的工作却可以在较稳的节奏里继续。',
    cause:c=>`经历过劳或交付危机之后，此前积压负担降到${c.beforeCourse.pressures.burden}，当前精力${c.stats.energy}、压力${c.stats.stress}，并保留了工作边界。`,
    stats:{energy:16,stress:-13,engineering:6},
    values:{health:23,freedom:13,career:8},pressures:{burden:-14,support:3},
  },
  {
    id:'team-runway-halts',tone:'crisis',priority:115,
    when:c=>c.state.step===14&&has(c,'impact_2032_no-one-leaves')&&c.beforeCourse.pressures.burden>=55
      &&c.beforeCourse.pressures.leverage>=30&&c.stats.money<20,
    title:'人都留下了，项目却接连停了下来',
    text:'三位负责人把付款申请放在一起，谁都不愿先拿走另一组的钱。你答应过不放弃任何一条路，可余额已经不足以让它们同时继续。大家仍在办公室里，下一步却只能先把承诺缩回能承担的范围。',
    cause:c=>`保留全部项目之前，积压负担已到${c.beforeCourse.pressures.burden}、财务悬空${c.beforeCourse.pressures.leverage}；本次剩余资金${c.stats.money}。问题来自资源缺口，不是留下团队的愿望本身。`,
    stats:{money:-10,reputation:-15,leadership:-12,control:-10,stress:12},
    values:{career:-26,wealth:-18,belonging:-8,freedom:-8},pressures:{burden:12,trustDebt:14,leverage:8},
  },
  {
    id:'team-stays-together',tone:'breakthrough',priority:110,
    when:c=>c.state.step===14&&has(c,'impact_2032_no-one-leaves')&&c.beforeCourse.pressures.burden<45
      &&c.beforeCourse.pressures.support>=55&&c.beforeStats.money>=50,
    title:'这一次，你们确实有余地一起留下',
    text:'负责人重新排完预算，发现不用把任何一组的工资挪走，也能完成下一轮验证。大家把排期签下来，曾经共同解决过问题的人又坐回一张桌边。留下所有人仍然花钱，但这回不是让他们陪你等待一笔不知何时到账的款。',
    cause:c=>`决定之前资金${c.beforeStats.money}、积压负担${c.beforeCourse.pressures.burden}、支持网络${c.beforeCourse.pressures.support}；已有缓冲和分工让全员继续成为可承担的安排。`,
    stats:{engineering:10,leadership:10,reputation:8,bonds:6,stress:-6},
    values:{career:19,belonging:14,legacy:11},pressures:{support:8,burden:-9,trustDebt:-5},
  },
  {
    id:'handoff-dividend',tone:'breakthrough',priority:75,
    when:c=>adult(c)&&[11,12,14,15].includes(c.state.step)&&c.beforeCourse.pressures.support>=58
      &&has(c,'org_successor_ready','future_successor_in_place')&&c.stats.leadership>=55,
    title:'会议按时结束，整场没有人找你拍板',
    text:'新负责人发来结论，几处做法与你不同，事情仍然完成了。以前花时间教人、让人试错的决定，终于还给你一个完整下午。你留下的影响没有消失，只是不必再以你的持续在场为代价。',
    cause:c=>`此前支持网络${c.beforeCourse.pressures.support}，已有实际接班安排，当前领导力${c.stats.leadership}。${receipt(c.state,/接任|负责人|交班|交出|接班/)}`,
    stats:{energy:13,stress:-12,leadership:9,control:-7},
    values:{freedom:23,legacy:18,health:9,belonging:7},pressures:{burden:-17,support:5},
  },
];

function resolveEvent(definition,context) {
  const beforeStats=context.stats;
  const beforeValues=context.course.values;
  const stats=add(beforeStats,definition.stats,STAT_KEYS);
  const values=add(beforeValues,definition.values,VALUE_KEYS);
  const pressures=add(context.course.pressures,definition.pressures,PRESSURE_KEYS);
  return {
    stats,course:{...context.course,values,pressures,resolved:[...context.course.resolved,definition.id]},
    event:{id:definition.id,tone:definition.tone,title:definition.title,
      text:typeof definition.text==='function'?definition.text(context):definition.text,
      cause:definition.cause(context),statChanges:delta(beforeStats,stats,STAT_KEYS),values:delta(beforeValues,values,VALUE_KEYS)},
  };
}

export function applyLifeDynamics(before,after,option,scene) {
  if(!isDynamicGame(before))return {stats:{...after.stats},lifeCourse:after.lifeCourse,impact:{values:{},pressures:{},events:[]}};
  const beforeCourse=courseOf(before);
  const ordinary=ordinaryImpact(before,after,option);
  let course={...beforeCourse,values:add(beforeCourse.values,ordinary.values,VALUE_KEYS),pressures:add(beforeCourse.pressures,ordinary.pressures,PRESSURE_KEYS)};
  let stats={...after.stats};
  const events=[];
  if(before.phase==='choice'&&after.phase==='result'){
    for(const tone of ['crisis','breakthrough']){
      const context={state:after,beforeStats:before.stats,beforeCourse,course,stats,ordinary,crisisOccurred:events.some(event=>event.tone==='crisis')};
      const eligible=EVENTS.filter(event=>event.tone===tone&&!course.resolved.includes(event.id)&&event.when(context));
      eligible.sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
      if(!eligible.length)continue;
      const resolved=resolveEvent(eligible[0],context);
      course=resolved.course;stats=resolved.stats;events.push(resolved.event);
    }
  }
  const impact={values:delta(beforeCourse.values,course.values,VALUE_KEYS),pressures:delta(beforeCourse.pressures,course.pressures,PRESSURE_KEYS),events};
  const entry={step:before.step,year:String(scene?.year||''),phase:before.phase,optionId:String(option.id||''),values:impact.values,pressures:impact.pressures,
    ...(events.length?{events}:{}),
  };
  return {stats,lifeCourse:{...course,history:[...beforeCourse.history,entry]},impact};
}

function verdict(values,score,provisional) {
  const ordered=[...values].sort((a,b)=>b.value-a.value||VALUE_KEYS.indexOf(a.key)-VALUE_KEYS.indexOf(b.key));
  const strongest=ordered[0],weakest=ordered.at(-1);
  let title;
  if(strongest.key==='career'&&values.find(value=>value.key==='health').value<35)title='事业做大了，自己却需要停一停';
  else if(strongest.key==='wealth'&&values.find(value=>value.key==='belonging').value<35)title='账上有了余量，身边还需要重新靠近';
  else if(values.every(value=>value.value>=55))title='做成一些事，也给日子留了余地';
  else if(strongest.key==='belonging')title='最稳的部分，是仍然愿意来往的人';
  else if(strongest.key==='health'||strongest.key==='freedom')title='把日子一点点拿回自己手里';
  else if(strongest.key==='legacy')title='有些东西，已经能在你不在时继续';
  else if(score<400)title='有几处跌得很重，后面的路仍能重排';
  else title='有得有失，留下的是这一局的选择';
  const grade=score>=850?'S':score>=720?'A':score>=580?'B':score>=430?'C':'D';
  const earned={
    career:'很多难题是在你手里做成的，回头看时，确实有几件事值得记住。',
    wealth:'你攒下了应付变故的余地，账单不再每次都把你推着往前跑。',
    belonging:'还有人愿意听你说近况，也有人在等下一次约定。',
    health:'你给自己留住了醒来后，还能好好过一天的力气。',
    freedom:'你有一些时间可以自己决定，不必每次都先向工作借来。',
    legacy:'你做过的东西、带过的人，已经把影响带到你不在的地方。',
  };
  const unfinished={
    career:'有些想做的事仍没做成，它们可以是遗憾，也可以留待下一次认真开始。',
    wealth:'手上的缓冲仍薄，下一份承诺需要给自己留一点能退回来的余地。',
    belonging:'有些联系在忙碌里淡了；想重新靠近，需要一次真正到场的约定。',
    health:'那些靠硬撑过去的日子还留在身上，之后的安排需要容得下恢复。',
    freedom:'你承担了许多事，能完全由自己决定的时间却还不多。',
    legacy:'不少成果仍离不开你亲自到场，接下来可以慢慢让别人也接得住。',
  };
  const comment=earned[strongest.key]+(weakest.value<55?unfinished[weakest.key]:'这份平衡也需要日后继续照看。')+(provisional?'故事还没走完，这只是目前的暂评。':'');
  return {grade,title,comment};
}

export function getLifeScore(state) {
  const course=courseOf(state);
  const decisionCount=isDynamicGame(state)?course.history.length:0;
  const complete=state.phase==='ended'&&(state.journal?.length||0)>=16;
  const provisional=!complete;
  const values=LIFE_VALUES.map(value=>({...value,value:course.values[value.key]}));
  const allEvents=course.history.flatMap(entry=>(entry.events||[]).map(event=>({id:event.id,year:entry.year,tone:event.tone,title:event.title,text:event.text,
    weight:Object.values(event.values||{}).reduce((sum,value)=>sum+Math.abs(value),0)})));
  const highlights=allEvents.map((event,index)=>({...event,index})).sort((a,b)=>b.weight-a.weight||a.index-b.index).slice(0,3)
    .sort((a,b)=>a.index-b.index).map(({weight,index,...event})=>event);
  if(!decisionCount)return {score:null,maxScore:1000,grade:'未评分',title:'先做出一个决定，再看它留下什么',comment:'还没有选择记录，初始处境不算成就，也不预判这一生。',values,highlights:[],provisional:true,decisionCount:0};
  const score=Math.round(values.reduce((sum,value)=>sum+value.value*value.weight,0)*10);
  return {score,maxScore:1000,...verdict(values,score,provisional),values,highlights,provisional,decisionCount};
}
