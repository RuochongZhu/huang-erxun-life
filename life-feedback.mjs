// Small receipts for the actual committed change. This layer never resolves an
// event, changes a resource, or infers a private history from a score.
export const LIFE_FEEDBACK_EDITION = '2026.11.plans';
const finite = value => typeof value === 'number' && Number.isFinite(value);
const resource = value => finite(value) && value >= 0 && value <= 100;
const number = value => Math.round(value * 100) / 100;
const copy = value => Array.isArray(value) ? value.map(copy) : value && typeof value === 'object'
  ? Object.fromEntries(Object.entries(value).map(([key,item]) => [key,copy(item)])) : value;
const unique = (items,key) => {
  const seen = new Set();
  return items.filter(item => {
    const token = key(item);
    if (seen.has(token)) return false;
    seen.add(token); return true;
  });
};
const paired = life => ['dating','married'].includes(life?.relationship) && ['lori','maya'].includes(life?.partner);
const partnerName = life => life.partner === 'lori' ? 'Lori' : '麦雅';
const names = {student:'求学',employee:'受雇工作',company:'经营公司',studio:'独立工作室',researcher:'研究与教学',sold:'交接后的顾问工作'};
const routeName = state => state.route==='sold'&&state.flags?.if_2026_layoff ? '离职后的过渡期' : names[state.route];
const point = (kind,label,before,after,text,priority,unit='点') => ({kind,label,before,after,...(unit?{unit}:{}),text,priority});

function relationStatus(life) {
  if (!life || life.historyKnown === false) return null;
  if (paired(life)) return `与${partnerName(life)}${life.relationship === 'married' ? '维持婚姻' : '交往'}${life.livingArrangement === 'apart' ? '，各自居住' : ''}`;
  if (life.partner !== 'none') return null;
  if (life.marriageOutcome === 'divorced') return '已离婚，目前没有伴侣';
  if (life.relationship === 'separated') return '关系结束后独立生活';
  return life.relationship === 'single' ? '单身' : null;
}

function relationshipChange(before,after) {
  const a=before.life||{},b=after.life||{};
  const was=relationStatus(a),now=relationStatus(b);
  if (was && now && was!==now) {
    let text;
    if (paired(a)&&!paired(b)) text=`这次关系已结束，之后的住处与联系由各自安排。${b.children==='parent'?'已有孩子的记录仍保留，关系结束没有取消家庭联系。':''}`;
    else if (!paired(a)&&paired(b)) text=`你和${partnerName(b)}开始了${b.relationship==='married'?'婚姻生活':'交往'}。${b.relationship==='dating'?'目前仍是恋爱关系，没有自动变成婚姻。':''}`;
    else if (paired(b)&&a.livingArrangement!==b.livingArrangement) text=b.livingArrangement==='apart'
      ?`你和${partnerName(b)}仍${b.relationship==='married'?'保留婚姻关系':'在交往'}，这次改为各自居住。`
      :`你和${partnerName(b)}的居住安排已调整为${b.livingArrangement==='together'?'共同生活':'各自明确的日常'}。`;
    else text=`关系安排由“${was}”改为“${now}”。`;
    if(b.children==='parent'&&a.children!=='parent'&&Number.isInteger(b.childCount)&&b.childCount>0)text+=`这次也开始育儿，已有${b.childCount}个孩子的生活记录。`;
    return point('relationship','关系进展',was,now,text,110,null);
  }
  if (a.children!==b.children || a.childCount!==b.childCount) {
    if (b.children==='parent'&&Number.isInteger(b.childCount)&&b.childCount>0) {
      return point('relationship','家庭安排',a.children==='parent'?`育有${a.childCount}个孩子`:'尚未开始育儿',`育有${b.childCount}个孩子`,
        `这次生活安排进入育儿阶段，记录了${b.childCount}个孩子。照护与时间分工仍按你实际选择的方式继续。`,108,null);
    }
    if (b.children==='childfree')return point('relationship','家庭安排',a.children==='undecided'?'此前未决定':a.children==='childfree'?'不育儿':'此前的家庭安排','选择不育儿',
      '关于是否养育孩子，这次已明确选择不育儿。',108,null);
  }
  const changes = [
    ['carePlan',{personal:'更多亲自照应',shared:'共同分担照护',community:'连接当地支持'},'照护分工'],
    ['partnerCareer',{protected:'为对方事业留出时间',alternating:'轮流承担忙季',parallel:'保留各自职业路线'},'伴侣事业'],
    ['publicBoundary',{private:'保留私人生活',consent:'逐一征求公开同意',brief:'只作简短说明',context:'补足公开事实'},'公开边界'],
    ['familyPractice',{letter:'书信联系',shared_table:'固定一起吃饭',scheduled:'按约定时间联系',help_network:'相互照应',weekly_call:'定期联系'},'家人联系'],
  ];
  for (const [field,labels,label] of changes) {
    if (a[field]===b[field] || !labels[b[field]] || (field==='partnerCareer'&&!paired(b))) continue;
    return point('relationship',label,labels[a[field]]||'此前未固定',labels[b[field]],
      `${label}现在按“${labels[b[field]]}”安排。${field==='partnerCareer'?`${partnerName(b)}仍有自己的工作决定。`:field==='publicBoundary'?'这只改变公开范围，不代替私下关系的去留。':''}`,88,null);
  }
  return null;
}

