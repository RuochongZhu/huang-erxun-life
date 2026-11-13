// Added choices are a separate edition so saved histories retain their meaning.
// This module describes consequences; the engine owns all state changes.
const EDITION = '2026.11.impact';
const YEARS = [1973,1978,1984,1992,1993,1996,1997,1999,2007,2012,2016,2024,2026,2028,2032,2036];
const paired = life => ['dating','married'].includes(life?.relationship) && ['lori','maya'].includes(life?.partner);
const partner = life => life.partner === 'lori' ? 'Lori' : '麦雅';
const axes = (...items) => items.map(([dim,d]) => ({dim,d}));
const impact = (values,pressures,hint) => ({values,pressures,hint});
const reaction = (speaker,text,tone='tense') => ({speaker,text,tone});
const feedback = (environment,...reactions) => ({reactions:reactions.slice(0,2),environment});
const result = (label,text,effects,lifeImpact,world) => ({label,text,effects,lifeImpact,feedback:world});

function career(year,key,title,description,outcomes,details={}) {
  return {id:`impact-${year}-career-${key}`,title,description,traits:axes([0,1],[9,1]),
    outcomes,flags:[`impact_${year}_${key}`],
    lifeImpact:{values:{},pressures:{},hint:outcomes[0]?.lifeImpact?.hint||'眼前的结果之外，这项决定还会影响今后的负担与支持。'},...details};
}
function risk(year,key,title,description,stat,base,outcomes,details={}) {
  return career(year,key,title,description,outcomes,{check:{stat,base},...details});
}
function personal(year,key,title,description,tradeoff,text,effects,set,lifeImpact,world,traits=axes([9,1],[14,-1])) {
  return {id:`impact-${year}-life-${key}`,title,description,tradeoff,consequence:text,text,label:title,
    effects,set,traits,lifeImpact,feedback:world};
}

function role(state) {
  const route=state.route;
  return route==='company' ? {team:'公司',peer:'工程负责人',client:'客户代表',pay:'订单',authority:'董事会',work:'产品',canSell:true}
    : route==='researcher' ? {team:'课题组',peer:'研究搭档',client:'合作研究者',pay:'项目支持',authority:'项目负责人',work:'实验',canSell:false}
      : route==='employee' ? {team:'部门',peer:'同组工程师',client:'需求部门',pay:'项目奖金',authority:'主管',work:'交付项目',canSell:false}
        : route==='sold' ? {team:'顾问小组',peer:'顾问搭档',client:'委托方',pay:'顾问合同',authority:'委托方负责人',work:'顾问方案',canSell:false}
          : {team:'工作室',peer:'搭档',client:'客户',pay:'订单',authority:'合伙人',work:'样品',canSell:true};
}

