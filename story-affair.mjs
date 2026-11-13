// This optional IF branch concerns fictional adults only. It never attributes
// an affair to a real person, and never infers one from a relationship score.
export const AFFAIR_EDITION = '2026.11.plans';
export const AFFAIR_CHARACTER = Object.freeze({name:'岑知遥',birthYear:1983,kind:'虚构角色',occupation:'独立纪录片制片人'});
const YEARS = new Set([2026,2028,2032,2036]);
const paired = life => ['dating','married'].includes(life?.relationship) && ['maya','lori'].includes(life?.partner);
const maya = life => paired(life) && life.partner === 'maya';
const childNote = (life,year) => life.children === 'parent'
  ? `${Number(life.childStartYear)>0&&year-Number(life.childStartYear)>=18?'成年孩子':'孩子'}的联系与照应照旧，他们不需要替任何一方传话或选边。` : '';
const feedback = (speaker,text,environment,tone='tense') => ({reactions:[{speaker,text,tone}],environment});
const impact = (values,pressures,hint) => ({values,pressures,hint});
const receipt = state => (state.lifeJournal||[]).findLast(entry => /^affair-\d+-life-/.test(entry.optionId||''));
const origin = state => (state.lifeJournal||[]).find(entry => /-life-secret-dates$/.test(entry.optionId||''));
const titleOf = entry => entry?.choiceTitle || entry?.title || '';
const remember = entry => entry ? `${entry.year}年那次“${titleOf(entry)}”` : '之前亲口答应的安排';
const history = state => Boolean(origin(state) && state.life?.affairPartner === 'maya');

function sameRelationship(state) {
  if(!maya(state.life)||!history(state))return false;
  const start=origin(state);
  return !(state.lifeJournal||[]).some(entry => entry.step>start.step &&
    (entry.set?.relationship==='separated'||(Object.hasOwn(entry.set||{},'partner')&&entry.set.partner!=='maya')));
}

function workBoundary(state) {
  for(const year of [2032,2028,2026]) {
    if(state.flags?.[`affair_${year}_conflict_disclosed`])return 'disclosed';
    if(state.flags?.[`affair_${year}_conflict_hidden`])return 'hidden';
  }
  return 'none';
}

function separate(life) {
  return {formerPartner:life.partner,partner:'none',relationship:'separated',partnerCareer:'undecided',
    marriageOutcome:life.relationship==='married'?'divorced':'separated',livingArrangement:'independent',
    relationshipRepair:'separated',romancePromise:'none',workBoundary:'protected',
    ...(life.children==='parent'?{coParenting:'adult_contact',familyPractice:'scheduled'}:{})};
}

function personal(year,key,title,description,tradeoff,text,effects,set,response,values={},pressures={}) {
  return {id:`affair-${year}-life-${key}`,title,description,tradeoff,consequence:text,text,label:title,
    effects,set,traits:[{dim:9,d:key==='secret-dates'||key==='keep-lying'||key==='sell-story'?1:-1}],
    lifeImpact:impact(values,pressures,tradeoff),feedback:response};
}

