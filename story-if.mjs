// These are deliberately fictional futures for Huang Erxun. No branch asserts
// a real person's plans, a real election, or a future company's conduct.
const EDITION = '2026.11.plans';
const KEYS = ['nightlife', 'research', 'rival', 'president', 'solar'];
const KINDS = { nightlife: 'nightlife', research: 'research', rival: 'rival', president: 'president', solar: 'solar-city' };
const YEAR_STEP = { 2028: 13, 2032: 14, 2036: 15 };
const enabled = state => state?.choicePlanEdition === EDITION && state.flags?.if_2026_layoff === true;
const impact = (values = {}, pressures = {}, hint = '') => ({ values, pressures, hint });
const outcome = (label, text, effects, flags = [], values = {}, pressures = {}, route) => ({
  label, text, effects, flags, lifeImpact: impact(values, pressures), ...(route ? { route } : {}),
});
const choice = (year, path, mode, title, description, cost, effects, outcomes, details = {}) => ({
  id: `if-${year}-career-${path}-${mode}`, title, description, axes: [1, -1],
  traits: [{ dim: 0, d: mode === 'shrink' || mode === 'pivot' ? -1 : 1 }, { dim: 6, d: 1 }],
  cost: { money: -cost }, effects, outcomes: outcomes.map((entry, index) => ({ ...entry,
    feedback: {
      environment: index === 2 ? '窗外的霓虹没有暗下来，通话里却安静了一会儿。黎岚把已经发生的支出圈了出来。'
        : index === 1 ? '黎岚把完成与未完成的部分分成两栏，电话另一端传来翻页的声音。'
          : mode === 'pivot' || mode === 'shrink' ? '几项原本排满日历的事情被划掉，新的安排终于留出了空白。'
            : '黎岚等你说完，才把这次真正发生的结果写到预算表旁边。',
      reactions: [{ speaker: '黎岚', tone: index === 2 ? 'tense' : index === 1 ? 'warm' : 'hopeful',
        text: index === 2 ? '先把这一轮收尾。还剩哪些钱、哪些责任，我们一项项说清。'
          : index === 1 ? '这一部分做到了。余下的先别答应，把能继续的范围留出来。'
            : mode === 'pivot' || mode === 'shrink' ? '好，少做的部分也写清楚。之后的时间，你可以重新安排。'
              : '这一次记下来了。你想往前走的话，也把下一段要付出的东西算进去。' }],
    },
  })),
  flags: [year === 2028 ? `if_route_${path}` : `if_${year}_${path}_${mode}`, 'counterfactual'],
  ...details,
});
const risk = (year, path, mode, title, description, cost, effects, stat, base, outcomes, details = {}) =>
  choice(year, path, mode, title, description, cost, effects, outcomes, { check: { stat, base }, ...details });
const fictional = (name, role) => ({ name, role, kind: '虚构角色' });

function pathOf(state) {
  if ((state.flags.if_pivot_academic || state.flags.if_pivot_ordinary) && !(state.step === 14 && state.phase === 'result')) return null;
  // Exactly one 2028 primary decision can be committed. Prefer its recorded ID
  // when present; the flag fallback also supports raw-scene previews.
  const evidence = [...(state.evidence || [])].reverse().find(item => item.phase === 'choice'
    && item.step === 13 && /^if-2028-career-/.test(item.optionId));
  return evidence ? KEYS.find(key => evidence.optionId === `if-2028-career-${key}-start`) || null
    : KEYS.find(key => state.flags[`if_route_${key}`]) || null;
}