function careerChoices(state,year) {
  const c=role(state);
  const good=impact({career:8,wealth:6,legacy:-4},{burden:6,trustDebt:18},'当下的成绩可能掩盖信用欠账，下一次合作仍会追问是谁承担了代价。');
  const support=impact({career:6,belonging:5,legacy:5},{burden:3,support:8},'让别人真正参与，会留下今后能互相接手的关系。');
  if(year===1973) return [
    risk(year,'brag','吹一回牛，答应替全桌念完短文','同桌都在发愁，你拍着胸口说自己全会了。今晚得把每一段背熟，也可能在老师面前露馅。','communication',.48,[
      result('念完了，大家真把你当救星','你背对书页一口气念完，同桌在桌下竖起拇指。课后又有两个人拿着作业来找你，你这才发现“我都能幫”还没有结束。',{communication:12,reputation:8,energy:-8},impact({career:5,belonging:7,health:-4},{burden:12,trustDebt:5},'逞强换来好感，也可能让别人开始依赖你。'),feedback('老师合上了点名册，走廊上已经有人等你帮忙。',reaction('同桌','那明天那一段，你也会吧？','hopeful'))),
      result('背到一半，汤姆悄悄接上','你卡住的地方越来越长。汤姆把书移到你面前，两人一起念完；这回人情是你欠他的。',{communication:5,bonds:3,stress:7},impact({belonging:3,health:-3},{burden:6,support:3},'同伴可以接住一次失手，不等于下次仍能替你承担。'),feedback('后排有人忍住笑，汤姆的手指仍按在那一行。',reaction('汤姆','下次先告诉我你不会哪段。','warm'))),
      result('刚开头就念错，全桌跟着安静','你把前一晚背熟的另一篇念了出来。老师没有骂你，只把书放回桌上让你从第一行重来。',{reputation:-6,stress:12,energy:-5},impact({belonging:-4,health:-5},{trustDebt:8,burden:5},'一句逞强不等于能力，别人会记住这次落差。'),feedback('笑声停得很快，粉笔在黑板上划出刺耳的一声。',reaction('老师','不会可以问，别替整桌答应。','tense'))),
    ],{traits:axes([9,1],[11,1]),effects:{energy:-3}}),
    career(year,'sock-puppet','拿一只旧袜子当木偶，陪同桌练英文','认真读不下去，就让袜子“开口”。可能被人笑幼稚，至少谁念错了都可以再来一次。',[
      result('袜子念得比你还结巴','汤姆给袜子画了两只大小不同的眼睛。你们笑过之后，终于把最难的三个词重复了五遍，值班老师也没有收走它。',{communication:7,bonds:7,stress:-6},impact({belonging:6,freedom:4,health:3},{support:6,burden:-2},'一点荒诞让求助没那么丢脸，同伴愿意陪你再试。'),feedback('桌上那只歪眼袜子被留在书边，汤姆主动翻到下一页。',reaction('汤姆','它念错了不算，我们再来。','wry'))),
    ],{traits:axes([5,1],[15,1])}),
  ];
  if(year===1978) return [
    risk(year,'double-shift','把两个人的班全接下来，挣一笔狠的','你说：“兩個班，我來。”领班真的把两个名字划掉了。钱更近了，作业和睡眠也更远了。','leadership',.52,[
      result('小费塞满口袋，腿却像不是自己的','你撑过了高峰，小费比平时厚了一截。艾迪下班时看你靠着储物柜睡着，只能把作业本压在围裙下面。',{money:24,leadership:7,energy:-20,stress:10},impact({wealth:18,career:4,health:-10,freedom:-6},{burden:18,trustDebt:3},'这次多挣的钱是用睡眠和学业时间换来的，下一周的体力不会自动恢复。'),feedback('最后一盏厨房灯熄了，水槽里的杯子还在轻响。',reaction('艾迪','钱是多了。你明天上课怎么办？','tense'))),
      result('忙完了，但漏掉两桌','领班替你补了两次送餐，额外收入只拿到一部分。作业仍没动，一个晚上却像过了两遍。',{money:12,energy:-17,stress:12},impact({wealth:8,health:-9},{burden:13,trustDebt:6},'多接班不总能换来预期收入，补救还会占用别人的时间。'),feedback('台面留下两张划错的单，艾迪已经替你收了半间店。',reaction('领班','下周按能做完的班排。','tense'))),
      result('托盘翻了，多挣的先拿去收拾','你转身时撞上桌角，整盘杯子落地。没人受伤，但你和艾迪重新收拾到深夜，答应的班没能独自完成。',{money:3,energy:-20,reputation:-5,stress:17},impact({wealth:2,health:-10,belonging:-4},{burden:18,trustDebt:10},'体力到头时，逞强的后果会落到一起工作的人身上。'),feedback('玻璃已经扫净，桌边的客人仍在等那杯水。',reaction('艾迪','你叫我一声就行，不用非得一个人扛。','angry'))),
    ],{effects:{energy:-4},traits:axes([12,1],[13,-1])}),
    career(year,'bell-code','和艾迪给餐台编一套荒唐暗号','七号桌叫“火山”，九号桌叫“月球”。先只在你们两人的交接里试，不拉全店陪你冒险。',[
      result('“火山两杯水”，终于没人跑错','领班听到暗号先翻了个白眼，看见两张单按顺序送出去，又把写法抄在备用纸上。笑归笑，你们确实少绕了两次路。',{money:5,communication:6,leadership:6,bonds:4,energy:-4},support,feedback('出餐口少了一次互相大喊，领班敲了敲那张画着火山的纸。',reaction('领班','名字随你，桌号别再错。','wry'))),
    ],{traits:axes([6,1],[8,-1])}),
  ];
  if(year===1984) return [
    risk(year,'glossy-cv','把团队的成果讲成自己的，抢先拿到职位','面试正在追问那块电路是谁做的。你可以省略搭档的名字，让自己的履历听起来更完整。','communication',.57,[
      result('试用职位到手，搭档却不再回信','你提前拿到 LSI 的试用职位。招聘者记住了你的名字，陈立文也记住了你没有提谁。',{money:20,reputation:12,bonds:-12,stress:8},good,feedback('录用信摆在桌上，另一封写到一半的信始终没寄出去。',reaction('陈立文','那块板子上，也有我熬的夜。','angry'))),
      result('职位是有了，技术范围被问得很细','你拿到基础岗位，入职后的第一个任务正好是你说自己最熟的部分。那一页被夸大的经历开始需要补课。',{money:8,energy:-9,stress:12,bonds:-6},impact({career:4,wealth:5,health:-6},{burden:14,trustDebt:12},'把话说大后，接下来的工作会按那个承诺来找你。'),feedback('招聘者在履历的那一行画了圈，陈立文没有参加庆祝。',reaction('面试官','从你最熟的这部分开始，没问题吧？','tense'))),
      result('追问露了馅，只留下基础岗位机会','对方追问到分工，你终于改口。仍有一份基础岗位可以做，但开始工作前，你得先解释那段经历。',{money:4,reputation:-10,bonds:-8,stress:15},impact({career:-3,wealth:2,belonging:-7},{trustDebt:18,burden:9},'机会可能仍在，信任却需要从更低的地方重新积累。'),feedback('面试室的椅子吱了一声，对方把履历翻回第一页。',reaction('面试官','把你亲手做的部分重新说一遍。','tense'))),
    ],{route:'employee',flags:['impact_1984_glossy_cv','employer_lsi','counterfactual'],traits:axes([4,-1],[11,1])}),
    career(year,'broken-demo','当场拆开坏样机，公开请大家找错','申请留下做研究助理，把没亮的板子也搬上桌。你不装作已经完成，赌的是有人愿意一起把问题弄明白。',[
      result('演示没亮，反而有人搬来示波器','你说：“它現在還不行，誰願意一起查？”旁边的同学坐了下来。研究助理的预算很紧，但一份可复现的排错记录开始有了同伴。',{engineering:12,bonds:7,money:-3,reputation:3,energy:-5},support,feedback('展示台变成了一张挤满手肘的工作桌，纸上多了三种颜色的笔迹。',reaction('研究搭档','别急着合上，我想再测这里。','hopeful'))),
    ],{route:'researcher',flags:['impact_1984_broken_demo','employer_research','counterfactual'],traits:axes([4,1],[5,1],[6,1])}),
  ];
  if(year===1992) return [
    risk(year,'credit','把汇报压成一个名字：你的','成果确实不错，做事的人却不止一个。你可以把团队推到幕后，让这一轮晋升先落在自己身上。','communication',.60,[
      result('头衔升了，会议室却空了一半','任命先落在你身上，收入也涨了。原本愿意留下讨论的两位同事收起笔记，开始只完成明确分给自己的部分。',{money:25,leadership:16,reputation:10,bonds:-18,stress:8},impact({career:20,wealth:12,belonging:-9,legacy:-7},{trustDebt:25,burden:12},'抢来的功劳会提高眼前位置，也可能让下一次困难没有人愿意主动接手。'),feedback('祝贺还在，讨论声已经少了。',reaction(c.peer,'下次汇报，你也一个人做完吗？','angry'))),
      result('先代理，贡献归属还要重查','你得到临时负责的机会，搭档却在评审时补上了实际分工。职务没有立即丢掉，解释和补救已经挤满日程。',{money:10,leadership:7,bonds:-10,stress:14},good,feedback('任命表旁边多了一张贡献说明，笔迹比原表还密。',reaction(c.authority,'带队之前，先把谁做了什么说清楚。','tense'))),
      result('晋升没落下，搭档先提出调组','原始记录摆出来之后，汇报里的省略变得刺眼。岗位仍要做，信任却比职位更早失去。',{reputation:-15,bonds:-17,stress:18},impact({career:-8,belonging:-9,legacy:-6},{trustDebt:24,burden:10},'一次抢功可能同时失去机会与愿意共同工作的人。'),feedback('会议结束得很快，搭档的调组申请留在门边。',reaction(c.peer,'我不想再猜你会怎么介绍这份工作。','angry'))),
    ],{traits:axes([8,1],[11,1]),effects:{energy:-4},lifeImpact:{values:{},pressures:{},hint:'无论这轮晋升结果如何，抢功都会消耗同事的信任；升职成功也不会免去这笔关系欠账。'}}),
    career(year,'empty-chair','把自己的主讲椅让给做出结果的人','你介绍问题，让搭档完整讲完。可能错过一次独自出头的机会，也让别人看见这支队伍不只靠你。',[
      result('名字不只一个，责任终于也不只一个','你坐到侧面，听搭档第一次完整回答质疑。会上没有人只记住你，散会后却有两个人愿意共同承担下一轮任务。',{leadership:8,bonds:9,control:-7,reputation:3},impact({career:5,belonging:7,legacy:5,freedom:4},{support:12,burden:-5,trustDebt:-3},'把露脸机会交出去，也在培养能真正分担的人。'),feedback('投影遥控器换了一只手，问答没有因此停下来。',reaction(c.peer,'下一次，我可以自己讲。','hopeful'))),
    ],{traits:axes([8,-1],[10,1])}),
  ];
  if(year===1993) return [
    risk(year,'moonshot','现在就组公司，把尚未落地的订单当作明天','你决定离开原岗位，成立自己的公司。口头兴趣还没变成付款，你却已经想按大单的规模招人。','communication',.40,[
      result('钱真进来了，承诺也一起涌进来','第一笔订单终于签下，账上的数字一下好看起来。新团队还没磨合，客户已经拿着你答应的日期要求排产。',{money:35,leadership:14,reputation:10,energy:-15,stress:16},impact({career:20,wealth:24,health:-9,freedom:-10},{leverage:26,burden:24,trustDebt:10},'预期变成了真订单，也把交付承诺放大到新团队必须追赶的规模。'),feedback('办公室里第一次坐满了人，打印机不停吐出交付清单。',reaction('新同事','这些日期，都已经答应了吗？','tense'))),
      result('只来了一半的钱，人已经招齐','公司开始运转，订单却只落下一小批。新同事等工资，你得在每天开工前先问钱能撑多久。',{money:12,leadership:7,energy:-15,stress:20},impact({career:8,wealth:6,health:-10},{leverage:24,burden:25,trustDebt:14},'把计划当收入安排，会把延期变成整支团队的压力。'),feedback('招聘海报还没撕，账本旁已经写着两个待付日期。',reaction('新同事','先告诉我们，下个月的安排到底是什么。','tense'))),
      result('公司成立了，大单没有来','口头兴趣停在电话里。你仍要照顾已经作出的招聘承诺，成立公司并没有同时带来收入。',{money:-10,reputation:-10,energy:-18,stress:25},impact({career:-6,wealth:-9,health:-10,belonging:-6},{leverage:28,burden:30,trustDebt:18},'空着的订单栏不会取消已经作出的支出与用人承诺。'),feedback('电话那头说再等等，桌边的人仍在等你给一个日期。',reaction('新同事','不能总让我们跟着“快了”过日子。','angry'))),
    ],{cost:{money:-10},route:'company',flags:['impact_1993_moonshot','founded_company','counterfactual'],traits:axes([0,1],[9,1])}),
    career(year,'tiny-demo','把创业会开成样机夜，先拿出能动的一小块','先留下一个能自行完成的试验，不靠一张漂亮计划表许诺整个行业。你愿意让伙伴看见不成熟的地方。',[
      result('没人喊口号，样机终于动了一下','你们把纸杯挪开，接线接到凌晨。样机只完成了一件小事，伙伴却知道下一次自己能负责哪一块；这晚没有许诺任何人的全职工资。',{engineering:10,bonds:7,energy:-7,money:-2},support,feedback('屏幕上只亮了一小块，桌边仍有人轻轻拍了一下手。',reaction('搭档','先把这一块做稳，下周我还能来。','hopeful'))),
    ],{traits:axes([6,1],[9,-1])}),
  ];
  if(year===1996) return [
    risk(year,'quiet-bad-news','把坏消息先摁住，撑过眼前这场会','你没有解决失败，只把它从今天的说明里拿掉。可能换来一轮资源，也可能让合作方按错误的乐观程度继续安排。','communication',.55,[
      result('支持续上了，问题还在机器里','会上没有人追问那一项，你争到下一段资源。回到工作间，负责排错的人把同一页失败记录重新推到你面前。',{money:24,reputation:12,energy:-8,stress:12},impact({career:12,wealth:18,legacy:-8},{trustDebt:26,burden:20,leverage:12},'没有说出的坏消息并未消失，之后的承诺会建立在这次省略之上。'),feedback('会议门一关，机器又停在刚才跳过的那一步。',reaction(c.peer,'会过了。这个错还是要有人修。','angry'))),
      result('对方只给一半支持，追问更多细节','你换到一点时间，对方要求更密的报告。原本想藏过一轮的问题，现在每次都会先被问起。',{money:8,control:-6,stress:17,energy:-9},impact({wealth:6,freedom:-7,legacy:-5},{trustDebt:19,burden:18,leverage:10},'勉强拖过之后，监督和补交材料会吞掉争来的时间。'),feedback('对方把下一次会议提前到了下周。',reaction(c.client,'这次没讲完的，下周先讲。','tense'))),
      result('对方当场拿出另一份记录','你省去的部分被对方问了出来，剩下的说明也开始被怀疑。合作没有立刻结束，但你失去了让对方先相信的余地。',{money:-7,reputation:-18,bonds:-10,stress:22},impact({career:-9,wealth:-5,belonging:-5,legacy:-8},{trustDebt:28,burden:18},'压住坏消息可能把一项技术失败变成整段关系的信用问题。'),feedback('对方没有提高声音，只把那份记录留在了桌子中央。',reaction(c.client,'我们现在应该信哪一份？','angry'))),
    ],{traits:axes([4,-1],[9,1])}),
    career(year,'failure-room','请最挑剔的人进来，当场拆掉自己的方案','承认眼前的版本不行，请使用方和工程师一起决定先停哪一块。你可能丢掉面子，也可能终于不用替错误辩护。',[
      result('坏消息说透，反而少了一场争吵','你说：“這一版不行，別替我圓。”现场沉默了几秒，随后有人开始划掉不该继续的功能。支持没有全保住，团队却第一次对下一步有了相同理解。',{money:-4,engineering:10,stress:-6,bonds:6,control:-5},impact({career:5,belonging:6,legacy:7,freedom:3},{support:10,trustDebt:-8,burden:-5},'早点承认失败会失去一部分资源，也可能止住继续消耗。'),feedback('白板上最醒目的功能被擦掉了，旁边多了一条能实际验证的步骤。',reaction(c.peer,'好，现在我们能谈怎么救了。','hopeful'))),
    ],{traits:axes([3,1],[4,1],[6,1])}),
  ];
  if(year===1997) return [
    risk(year,'ship',c.canSell?'只展示最稳的三台，先收一笔预款':'只展示最稳的三次结果，把这一版报成完成','你押注那些偶发问题不会在第一批使用时出现，准备把这几次漂亮结果当成整批都能做到的证明。数字可能很好看，真实的失败仍会落到使用者和接手的人手里。','engineering',.43,[
      result('首批没出问题，收入冲了上来','这一批暂时跑得顺，交付数字超出预期。测试负责人没有笑，他把尚未解决的条件单独留在了下一轮表上。',{money:32,reputation:13,stress:13,energy:-9},impact({wealth:23,career:15,legacy:-8,health:-6},{trustDebt:24,leverage:18,burden:22},'这批没有暴露问题不等于问题消失，扩量可能放大同一处缺口。'),feedback('发货栏一下变满，测试台旁那张红纸仍没被撤下。',reaction(c.peer,'别把运气写成测试通过。','angry'))),
      result('能用，却把维护变成了通宵','使用者不断回来问同一类问题。收入有了，接手维护的人也开始轮流在椅子上补觉。',{money:13,energy:-18,stress:20,bonds:-7},impact({wealth:10,health:-10,belonging:-5},{burden:28,trustDebt:18,leverage:8},'把验证留给使用者，会把交付后的日子变成还债。'),feedback('维护电话从一个变成三个，晚饭原样留在桌角。',reaction(c.client,'你们说可以用，为什么每次都要再等？','angry'))),
      result('第一批就卡住，追回的比送出的还多','问题在使用现场重复出现。你不得不停下新增交付，把能追回的版本和货物逐项处理，前面抢到的时间全部还了回去。',{money:-15,reputation:-22,energy:-20,stress:25},impact({wealth:-10,career:-10,legacy:-9,health:-10},{trustDebt:30,burden:28,leverage:15},'提前交出去的风险会回来，而且可能同时带回费用和失去的信任。'),feedback('已经封好的箱子重新打开，原定出发的车空着离开。',reaction(c.peer,'我们当时为什么不肯多等这一轮？','angry'))),
    ],{traits:axes([0,1],[6,-1]),effects:{energy:-5}}),
    career(year,'red-button','把停线权交给最年轻的测试员','任何人复现严重问题都可以叫停这一批，先从一个有限窗口试。你让出了最后一锤，也得接受订单或进度因此延后。',[
      result('新人真按了停，大家先看向你','你点了头。原定交付晚了，测试员却第一次敢把重复出现的问题完整讲完；之后的修补不再只等你一句话。',{money:-5,engineering:9,leadership:6,control:-12,bonds:7},impact({career:5,legacy:8,belonging:6,freedom:4},{support:12,trustDebt:-6,burden:-4},'让叫停真正有效，才可能有人在大事故前愿意开口。'),feedback('传送和测试暂时停下，会议室里第一次由新人讲了十分钟。',reaction('测试员','我怕你会让我先别说。','hopeful'))),
    ],{traits:axes([6,1],[8,-1])}),
  ];
  if(year===1999) return [
    risk(year,'one-whale',c.canSell?'只服务最大客户，把小客户先放一边':'把资源全给最有话语权的项目','最大的那一单或那一份支持足以改变眼前局面。你愿意让其他承诺排到后面，也要接受从此更难对它说不。','communication',.59,[
      result('大单把账填满，对方也拿走排期','资源一下宽裕，合作方却要求优先拿到下一轮结果。原本排在前面的人开始另找去处。',{money:30,reputation:10,control:-18,bonds:-7},impact({wealth:22,career:13,freedom:-10,belonging:-6},{leverage:25,trustDebt:16,burden:14},'收入集中在一个来源，也把对方的要求放到更难拒绝的位置。'),feedback('一个名字占满了整张排期表，其他邀请被推到了桌边。',reaction(c.client,'既然这次优先，下次也一样吧。','tense'))),
      result('拿到一半支持，却先丢了其他人','对方只确认了部分承诺，其他使用者已经离开。新的依靠还不够稳，旧的出口先变窄了。',{money:10,control:-14,reputation:-4,stress:13},impact({wealth:7,freedom:-9,legacy:-4},{leverage:22,trustDebt:14,burden:12},'依赖一方的代价，可能先于那份好处落地。'),feedback('大客户还没答复，两个小项目先从日历上消失。',reaction(c.peer,'我们是不是已经没有第二条路了？','tense'))),
      result('大项目改期，空出来的是整个季度','对方延后，原先被你推开的人也没有立刻回来。你看着空白排期，发现自己把选择权一起交了出去。',{money:-10,reputation:-12,stress:20,control:-15},impact({wealth:-9,career:-7,freedom:-10},{leverage:28,trustDebt:18,burden:14},'单一依赖受挫时，失去的可能不只是这一单收入。'),feedback('电话里说下季度再谈，桌上的季度表却已经空了。',reaction(c.peer,'有人愿意回来，我们也得先道歉。','tense'))),
    ],{traits:axes([0,1],[8,-1])}),
    risk(year,'chair-mic','站上椅子抢过麦克风，给自己加冕','展示快结束时，你突然想让所有人记住自己。搭档还拿着准备好的讲稿，你已经把椅子拖到了前面。','communication',.50,[
      result('全场记住了你，后台也记住了这一幕','你喊：“今晚先記住我的名字！”台下先笑，随后有人真的围过来。你的名气冲了上去，搭档却把原本准备共同讲的那一页折进了包里。',{reputation:30,communication:15,control:10,bonds:-15,stress:7},impact({career:20,wealth:5,belonging:-9,legacy:-6},{trustDebt:23,burden:11,support:-8},'一个抢眼瞬间可以换来机会，也可能让一起把事情做成的人不再愿意站到你身后。'),feedback('掌声还没停，后台同事已经收起讲稿，没人替你补上后半段。',reaction(c.peer,'他们记住你了。我那一页就不用讲了，是吗？','angry'))),
      result('笑声很响，真正的问题却还没人回答','大家记住了你站椅子的样子，接着继续追问样品和交付。气氛是热了，搭档却得临时补讲你跳过的部分。',{reputation:12,communication:6,bonds:-8,stress:11},impact({career:8,belonging:-5,legacy:-3},{trustDebt:15,burden:12,support:-4},'出风头可以吸引注意，但接下来仍有人要完成被跳过的实际工作。'),feedback('椅子被推回原位，搭档独自接起了后面的问答。',reaction(c.client,'表演挺好，现在能说什么时候能用了吗？','wry'))),
      result('话筒啸叫，大家记住了另一种尴尬','你刚开口，话筒就响起刺耳的啸叫。主持人把流程拉回去，搭档没有接过你递回来的麦克风。',{reputation:-12,communication:3,bonds:-11,stress:17},impact({career:-6,belonging:-7,legacy:-4},{trustDebt:19,burden:9,support:-5},'冒出来的名气可能是笑话，打断同伴之后仍需要认真处理关系。'),feedback('工作人员扶住椅背，台下的笑声没有变成你想要的掌声。',reaction(c.peer,'下次想临时来这一段，至少先告诉我。','angry'))),
    ],{traits:axes([9,1],[11,1])}),
  ];
  if(year===2007) return [
    career(year,'everything-mine','为了不让任何人背锅，所有决定都先过你','你想保护团队，于是把每一项批准收回自己手里。今天大家安心，明天最小的改动也得在你的门口等。',[
      result('没人再怕签字，所有人都等你签字','你一口气处理完第一摞申请。第三天，门外的队伍拐了弯，连两个同事已经谈好的小改动也停在你的收件箱。',{control:20,leadership:6,energy:-15,stress:17,bonds:3},impact({career:8,belonging:3,health:-8,freedom:-10},{burden:27,leverage:5,support:-7},'替所有人负责看似保护，久了可能让整支团队失去自己判断和行动的空间。'),feedback('门口的人没散，你原定回家的时间已经过去。',reaction(c.peer,'我知道怎么改，但还得等你点头。','tense'))),
    ],{traits:axes([8,1],[12,1])}),
    risk(year,'wild-lab','给一小队人一个月，专做你也看不懂的怪点子','把范围锁在一个可承担的试验里。你放弃每天纠正方向，只要求月底拿出可重做的结果。','engineering',.53,[
      result('那个怪点子真的有用','第一周看上去全是胡闹，月底却有人带来能重跑的工具。你不太喜欢它的名字，却不得不承认它解决了旧方案绕不过的问题。',{engineering:20,ecosystem:12,control:-10,energy:-5},impact({career:18,legacy:12,freedom:5},{support:10,burden:4,leverage:3},'有限范围的自由可能带来突破，也需要接受结果长得不像自己的设想。'),feedback('一群人围着不太漂亮的演示笑，没人等你先宣布成功。',reaction(c.peer,'名字真的不能再改了，我们已经叫了一个月。','wry'))),
      result('没有新平台，留下两件小工具','大想法没成，两个重复步骤却被省掉。团队没有交一份宏大胜利，也没有把这个月全烧成空白。',{engineering:8,ecosystem:4,control:-6},support,feedback('演示只亮了两个按钮，说明书却能由别人照着跑完。',reaction(c.peer,'大东西没做成，这两件能用。','warm'))),
      result('一个月过去，假设仍不成立','数据没有支持那条路线。你按约停下，保留结果和工作记录，团队没有被要求再演一场“马上就好了”。',{money:-5,engineering:4,stress:7,control:-6},impact({wealth:-4,career:2,legacy:4},{burden:5,support:4},'允许一个有边界的失败，才可能让下一次试验留下真实信息。'),feedback('最后一块白板被擦干净，失败条件留在了归档页。',reaction(c.peer,'你真会让这个试验停在这里？','hopeful'))),
    ],{cost:{money:-6},traits:axes([0,1],[6,1],[8,-1])}),
  ];
  if(year===2012) return [
    risk(year,'all-in-ai','把旧方向的人和钱一起押到新结果上','眼前的突破太诱人。你想一次转过去，不再为旧承诺留下足够人手；方向也许对，转身的代价不会因此消失。','engineering',.48,[
      result('新方向突然跑通，旧工作同时追了过来','结果带来新支持，你比谨慎的人更早站到新起点。原客户和旧课题的人却还在问，之前答应的维护由谁完成。',{engineering:28,money:20,ecosystem:15,energy:-15,stress:15},impact({career:24,wealth:13,legacy:8,health:-8,belonging:-5},{burden:25,trustDebt:20,leverage:15},'方向押对也不能取消旧承诺，跃升可能伴随长期欠账。'),feedback('新演示被一遍遍播放，旧支持请求已经堆满另一块屏幕。',reaction(c.peer,'新东西真成了。旧的那些人，我们怎么办？','tense'))),
      result('新试验有希望，两边却都缺人','结果只完成一半，旧工作也开始延误。你不断在两个房间之间跑，哪边都觉得自己被放下。',{engineering:12,money:4,energy:-18,stress:22},impact({career:9,health:-10,belonging:-6},{burden:29,trustDebt:20,leverage:12},'转得太快，可能同时欠下旧承诺和新进度。'),feedback('两个会议同时叫你的名字，饭盒又原样留到晚上。',reaction(c.peer,'今天到底先救哪边？','angry'))),
      result('新路线没跑通，旧支持也散了','关键假设在你的条件下没有重现。被挪走的人已另有安排，你无法只说一句恢复原计划就把他们叫回来。',{money:-12,reputation:-15,energy:-20,stress:25},impact({wealth:-9,career:-9,health:-10,belonging:-7},{burden:28,trustDebt:25,leverage:20},'押注的损失包括人和联系，未必能通过回到旧方向立即收回。'),feedback('新机子还在转，旧项目群却不再回复刚发出的消息。',reaction(c.peer,'我们没有一个可以立刻回去的昨天。','tense'))),
    ],{cost:{money:-8},traits:axes([0,1],[2,1])}),
    career(year,'skeptic-seat','专门请最不看好的人来拆新方向','给怀疑者一台机器和完整记录，让他挑错；不要只挑愿意赞成的人进评审。',[
      result('反对者没有改口，却帮你删掉一条假设','你听完了难听的话，也拿到一组以前没有测过的数据。新路线缩小了，剩下的部分反而更值得继续。',{engineering:10,reputation:4,control:-5,stress:3},impact({career:6,legacy:7,freedom:3},{support:6,trustDebt:-4,burden:-3},'让质疑发生在扩张前，可能少把一条错误假设带给更多人。'),feedback('白板上的感叹号少了一个，测试条件多了三行。',reaction('质疑者','我还是不信全部，但这一段你可以继续。','wry'))),
    ],{traits:axes([4,1],[6,1])}),
  ];
  if(year===2016) return [
    risk(year,'free-world','把第一批资源全送出去，先让世界用上','你愿意免费提供第一轮使用，赌后面会有人留下。支持、维修与答疑却不会因为免费而自动消失。','communication',.54,[
      result('人真的来了，求助也跟着排满','使用者数量跳了一大截，新的合作从四面八方找来。你答应的免费支持也开始吃掉每个晚上的时间。',{ecosystem:28,reputation:18,money:-8,energy:-16,stress:13},impact({career:20,legacy:12,wealth:-7,health:-9},{burden:27,leverage:14,trustDebt:8},'慷慨可以打开机会，也可能把没有定价的服务变成长期无上限的承诺。'),feedback('新用户的感谢和报错挤在同一页，值班表已经没有空格。',reaction(c.peer,'我也想帮他们，可谁来接明天早上的班？','tense'))),
      result('有口碑，没有足够续单','有人喜欢、有人转发，却很少有人愿意进入付费合作。支持请求照来，下一批资源的费用没有一起出现。',{ecosystem:12,reputation:8,money:-10,energy:-15},impact({career:8,wealth:-8,health:-8},{burden:22,leverage:18,trustDebt:6},'受欢迎和能够继续支付服务成本，是两件不同的事。'),feedback('感谢信越来越多，续单栏仍然很短。',reaction(c.peer,'大家说好，但我们还得发下一轮工资。','tense'))),
      result('免费承诺拖垮了第一轮支持','使用者的问题远超准备的人手。免费资源先停，失望的人却开始追问那句“放心用”。',{money:-13,reputation:-12,energy:-20,stress:22},impact({wealth:-10,career:-7,health:-10,legacy:-5},{burden:30,trustDebt:23,leverage:20},'没有能力承接的善意，也可能让依赖它的人受到损失。'),feedback('支持页面挂出暂停消息，下面仍不断出现新的求助。',reaction(c.client,'我们按你们的承诺排了计划。','angry'))),
    ],{cost:{money:-6},traits:axes([9,1],[10,1])}),
    career(year,'grumpy-users','优先把资源交给会挑刺的使用者','留出一小批给愿意公开限制和问题的人，不要求他们帮忙说好话；先听见真实的不方便。',[
      result('评语很难看，第二版却容易用了','第一份反馈写满抱怨，几处最常见的卡点也终于有了具体描述。你用一部分宣传机会换回了能修改的清单。',{engineering:9,ecosystem:7,reputation:2,energy:-5},support,feedback('演示页没有漂亮推荐语，使用说明却少了三次求助电话。',reaction(c.client,'现在总算不用每一步都找你们。','warm'))),
    ],{traits:axes([6,1],[11,-1])}),
  ];
  if(year===2024) return [
    risk(year,'presale',c.canSell?'先卖一个超出把握的交付日期':'先承诺一个超出把握的上线日期','你看着对方准备签字，决定把供应、验证与支持的不确定性藏在一个漂亮日期后面。能抢到机会，也可能把所有人绑到同一场追赶里。','communication',.49,[
      result('预期冲上来了，交付开始追着你跑','合作方接受了日期，资金或项目资源迅速到位。排期的人看完承诺，只问了一句，少掉的那几周准备从谁的睡眠里拿。',{money:35,reputation:20,energy:-12,stress:18},impact({wealth:25,career:20,health:-8,freedom:-10,legacy:-6},{leverage:28,burden:28,trustDebt:22},'一张漂亮的承诺可以提前换来资源，也会把未解决的困难推给后面每一个人。'),feedback('订单和支持涌进来，排期表上的红色日期也一并亮起。',reaction(c.peer,'这日期是商量过的，还是已经替我们答应了？','angry'))),
      result('先拿一部分，剩下看实际交付','对方只确认阶段性支持。你仍然背着那个日期，但已经没有原来设想的全部缓冲。',{money:14,reputation:5,energy:-14,stress:20},impact({wealth:10,career:7,health:-8},{leverage:23,burden:25,trustDebt:20},'没有拿齐的好处，也可能留下完整的承诺压力。'),feedback('金额被划掉一半，日期却没有跟着往后挪。',reaction(c.client,'后面的支持，等你做到再说。','tense'))),
      result('对方看穿了日期，原有说法也被重查','供应与测试窗口对不上，承诺当场被追问。你没有抢到这次机会，已有合作也开始要求更细的证明。',{money:-8,reputation:-20,energy:-12,stress:25},impact({wealth:-6,career:-10,legacy:-8,health:-7},{trustDebt:30,burden:22,leverage:15},'夸大的日期可能让一次竞标失败变成长期信用折扣。'),feedback('签字笔被盖上，对方把计划表推回到你面前。',reaction(c.client,'哪一个日期是你们真正有把握的？','angry'))),
    ],{traits:axes([9,1],[11,1])}),
    career(year,'live-failure','直播一次真实失败，邀请用户一起看修复','只展示获准公开的小样，不拿保密材料博关注。你愿意被看见卡住，也要准备把限制说清。',[
      result('现场卡住了，观众反而留下来问问题','你说：“這裡確實還不行，別照著廣告想像。”演示没有光滑收尾，却有人带来能重现同一问题的条件，后续交流终于具体。',{communication:10,engineering:6,reputation:5,control:-4,stress:4},impact({career:6,legacy:8,belonging:4},{support:10,trustDebt:-8,burden:3},'真实的限制可能损失一部分热度，也能找到更适合共同解决问题的人。'),feedback('直播里短暂一片静止，评论区开始贴出具体复现条件。',reaction('观看演示的使用者','别切走，我想知道它到底卡在哪。','hopeful'))),
    ],{traits:axes([4,1],[6,1],[11,1])}),
  ];
  if(year===2026) return [
    risk(year,'blame','把说明写成“团队执行出了偏差”','你想保住自己的位置，把共同决定里的个人责任淡去。团队成员可能暂时沉默，也可能决定不再替这份说明站在一起。','communication',.42,[
      result('职位暂时稳住，愿意说真话的人少了','这份说明让你继续留在眼前的位置。散会后，几位同事开始只通过正式记录回复，你失去了以前那种直接提醒。',{control:20,reputation:8,money:10,bonds:-20,stress:14},impact({career:18,wealth:7,belonging:-10,legacy:-10},{trustDebt:30,burden:20,support:-12},'甩出去的责任可能暂时保住位置，也会让真正知道情况的人不再愿意靠近。'),feedback('会议室里没有人反驳，门外却再没有往常的小声提醒。',reaction(c.peer,'以后我们只确认自己签过的部分。','angry'))),
      result('说明被退回，团队要求逐条对照','你暂时没有失去全部职责，责任的描述却要重新写。原想省掉的解释，变成了更长的对照会议。',{control:5,reputation:-5,bonds:-12,stress:20},impact({career:4,belonging:-8,legacy:-7},{trustDebt:24,burden:23,support:-8},'省略个人责任会让解释变得更难，而不是更短。'),feedback('稿子被划得满是红线，最后一页写着“逐项确认”。',reaction(c.authority,'我们需要的是发生过什么，不是谁更方便承担。','tense'))),
      result('同事公开了各自的记录，甩锅失效','团队不愿接受那份描述。你需要面对失去的支持和更严格的职责限制，不能再靠所有人一起沉默度过这一轮。',{control:-15,reputation:-25,bonds:-22,stress:25},impact({career:-10,belonging:-10,legacy:-10},{trustDebt:30,burden:25,support:-15},'把别人推到前面，可能让本来还愿意合作的人一同离开。'),feedback('有人把座位移到另一边，原稿没有得到任何签字。',reaction(c.peer,'我不会替这段话证明。','angry'))),
    ],{traits:axes([4,-1],[8,1])}),
    career(year,'plain-account','不用漂亮说明，当着团队认领自己作过的决定','逐项说明自己确实参与和负责的部分，不替未明的事实下结论；让其他人有机会更正你的记忆。',[
      result('没有掌声，终于有人开始补充事实','你说：“我做過的決定，我自己說清楚。”没人立刻原谅或表态，后来却有人拿出自己保留的记录。你失去了一部分控制，也重新得到可以核对的对话。',{control:-12,reputation:-3,bonds:4,stress:7},impact({career:-4,legacy:7,belonging:4,freedom:3},{trustDebt:-10,support:8,burden:6},'承担真实责任不保证被原谅，但可能停止继续制造新的信用欠账。'),feedback('桌上没有发布稿，只摊开了几份各自留下的记录。',reaction(c.peer,'这部分我记得不一样，我们把它对上。','tense'))),
    ],{traits:axes([4,1],[6,1],[8,-1])}),
  ];
  if(year===2028) return [
    risk(year,'comeback-show','先办一场复出秀，把旧头衔换成新筹码','你想让人先看见气势，再慢慢补齐产品和团队；一场热闹也可能把“重新开始”变成第二次大承诺。','communication',.46,[
      result('关注回来了，第一次交付也提前被追问','人们愿意再给一次机会，新的资源跟着来了。小团队还没坐齐，外界已经按从前的规模等你回答。',{money:30,reputation:23,stress:18,energy:-12},impact({wealth:22,career:22,health:-7,freedom:-9},{leverage:27,burden:25,trustDebt:18},'旧名气可以提前换来机会，也可能让新尝试承受远高于实际规模的期待。'),feedback('活动刚结束，第一批交付询问已经挤进新团队的邮箱。',reaction('新搭档','他们等的是从前那个规模，可我们才刚开始。','tense'))),
      result('热搜过去，留下几份待确认意向','有人来谈，却没有全部付款。场地和宣传费用已经花掉，团队得靠很薄的余款做出真正能交的东西。',{money:9,reputation:10,energy:-12,stress:19},impact({wealth:6,career:8,health:-7},{leverage:22,burden:23,trustDebt:15},'声量转成可持续工作需要时间，热闹本身不会替团队支付费用。'),feedback('海报还挂着，会场外只剩工作人员收线。',reaction('新搭档','明天没有镜头，我们先做哪一个？','tense'))),
      result('大家记得过去，却没买这次的承诺','活动没能换来足够支持。你花掉了启动余地，还要面对那些已经按宣传安排时间的人。',{money:-12,reputation:-15,energy:-13,stress:23},impact({wealth:-10,career:-9,health:-8},{leverage:25,burden:24,trustDebt:22},'旧头衔不保证新的信任，复出也不能只靠一次亮相完成。'),feedback('第一排空椅子被收起来，搭档开始重算下一月的支出。',reaction('新搭档','我们得先把能兑现的部分缩回来。','tense'))),
    ],{cost:{money:-6},route:'studio',flags:['impact_2028_comeback_show','future_restart_plan','future_restart_attempt'],traits:axes([0,1],[11,1])}),
    career(year,'apprentice','去新团队当一回没头衔的学徒','你接受一段有限合作，从对方真正缺的工作开始；没有人保证听从你从前的办法。',[
      result('第一次例会，你的建议被年轻人改了','你忍住了想拿资历压人的冲动，按新的工具把小任务重新做完。收入不高，却有人愿意下次继续把具体的工作交给你。',{engineering:10,bonds:6,control:-12,money:3,stress:-3},impact({career:5,wealth:2,legacy:5,freedom:6},{support:9,trustDebt:-4,burden:-3},'放下旧位置可能换来新的学习空间，关系也可以从完成小事重新建立。'),feedback('工位上没有职务牌，只贴了一张还没划完的任务单。',reaction('年轻搭档','这个方法更省事。你要不要再试一次？','hopeful'))),
    ],{traits:axes([4,1],[8,-1],[15,1])}),
  ];
  if(year===2032) {
    const money=state.stats?.money??0,burden=state.lifeCourse?.pressures?.burden??20,network=state.lifeCourse?.pressures?.support??44;
    const supported=money>=50&&burden<45&&network>=55;
    const fragile=money<35&&burden>=55;
    const keepOutcome=supported
      ?result('积累下来的余地，终于能留住这群人','你把储备和已有的负责人逐项排进去，确认这一轮不用撤掉任何方向。团队不是靠加班硬撑；有人从上一项工作腾出手，正好接住了新的缺口。',{bonds:10,leadership:8,engineering:6,money:-12,energy:-3},impact({belonging:8,career:7,wealth:-7,legacy:6},{support:12,burden:3,leverage:5,trustDebt:-4},'过去攒下的现金、分工和支持，让这一轮留人真正有了承担的能力。'),feedback('几位负责人直接约起交接，不再每件事都转向你。',reaction(c.peer,'这次有钱，也有人接。我愿意把这一轮做完。','hopeful')))
      :fragile?result('大家先松口气，下一轮的钱仍没有着落','你没有撤掉任何方向，散会时有人感谢你。工资和开支的日期却没变，预算只够撑过眼前一段；你把更难的取舍推给了下一次。',{bonds:8,leadership:3,money:-12,energy:-13,stress:15},impact({belonging:6,career:2,wealth:-9,health:-7,freedom:-7},{burden:25,leverage:23,trustDebt:16},'短期士气上来了，低现金和已有积压却让这项善意很难持续，后面可能一起拖慢。'),feedback('大家回去开工，只有你还盯着下一次发薪日。',reaction(c.peer,'人留下了。下一轮缺的那一块，你准备什么时候告诉大家？','tense')))
        :result('都先留下，但范围必须重新排','你保留了团队，也让每位负责人删掉一项暂时做不了的目标。不是所有方向都能按原速度推进，至少这次没人被要求用一句感谢代替实际预算。',{bonds:7,leadership:5,money:-10,energy:-7,stress:7},impact({belonging:5,career:4,wealth:-6,health:-3},{support:4,burden:13,leverage:10,trustDebt:5},'已有资源能支持一次调整，仍需缩范围；之后能否维持取决于现金、积压和有人愿意分担。'),feedback('项目没有被撤下，几条日期被认真往后挪了。',reaction(c.peer,'留下可以，别再把删掉的目标悄悄加回来。','tense')));
    return [
    career(year,'no-one-leaves','为了不撤掉任何项目，把所有人都留下',supported?'已有储备和能分担的负责人，够你认真撑一轮。留下团队仍要花钱，也要让分工真正运行。':fragile?'账上的钱很薄，前面的积压还没消化。你想先稳住所有人，也得承担把难题推到下一轮的风险。':'你想保留各条方向和一起工作的人。现有资源能撑多久，要看范围肯缩多少、谁能真正接手。',[keepOutcome],{traits:axes([3,-1],[9,1],[10,1])}),
    risk(year,'odd-collab','拿最后一段试验预算，和跨行的人做个怪东西','把范围限定为一件能展示、能停下的小作品。设计师、研究者或手艺人都可以反驳你的技术方案。','engineering',.54,[
      result('没人事先猜中的用途出现了','小作品没有长成原来的设想，却有人带来真正需要它的场景。你愿意让外行的那一笔留在最后版本里，新的合作因此继续。',{engineering:18,ecosystem:13,money:12,bonds:6,control:-8},impact({career:18,wealth:8,legacy:12,freedom:5},{support:12,burden:5,leverage:4},'有范围的大胆合作可能打开新用途，前提是愿意承认别人也能改变方向。'),feedback('展示台上那个奇怪的小东西被人来回试了好几次。',reaction('跨行搭档','你看，它不是只能干你最初想的那一件事。','wry'))),
      result('没有新业务，做成一件有人喜欢的东西','它还不足以支撑一条业务，却完成了约好的小范围。大家带着各自学到的办法离开，没有谁被要求无限免费续做。',{engineering:8,bonds:7,ecosystem:5,energy:-4},support,feedback('有人给小作品拍了照，随后认真问清能公开哪些部分。',reaction('跨行搭档','小一点也可以，我们确实做完了。','warm'))),
      result('想法没有落地，合作按约结束','各自的限制没能在这一次拼起来。你们如实留下失败记录，按最初范围结束，预算没有继续往下烧。',{money:-5,engineering:4,energy:-6,stress:5},impact({wealth:-4,career:2,legacy:4},{burden:4,support:4},'能体面停下的小试验，为以后继续合作留下余地。'),feedback('展台撤了，搭档把未完成的草图各自带回去。',reaction('跨行搭档','这次不行，也不用把彼此说成错的人。','warm'))),
    ],{cost:{money:-5},traits:axes([0,1],[5,1],[8,-1])}),
  ];
  }
  return [
    risk(year,'last-grand-bet','七十三岁，再押一次大的','你说：“我還想再試一次大的。”桌上是能投入的余款和接下来的交付日期；押下去之后，更多日子会重新被工作占去。','engineering',.42,[
      result('新工作站住了，代价也真的落下','这一轮得到使用者和合作方的支持，你又有了值得投入的事业。日历里的私人约定却被挤得很薄，成功没有把那些时间自动还回来。',{money:30,reputation:22,engineering:16,energy:-22,stress:22},impact({career:25,wealth:22,legacy:12,health:-10,freedom:-10,belonging:-8},{burden:30,leverage:25,trustDebt:16},'再一次跃升可以发生，也可能让余下生活继续围着大承诺运转。'),feedback('新项目的第一盏灯亮了，你的晚饭提醒已经响过两次。',reaction(c.peer,'成了。接下来谁来保证你真能回去休息？','tense'))),
      result('做出一半，仍有很多事等你收尾','项目能继续，却没有达到那次大承诺的规模。你需要缩小下一轮，而不是靠更大的话把它继续顶起来。',{money:10,engineering:10,energy:-20,stress:23},impact({career:11,wealth:7,health:-10,freedom:-9},{burden:28,leverage:22,trustDebt:18},'有限成果仍是真成果，未兑现的部分也仍有人等你交代。'),feedback('第一轮数据停在半张表上，下一次收尾的日期已经有人来问。',reaction(c.peer,'把剩下的说实在，我们还能一起算。','tense'))),
      result('这次没有翻身，剩下的责任仍要处理','关键支持没有到位。你停下继续扩大的计划，开始逐项处理已经答应的工作；失败没有取消那些需要自己面对的人。',{money:-15,reputation:-15,energy:-23,stress:27},impact({wealth:-10,career:-10,health:-10,belonging:-6},{burden:30,leverage:28,trustDebt:22},'晚年的豪赌也可能失利，留下的损失和收尾仍需自己承担。'),feedback('新计划从白板上撤下，桌上留下的是还要回的电话。',reaction(c.peer,'现在先告诉大家，哪些还能做完。','tense'))),
    ],{cost:{money:-8},flags:['impact_2036_last_grand_bet','future_keep_building'],traits:axes([0,1],[12,1])}),
    career(year,'leave-the-chair','最后一次开会，坐到没有签字权的那一边','不替下一位负责人补每一句话。你保留约好的帮助，也允许团队采用你不喜欢但愿意自行负责的办法。',[
      result('有人作了你不会作的决定，会议照样结束','你几次想伸手拿回笔，最后还是放下了。下一位负责人承担了自己的决定，散会时没有人再追着你签最后一格。',{control:-20,energy:12,stress:-10,leadership:8,bonds:6},impact({legacy:10,freedom:9,health:6,belonging:5},{burden:-15,support:10,trustDebt:-4},'真正交出位置，才可能把时间和判断权一起留给后来的生活。'),feedback('签字笔停在另一个人手里，你第一次可以按时离开。',reaction('接手的人','这次由我负责。需要你的时候，我会照约定来问。','hopeful'))),
    ],{flags:['impact_2036_leave_the_chair','future_handoff_done','future_retire'],traits:axes([8,-1],[13,1],[14,1])}),
  ];
}

