// Additional decisions are opt-in per saved game. The original three choices
// and their replay contract are left in place by the integration layer.
export const COMPANY_SOURCES = [
  { id:'company-manufacturing-2024', title:'NVIDIA 2024 年报：制造与供应商', url:'https://s201.q4cdn.com/141608511/files/doc_financials/2024/ar/2024-annual-report-insert-web-IR-update.pdf', note:'公开年报介绍无晶圆厂模式、台积电等晶圆代工伙伴、内存供应商和 CoWoS 封装；本局产能合同、报价与人物为虚构。' },
  { id:'company-blackwell-2024', title:'NVIDIA 2024 年 8 月季度申报：Blackwell 良率与量产安排', url:'https://www.sec.gov/Archives/edgar/data/1045810/000104581024000264/nvda-20240728.htm', note:'申报披露为改善良率修改掩膜及计划的生产爬坡；玩家在质量、交期、预付款之间的取舍为游戏创作。' },
  { id:'company-dgx-2016', title:'NVIDIA：2016 年发布 DGX-1', url:'https://nvidianews.nvidia.com/news/nvidia-launches-world-s-first-deep-learning-supercomputer-6622436', note:'用于从芯片扩展到包含硬件、工具和软件的整机系统背景，不把本局谈判当作真实合同。' },
  { id:'company-review-2026', title:'NVIDIA：独立董事调查声明（2026年11月10日）', url:'https://nvidianews.nvidia.com/news/statement-from-the-independent-members-of-the-nvidia-board', note:'公开宣布独立调查，不代表已经作出调查结论；黄二勋的回避与交接决定为虚构。' },
  { id:'company-transition-2026', title:'NVIDIA：CEO交接公告（2026年11月12日）', url:'https://nvidianews.nvidia.com/news/nvidia-announces-ceo-transition', note:'公告确认黄仁勋辞去总裁、CEO及董事职务，Colette Kress兼临时CEO；不据此推断未决调查结果，玩家未来不是对真人的预测。' },
];

const result = (label, text, effects, flags = []) => ({label,text,effects,flags});
const decision = (title, description, axes, outcome, details = {}) => ({title,description,axes,outcomes:[outcome],...details});
const risk = (title, description, axes, stat, base, outcomes, details = {}) => ({title,description,axes,check:{stat,base},outcomes,...details});
const person = (name, role) => ({name,role,kind:'虚构角色'});
const paired = life => ['dating','married'].includes(life.relationship) && ['lori','maya'].includes(life.partner);
const partnerName = life => life.partner === 'lori' ? 'Lori' : '麦雅';

function lifePressure(state) {
  const life = state.life || {};
  const who = paired(life) ? partnerName(life) : '家人和朋友';
  if (life.partnerCareer === 'protected') return `你已经答应让${who}的工作先占一段时间。新的出差安排，得有人接过才排得进去。`;
  if (life.workBoundary === 'protected') return '你给私人生活留过固定时段。这次加任务之前，要先写清谁能在你离开后签字。';
  if (life.children === 'parent' && state.step < 8) return `家里的接送和照料也在日历上。${paired(life) ? `${who}不会自动接下你增加的班次。` : '你需要另外安排可靠的人手，不能只把会议往后挪。'}`;
  if (life.familyExposure === 'separate' || life.familyPact === 'separate') return '家用已经和项目预算分开。报价单上的缺口，只能从业务里找办法。';
  if (life.familyExposure === 'capped') return state.lifeJournal?.some(item=>item.optionId==='impact-1993-life-family-cheer') ? '当年的饭桌上，家人表达过支持，出资人、用途和上限却没有谈清。项目预算不能把那次鼓励当成已到手的钱。' : state.lifeJournal?.some(item=>item.optionId==='life-1993-story-capped-family-support') ? '家人同意的那笔支持有明确上限。项目超支不能自动变成家庭追加投入。' : '家人的支持是否包含出资，要先核对当时的约定。项目超支不能自动算进家庭开支。';
  return '新头衔和新订单都要占用时间。你把需要自己到场的日子，也写在预算旁边。';
}

function careerEcho(state) {
  const f = state.flags || {};
  const lines = [];
  if (state.step === 4) {
    if (f.org_manager_promoted) lines.push('你刚接过一个小组，辞职前得把正在培养的人交接好。合伙人也因此想让你负责招人。');
    if (f.org_expert_track) lines.push('上一年留下的技术评审记录成了你的谈判材料。你提出，研发负责人应该有正式的停止出货权。');
    if (f.org_joint_lead) lines.push('共同负责的项目教会你把签字权写清。饭桌上，你先问三个人意见不同时怎么办。');
  }
  if (state.step === 5) {
    if (f.company_board_terms) lines.push('创业时签过分阶段拨款条款。今天承认失败，还得向另一位有表决权的人说明下一笔钱花在哪里。');
    if (f.company_small_contracts) lines.push('你当初选择靠小合同起步，眼下没有大笔缓冲，但还有两位可以询问维护需求的客户。');
    if (f.org_internal_charter) lines.push('组建时写下的权限仍有效：你可以缩项目，不能替雇主承诺追加投资。');
  }
  if (state.step === 6) {
    if (f.partner_reset_contract) lines.push('上一轮重新签过验收条件。现在合作方拿着同一张表等结果，不能再把延期解释为需求变了。');
    if (f.partner_milestone_trial) lines.push('你争取到的试验按阶段付款，第一批样品通过以前，后半笔款仍不会到账。');
    if (f.rd_standard_reset) lines.push('你已经停掉旧接口。新一轮验证能少维护一套代码，旧客户的迁移说明却仍由你负责。');
  }
  if (state.step === 7) {
    if (f.supply_pilot_passed) lines.push('小批验证保住了良率，量还不够大。客户愿意谈长期订单，却要求你拿出真正的扩产日期。');
    if (f.supply_pilot_delayed) lines.push('上一轮样品没全部通过。合作谈判要先补交验证记录，不能把试产写成已经量产。');
    if (f.supply_reserved) lines.push('提前预订的产能开始计费。销售希望你尽快签大单，好让空着的排期有人付款。');
    if (f.supply_quality_gate) lines.push('测试负责人上次叫停过一批交付。今天谈客户时，质量签字仍不由销售代替。');
  }
  if (state.step === 8) {
    if (f.partner_exclusive) lines.push('上一份合同的优先权还在。新工具若向所有人开放，需要先界定客户出钱做的部分。');
    if (f.partner_open_channels) lines.push('你保留了多家合作伙伴，需求各不相同。做一个共同接口比为每家单独改一版更难，也更有用。');
    if (f.org_project_owners) lines.push('各项目已经有人签字。现在要决定，他们能否自行把人手投到短期没有收入的工具上。');
  }
  if (state.step === 9) {
    if (f.rd_shared_tools) lines.push('前一轮投入的工具维护人员仍在，新实验不用从驱动和安装说明做起。');
    if (f.org_flat_review) lines.push('工程师可以直接把结果发到同一场评审，但所有争论仍挤在你的日历里。');
    if (f.org_delegated_budget) lines.push('部门负责人各有预算，新课题可以先做小试验；跨部门借人则需要重新谈。');
  }
  if (state.step === 10) {
    if (f.rd_research_grants) lines.push('当年支持的小型研究合作带来了可重跑的程序。现在分配第一批系统，有人能马上上手。');
    if (f.rd_two_tracks) lines.push('双轨试验留下两组人。给谁先用新设备，将决定另一组还要等多久。');
    if (f.rd_mobile_contract) lines.push('旧客户仍按合同付款，也仍占着维护时段。新的合作不能把这部分工时当成空白。');
  }
  if (state.step === 11) {
    if (f.partner_research_system) lines.push('共同验证的研究团队带来了新的算力请求，软件问题仍会找回原来的联系人。');
    if (f.partner_cloud_channel) lines.push('云合作方已经替你接触用户，也开始要求更早拿到下一批资源。');
    if (f.rd_system_team) lines.push('你保留了系统集成团队。性能之外，供电、散热和维修也进入了这次交付表。');
    if (f.org_delegated_budget || f.org_project_owners) lines.push('已经独立管过预算的人可以接下日常调度，你不必亲自参加每一场供应会议。');
  }
  return lines.join('');
}