function openings(state) {
  return [
    risk(2028, 'nightlife', 'start', '摘掉旧工牌，把夜晚交给霓虹',
      '用自己的预算旅行、听现场、玩游戏。新的朋友不会自动成为伴侣，夜夜热闹也要付住宿费和第二天的体力。',
      8, { energy: -6 }, 'communication', .60, [
        outcome('陌生人记住了你的歌单', '你在几场演出之间认识了一小群朋友，第一次不用旧职位开场。夜里确实快乐，白天也确实需要补觉；这些来往没有替你续上原来的收入。',
          { bonds: 7, stress: -7, energy: -3 }, ['if_nightlife_circle'], { freedom: 10, belonging: 4, health: -4, career: -4 }, { burden: -6, support: 3 }),
        outcome('热闹很多，能常来往的人不多', '订房和门票花得比计划快。你认识了不少面孔，真正留下联系方式的人很少，开始把一晚空白重新写回行程。',
          { money: -5, energy: -6, stress: 2 }, ['if_nightlife_overbooked'], { freedom: 5, health: -7, wealth: -4 }, { burden: 5 }),
        outcome('先到的是账单和疲惫', '连轴转让几次旅行都只剩赶路。你取消后面的预订，承担不能退回的费用；游戏还在，日子却需要重新算一遍。',
          { money: -9, energy: -12, stress: 8 }, ['if_nightlife_paused'], { health: -10, wealth: -7, career: -3 }, { burden: 9, leverage: 7 }),
      ], { route: 'sold', lifeImpact: impact({}, {}, '热闹用资金和体力交换，不保证亲密关系，也不会自动恢复职业收入。') }),
    risk(2028, 'research', 'start', '自研光电协同推理，挑英伟达一个细分场景',
      '另起小团队，研究一种假想的新架构，只用公开资料与自己拥有的成果。先租验证设备；真要做样片，再与制造伙伴谈。',
      12, { energy: -7, stress: 4 }, 'engineering', .48, [
        outcome('原型跑起来了，挑战才刚开始', '一组小任务跑通了。你把能耗测量、误差和不能处理的任务一起交给外部复核；这还不是胜过英伟达的证据，也还没有量产订单。',
          { engineering: 10, reputation: 4 }, ['if_research_prototype', 'future_restart_plan'], { career: 7, legacy: 5 }, { burden: 6 }, 'studio'),
        outcome('有一段有效，系统还没拼起来', '新架构在模拟里留下一项可用结果，接口和存储开销却抵消了不少收益。你缩小验证范围，手里的钱只够下一轮实验。',
          { engineering: 6, money: -3, stress: 5 }, ['if_research_partial', 'future_restart_plan'], { career: 3, legacy: 3, wealth: -3 }, { leverage: 5, burden: 8 }, 'studio'),
        outcome('测量推翻了第一版设想', '复测没有重现预期优势。设备费已经付掉，你保留失败记录，停止宣传性能，把下一步留给能承担的预算。',
          { engineering: 3, money: -5, reputation: -4, stress: 9 }, ['if_research_reset', 'future_restart_plan'], { career: -4, wealth: -5, health: -3 }, { burden: 9, leverage: 7 }, 'studio'),
      ], { lifeImpact: impact({}, {}, '目标是挑战一个小场景；只有后续独立验收成功，结局才会写出实际胜出。') }),
    risk(2028, 'rival', 'start', '投递 AMD，在竞争对手那里重新拿工牌',
      '把公开作品集递给曾经的对手，只带自己的本事与能公开的经历。薪酬、头衔和话语权要重新谈，旧公司的秘密留在原处。',
      4, { energy: -4 }, 'communication', .57, [
        outcome('新工牌上没有创始人三个字', 'AMD 的门禁第一次为你亮起绿灯。你接下有期限的技术岗位，坐进曾经在发布会上针锋相对的那一边；新同事没有起立鼓掌，先递来一张等着解决的故障单。',
          { money: 10, engineering: 6, control: -8, stress: 3 }, ['if_rival_hired'], { career: 6, wealth: 4, freedom: -4 }, { burden: 4 }, 'employee'),
        outcome('先签一段公开工具的合作', '对方暂时不批长期岗位，只同意一个范围有限的工具项目。你接受阶段验收，合同以外的组织权力并没有一起给你。',
          { money: 4, engineering: 4, control: -5 }, ['if_rival_contract'], { career: 3, wealth: 2 }, { burden: 3 }, 'employee'),
        outcome('面试结束，岗位没有落下', '双方没有谈拢职责与预算。你收回公开作品集，离开时没有拿走任何团队资料；下一份工作仍要继续找。',
          { communication: 2, reputation: -3, stress: 7 }, ['if_rival_declined'], { career: -3, wealth: -2 }, { burden: 4 }, 'sold'),
      ]),
    risk(2028, 'president', 'start', '前往新曙光共和国，把总统梦当真一次',
      '去虚构的非洲国家“新曙光共和国”生活，学习语言、参与技术服务，再争取参选资格。机场外没人认识旧头衔，第一步只是获准留下。',
      10, { energy: -5 }, 'communication', .50, [
        outcome('先被允许住下来，先学会听人说话', '虚构共和国批准了你的居留申请。你和当地同事维护一间技术服务站，居民先问停电和培训，没人因为旧履历就承诺投票。国籍与参选资格仍待后续依法审查。',
          { communication: 8, bonds: 4, control: -5 }, ['if_president_residency'], { freedom: 4, legacy: 4 }, { burden: 5 }, 'sold'),
        outcome('只拿到短期项目许可', '你获准参加一段技术交流，长期居留还没有获批。服务站按许可范围工作，总统海报仍只是一张没有印刷的草图。',
          { communication: 5, money: -3, stress: 4 }, ['if_president_temporary'], { legacy: 2, wealth: -3 }, { burden: 4 }, 'sold'),
        outcome('居留条件没有满足', '申请未获批准。你按规定结束行程，把未完成的技术资料交给当地项目人员，没有用投资承诺交换政治资格。',
          { money: -5, stress: 7, control: -4 }, ['if_president_application_denied'], { wealth: -4, career: -2 }, { burden: 5 }, 'sold'),
      ]),
    risk(2028, 'solar', 'start', '与孙宇晨联手，把算力城画到海上',
      '在船上谈一张离奇的蓝图：太阳能铺满浮台，服务器在海风里运转。先各出一段试验预算，盐雾、供电和维护过不了关，梦想就停在图纸上。',
      15, { energy: -7, stress: 5 }, 'communication', .46, [
        outcome('船舱里的蓝图，拿到了第一笔试验钱', '孙宇晨把海图推到你面前，你在上面划掉大半座城，只留下第一座验证平台。双方确认分段预算，第一笔钱到账；窗外是漆黑的海，能不能把灯真正点起来，仍要靠下一轮工程。',
          { money: 7, ecosystem: 7, control: -7 }, ['if_solar_pilot'], { career: 5, legacy: 4 }, { leverage: 7, burden: 7 }, 'studio'),
        outcome('方案缩成岸边的一排设备', '供电与维护报价高于设想，双方只保留岸边试验。合作范围变小，仍得为设备和人员支付真实费用。',
          { engineering: 5, money: -3, control: -4 }, ['if_solar_land_trial'], { legacy: 3, wealth: -4 }, { leverage: 6, burden: 5 }, 'studio'),
        outcome('海况和成本把签约推回了桌上', '保险、许可与维护条件尚不能支持投入。双方停止这一轮合作，你承担已经发生的设计费；失败来自方案的成本与工程条件，图纸没有变成资产。',
          { money: -6, engineering: 3, stress: 9 }, ['if_solar_unsigned'], { wealth: -6, career: -3 }, { leverage: 8, burden: 6 }, 'studio'),
      ], { lifeImpact: impact({}, {}, '孙宇晨只出现在明确架空的专业合作中；项目是否成立由工程、合同和结算结果决定。') }),
  ];
}

function pivot(year, path, title, text) {
  return choice(year, path, 'pivot', title, '结清现有范围，把未完成的部分如实交代；放弃这一轮做大的机会，重新安排工作与生活。', 0,
    { energy: -2 }, [outcome('换一条路，过去没有被擦掉', text, { money: -3, energy: 7, stress: -6, control: -5 },
      ['if_pivot_academic', 'future_academic_path'], { freedom: 5, health: 3, legacy: 2, career: -2 }, { burden: -7 }, 'researcher')]);
}

