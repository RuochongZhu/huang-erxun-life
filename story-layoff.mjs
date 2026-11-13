// A fictional job loss in the opt-in plans edition. Reading a scene has no
// effects; the ordinary career commit records its single outcome and flags.
const EDITION = '2026.11.plans';
const EVENT = 'if_2026_layoff';
const FICTION = 'IF 平行人生：本局黄二勋的岗位终止、结算、申诉与重新任职全部为虚构，不是黄仁勋或任何现实人物被裁员的报道。具体补偿和任用只属于本局协商结果，不说明现实中的法律权利或保证。';
const PROFILES = {
  employee: {
    title:'裁员通知到了', actor:'林秋雯', role:'负责离职结算的人事联络人',
    notice:'主管和人事递来正式裁员通知：部门缩编，你的岗位自今天起撤销。原来的工资与职责不能再按仍在职来安排。',
    boundary:'已确认的报酬与本局协商的补偿另行结算，个人储蓄没有因此被没收。',
  },
  researcher: {
    title:'研究岗位被撤销', actor:'项目机构联络人', role:'负责研究岗位与项目收尾的联络人',
    notice:'项目机构发来书面通知：经费与编制调整，你的研究岗位自今天起撤销。这不是一轮尚待决定的评审，原岗位已经结束。',
    boundary:'课题资料、学生支持与设备责任需要另作交接；已有成果的署名与个人资产并未随岗位一起消失。',
  },
  company: {
    title:'经营职务被解除', actor:'董事会联络人', role:'传达经营职务解除决议的人',
    notice:'董事会送达解除经营职务的决议，即日起由另一位负责人接管日常经营。你失去了这份管理岗位，不能再凭旧头衔签字、任命或动用公司预算。',
    boundary:'解除的是经营职务，不是没收所有股权或个人资产。你仍持有的权益按原权属保留，持股不等于继续担任经营负责人。',
  },
  studio: {
    title:'工作室项目的岗位结束了', actor:'合伙联络人', role:'负责项目终止与合伙交接的人',
    notice:'共同签约的合作机构通知项目结束，合伙团队也关闭了这一轮负责人岗位。今天起，你不再领取这份岗位报酬，也不能继续按原项目调配伙伴。',
    boundary:'结束的是团队里的工作岗位。已有工具、作品和权益仍按约定归属保留，工作室的结束不等于个人资产被没收。',
  },
  sold: {
    title:'顾问任期终止了', actor:'合同联络人', role:'负责顾问任期与费用结算的人',
    notice:'合作方书面确认：你目前的顾问任期今天终止，不再续聘。你在这个项目里的工作席位已经结束，不能继续按有一份顾问收入来安排生活。',
    boundary:'这是顾问合同终止，区别于雇员裁员；已经完成工作的费用另行核对，过去出售业务所得和个人资产仍归你所有。',
  },
};
const traits = (...pairs) => pairs.map(([dim,d]) => ({dim,d}));
const flags = (...items) => [...new Set([EVENT, 'counterfactual', ...items.flat()])];
const outcome = (label,text,effects,extraFlags=[],route='sold') => ({label,text,effects,flags:flags(extraFlags),route});
const choice = (year,key,title,description,dimensions,outcomes,details={}) => ({
  id:`layoff-${year}-${key}`,title,description,traits:traits(...dimensions),outcomes,
  ...details,flags:flags(details.flags || []),
});
const preparation = (year,key,title,description,effects,prepTags,dimensions) => ({
  id:`layoff-${year}-prep-${key}`,title,description,effects,prepTags,traits:traits(...dimensions),
  flags:[`if_layoff_${year}_prepared_${key}`],
});

function origin(state) {
  return Object.keys(PROFILES).find(route => state.flags?.[`if_layoff_from_${route}`])
    || (Object.hasOwn(PROFILES,state.route) ? state.route : 'employee');
}