function startingChoices(state,year) {
  const layoff=Boolean(state.flags?.if_2026_layoff),age=year-AFFAIR_CHARACTER.birthYear;
  const pressure=layoff?'2026年第四季度那次裁员后，你很想听到一句“你还是被需要的”。'
    :state.stats?.money<=25?'资金余量已经不多，你却越来越不愿把自己的窘迫说给麦雅听。'
      :state.stats?.stress>=65?'最近的压力一层层叠上来，你开始把陌生人的欣赏当成可以躲进去的地方。'
        :'工作和生活的下一步都还没有定下，你很贪恋有人只听你说、不追问日程的轻松。';
  const story=`${pressure}${age}岁的岑知遥经营自己的纪录片团队，与你没有雇佣或上下级关系。一次公开活动散场后，她把聊天从项目转到了你本人。\n手机里，麦雅还在问今晚怎样安排。岑知遥也问：“你现在到底有没有伴侣？我不想听‘说来复杂’。”两个人等的是同一个事实，你却想给两个不同的答案。`;
  return {story,title:'两条消息，都在等你说实话',options:[
    personal(year,'secret-dates','把暧昧变成秘密约会，对两个人各瞒一半',
      '仍和麦雅保持关系，却把几次约会说成普通活动；又让岑知遥以为原来的关系已经快结束。两人都没有同意这样的安排。',
      '短暂的被欣赏感会减轻压力；持续隐瞒增加信任债，后面不能靠工作成功抹掉。',
      '散场后，你留下来和岑知遥约会，并有了超出朋友的亲密。回给麦雅的消息却只有“還在談項目”。岑知遥听到的是“我們已經在結束了”；两边都拿到了经过你删改的事实。那一晚很轻松，之后每次回复却都要记住上一句说过什么。',
      {energy:3,stress:-5,bonds:-7},{affairPartner:'maya',affairStartedYear:year,affairStartedStep:state.step,affairStage:'hidden',affairTruth:'hidden',affairPact:'none',affairContact:'secret',relationshipRepair:'unrepaired'},
      feedback('岑知遥','如果还没有结束，就直接告诉我。我不接受自己一直被放在暗处。','两段聊天停在屏幕上，你没有把同样的答案发给两个人。','tense'),
      {freedom:5,belonging:-8},{trustDebt:18,burden:7}),
    personal(year,'name-the-boundary','说清仍有伴侣，停止这段暧昧',
      '告诉岑知遥自己的真实关系状态，取消私人约会；再把这次动摇说给麦雅听，不拿压力要求她安慰。',
      '要放弃眼前的关注，也要听麦雅表达不满；坦白动摇不会自动带来亲近。',
      '你没有赴那次私人约会。岑知遥回了一句“谢谢你说清楚”，把联系退回到公开活动。麦雅没有立刻夸你做得好，她先问：“你为什么宁愿和别人讲，也不愿把现在的难处告诉我？”这句话需要你认真回答。',
      {energy:-3,stress:3,bonds:2},{affairStage:'boundary_kept',affairTruth:'no_affair',affairContact:'public_only',publicBoundary:'private',relationshipRepair:'heard'},
      feedback('麦雅','我听见你说停下了。可我们之间没说清的事，今天也别再跳过去。','原本准备赴约的外套留在椅背上，你把手机放回了口袋。','tense'),
      {belonging:3},{trustDebt:-2,burden:2}),
  ]};
}

function confessionChoices(state,year) {
  const life=state.life,first=origin(state),when=first?.year||life.affairStartedYear;
  return [
    personal(year,'tell-the-truth','在两人对质前，把秘密约会完整说清',
      `从${when}年的约会讲起，承认自己对两个人都隐瞒了事实；停止私人来往，接受麦雅提出先分开住。`,
      '关系会先受损，见面与共同开支要重新安排；麦雅只答应谈下去，没有答应原谅或重新同住。',
      '你把“只是朋友”那套说法收了回去，也没有把失意当成免责理由。岑知遥得知你一直没有结束原来的关系，明确停止私人来往。麦雅只答应一个月后再谈一次：“现在先分开住。别替我把这叫和好。”'+childNote(life,year),
      {energy:-6,stress:9,bonds:-11},{affairStage:'repairing',affairTruth:'told',affairContact:'closed',affairPact:'promised',livingArrangement:'apart',relationshipRepair:'trying',marriageOutcome:'considering',workBoundary:'protected',publicBoundary:'private'},
      feedback('麦雅','我答应的是下一次谈话。之后要不要继续，由我到时候决定。','两个人各自收起日程，新的见面日期没有被写成搬回来的日期。','tense'),
      {belonging:-6,freedom:-3},{trustDebt:6,burden:7}),
    personal(year,'keep-lying','坚持说只是工作，赌她们不会核对时间',
      '继续让麦雅以为没有越界，又让岑知遥以为原来的关系已结束；试图靠拖延保住两边的关注。',
      '眼前可以少一次坦白，但说法很快撞在一起；被发现后，麦雅要求分居，岑知遥退出私人关系。',
      '你说：“只是工作，你想太多了。”岑知遥却已经要求把关系状态说清。两人对上了你给出的不同时间线，秘密约会被确认。麦雅把下一次共同出行取消：“我现在不想跟你住在一起。”岑知遥也停止私人来往；你失去的不是一场解释的机会，而是让别人相信下一句话的余地。'+childNote(life,year),
      {energy:-5,stress:15,bonds:-19,reputation:-5},{affairStage:'discovered',affairTruth:'found',affairContact:'closed',affairPact:'broken',livingArrangement:'apart',relationshipRepair:'space',marriageOutcome:'considering',publicBoundary:'private'},
      feedback('麦雅','你刚刚还在说是我想多了。今天别再替我决定该相信什么。','共同出行从日历上被划掉，剩下的住处和开支需要分别安排。','angry'),
      {belonging:-15,health:-5},{trustDebt:25,support:-10,burden:10}),
  ];
}