function middle(state, path) {
  const f = state.flags;
  if (path === 'nightlife') return [
    risk(2032, path, 'upgrade', '租下一层屋顶，把霓虹夜晚做成生意', '付押金、申请许可、请演出团队；先做一个季度。门票能否覆盖成本仍要接受市场检验。', 12, { energy: -8 }, 'communication', f.if_nightlife_circle ? .62 : .42, [
      outcome('屋顶有了固定的观众', '演出按许可办成，门票覆盖了第一季支出。朋友开始把这里当成工作场所，你也多了排班、账单和不能随意取消的责任。', { money: 13, reputation: 7, leadership: 5, stress: 7 }, ['if_nightlife_venue'], { career: 8, wealth: 4, freedom: -6, health: -5 }, { burden: 10 }, 'studio'),
      outcome('座位没有坐满，先缩成周末', '几场演出有人来，收入却养不起整周排期。你改成周末开放，按合同结清取消的场次。', { money: 3, energy: -5, stress: 5 }, ['if_nightlife_weekends'], { career: 3, wealth: -3, health: -3 }, { burden: 6 }, 'studio'),
      outcome('押金付了，排期停了', '成本与许可时间错开，无法按原计划营业。你停止继续订场，支付已确认费用，屋顶暂时交还出租方。', { money: -8, stress: 12, energy: -7 }, ['if_nightlife_venue_closed'], { career: -8, wealth: -8, health: -5 }, { leverage: 9, burden: 10 }, 'sold'),
    ]),
    choice(2032, path, 'shrink', '只去周末，给热闹设一个月度上限', '把旅行和演出预算固定下来，不再承担场地或演出团队的长期费用。', 3, {}, [outcome('夜晚仍在，白天也回来了', '你取消连轴转的行程，保留真正想见的人和想听的演出。少了一些热闹，也少了一些需要靠硬撑完成的日子。', { energy: 7, stress: -6, reputation: -2 }, ['if_nightlife_bounded'], { freedom: 6, health: 5 }, { burden: -6 }, 'sold')]),
    pivot(2032, path, '把夜晚收进课程，回去教一段公开技术', '你不再承包夜场，接受一段短期教学安排。熟悉的歌单仍在，白天开始按课程和答疑排时间。'),
  ];
  if (path === 'research') return [
    risk(2032, path, 'upgrade', '把新架构交给外部复现，再谈小批样片', '用自己的预算租验证线，与制造伙伴分阶段签约。测量不通过就停下一段，不把伙伴产线当成自己的工厂。', 12, { energy: -6 }, 'engineering', f.if_research_prototype ? .65 : .36, [
      outcome('能效结果被另一组人重现', '外部团队在约定的小负载上重现了结果，试用客户接受第一轮样品。系统维护和真实订单仍要继续检验，现在还不能宣称击败整个行业。', { money: 6, engineering: 9, reputation: 7 }, ['if_research_verified'], { career: 10, legacy: 8 }, { burden: 6 }, 'studio'),
      outcome('优势只留下了一小段', '复测确认局部有效，整机和工具链却抵消了大部分收益。你把样片范围缩小，继续维护可以使用的那一部分。', { money: 1, engineering: 6, stress: 5 }, ['if_research_limited'], { career: 4, legacy: 4, wealth: -3 }, { burden: 7 }, 'studio'),
      outcome('样片没跨过验收线', '热稳定与成本未达约定目标。你停止追加样片订单，结清本轮费用，把失败记录交给愿意继续研究的人。', { money: -6, engineering: 3, stress: 10 }, ['if_research_failed'], { career: -8, wealth: -6, health: -4 }, { leverage: 8, burden: 8 }, 'studio'),
    ]),
    choice(2032, path, 'shrink', '停止做整颗芯片，只维护公开工具', '放弃量产野心，把预算放在可复用的软件和研究说明上；收入会小很多。', 3, { energy: -2 }, [outcome('留下的是别人能重跑的工具', '你结束样片排期，把公开代码、已验证结果和局限整理给使用者。小额维护收入替代了原先设想的大订单。', { money: 3, engineering: 5, ecosystem: 4, stress: -4 }, ['if_research_tools'], { legacy: 7, freedom: 3, career: -2 }, { burden: -4 }, 'researcher')]),
    pivot(2032, path, '交代失败记录，转向短期研究和教学', '你把设备退租，把已付费和未完成的承诺分别结清。学校接下的是一门公开方法课程，没有替这颗芯片宣布成功。'),
  ];
  if (path === 'rival') return [
    risk(2032, path, 'upgrade', f.if_rival_hired || f.if_rival_contract ? '争取负责一支清洁室架构小组' : '带着公开原型，再申请一次竞争团队', '只以新团队拥有的技术和公开标准工作。岗位、编制和采购范围分别审批，录用不等于拿到整家公司。', 3, { energy: -5 }, 'leadership', f.if_rival_hired || f.if_rival_contract ? .62 : .38, [
      outcome('任命写清楚了，团队也开始问你要排期', '这条架空支线里的竞争团队批准你负责一段架构工作。你有一份明确的职责书，也必须接受同事复核和部门预算。', { money: 9, leadership: 8, control: -4, stress: 6 }, ['if_rival_lead'], { career: 9, wealth: 4, freedom: -5 }, { burden: 8 }, 'employee'),
      outcome('保留专家岗位，没有扩大编制', '对方只批准一个技术主责岗位。你能继续解决问题，却不能把个人想法直接写成整组采购单。', { money: 5, engineering: 6, control: -5 }, ['if_rival_specialist'], { career: 5, wealth: 2 }, { burden: 4 }, 'employee'),
      outcome('下一轮岗位没有谈拢', '职责与预算未能达成一致，这一轮雇佣或合作没有延续。你交清属于团队的资料，带走自己可以公开展示的经历。', { money: -2, reputation: -4, stress: 8 }, ['if_rival_departed'], { career: -6, wealth: -3 }, { burden: 6 }, 'sold'),
    ]),
    choice(2032, path, 'shrink', '不抢编制，靠公开工具接小单', '结束扩大岗位的谈判，独立接范围有限的公开工具维护，不使用原雇主资料或名义。', 2, { energy: -2 }, [outcome('工作缩到一张能完成的清单', '你按独立合同维护公开工具，收入有限，也不用替没有获批的编制负责。竞争关系仍在，保密边界也仍然有效。', { money: 4, engineering: 4, stress: -3 }, ['if_rival_independent', 'if_rival_departed'], { freedom: 4, career: 2 }, { burden: -3 }, 'studio')]),
    pivot(2032, path, '放下竞聘，把公开经验带回课堂', '你结束岗位谈判，整理能公开的经历和错误。新的课程不使用任何原雇主的秘密，学生看到的是可以讨论的方法。'),
  ];
  if (path === 'president') return [
    risk(2032, path, 'upgrade', '把总统梦交给资格审查，先别印海报', '按虚构共和国的规则核对国籍、居住年限、财务申报与利益回避；通过后才有资格参选，支持者也不能替你跳过程序。', 8, { energy: -5, stress: 3 }, 'communication', f.if_president_residency ? .61 : .28, [
      outcome('资格审查通过，选票还远着', '在这个虚构国家的法律设定下，你已满足规定条件，正式获得候选资格。审核通过没有带来一张选票，你仍要公开说明预算和政策接受质询。', { communication: 7, reputation: 5, control: -4 }, ['if_president_eligible'], { career: 5, legacy: 4, freedom: -4 }, { burden: 7 }, 'sold'),
      outcome('还有材料与期限没有满足', '审查要求补充材料并等待相应期限。你继续依法做公共技术项目，这一轮没有被登记为总统候选人。', { communication: 4, money: -2, stress: 5 }, ['if_president_pending'], { legacy: 2, wealth: -2 }, { burden: 5 }, 'sold'),
      outcome('参选申请没有获准', '资格条件未满足，申请未获批准。你停止筹备竞选活动，按规则结算已发生费用；原有技术服务由具备权限的人继续。', { money: -5, reputation: -3, stress: 8 }, ['if_president_denied'], { career: -4, wealth: -4 }, { burden: 6 }, 'sold'),
    ]),
    choice(2032, path, 'shrink', '不竞选总统，把技术服务站做好', '在许可范围内培训维护人员，公开经费；让当地负责人决定项目安排，不用投资换取政治位置。', 4, { energy: -3 }, [outcome('服务站按居民的日程开门', '你把设备和培训记录交给当地团队，留下有范围的支持。没有总统头衔，几项日常服务却有了能接手的人。', { bonds: 5, leadership: 4, ecosystem: 4 }, ['if_president_civic'], { legacy: 7, belonging: 3, freedom: 2 }, { support: 5, burden: -2 }, 'sold')]),
    pivot(2032, path, '结束竞选筹备，回到教学', '你按规定撤回尚在进行的申请，结清项目责任。政治野心留在经历里，下一份安排是一门公开技术课程。'),
  ];
  return [
    risk(2032, path, 'upgrade', '先建一座离岸验证平台，再谈整座城', f.if_solar_pilot || f.if_solar_land_trial ? '从已有试验继续谈下一段出资，把储能、盐雾和维护成本放进同一轮验收。未通过，就停后半段。' : '上一轮没有签成，这次重新邀请对方，从一座验证平台的分段合同谈起。储能、盐雾与维护过不了关，就停后半段。', 14, { energy: -6, stress: 4 }, 'engineering', f.if_solar_pilot ? .60 : .32, [
      outcome('一座平台连续运行了一段时间', '小型平台完成约定的连续运行测试，能源和维护数据交给独立复核。你与孙宇晨在这条架空线里只确认下一轮试验，海上城市仍未建成。', { money: 7, engineering: 8, ecosystem: 6 }, ['if_solar_operating'], { career: 9, legacy: 6 }, { burden: 8, leverage: 4 }, 'studio'),
      outcome('计算设备先搬回岸上', '供电可以运行，离岸维护却太贵。双方把计算设备留在岸边，只保留海上能源试验，项目按更小规模继续。', { money: 2, engineering: 5, stress: 5 }, ['if_solar_land_demo'], { career: 3, legacy: 4, wealth: -3 }, { burden: 5 }, 'studio'),
      outcome('工程条件要求这一轮停下', '许可、天气窗口与维护报价没有同时满足。双方依合同停止追加，设备按计划撤回，已经发生的工程费用由各自确认承担。', { money: -7, engineering: 3, stress: 11 }, ['if_solar_halted'], { career: -7, wealth: -7, health: -3 }, { leverage: 9, burden: 8 }, 'studio'),
    ]),
    choice(2032, path, 'shrink', '取消城市计划，只保留一项能源试验', '不再争取扩城投入，回收能继续使用的设备。已签的部分按约收尾，未签的部分仍只算提案。', 3, { energy: -2 }, [outcome('图纸少了一大半，账目清楚了', f.if_solar_unsigned ? '你撤回尚未签下的扩城提案，用自己的小预算完成一项岸边试验。旧提案没有变成共同资产，手里留下的是可以核对的记录与设备。' : '双方终止扩城投入，留下可维护的岸边实验。你减少了收入预期，也减少了长期出海和追加资本的责任。', { money: 2, engineering: 4, stress: -5, control: -3 }, ['if_solar_bounded'], { legacy: 4, freedom: 4, career: -2 }, { leverage: -5, burden: -4 }, 'studio')]),
    pivot(2032, path, '结束这轮合作，公开工程经验去教学', '你与架空合作方核对可公开的资料，结清各自责任。盐雾、供电和维修的记录进入课程，未实现的城市仍按未实现记下。'),
  ];
}