function promotion(state) {
  const research = state.route === 'researcher';
  const protectedTime = state.life?.workBoundary === 'protected';
  return {
    title:research ? '项目负责人，还是继续做研究' : '升职通知来了，职责也要重写',
    addition:research
      ? '导师带来三个人的实验排期。另一组想照你们的记录重跑时序测试，仿真和实测波形却还对不上。下期机时经费没有定，学生有问题该找谁、实验出了状况谁能叫停，任务表上还没有人签字。'
      : '主管把晋升表和故障单一起放在你面前。管理岗要管招人、排班和考核，技术岗要为关键设计的复核签字，薪酬和期权归属还没谈好。工程师等人调班补测，客户已经在催：“延期的事，谁能给我个准信？”',
    people:[person('林秋雯',research ? '联合项目联络人' : '负责岗位与薪酬沟通的人事同事')],
    choices:[
      risk(research?'申请带一个研究小组':'竞聘主管，把编制和签字权一起谈',research?'申请带组，承担经费报告与学生指导；研究时间会减少。':'提出岗位、薪酬和期权归属方案，同时要求明确招聘与排期权限。',[1,1],'leadership',.62,[
        result('职责写进任命书',research?'你获得一段有期限的带组机会。三个人来问课题，也来问下学期的钱从哪里出。':'晋升获批，薪酬安排和审批权限写进了文件。第一天就有人请你处理排班，自己的电路图只能晚点再看。',{money:9,leadership:8,engineering:-2,stress:6},['org_manager_promoted']),
        result('先代理一个周期','对方只同意代理职位，薪酬先调整一部分。你把正式评审日期写下来，避免一直替更高的岗位承担责任。',{money:4,leadership:5,energy:-4,stress:4},['org_manager_trial']),
        result('这轮没有升职','评审没有通过。你要回具体意见，继续交付手上的工作；下轮机会还得重新申请。',{leadership:2,reputation:-2,stress:5},['org_promotion_deferred']),
      ],{effects:{energy:protectedTime?-3:-6}}),
      decision(research?'做技术主责，少带一个项目':'走专家路线，不接整组管理','谈清技术评审范围和收入，不把每个疑难问题都变成随时待命。',[-1,1],result('岗位留在技术上','你接下关键设计的复核，团队管理交给别人。收入有所增加，组织里的发言权更依赖具体成果，临场调人的权限没有一起到手。',{money:6,engineering:8,control:-3,leadership:-2},['org_expert_track'])),
      decision('和搭档共同负责，轮流值守','先试一个周期，把技术、排期和夜间联系分别交给明确的人；晋升节奏会慢一些。',[-1,-1],result('两个人都有签字栏','你们按周轮换联系窗口，第一份分工还改了两次。少了一次独自抢功的机会，也终于有一天不必把电话带回饭桌。',{bonds:5,leadership:4,stress:-4,control:-5},['org_joint_lead']),{effects:{energy:3}}),
    ],
  };
}

function founding(state) {
  const research = state.route === 'researcher';
  return {
    addition:'周曼宁把签字页翻过来，问第一批工资从谁的账上出。她还要把谁能叫停一项有争议的技术决定写进文件。你看着手边的预算，把能投的钱和家里不能拿去担保的开支分成两栏。',
    people:[person('周曼宁','帮几位合伙人核对投资与退出条款的律师')],
    choices:[
      decision('接受外部投资，先把表决和退出写清','成立公司，按阶段投入资金；让出一部分股权和重大事项决定权，给创始人与员工写明归属条件。',[1,-1],result('公司成立，意见不再只算你的','你们签下合伙文件，公司开始招聘。董事会保留对追加预算的表决权，合伙人离开时怎样处理未归属权益也有了约定。开局多了支持，往后不能只凭一句“我来负责”花钱。',{money:10,leadership:5,control:-12,stress:4},['company_board_terms','founded_company','counterfactual']),{cost:{money:-8},route:'company'}),
      decision('先合伙接单，核心技术共同持有','成立小工作室，以两份范围有限的合同起步；共享已有成果，客户定制部分另外约定。',[-1,-1],result('第一份合同小，权属写得很细','你们把核心代码和客户交付分开列清。钱只够下一段租金，搭档却知道退出时能带走什么。暂时没有人需要为一个尚不存在的大团队发工资。',{money:5,engineering:4,bonds:5,control:3},['company_small_contracts','small_studio','counterfactual']),{cost:{money:-4},route:'studio'}),
      decision(research?'留下带联合项目，签一年任务书':'留下组建团队，先争取正式权限',research?'向项目负责人申请一年任务书，约定设备、学生指导和经费边界。':'向雇主申请小组编制和奖金条件，把技术范围与汇报关系写进任务书。',[-1,1],result('承诺留在可批的范围内',research?'你留下来主持一段联合研究。项目书明确哪些工作已获经费，哪些还只是申请；学生不会因为一句口头承诺就自动有了下一年的位置。':'公司批下一个小组的试点范围。你仍是雇员，采购和招聘各有审批人；换来的稳定收入，也意味着重大路线不能由你独自决定。',{money:7,leadership:6,control:-6},['org_internal_charter','counterfactual']),{route:research?'researcher':'employee'}),
    ],
  };
}

function resetContract(state) {
  const company = state.route === 'company';
  const research = state.route === 'researcher';
  const who = company ? '世嘉' : research ? '联合实验室' : state.route === 'employee' ? '需求部门' : '合作客户';
  return {
    addition:`${who}愿意再谈一次。新发来的清单问到了已经花掉的款项怎么结算，下一版交到什么程度才算通过。如果还没跑通，对方要在签字前知道谁来收尾。`,
    choices:[
      decision('终止旧范围，把结算和新接口分开谈',`列清已经完成和需要停止的工作，请${who}分别确认结算与下一轮接口；会失去一部分预期收入。`,[1,-1],result('旧承诺有了终点',`${who}接受一份缩小的收尾清单。你们放弃尚未交付的收入，换来可以重新验证的接口。没人保证下一单，但旧项目不再无限占着同一批人。`,{money:-4,engineering:6,stress:-5,reputation:-2},['partner_reset_contract'])),
      risk('改成分段付款，只承诺一个可验的样品',`请${who}先支持最小验证，再按验收决定下一段款项。首期失败，后续资金就不会到。`,[-1,1],'communication',.61,[
        result('首期验证费谈下来了','双方把样品、验收日期和不通过的处理方式列清。第一笔款够做验证，做大之前仍需对方再次确认。',{money:9,bonds:4,control:-3},['partner_milestone_trial']),
        result('只给设备，不付预款','对方只愿意借测试条件。你保留了验证机会，工资和租金仍得另找来源。',{engineering:5,money:2,stress:5},['partner_milestone_limited']),
        result('分段方案也未通过','对方不同意继续承担风险。你停止为下一笔款安排工时，把失败条件和已交资料结清。',{money:-3,reputation:-3,stress:6},['partner_milestone_declined']),
      ],{effects:{energy:-4}}),
      decision('停掉旧接口，集中人手转向通用规范','拿已有证据申请重做，不同时保留两套完整路线；要承认之前的投入无法全部收回。',[1,1],result('旧路线不再继续加人',research?'你撤下不能移植的实验版本，把剩下的人和设备放到可重复的规范上。旧数据仍留档，但不再用学生的下一学期替它续命。':'你把旧接口列为只维护、不新增。团队腾出一部分人重做，销售或需求方必须重新安排交期；下一轮样品才能检验这个决定是否值得。',{engineering:8,energy:-5,money:-3,stress:3},['rd_standard_reset']),{cost:{money:-3}}),
    ],
  };
}