function repairingChoices(state,year) {
  const life=state.life,old=receipt(state),secretWork=workBoundary(state)==='hidden';
  return [
    personal(year,'keep-the-pact',secretWork?'先公开合作关联，再重新兑现关系约定':'兑现探望与开支约定，不催对方恢复信任',
      secretWork?'承认合作里还有没公开的旧关系，停止替相关团队推动决定；把私人沟通和工作审批分开处理。'
        :`拿出${remember(old)}之后实际做过的安排，按原定时间见面；没有做到的地方直接承认，不用礼物换一句过去了。`,
      secretWork?'可以开始补救，但合作审批仍需要在事业决定中正式回避；仅有生活里的表态不算完成。'
        :'要持续让出时间，也接受对方仍保留自己的住处和拒绝；一次兑现不会抹平全部信任债。',
      secretWork?'麦雅问起那份合作，你没有再叫她别管工作。你承认还没有把关联写进正式评审，答应这次让别人决定。她说：“那就先把该做的做完。我们之间，先别往下一步跳。”'
        :'约好的时间到了，你按时出现，先把该承担的事项办完。麦雅没有交出自己的钥匙，只把下次见面的日期告诉了你：“这一回你做到了。下一回也这样。”各自的住处和生活节奏仍按原来的安排保留。',
      {energy:-5,stress:secretWork?3:-3,bonds:secretWork?1:4},{affairStage:'repair_kept',affairPact:secretWork?'needs_work_disclosure':'kept',relationshipRepair:'trying',workBoundary:'protected',publicBoundary:'private'},
      feedback('麦雅',secretWork?'你不再瞒着我是一回事，合作到底怎样处理，是另一回事。':'我看到这一次真的做到了。信任能走到哪里，我们慢慢看。','旧约定旁边多了一次实际履行的日期，住处一栏没有被擅自改动。','tense'),
      {belonging:4},{trustDebt:secretWork?-2:-6,support:2,burden:3}),
    personal(year,'sell-story','把两段关系写成复出自白，先收出版预付款',
      '接受编辑把秘密约会和伴侣反应作为卖点的提议，没有先得到麦雅与岑知遥对私事公开的同意。',
      '预付款和关注会立刻增加；当事人会反对被当作素材，修复安排也可能因此停下。',
      '预付款到了，封面样稿上的标题比你的稿子更响。你说：“我都認錯了，還要怎樣？”麦雅看到未经同意写进去的私人反应，取消了下一次会面。岑知遥也要求删去涉及她的段落。编辑催第二章，你第一次发现道歉也能被自己用来继续占用别人的生活。',
      {money:14,reputation:8,bonds:-14,stress:12,energy:-4},{affairStage:'privacy_broken',affairTruth:'publicized',affairPact:'broken',memoirBoundary:'without_consent',publicBoundary:'unconsented',relationshipRepair:'unrepaired',lateLifeFocus:'memoir'},
      feedback('麦雅','你收了预付款，就当我已经答应被写进去了吗？','样稿下面压着两份要求删改的回复，新的会面暂时没有日期。','angry'),
      {wealth:10,career:5,belonging:-12},{trustDebt:18,support:-8,burden:8}),
  ];
}