function ending(state, path) {
  const f = state.flags;
  const researchBreakthrough = Boolean(f.if_research_prototype && f.if_research_verified);
  const solarCity = Boolean(f.if_solar_pilot && f.if_solar_operating);
  const title = { nightlife: '把整座夜城办成一场音乐节', research: '再做一次独立对比，挑战英伟达的小场景', rival: '用竞争团队自己的成果，争一项细分订单', president: '依法参加新曙光共和国总统选举', solar: '把验证平台连起来，试一座微型算力城' };
  const ready = path === 'nightlife' ? f.if_nightlife_venue : path === 'research' ? f.if_research_verified
    : path === 'rival' ? (f.if_rival_lead || f.if_rival_specialist) && !f.if_rival_departed
    : path === 'president' ? f.if_president_eligible : f.if_solar_operating;
  let main;
  if (path === 'nightlife') main = risk(2036, path, 'upgrade', title[path], '付清场地与团队费用，接受售票和天气风险。成功也会带来工作与体力负担，今晚的热闹不是免费的。', 12, { energy: -7 }, 'communication', ready ? .64 : .38, [
    outcome('全城亮起，你终于不必用旧头衔介绍自己', '最后一首歌响起，屋顶、街口与屏幕上的灯同时亮了。台下的人喊你的名字，没人等你讲旧公司的传奇。你把工牌投影关掉，和朋友跳完这一场盛大的告别。散场后仍要结账，疲惫仍要恢复，但这一夜确实由你自己选择。', { money: 16, bonds: 6, reputation: 8, energy: -5 }, ['if_final_nightlife_success'], { career: 9, belonging: 5, health: -7, freedom: -4 }, { burden: 8 }),
    outcome('最后只办成一个小舞台', '预算和售票让计划缩成一场小演出。你付清约定费用，接受没有赚到预期的钱；仍有几位朋友留下来帮你收拾。', { money: 5, bonds: 4, energy: -3 }, ['if_final_nightlife_partial'], { belonging: 4, wealth: -4, health: -3 }, { burden: 4 }),
    outcome('这一场没有开成', '雨把最后的演出窗口也冲掉了。舞台拆到一半，手机同时涌来退款、工资和运输费的消息。你坐在空看台上，把每一笔答应过的费用重新摊开；这一回，热闹散得比钱更快。', { money: -8, stress: 11, reputation: -4 }, ['if_final_nightlife_failure'], { career: -9, wealth: -8, health: -4 }, { burden: 10, leverage: 7 }),
  ]);
  if (path === 'research') main = risk(2036, path, 'upgrade', researchBreakthrough ? '把新架构推向全球，正面挑战英伟达' : ready ? title[path] : '重做独立验证，先证明新架构确实有效', researchBreakthrough ? '原型与外部复现已经过关，这次把工具链、制造伙伴和客户迁移一起送去验收。再押一段预算，争一场足以掀起全球替代潮的胜利。' : '用公开负载、同等约束和外部验收比较；没有前轮通过记录时，这次只能验证原型，不能直接宣布战胜对手。', 14, { energy: -6, stress: 4 }, 'engineering', ready ? .53 : .30, [
    outcome(researchBreakthrough ? '全球替代潮，从那块被嘲笑过的原型开始' : ready ? '一个细分负载，你真的赢了一次' : '这次原型终于通过了复现', researchBreakthrough ? '2028年的原型、2032年的外部复现和这些年的工具链维护，在这一轮同时跨过了交付线。几家云平台连夜宣布切换，公开能效对比与客户回款接连落定。在新一代低功耗推理市场，你们真的击败了英伟达当轮方案，替代潮从一个小场景推向全球。新势力的名字亮上大屏，机房里却已有第一张通宵维护单：赢来的世界，仍要有人把它撑住。' : ready ? '独立验收确认：在约定的边缘推理负载与同等成本约束下，你们优于当次比较的英伟达方案。客户签下订单，旧同事第一次主动问你的交期；你知道，这次终于是在结果上赢了一回。' : '外部团队终于重现了原型结果。你盯着那封确认邮件看了很久，才把它转给仍愿意同行的人。它还没有击败成熟对手，却终于不再只是你一个人的设想。',
      { money: ready ? 18 : 5, engineering: 9, reputation: ready ? 12 : 5 }, [ready ? 'if_final_research_niche_won' : 'if_final_research_validated'], { career: ready ? 18 : 7, legacy: 12, health: -4 }, { burden: 7 }),
    outcome('性能有一处好，整体还不够', '公开比较留下了局部优势，维护与工具成本仍高于目标。你保留小规模试用，没有拿一项好看的数字代替完整竞争结果。', { money: 5, engineering: 7, stress: 5 }, ['if_final_research_partial'], { career: 5, legacy: 7, wealth: -4 }, { burden: 6 }),
    outcome('最后一组对比，把翻盘的画面按了暂停', '复测屏幕上的差距没有缩小。制造伙伴在电话里问是否继续排期，同伴等你签下一张支出单；你把笔放下，停止追加。样片、失败记录和这些年的投入都是真的，那个想赢回世界的夜晚，却没能在今天兑现。', { money: -7, engineering: 3, stress: 10 }, ['if_final_research_failure'], { career: -12, wealth: -8, health: -5 }, { burden: 9, leverage: 8 }),
  ]);
  if (path === 'rival') main = risk(2036, path, 'upgrade', ready ? title[path] : '再申请一次技术岗位，接受新的评审', ready ? '靠新团队自己的架构与工具争订单。旧雇主的秘密仍留在原处，这次让公开比较和客户验收决定输赢。' : '拿公开作品和独立原型重新申请岗位。眼下要争取的是一份真实工作，尚未参与的产品胜利不能先写进履历。', 5, { energy: -5 }, ready ? 'engineering' : 'communication', ready ? .59 : .43, [
    outcome(ready ? '团队拿下了一项细分订单' : '这一次拿到了一份正式岗位', ready ? '客户按公开条件验收，竞争团队的方案在这一项负载与报价上胜出，拿下原本与英伟达竞争的有限订单。功劳属于团队，你仍按职责书工作，也没有带走任何旧雇主秘密。' : '架空的竞争团队通过了你的技术评审，给出有范围的岗位。你重新受雇，这次没有参与过的产品胜利也没有被写进履历。',
      { money: 12, engineering: 7, reputation: 7, control: -4 }, [ready ? 'if_final_rival_niche_won' : 'if_final_rival_hired'], { career: ready ? 13 : 6, wealth: 6, freedom: -4 }, { burden: 6 }, 'employee'),
    outcome('留下的是一段小范围的工作', '预算只覆盖一项工具任务。你按有限职责完成它，收入继续了一段时间，没有拿到主导整个方向的权限。', { money: 5, engineering: 4, control: -4 }, ['if_final_rival_partial'], { career: 4, wealth: 2 }, { burden: 3 }, 'employee'),
    outcome('这一轮没有获得合作', '方案或岗位没有通过评审。你完成资料归还与责任交接，重新寻找可承受的工作范围；竞争没有因为个人执念就自动获胜。', { money: -3, reputation: -4, stress: 8 }, ['if_final_rival_failure'], { career: -8, wealth: -3 }, { burden: 6 }, 'sold'),
  ]);
  if (path === 'president') main = risk(2036, path, 'upgrade', ready ? title[path] : '先完成合法资格申请，暂不参加总统选举', ready ? '你已有本局审查通过的候选资格。公开筹款和支出、参加辩论，接受选民决定和宪制约束；没有任何赞助者能替你买到胜选。' : '此前没有取得候选资格，本轮只申请合法参与公共项目；即使申请顺利，也不会变成总统胜选。', 12, { energy: -6, stress: 4 }, 'communication', ready ? .41 : .46, [
    outcome(ready ? '全国计票结束，那个失业的人当选了总统' : '你获准继续一项公共技术计划', ready ? '新曙光共和国的计票直播一直亮到凌晨。最后一批选票公布，广场上的沉默突然变成呼喊；当年拎着纸箱离开办公室的人，如今依法当选了这个虚构国家的总统。你站上台，第一次发现掌声也会让人发抖。宣誓之后，议会监督与任期约束仍在，桌上等着的第一件事是让一片停电的社区恢复供电。' : '有关机构批准了有范围的公共技术项目。服务站的人替你留了一张椅子；你仍不是总统候选人，但明天确实有一件能亲手完成的事。',
      { leadership: ready ? 14 : 5, reputation: ready ? 15 : 4, control: ready ? 4 : -3, stress: ready ? 9 : 3 }, [ready ? 'if_final_president_elected' : 'if_final_president_civic'], { career: ready ? 15 : 4, legacy: ready ? 18 : 6, freedom: ready ? -15 : -3, health: -5 }, { burden: ready ? 18 : 5 }, 'sold'),
    outcome(ready ? '没有当选，仍有人听你把话说完' : '申请仍待条件满足', ready ? '选票没有给你多数。你依法接受结果，公开结算竞选费用，继续完成承诺过的公共技术工作。' : '资格与许可条件仍未全部满足。你按现有范围继续交流，没有把等待写成政治任命。', { communication: 5, money: -3, stress: 5 }, ['if_final_president_partial'], { legacy: 4, career: -3, wealth: -3 }, { burden: 5 }, 'sold'),
    outcome(ready ? '大屏跳到结果，你的名字留在下面' : '这一次申请没有获准', ready ? '最后一批票没有翻转差距。台下的人慢慢收起旗子，团队仍等你说完告别；你承认败选，接着面对还没有结清的费用。总统梦结束了这一轮，许多人为它投入的时间不能靠一句“下次再来”交代。' : '申请未获批准，你结束不再有许可的活动。印在草稿上的总统头衔没有成为现实，行李箱里多了一叠必须如实记下的拒函。', { money: -6, reputation: -5, stress: 9 }, ['if_final_president_failure'], { career: -9, wealth: -5, health: -4 }, { burden: 8 }, 'sold'),
  ]);
  if (path === 'solar') main = risk(2036, path, 'upgrade', solarCity ? '让整座海上算力浮城亮起来' : ready ? title[path] : '重做一座能源验证点，不再提前叫它城市', '前两轮成功才足够把浮台连成城市。再押一段工程预算，接受天气、维护与持续供电的最终检验；一项不过，扩城就停。', 16, { energy: -7, stress: 5 }, 'engineering', ready ? .46 : .28, [
    outcome(solarCity ? '海面上，那座浮城真的亮了' : ready ? '海上亮起了几个真正能工作的节点' : '一座小验证点终于运行了', solarCity ? '前两轮留下的运行记录撑住了这次扩建。黄昏时，廊桥把浮台连成一片，太阳能阵列与储能系统接力，服务器舱的灯一排排亮到海面尽头。孙宇晨站在控制屏旁，看着首批付费任务跑完；你们曾在船舱里画的算力浮城，终于成了能登上去、能工作、也必须维护的地方。远处风暴预报刚刚刷新，新的值班表已经有人递来。' : ready ? '几个获准的平台接成小型能源与算力网络，第一批海港任务跑完。它还没有长成原先画的城市，但这一次，海面上的灯确实在为客户工作。' : '一座小验证点终于连续运行起来。你们留下数据，收起那张还不能兑现的城市鸟瞰图，先把脚下这一座平台维护好。',
      { money: ready ? 19 : 5, engineering: 8, ecosystem: 9, control: -5 }, [ready ? 'if_final_solar_network' : 'if_final_solar_pilot'], { career: ready ? 17 : 6, legacy: 12, health: -5, freedom: -5 }, { burden: 10, leverage: 4 }, 'studio'),
    outcome('城没有出现，一项岸边服务留下来了', '维护成本压缩了规模，双方把系统留在岸边运行。有限的服务收入可以核验，远处那张城市图纸仍按未完成保留。', { money: 6, engineering: 5, stress: 5 }, ['if_final_solar_partial'], { career: 4, legacy: 5, wealth: -4 }, { burden: 6 }, 'studio'),
    outcome('海况与成本让这一轮画上句号', '许可、供电可靠性和维护成本未能同时通过要求。双方依约终止追加，回收能够使用的设备，承担已发生的费用；最后一份对账单上，留着双方确认的支出和撤回日期。', { money: -9, stress: 12, engineering: 3 }, ['if_final_solar_failure'], { career: -12, wealth: -9, health: -5 }, { leverage: 10, burden: 10 }, 'sold'),
  ]);
  const boundedText = {
    nightlife: '你保留几个愿意常来往的人和固定的夜晚，不再为整座城订场地。生活的亮色仍在，收入与日常开销按剩下的预算安排。',
    research: '你停止追加样片，保留能公开的记录、局限和确实可复用的部分。没有赢下原先设想的行业挑战，这些经历仍能被别人继续检验。',
    rival: '你不再扩大求职或带队的承诺，只接自己能交代清楚的小任务。不再用每天的竞争决定自己整个人的价值。',
    president: '你不再扩大政治计划，只在依法允许的范围内支持公共技术服务。地方团队继续独立决定自己的工作，没有凭空出现总统头衔。',
    solar: '你不再为城市计划追加承诺，先把已有设备、资料和确认过的费用收清。未落实的部分仍留在提案里，真实发生的工作有人能接着看懂。',
  };
  return [main,
    choice(2036, path, 'shrink', '留下做得到的一小部分，余下时间还给生活', '终止新的扩张投入，付清已经确认的责任；少拿收入与影响力，换取能安排的日常。', 2, {}, [outcome('规模收小，生活有了可用的空白', boundedText[path],
      { money: -2, energy: 7, stress: -6, control: -4 }, [`if_final_${path}_bounded`, 'future_retire'], { freedom: 7, health: 4, career: -3 }, { burden: -7 })]),
    choice(2036, path, 'pivot', '把这段离奇经历写下来，交清责任再翻页', '只写自己有权公开的经历，区分愿望、失败与真正完成的事；其他人的私人生活不由你代写。', 0, { energy: -2 }, [outcome('书稿里，未完成的事仍叫未完成', '你把合同、资格、验收与结果分别核对，再写下那几年敢想也会付出代价的日子。读者能看见实际发生的部分，也能看见你最后选择停下的地方。',
      { money: -2, communication: 5, energy: 4, stress: -4 }, [`if_final_${path}_memoir`, 'future_memoir'], { legacy: 7, freedom: 4 }, { burden: -5 })]),
  ];
}