const CAREER_SCENES = [
  '轮到你朗读时，鞋尖碰了一下桌腿。后排有人抬头，汤姆没说话，把书朝你这边推了推。',
  '出餐铃连续响了三次，艾迪手里的杯子还没擦干。领班的笔悬在排班表上，等你一句答复。口袋里的作业纸已经被围裙压皱。',
  '装箱前，电路板在陈立文手里只亮了一下。他伸手扶住松掉的线，门外已经在催下一组。你的履历还摊在桌上，那段毕业项目是你自己写的。',
  '评审已经到齐，同事还在替你改最后一页图。投影一亮，有人顺着标题念出了你的名字。还在改图的人没抬头。',
  '咖啡已经凉了，房东又来电话。伙伴把笔推到你面前：“明天我过来吗？来之前，我得把手上的班调开。”',
  '催进度的电话一响，屋里打字的人都停了。故障记录就摆在你手边，有人等你报一个新的交付日期。',
  '测试又停在同一步，待交付的箱子已经封上。负责测试的人把红色记录单推过来，验收那一栏还没签。',
  '对方把合作条款推过来，独占期限压在报价下面。搭档往下读了一遍，问这段时间里，原来答应的其他客户要怎么回。',
  '门外有人等着签字，桌上的方案还没看完。有个工程师第三次抬手，这回终于开口：“能先听我说一下这个问题吗？”',
  '新结果刚出来，有人笑了一声。旧项目的求助消息这时也跳了出来。两边都在等你回话。',
  '第一批使用者已经到了，管支持的人还没顾上吃饭。刚发来一条“装好了，谢谢”，下一条就是故障日志。',
  '交付日投在墙上，下面的小字列着设备到货和验证的时间。对方已经拿起笔，负责测试的人还在摇头：“这一天还签不了。”',
  '会议室里少了往常的寒暄，水杯都没怎么动。有人把自己的记录摆在身前，像是在提醒你，这次每个人都会记得你说过什么。',
  '活动海报上还印着你的旧头衔。搭档把电脑转过来，屏幕上是今天没做完的活。他问你下次什么时候有空一起看。',
  '散会前，有人把下一次测试的日期写进记录，问出了故障该把日志发给谁。那一栏还没人签。',
  '旧名片从笔记本里滑出来，下一位负责人把新计划放在它旁边。你伸手想拿回那支签字笔，又看见了日历上已经答应别人的那顿晚饭。',
];