function responseReceipt(state) {
  const f=state.flags || {};
  if(f.if_layoff_terms_revised)return '2026年保存的通知与往来记录，后来换来了一份重新确认的结算书；原岗位并没有因此恢复。';
  if(f.if_layoff_handoff_done)return '2026年离开时，你把未完成事项和结算范围签进交接回执。现在它可以说明你做过什么，不能保证别人一定录用你。';
  if(f.if_layoff_transition_contract)return '2026年那份短期收尾合同已经结束，它没有把你留在原岗位。你带着实际完成的记录，再谈下一份工作。';
  if(f.if_layoff_records_kept)return '2026年的岗位终止通知和沟通记录仍在文件夹里。结算有过分歧，保留材料没有自动换回工作。';
  if(f.if_layoff_rebuild_notes)return '2026年离场后写下的预算和技能清单仍在；那时只是准备，还没有一份新工作凭空出现。';
  return '2026年第四季度的终止通知仍在文件夹里。原岗位已经结束，下一份工作需要重新谈。';
}

function supportedChoices(scene,year) {
  const id=year===2028?'bond-2028-career-small-restart':'bond-2032-career-delivery';
  return (scene.choices || []).filter(option=>option.id===id).map(option=>({...option,
    flags:flags(option.flags || [],year===2028?'if_2028_supported_trial':'if_2032_supported_delivery'),
    outcomes:option.outcomes.map((result,index)=>({...result,
      route:year===2032&&index===2?'sold':'studio',
      flags:flags(result.flags || [],year===2028?'if_2028_supported_trial'
        :index===0?'if_2032_product_working':index===1?'if_2032_product_small':'if_2032_product_stopped'),
    })),
  }));
}