const CAREER_FLAGS = [
  ['future_comeback_unfinished','重建进展','这次重新尝试没有做成，已有结果没有被记成复出成功。'],
  ['future_rebuild_stopped','重建进展','这一款产品没有找到足够需求，本轮重建已停止扩张。'],
  ['future_rebuilt_product','重建进展','新团队的产品已有续单，这是本次已经发生的交付结果。'],
  ['future_comeback_working','重建进展','重新开始的项目得到实际合作，后面的规模仍未保证。'],
  ['future_comeback_small','重建进展','项目留下小规模收入，当前仍按能维护的范围继续。'],
  ['future_rebuild_small','重建进展','产品已有试用收入，是否续单仍未确认。'],
  ['org_manager_promoted','职务变化','本轮晋升已经获批，新增职责与收入开始按任命执行。'],
  ['org_manager_trial','职务变化','这轮拿到的是代理机会，正式任命仍需之后评审。'],
  ['org_expert_track','职务变化','你走上技术主责路线，整组管理仍由其他人负责。'],
  ['org_joint_lead','职务变化','职责改为和搭档共同承担，轮值已经成为这次安排的一部分。'],
  ['future_retire','工作安排','长期工作进入退休与交接安排，私人生活按自己的计划继续。'],
  ['future_successor_in_place','职责交接','接手的人已开始承担独立职责，你保留的是约定范围内的帮助。'],
  ['future_role_exit','职务变化','你退出本轮管理，下一份岗位没有因此自动确定。'],
  ['future_role_restricted','职务变化','相关审批已交给其他负责人，复核结论仍未确定。'],
  ['future_role_technical','职务变化','目前保留的是有期限的技术职责，相关合作审批已分开。'],
  ['future_platform_working','研发进展','第一轮交付已通过验收，伙伴确认了下一阶段支持。'],
  ['future_platform_stopped','研发进展','这轮合作没有继续，后续工作需要按已确认的范围收尾。'],
  ['future_platform_small','研发进展','已有一部分通过验收，下一轮改为较小范围。'],
  ['future_restart_plan','重新起步','新团队进入起步安排，第一笔收入仍要靠之后实际交付。'],
  ['future_academic_path','工作方向','你接下一段有期限的教学与研究合作，尚不是永久教职。'],
  ['future_academic','工作方向','下一阶段转向课程或研究，继续按实际任务投入。'],
  ['rd_shared_tools','研发方向','研发开始投入可共同使用的工具，也需要承担后续维护。'],
  ['rd_research_grants','研发方向','资源开始用于小型研究合作，成果仍要由实际验证决定。'],
  ['supply_quality_gate','交付安排','质量放行由测试负责人把关，交期不能代替未通过的检查。'],
  ['employer_amd','职业起点','第一份工作选择了 AMD 的微处理器设计方向。'],
  ['employer_lsi','职业起点','职业起点选择了 LSI 的客户芯片方案方向。'],
  ['employer_research','职业起点','职业起点选择了研究训练，正式教职尚未自动出现。'],
];