function finalChoices(state,year) {
  const life=state.life,old=receipt(state),current=sameRelationship(state);
  if(!current)return [personal(year,'own-the-past','把自己做过的事写清，不要求旧人给你结局',
    `${remember(old)}仍是你自己的经历；写给自己看的部分不公开他人的私事，已经承担的事项继续完成。`,
    '不会因此恢复旧关系，也不会自动得到回信；整理和承担本身仍需要时间。',
    '你留下了自己作决定的那一段，把替别人解释心情的句子删掉。没有借这封文字要求见面或复合。现在的关系与住处照旧，旧事有了由你承担的记录。'+childNote(life,year),
    {energy:-3,stress:-2,bonds:1},{affairStage:'accountable',affairPact:'kept',memoirBoundary:'work_only',publicBoundary:'private'},
    feedback('陈立文','你能说清自己做过什么就好。别把别人回不回复，也算成他们欠你的。','稿纸收进自己的文件夹，收件人一栏留白。','warm'),{legacy:4},{trustDebt:-3})];
  const boundary=workBoundary(state);
  const workable=(life.affairPact==='kept'||life.affairPact==='needs_work_disclosure'&&boundary==='disclosed')
    &&life.affairStage==='repair_kept'&&boundary!=='hidden';
  const first=workable?personal(year,'continue-carefully','双方愿意继续，保留已经证明可行的安排',
    `从${remember(old)}之后真正做到的事谈起，双方明确愿意继续；不把继续关系解释成往事已被取消。`,
    '继续仍要留下时间，各自的住处不会因此自动合并，合作中也不能再隐瞒关联。',
    `麦雅说愿意继续这段关系。${life.livingArrangement==='apart'?'两处住址还在，钥匙也没有默认交换。':'日程里仍给两个人各自的生活留了空白。'}你们把下一次见面排好，没有用一句“终于过去了”替她说完。几年前答应的事，因为后来真的做过，才有了今天这次继续。`,
    {energy:-2,bonds:4,stress:-3},{affairStage:'continuing',affairPact:'kept',relationshipRepair:'agreed',marriageOutcome:'continuing',workBoundary:'protected'},
    feedback('麦雅','我愿意继续，也仍然有不愿意的事。以后这两句话，你都要听见。','新的日程写在旧约定旁边，住址仍按两个人已经同意的方式保留。','warm'),{belonging:5},{trustDebt:-4,support:2})
    :personal(year,'respect-the-distance','接受她继续保持距离，只承担已经答应的事',
      '停止催促和好，不把道歉、工作成果或多年相处变成必须同住的理由；按现有关系处理必要共同事项。',
      '关系不会在这一刻恢复亲近，住处继续分开；已经失去的信任没有快捷补偿。',
      '麦雅说现在仍不愿一起住。你把自己要说的长篇解释收住，确认了下一次只谈必要事项的时间。关系的去留还没有被两人共同改写，距离却已经被认真承认。'+childNote(life,year),
      {energy:-3,stress:2,bonds:1},{affairStage:'bounded',livingArrangement:'apart',relationshipRepair:'space',marriageOutcome:'considering',publicBoundary:'private'},
      feedback('麦雅','先尊重我现在的决定。别把等着我改口，也叫作给我空间。','两个人分别离开，没有临时加上一顿需要谁勉强赴约的晚饭。','tense'),{belonging:1},{trustDebt:-2});
  const ending=personal(year,'end-the-relationship',life.relationship==='married'?'结束婚姻，把共同事项认真收尾':'结束伴侣关系，不再让彼此停在等待里',
    '明确结束当前关系，处理住处、共同开支与已经承担的事项；不拿旧日帮助要求对方留下。',
    '会失去熟悉的陪伴，也要面对自己造成的后果；分开不等于过去被删除。',
    `麦雅没有再听一遍复出计划。你们${life.relationship==='married'?'完成了离婚和共同事项的处理':'确认分手，结清共同事项'}，下一次联系只保留必要范围。${childNote(life,year)}岑知遥也没有因此自动成为新的伴侣；之后怎样生活，需要从真实的单身状态重新开始。`,
    {energy:-4,bonds:-7,stress:5},{...separate(life),affairStage:'ended',affairPact:'closed',affairContact:'closed'},
    feedback('麦雅','以后该承担的照旧，其他部分我们各自决定。','共同日程被分成两份，没有人把空出来的位置写上另一个名字。','tense'),{belonging:-4,freedom:3},{burden:4});
  return [first,ending];
}