export function enrichIfScene(scene, state, domain = 'career') {
  const year = Number(scene?.year);
  if (domain !== 'career' || !enabled(state) || !Object.hasOwn(YEAR_STEP, year) || state.step !== YEAR_STEP[year]) return scene;
  const path = pathOf(state);
  if (year !== 2028 && !path) return scene;
  const additions = year === 2028 ? openings(state) : year === 2032 ? middle(state, path) : ending(state, path);
  const choices = (scene.choices || []).filter(option => !option.id?.startsWith('impact-') && !option.id?.startsWith(`if-${year}-career-`));
  const intro = year === 2028
    ? '凌晨两点，雨水里映着街对面的霓虹。你摸到口袋里的旧工牌，又想起 2026 年第四季度那扇没再为你打开的门。楼上传来一阵试音，像是有人在给一场演出调麦克风。你站在檐下听了一会儿，才打开手机，翻到那几封早就该回的信。'
    : year === 2032 ? {
        nightlife:'散场后，霓虹还亮着，楼上的音响已经关了。黎岚把屋顶的排期表推到你面前，指着还没确认许可的那几天：“这几场要是开不了，押金怎么算？”',
        research:'实验室已经熄灯，只剩测试屏还亮着。外部团队来信问，低功耗原型用的是哪一批任务，能耗从哪一步开始记。他们要先照着重跑，制造伙伴才好谈样片排期。',
        rival:state.flags.if_rival_hired || state.flags.if_rival_contract
          ? '下班以后，AMD 的门口还亮着。负责评审的人想看下一段架构工作用哪些公开标准、怎样验收工具。职责、编制和设备采购还要分别批。'
          : '你把上次面谈带回来的公开作品集又翻了一遍。AMD 的评审要看原型能重跑什么、工具还有哪些限制。那一页上，岗位和设备预算都还没定。',
        president:'新曙光共和国的服务站关门后，当地同事还在核对设备维护和培训的人手。黎岚把参选资格申请放在另一边，那上面要填写的是居住年限、财务申报和需要回避的事项。',
        solar:'码头的灯刚亮，海况预报又更新了一次。黎岚把验证平台的预算翻到测试那页，储能要跑多久，设备受过盐雾后还能不能用，得等有许可、能出海的那几天测出来。',
      }[path] : {
        nightlife:'街口的霓虹亮了，音响还没通电。音乐节的场地费和演出团队的报价已经摆上桌，预售能收回多少、那几天会不会下雨，还没人能答。',
        research:state.flags.if_research_verified
          ? '外部团队上次留下的复测日志还在。今晚他们要确认同一批边缘推理任务和相同的成本约束，再看新架构的能效。制造伙伴和试用方还等着这轮工具链和部署记录。'
          : '测试屏上还是那一组没能确认的结果。外部团队要用公开任务和相同的约束重跑低功耗原型。制造伙伴也在等复测记录，下一批样片还没有排定。',
        rival:(state.flags.if_rival_lead || state.flags.if_rival_specialist) && !state.flags.if_rival_departed
          ? '竞争团队下班前发来了客户的测试任务和报价条件。要争的订单只覆盖一种负载，客户会用同一份记录核对运行结果，再决定给谁。'
          : '夜里，你又打开了那份公开作品集。下一轮技术评审要亲自把独立原型跑一遍，说明其中哪段是你做的。岗位和报酬还要等评审后再谈。',
        president:state.flags.if_president_eligible
          ? '新曙光共和国的广场正在架灯。候选资格已经过审，竞选的收支要公开，辩论也还没开始。服务站那边发来维护排期，问你哪些日子仍能到场。'
          : '服务站的灯还亮着。当地同事把设备维护的申请发给你，里面写着培训人数和能用的经费。候选资格还没取得，这次等批复的是社区技术项目。',
        solar:state.flags.if_solar_operating
          ? '码头的灯照着上一轮的运行记录。现在要把几个浮台接起来，许可范围和维修船的排期都得重新核对。储能能不能在连续供电测试里接得上，试过才知道。'
          : '几座浮台连起来的图还摊在桌上。手头的运行记录还不足以扩建。码头那边问，下一轮验证的许可什么时候能批，盐雾和连续供电要留几天测。',
      }[path];
  const people = [...(scene.people || []), fictional('黎岚', '帮你逐项核对预算与承诺的独立顾问')];
  return { ...scene, title: year === 2028 ? '旧工牌熄灭之后，霓虹里还有几条路' : scene.title,
    story: `${intro}\n\n${scene.story || ''}`,
    choices: [...choices, ...additions], people,
    fact: { text: `${scene.fact?.text || ''} 本页新增路线全部是黄二勋的架空未来：AMD与英伟达相关岗位和竞争结果不是预测；新曙光共和国是虚构的非洲国家，参选须在本局依法取得资格；孙宇晨仅作为明确架空的专业合作想象出现，不陈述真人交易、私生活或不当行为。`, sourceIds: [...(scene.fact?.sourceIds || [])] },
  };
}