function careerChange(before,after,phase) {
  const oldFlags=before.flags||{},flags=after.flags||{};
  if(after.route==='sold'&&flags.if_2026_layoff&&!oldFlags.if_2026_layoff)return point('career','职务变化',routeName(before),routeName(after),
    '本次工作已经结束，目前是离职后的过渡期；新岗位尚未确定。',104,null);
  const confirmed=CAREER_FLAGS.find(([flag])=>flags[flag]===true&&oldFlags[flag]!==true);
  if (confirmed) {
    const [,label,text]=confirmed;
    return {kind:'career',label,text,priority:104};
  }
  if (before.route!==after.route&&routeName(before)&&routeName(after))return point('career','事业方向',routeName(before),routeName(after),
    `工作方向由${routeName(before)}转入${routeName(after)}。`,100,null);
  const fields=[['engineering','工程能力'],['leadership','带队能力'],['communication','沟通能力'],['ecosystem','合作网络'],['reputation','职业声誉']];
  const changed=fields.filter(([key])=>resource(before.stats?.[key])&&resource(after.stats?.[key])&&before.stats[key]!==after.stats[key])
    .sort((a,b)=>Math.abs(after.stats[b[0]]-before.stats[b[0]])-Math.abs(after.stats[a[0]]-before.stats[a[0]]))[0];
  if (!changed) return null;
  const [key,label]=changed,a=before.stats[key],b=after.stats[key],amount=number(Math.abs(b-a));
  const context=phase==='prep'?'这一步准备':phase==='life'?'这次生活安排':'这次工作决定';
  const text=b>a?`${context}留下了更多${{engineering:'可以继续使用的技术经验',leadership:'实际带队经验',communication:'沟通经验',ecosystem:'合作基础',reputation:'职业认可'}[key]}。`
    :`${context}之后，${label}有所回落；下一轮仍需从现有条件继续。`;
  return point('career',label,a,b,text,phase==='prep'?80:65);
}

function moneyChange(before,after) {
  const a=before.stats?.money,b=after.stats?.money;
  if (!resource(a)||!resource(b))return null;
  const amount=number(Math.abs(b-a));
  const text=b===0?'资金储备已到0点，新的付费安排暂时没有余量。'
    :b>a?'多出来的资金余量可以留给后面的开支，也可以先保留下来。'
      :b<a?'这次结算后，可投入下一项安排的资金余量变少了。'
        :'这一轮没有改变资金储备。';
  return point('money','资金储备',a,b,text,a===b?12:b===0?112:94);
}

function relationshipNumbers(before,after) {
  const a=before.stats?.bonds,b=after.stats?.bonds;
  const supportA=before.lifeCourse?.pressures?.support,supportB=after.lifeCourse?.pressures?.support;
  const supportChanged=resource(supportA)&&resource(supportB)&&supportA!==supportB;
  if(resource(a)&&resource(b)&&a!==b) {
    const change=number(Math.abs(b-a));
    const text=b>a?'这次相处为后续联系多留了一些余地；需要新的帮助时，仍由对方决定能接多少。'
      :'关系资源有所回落；下一项安排需要重新听取当事人的意愿。';
    const supportText=supportChanged?`支持网络也${supportB>supportA?'有所增加':'有所减少'}，由${number(supportA)}点变为${number(supportB)}点。`:'';
    return point('relationship','亲近与联系',a,b,text+supportText,82);
  }
  if(supportChanged)return point('relationship','支持网络',supportA,supportB,
    supportB>supportA?'这次安排增进了支持基础；具体能帮到哪里，还可以按各自的空闲继续商量。':'支持基础比刚才少了一些；新的安排需要先确认对方还能承担什么。',70);
  return null;
}