function production(state) {
  const company = state.route === 'company';
  const research = state.route === 'researcher';
  const canOrder = company || state.route === 'studio';
  const sample = company ? '芯片小批试产' : research ? '实验设备与复现环境' : '测试台与交付版本';
  const supplier = company ? '晶圆代工与封测伙伴' : research ? '共用机房' : '设备与服务供应方';
  const discount = state.flags?.rd_standard_reset ? 3 : 0;
  return {
    addition:company
      ? '许晨拿着代工和封测两边的报价来找你。小批试产能早点看出有多少芯片过不了测试，大批预订的单价则更低。代工和封测的生产线都在伙伴手里，你们得赶在确认期限前答复订多少、留多久做验证。'
      : `${supplier}在催下一轮排期。${sample}的验证结果还不齐，多订一段时间就要多付一笔费用，采购和资源分配都还有人要签字。`,
    people:[person('许晨',company?'负责对接代工、封测与交付的生产经理':'负责测试资源与交付排期的同事')],
    choices:[
      risk(company?'先做小批试产，过了良率再放量':'先做小批验证，通过再扩排期',`为${sample}保留一次返工机会，首批单价和等待时间都会增加。${discount?'停掉旧接口后，这次少了一部分兼容工作。':''}`,[-1,1],'engineering',.67,[
        result('小批先暴露了问题',company?'首批里有几项偏差，团队在大批投产前改好了。你们有了一份真实的良率记录，产量暂时还无法满足所有询单。':'测试发现一处环境差异，修正后才交给第二批使用者。验证过的范围更清楚，新增需求仍要排队。',{engineering:8,reputation:5,ecosystem:3},['supply_pilot_passed']),
        result('通过了一部分','一组条件通过，另一组仍不稳定。你只确认已经测过的部分，剩余排期要等补测。',{engineering:5,stress:4},['supply_pilot_delayed']),
        result('首批没达到门槛','返工吃掉这轮窗口。你取消尚未确认的扩量，把能重复的故障交给负责下一次验证的人。',{engineering:4,money:-3,reputation:-3,stress:7},['supply_pilot_delayed']),
      ],{cost:{money:-(9-discount)},effects:{energy:-4}}),
      risk(canOrder?'付预款，提前锁住下一批排期':'提交采购申请，提前锁定下一批排期',`向${supplier}${canOrder?'预订':'申请预订'}更长的使用窗口；需求没来，已确认的费用仍要承担。`,[1,-1],'communication',.58,[
        result('窗口保住了','排期确认，你能给下一位使用者更明确的日期。预付款暂时不能挪作别用，接下来得让需求赶上投入。',{money:5,reputation:7,engineering:3},['supply_reserved']),
        result('只订到一部分','供应方只确认一半窗口。你按确认量答复客户或使用者，不能照原计划排满下一季。',{money:2,stress:4,engineering:3},['supply_reserved_partial']),
        result('需求与排期错开','排期到了，原定使用者却延后。部分费用无法退回，你把剩下的窗口重新开放申请。',{money:-5,stress:7,ecosystem:2},['supply_idle_capacity']),
      ],{cost:{money:-12},effects:{energy:-3}}),
      decision('把质量放行交给测试负责人','让独立复核的人签字，销售和项目负责人不能跳过失败项；这批交付可能晚一周。',[-1,0],result('这次不是你说能发就能发','负责人划掉一项未通过的承诺。你接受延后，把限制告诉使用方；少接一单，却留下了别人也能执行的放行办法。',{reputation:4,engineering:5,control:-6,stress:-3,money:-2},['supply_quality_gate','org_quality_owner'])),
    ],
  };
}

function channels(state) {
  const owner = ['company','studio'].includes(state.route);
  const research = state.route === 'researcher';
  const limited = Boolean(state.flags?.supply_pilot_delayed);
  const reserved = Boolean(state.flags?.supply_reserved);
  return {
    addition:owner
      ? '大客户愿意预订长期供货，条件是自己的订单始终排在前面。手上还有其他渠道可以卖同一款产品，钱回来得慢些，也少做一家专用的改动。客户催着答复，团队则在等一个能自己安排交期的人。'
      : research?'一家合作机构愿意多出经费，条件是先用这套实验成果。另一组研究者来问能否一起复测，结果公开。评审快到了，学生想知道遇到问题该直接找谁。':'一个大业务方愿意增加预算，条件是需求优先排期。主管打算让你多带一块工作。原组先问，临时任务挤进来时，谁有权把它退回去。',
    choices:[
      risk(owner?'签有期限的优先合作，换稳定订单':research?'接受有期限的联合资助，写清发表日期':'争取大项目预算，签有限的优先排期',limited?'先披露上批未解决的问题，只承诺已通过验证的范围。':reserved?'用已经确认的排期谈订单，优先权到期后重新评审。':'约定期限与验收范围，不把所有未来工作无限交给一家。',[1,1],'communication',limited?.48:.63,[
        result('优先权有了截止日','对方接受有限期的优先安排。预算稳定下来，其他使用者需要等一等；到期之后，你可以重新选择是否续约。',{money:reserved?15:11,reputation:5,ecosystem:-3,control:-4},['partner_exclusive']),
        result('先签一个短试点','对方没有给长期承诺，只肯先试一个周期。你获得一小笔支持，也要多写一份阶段报告。',{money:5,stress:4,communication:3},['partner_exclusive_trial']),
        result('条件没有谈拢','对方要求更长的限制，你没有签字。现金或经费少了一条来源，其他合作仍可以继续谈。',{money:-2,stress:5,ecosystem:2},['partner_exclusive_declined']),
      ],{effects:{energy:-4}}),
      decision(owner?'保留多家合作，不签全面独家':research?'让两所机构共同验证，保留发表权':'把资源分给两个业务方，共用一套接口','统一验收与支持规则，接受协调更多人、短期收入较少的代价。',[-1,-1],result('两份计划共用一张规则表','两方都没有包下全部资源。需求冲突要逐项排期，你也保留了调整方向的空间；不再有一家愿意替全部成本买单。',{ecosystem:8,communication:5,energy:-4,money:3,stress:3},['partner_open_channels'])),
      decision('设项目负责人，把预算和功劳一起交下去',owner?'按项目明确交付与招聘权限，你保留跨项目的预算评审。':research?'让不同课题各有负责人，写清经费、指导责任与署名。':'向主管提交分工方案，让实际负责交付的人获得对应权限和晋升证据。',[-1,0],result('名字写在责任旁边','三项工作各有一个能答复的人。你不再批准每笔小开支，也不能在结果出来后把所有功劳收回自己名下。',{leadership:8,bonds:5,control:-9,energy:3},['org_project_owners'])),
    ],
  };
}

function organization(state) {
  const company = state.route === 'company';
  const research = state.route === 'researcher';
  const tools = company ? '计算工具和驱动' : research ? '公开实验工具' : '共用工具与文档';
  const conflict = Boolean(state.flags?.partner_exclusive);
  return {
    addition:`几个团队各自修过一次${tools}的安装错误，改动却没合回同一份代码。何佩玲把问题单翻给你看：“下个版本已经排上了。写文档、测兼容、回用户的问题，我从哪儿调人？”工时表上没给这几件事留位置，预算也还没人签。`,
    people:[person('何佩玲','负责工具维护、希望获得正式排期的工程师')],
    choices:[
      decision('设共用工具团队，给维护留正式预算',`${company?'以 CUDA 时代的计算工具投入为背景，':''}从产品功能中抽出少量人手维护工具。${conflict?'先剥离优先客户出资的专用部分，不能直接拿去公开。':'安装、文档和兼容问题都算正式工作。'}`,[1,1],result('维护第一次有了负责人','工具团队接下安装与兼容清单。产品少做一项新功能，外部或邻组的反馈却开始有人稳定回复；下一轮研究可以从已有工具上继续。',{engineering:6,ecosystem:10,energy:-4,control:-4},['rd_shared_tools']),{cost:{money:conflict?-11:-8}}),
      decision('减少汇报层级，直接做跨组技术评审','重要技术问题让负责人当面讨论；取消一层转述，也会占用你更多会议时间。',[-1,1],result('坏消息来得更快，会议也变长了','工程师不必先写三遍汇报，问题直接进了同一场讨论。你能更早发现冲突，却要亲自决定哪些议题值得大家一起停下工作。',{engineering:5,communication:5,control:4,energy:-6,stress:4},['org_flat_review'])),
      decision(research?'让课题组各自掌握小额经费':'让部门负责人管预算，定期对账','给负责人一个有上限的预算和停止条件，跨组冲突再拿到共同评审。',[-1,-1],result('不是每个决定都等你回来','负责人批下第一笔试验开支，做法与你原先设想的不同。你检查的是结果和支出范围，不再替他们逐项安排方法。',{leadership:8,control:-10,energy:5,stress:-3},['org_delegated_budget']),{cost:{money:-4}}),
    ],
  };
}