function notice2026(scene,state) {
  const from=origin(state), profile=PROFILES[from];
  const opening=`2026年第四季度，本局这条 IF 平行人生收到了一份已经生效的岗位终止通知。${profile.notice}${profile.boundary}`;
  const shock={energy:-7,stress:12,reputation:-4,control:-10};
  const mark=[`if_layoff_from_${from}`,'future_role_exit'];
  const options=[
    choice(2026,'handoff','接受有限结算，把原岗位交接清楚','核对已经确认的报酬和有上限的结算方案，只签自己能说明的交接事项；离职后的日常开支重新安排。',[[7,1],[14,1]],[
      outcome('原岗位结束，交接回执留下了','你完成交接，收到本局协商的一笔有限结算。它只覆盖一部分过渡开销，不能替代今后的工资。旧工牌交回，下一份岗位仍没有着落。',{money:-2,reputation:2,leadership:3,stress:-2},['if_layoff_handoff_done','future_handoff_done']),
    ],{effects:shock,route:'sold',flags:[...mark,'if_layoff_handoff_done']}),
    choice(2026,'records','保留材料，争取把结算分歧说清','保存自己有权持有的通知、报酬约定和交接回执，向独立专业人士询问处理渠道；不带走他人隐私或业务秘密，也不把申诉写成必胜。',[[3,1],[9,-1]],[
      outcome('结算重新确认，工作没有恢复','复核确认了一部分差额，双方补签结算说明。你争取回一些资源，原岗位仍已撤销；下一份任职需要另行申请。',{money:5,communication:4,stress:2},['if_layoff_terms_revised']),
      outcome('材料收到了，分歧尚未结束','对方收到了材料，只确认其中一部分事项。你把后续联系与日常预算分开，原岗位不会因为仍在沟通就继续发薪。',{communication:3,energy:-2,stress:4},['if_layoff_terms_pending']),
      outcome('这一轮没有改变结算','这一轮没有取得新的结算结果，你保留了回复与材料。岗位终止仍然生效，耗掉的时间和精力也需要重新安排。',{money:-2,energy:-3,stress:6},['if_layoff_terms_unchanged']),
    ],{effects:shock,check:{stat:'communication',base:.58},route:'sold',flags:[...mark,'if_layoff_records_kept']}),
    choice(2026,'transition','另签一份短期收尾合同，给下一步留时间','原岗位已经终止；只接受另行确认、为期数周的收尾工作，写清范围和报酬，不把临时合同叫作复职。',[[5,1],[14,1]],[
      outcome('有了短期报酬，原职务仍然结束','你另签了数周的收尾合同，交付已约定的说明与资料。少量报酬给生活留了缓冲，原岗位和原来的管理权限没有回来；合同结束后仍要找下一步。',{money:3,engineering:3,energy:-3,stress:2},['if_layoff_transition_contract']),
    ],{effects:shock,route:'sold',flags:[...mark,'if_layoff_transition_contract']}),
    choice(2026,'reset','先离场，把下一步缩成一张可承担的清单','结束原岗位的承诺，先列生活开支、可以带走的个人技能与愿意接的工作；不花启动资金，也不提前宣布已经创业成功。',[[13,1],[14,1]],[
      outcome('离场之后，先把这一周过完','你交回属于原团队的材料，带走自己的预算与技能清单。原岗位已经结束，小团队还只是一种可能；这一周你先恢复作息，再决定联系谁。',{energy:5,stress:-4,engineering:2},['if_layoff_rebuild_notes','future_room_to_choose']),
    ],{effects:shock,route:'sold',flags:[...mark,'if_layoff_rebuild_notes']}),
  ].map(option=>({...option,effects:{...option.effects},outcomes:option.outcomes.map(result=>({...result,
    flags:flags(mark,result.flags),feedback:{environment:'通知、交接记录和自己的下一页日历分别收好。原岗位的工作入口已经关闭。',
      reactions:[{speaker:profile.actor,text:'原来的岗位已经结束。后续结算或新的合作，我们按各自确认的范围另谈。',tone:'tense'}]},
  }))}));
  return {...scene,title:`2026年第四季度：${profile.title}`,date:'2026 年第四季度 · IF 岗位终止通知',
    story:opening+'\n通知后面夹着一份结算草案，写明了补偿上限和负责答复的人。你还有几项工作没交完，草案上也有几笔报酬等着核对。走之前，得知道哪些事要当面交清，哪些还要等回复。',
    prepTitle:'接到通知后，先核对什么',prepStory:opening+'\n通知和旧的报酬约定都在手边，结算草案还有几笔没有确认。许晨在等你交接未完成的工作。下一笔房租有自己的付款日，原来的工资已经不能排进账里。',
    people:[{name:profile.actor,role:profile.role,kind:'虚构角色'},{name:'许晨',role:'愿意核对交接的工作同行',kind:'虚构角色'}],
    prep:[
      preparation(2026,'records','整理通知与有权保留的记录','核对书面通知、已完成工作的报酬与联系记录；不复制无权带走的资料。',{communication:4,energy:-2},['evidence'],[[7,1],[9,-1]]),
      preparation(2026,'handoff','逐项核对交接对象和结束日期','列出工作已经到哪里、接手人是谁，以及哪些事项不再由你签字。',{leadership:4,energy:-2},['plan'],[[7,1],[14,1]]),
      preparation(2026,'budget','先写出三个月必须付的开支','把现有余款和仍未确认的钱分开，不用未来可能的补偿提前作承诺。',{stress:-3,control:2},['plan'],[[9,-1],[14,1]]),
    ],choices:options,alternate:true,
    mission:{deadline:'岗位终止通知已经生效',objective:'处理这次已经发生的岗位终止，并为离场后的日常安排一条可执行的路。',deliverable:'一份交接或沟通回执，以及不依赖原岗位继续存在的过渡安排。'},
    fact:{text:FICTION,sourceIds:[]},echo:profile.boundary};
}