function lifeBranch(scene,state,year) {
  const life=state.life;
  if(year===2026&&maya(life)&&!history(state))return startingChoices(state,year);
  if(!history(state)) {
    if(year===2028&&maya(life)&&state.flags?.if_2026_layoff&&life.affairStage!=='boundary_kept')return startingChoices(state,year);
    return null;
  }
  const old=receipt(state),start=origin(state),same=sameRelationship(state);
  if(!same) {
    if(paired(life))return null;
    if(year===2036)return {title:scene.title,story:`${remember(old)}留下的后果没有随着关系结束而消失。你可以回看自己做过的事，但现在身边的人没有义务接过旧关系里的怨怼。`,options:finalChoices(state,year)};
    return {title:scene.title,story:`${remember(old)}已经记在自己的生活记录里。旧关系已经结束，麦雅不会在今天被重新写成当前伴侣；与旧合作相关的责任仍由你自己承担。`,options:[]};
  }
  if(year===2028||[2032,2036].includes(year)&&life.affairTruth==='hidden')return {
    title:'两份说法，终于摆在同一天',
    story:`${remember(start)}之后，你仍没有把同样的事实告诉两个人。${state.flags?.if_2026_layoff?'2026年第四季度的裁员是真实发生过的难处，':'过去的压力仍在，'}但它没有替那些秘密约会作决定。\n${year===2036?`岑知遥整理旧记录时，重新问起${start.year}年的时间：当时你和麦雅到底有没有结束？麦雅看到那段与你原先说法对不上的询问，停下来等你解释。`:'岑知遥发来消息，要求说清你和麦雅到底结束没有。麦雅也看见了那句与你原先说法对不上的询问，停下来等你解释。'}你还来得及自己讲清全部事实，也可以再赌一次她们不会核对。`,
    options:confessionChoices(state,year),
  };
  if(year===2032)return {
    title:'答应过的事，与寄来的合同',
    story:`${remember(old)}留下的日程还在。${life.livingArrangement==='apart'?'麦雅仍有自己的住处，见面要先确认。':'你们仍维持关系，近况却没有回到可以省略说明的时候。'}编辑又寄来一份提案，要把那段秘密约会写成复出的开场。\n麦雅把提案推回去：“先说你答应我的事做了没有。我的反应，不是你可以替我卖掉的一章。”`,
    options:repairingChoices(state,year),
  };
  if(year===2036)return {title:'旧事没有替人作最后决定',story:`${remember(old)}之后，有些安排真的做过，有些仍停在纸上。${workBoundary(state)==='hidden'?'未披露的合作关联还在，工作里的新隐瞒也挡在私人谈话中间。':''}麦雅今天来听的是下一周怎样安排，不是再听一份成功之后就该被原谅的解释。`,options:finalChoices(state,year)};
  return null;
}

function careerChoices(state,year) {
  if(!state.flags?.if_2026_layoff||!history(state)||![2028,2032].includes(year))return null;
  const employee=state.route==='employee',researcher=state.route==='researcher',sold=state.route==='sold';
  const process=employee?'推荐名单':researcher?'研究传播合作评审':sold?'个人委托的选聘':'项目合作评审';
  const old=origin(state),label=`${year}年的合作`,common={traits:[{dim:9,d:1}],
    lifeImpact:impact({}, {trustDebt:12,burden:5},'商业成果不抵销关联隐瞒；即使项目顺利，信任与后续修复仍会受影响。')};
  return {story:`岑知遥的团队通过公开渠道，送来一份关于你个人经历的纪录片提案。${remember(old)}并没有让你取得替她决定工作的权利，她也没有因为旧关系向你保证私下照顾。这次只涉及个人可支配的项目资源，不调用任职组织的预算。${employee?'你能向项目负责人推荐，但没有单独授予合同的权限。':researcher?'合作仍要经过项目团队的评审。':sold?'你请独立的项目负责人判断提案。':'项目负责人还在等你交代这份合作里有没有需要回避的关联。'}私人联系已经变了，${process}仍需要一份完整的说明。`,options:[
    {...common,id:`affair-${year}-career-secret-contract`,title:'隐去旧关系，把她的团队推上合作名单',
      description:`利用自己对项目的了解推动${process}，不披露与岑知遥过去的私人关系。提案可能有价值，隐瞒仍会给评审留下问题。`,
      effects:{energy:-4},flags:[`affair_${year}_conflict_hidden`],check:{stat:'communication',base:.5},outcomes:[
        {label:'项目拿到了关注，关联仍未披露',text:'合作带来一轮收入与关注。评审记录里却没有那段私人关系，外界还在把你的推荐当成完全独立的判断。眼前的成绩没有让那份遗漏自行消失。',effects:{money:22,reputation:12,communication:4},
          lifeImpact:impact({career:13,wealth:12},{leverage:6},'收益已经发生，隐瞒的代价也会留到后续关系和合作决定。'),
          feedback:feedback('合作评审人','结果可以看，关联也要说。你最好别等别人替你补这一栏。','验收单和空白的关联说明同时留在记录里。','tense')},
        {label:'得到试做机会，评审要求补充说明',text:'提案只得到小范围试做。评审问起你为何如此了解对方团队，你仍没有完整说明，新增的一轮沟通占去了原来答应留给生活的时间。',effects:{money:7,reputation:1,stress:7},
          lifeImpact:impact({career:4,wealth:4},{burden:6},'小收益已经入账，未披露关联仍留在后续审查里。'),
          feedback:feedback('合作评审人','先按试做范围来。你和这个团队的关系，我还需要听完整。','试做安排旁边多了一项待说明事项。','tense')},
        {label:'推荐被退回，隐瞒让评审更难相信你',text:'项目没有按推荐通过，评审也发现你遗漏了会影响独立判断的关联。对方要求换人复核，这次没有收获预期收入，你还要自己解释为什么最初没有说清。',effects:{reputation:-12,stress:12,energy:-4},
          lifeImpact:impact({career:-9},{trustDebt:7,burden:8},'没有获得收益，重新复核与信任代价仍然发生。'),
          feedback:feedback('合作评审人','你知道这件事应该先说。现在请别人接手复核。','推荐材料被退回，新的评审负责人已经另行指定。','angry')},
      ]},
    {id:`affair-${year}-career-disclose-conflict`,title:'披露旧关系，退出这次合作的决定',
      description:`把${remember(old)}涉及的私人关联如实告知${process}负责人，由独立人员判断提案；不替对方争取特例，也不因分开而报复性排除。`,
      traits:[{dim:9,d:-1}],effects:{energy:-4,stress:3},flags:[`affair_${year}_conflict_disclosed`],
      lifeImpact:impact({freedom:-3},{trustDebt:-5,burden:3},'放弃左右这份合同的便利；披露完成，是否合作和关系修复仍分别判断。'),
      outcomes:[{label:'关联写清了，决定权交给了别人',text:`${label}换了评审负责人。岑知遥的团队仍可按相同标准参加，你没有参与取舍，也没有拿回避要求她恢复私人联系。项目是否通过还未决定，这一步先完成了。`,effects:{reputation:3},
        feedback:feedback('合作评审人','我们按提案判断。评审结果也不会拿来替你处理私人关系。','关联说明有了记录，投票与评审名单上划去了你的名字。','tense')}],
    },
  ]};
}