// A closing aside is presentation, not another event. It cannot rewrite the
// committed result, award resources, or promote a partial outcome to a victory.
function closingAside(state, path, last) {
  const f = state.flags;
  if (last.optionId.endsWith('-shrink')) return '宇宙还在膨胀，你的日历终于不用跟着扩容。';
  if (last.optionId.endsWith('-pivot')) return '宇宙没有给回忆录背书，错别字倒是按时出现。';
  if (path === 'nightlife') return f.if_final_nightlife_failure
    ? '宇宙没有退款窗口，账本倒是每天准时上班。'
    : f.if_final_nightlife_success ? '宇宙没给青春续费，舞池暂时没查有效期。'
      : '平行宇宙也许有安可，这一场先把椅子收好。';
  if (path === 'research') return f.if_final_research_failure
    ? '宇宙没有针对你，它只是拒绝为漂亮的假设报销。'
    : f.if_final_research_niche_won ? '新王座很亮，底下还是一台吵得要命的风扇。'
      : '改变世界的接口还没调通，电表的接口一直很稳定。';
  if (path === 'rival') return f.if_final_rival_failure
    ? '宇宙有无限可能，招聘系统只有一个灰色按钮。'
    : f.if_final_rival_niche_won || f.if_final_rival_hired ? '换了阵营，咖啡机仍用同一种方式鄙视人类。'
      : '平行宇宙的你也许在当老板，这个宇宙先把工单做完。';
  if (path === 'president') return f.if_final_president_elected
    ? '你当选了总统，万有引力仍然拒绝向你汇报。'
    : f.if_president_eligible ? '选票已经数完，万有引力没有发表意见。'
      : '宇宙可以无限大，申请表上的格子通常不够写。';
  if (path === 'solar') return f.if_final_solar_failure
    ? '海会发光，不代表它同意替你支付维修费。'
    : f.if_final_solar_network && f.if_solar_pilot && f.if_solar_operating
      ? '浮城已经通电，宇宙却坚持盐雾不在保修范围。'
      : '海面愿意反光，至于利润，它没签字。';
  return '';
}