function lifeChoices(state,year) {
  const life=state.life||{};
  const couple=paired(life), name=couple?partner(life):'';
  const child=life.children==='parent';
  const close=couple?name:year<1984?'Jeff':'陈立文';
  const valued=impact({belonging:7,health:3,freedom:3},{support:8,trustDebt:-5,burden:-2},'把具体时间交给这段联系，比再说一次保证更能留下支持。');
  if(year===1973) return [
    personal(year,'hero-letter','把信写成“我過得特別好”，只让家里开心','把想家和没听懂的话都删掉，画一个夸张的笑脸。父母会少担心，你也暂时不用解释。','家里可能以为你不需要帮助，下一封信更难突然说出难处。','信寄出去了，你看着空白的信纸背面，才想起最想说的那句话还在心里。Jeff 没拆穿，只把晚饭的位置留给你。',{bonds:2,stress:5,energy:-2},{impactPrivate:'bright_letter'},impact({belonging:2,health:-4},{trustDebt:5,burden:8,support:-3},'报喜看似体贴，也可能让需要帮助的部分越来越难开口。'),feedback('信封合上后，宿舍反而显得更安静。',reaction('Jeff','那句想家的话，下次还写吗？','tense'))),
  ];
  if(year===1978) return [
    personal(year,'date-all','谁约都答应，先过一个最热闹的周末','练球、做饭、加班，你先都说好。眼前谁都没被拒绝，真正到时间时却只能在一个地方。','至少一项约定会落空，别人要替你的迟到调整安排。','你在三个地方之间来回赶，最后带着冷掉的食材进门。大家仍给你留了座位，但下次的邀请不再等你先点头。',{money:5,bonds:3,energy:-12,stress:9},{impactPrivate:'overbooked',workBoundary:'porous'},impact({wealth:4,belonging:3,health:-7,freedom:-6},{burden:16,trustDebt:12},'不愿拒绝任何人，可能让所有关系都分到一次失约。'),feedback('桌上的菜热过两遍，球友已经先回家了。',reaction('艾迪','你要是说来不了，我们就不用一直等。','angry'))),
    personal(year,'terrible-song','收班后唱一首跑调的歌，替艾迪庆生','不买昂贵礼物，和同事用纸帽子和一首歌凑个生日。你可能成为今晚最好笑的那个人。','要留出收拾时间，也得忍住别人笑你走调。','第一句就走了调，艾迪笑得差点吹灭蜡烛。你们把最后一桌收好才离开，没有赚更多钱，却记住了这个普通晚上。',{bonds:8,energy:-3,stress:-5},{socialPractice:'open_table',impactPrivate:'silly_birthday'},valued,feedback('纸帽子歪在艾迪头上，厨房里多笑了好一会儿。',reaction('艾迪','下次你负责吹蜡烛，我来唱。','wry')),axes([10,1],[14,1])),
  ];
  if(year===1984) return [
    personal(year,'grand-promise','先说“以後都陪你”，不细算自己做不做得到','你向麦雅表达交往意愿，她也愿意开始。你把同城、周末和旅行全说得很满，实际的工作还没定。','短时间的热烈背后，是日后要反复解释的日程落差。','麦雅笑着记下你说的几个地方。关系开始了，你也留下了超出当前把握的保证；第一封工作来信，就可能让其中一项改期。',{bonds:12,energy:-4,stress:5},{partner:'maya',formerPartner:'none',relationship:'dating',partnerCareer:'parallel',impactPrivate:'grand_promise',romancePromise:'shared_city'},impact({belonging:10,freedom:-5},{trustDebt:18,burden:12},'热烈的承诺能拉近距离，也可能让每次普通加班都变成一次失望。'),feedback('她把那张写满地点的纸折好，你还没敢说自己哪天能出发。',reaction('麦雅','那我们先定第一次，不要只说以后。','hopeful'))),
  ];
  if(year===1992) return [
    personal(year,'all-mine',couple?'家务、收入、照护都说“我来”，让对方安心':'主动包下家里大半事务，让大家先放心',couple?`你想让${name}少担心，先把能想到的责任都接过来。有没有时间做到，留给之后再想。`:'你向家人保证，联系、杂事和临时帮忙都可以先找自己。你想成为那个永远靠得住的人。','承诺过多，任何一项做不到都可能变成别人的被迫接手。','大家听到你愿意承担，确实松了口气。回家后你才发现，课表、工作和那份新清单没有办法同时塞进一个晚上。',{bonds:9,energy:-12,stress:10},{impactPrivate:'all_mine',workBoundary:'porous'},impact({belonging:7,health:-7,freedom:-8},{burden:22,trustDebt:15,support:-4},'替所有人承担看似体贴，却可能让家里的分工越来越依赖一个撑不住的人。'),feedback('清单被贴到门上，最下面还有三行没写完。',reaction(close,'我需要的是做得到的那几件，不是你一个人全包。','tense'))),
    personal(year,'bad-date',couple?'约一场便宜又笨拙的约会，认真说自己怕什么':'请老朋友吃一顿简单晚饭，承认自己也会害怕',couple?'不用高级餐厅，把晚课后的半小时留给对方。你不讲励志故事，只说自己最近担心什么。':'用家里现成的食材做饭，不讲自己有多能干；把最近真正担心的事说出来。','可能说得不漂亮，也不能保证对方立刻理解。','你说：“我其實也會怕。”菜有一点糊，话也断了几次，但对方没有催你把每句都讲成一个解决方案。',{bonds:7,stress:-5,energy:-3},{impactPrivate:'honest_table',familyPractice:'shared_table'},valued,feedback('那盘略糊的菜仍被吃完，饭后没有人急着起身。',reaction(close,'这样说，我才知道你这阵子怎么过的。','warm')),axes([5,1],[10,1])),
  ];
  if(year===1993) return [
    personal(year,'family-cheer','把创业讲成全家的大梦想，先争取所有人支持',couple?`你请${name}和家人一起想象成功后的生活，避开目前还没想清的风险。`:'你拉着家人朋友一起想象成功后的生活，先用热情把疑问压过去。','支持变得热烈，也更容易把你个人的选择变成全家必须承担的期待。','饭桌上有人开始讨论以后要去哪里旅行。你得到了鼓励，也知道最难回答的那几笔开支，今晚一句都没细说。',{money:10,bonds:8,stress:7},{impactPrivate:'family_campaign',familyExposure:'capped'},impact({wealth:7,belonging:6,freedom:-5},{leverage:15,trustDebt:20,burden:16},'把风险讲成共同梦想，可能获得资源，也可能让失望时没有人知道自己当初同意了什么。'),feedback('大家的兴奋散去后，预算表仍只有你一个人在看。',reaction(close,'高兴归高兴，最坏的时候到底要怎么办？','tense'))),
  ];
  if(year===1996) return [
    personal(year,'gift-cover',couple?'买一份昂贵礼物，把道歉先变成惊喜':'给家人朋友寄礼物，暂时不谈这次失约','你想让对方先开心，把难说的话留到以后。礼物能马上送到，缺席的那一晚却不会重新发生。','花掉一笔钱，仍可能没有回答对方真正介意的事。','礼物被收下了，包装纸也折好。对方没有和你争吵，只问了一句下次到底能不能到场，你还是没能马上回答。',{money:-8,bonds:4,stress:6},{impactPrivate:'gift_cover',relationshipRepair:'unrepaired'},impact({belonging:3,wealth:-6},{trustDebt:18,burden:9},'礼物可以表达心意，也可能在没有解释和改变时变成回避谈话的工具。'),feedback('礼盒放在桌边，原来的约定仍夹在日历那一页。',reaction(close,'东西我收到了。那天我等的是你。','tense'))),
    personal(year,'messy-truth','现在就打电话，说清自己今晚真的做不到','别先编一个听起来漂亮的理由。说明眼前情况，也接受对方会生气；补偿先从一件能做到的小事开始。','会失去眼前的体面，今晚的缺席仍然让人失望。','你说：“我今天做不到，是我先前答應得太滿。”对方沉默了很久，随后把真正需要你接手的那件事说了出来。',{bonds:-2,stress:3,energy:-3},{impactPrivate:'messy_truth',relationshipRepair:'heard',familyPractice:'scheduled'},impact({belonging:3,legacy:3},{trustDebt:-8,support:5,burden:-3},'诚实不一定马上换来好脸色，但可以停止在旧失约上再加一个新保证。'),feedback('电话没有立刻挂断，你终于听完了那一阵沉默。',reaction(close,'我现在确实很生气，但你先听完。','angry')),axes([4,1],[9,-1])),
  ];
  if(year===1997) return [
    personal(year,'romantic-rescue',couple?'临时订一场旅行，想一口气补回所有缺席':'临时把朋友聚会办大，想一下补回疏远','你跳过协调，先把热闹安排出来。有人会被打动，也有人已经有自己的时间和责任。','钱与时间先花出去，别人仍有权不配合这场补偿。','消息发出时，你以为大家会高兴。有人能来，有人需要改期；那份本想替所有人安排好的惊喜，最终又成了别人需要处理的事。',{money:-6,bonds:4,stress:8,energy:-5},{impactPrivate:'romantic_rescue'},impact({belonging:3,wealth:-5,freedom:-4},{trustDebt:12,burden:13},'盛大的补偿也需要当事人有空间接受，不能替对方决定怎样才算和好。'),feedback('你订好的安排停在屏幕上，回复却一条条问起不同的日期。',reaction(close,'你先问过我这天有没有空吗？','tense'))),
  ];
  if(year===1999) return [
    personal(year,'career-for-you',couple?'替伴侣把“更好的机会”安排好，再告诉对方':'替朋友联系一份“更好的工作”，等成了再说',couple?`你认定这个机会更适合${name}，先去问人、搭关系，想把好消息直接交到她面前。`:'你觉得朋友值得更好的机会，先替他联络，不等他说明自己想去哪。','帮忙越多，对方越难拒绝，也可能觉得自己的生活被你接管。','机会确实谈到了，对方却没有先说谢谢。你这才知道，那座城市、那份职责和那种生活，并不是自己认为好就能替别人决定。',{communication:5,bonds:-6,control:8,stress:5},{impactPrivate:'planned_for_you'},impact({career:3,belonging:-6,freedom:-4},{trustDebt:16,burden:9,support:-5},'善意的安排如果跳过对方意愿，也会留下控制与被控制的隔阂。'),feedback('对方没有接过那份资料，先把椅子转向了你。',reaction(close,'你已经替我答应到哪一步了？','angry'))),
  ];
  if(year===2007) return [
    personal(year,'secret-empty-day',couple?'给自己偷一天假，先不告诉伴侣':'给自己偷一天假，把所有消息先晾着','你真的累了，想暂时谁都不照顾。今天没有工作，也没有解释，手机被你压在一本旧书下面。','休息是真的，突然失联也会让原本在等消息的人担心。','你终于睡了一个长觉。醒来后精神好了一些，未接消息却排成一列；你省下的一次解释，换成了别人一整天的猜测。',{energy:16,stress:-9,bonds:-7},{impactPrivate:'vanished_day',workBoundary:'protected'},impact({health:9,freedom:6,belonging:-5},{trustDebt:16,burden:4,support:-4},'休息的需要没有错，失联的方式仍会影响在乎你的人。'),feedback('窗外已经暗了，手机上最后一条消息只有“看到后回一下”。',reaction(close,'我不需要你随时有空，但想知道你是不是平安。','tense'))),
    personal(year,'phone-in-drawer','把电话交给对方保管一小时，自己先坐下来','先把必要的联络交接好，再空出一小时吃饭、散步或聊天。不是考验谁更重要，只让这次见面真的发生。','工作消息会积累，一小时之后仍需自己处理。','你把手机放进抽屉，说：“一個小時，先把這頓飯吃完。”一开始你总想起身，后来终于听完了对方一个与你工作毫无关系的故事。',{bonds:7,energy:3,stress:-5},{impactPrivate:'drawer_hour',workBoundary:'protected',familyPractice:'shared_table'},valued,feedback('抽屉里震了两次，没有人去打开它。',reaction(close,'刚才那段，你以前总听到一半。','warm')),axes([7,1],[14,1])),
  ];
  if(year===2012) return [
    personal(year,'move-everyone','为了方便照顾，想把家人的生活都搬到自己身边','你觉得距离近就能解决问题，先把自己的便利和担心排在前面；家人熟悉的地方、朋友和习惯被挤到后面。','减少距离也可能增加抵触，照顾不等于拥有替别人安排住处的权力。','你说了许多搬近的好处，父母只问，那些每周见面的老朋友怎么办。计划没能像表格那样排好，Jeff 也要求你先听完他们的选择。',{control:7,bonds:-5,stress:8,energy:-5},{impactPrivate:'move_everyone',careBalance:'parents_choose'},impact({belonging:-4,freedom:-5,health:-3},{burden:16,trustDebt:14,support:-4},'想把照顾变简单，可能先把别人的完整生活当成了可以搬动的物品。'),feedback('整理到一半的纸箱被合上，父母又把老照片放回熟悉的柜子。',reaction('Jeff','近一点不是唯一的好办法，先听他们说。','tense'))),
  ];
  if(year===2016) return [
    personal(year,'family-fast-track',child?'把自己的关系网直接铺到孩子脚下':'替年轻朋友把路铺好，省掉他们慢慢试的过程',child?(year-(life.childStartYear||1990)>=18?'你想让成年孩子少走弯路，替他把岗位和人脉联系好，打算最后再送上这个惊喜。':'景安还在读书，你先替他联系好学校和课外活动，觉得等他看到机会就会理解自己的苦心。'):'你觉得自己见过足够多，愿意直接替对方选择方向、牵线和安排下一步。','资源更近了，对方却可能被推上不想走的路，也更难拒绝你的好意。','联系的人很快回复，机会看起来比从前顺畅。对方却问，这些安排里有多少是真的可以说不；你给出的帮助开始需要重新拆开。',{communication:6,control:8,bonds:-5},{impactPrivate:'family_fast_track',parenting:child?'guide':life.parenting},impact({career:4,belonging:-5,freedom:-5},{trustDebt:18,burden:10,support:-5},'一口气铺好的路，可能让受到帮助的人失去尝试和拒绝的空间。'),feedback('几封热情的介绍信发出后，真正要走那条路的人反而沉默了。',reaction(child?'景安':'年轻朋友','如果我不想去，会不会让你很没面子？','tense'))),
  ];
  if(year===2024||year===2026) return [
    personal(year,'display',couple?'请伴侣陪你公开露面，把关系当作一张证明':'拉家人朋友一起公开露面，让外界看见支持','你想用一张合影结束猜测，对方可以拒绝；你仍不断强调这次露面对自己有多重要。','短期可能换来好看的画面，亲近的人却要承担原本不属于他们的公开压力。','有人勉强答应只待十分钟，拍照时也没有说你期待的那段话。画面发了出去，你和对方之间却多了一件需要私下处理的事。',{reputation:14,communication:4,bonds:-12,stress:10},{impactPrivate:'public_display',publicBoundary:'brief',relationshipRepair:'unrepaired'},impact({career:8,belonging:-9,legacy:-6,freedom:-6},{trustDebt:25,burden:15,support:-8},'拿亲近的人作公开背书，可能得到一张照片，却让真实关系更难承受。'),feedback('闪光灯停了，对方先离开了镜头，没有等你一起说结束。',reaction(couple?name:'家人或朋友','我来这十分钟，不等于替你证明所有事。','angry'))),
    personal(year,'no-performance','取消原定的公开合影，接受关系现在不好看','明确告诉组织者不安排家人或朋友配合表态。该解释的工作由自己解释，私人关系留给当事人慢慢决定。','少了一次轻松化解外界观感的机会，私下的分歧也仍在。','你退掉了那个拍照环节，没有把空下的位置解释成任何人的对错。对方没有马上靠近，却第一次不用担心下一次见面又会出现镜头。',{reputation:-3,bonds:4,stress:3},{impactPrivate:'no_performance',publicBoundary:'private',workBoundary:'protected'},impact({belonging:5,freedom:6,legacy:4},{trustDebt:-9,support:5,burden:-3},'不要求亲近的人替自己表演，可以给真实相处留下空间。'),feedback('背景板撤了，原本预备合影的位置变回普通空地。',reaction(close,'这次我可以只考虑自己想不想来。','warm')),axes([8,-1],[9,-1],[11,-1])),
  ];
  if(year===2028) return [
    personal(year,'new-life-sprint',couple?'把重新开始安排得满满当当，不给旧问题留空':'把新生活排得满满当当，尽量不再想过去','旅行、朋友和活动一个接一个。你想用忙碌证明自己已经走出来，也把难谈的话继续往后推。','短期热闹和轻松不等于旧问题已经解决，身体也需要空下来。','照片里的你看起来很忙。夜里一个人坐下时，那些没有说完的话仍会回来；你换了日程，还没有给自己一个真正慢下来的晚上。',{reputation:5,bonds:3,energy:-10,stress:6},{impactPrivate:'new_life_sprint'},impact({freedom:4,belonging:2,health:-7},{burden:17,trustDebt:10},'用热闹填满恢复期，可能暂时逃开难处，却让它们一直没有被处理。'),feedback('下一张活动票已经订好，桌上的旧信仍没有拆完。',reaction(close,'你是真的想去，还是一停下来就难受？','tense'))),
  ];
  if(year===2032) return [
    personal(year,'memoir-spice','把最私密的争执写进书里，让故事更好卖','你想留下一个让人记得的版本，把别人不愿公开的细节也当成自己的叙事材料。编辑提醒你，故事有吸引力不等于你有权替别人公开。','书稿可能更受关注，也可能让相关的人决定不再向你说真话。','编辑认真讨论了那一章，也要求你重新确认当事人的同意。稿子暂时没有出版，亲近的人得知内容后，却已经开始把一些话留在心里。',{communication:8,reputation:8,bonds:-14,stress:10},{impactPrivate:'memoir_spice',memoirBoundary:'consent'},impact({career:6,legacy:-10,belonging:-9},{trustDebt:24,burden:14,support:-8},'把私密经历当作亮点，可能先失去继续了解那些人的资格；写成稿不代表可以发布。'),feedback('那一章被夹上醒目的纸条，相关的人没有再问你写到哪里。',reaction('编辑','这段会有人看，但你还没得到当事人的同意。','tense'))),
  ];
  return [
    personal(year,'one-last-sacrifice',couple?'再请伴侣让一次步，说这是最后一次':'再请亲近的人多担待一次，说这是最后一次','你仍想追一项工作，想用“只剩這一次”争取对方让出原来的安排。对方可以拒绝，但你知道这句话很难轻松回答。','可能多出一段工作时间，也可能让多年积累的等待再次变得没有终点。','你腾出了一段工作时间，对方却没有像从前那样替你圆场。晚饭各自安排，原定的共同日程留了一处空白；最后一次仍需要由实际行动证明。',{engineering:6,energy:-8,bonds:-9,stress:8},{impactPrivate:'last_sacrifice',workBoundary:'porous'},impact({career:6,belonging:-8,health:-5,freedom:-5},{trustDebt:20,burden:18,support:-6},'多年的承诺仍会伤人，不能因为叫作最后一次就自动获得体谅。'),feedback('日历上的约定被划掉，对方没有再追问哪一天补上。',reaction(close,'这句话，我记得听过不止一次。','angry'))),
    personal(year,'ordinary-fool','学一段很笨的舞，邀请别人来笑一笑','选一段负担得起的练习，不追求上台或获奖。想来的人一起跳，不愿意的人只坐着看也可以。','会出糗，也得接受自己的身体和学习速度与过去不同。','你把左右脚跳反了两次，旁边的人也笑着踩错拍子。音乐结束后没人问成就，你认真问了一句，下周同一时间还来不来。',{energy:5,bonds:7,stress:-8},{impactPrivate:'ordinary_fool',lateLifeFocus:'hobby',hobbyPractice:'weekly',workBoundary:'protected',nextChapter:'explore'},impact({health:6,belonging:6,freedom:7},{support:7,burden:-8,trustDebt:-3},'不用证明什么的共同活动，也能成为以后愿意继续赴的约。'),feedback('音乐停了，鞋底在地上拖出的半圈还留着。',reaction(close,'下周还跳这段吧，至少我终于记得第一步了。','wry')),axes([13,1],[14,1],[15,1])),
  ];
}