function rebuilding2028(scene,state) {
  const receipt=responseReceipt(state), documented=!!state.flags?.if_layoff_handoff_done;
  const story=`原岗位没有自动恢复。旧同事转来一份招聘启事。${receipt}\n新团队想找人复核计算任务的运行记录，查清换设备以后为什么会变慢。另一封邮件是客户发的，问能不能用他们的一批任务做个小工具，把完成时间和用电记下来。学校的短期合作也在收申请，想看看你能不能把一次故障复测讲给学生听。\n招聘方等着看样例，客户还没确认试做费。你能用的是自己的设备和有权使用的资料。`;
  return {...scene,title:'2028年：失去岗位之后，下一份工作从哪里来',date:'2028 年 · IF 重建人生',story,
    prepTitle:'把过渡安排变成可核对的申请',prepStory:`${receipt}\n招聘方要看一份你能独立重做的样例，关心出错的输入、机器设置和重跑结果。客户只在试用时给一批计算任务，报价还得算上借设备和返工的费用。学校问的则是你能到校几次、哪一堂能让学生自己复测。房租和日常开支照付，新的报酬还没人签字确认。`,
    prep:[
      preparation(2028,'skills','重做一个能独立完成的技术样例','只使用自己有权使用的资料，记录做得到和仍需别人协助的部分。',{engineering:5,energy:-3},['evidence'],[[7,1],[9,-1]]),
      preparation(2028,'budget','重算个人生活费与试做上限','区分现有余款、尚未确认的结算与未来可能收入；把不能投入的日常费用单独留出。',{stress:-4,control:2},['plan'],[[9,-1],[14,1]]),
      preparation(2028,'listen','问清招聘者、客户与学校的实际条件','分别核对任期、工作内容和付费范围，不让一封邀请替你许下全部承诺。',{communication:5,bonds:2,energy:-2},['listen'],[[5,1],[14,1]]),
    ],
    choices:[
      choice(2028,'apply','申请一份有明确范围的技术岗位','重新投递、面谈并核对职责与待遇；不要求对方把过去的经营头衔原样交回来。',[[7,1],[9,-1]],[
        outcome('新任职写进文件','你通过面谈，签下一份范围明确的技术负责人任职书。收入恢复了一部分，你负责的是新团队约定的工作，不是回到2026年前的原岗位。',{money:8,engineering:4,stress:-3},['if_2028_employed'],'employee'),
        outcome('先有一段短约','对方只签一段有终点的试用或项目任期。你有了实际工作和有限报酬，后续续聘仍要另谈，不能把短约说成已经安稳落定。',{money:3,engineering:3,stress:3},['if_2028_trial_role'],'employee'),
        outcome('这一轮没有拿到岗位','面谈没有换来录用通知。你保留反馈，继续按过渡预算生活；提出申请没有让原岗位或新岗位自动出现。',{energy:-3,stress:5,reputation:-1},['if_2028_searching']),
      ],{effects:{energy:documented?-3:-5},check:{stat:'communication',base:documented?.66:.57},flags:['if_2028_job_application']}),
      choice(2028,'small-work','用一份小单试着独立谋生','只拿自己有权使用的技能和资料报价，先做小范围交付；投入有上限，不把旧公司的设备、预算或名义算进新项目。',[[1,1],[9,-1]],[
        outcome('第一份小合同生效','客户确认范围并签下小合同，你开始独立交付。工作室从真实工作起步，规模很小，2026年的原职务仍然没有恢复。',{money:7,engineering:5,communication:3},['if_2028_independent_work','future_restart_plan'],'studio'),
        outcome('先做一个付费试单','客户只付费试做一小段，你按这个范围开始独立工作。有人愿意试用，不代表已经有长期订单；扩招和添设备都先缓一缓。',{money:2,engineering:4,stress:2},['if_2028_independent_trial','future_restart_plan'],'studio'),
        outcome('报价没有变成订单','对方没有签约。你停止追加投入，留下可再用的样例；独立谋生仍在准备，不能把这轮失败写成已经有了一家公司或客户。',{money:-2,engineering:3,stress:5},['if_2028_no_order']),
      ],{cost:{money:-4},effects:{energy:-4},check:{stat:'engineering',base:.59},flags:['if_2028_independent_attempt']}),
      choice(2028,'academic','申请有期限的教学或研究合作','提交可以核验的工作样例，商量课程、经费与结束日期；旧头衔不等于自动获得教职。',[[8,-1],[15,1]],[
        outcome('学校确认了一段合作','学校签下一段有经费、有结束日期的研究与教学合作。你有了新的工作内容，也要按新的要求准备材料与接受评审。',{money:4,engineering:6,ecosystem:3},['if_2028_academic_contract','future_academic_path'],'researcher'),
        outcome('先从几次课开始','对方只确认几次有报酬的课程，没有长期岗位。你按课次准备和结算，这是真实的新合作，也是一份边界很窄的安排。',{money:1,engineering:4,bonds:3},['if_2028_teaching_trial','future_academic_path'],'researcher'),
        outcome('这次申请没有获批','申请没有获批，经费和任职都没有落定。你把材料收好，仍按没有新岗位的处境安排下一步。',{engineering:2,stress:4},['if_2028_academic_declined']),
      ],{cost:{money:-2},effects:{energy:-3},check:{stat:'engineering',base:.61},flags:['if_2028_academic_application']}),
      choice(2028,'pause','先缩减开支，保留有限求职与休息','暂不投入创业或新增付费项目，结束已经到期的承诺；留出固定联系时间，也接受收入暂时减少。',[[13,1],[14,1]],[
        outcome('没有新岗位，也把日子安排下来了','你没有假装已经重新就业。必需开支被单独留下，每周只安排有限的联络与练习；空出的时间可以恢复精力，不能自动变成未来的收入。',{energy:8,stress:-6,reputation:-2},['if_2028_pause','future_personal_year','future_room_to_choose']),
      ]),
      ...supportedChoices(scene,2028),
    ],alternate:true,fact:{text:FICTION+' 2028年的招聘、订单与学术合作同样是虚构未来，成败按本局结果发生。',sourceIds:[]},
    mission:{deadline:'提交下一轮申请或报价之前',objective:'从已经失去原岗位的处境出发，选择真实可以尝试的下一份工作或生活安排。',deliverable:'一份范围明确的申请、报价或缩减承诺的计划；是否获得任用由结果决定。'},echo:receipt};
}