function energyChange(before,after) {
  const energyA=before.stats?.energy,energyB=after.stats?.energy,stressA=before.stats?.stress,stressB=after.stats?.stress;
  const energyValid=resource(energyA)&&resource(energyB),stressValid=resource(stressA)&&resource(stressB);
  const energyChanged=energyValid&&energyA!==energyB,stressChanged=stressValid&&stressA!==stressB;
  if(!energyChanged&&!stressChanged)return null;
  const both=energyChanged&&stressChanged;
  const text=[energyChanged?(energyB>energyA?'这轮安排让你恢复了一些精力。':'这轮安排消耗了精力，继续追加事情时可用的体力更少了。'):'',
    stressChanged?(stressB>stressA?'压力还在增加，眼前的安排并没有替你卸下这一部分负担。':`压力已经回落，当前为${number(stressB)}点。`):''].join('');
  const urgent=(energyValid&&energyB<=20)||(stressValid&&stressB>=80);
  return point('energy',both?'精力与压力':energyChanged?'精力':'压力',energyChanged?energyA:stressA,energyChanged?energyB:stressB,text,urgent?99:68);
}

function plainResult(before,after,option) {
  const label=after.lastResult?.label||option?.label||option?.title;
  if(!label)return null;
  return {kind:before.phase==='life'?'relationship':'career',label:before.phase==='prep'?'准备回执':'本次结果',text:`${label}。`,priority:1};
}

const personKey=name=>/Lori/i.test(name)?'lori':/麦雅|Maya/i.test(name)?'maya':/Jeff/.test(name)?'jeff'
  :/陈立文|Leo Chen/i.test(name)?'leo':String(name).replace(/[（(].*?[）)]/g,'').trim();

function presentPeople(scene,before,after) {
  const knownPartnerIds=new Set([before.life,after.life].filter(paired).map(life=>life.partner));
  const hasChildren=before.life?.children==='parent'||after.life?.children==='parent';
  return (Array.isArray(scene?.people)?scene.people:[]).filter(person=>{
    if(!person||typeof person.name!=='string'||!person.name.trim())return false;
    const role=person.role||'';
    if(/通过论文|时代背景|非在场|已故|远在|传记中|通过报道|仅作原型/.test(role))return false;
    const key=personKey(person.name);
    if(['lori','maya'].includes(key)&&!knownPartnerIds.has(key))return false;
    if(/景安|雨禾|儿子|女儿|孩子/.test(person.name+' '+role)&&!hasChildren)return false;
    return true;
  });
}

function currentPartnerSince(state) {
  if(!paired(state.life))return Infinity;
  let since=0;
  for(const entry of state.lifeJournal||[]) {
    const set=entry.set||{};
    if(set.relationship==='separated'||(Object.hasOwn(set,'partner')&&set.partner!==state.life.partner))since=entry.step+1;
  }
  return since;
}

function rememberedSupplement(before,scene,people) {
  const year=Number(scene?.year);
  if(![1996,1999,2026,2028,2032,2036].includes(year)||before.phase==='prep')return null;
  const since=currentPartnerSince(before);
  const entries=(before.supplementJournal||[]).filter(entry=>entry&&Number.isInteger(entry.step)&&entry.step<before.step
    &&Number.isFinite(Number(entry.year))&&Number(entry.year)<year&&typeof entry.title==='string'&&typeof entry.actor==='string');
  for(let index=entries.length-1;index>=0;index--){
    const entry=entries[index],key=personKey(entry.actor),person=people.find(item=>personKey(item.name)===key);
    if(!person||(['lori','maya'].includes(key)&&(!paired(before.life)||before.life.partner!==key||entry.step<since)))continue;
    if(/自己|独自|休息/.test(entry.title))continue;
    const title=entry.title.replace(/[。！？]$/,'').slice(0,36);
    const beginning=/电话|通话|打给/.test(title)?`${entry.year}年你打来的那通电话，我还记得。`
      :/核账|对账|账单|预算|开支/.test(title)?`${entry.year}年那次一起算账，我还记得。`
        :`${entry.year}年那次“${title}”，我没有忘。`;
    const ending=/核账|对账|账单|预算|开支/.test(title)?'这次也先按手上真有的资源来排。':'这回有新的安排，也把能做到的部分早点说清。';
    return {speaker:person.name,text:beginning+ending,tone:'warm'};
  }
  return null;
}