function shortCard(state, path, last, aside) {
  const f = state.flags;
  let fact = '';
  if (last.optionId.endsWith('-pivot')) fact = '你核对合同、资格和验收记录，把这段离奇经历写进书稿，未实现的部分仍叫未实现。';
  else if (last.optionId.endsWith('-shrink')) fact = {
    nightlife: '你不再承包整座夜城，留下固定的夜晚和真正愿意来往的人，把开销放回预算里。',
    research: '你停止追加样片，留下能公开的记录与可复用的部分；原先的行业挑战没有被写成胜利。',
    rival: '你收起扩大岗位和权限的承诺，只接能交代清楚的小任务，接受收入与影响力的上限。',
    president: '你没有扩大政治计划，只在获准范围内支持技术服务，工作由当地团队自己决定。',
    solar: '你停止为城市计划追加投入，清点已用设备、确认过的费用和仍未落实的提案。',
  }[path];
  else if (path === 'nightlife') fact = f.if_final_nightlife_success
    ? '你办成了这场音乐节，留下收入和共同的夜晚，也承担了散场账单与需要恢复的疲惫。'
    : f.if_final_nightlife_partial ? '计划缩成一场小演出，没赚到预期的钱。你付清约定费用，仍有几位朋友留下来收拾。'
      : '活动取消了，退款、工资和运输费同时来到眼前。你承担已发生的费用，把这一场亲手收尾。';
  else if (path === 'research') fact = f.if_final_research_niche_won
    ? f.if_research_prototype && f.if_research_verified
      ? '三轮验证与交付连成一线。新架构在低功耗推理市场击败英伟达当轮方案，掀起全球替代潮。'
      : '独立验收确认你在约定的推理负载上胜出，并拿到客户订单；胜利还没有扩大到整个行业。'
    : f.if_final_research_validated ? '原型终于通过外部复现，你有了继续研究的依据；它尚未击败成熟对手，也没有量产胜利。'
      : f.if_final_research_partial ? '公开比较留下局部优势，维护与工具成本仍高于目标。你保留小规模试用，没有赢下完整竞争。'
        : '最后的复测没有确认预期优势。你停止追加排期，承担研发损失，把样片与失败记录留下。';
  else if (path === 'rival') fact = f.if_final_rival_niche_won
    ? '竞争团队靠自己的成果赢下一项与英伟达竞争的细分订单。功劳属于团队，你仍按职责书工作。'
    : f.if_final_rival_hired ? '你通过新的技术评审，拿到一份有范围的岗位。这次实际发生的是重新受雇，没有额外的产品胜利。'
      : f.if_final_rival_partial ? '预算只支持一段工具任务，你得到有限工作与收入，没有拿到主导整个方向的权限。'
        : '这一轮方案或岗位没有通过评审。你交清资料与责任，失去这次合作，继续寻找能承担的工作。';
  else if (path === 'president') fact = f.if_final_president_elected
    ? '全国计票结束，你依法当选虚构的新曙光共和国总统。议会监督、任期与公共责任同时落在桌上。'
    : f.if_final_president_civic ? '你获准继续一项公共技术计划，仍不是总统候选人，也没有当选；下一步是把服务完成。'
      : f.if_final_president_partial ? f.if_president_eligible
        ? '你没有得到多数选票，依法接受落选，结算竞选费用，并继续完成已承诺的公共技术工作。'
        : '资格与许可条件仍未全部满足，你只能按现有范围交流；等待中的申请没有变成总统任命。'
      : f.if_president_eligible ? '竞选失败了。你公开结算筹备费用，结束本轮团队，把其他人的时间与责任认真交代清楚。'
        : '申请没有获准，你结束不再有许可的活动。总统梦仍未实现，已经发生的费用与行程需要收尾。';
  else if (path === 'solar') fact = f.if_final_solar_network
    ? f.if_solar_pilot && f.if_solar_operating
      ? '前两轮验证撑住扩建。你与孙宇晨在这条架空线里建成海上算力浮城，首批付费任务已经跑完。'
      : '验证平台接成小型能源与算力网络，完成首批海港任务；它还没有长成原先设想的海上城市。'
    : f.if_final_solar_pilot ? '一座小验证点开始连续运行，留下真实数据；你收起还未兑现的城市鸟瞰图，先维护脚下的平台。'
      : f.if_final_solar_partial ? '维护成本迫使扩城计划收缩。系统留在岸边，保留有限服务收入，海上城市没有建成。'
        : '工程条件没有通过最终要求。双方终止追加并回收设备，承担已经发生的费用，浮城没有建成。';
  return fact ? `${fact}${aside}` : null;
}