function researchDirection(state) {
  const f = state.flags || {};
  const researcher = state.route === 'researcher';
  const owner = ['company','studio'].includes(state.route);
  const toolDiscount = f.rd_shared_tools ? 3 : 0;
  return {
    addition:'合作方想照论文的方法处理同一批数据，程序得有人维护，机器也要能连着用。眼下，低功耗项目的测试还占着设备，给新实验腾时间就会推迟原来的一项交付。对方已经在问，这次合作能做到第几轮，结果对不上时谁接着查。',
    choices:[
      risk(researcher?'联合另一所实验室复现结果':owner?'给研究合作一笔有期限的预算':'申请小额预算，与研究团队共同复现',`先规定复现任务、数据与计算条件，暂不承诺量产。${toolDiscount?'已有工具团队，能减少这一轮准备开支。':''}`,[1,1],'engineering',f.rd_shared_tools?.68:.60,[
        result('合作拿出了可重复结果','另一组在自己的条件下完成验证。你们有了继续讨论的依据，也有了下一年仍需要维护的程序；它还不是一份盈利保证。',{engineering:9,ecosystem:9,reputation:4},['rd_research_grants']),
        result('有进展，条件还不够齐','一部分结果复现了，另一部分受设备和数据限制。你把差异写清，后续预算只覆盖补做的范围。',{engineering:6,ecosystem:4,stress:4},['rd_research_partial']),
        result('这轮没有复现','计算用完了，结果仍不一致。你按约结束这轮资助或申请，不把差异藏进一张漂亮曲线；程序和问题记录留给后来的人。',{engineering:4,reputation:-2,stress:6},['rd_research_failed']),
      ],{cost:{money:-(10-toolDiscount)},effects:{energy:-4}}),
      decision('保留两支小队，先比较训练与低功耗方案','分别给两条路线一个负责人、相同的截止线和停止条件；不承诺两条路都会扩张。',[-1,1],result('两组都开工，也都可能被叫停',f.org_delegated_budget?'已有预算权限的负责人分别带队。你按约只处理共享设备冲突；下一轮扩张要由结果决定。':'你临时组了两支小队，第一周就为同一台机器排了两次会。方向都留住了，协调工作也实实在在落在你身上。',{engineering:8,ecosystem:4,leadership:4,energy:f.org_delegated_budget?-2:-6,stress:f.org_delegated_budget?2:5},['rd_two_tracks']),{cost:{money:-6}}),
      decision(researcher?'先完成已资助课题，留出之后的复现窗口':'先做能收款的低功耗方案，列出复查日期','继续服务已有需求，保留一次重新看新方向的评审；这轮可能错过外部合作。',[1,-1],result('旧承诺兑现，新方向先等一等','现有工作得到明确排期，资金或经费暂时稳定。你把新方向的评审日期留下，但别的团队不会停下来等你。',{money:11,engineering:5,ecosystem:-3,stress:-2},['rd_mobile_contract'])),
    ],
  };
}

function cooperation(state) {
  const company = state.route === 'company';
  const employee = state.route === 'employee';
  const research = state.route === 'researcher';
  const f = state.flags || {};
  const ready = f.rd_research_grants || f.rd_shared_tools;
  return {
    addition:company
      ? '研究机构来问能不能一起验证系统，云服务商则想把算力租给客户。直接做整机交付也得留住集成的人。无论哪家先拿到资源，合同都得写明运行出了问题谁来处理。'
      : employee?'业务部门想把算力放进共享服务，研究组已经来问能留多少试验名额。采购和对外销售还得由公司批，系统整合也还没人领。':research?'合作实验室想共用设备，云服务商开的是按量使用的报价。机时要安排给两边的复测，谁出经费、谁留下来维护安装环境，还得写进使用约定。':'研究团队来约复测，云服务商也来问能租到哪些机时。你能答复的是自己的服务和排期，原公司与合作伙伴的机器得由他们各自确认。',
    choices:[
      risk(company?'和研究机构联合验证一套系统':'与研究团队共用资源，交换复现与维护',`约定设备或服务的使用范围，研究成果与维护贡献分别署名。${ready?'此前留下的工具或研究合作能接上第一轮测试。':'需要重新准备运行说明和维护人手。'}`,[1,-1],'ecosystem',ready?.69:.58,[
        result('实验跑通，支持也留了下来','合作方复现了第一轮任务，并交回问题记录。下一轮请求跟着到来，你们按约定范围处理，不能把长期维护当作一次赠送就结束。',{ecosystem:14,reputation:6,bonds:4},['partner_research_system']),
        result('设备到了，结果还没出来','环境调试比预计慢。双方公开了能复现的部分，余下问题保留负责人和截止日期。',{engineering:5,ecosystem:6,energy:-4},['partner_research_system_partial']),
        result('资源没有按时配齐','交付条件未满足，合作暂时缩小。你及时说明缺口，先把对方已完成的贡献记清。',{ecosystem:2,reputation:-3,stress:7},['partner_research_system_delayed']),
      ],{cost:{money:ready?-6:-9},effects:{energy:-4}}),
      decision(employee?'申请接入共享云服务，按用量分摊成本':research?'租用云端时段，和另一组共用复现说明':'与云服务商合作，先通过伙伴触达用户','把交付和支持边界写清。少承担一次自建投入，也要接受渠道分成、服务规则与伙伴排期。',[-1,1],result('使用者不必等你的机房开门','第一批任务按约定进入共享服务。覆盖面变大，关键排期却多了一位需要协调的伙伴；用户遇到问题时，双方都要照清单负责。',{money:5,ecosystem:8,communication:4,control:-6},['partner_cloud_channel']),{cost:{money:-4}}),
      decision(company?'保留整机团队，自己把交付做到底':research?'留下系统维护岗位，把实验环境自己管好':employee?'申请负责系统集成，补齐维护与值守':'做系统集成项目，明确售后范围','把计算、网络、供电和软件接成可使用的整体；接下的不只是性能指标，还有维修和培训。',[1,1],result('系统之外，还有一份值守表','你留下了负责整合的人，交付清单多了培训、故障排查和维护安排。少依赖一个中间环节，也多了一项不能临时甩开的工作。',{engineering:8,leadership:5,reputation:4,stress:5,energy:-5},['rd_system_team']),{cost:{money:-10}}),
    ],
  };
}