function additionalReaction(before,after,option,scene,existingReactions) {
  const present=presentPeople(scene,before,after);
  // Existing reactions already identify who is actually speaking in this
  // result. A cast list is not permission to summon another person into it.
  const people=existingReactions.length?unique(existingReactions,item=>personKey(item.speaker)).map(item=>{
    const found=present.find(person=>personKey(person.name)===personKey(item.speaker));
    return {name:item.speaker,role:found?.role||''};
  }):present;
  if(!people.length)return null;
  const memory=rememberedSupplement(before,scene,people);
  if(memory)return memory;
  const a=before.life||{},b=after.life||{};
  const familyPerson=people.find(item=>personKey(item.name)===(paired(b)?b.partner:paired(a)?a.partner:'jeff'));
  const colleague=people.find(item=>/同事|搭档|同学|同班|组员|领班|主管|负责人|合作|研究|工程|人事/.test(item.role||''));
  const person=existingReactions.length?people[0]:before.phase==='life'?(familyPerson||people[0]):(colleague||people[0]);
  const speakingFamily=familyPerson&&personKey(familyPerson.name)===personKey(person.name)?familyPerson:null;
  const speaker=person.name;
  if(before.phase==='prep') {
    const tags=option?.prepTags||[];
    const title=option?.title||'';
    const text=tags.includes('evidence')||/测|核对|数据/.test(title)?'没通过的部分也留下，下一步别只看最好的一次。'
      :tags.includes('listen')||tags.includes('ask')||/听|问/.test(title)?'你既然问了，我也想把自己这边的难处说清。'
        :before.step<2?'这一步弄清了，接下来就照能做到的安排来。':'准备的范围我听明白了，临时有变化再一起改。';
    return {speaker,text,tone:'hopeful'};
  }
  if(speakingFamily&&paired(a)&&!paired(b))return {speaker:speakingFamily.name,text:'之后需要联系的事说清楚，其他部分我会自己决定。',tone:'tense'};
  if(speakingFamily&&!paired(a)&&paired(b))return {speaker:speakingFamily.name,text:b.relationship==='married'?'日子开始一起安排，家里的事也要一起承担。':'我也愿意继续了解你，下一次见面的时间我们一起定。',tone:'hopeful'};
  if(speakingFamily&&a.livingArrangement!==b.livingArrangement&&b.livingArrangement==='apart')return {speaker:speakingFamily.name,text:'先照这个安排过一段，有变化时再各自说清。',tone:'tense'};
  if(speakingFamily&&a.children!=='parent'&&b.children==='parent')return {speaker:speakingFamily.name,text:'照看的时间先排出来，需要换手时别等到最后再说。',tone:'hopeful'};
  const flags=after.flags||{},oldFlags=before.flags||{};
  if(flags.org_manager_trial&&!oldFlags.org_manager_trial)return {speaker,text:'先把代理这一段做好，正式评审时再谈后面的职责。',tone:'tense'};
  if(flags.org_manager_promoted&&!oldFlags.org_manager_promoted)return {speaker,text:'任命已经下来了，哪些事你负责、哪些还要找别人，先告诉大家。',tone:'hopeful'};
  if((flags.future_restart_plan&&!oldFlags.future_restart_plan)||(flags.future_new_studio&&!oldFlags.future_new_studio))return {speaker,text:'先把第一件真能交的东西做出来，后面的规模再一起算。',tone:'hopeful'};
  const moneyA=before.stats?.money,moneyB=after.stats?.money,bondsA=before.stats?.bonds,bondsB=after.stats?.bonds;
  const supportA=before.lifeCourse?.pressures?.support,supportB=after.lifeCourse?.pressures?.support;
  if(resource(bondsA)&&resource(bondsB)&&bondsB<bondsA)return {speaker,text:'这项安排对我也有影响，我想把自己这边说完。',tone:'tense'};
  if(resource(supportA)&&resource(supportB)&&supportB>supportA&&before.phase==='life')return {speaker,text:'需要我帮哪一小段，先说清楚，我看看能接多少。',tone:'warm'};
  if(resource(moneyA)&&resource(moneyB)&&moneyA!==moneyB)return {speaker,text:moneyB===0?'新的开支先停一下，把还能做的部分重新算清。'
    :moneyB<moneyA?(before.step<2?'剩下的先收好，下次要用时再一起算。':'后面的安排先按剩下的余量来，别把还没到手的也算进去。')
      :'现在多了一些余量，也先给已经答应的事留一份。',tone:moneyB>moneyA?'hopeful':'tense'};
  if(resource(bondsA)&&resource(bondsB)&&bondsB>bondsA)return {speaker,text:'这次的安排我听明白了，有变化就早点说。',tone:'warm'};
  const energyA=before.stats?.energy,energyB=after.stats?.energy;
  if(resource(energyA)&&resource(energyB)&&energyB<energyA)return {speaker,text:'这一轮已经做完了，下一件先看看你还接不接得住。',tone:'tense'};
  return {speaker,text:before.phase==='life'?'先按这次说好的安排来，后面有变化我们再谈。':'这一段有了结果，下一步能承担多少还要重新确认。',tone:'warm'};
}