function lifeMoment(state,year) {
  const life=state.life||{},couple=paired(life),who=couple?partner(life):year<1984?'Jeff':'陈立文';
  if(year===1973) return '笔尖停在“这里很好”后面，墨水洇出一个小点。Jeff 看了看那张纸，问你要不要一会儿再写。';
  if(year===1978) return '你把口袋里的钱数了一遍，班表还没交。苏珊问你周六会不会来，她得知道要不要再叫一个人。';
  if(year===1984) return '门外有人搬走最后一箱东西，脚步声在空走廊里格外响。麦雅在等你回话，问你下次什么时候还能见。';
  if(year===1992) return `${who}没有接你说到一半的玩笑，先把日历转向你。晚课和工作已经写满了，你准备答应的那些事，纸上却还没有位置。`;
  if(year===1993) return '饭吃完了，预算纸还压在杯底。席间有人说“支持你”，也有人一直没开口。散席前，有人指着那张纸问：“这个数，你自己能拿出多少？”';
  if(year===1996) return `你把电话拿起来，想起${life.children==='parent'?'孩子还在问你会不会来':couple?`${who}问你几点到`:'Jeff 还等着今晚那通电话'}，手停在拨号键上。`;
  if(year===1997) return '柜门一开，旧东西滚到脚边。你蹲下去捡，想起上一次说“改天吧”的那个下午，后来还真没再约。';
  if(year===1999) return `${who}讲到一半，你已经伸手去找通讯录。对方按住那张计划：“等一下，我还没讲完。”`;
  if(year===2007) return '饭快凉了，手机又亮起来。对面的人讲到一半停下筷子，问你：“你是不是还得回去忙？”';
  if(year===2012) return '父母的照片放在旧柜子边，Jeff 挂断电话后没有马上收起本子。每个人都说自己还能撑，可那张轮值表上仍有一整天没有名字。';
  if(year===2016) return `${life.children==='parent'?'景安':'年轻朋友'}本来想说自己的计划。你一开口安排，他就把话咽了回去。过了一会儿，他又问：“我能先说完吗？”`;
  if(year===2024||year===2026) return `有人已经给合影留了位置，${couple?partner(life):'你身边的人'}还站在原地。摄影的人举着相机，问还拍不拍。`;
  if(year===2028) return '新的日历看起来很满，桌上那几封旧信却一直没动。朋友问你最近好不好时，你差一点又拿工作的进度来回答。';
  if(year===2032) return '编辑在一段私人对话旁画了圈。那句话你记得很清楚，连当时在哪儿说的都记得。你还没问过开口的人，愿不愿意让这一段见报。';
  return `${who}慢慢说起下一周的安排。你原想照旧回一句“改天”，翻了翻日历，手指还按在一个空格上。`;
}