export function getIfEpilogue(state) {
  if (state?.phase !== 'ended') return null;
  const explicitEnding = state.storyEdition === '2026.11' && state.step >= 12;
  if (explicitEnding && state.endReason === 'IF终章：悲剧落幕') return { kind: 'tragedy', tragedy: true, title: '悲剧落幕',
    text: '黄二勋在这条虚构支线中死于自杀。此前的付出、错误和牵挂仍留在记录里；亲友需要时间面对失去，他们记得的是这个人走过的整段生活。' };
  if (explicitEnding && state.endReason === 'IF终章：选择停在这里') return { kind: 'open', tragedy: false, title: '这一页，先停在这里',
    text: '你决定暂时合上这一段经历。已经发生的选择保留在手记里，下一份工作、下一次相遇和还没实现的念头，都留在这一页之外。' };
  if (!enabled(state)) return null;
  const last = state.journal?.at(-1);
  if (last?.step !== 15 || !last.optionId?.startsWith('if-2036-career-')) return null;
  const path = KEYS.find(key => last.optionId.startsWith(`if-2036-career-${key}-`));
  if (!path || !state.flags[`if_route_${path}`] || !Object.keys(state.flags).some(flag => flag.startsWith(`if_final_${path}_`) && state.flags[flag])) return null;
  const aside = closingAside(state, path, last);
  const cardText = shortCard(state, path, last, aside);
  return { kind: KINDS[path], tragedy: false, title: last.label || last.choiceTitle,
    text: `${last.resultText}${aside ? `\n\n${aside}` : ''}`, ...(cardText ? { cardText } : {}) };
}