export function enrichLifeFeedback(before,after,option,scene,impact) {
  if(before?.choicePlanEdition!==LIFE_FEEDBACK_EDITION||!after)return impact;
  const base=impact&&typeof impact==='object'?impact:{};
  const relation=relationshipChange(before,after);
  const candidates=[moneyChange(before,after),relation||relationshipNumbers(before,after),careerChange(before,after,before.phase),energyChange(before,after),plainResult(before,after,option)]
    .filter(Boolean).sort((a,b)=>b.priority-a.priority);
  const known=Array.isArray(base.checkpoints)?base.checkpoints.filter(item=>item&&['money','relationship','career','energy'].includes(item.kind)&&typeof item.text==='string'):[];
  const checkpoints=unique([...known,...candidates].map(({priority,...item})=>copy(item)),item=>JSON.stringify([item.kind,item.label,item.before,item.after,item.text]))
    .filter((item,index,list)=>list.findIndex(other=>other.kind===item.kind)===index).slice(0,3);
  const events=Array.isArray(base.events)?unique(base.events,item=>item?.id||JSON.stringify(item)).map(copy):[];
  const existingReactions=Array.isArray(base.reactions)?base.reactions.filter(item=>item&&typeof item.speaker==='string'&&typeof item.text==='string'):[];
  const extra=additionalReaction(before,after,option,scene,existingReactions);
  const reactions=[];
  for(const item of [...existingReactions,...(extra?[extra]:[])]) {
    const current=reactions.find(other=>personKey(other.speaker)===personKey(item.speaker));
    if(current){if(!current.text.includes(item.text))current.text+=' '+item.text;}
    else if(reactions.length<3)reactions.push(copy(item));
  }
  const environment=typeof base.environment==='string'?unique(base.environment.split('\n'),line=>line.trim()).join('\n'):base.environment;
  return {...base,events,reactions,...(environment!==undefined?{environment}:{}),checkpoints};
}