export function enrichDilemmaScene(scene,state,domain) {
  if(state?.dynamicsEdition!==EDITION || !scene || !Number.isInteger(state.step) || !['career','life'].includes(domain)) return scene;
  const year=YEARS[state.step];
  if(!year) return scene;
  const field=domain==='life'?'options':'choices';
  const existing=scene[field];
  if(!Array.isArray(existing) || existing.some(option=>option.id?.startsWith(`impact-${year}-${domain}-`))) return scene;
  const added=(domain==='life'?lifeChoices(state,year):careerChoices(state,year)).slice(0,Math.max(0,8-existing.length));
  let moment=domain==='life'?lifeMoment(state,year):CAREER_SCENES[state.step];
  if(year===2036) {
    const keepsake=state.flags?.home_letter?'小时候寄回家的那封长信':state.life?.hobby==='table_tennis'?'那只已经磨旧的球拍套':state.life?.hobby==='cooking'?'夹着油渍食谱的旧本子':'翻过许多次的旧日历';
    moment+=` 你又想起${keepsake}。`;
  }
  const story=year===2036&&domain==='career'&&typeof scene.story==='string'
    ?scene.story.replace('六种选择都会留下遗憾；这一次，决定的是今后把时间交给哪里。','你翻到下一页日历，上面还有几件已经答应别人的事。')
    :scene.story;
  // Only the scene is copied. Existing option objects and all their effects are
  // retained verbatim; the old save edition never reaches this branch.
  return {...scene,story:[story,moment].filter(Boolean).join('\n'),[field]:[...existing,...added],
  };
}