function rebuilding2032(scene,state) {
  const f=state.flags || {}, independent=!!(f.if_2028_independent_work||f.if_2028_independent_trial);
  const ifDecision=(state.evidence || []).find(item=>item.step===13&&item.phase==='choice'
    && /^if-2028-career-/.test(item.optionId));
  const followsIf=!!ifDecision||Object.keys(f).some(flag=>flag.startsWith('if_route_')&&f[flag]);
  const ifJournal=followsIf?(state.journal || []).find(item=>item.step===13&&Number(item.year)===2028):null;
  const ifReceipt=ifJournal?.resultText
    ?`2028年，你选择了“${ifJournal.choiceTitle}”。当年实际发生的是：${ifJournal.resultText} 今天的新安排要从这份结果出发，原岗位不会因此恢复。`
    :followsIf?'2028年，你选择了另一条 IF 人生路线。下一步从已经确认的结果与现有条件出发，原岗位并没有因此恢复。':null;
  const receipt=ifReceipt || (f.if_2028_employed?'2028年，你签过新的技术任职书；那份工作没有恢复被解除的原职务。'
    :f.if_2028_trial_role?'2028年只有一段短约落定。它没有自动续到今天，新任期仍需要这一次重新确认。'
      :independent?'2028年实际接到的小单留下了交付记录，这次可以据此报价；下一份订单仍未签下。'
        :f.if_2028_supported_trial?'2028年，亲近的人按约分担了一段时间，你因此开始试做和报价。那份帮助没有承诺替你出钱，也没有替客户保证下单。'
        :f.if_2028_academic_contract||f.if_2028_teaching_trial?'2028年的教学或研究合作有过明确的结束日，这一轮经费与工作范围需要重谈。'
          :f.if_2028_pause?'2028年，你选择先缩减承诺，没有接受一份新岗位。今天也不必为了证明已经走出来就接下全部邀请。'
            :'2028年的申请或报价没有换来正式任用。原岗位仍未恢复，今天的机会需要从可以确认的条件重新开始。');
  const ordinary = independent
    ? '上次试单的客户愿意再拿一批计算任务给你测试。对方想看小工具能不能装到自己的机器上，把优化前后的用电、完成时间和中断日志放在同一份报告里。下一单还没签，试用费也要等对方跑完才谈得定。'
    : f.if_2028_supported_trial
      ? '上次家里分担照护，你才空出时间把小工具做成样例。客户现在来问，能不能用他们的任务再跑一遍，把耗电、用时和中断日志留下来。下一笔设备费还得你自己出，谁来付试用费也没谈定。'
      : f.if_2028_academic_contract||f.if_2028_teaching_trial
        ? '学校来问你能不能再带一段计算系统验证课。学生会用同一批任务在两套设置下比较用时和耗电，再照安装说明复测一次。上次的任期已结束，机时、授课报酬和最后一次答疑的日期还要重新确认。'
        : f.if_2028_employed||f.if_2028_trial_role
          ? '技术组想请你复核一轮任务调度测试。同一批任务换了运行环境以后用时变长，还有几次在中途停了。对方会开放测试机和日志，这一轮按什么交付、谁负责收下修订记录、报酬怎么算，还没写进新的工作约定。'
          : f.if_2028_pause
            ? '这两年你只留了几处固定的联络时间。旧同事来问，能不能按次帮忙看调度日志，查出同一批任务换设备以后为什么变慢。对方能给你看测试记录，还没说一次能付多少、预计要来几趟。'
            : '现在有个技术组来问，你能不能用同一批任务复核一份调度测试，查出用时变长和中断的位置。他们能开放测试机和日志，正在等你的工作样例。任期、报酬和交给谁验收都还没有落笔。';
  const special = {
    nightlife:'屋顶场地的报价寄来了，出租方想知道要留几场。押金和演出费用先得付，场地许可还没有跟档期对上。票能卖多少，得等真正开场才知道。',
    research:'外部团队愿意按公开的测试条件复跑低功耗原型。你这边要交测试负载、能效记录和工具链说明，制造伙伴则按验证线的时段报价。热稳定性和成本过不过关，会决定还订不订小批样片。',
    rival:'竞争团队问你能否拿公开原型说明下一段架构工作。对方只接受公开标准和团队有权使用的技术。编制和采购要分别审批，下一轮职责和报酬仍要谈。',
    president:f.if_president_application_denied
      ?'新曙光共和国的联络人来信，问还没交完的维护资料怎么留给服务站。上次居留申请没有获准。要再谈参选，国籍、居住年限、财务申报和回避事项仍要另行审查。'
      :'新曙光共和国的服务站要确认下一轮培训和设备维护的人手。参选另有一套审查，要核对国籍、居住年限、财务申报和回避事项。服务站的费用另有账目，参选资格还没批。',
    solar:f.if_solar_unsigned
      ?'上回没签成的海上算力提案还在。你重新算了一座验证平台的费用。想请对方再谈，得拿出储能时长、设备耐盐雾的测试办法，以及出海维修的报价。眼下还没有新的出资承诺。'
      :'海上算力项目要核算一座验证平台的成本。合作方要看储能能撑多久、设备能不能扛住盐雾，以及坏了以后出海维修要花多少。许可和海况会决定哪天能试，下一段出资还要等试验记录。',
  }[ifDecision?.optionId.split('-')[3] || ['nightlife','research','rival','president','solar'].find(path=>f[`if_route_${path}`])];
  const boundary='你不能再替已经离开的公司任命负责人或支配旧预算。';
  const story=`你从文件夹里翻出2026年岗位终止的通知。${receipt}\n${special || ordinary}\n${boundary}`;
  const prepStory=`${receipt}\n${special || ordinary}\n${special?'新一轮要用的钱和能到场的日子，还得你自己确认。原公司的设备、人员和预算仍由他们自己安排。':'这几个月的家用和照护开支还得照付。账上剩下多少能拿来试做，得扣掉这些再算。未签的合同还不能算收入。'}`;
  return {...scene,title:'2032年：让重新开始有一份真正的结果',date:'2032 年 · IF 重建的后续',story,
    prepTitle:'再核对一次范围与余量',prepStory,
    prep:[
      preparation(2032,'evidence','把已有的任职或试做记录摆出来','只列实际做过和已经收到的反馈，未获批的申请不算成任职。',{engineering:4,communication:2,energy:-3},['evidence'],[[7,1],[9,-1]]),
      preparation(2032,'scope','算清这次停止投入的界限','把生活必须保留的支出和项目可以用的余款分开，写明何时缩小或停止。',{control:3,stress:-3},['plan'],[[9,-1],[14,1]]),
      preparation(2032,'people','先听愿意合作的人能承担什么','确认谁愿意参与、能来几次，以及哪些安排必须由自己完成。',{bonds:4,communication:3,energy:-2},['listen'],[[5,1],[14,1]]),
    ],
    choices:[
      choice(2032,'technical-work','把一份技术工作谈到能正式开始','用可以验证的成果说明能承担什么，明确任务、报酬和职责期限；不接受一个只有旧头衔、没有实际范围的位置。',[[7,1],[14,1]],[
        outcome('新的工作按约启动','双方签下这轮技术任务，工作和报酬有了实际起点。你按新的授权负责一部分项目，没有回去接管旧公司的日常经营。',{money:8,engineering:6,reputation:3},['if_2032_new_work','future_platform_working'],'employee'),
        outcome('先开始较小的一段','对方只确认了缩小范围的任务。你接受有限收入和有终点的任期，剩下的工作没有被预先写成自己的职位。',{money:3,engineering:4,stress:2},['if_2032_limited_work','future_platform_small'],'employee'),
        outcome('这轮任务没有启动','预算没有落实，双方没有开始新的任职。你停止为尚不存在的岗位追加投入，下一份工作仍需另谈。',{stress:5,engineering:2},['if_2032_no_work','future_platform_stopped']),
      ],{effects:{energy:-4},check:{stat:'engineering',base:.63}}),
      choice(2032,'product','把小产品交给真正愿意付钱的人',independent?'沿用2028年试单得到的反馈，只投入能承担的下一段，不拿私人照护预算填业务缺口。':'从一个可承担的小产品重新验证需求；过去的经历不能代替客户付费。',[[1,1],[9,-1]],[
        outcome('交付后，有人续了第二单','客户验收后确认下一单，独立工作开始靠实际交付维持。团队仍然很小，重建的依据是订单，不是重新叫回过去的头衔。',{money:11,engineering:6,reputation:6},['if_2032_product_working','future_rebuilt_product'],'studio'),
        outcome('有人付费，规模仍然很小','产品有了付费使用者，收入只够维持很小的范围。你没有立即扩招；这次重新开始有了实物，也仍然有限。',{money:4,engineering:5,stress:3},['if_2032_product_small','future_rebuild_small'],'studio'),
        outcome('产品没有找到足够需求','试用没有带来续单，你按预先写下的上限停止投入。完成了技术尝试，不等于已经重新建立起稳定事业。',{money:-3,engineering:3,stress:6},['if_2032_product_stopped','future_rebuild_stopped']),
      ],{cost:{money:independent?-4:-6},effects:{energy:-5},check:{stat:'engineering',base:independent?.68:.49},flags:['future_restart_attempt']}),
      choice(2032,'teaching','接受一段有结束日的教学合作','只接受学校已明确提出的有限课程，确认备课、报酬和结束日期；不把一次邀请写成终身教职。',[[8,-1],[14,1]],[
        outcome('课程有了日期，也有最后一次','你接受了这段课程，按约备课与授课。它带来有限报酬和新的交流，也保留了结束时交回组织职责的边界。',{money:2,engineering:4,bonds:3,energy:-2},['if_2032_teaching','future_academic_path'],'researcher'),
      ]),
      choice(2032,'smaller-week','把求职和合作缩到每周两天','只留能够承担的联系与必要收尾，不为证明自己仍在高位继续扩大承诺。',[[13,1],[14,1]],[
        outcome('没有被旧岗位填回去的日历','你没有重新取得原职务，也没有为尚未落实的新工作预留所有时间。每周两天处理联系与收尾，其余日子按自己的生活需要安排。',{energy:9,stress:-7,reputation:-2},['if_2032_smaller_week','future_smaller_week','future_room_to_choose']),
      ]),
      ...supportedChoices(scene,2032),
    ],alternate:true,fact:{text:FICTION+' 2032年的任务、客户与课程为虚构未来，不预言任何现实机构的招聘或任命。',sourceIds:[]},
    mission:{deadline:'新任务正式签署以前',objective:'按已经发生的求职和试单结果，选择有范围的新工作或缩减承诺。',deliverable:'实际开始的任务、经验证的产品，或一份能履行的较小日程。'},echo:receipt};
}