function nextProduction(state) {
  const company = state.route === 'company';
  const research = state.route === 'researcher';
  const f = state.flags || {};
  const delegated = f.org_delegated_budget || f.org_project_owners;
  const quality = f.supply_quality_gate;
  const who = company ? '代工、封装与内存伙伴' : research ? '设备方与共用机房' : '设备与服务伙伴';
  return {
    addition:company
      ? '采购会上，晶圆、先进封装和高带宽内存的到货日还没排齐。台积电等伙伴各有自己的生产线，付预付款也没法让三边一起提前。质量复核没结束，下一轮产能又快到确认日，采购的人还在等谁能签字。'
      : `${who}发来了下一轮报价。新系统能跑得更快，安装和维护要占更多人天，设备也还得等采购批准。下一年的表上，接手的人和能交付的数量都没填。`,
    sources:['company-manufacturing-2024','company-blackwell-2024'],
    choices:[
      risk(company?'分阶段锁封装和内存，预留另一套方案':'分阶段预订设备与服务，留一个备用方案',`分别核对${who}能确认的窗口，再支付阶段预款。${f.partner_cloud_channel?'云合作方愿意合并需求，也会要求分享下一轮优先排期。':'需求下降时，一部分承诺仍不能取消。'}`,[1,-1],'communication',.60,[
        result('关键窗口对齐了','伙伴确认了分阶段的交付安排。你用一笔不能随时取回的预款换来更确定的日期，下一年的销售或项目收入仍需自己兑现。',{money:7,reputation:8,ecosystem:5,control:-4},['supply_capacity_plan','company_next_committed']),
        result('只确认到一部分','一个环节先到位，另一个仍需等候。你调整交付数量，保留备用方案，不把未确认的日期写成保证。',{engineering:4,money:2,stress:6},['supply_capacity_partial','company_next_staged']),
        result('预订与需求没有合上','排期和需求再次错开，已经付出的部分费用收不回来。你停止追加承诺，把下一轮计划收缩到可以承担的规模。',{money:-5,reputation:-3,stress:9},['supply_capacity_mismatch','company_next_reduced']),
      ],{cost:{money:-14},effects:{energy:delegated?-3:-6}}),
      decision(company?'推迟扩量，先修良率与系统验证':'推迟扩排期，先修稳定性与维护问题',quality?'沿用独立放行制度，把未通过项逐一交回负责人。订单或项目可能转走，不能把问题带进更大规模。':'补上独立复核，把未通过项和预计修复日期告诉合作方。短期少交一批，保留返工时间。',[-1,1],result('新的日期有了验证依据',company?'你把一批未确认的量撤回，生产伙伴按新的验证结果重排。部分客户选择了别的方案，留下的交付不再依赖团队隐瞒问题。':'你延期了一部分使用窗口，先修了重复出现的故障。有人改用别的服务，接手的人终于能照维护说明独立处理问题。',{engineering:8,reputation:3,money:-3,stress:quality?-5:-2,control:-3},['supply_quality_first','company_next_reliable']),{cost:{money:-6}}),
      decision(delegated?'任命下一位负责人，交出日常预算':'先设一季共同负责，再决定正式接任',delegated?'让已经独立带过项目的人负责排期与预算，你只保留约定的复核事项。':'目前还没有人完整承担过这些权限。先交一个可承受的小范围，写下试任评审和失败后的回退办法。',[-1,-1],result(delegated?'会照常开，你可以不在场':'交班从一个能核验的周期开始',delegated?'新的负责人重排了会议和采购顺序。你接受对方的方法，把固定晚饭留在日历里；重大变更仍按书面的复核规则处理。':'你交出一部分排期和预算，保留共同复核。下一位还需要实践，你也不能一边让人负责，一边把每项决定抢回来。',{leadership:delegated?10:6,bonds:5,control:delegated?-13:-7,energy:delegated?6:1,stress:delegated?-8:-3},[delegated?'org_successor_ready':'org_successor_trial','ending_handoff',delegated?'mentored':'handoff_in_progress'])),
    ],
  };
}

const BUILDERS = {3:promotion,4:founding,5:resetContract,6:production,7:channels,8:organization,9:researchDirection,10:cooperation,11:nextProduction};

export function enrichCompanyScene(original, state) {
  if (state.storyEdition !== '2026.11' || !BUILDERS[state.step]) return original;
  const extra = BUILDERS[state.step](state);
  const echo = careerEcho(state);
  const sourceIds = [...new Set([...(original.fact?.sourceIds || []),...(extra.sources || []),...(state.step === 10 ? ['company-dgx-2016'] : [])])];
  const sourceNote = state.step === 11
    ? ' NVIDIA 公开披露采用无晶圆厂制造模式，并在2024年披露为改善 Blackwell 良率修改掩膜。这里的产能、质量、任命与合同决定均为平行剧情，不描述真实未公开交易。'
    : ' 新增的岗位竞聘、组织分工、研发预算与合作条款是黄二勋的虚构选择；涉及公开公司与产品的事实只作时代背景。';
  return {
    ...original,
    ...(extra.title ? {title:extra.title} : {}),
    story:[original.story,extra.addition,echo,lifePressure(state)].filter(Boolean).join('\n'),
    people:[...(original.people || []),...(extra.people || [])],
    choices:[...original.choices,...extra.choices].slice(0,6),
    mission:{...(original.mission || {}),objective:'选定这一次要承担的工作、合作或研发安排，并接受相应的权限、预算和时间代价。',deliverable:'一份能执行的决定：说明负责人、承诺范围和下一次检查条件。'},
    fact:{...(original.fact || {}),text:(original.fact?.text || '')+sourceNote,sourceIds},
    ...(echo ? {echo:[original.echo,echo].filter(Boolean).join(' ')} : {}),
  };
}

const prepare = (title,description,axes,effects,flags,prepTags,details={}) => ({title,description,axes,effects,flags,prepTags,...details});
const futureYears = {12:2026,13:2028,14:2032,15:2036};

function futureContext(state) {
  const company = state.route === 'company';
  const researcher = state.route === 'researcher';
  const employee = state.route === 'employee';
  return {
    company,researcher,employee,
    team:company?'经营团队':researcher?'课题组':employee?'所在部门':state.route==='sold'?'顾问合作团队':'工作室',
    approver:company?'独立董事':researcher?'项目监督委员会':employee?'主管和人事':'共同签约的合作方',
    title:company?'经营与研发职责':researcher?'研究与指导职责':employee?'岗位与项目职责':'合同与项目职责',
  };
}

function governance2026(state) {
  const c=futureContext(state);
  const f=state.flags||{};
  const ready=f.org_successor_ready||f.org_delegated_budget||f.org_project_owners||f.mentored;
  const life=state.life||{};
  const close=paired(life)?`你与${partnerName(life)}谈过的私人边界`:'你与亲近的人谈过的私人边界';
  return {
    title:'私人的事之后，工作怎样交代',
    story:`2026 年的公开消息提到了私人失信、独立调查和高管交接。在黄二勋这条虚构人生里，${c.team}也开始查自己的审批记录。会上有人问，眼下的合作要不要申报，和你有关的审批是不是得换个人签。也有人怕换了签字人，已经在做的项目就要停下来。\n${c.approver}要看你手里有哪些工作和审批，还要留存相应的原始记录。${ready?'以前独立带过项目的人已经能接几项。':'眼下还没人能一次把你的工作全接下来。'}${close}仍由你们自己商量。工作上的问题，你得自己回答。`,
    prepTitle:'先把需要分开的事写清',
    prepStory:'几份合同仍等着签字，原始记录也还要留存。独立复核没有结束，眼下能交代的是你参加过哪些决定、哪些权限还在你手里。',
    prep:[
      prepare('把合同和审批记录交给独立复核','保留原始记录，列清自己参与过的决定；由独立的人判断是否需要回避。',[1,-1],{engineering:3,communication:3,energy:-3},['future_review_records'],['evidence']),
      prepare('请能接手的人逐项确认职责','从客户答复、设备排期到支出签字，一项一项写上实际负责人。',[0,-1],{leadership:6,control:-4,energy:-3},['future_handoff_inventory'],['plan']),
      prepare('把私人回应和工作说明分开','只核对自己能确认的工作事实，不替伴侣、家人或同事决定他们要说什么。',[-1,1],{communication:5,bonds:3,stress:-3},['future_private_boundary'],['listen']),
    ],
    choices:[
      decision('接受独立复核，暂时回避相关决定',`由${c.approver}确认回避范围，让其他负责人处理相关合同；你继续完成不涉及冲突的工作。`,[-1,-1],result('权限先交出去，结论继续等','你移交了相关审批，留下可以核对的记录。项目按新的签字人继续，复核尚未完成；失去一部分控制权，也不等于私人关系已经修复。',{control:-12,reputation:2,stress:3,energy:ready?1:-4},['future_governance_independent','future_role_restricted'])),
      decision('退出本轮管理，按清单完成交接',`结束正在承担的管理任期，由${c.approver}安排临时负责人；合同、工作待遇和后续任职另行协商。`,[-1,1],result('日常会议不再等你','你交清已经承诺的工作，退出这一轮管理。下一份岗位还没有着落，收入减少，日历却第一次出现可重新安排的空白。交接不能替代还需要面对的私人谈话。',{money:-6,control:-16,energy:7,stress:-4,reputation:-3},['future_role_exit','future_handoff_done'])),
      decision('保留技术职责，把合作审批交给别人','申请只负责可核验的技术工作，不参与与自己有关的合作选择；任职边界需要获得批准。',[1,0],result('留下的是一项具体工作',`${c.approver}同意一个有期限的技术安排。你不再参加相关合作的审批，下一轮是否继续，仍要看工作结果与正式评审。`,{engineering:6,control:-8,leadership:-2,energy:-2,stress:2},['future_role_technical','future_governance_independent'])),
      decision('先停下新增承诺，保留最低限度的工作','不接新的合作或管理任务，完成已签的收尾工作，给私人生活与下一步打算留时间。',[-1,-1],result('没有再往日历里加一件事','你把新的邀请逐一退回，收入和影响力都少了一部分。已经答应的收尾仍按时完成；空出来的时间能否改善生活，还要靠接下来怎样使用。',{money:-4,energy:9,stress:-6,reputation:-4},['future_pause_growth','future_room_to_choose'])),
    ],
    fact:{text:'2026年11月10日，NVIDIA独立董事公布独立调查安排；11月12日公告黄仁勋辞去总裁、CEO与董事职务，Colette Kress兼任临时CEO。公告不等于调查结论。这里的黄二勋、职责复核与私人生活均为独立虚构，玩家不被强制复制现实人物的选择。',sourceIds:['company-review-2026','company-transition-2026']},
    echo:ready?'以前交出去的权限，如今有人能真正接住。':'这次交接需要从具体任务开始，不能只换一个头衔。',
  };
}

