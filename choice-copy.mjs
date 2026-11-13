// Display-only elaboration. IDs, costs, outcomes and replay text stay in the engine.
const note = (title, detail) => ({ title, detail });
const coreTask = (state, year) => {
  const research = state.route === 'researcher';
  const studio = state.route === 'studio';
  const company = state.route === 'company';
  const historical = company && !state.flags?.counterfactual;
  if (year === 1996) return research ? '在两间实验室用同一场景重跑图形实验' : studio ? '把纹理上传和显示驱动适配到客户的新显卡' : company ? '核对旧图形架构与三角形路线的差异' : state.route === 'sold' ? '定位接手方启动黑屏的驱动故障' : '修复换到隔壁测试机后缺面、颜色错位的图形原型';
  if (year === 1997) return research ? '跨实验室复现实验' : studio ? '新显卡上的移植工具' : company ? `${historical?'RIVA 128':'本局图形样机'}的安装、完整演示和换机测试` : state.route === 'sold' ? '移交产品的安装与故障复现' : '内部图形原型的跨机器运行';
  if (year === 2007) return company ? `${historical?'CUDA':'本局计算工具'}的安装程序、计算示例与错误排查文档` : research ? '实验程序、数据格式与复现说明' : studio ? '客户能自行安装的图形工具、示例与迁移说明' : state.route==='sold'?'顾问项目中的公开计算工具、示例与错误说明':'同事能安装和复用的计算工具、示例与错误说明';
  if (year === 2016) return company ? `${historical?'DGX-1':'本局计算系统'}的安装、训练验证和首轮运维` : research ? '共享训练设备的预约、环境安装和实验复现' : studio ? '租用计算环境的使用排期、基准测试与初期答疑' : state.route==='sold'?'协助合作团队借用机时所需的安装说明、复现记录与故障联络':'所在部门训练环境的使用排期和故障支持';
  return '节能任务调度软件的用电、完成时间和故障恢复测试';
};
const crisis = state => {
  const research=state.route==='researcher',studio=state.route==='studio',company=state.route==='company',sold=state.route==='sold';
  const who=company?'世嘉':research?'联合实验室':studio?'客户制作人':sold?'接手方':'项目主管';
  const cash=company?'工资日、设备租金和已到账现金':research?'设备机时、实验耗材和可用项目经费':studio?'适配工时、设备租金和已确认的付款与结算安排':sold?'顾问合同余下工时、补修费用和报酬约定':'测试台占用、人手和下季度申请预算';
  return {
    'scene-06-p1':note(undefined,`逐项核对${cash}，把${coreTask(state,1996)}缺的三项工作列在旁边。`),
    'scene-06-p2':note(undefined,`请同伴追问：为什么失败、已有记录能证明什么、向${who}申请的下一轮验证要占多少时间和资源。`),
    'scene-06-p3':note(undefined,`重复${coreTask(state,1996)}，记录机器配置、输入、出错位置和每次复测结果。`),
    'scene-06-c1':note(undefined,`向${who}交出失败记录和${cash}清单，申请只覆盖一轮验证的时间与资源，不承诺已能量产或全面采用。`),
    'scene-06-c2':note('只试一轮有限的过渡样机',`承认${company?'旧架构':'现有版本的兼容'}问题后，只验证可交付的过渡样机，不宣称原架构已经正确。投入设备费，${coreTask(state,1996)}；未通过的环境仍可能失败。`),
    'scene-06-c4':note(undefined,`和${who}逐项结清已完成的开发工时、设备使用和未交付部分；新接口另列验证范围，不能算进旧合同已完成的工作。`),
    'scene-06-c5':note('把样品验证和后续付款拆成两段',`请${who}先确认一份最小演示的测试场景、设备条件和验收负责人，第一轮过关才讨论下一段预算。`),
    'scene-06-c6':note(undefined,company?'旧图形接口只维护、不新增，把新投入转向三角形图形路线的验证和驱动适配；此前投入不能全部收回。':research?'撤下不能移植的实验版本，保留旧数据，把下一轮机时用在另一间实验室也能重跑的规范上。':`旧接口只维护、不新增，围绕${coreTask(state,1996)}所需的共同规范重做；现有使用者仍需维护与迁移说明。`),
  };
};
const IF_PATHS = ['nightlife','research','rival','president','solar'];
function committedIfPath(state) {
  const flags=state.flags||{};
  if(state.choicePlanEdition!=='2026.11.plans'||!flags.if_2026_layoff||flags.if_pivot_academic||flags.if_pivot_ordinary)return null;
  const decisions=(state.evidence||[]).filter(item=>item.phase==='choice');
  const last2032=decisions.findLast(item=>item.step===14);
  if(state.step>14&&last2032&&!last2032.optionId?.startsWith('if-'))return null;
  const start=decisions.findLast(item=>item.step===13&&IF_PATHS.some(path=>item.optionId===`if-2028-career-${path}-start`));
  return start?IF_PATHS.find(path=>start.optionId===`if-2028-career-${path}-start`):IF_PATHS.find(path=>flags[`if_route_${path}`])||null;
}
const IF_TASKS={
  nightlife:{
    evidenceTitle:'核对夜间活动开销与场地条件',
    evidence:'列出实际发生的旅行、门票、住宿和休息安排。若考虑屋顶演出，另查场地许可、押金与取消费用；未营业的排期不能算门票收入。',
    scope:'给旅行与活动留一个个人能承担的开销上限，先保留生活费；订场与请演出团队之前，写明何时取消、哪些费用可能退不回来。',
    people:'分别问场地方与演出团队能确认哪些日期、场次和取消条件；朋友愿意来听，不等于愿意替你值班或付账。',
    archive:'整理实际参加或举办的活动、订场退订、开销与休息记录；如有营业，再附门票和履约记录，不把未开业的设想写成生意。',
    work:'先谈一段有范围的活动联络或现场技术支持工作，核对场地、日期和报酬；未确认的演出不能当作已经营业。',
    restart:'从一次现场技术支持或活动联络的小单试起，先确认任务、验收与付款，不先承包长期场地。',
  },
  research:{
    evidenceTitle:'核对光电协同推理的原始测量',
    evidence:'分开列出设计提案、自己做过的测量和外部复现记录。用同一负载比较能耗、延迟、热稳定与成本，没通过的项目保留原始数据。',
    scope:'分别列出租用验证线、样片、工具维护和返工的支出上限；哪项测量不达标就停止下一段，不把伙伴产线计作自己的资产。',
    people:'请外部复测者确认负载与测量方法，向制造伙伴核对验证窗口、样片条件和停止追加时的费用；兴趣不等于已经签约。',
    archive:'按时间整理架构提案、实际测量、外部复现和样片验收记录，明确哪些只是局部优势、哪些仍未通过。',
    work:'围绕能够公开的架构与工具记录，提出一轮复测、软件修复或维护合作；样片与量产支持仍须单独确认。',
    restart:'先为一个使用方做可验收的推理工具或测试服务，只报已能承担的范围，不把验证线或大批样片当作现成资源。',
  },
  rival:{
    evidenceTitle:'整理可公开的架构验证与岗位反馈',
    evidence:'只列自己有权展示的原型、公开基准和实际收到的岗位答复；原雇主机密不进入材料，未获批的编制不能算成自己带的团队。',
    scope:'把求职和个人验证开支与雇主预算分开；仍在任时按岗位权限申请设备，已离开时只用自己有权使用的资源。',
    people:'向招聘或项目负责人问清职责、试用或任期、设备申请与复核人；支持你的同事不能代替正式的用人和预算审批。',
    archive:'整理可公开的工作贡献、任职或离职文件与技术复核记录，去掉无权带走的代码、数据与同事私人资料。',
    work:'若仍在任，提出岗位授权内的一轮公开标准验证；若已离开，先申请新的有限技术任务，不能继续调用原团队的预算。',
    restart:'以公开工具的验证或维护接一份独立小单，确认资料权属、验收和回款，不借原雇主的名义承诺交付。',
  },
  president:{
    evidenceTitle:'核对资格材料与公共技术服务记录',
    evidence:'在虚构的新曙光共和国，分开核对身份、居住期限、财务申报和已经获准的公共技术活动；申请材料不是候选资格，更不是当选结果。',
    scope:'将个人生活费、公共技术项目和可能的竞选准备分别列账；未获准的活动不预订长期支出，也不预支尚未收到的支持。',
    people:'向资格审查与当地项目负责人分别核对材料、活动许可和培训范围；服务站负责人决定本地工作，支持者不能替审查机关批准资格。',
    archive:'按年份核对申请、审查回复、获许可的技术服务与实际发生的选举记录；资格未获准或没有当选的部分，照原结果写下。',
    work:'从获许可的设备维护或公开技术培训谈一段新合作，确认当地负责人与结束日期；技术服务不会自动带来政治职务。',
    restart:'先为一个有明确需求的机构试做设备维护或公开培训，依法确认范围与报酬，不把投资或技术服务当成政治资格。',
  },
  solar:{
    evidenceTitle:'核对太阳能、储能与海上环境试验',
    evidence:'把提案、已做的能源试验和已确认的合作分栏，核对连续供电、储能、盐雾与维修记录；未建成的浮台和未签方案不算现有设施。',
    scope:'将陆上测试、离岸验证、储能与维护分别预算，写明许可或可靠性未过关时停在哪一段；家庭生活费不用于填补未确认的出资。',
    people:'请能源、平台和维护伙伴分别确认设备、许可、测试窗口及退出费用。孙宇晨在这条架空线中的合作，也只按本局实际确认的范围计算。',
    archive:'分开整理提案、实际能源测量、许可、合作确认和验收记录；岸边试验与海上运行分别记，未建成的城市仍是设想。',
    work:'先洽谈一段能源与算力系统的测试或维护，核对供电、储能与维修范围；是否使用海上平台，以实际条件与确认结果为准。',
    restart:'从一处能源验证或算力维护的小任务报价，先核对设备、许可和回款，不把整座浮城或伙伴资金计入已有条件。',
  },
};
function future(state, id) {
  const f=state.flags||{};
  const academic=state.route==='researcher'||state.flags?.future_academic_path;
  const company=state.route==='company';
  const authority=company||state.route==='studio'?'交给':'提议交给';
  const agreement=academic?'拟请合作实验室确认机时和测试任务，你承担约定范围的调度程序、复现文档及学生指导':'拟请设备伙伴确认测试机器、使用方确认任务和验收人员；你只承诺自己有权承担的调度软件与故障支持';
  const path=committedIfPath(state), profile=path?IF_TASKS[path]:null;
  const role=f.if_2028_employed||f.if_2028_trial_role;
  const trial=f.if_2028_independent_work||f.if_2028_independent_trial;
  const teaching=f.if_2028_academic_contract||f.if_2028_teaching_trial;
  const paused=f.if_2028_pause;
  const evidence=role?'带上实际任职或短约中的测试机记录、调度日志和交付反馈，逐项核对这轮任务、报酬与期限；旧任期不会自动续到今天。'
    :trial?'按试单记录，请客户用同一批任务比较耗电、完成时间和中断日志；已收过的反馈与尚未确认的续单分开列。'
      :teaching?'核对上一段课程的备课、机时、课酬和最后答疑记录，再确认这次仍需申请或重谈的部分。'
        :paused?'用可以公开的旧样例，请旧同事按次复核调度日志与故障定位步骤；过去的岗位不计作现在的任职。'
          :'拿一个能合法独立重跑的调度测试样例说明自己的能力，附实际收到的申请反馈；未录用和未付款的记录不写成任职或订单。';
  const people=teaching?'向学校核对课时、机时、课酬和最后答疑日期，合作实验室另行确认可提供的任务与设备。'
    :paused?'先问旧同事是否愿意按次复核一份测试记录，再向任务联系人核对可以承担的范围；一次帮忙不等于入职。'
      :'向设备联系人核对测试窗口，向使用方核对任务与验收人，再确认自己需要完成的日志分析、故障复查和交付说明。';
  const map={
    'scene-14-p1':note('重跑一次任务调度与能耗测试','在能合法使用的设备上运行同一批任务，记录用电、完成时间和失败原因；检验自己的工具是否还能交给别人使用。'),
    'scene-14-p3':note(undefined,'分别问清技术合同的交付内容、学校课程的课时与研究职责，以及家里哪些时间已经有约，不能把几个答复混成一份承诺。'),
    'scene-14-c1':note('申请一项调度软件验证与维护工作','职责限定在跑测试、排查故障和编写交接说明；设备调度、招人和预算审批仍由负责的机构决定。'),
    'scene-14-c2':note('组小团队，试做节能任务调度工具','先找愿意提供测试任务的客户，比较同一批任务优化前后的用电和完成时间；客户愿意付费以后再讨论扩大团队。'),
    'scene-14-c3':note(undefined,'提交一门计算系统验证短课和一个节能调度实验计划；课程安排、实验机时和合作期限都要由学校评审。'),
    'scene-15-p1':note('请使用方重跑节能调度测试','用同一批任务、同一套机器比较用电与完成时间，再模拟任务中断后的恢复；留下原始日志和未达标项。'),
    'scene-15-p2':note('谈清设备、阶段款和试验终止后的费用',`${agreement}。把设备何时到位、每轮验收后付哪一段款、失败后由谁付已发生费用写进草案。`),
    'scene-15-p3':note('让许晨主持设备、测试与交付评审','许晨逐项核对设备窗口、测试结果和维护安排，你只记录尚未交清的审批权限；这一轮演练不等于正式任命。'),
    'scene-15-c1':note(academic?'与实验室共建节能调度实验平台':'与设备伙伴、使用方联合验证节能调度',`${agreement}。第一轮核对同批任务的用电和完成时间，第二轮检验持续运行与故障恢复；下一段支持以验收为条件。`),
    'scene-15-c2':note('独立交付一款小型节能调度工具','把任务分配、用电记录和故障日志做成能安装的小工具；自己承担设备和返工费用，先争取一份有限试用订单。'),
    'scene-15-c3':note(academic?'将实验、机时和学生指导交给后辈共同主持':'让下一位负责人独立管测试、支持和日常预算',`把设备预约、故障值守和支出复核${authority}下一位负责人；哪些事项能直接决定、哪些仍需复核，逐项写入交接单。`),
    'scene-15-c4':note(undefined,'停止追加设备与试用范围，将仍然有效的维护、文档和答疑责任逐项核对后排进每周两个工作日；没有已确认任务时，只保留必要联系。'),
    'scene-16-p1':profile?note(undefined,profile.scope):note(undefined,'分开核对日常开支、已经确认的工作费用和仍未谈成的申请；不把预计回款或下一份任职当作现有收入。'),
    'scene-16-p2':profile?note('问清参与过的人愿意怎样继续来往',profile.people+' 亲近的人也有自己的日程，不能默认替你接手。'):undefined,
    'scene-16-p3':note(undefined,(profile?profile.archive:'整理亲自完成的测试、课程、申请答复和交付记录；如有验收单或延期说明，一并保留。')+' 涉及他人经历的材料，先分清哪些获得了公开同意。'),
    'scene-16-c1':note(undefined,profile?profile.work:academic?'提出下一轮有限课程或节能调度实验合作，先核对课时、机时、课酬与答疑期限；已有合作也需要确认是否延续。':state.route==='sold'?'从一项调度日志核对或故障复查任务申请新合作，先谈范围、报酬和结束日期；没有确认以前，不算已经重新任职。':'提出一轮调度测试、故障修复与维护安排，先核对哪些工作仍需自己承担、哪些需要重新获得支持，不预先承诺下一轮已经签成。'),
    'scene-16-c2':note(undefined,profile?profile.restart:'从一个有明确需求的任务调度或部署小单报价，先确认任务与验收，再等待实际回款；不预先租更多设备或扩招。'),
    'layoff-2028-prep-skills':note('重跑一个调度与故障定位样例','用有权使用的设备和公开数据运行一批任务，记录完成时间、用电或资源占用与中断后的恢复步骤；这份样例用于申请，不代表已经录用。'),
    'layoff-2028-prep-budget':note(undefined,'先列生活开支，再分别估算求职交通、短课备课或小工具试做的上限；尚未确认的结算与新收入不计入余款。'),
    'layoff-2028-prep-listen':note(undefined,'分别问招聘者要验证什么、客户愿意试哪段工具、学校需要几次课及最后答疑；各自的任期与付款条件单独记录。'),
    'layoff-2028-apply':note('申请一项调度验证与故障分析岗位','带公开样例说明怎样读调度日志、比较任务完成时间并定位中断原因；设备权限、报酬和任期需在录用时正式确认。'),
    'layoff-2028-small-work':note('用一份调度测试或部署小单试着谋生','请客户提供一批可测试的任务，报价只覆盖运行记录、故障定位和一份交付说明；客户是否付费，要等这次报价与验证的结果。'),
    'layoff-2028-academic':note('申请计算系统验证短课或联合实验','提交可公开的测试样例、课程提纲和所需机时；学校确认经费与期限后才开始，几次课也不等于长期教职。'),
    'layoff-2028-pause':note(undefined,'保留生活开支与固定联系时间，先停新增设备租用和付费试做；按有限节奏整理样例、回复申请与恢复作息。'),
    'layoff-2032-prep-evidence':note(profile?.evidenceTitle,profile?profile.evidence:evidence),
    'layoff-2032-prep-scope':note(undefined,profile?profile.scope:'把个人生活支出、测试设备时段、日志分析和返工费用分别列出；写明这轮申请未获批或试用未验收时，停止投入的日期。'),
    'layoff-2032-prep-people':note(undefined,profile?profile.people:people),
    'layoff-2032-technical-work':note('把调度日志与故障复查工作谈到能开始',role?'以已经做过的测试与交付为依据，重谈这轮测试机使用、调度日志分析、报酬和职责期限；上一份任职不会自动延续。':'向任务负责人提出一次同批任务测试、日志分析与故障复查，分别确认设备、报酬和结束日期；支持未落实以前不算新岗位。'),
    'layoff-2032-product':note('交付一款能比较耗电与用时的小工具',`${trial?'沿用已收到的试单反馈，':'先向一个使用方核对任务，'}让同一批任务跑出耗电、完成时间和中断日志；报价只包含能安装、能复测的范围，续单仍要等验收。`),
    'layoff-2032-teaching':note('接一段有最后答疑日的系统验证课程','与学校确认几次课、实验机时、课酬和最后答疑日期；用公开样例讲任务调度与故障复查，不把有限课程当作长期教职。'),
    'layoff-2032-smaller-week':note(undefined,'每周只留两天处理必要申请、按次复核与已经确认的收尾；未获批的岗位、尚未下单的客户不占掉整周时间。'),
    'bond-2028-career-small-restart':note(undefined,'用已经约定的有限帮助空出的时间，试报一份调度日志核对或部署小单；帮助没有自动变成资金，报价也不算已签订单。'),
    'bond-2032-career-delivery':note(undefined,'只接共同日程能容纳的一批工具交付，让使用方重跑同一批任务的用电、用时和故障日志；延期和返工仍需按原来约定处理。'),
  };
  return map[id];
}
export function getChoiceCopy(state, scene, option) {
  const original={title:option?.title||'',description:option?.description||'',...(option?.tradeoff?{tradeoff:option.tradeoff}:{})};
  if(!state||!scene||!option?.id)return original;
  const year=Number.parseInt(scene.year,10), id=option.id, research=state.route==='researcher'||Boolean(state.flags?.employer_research);
  // The original electrical-engineering chapter reused these IDs for a final
  // class demonstration. Only the later job-choice scene has employer flags.
  if(year===1984&&!scene.choices?.some(item=>[...(item.flags||[]),...(item.outcomes||[]).flatMap(outcome=>outcome.flags||[])].some(flag=>['employer_amd','employer_lsi','employer_research'].includes(flag))))return original;
  let entry;
  if(year===1996)entry=crisis(state)[id];
  else if(year>=2028)entry=future(state,id);
  else {
    const tasks={
      'scene-03-p1':'把输入信号、实测波形和电路修改前后的结果放在一起，让招聘者看见一次错误怎样被定位。',
      'scene-03-p2':'核对加州租房押金、搬家交通费、入职日与首笔工资到账日，列出中间需要自己垫付的生活费。',
      'scene-03-p3':'课题是计数板加快时钟后漏计：对照两种接线，测最高可靠频率和器件数量，附实验步骤与器材预算。',
      'scene-03-c1':'从微处理器的运算与控制电路做起，核对加法进位、寄存器读写和信号时序，提交修改与验证记录。',
      'scene-03-c2':'把客户控制板的计数、地址译码和数据交换需求写成 ASIC 规格，解释引脚、响应时间与成本的取舍。',
      'scene-03-c3':'围绕计数板高速漏计申请研究助理岗位和实验经费；岗位、经费与后续深造都需要分别获批。',
      'scene-04-p1':research?'对齐仿真与实测波形，标明发生时序误差的输入条件和能够重做的步骤。':'核对接口时序、失败输入与修改记录，写清哪一次设计假设被测试推翻。',
      'scene-04-p2':'让同一个三维物体连续旋转，记录帧率、显存占用和每帧传输的数据量。',
      'scene-04-c1':'同一段三维场景分别跑通用处理器与专用图形方案，比较帧率、内存需求和设备成本。',
      'scene-05-p1':'分开列出日常生活、设备租用、样片试做三栏；尚未到账的投资和别人未同意的担保都不计入可用钱。',
      'scene-05-p2':'问潜在游戏客户用哪种硬件、最先缺哪个图形功能、谁签验收，以及通过后多久付款。',
      'scene-05-p3':'小样只验证一段图形处理流程能否连续运行，留下运行条件、故障与还没做的部分。',
      'scene-07-p1':`对${coreTask(state,1997)}逐项留下操作步骤、机器配置、通过条件与失败日志。`,
      'scene-07-p2':`闭门检查${coreTask(state,1997)}；只拿已确认的环境演示，还没过的测试继续列为限制。`,
      'scene-08-p1':'问清采购数量或使用人数、运行环境、验收时间和出故障找谁；把对方口头喜欢与实际采购条件分开。',
      'scene-08-p3':'逐项写出谁负责技术答复、谁能确认交付范围、谁签验收，署名与日后承担的责任一并核对。',
      'scene-09-p1':`让三位使用者从零安装${coreTask(state,2007)}，记录安装失败、示例跑错和文档跳步的位置。`,
      'scene-09-p3':'把安装成功、示例跑通、独立重跑列成三个验收点；每阶段都写上负责答疑的人与截止日期。',
      'scene-09-c1':`为${coreTask(state,2007)}持续安排维护与答疑工时，接受短期内不一定带来新订单。`,
      'scene-10-p1':'核对数据预处理、显存限制、代码依赖和训练日志，先跑能比较结果的小规模训练片段。',
      'scene-10-c3':research?'旧课题先完成一项已获支持的实验，新方向复现一段训练；分别记机时、条件和结果，到期再比较，不预先承诺两边都能完成。':'旧方向先核对一项已经确认的需求，新方向复现一段训练；分别记工时、设备占用和结果，到期再比较。',
      'scene-11-p1':`围绕${coreTask(state,2016)}写清驱动、环境依赖、测试任务和故障日志的提交方式。`,
      'scene-11-p2':'合同写清首轮交付的设备或使用时段、测试任务、付款节点与验收签字人，独家范围也单独列明。',
      'scene-11-c1':`为研究合作保留${coreTask(state,2016)}所需资源，以可公开的测试日志和复现步骤换取共同验证。`,
      'scene-11-c3':'由林晓排首轮使用者、分配试用窗口、收回安装和训练日志；难以解决的故障仍有明确升级联系人。',
      'scene-12-p3':state.route==='company'?'把晶圆、封装和高带宽内存的到货日期，与预付款、系统测试和维护人手放进同一张排期表。':'把下一轮设备时段、软件维护、已有合同和实际能接手的人列在同一张排期表。',
      'scene-12-c1':state.route==='company'?'提出下一代 AI 计算系统的芯片、封装、内存和整机验证安排；采购排期、现金支出与交付承诺仍需获得支持。':state.route==='sold'?'为新的顾问合作核对测试任务、设备时段、报酬与结束日期；对方尚未确认的部分不算已有项目。':'提出下一轮计算项目的验证与维护安排，逐项确认可用设备、人手和交付日期，不预先写成已经获批。',
    };
    if(tasks[id])entry=note(undefined,tasks[id]);
  }
  if(!entry)return original;
  return {...original,title:entry.title||original.title,description:`${entry.detail} ${original.description}`.trim()};
}