function withoutCurrentRole2036(scene) {
  const replaceOutcomes=(option,entries)=>({...option,outcomes:option.outcomes.map((result,index)=>
    entries[index]?{...result,...entries[index]}:result)});
  const choices=(scene.choices || []).map(option=>{
    if(option.flags?.includes('future_keep_building'))return replaceOutcomes({...option,
      title:'继续工作，先申请一段有边界的新合作',
      description:'眼下没有一份可以直接续任的原岗位。从一个能独立完成的任务谈起，投入有限预算；只有新的合作实际确认，工作才会开始。',
    },[
      {label:'新的小合作开始了',text:'对方确认了一段范围有限的新合作，你按约开始工作。它有自己的结束日期，也不是回去接管2026年以前的岗位；这次留下的是一份新的任务。'},
      {label:'只确认了一小段任务',text:'对方只确认了缩小范围的一段工作，报酬和责任也相应减少。你接受这个实际起点，没有把一次短期合作说成已经重新坐稳旧位置。'},
      {label:'这一轮没有获得新合同',text:'这次接洽没有换来新合同，你没有宣布一个不存在的任职。你保留自己的技术练习和有限联系，原岗位仍已结束，新的工作留作未完成的愿望。'},
    ]);
    if(option.flags?.includes('future_retire'))return replaceOutcomes({...option,
      description:'结束常规求职与新增长期工作的计划，回复还未说清的邀约。原岗位已在2026年结束，这次决定的是不再围着找下一份工作安排日子。',
    },[{text:'你结束了常规求职和新增长期工作的计划，把仍要回复的事项逐一说清。原岗位不需要再交接一遍；以后主要按自己的生活需要安排时间，与亲近的人吃饭或散步，也重新约具体的日子。'}]);
    if(option.flags?.includes('future_hobby'))return replaceOutcomes(option,[{
      text:'你按时参加第一次练习，发现熟练需要重新积累。旧岗位没有重开，你只保留必要的联络，其余下午可以做饭、打球、写画或学别的事；没有人要求这一项爱好最后必须成功。',
    }]);
    return option;
  });
  const prep=(scene.prep || []).map(option=>option.flags?.includes('future_final_listening')?{...option,
    title:'问亲近的人希望保留怎样的来往',
    description:'没有一位待你任命的接班人。先听朋友、家人和愿意保持联系的同行怎样安排自己的生活，再决定自己能承担哪些约定。',
  }:option.flags?.includes('future_final_accounts')?{...option,
    title:'核对余款与已经结束的事项',
    description:'停掉不再需要的订阅和差旅预留，核对现有余款与待回复事项；原工资和未确认的新合同都不计入已有收入。',
  }:option);
  return {...scene,choices,prep,
    story:'2026 年第四季度失去的原岗位没有回来，眼下也没有一份可以当作仍在任的长期职务。旧头衔和还持有的权益，都不能用来签原公司的设备或人事申请。\n桌上有两封还没签成的合作来信、公开课程的介绍，还有编辑寄来的传记提纲。编辑问能不能先见一次，朋友也来问，下周还有没有空一起吃饭。',
    prepStory:'原岗位在 2026 年就结束了。你翻出自己的账本和没回完的邮件，下一笔日常开支已经有了日期，新合作还没有签字。朋友留了两天给你挑，这回用不着先等一场公司的交接会。',
    echo:'离开原岗位已经发生过，不会因为走到结局就又获得一次交出旧公司权限的机会。',
  };
}

export function enrichLayoffScene(scene,state,domain='career') {
  if(!scene||state?.choicePlanEdition!==EDITION||domain!=='career')return scene;
  const year=Number.parseInt(scene.year,10);
  if(state.step===12&&year===2026)return notice2026(scene,state);
  if(!state.flags?.[EVENT])return scene;
  if(state.step===13&&year===2028)return rebuilding2028(scene,state);
  if(state.step===14&&year===2032)return rebuilding2032(scene,state);
  if(state.step===15&&year===2036&&state.route==='sold')return withoutCurrentRole2036(scene);
  return scene;
}