function direction2028(state) {
  const c=futureContext(state);
  const f=state.flags||{};
  const exited=f.future_role_exit||f.future_pause_growth;
  const trusted=f.future_governance_independent||f.future_handoff_done;
  const opening=exited?'这两年你没有再接原来的管理任期，手上只剩已经说清范围的工作。':'这两年你的职责缩小了，技术和管理也不再默认捆在一起。';
  return {
    title:'下一份工作，还要和从前一样吗',
    story:`${opening}老同事来问一个小型计算项目，学校也来信问你愿不愿意带一门短课。${c.team}手上那项技术任务也还等着你回话。\n你拿了张纸，写下每月得花的生活费，再翻日历看看一周有几天真的能空出来。学校问的是你哪天能到，老同事问的是第一轮能投多少。`,
    prepTitle:'先试一个小范围',
    prepStory:'老同事问你什么时候有空详谈，学校还等着你回信。账上能投进新项目的钱有多少，得等这几个月的生活开支算清才知道。',
    prep:[
      prepare('拿真实任务检验自己的手艺','重做一个小实验，写清能完成的部分和需要别人帮助的地方。',[1,1],{engineering:7,energy:-4},['future_skills_refreshed'],['evidence']),
      prepare('重算一年生活费和可投入预算','把家庭与个人开支放在前面，项目只使用明确可以承担损失的部分。',[-1,-1],{money:5,stress:-4},['future_runway_budget'],['plan']),
      prepare('分别听老同事、学校与家人的条件','问清合作期限、课程责任和相处安排，不让一方替另一方答应。',[0,1],{communication:6,bonds:4,energy:-3},['future_options_heard'],['listen']),
    ],
    choices:[
      decision('继续做技术，签一份有边界的职责书',exited?'重新申请一项技术岗位或项目，不把旧头衔当成自动通行证。':'续签具体的技术职责，保留对关键问题的投入，把日常管理交给已经负责的人。',[1,1],result('工作仍然值得做，范围写得更清楚','你接下一项能核验的技术任务，收入继续，但不再承诺随时处理所有人的问题。对方按结果评估你，过去的资历不能替这一次交付签字。',{money:8,engineering:7,control:-3,energy:-3},['future_technical_path']),{route:c.researcher?'researcher':state.route==='sold'?'employee':state.route}),
      decision('重新组一个小团队，先找第一位付费客户','拿出有限预算，先验证客户愿不愿意付款。保留原生活开支，合伙人也可以拒绝加入。',[1,-1],result('这回从一张小报价开始','你和愿意同行的人列了三件能做的事，只报其中一件。新工作室成立，首个项目还没收款；所谓重来，目前只是重新面对需求和账单。',{engineering:5,communication:4,control:6,stress:4},['future_restart_plan','future_new_studio']),{cost:{money:trusted?-8:-11},route:'studio'}),
      decision('回学校，从短期课程与合作研究做起','提交课程和研究计划，接受同行评审，不把曾经的职务当作终身教职。',[-1,1],result('第一份课表只有一门课','学校给了一段有期限的合作。你要备课、指导和解释研究方法，收入比以前少；学生的问题也不会因为你的履历就变简单。',{engineering:6,leadership:4,ecosystem:3,money:-3,energy:-3},['future_academic_path']),{route:'researcher'}),
      decision('先给自己一年，工作只保留必要收尾','不争取新职位，把收入降低后的日常安排说清；可以学习、陪伴或休息，不必马上决定余生。',[-1,-1],result('这一年不急着填满','你保留了已经答应的收尾，推掉新的长期任务。收入下降，空闲增加；家人和朋友仍有自己的安排，这一年需要你亲自过。',{energy:10,stress:-8,money:-5,reputation:-3},['future_personal_year','future_room_to_choose'])),
    ],
    fact:{text:'2028年是由玩家选择形成的虚构未来，不是新闻、预测或对现实人物职业与家庭的推断。岗位、创业与教学条件均为本局设定。',sourceIds:[]},
    echo:trusted?'上一轮留下清楚的交接记录，新的合作方可以核对你已经承担过什么。':'新的合作需要从当前能力、边界和具体条件谈起。',
  };
}