function addOptions(original,added) {
  const options=[...original];
  for(const item of added.slice(0,2)) {
    if(options.some(option=>option.id===item.id))continue;
    if(options.length>=12) {
      // A witnessed family promise is a playable route, not spare capacity for
      // a new subplot. Only generic impact additions may yield a full slot.
      const index=options.findLastIndex(option=>/^impact-/.test(option.id||''));
      if(index<0)continue;
      options.splice(index,1);
    }
    options.push(item);
  }
  return options;
}

export function enrichAffairScene(scene,state,domain) {
  const year=Number(scene?.year),field=domain==='life'?'options':'choices';
  if(state?.choicePlanEdition!==AFFAIR_EDITION||!YEARS.has(year)||!['life','career'].includes(domain)
    ||!state.life||state.life.historyKnown===false||!Array.isArray(scene?.[field]))return scene;
  const branch=domain==='life'?lifeBranch(scene,state,year):careerChoices(state,year);
  if(!branch)return scene;
  const options=addOptions(scene[field],branch.options);
  const person={name:AFFAIR_CHARACTER.name,kind:AFFAIR_CHARACTER.kind,
    role:`${year-AFFAIR_CHARACTER.birthYear}岁；${AFFAIR_CHARACTER.occupation}，经营自己的团队`};
  return {...scene,[field]:options,title:domain==='life'&&sameRelationship(state)||domain==='life'&&maya(state.life)&&year===2026?branch.title||scene.title:scene.title,
    story:domain==='life'&&maya(state.life)?branch.story:[scene.story,branch.story].filter(Boolean).join('\n'),
    ...(domain==='life'&&year===2026?{date:'2026 年第四季度 · IF 人生分支'}:{}),
    people:(branch.options.length&&sameRelationship(state)||domain==='life'&&year===2026&&maya(state.life)||domain==='life'&&year===2028&&maya(state.life)&&!history(state))
      ?[...(scene.people||[]).filter(item=>item.name!==person.name),person]:scene.people,
    fact:{text:'本段为 IF 人生剧情。黄二勋、麦雅与岑知遥均为虚构成年角色；岑知遥出生于1983年，独立经营自己的团队。这里的约会、隐瞒、关系后果与合作不对应任何真人婚姻或真实事件。',sourceIds:[]},
  };
}