function execution2032(state) {
  const c=futureContext(state);
  const f=state.flags||{};
  const restarting=f.future_restart_plan;
  const academic=f.future_academic_path||c.researcher;
  const windingDown=f.future_personal_year||(f.future_role_exit&&!academic&&!f.future_technical_path);
  const capable=f.future_skills_refreshed||f.rd_shared_tools||f.supply_quality_gate;
  const life=state.life||{};
  const protectedTime=life.workBoundary==='protected';
  return {
    title:restarting?'新团队得靠哪一单活下去':academic?'把研究做成别人也能接着做的事':'四年过去，这次让谁真正负责',
    story:restarting
      ?'工作室的报价终于有人回了。客户愿意拿一批自己的计算任务试节能调度软件。程序把任务分给还有余量的机器，暂时用不到的节点降到低功耗。客户会拿同一批任务跑现用系统和试用版，看两边分别耗多少电、多久跑完。\n客户验收后才付试用款，设备商却要先收预付款才留测试台。验收日已经写进草案，许晨问：“如果还得返工一轮，钱够发到哪天？”'
      :windingDown
        ?'你把原来答应做完的事留在手边，没有再接长期管理。旧委托方还有一项节能调度试验要收尾。他们愿意借出一段机时，用同一批任务补测用电和运行时间，之后要能按安装说明自己重跑。\n林秋雯拿来的确认单已经写了余款和还设备的日期。最后一轮通过以后，谁收下代码、故障还能找你到哪天，双方还没签字。'
        :academic
          ?'合作实验室愿意给下一届学生一段机时，重跑你们的节能调度实验。他们会拿同一批任务比较两种运行次序，记录总用电和完成时间。学生离校前要交程序和安装说明，可说明上漏了软件版本，另一组装到一半就停了。\n下轮机时快到确认日了。实验室问，复测要是还对不上，谁能替学生查日志，学期开始以后由谁管代码和答疑。'
          :`试用部门想把节能调度软件装到自己的测试环境里。许晨和对方约好，用同一批任务比较现用版本和新版本的耗电、完成时间与维护成本。设备供应方给的到货日期晚于试用部门空出的验收窗口。再往后排，就得挪动已定的交付。\n设备、值班和这轮测试的开支都等着${c.approver}确认。许晨已经接下技术复核，还在等谁能签设备调拨和故障支持。`,
    prepTitle:'检查人、钱和下一次验收',
    prepStory:restarting
      ?'试用合同已经附了客户的任务清单，旧系统和试用版的耗电、用时还没填齐。设备商的测试台要等预付款才能留。客户收到完整记录后才验收，故障单上还没有写谁负责返工。'
      :windingDown
        ?'最后一轮试验还缺同批任务的用电和运行时间。旧委托方把还设备的日期写进了邮件，余款要等他们用交付的安装说明重跑一遍才确认。收代码的人和最后一次答疑的日期还空着。'
        :academic
          ?'合作实验室发来了可用机时。交接包里有程序和任务数据，安装说明却缺软件版本，两组的用电和运行时间也还没按同一批任务对齐。学生离校之前，得有人签收代码，后面出了错才知道把日志发给谁。'
          :`试用部门只在验收时开放自己的测试环境。设备到货日赶不上，耗电、用时和维护成本就凑不齐同一批任务的对照。设备方报了测试窗口和阶段款，费用谁签、故障谁接，还在等${c.approver}回话。`,
    prep:[
      prepare('让使用方重跑一次基准','核对成本、能耗与实际任务，保留没达到目标的结果。',[1,1],{engineering:7,energy:-4},['future_benchmark_checked'],['evidence']),
      prepare('请伙伴确认阶段付款和退出条件','只把已确认的资源写进排期，给预算留一个能停止追加投入的界限。',[-1,1],{communication:6,stress:-3},['future_staged_contract'],['ask']),
      prepare('让下一位负责人主持一次完整评审','自己旁听，记录哪些权力仍没有交清，不在会中替对方作每个决定。',[-1,-1],{leadership:7,control:-5,energy:3},['future_successor_rehearsal'],['plan']),
    ],
    choices:[
      risk(academic?'和伙伴共建可复用的研究平台':'与伙伴分段合作，继续已有研发方向','确认设备、软件和支持的边界，分两轮验收；不把合作伙伴的产线当成自己的资产。',[1,1],'engineering',capable?.68:.59,[
        result('第一轮交付站住了','使用方完成验收，伙伴确认下一阶段支持。团队可以继续做下去，也必须兑现后续维护；新的稳定来自合同和工作，不是热度。',{money:10,engineering:7,ecosystem:7},['future_platform_working']),
        result('项目缩成可维护的一部分','验收只通过一部分，双方把下一轮范围缩小。收入或经费有限，但没有为了保住规模而继续扩大承诺。',{money:4,engineering:5,stress:3},['future_platform_small']),
        result('这一轮合作没有继续','对方没有通过下一阶段预算。你按约停止追加，留下可使用的成果与支持终止日期，接下来必须重新安排工作。',{money:-4,engineering:3,reputation:-3,stress:7},['future_platform_stopped']),
      ],{cost:{money:-9},effects:{energy:protectedTime?-3:-5}}),
      risk(restarting?'把新团队的第一款产品真正交出去':'独立做一个小产品，重新验证能否谋生',restarting?'用已有的客户反馈锁定范围，留出返工资金；失败就先缩回小单，不拿家用补缺口。':'先做可承受的小规模交付，别借原团队的资产或名字替新项目作保证。',[1,-1],'engineering',restarting?.68:.48,[
        result('有人续了第二单','首轮验收完成，客户又订下一小批。团队仍不大，却开始靠交付自己挣钱；这次重新站起来，有一份能核对的订单作为证据。',{money:12,reputation:8,engineering:6,leadership:4},['future_rebuilt_product']),
        result('产品能用，暂时只够养小团队','有人付钱试用，续单还没确认。你把规模保留在两三个人能维护的范围，重新开始没有变成一场必须赢大的赌局。',{money:5,engineering:6,stress:4},['future_rebuild_small']),
        result('这款产品没找到足够需求','试用者没有续单，你停止扩招，按约结清费用。旧经验帮你完成了技术，仍没有替你找到市场。以后可以继续，也可以到这里为止。',{money:-4,engineering:4,stress:7},['future_rebuild_stopped']),
      ],{cost:{money:restarting?-8:-6},effects:{energy:-5},route:'studio',flags:['future_restart_attempt']}),
      decision(academic?'把课题和课程交给后辈共同主持':'交出日常预算，让下一位负责人独立做一轮','任命或推荐一位已准备好的负责人，明确授权和复核条件；自己的做法不再是唯一做法。',[-1,-1],result('接班人第一次不用等你确认',f.future_successor_rehearsal?'试过完整评审的人接下下一轮计划。你保留有约定的答疑时段，别人开始用自己的方法处理事情。':'你先交出范围较小的一段职责，保留一次阶段复核。不是所有问题都立刻消失，但下一次会议可以由别人召集。',{leadership:8,bonds:6,control:-12,energy:6,stress:-5},['future_successor_in_place','future_handoff_done'])),
      decision('不再扩张，把工作缩到一周两天','结清要停止的承诺，保留能够稳定完成的任务；把余下时间留给自己选择。',[-1,-1],result('规模变小，日程终于确定','你拒绝一部分收入或经费，把剩下的支持写成固定时间。伙伴可以另找人扩大项目，你也不再因为别人继续前进就追加自己的承诺。',{money:-4,energy:9,stress:-7,ecosystem:-2},['future_smaller_week','future_room_to_choose'])),
    ],
    fact:{text:'2032年全部属于虚构未来。技术、客户、生产合作、资金结果和任命随玩家选择产生，不陈述任何现实公司的未来产品或交易。',sourceIds:[]},
    echo:restarting?'2028年开始的小团队，现在要接受真实使用者的检验。':f.future_personal_year?'你曾给自己留过空白，这次也可以决定不把它重新填满。':'过去交出去的权限与留下的工具，会影响这次需要你亲自承担多少。',
  };
}

function ending2036(state) {
  const c=futureContext(state);
  const f=state.flags||{};
  const working=f.future_platform_working||f.future_rebuilt_product;
  const rebuilt=f.future_restart_plan&&(f.future_rebuilt_product||f.future_rebuild_small);
  const tried=f.future_restart_plan||f.future_restart_attempt;
  const academic=f.future_academic_path||c.researcher;
  const delegated=f.future_successor_in_place||f.future_handoff_done||f.org_successor_ready;
  const life=state.life||{};
  const companion=paired(life)?`和${partnerName(life)}`:'和仍常来往的人';
  const retirement=delegated?'已有负责人接过日常事务，你只需完成约定的最后交接。':'还没有完整接班安排，退休要先分批终止或移交任务，不能一夜离场。';
  return {
    title:'73岁，最后这张日历由你来排',
    story:`2036 年，你七十三岁。${working?'这些年留下的项目还在运转，有人来问你要不要继续做。':tried?'这几年试过的项目，有的留下了，有的已经停了。':'手上的工作，一部分交给了别人，一部分已经结束。'}桌上是下一轮计划、学校的来信，还有编辑寄来的传记提纲。\n日历上还有几天空着。你想${companion}约一天，也想拾起一直往后推的兴趣。下一轮计划书已经标出了几个要你到场的日子。`,
    prepTitle:'把没有交代完的事先写下来',
    prepStory:'手上最后几份合同还有余款和交接日期要确认。家人朋友也等着你回话，你把已经答应他们的时间留在日历上。',
    prep:[
      prepare('核对余款、日常开支和最后的合同','不把尚未收到的钱当作已有收入，也不把工作伙伴默认列为免费接班人。',[-1,-1],{money:4,stress:-4},['future_final_accounts'],['plan']),
      prepare('听一听下一位负责人和家人的打算','先问他们愿意承担什么，再决定自己还能承诺什么；允许他们选择不同的生活。',[0,-1],{bonds:5,leadership:4,control:-3},['future_final_listening'],['listen']),
      prepare('整理这些年可以核对的记录','把做成、没做成和仍有分歧的事分别留下；写传记或继续研究都需要诚实的材料。',[1,1],{engineering:4,reputation:3,energy:-3},['future_final_archive'],['evidence']),
    ],
    choices:[
      risk('继续奋斗，把现有方向再做一轮',working?'已有项目能继续支持团队。只接下一段研发或交付，把自己无法承担的职责交清。':'把还在做的工作缩成一个可以承担的周期；继续投入不意味着自动重回过去的规模。',[1,1],'engineering',working?.70:.54,[
        result('还有一项工作值得继续','下一轮按计划启动，伙伴愿意继续承担各自的部分。你仍会为了一个难题早起，但日历只签这一段，没有替往后每一年作保证。',{engineering:7,reputation:6,energy:-4,stress:4},['future_building_sustained']),
        result('继续做，规模比原计划小','支持只够一部分工作。你砍掉多余目标，留下自己还能做完的那一项；奋斗没有终止，也没有把所有人的日子一起押上。',{engineering:5,money:3,stress:4},['future_building_small']),
        result('下一轮没有按设想启动','资源没能凑齐，你没有宣布一个虚假的胜利。你继续做已有范围内的技术或指导工作，把尚未实现的计划留作未完，而不是成功。',{engineering:3,reputation:-2,stress:5},['future_building_unfinished']),
      ],{cost:{money:-6},effects:{energy:-3},flags:['future_keep_building']}),
      risk(rebuilt?'再搏一轮，让重建的事业站稳':tried?'换一个小目标，争取重新站起来':'再试一次小项目，从第一份订单开始',rebuilt?'前几年的客户和产品还在，扩大之前先确认现金与维护人手。':tried?'承认上一轮的结果，把范围缩到还能承担的项目；过去失败不保证这次会成功。':'先以一个人的小项目试水，不把第一次尝试写成已经东山再起。',[1,-1],'communication',rebuilt?.68:tried?.54:.42,[
        result(rebuilt?'重新站稳，不必长成从前的样子':'新的项目找到了愿意续单的人',rebuilt?'重建后的产品得到续单，团队靠收入维持下来。你确实从低处重新走起，事业比从前小，已经不需要借旧头衔证明它存在。':'有人为小项目付了款，也愿意继续合作。你迈出了重新开始的一步；是否能成为另一段长久事业，还要留给后面的日子。',{money:9,reputation:7,communication:5,stress:4},['future_comeback_working']),
        result('这回只做得起一个小摊子','项目有一点收入，暂时不够扩大。你接受有限的成果，把维护留在自己能承担的范围，重新开始没有自动变成重回巅峰。',{money:3,engineering:4,energy:-3},['future_comeback_small']),
        result('再试过，也接受这轮没有成','客户没有续单，项目按约停止。你结清还能结清的费用，没有再把私人生活垫进去。这次尝试留在经历里，不能被写成东山再起的成功。',{money:-3,engineering:3,stress:6},['future_comeback_unfinished']),
      ],{cost:{money:rebuilt?-8:-4},effects:{energy:-4},route:'studio',flags:['future_comeback']}),
      decision('颐养天年，逐项结束长期工作',`${retirement}以后主要按自己的生活需要安排时间。`,[-1,-1],result('往后的日子不再围着工作排',`你${delegated?'完成最后约定的交接':'逐项移交或结束尚在负责的任务'}，不再接受新的长期职责。${companion}吃饭、散步或保持联系，要重新约具体的日子；退休没有替所有关系画上圆满，只让这些事有了更多时间。`,{energy:12,stress:-10,money:-3,control:-8},[]),{flags:['future_retire']}),
      decision(academic?'回到学术，把课和研究慢慢做下去':'重回学术，从旁听、课程与短期合作开始',academic?'保留有期限的教学与研究，接受同行检验，把指导任务控制在自己能承担的范围。':'联系愿意接收的学校或研究团队，从可完成的任务申请，不把从前职务换成自动授予的教职。',[-1,1],result('问题重新写在黑板上',academic?'你留下每周的课程与一项有边界的研究，把更多主持机会交给年轻同行。学生不必复制你走过的路，你也仍然需要承认不知道的事。':'学校接受一段小范围的课程或合作申请。你先从备课和阅读做起，没有自动获得终身教职；新的问题比旧头衔更值得占据这一页。',{engineering:7,ecosystem:4,leadership:3,money:-3,energy:-3},[]),{route:'researcher',flags:['future_academic']}),
      decision('培养新爱好，允许自己从新手开始','选一门负担得起的课程或固定练习，给它留出几个普通下午；不把兴趣再变成一家公司。',[-1,-1],result('这一回，做得普通也可以继续','你按时参加第一次练习，发现熟练需要重新积累。工作只保留必要的收尾，其余下午可以做饭、打球、写画或学别的事；没有人要求这一项爱好最后必须成功。',{energy:9,stress:-8,reputation:-2},[]),{flags:['future_hobby']}),
      decision('写一部传记，把没做成的事也留下','先整理自己的记录，涉及他人的私人经历要征得同意；编辑能提问，不能替别人同意公开。',[1,-1],result('第一稿写到一次失败就停了很久','你把一段没兑现的承诺写进第一稿，又删去不属于自己公开的私人细节。回忆仍有遗漏和分歧，编辑把它们标在页边。书还要慢慢写，至少这次没有只留下高光时刻。',{communication:6,energy:-4,stress:2,reputation:3},[]),{flags:['future_memoir']}),
    ],
    fact:{text:'2036年及六种人生收束均为虚构if线，不预言现实人物的退休、复出、婚姻、健康或学术任职。继续奋斗与重新创业的结果按本局准备和结算发生；选择本身不保证成功。',sourceIds:[]},
    echo:rebuilt?'2028年重新开始、2032年的交付记录，让这次重建有了实际基础。':delegated?'已有交接基础，让退出长期职责不只是口头承诺。':'没有发生过的复出、教职和家庭和解，不会因为到了结局就自动补上。',
  };
}

const FUTURE_BUILDERS = {12:governance2026,13:direction2028,14:execution2032,15:ending2036};

export function createFutureCompanyScene(state) {
  if (state.storyEdition !== '2026.11' || !FUTURE_BUILDERS[state.step]) throw new RangeError('未来事业章节须为新版的2026至2036节点');
  const year=futureYears[state.step];
  const data=FUTURE_BUILDERS[state.step](state);
  const c=futureContext(state);
  return {
    id:`future-career-${year}`,year:String(year),age:year-1963,chapter:Math.floor(state.step/2),
    date:`${year} 年 · ${year>2026?'虚构未来':'本局的下一轮安排'}`,
    place:`${c.researcher?'研究与教学空间':c.company?'公司会议室':state.route==='studio'?'工作室':state.route==='sold'?'约好的线上会面':'项目讨论室'} · 黄二勋的平行人生`,
    address:'本幕会面与工作场所为虚构，不设真实私人地址。',
    addressNote:year>2026?'2026年之后的情节由玩家选择形成，不代表现实将发生的事件。':'公开报道作为时代背景；玩家的合同、关系与职责安排另行发展。',
    people:[person('林秋雯','本局的人事与合作联络人'),person('许晨','参与项目交接与技术工作的同行')],
    mission:{deadline:'下一轮计划确认以前',objective:'选择愿意承担的工作与生活安排，并把交接、预算和范围说清。',deliverable:'一份可以执行的安排，以及自己不会继续承担的事项。'},
    alternate:true,future:year>2026,...data,
  };
}
