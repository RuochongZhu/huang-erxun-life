import { groundScene, NARRATIVE_SOURCES } from './narrative.mjs';
import { groundCareerScene, CAREER_SOURCES } from './career-life.mjs';
import { createFutureCompanyScene, COMPANY_SOURCES } from './story-company.mjs';
import { isExpandedStory } from './story-timeline.mjs';
import { enrichDilemmaScene } from './story-dilemmas.mjs';
import { enrichContinuityScene } from './story-continuity.mjs';
import { enrichLayoffScene } from './story-layoff.mjs';
import { enrichAffairScene } from './story-affair.mjs';
import { enrichIfScene } from './story-if.mjs';

export const SOURCES = [
  ...COMPANY_SOURCES,
  ...CAREER_SOURCES,
  ...NARRATIVE_SOURCES,
  {id:'witt',title:'《The Thinking Machine》出版方公开试读',url:'https://cdn.penguin.co.uk/dam-assets/books/9781847928276/9781847928276-sample.pdf',note:'少年时期与早期经历；仅引用公开试读。'},
  {id:'osu',title:'俄勒冈州立大学工程名人堂：黄仁勋',url:'https://engineering.oregonstate.edu/alumni-partners/oregon-stater-awards/searchable-awards-database/jen-hsun-huang-engineering-hall'},
  {id:'bio',title:'NVIDIA 官方履历：黄仁勋',url:'https://nvidianews.nvidia.com/bios/jensen-huang'},
  {id:'timeline',title:'NVIDIA 官方公司时间线',url:'https://www.nvidia.com/en-us/about-nvidia/corporate-timeline/'},
  {id:'early',title:'NVIDIA 官方时间线（西语版，含早期产品）',url:'https://www.nvidia.com/es-la/about-nvidia/corporate-timeline/'},
  {id:'ntu',title:'黄仁勋 2023 年台大毕业演讲（NVIDIA 摘录）',url:'https://blogs.nvidia.com/blog/huang-ntu-commencement/',note:'关于与世嘉合作的回顾是当事人自述。'},
  {id:'tae',title:'Sherwood News：Tae Kim 谈 NVIDIA 的早期历史',url:'https://sherwood.news/tech/nvidias-rise-to-the-top-tae-kim-on-how-it-happened/'},
  {id:'alexnet',title:'2012 年 AlexNet 原论文',url:'https://papers.nips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf'},
  {id:'dgx',title:'NVIDIA GTC 回顾：2016 年首台 DGX-1 的交付',url:'https://blogs.nvidia.com/blog/gtc-keynote-spring-2023/'},
];

export const DIMENSIONS = [
  ['梭哈浓度','安全垫批发商','赌桌焊接工','下注与转向'],
  ['远期胃口','先把饭吃了','十年后请客','下注与转向'],
  ['风口敏感度','自建小气候','热点闻味来','下注与转向'],
  ['止损手速','沉船守门员','救生艇常客','下注与转向'],
  ['嘴硬厚度','当场改口','地球先认错','行动习惯'],
  ['求援开口度','单机通关派','通讯录摇人王','与人相处'],
  ['证据胃口','直觉开盲盒','实验报告钉子户','行动习惯'],
  ['计划黏性','边开边修','流程焊死了','行动习惯'],
  ['方向盘占有欲','你开我放心','灯泡也要审批','行动习惯'],
  ['承诺膨胀率','只说能做的','先答应再开会','与人相处'],
  ['人情温度','合同自带暖气','先把人照顾好','与人相处'],
  ['镜头磁力','机房隐身人','发布会常驻','与人相处'],
  ['内卷燃料','下班即下线','工位长出根','日子怎么过'],
  ['回血自觉','红血还要冲','睡醒再拯救世界','日子怎么过'],
  ['生活留白','日历全是公司','今晚回家吃饭','日子怎么过'],
  ['翻篇速度','复盘到天亮','下一把开了','日子怎么过'],
].map(([name,low,high,group],id)=>({id,name,low,high,group}));

export const CHAPTERS = ['离家与长大','相爱与谋生','成家与冒险','事业与陪伴','放手与回望','往后的日子'];

const matrix = [
  [5,10,13,14], [7,9,11,12], [1,6,8,14], [0,2,6,12], [0,5,8,9], [3,4,5,9],
  [4,6,7,13], [2,8,10,11], [0,1,7,12], [2,3,4,15], [1,10,11,15], [3,13,14,15],
  [4,5,8,10], [1,6,8,14], [6,7,10,12], [3,13,14,15],
];

const fact = (text, ...sourceIds) => ({text,sourceIds});
const P = (title,description,axes,details) => ({title,description,axes,...details});
const O = (label,text,effects,flags,route) => ({
  label,text,...(effects ? {effects} : {}),...(flags ? {flags} : {}),...(route ? {route} : {}),
});
const D = (title,description,axes,outcome,details={}) => ({title,description,axes,outcomes:[outcome],...details});
const R = (title,description,axes,check,outcomes,details={}) => ({title,description,axes,check,outcomes,...details});
const odds = (base,stat,kind) => ({base,stat,...(kind ? {kind} : {})});

const opening = [
  {
    year:'1970 年代',place:'肯塔基州 · 寄宿学校',title:'先学会把灯打开',
    story:'走廊尽头有一盏灯，入夜后比窗外更像路标。你刚到这所学校，听不清一些玩笑，也还叫不出几个人的名字。点名册上那个读得有点生硬的名字，是你和这里为数不多的联系。周末快到了，你可以决定给自己和身边的人留出什么。',
    prepTitle:'下课后的十分钟',prepStory:'离熄灯还有一会儿。今天没听懂的事，值得现在开口；也可以先看看旁边的人过得怎样。',
    fact:fact('黄仁勋少年时期在肯塔基州上过寄宿学校。本幕的校园情节为创作重构。','witt'),
    prep:[
      P('请值班老师画张地图','先弄懂图书室在哪里，顺便问清下次能找谁。',[1,0],{effects:{communication:5,stress:-3},flags:['asked_for_map'],prepTags:['ask']}),
      P('陪同桌把名字念一遍','你教对方念你的名字，也把对方的写进本子。',[0,1],{effects:{bonds:7,energy:-3},flags:['shared_names'],prepTags:['listen']}),
      P('把作息抄到床头','先弄懂自己的日子怎么过，今天少说几句话。',[-1,-1],{effects:{energy:5,engineering:2},flags:['private_schedule'],prepTags:['plan']}),
    ],
    choices:[
      D('给家里写封长信','说说真实的一周，信寄出去就去睡觉。',[1,1],O('信已投递','你没有把每件难事都写得轻松。信封放进邮袋时，走廊的灯刚亮。明天的麻烦还在，今晚可以先结束。',{bonds:9,energy:5,stress:-4},['home_letter']),{cost:{money:-2}}),
      R('约同伴去图书室','拿本借来的书练口语。试试能不能把生词和同伴都留下。',[-1,0],odds(.64,'communication'),[
        O('借到第二本','你们把卡住的词写在书签上。下周还有一本想读，这回有人先约你。',{communication:10,bonds:5},['study_buddy']),
        O('念完半页','一页读得磕绊，你们干脆只读半页。至少以后在走廊碰见，不用再从头介绍自己。',{communication:5,energy:-3},['half_page']),
        O('图书室关了','门上的时间表和你听说的不一样。你回去抄下开放时间，今晚的约定没能兑现。',{stress:5,communication:2},['locked_library']),
      ],{effects:{energy:-4}}),
      D('把周末留出半天','走走路，补一个完整的觉。下周再背那一页。',[1,0],O('午后的空白','你第一次听清这里下雨的声音。没人替你赶上那一页，周一却终于有力气再开口。',{energy:11,stress:-8},['rested_first'])),
    ],
  },
  {
    year:'1970 年代末',place:'Denny’s · 晚班',title:'把七号桌端稳',
    story:'点单纸从夹子上滑下来，一桌人同时招手。晚餐高峰过后，冰水杯叠成一摞；明天的课本还在你的包里。领班把下周的排班表推过来。多一班就是一笔收入，也意味着总有一件事要挪到更晚。',
    prepTitle:'收银台边的排班表',prepStory:'距离下一轮客人进门，你只有一个空当。怎么安排，决定你这次要欠谁的时间。',
    fact:fact('黄仁勋年轻时在 Denny’s 工作过。游戏中的晚班、领班和排班选择为创作。','witt','tae'),
    prep:[
      P('把课和班次都排进去','先划清哪天能来，再把能兑现的班写上。',[1,-1],{effects:{stress:-4,energy:3},flags:['shift_calendar'],prepTags:['plan']}),
      P('请同事现场换班','临时拼成一个可行的班表；你也答应日后回换。',[-1,1],{effects:{bonds:6,communication:3,stress:3},flags:['shift_swap'],prepTags:['ask']}),
      P('试做一轮再排','今天观察上菜的速度，明天再答复排班。',[0,0],{effects:{engineering:4,energy:-3},flags:['table_timing'],prepTags:['evidence']}),
    ],
    choices:[
      R('主动接周末高峰','试着调度餐台。赚得多，也可能把备课时间用光。',[1,1],odds(.63,'communication'),[
        O('七号桌等到了','你记住了每桌先到的人，还顺手教会新人一套顺序。工资单厚了些，下周却不会突然多出一天。',{money:13,leadership:6,stress:5},['rush_managed']),
        O('有两桌催单','你跑完高峰，手里还有几张折皱的点单纸。多赚的钱到手，练习题留到了深夜。',{money:8,energy:-5},['rush_overtime']),
        O('搭档替你收尾','两张单送反了。补救占了整个收班，你记住了：答应出力和答应包办，是两回事。',{money:4,bonds:-3,stress:9},['rush_missed']),
      ],{effects:{energy:-5}}),
      D('只签两班，护住课堂','按最低生活预算排班，留两晚专心学习。',[-1,-1],O('两晚可用','周二晚上的灯还是亮着，只不过桌上铺的是课本。手头紧一点，课上的一个难点终于解开。',{money:4,engineering:7,energy:3},['protected_classes'])),
      D('在后台教新人一遍','接下固定班，把上菜顺序和交接要点写给下一位。',[-1,0],O('交接纸传下去','写着“先送热的”的便签被贴在出餐口。班上少了一次互相等人，下班却比原定时间晚。',{money:5,bonds:8,leadership:4,energy:-4},['trained_shift'])),
    ],
  },
  {
    year:'1984',place:'俄勒冈州立大学 · 工程实验室',title:'最后一晚，板子还没亮',
    story:'台面上有两块板子：一块偶尔能亮，一块总在同一个地方熄灭。组员提醒你，答辩后大家就要去不同的城市。等你解决下一个问题的还有毕业、工作和晚饭。唯一不能一起带走的，是今晚。',
    prepTitle:'借到的最后一个台位',prepStory:'实验室要腾地方给下一届。你可以追查故障、约定最低交付，或者在本子上给以后留一个问题。',
    fact:fact('黄仁勋于 1984 年获俄勒冈州立大学电气工程学士学位。此处毕业项目和组员为虚构。','osu','bio'),
    prep:[
      P('测五遍再写结论','先复现故障。哪怕答辩最后只够展示一个小结果，也知道它为何成立。',[0,1],{effects:{engineering:8,energy:-4},flags:['bench_data'],prepTags:['evidence']}),
      P('圈出明天能交的部分','按时交一份有明确边界的演示，把剩余时间还给组员。',[-1,0],{effects:{leadership:4,energy:5,stress:-3},flags:['minimum_demo'],prepTags:['plan']}),
      P('留一套供后人重做的笔记','做长期能读的记录，花钱买下备件和复印纸。',[1,1],{cost:{money:-4},effects:{engineering:4,ecosystem:4,energy:-3},flags:['open_notebook'],prepTags:['evidence']}),
    ],
    choices:[
      R('自己把整套演示接过来','展示和排错都归你。你会得到完整的技术经验，代价是这一晚。',[1,-1],odds(.61,'engineering'),[
        O('两块都亮了','最后一次通电时，故障消失了。你的署名下面多了一行技术说明，答辩后那顿饭已经散场。',{engineering:10,reputation:5,stress:6},['solo_demo']),
        O('一块就够了','第二块留在台面，你展示了第一块能做到的事，也把它做不到的部分说清楚。',{engineering:5,stress:5},['partial_demo']),
        O('演示改成故障报告','灯始终没亮。你讲完排查过程，发现承认边界比临场再接一根线有用。',{engineering:3,reputation:-3,stress:9},['demo_failure']),
      ],{cost:{money:-5},effects:{energy:-7}}),
      D('把排错交给熟悉的人','同组同学接手板子，你负责说明和收尾；答辩结束后都按时离开。',[-1,1],O('如约下班','组员找到一根虚焊的引脚，你把功劳写进报告。后来想起毕业那天，你先想起的是那顿没迟到的饭。',{leadership:6,bonds:7,energy:4},['delegated_demo'])),
      D('只交已验证的版本','展示可复现的一半，自己签下这份范围有限的报告。',[1,0],O('小而扎实','展示表上少了一栏，数据下面多了一个重做步骤。招聘者记住了这份克制，同伴还在等你释放台位。',{engineering:6,reputation:3,energy:-3},['bounded_demo'])),
    ],
  },
  {
    year:'1992',place:'加州 · 实验台和晚课之间',title:'白天做芯片，晚上做学生',
    story:'白天在公司试设计，晚上听课。芯片出错时，屏幕只给你一行信号；生活出错时，闹钟照样响。你快拿到硕士学位了，手边已有一份走得通的工作，也看见越来越多人想让电脑画出更复杂的世界。',
    prepTitle:'三页纸上的不同未来',prepStory:'这一周剩下的力气，够做一次扎实的准备。打磨履历、画新产品，或者找懂行的人问清分工。',
    fact:fact('黄仁勋曾任职 AMD 和 LSI Logic，并于 1992 年获斯坦福大学电气工程硕士学位。','osu','bio'),
    prep:[
      P('留在已知领域深挖','把一次流片和一次失败的原因都写进履历，先稳住自己的基本盘。',[-1,-1],{effects:{engineering:7,energy:-3},flags:['chip_foundation'],prepTags:['evidence']}),
      P('借设备画个图形原型','把新兴图形需求做成能跑的几分钟。设备借到了，租用费也得付。',[1,1],{cost:{money:-6},effects:{engineering:6,reputation:4,stress:3},flags:['graphics_probe'],prepTags:['prototype']}),
      P('听同事讲用户在买什么','用半天了解真实订单和开发进度，暂时不押哪一边。',[0,1],{effects:{communication:6,bonds:4,energy:-2},flags:['market_listening'],prepTags:['listen']}),
    ],
    choices:[
      R('赶在结课前做基准测试','拿出可对比的数据再谈机会。两晚实验，加上设备与样片费用。',[1,1],odds(.66,'engineering'),[
        O('报告说得清楚','数字让争论从“听起来更快”变成“在哪个场景快”。同事开始拿着自己的问题来敲门。',{engineering:10,reputation:6,energy:-4},['benchmark_proof']),
        O('跑出两个可用结果','设备环境和预期不同。你划掉一半结论，把剩下的交了上去。',{engineering:5,stress:4},['benchmark_partial']),
        O('复测推翻第一稿','冷机和热机的数据对不上。你撤回结论、写清问题，答应的演示取消了。',{engineering:3,reputation:-3,stress:7},['benchmark_retracted']),
      ],{cost:{money:-7},effects:{energy:-5}}),
      D('先办完毕业手续','下班后照原计划回去，让课程和手上项目有一个干净的收尾。',[-1,-1],O('书包终于空了','学位寄到手，你把旧讲义装箱。短时间没有亮眼的新成果，下一步却可以好好选。',{energy:10,stress:-7,money:4},['degree_finished'])),
      D('划一晚做小演示','先从手边的代码拼个可看版本，测到哪里就说明到哪里。',[-1,0],O('把想法画出来','朋友从动画里看出了玩法，也指出你没考虑过的延迟。它还不能拿去报价，已经够把一次饭局约起来。',{communication:5,bonds:5,engineering:3,energy:-3},['sketch_demo'])),
    ],
  },
  {
    year:'1993',place:'硅谷 · 三个人的一张桌',title:'餐巾纸够写几年的计划',
    story:'一张纸上画了三道箭头：游戏、图形芯片、个人电脑。桌边的人对机会有共识，对谁卖芯片、谁管团队、谁先领不到工资却还有分歧。你可以写辞职信，也可以带着这个问题回到原来的岗位。店员过来添水，桌上的讨论还没说到怎么付下个月的账。',
    prepTitle:'先谈钱，还是先叫人',prepStory:'真正要签字前还有一次准备机会。你想知道自己能撑多久，还是谁愿意一起撑？',
    fact:fact('1993 年，黄仁勋与 Chris Malachowsky、Curtis Priem 共同创立 NVIDIA。饭桌讨论和玩家的三个去向为创作。','bio','timeline','tae'),
    prep:[
      P('留出半年生活费','逐项划掉能晚点买的东西，保住最基本的缓冲。',[-1,-1],{effects:{money:7,stress:-4},flags:['runway_budget'],prepTags:['plan']}),
      P('拉上懂销售的朋友','把产品和订单放在同一张纸上谈；如果对方进来，也有权挑战方向。',[1,1],{cost:{money:-4},effects:{communication:7,bonds:4,control:-4},flags:['called_network'],prepTags:['ask']}),
      P('先做只有自己懂的小样','用最后一个晚上做出核心功能。方向还在你手里，但也只有你熟悉。',[1,-1],{effects:{engineering:6,control:4,energy:-5},flags:['prototype_1993'],prepTags:['prototype']}),
    ],
    choices:[
      R('辞职，和两位搭档创业','承诺做一款能卖的图形芯片。公司成立；这次抽的是开局能谈到什么条件。',[0,1],odds(.64,'communication'),[
        O('有人愿意先相信','第一份支持够你们租一间小屋、请一个人。你拿到了机会，也开始每个月算着发薪。',{money:13,reputation:6,leadership:5},['founder_backed']),
        O('先凑出一个工位','大家拼出勉强能动的预算。第一批仪器得轮流用，但公司有了能收邮件的地址。',{money:6,engineering:3,stress:5},['founder_lean']),
        O('先把自己的钱放进去','投资人想看更多，你们还是按约启动，合伙人带来一台旧设备顶上。没人能保证它撑到下一轮。',{engineering:4,energy:-5,stress:9},['founder_bootstrap']),
      ],{cost:{money:-11},effects:{stress:6,control:6},flags:['founded_company'],route:'company'}),
      D('留职，做公司内部的图形组','把方向交给现有团队评审，工资继续到账，产品要走审批。',[-1,-1],O('领到试验排期','你把辞职信收进抽屉。季度计划添了一行字，你获得一个试验名额，以及一位有权叫停它的主管。',{money:8,engineering:6,control:-9},['staff_graphics']),{route:'employee',flags:['counterfactual']}),
      D('做一个小工作室','用可支配的钱租设备，和一个伙伴分担项目，只答应眼下能交付的活。',[1,-1],O('两把椅子，一把钥匙','你们把工作室名字贴上门，首个小单只够交租。没有董事会投票，坏处是催款也得自己去。',{engineering:5,bonds:4,control:9,energy:-5},['small_studio']),{cost:{money:-5},route:'studio',flags:['counterfactual']}),
    ],
  },
];

// Alternate scenes keep the same era and dimensions, but change the work,
// people, obligations, and exits available to the player.
const scene6 = {
  company:['硅谷 · 产品会议室','客户问：这条路还走吗？','世嘉合作卡在架构上。手里的图形路线越来越难适应客户想走的方向。工资日就在前面；承认错了可能失去合作，继续烧钱则可能让整个团队付代价。','世嘉的项目负责人'],
  employee:['公司 · 内部图形组','季度评审前的坏消息','原型用了很难移植的接口，另一个部门拒绝接手。主管问下个季度还值不值得给你台位。同事们最想知道的，是自己还有没有机会换组。','负责台位的主管'],
  studio:['工作室 · 客户来电','接不下来的追加单','最大的客户临时换了目标硬件。你的小工作室没有钱同时支持两套接口；改口会伤信誉，闷头做可能赔掉两个月房租。','客户的制作人'],
  sold:['合作方 · 移交会议','交出去的东西还得收尾','接手方发现演示无法在他们的机器上运行。你负责最后一次移交；合同快到期，这一关决定谁要为技术债留在现场。','接手方负责人'],
  researcher:['实验室 · 续约评审','只有一台机器能复现','一套图形方法只在自己的机器上跑得动。联合实验室因此拒绝采用，你要拿出可移植方案，或者放弃原定合作。','联合实验室负责人'],
};

function crisis(s) {
  const [place,title,story,partner] = scene6[s.route] ?? scene6.employee;
  const founder = s.route === 'company';
  const exit = {
    company:['放弃原型，另开工作室','关闭原项目，用剩余资源和愿意留下的人做小单。','你把停工日期和欠款写进邮件，约好最后一次发薪。之后只租一张台，靠维修和移植攒回第一批客户。','studio'],
    employee:['申请调去实验组','交回本季度的产品名额，带着故障记录换一个工种。','你的工牌还在，组织图上的位置换了。第一周的任务是把失败写成一个别人可以重跑的实验。','researcher'],
    studio:['撤掉原型，改接维护单','主动把定制项目退回去，靠较小的维护工作保住工作室。','客户拿回资料；同伴把闲置设备挂出去。下个月的排期只有两行，两行都付得起房租。','studio'],
    sold:['结束过渡期，去做研究','按合同交接，把余下的问题交给接手方。','你把没有通过的测试留在交接清单上，退出管理群，带着技术问题申请研究岗位。','researcher'],
    researcher:['撤下项目，留下失败记录','退出这次联合项目，靠教课保住下一学期的经费。','被划掉的是项目编号，课表上多了一门实验课。你用坏掉的样机教学生怎样读出第一条错误。','researcher'],
  }[s.route] ?? [];
  return {
    year:'1996 前后',place,title,story,prepTitle:'留给坏消息的一晚',
    prepStory:'先把失败说清楚，或者争取更多时间证明原路还能走。明天必须带着一个说法进门。',
    fact:fact('黄仁勋在 2023 年台大演讲中回顾：早期 NVIDIA 意识到原架构路线有误，向世嘉坦承问题并请求帮助，因而得到继续尝试的空间。此处谈判细节与结果为游戏创作。','ntu','early'),
    prep:[
      P('列清还能撑多久','把现金、交付缺口和停做条件写到同一页。',[1,-1],{effects:{engineering:3,stress:-4},flags:['crisis_ledger'],prepTags:['evidence','sega_ledger']}),
      P('请同伴扮演最难说服的人','在真正谈判前试着开口，让人追问你承诺得起什么。',[0,-1],{effects:{communication:8,bonds:4,energy:-4},flags:['crisis_rehearsal'],prepTags:['ask','sega_rehearsal']}),
      P('再跑一晚旧原型','有可能找到不必改架构的证据，也把这晚的睡眠押进去。',[-1,1],{effects:{engineering:7,energy:-8,stress:3},flags:['crisis_retest'],prepTags:['prototype']}),
    ],
    choices:[
      R(founder?'承认架构走错，请世嘉给时间':'公开坏消息，请对方重谈条件',`带着能验证的数据找${partner}，请求一个范围更窄的机会。`,[1,-1],odds(.57,'communication',founder?'sega':undefined),[
        O('拿到喘息期',`${partner}同意保留一项支持，你也写下可以随时核验的条件。出门后你没有庆祝，先通知大家这个月的计划不用作废。`,{money:16,bonds:6,stress:-5,control:-4},['crisis_help','asked_for_help']),
        O('只留下一个验证窗口',`${partner}不肯按原条件继续，只给一次验证窗口。你推掉两个功能，留下一条还走得通的路。`,{money:7,engineering:4,control:-6,stress:3},['crisis_window','asked_for_help']),
        O('拿不到续约',`${partner}收下了故障记录，没有续约。第二天，你和愿意留下的同伴把重启计划砍到一张纸。`,{money:-9,reputation:-5,stress:10},founder?['crisis_denied','asked_for_help','counterfactual']:['crisis_denied','asked_for_help']),
      ]),
      R('坚持按原方案再试一轮','出钱借测试设备，先答应把样机送到对方手里。',[-1,1],odds(.40,'engineering'),[
        O('拼出一份过渡样机','你找到了兼容办法，交付能动的部分，换回一笔短单。团队还得维护那套过渡层。',{money:15,reputation:5,engineering:4},['crisis_patch']),
        O('客户只收半份','样机有时能用，对方只按已验收的部分付钱。你必须留下一个人专门维护。',{money:5,energy:-5,engineering:3},['crisis_partial']),
        O('演示当场停住','屏幕卡在第一帧。回去的车上没有人提下周；最终是你先问，哪些工时和账单可以兑现。',{reputation:-8,bonds:-4,stress:12},['crisis_broken']),
      ],{cost:{money:-12},effects:{energy:-7,stress:4},...(founder?{flags:['counterfactual']}: {})}),
      D(exit[0] ?? '收窄原定项目',exit[1] ?? '把规模降到一人能维护。',[-1,-1],O('这份清单就是告别',exit[2] ?? '剩下的人只维护有用户的一小部分。',{money:5,energy:6,stress:-9,ecosystem:-3,reputation:-4},['crisis_exit']),{route:exit[3] ?? 'researcher',flags:['counterfactual']}),
    ],
  };
}

const scene7 = {
  company:['硅谷 · 样机台','把能卖的东西做出来','你把新架构装进可跑的样机，准备用实际游戏逐项验证。机箱里风扇转了起来，桌上还放着上次项目留下的坏板子。','图形芯片','第一批整机厂'],
  employee:['公司 · 测试区','让一个别组也肯用的版本上线','主管给你一个小的试点：把旧图形工具换下来。最难取悦的人在隔壁测试组，他们已经替上一次延期加过班。','内部图形工具','隔壁测试组'],
  studio:['工作室 · 单据与测试机','第一个肯付全款的版本','一间做游戏的小公司愿意为稳定的移植工具买单。合同把稳定写得很简短；你们却得在不同硬件上逐个按下开始。','移植工具','小型游戏公司'],
  sold:['客户现场 · 交接台','把设备交给下一双手','你被请回去完成一项老产品的修复。接手方愿意验收，但希望这次能自己照文档查出故障。','修复套件','接手团队'],
  researcher:['实验室 · 共用机房','让隔壁实验室也跑一遍','你做了一个可复现的图形实验。隔壁学生借了一台旧机器；如果它也能跑，这份报告才有资格说“可移植”。','实验工具包','隔壁实验室'],
};

function reset(s) {
  const [place,title,story,product,audience] = scene7[s.route] ?? scene7.employee;
  const mainline = s.route==='company' && !s.flags.counterfactual;
  const artifact = mainline ? 'RIVA 128' : product;
  const outside = s.route === 'researcher' || s.route === 'sold';
  return {
    year:'1997',place,title,story:mainline?'RIVA 128 的样机送到了。你要用实际游戏逐项验证；机箱里风扇转了起来，桌上还放着上一代产品留下的坏板子。':story,prepTitle:'交付倒数三天',prepStory:`给${artifact}加一轮验证，缩小已知风险，或者先让一位疲劳的同伴回家。`,
    fact:fact('NVIDIA 于 1997 年推出 RIVA 128。未走创业主线时，这条史实是时代背景；玩家手上的项目另有其事。','early','timeline'),
    prep:[
      P('用失败样机建立验收用例','把坏结果也贴出来。新版本要在同一处过关，才可以送人。',[-1,1],{effects:{engineering:8,energy:-4},flags:['regression_suite'],prepTags:['evidence']}),
      P('再做一次只给团队看的演示','先打磨你相信的核心方案，暂时不把争议功能交给外部。',[1,-1],{effects:{engineering:5,control:5,stress:3},flags:['closed_demo'],prepTags:['prototype']}),
      P('给自己和搭档轮一天休','让其他人读懂进度再接班。今晚几项测试会延后。',[-1,0],{effects:{energy:9,bonds:5,stress:-5},flags:['recovery_shift'],prepTags:['rest']}),
    ],
    choices:[
      R('赶窗口，交完整版本',`现在把${artifact}交给${audience}；多接到的需求也会变成下周的工单。`,[-1,-1],odds(.65,'engineering'),[
        O('第一次被别人顺利用上',`${audience}在自己的设备上跑完全部流程。第一张感谢邮件后面跟着六条需求，你把它们抄进新本子。`,{reputation:11,engineering:4,ecosystem:7,money:12},['release_hit']),
        O('功能够用，先小范围发',`一台机器没通过。你和${audience}约定只在已测环境使用，支持电话仍然接到深夜。`,{reputation:4,money:7,stress:6},['release_limited']),
        O('发出去又收回来',`${audience}没能跑完第一遍。你当晚撤回下载包，借来对方的一台机器重新定位问题。`,{reputation:-5,engineering:5,stress:10},['release_recalled']),
      ],{cost:{money:-8},effects:{energy:-5}}),
      D('锁定范围，按测试清单交付',`只给${audience}能验证的那部分，把余下功能列为明确限制。`,[1,0],O('验收通过一小块','没有人催你开庆功会，验收单先到了。对方有一个稳定可用的版本，你有第一份能复用的检查表。',{money:outside?3:7,engineering:7,stress:-3,ecosystem:3},['release_bounded'])),
      D('再留一周，先修团队的作息','让别人接手排期；自己睡够，再处理最难的一处。',[0,1],O('准点出门了','交付晚了一周，原本有意试用的人走了一位。搭档第一次独自签了修复单，你终于不必再守着传呼。',{energy:13,bonds:7,stress:-7,reputation:-3},['release_recovered'])),
    ],
  };
}

const scene8 = {
  company:['硅谷 · 会场后台','站到聚光灯前，还是退一步','发布会和资本市场同时伸来一只手。走上去，你就得解释一款芯片为什么值得更多人下注。台下还有做出它的人，在等一个属于自己的名字。','产品与扩张计划','工程师'],
  employee:['总部 · 晋升评审','升职以后，还能做东西吗？','试点传到了总部。人事说你可以竞聘技术主管，原组的同事担心职位一换，维护任务又落回他们头上。','跨部门提案','值过夜班的同事'],
  studio:['工作室 · 地上铺着两份合同','五个人以后，谁还认得客户？','有发行方愿意买下一整年产能，只要求把工作室人数翻倍。搭档把旧钥匙放在合同上：当初只有两个人，客户出了问题就知道找谁。','扩大产能的计划','最熟悉客户的搭档'],
  sold:['行业展会 · 借来的演示桌','没有头衔，也能说清楚吗？','接手方邀请你代表顾问团队做演示。台下有熟人，也有第一次看你工作的人；他们没兴趣听离场故事，只想知道工具有没有用。','交接后的独立技术报告','真正接手维护的人'],
  researcher:['校内报告厅 · 讲台一侧','署名表比投影更难摆','实验成果拿到公开展示名额。评审想听一位负责人说话，记录里却有学生修复的最后一个错误，和隔壁贡献的三个月数据。','可复现实验','真正做出关键结果的学生'],
};

function scale(s) {
  const [place,title,story,artifact,people] = scene8[s.route] ?? scene8.employee;
  const founder = s.route === 'company';
  const channel = founder || s.route === 'studio';
  return {
    year:'1999',place,title,story:founder&&!s.flags.counterfactual?'上市和 GeForce 256 的发布就在这一年。走到台前，你得说清这款芯片为何值得更多人下注。台下还有做出它的人，在等一个属于自己的名字。':story,prepTitle:'台下还有谁',prepStory:`围绕${artifact}有一场重要展示。先听见机会、补全署名，或把后续决定握得更紧。`,
    fact:fact('NVIDIA 在 1999 年上市，同年发布 GeForce 256。晋升、合同与台前幕后细节皆为游戏情节。','timeline'),
    prep:[
      P('去听一圈买方的意见','赶上热度之前，先确认对方要的是哪一部分；请做交付的人也旁听。',[1,-1],{effects:{communication:6,bonds:3,energy:-3},flags:['audience_listening'],prepTags:['listen']}),
      P('把最后的决定留给自己','准备一份只有你能改的范围表，以免临场加太多要求。',[-1,1],{effects:{control:7,stress:3},flags:['kept_veto'],prepTags:['plan']}),
      P('请团队一起确认署名和分工','把后续签字交给实际负责人，少留一道自己的审批。',[0,-1],{effects:{leadership:6,bonds:6,control:-5},flags:['shared_ownership'],prepTags:['ask']}),
    ],
    choices:[
      R(founder?'站到台前，为扩张争取支持':'自己登台，争取更大的盘子',`为${artifact}争取关注。${channel?'承诺直接接新单，现有合作方会担心你来争他们的生意。':'准备演示要花钱，拿到支持也会新增责任。'}`,[0,1],odds(.65,'communication'),[
        O('议程还没结束就有人来问',founder?'更多资源进到公司，随之而来的是季度答卷。回后台时，你有三封要回的邮件和一位等你吃饭的同事。':`有人愿意为${artifact}提供后续资源。会后他们第一个找的是你，随后每个问题也都发到了你的邮箱。`,{money:15,reputation:10,leadership:5,stress:6,...(channel?{bonds:-5}:{})},['stage_breakout']),
        O('得到一个试点席位',channel?'有一个新客户留下来试单，老客户却把下一批订单交给了别家。你得同时跟进试点和旧交付。':'台下拍过了手，真正留下来的只有一个愿意做试点的人。你得亲自多跟几次。',{money:6,reputation:4,energy:-6,...(channel?{bonds:-6}:{})},['stage_pilot']),
        O('掌声没有变成承诺',channel?'老客户暂停了询价，台下也没人签单。回去后，你把原本要给新业务的人调回现有交付。':'几位听众追问交付和支持，你给不了日期。最终你把空掉的回信栏交给团队看。',{reputation:-4,stress:8,...(channel?{bonds:-8}:{})},['stage_missed']),
      ],{cost:{money:-7},effects:{energy:-5},...(founder?{flags:['counterfactual']}: {})}),
      D('把展示交给做成它的人',`让${people}亲口介绍自己的工作，你在场接最难的问题。`,[1,-1],O('不同的人拿到了话筒','听众不再把每个问题都交给你。散场后，两个人直接约好了下次合作；以后有些决定会在你不在场时做出。',{bonds:10,leadership:8,ecosystem:4,control:-8},['delegated_stage'])),
      D('缩小场合，把账和产能讲明白','拒绝超出能力的指标，只向少数愿意接手的人确认计划。',[-1,-1],O('会议准点结束','没有热闹的发布照片，却多出一份能执行的日程。你推掉了一位感兴趣的赞助方，留下的人签了具体承诺。',{money:5,stress:-7,energy:6,control:3},['quiet_growth'])),
    ],
  };
}

const scene9 = {
  company:['硅谷 · 预算会','给还没出现的用户留一笔钱','有人想让图形芯片做图形以外的计算。要让陌生人也会写程序，就得出钱做工具、文档和支持。账本最擅长回答的，却是哪款产品这个季度能卖。','通用计算工具链','出售公司，兑现已有成果','接手方承诺保留现有产品；你的股权换成现金与一段限期交接。','交割后你带走一盒文件，第一次不用等晚上的预算会。团队换了邮箱，你答应只负责合同里的过渡期。','sold'],
  employee:['公司 · 产品路线评审','先把工具借给别组','产品主管希望你把现有工具做成更多人能用的库，条件是原团队少做一个季度功能。邻组在等你发示例，但年度考核只认当年的交付。','跨组计算库','交回产品职责，转研究岗','申请用受控预算做实验，不再对销售承诺负责。','主管同意内部转岗。你把最后一张上线单交给接任者，换来半个学期去复现实验。','researcher'],
  studio:['工作室 · 白板和租约','客户的钱，还是工具的钱','手里有一套能让别的工作室加速渲染的小工具。整理成能卖的东西要停接订单；隔壁大厂同时愿意接手它和已有客户。','独立渲染工具','把工具与客户合同一并卖出','收回部分多年投入，按清单移交工具与原合同。','钱先到账，工具改成接手方的名字。你留做有期限的顾问，原搭档第一次有了不同的去向。','sold'],
  sold:['家中 · 顾问合同到期前','终于有一张不必续签的合同','原客户找你接着做支持，一所学校则邀你把经验整理成教学工具。两份日程不能并排签；其中一份更好解释给会计听。','可复现的教学工具','结束顾问期，去学校教课','交回门卡，换一个有固定教学时间的岗位。','新课表上写着机房编号；原客户的电话开始由其他人接。你的工作终于能在晚饭前结束一部分。','researcher'],
  researcher:['实验室 · 经费讨论','论文发出去，谁来修代码？','同行愿意试你的加速方案，但装不上工具。把它做得易用会占掉下次投稿时间，留给原作者使用则比较容易结项。','公开计算实验套件','关掉大项目，留下教学版','砍掉必须申请经费的范围，留下下学期还能开的实验课。','大机器归还给机房，学生拿着小版说明继续做作业。你不再主持该项目，课却没有停。','researcher'],
};

function platform(s) {
  const [place,title,story,product,exitTitle,exitDesc,exitText,exitRoute] = scene9[s.route] ?? scene9.employee;
  const mainline = s.route==='company' && !s.flags.counterfactual;
  const artifact = mainline ? 'CUDA 工具链' : product;
  return {
    year:'2006–07',place,title,story:mainline?'CUDA 想让图形芯片做图形以外的计算。要让陌生人也会写程序，就得出钱做工具、文档和支持。账本最擅长回答的，却是哪款产品这个季度能卖。':story,prepTitle:'谁来付第一年的账',prepStory:`给${artifact}写预算。眼前有订单、试用者和一张还没交出去的退出计划。`,
    fact:fact('NVIDIA 于 2006 年推出 CUDA 架构，2007 年推进开发工具与生态。平行路线中的工具是玩家自己的项目。','timeline','early','ntu'),
    prep:[
      P('用旧收入养一轮试用','先让真实用户试几周，你承担眼下看不见回报的成本。',[1,1],{cost:{money:-7},effects:{ecosystem:9,engineering:5,energy:-4},flags:['developer_pilot'],prepTags:['prototype']}),
      P('先续上现金流','把当季能到账的承诺排好，不预支下一年的时间。',[-1,-1],{effects:{money:7,stress:-3},flags:['current_cash'],prepTags:['plan']}),
      P('和使用方拆开试验阶段','谈好哪部分现在免费、哪部分以后要有人维护，大家各自签字。',[0,1],{effects:{communication:5,bonds:5,control:-3},flags:['partner_scope'],prepTags:['ask']}),
    ],
    choices:[
      R('持续做工具和文档',`签下阶段计划，让${artifact}成为别人也能使用的东西。维护要从今天开始付。`,[1,1],odds(.60,'engineering'),[
        O('第一批外部使用者留下来','反馈箱出现了第一份陌生人的修正。你们花一周补说明，下一位来的人不用重复踩坑。',{ecosystem:19,engineering:7,reputation:5},['platform_adoption','long_bet']),
        O('只有少数人跑通','几份报告能重现，支持邮箱却比下载数热闹。你维持一个小版本，暂时放弃另一个销售机会。',{ecosystem:10,engineering:5,stress:7},['platform_niche','long_bet']),
        O('试用者没有回来','安装步骤占了一整页，外部试用者大多停在第三步。代码还在，你们只能承认下个月没人养这条线。',{ecosystem:3,engineering:4,reputation:-3,stress:10},['platform_stalled','long_bet']),
      ],{cost:{money:-14},effects:{energy:-8,stress:3}}),
      D('只做这一季会有人付钱的事','关掉多余任务，先交付手上的合同、功能或课程。',[1,0],O('这一季交清了','现金和时间回到表上；几个早期试用者也听到了维护暂停的消息。要重启这条线，得先把他们请回来。',{money:12,engineering:4,ecosystem:-5,stress:-4},['platform_deferred']),mainline?{flags:['counterfactual']}:{}),
      D(exitTitle,exitDesc,[-1,-1],O('把钥匙交出去',exitText,{money:exitRoute==='sold'?21:5,energy:10,stress:-9,control:-12,ecosystem:-4},[exitRoute==='sold'?'sold_company':'left_platform']),{route:exitRoute,flags:['counterfactual']}),
    ],
  };
}

const scene10 = {
  company:['硅谷 · 两套市场计划','钱和人只够押一边','移动设备增长很快，相关投入却吃掉了支持团队。远处传来一条意外消息：有人用 GPU 训练图像识别模型。会议室里同时摊着移动订单和还没有收入的计算工作。','移动项目','团队与两家客户'],
  employee:['公司 · 产品复盘','你的组该接什么单？','公司要你把工具移到低功耗设备上，测试延期了两次。一位工程师拿来图像识别论文，问能不能用现有机器重做一遍。两个实验需要同一台机器。','低功耗移植','产品组与借机的工程师'],
  studio:['工作室 · 两张预算单','谁来替试验付房租','移动游戏客户追加一套适配，账期很长。一家视觉团队愿意付一小笔钱试做并行计算。搭档问，给哪一方的排期可以真的写进合同？','移动适配单','搭档与两位客户'],
  sold:['客户办公室 · 最后一轮报价','用卖掉的时间买回什么','老客户想让你顾问期再延一年，帮他们救一个移动项目。另一份报价只有两个月，是做一项计算验证；没人能保证做完还有单。','移动顾问续约','老客户与新合作方'],
  researcher:['实验室 · 空出来一台机器','新结果来得正是时候吗？','旧方向的设备刚做完一轮评审，图像识别的结果就传来了。学生问能不能换题；已经收了两年数据的人想先把论文写完。','原定低功耗课题','学生与资助方'],
};

function pivot(s) {
  const [place,title,story,artifact,people] = scene10[s.route] ?? scene10.employee;
  return {
    year:'2010–15',place,title,story,prepTitle:'把桌上的两份计划摆开',prepStory:`先弄清${artifact}还有多少可兑现的工作，再谈要不要把资源转向新方向。`,
    fact:fact('NVIDIA 曾进入移动计算市场；2012 年 Alex Krizhevsky、Ilya Sutskever 和 Geoffrey Hinton 发表 AlexNet 论文，使用 GPU 训练模型。游戏的具体转向决定为创作。','timeline','alexnet'),
    prep:[
      P('读论文，写下复现条件','暂停一项旧工作，弄清新结果有什么可以重复。',[1,1],{effects:{engineering:7,energy:-5},flags:['read_alexnet'],prepTags:['evidence']}),
      P('先让旧承诺有价目表','把已接的工作分出必须兑现和可以取消的部分。',[-1,0],{effects:{communication:5,bonds:5,stress:-3},flags:['priced_commitments'],prepTags:['plan']}),
      P('给旧方向再找一位买家','不急着停项目，多花一趟差旅找具体需求。',[0,-1],{cost:{money:-5},effects:{money:4,communication:6,reputation:3,energy:-4},flags:['searched_mobile'],prepTags:['listen']}),
    ],
    choices:[
      D('停掉一半旧项目，划线转向',`和${people}重签交付边界，再把腾出的机器和人排进新实验。`,[-1,1],O('有人得改下个月的计划','你退掉一部分订单；两位原本负责旧方向的人要重新选项目。新实验终于有人和设备，一段原本稳定的收入也断了。',{engineering:7,ecosystem:8,stress:-4,bonds:-4},['pivot_freed_capacity']),{cost:{money:-8}}),
      R('把旧方向再推一个周期',`为${artifact}保留更多排期，也把暂时腾不出手的事告诉合作方。`,[1,-1],odds(.49,'communication'),[
        O('拿到一份能养人的合同','有人愿意为你擅长的那部分付费。你如约交付，但另一条实验线错过了这轮协作。',{money:20,reputation:6,ecosystem:-4},['pivot_old_wins']),
        O('钱到账一半','对方只订一个可交付的版本。为了维护它，你把新实验挪到无人使用的时段。',{money:8,energy:-6,engineering:3},['pivot_old_small']),
        O('来信说预算收回','合同没了，原团队还在等安排。你留下一份亏损记录，用半周把设备重新排给几项小实验。',{money:-5,stress:11,bonds:-5,engineering:4},['pivot_old_breaks']),
      ],{cost:{money:-7},effects:{energy:-7}}),
      D('并行跑两个小实验','给两条路各划同样短的截止线，到了日期就按数据决定。',[-1,0],O('两张数据表，一张排班表','机器轮流开，结果都够你问出更好的问题。两组人暂时都不用散，可你要多管一轮跨组协调。',{engineering:9,communication:4,stress:6,energy:-6},['pivot_split'])),
    ],
  };
}

const scene11 = {
  company:['硅谷 · 第一批计算系统','一台机器该送去哪里','算力第一次成了别人排队等的资源。第一批机器可以发给愿意共同验证的研究团队，也可以给愿意立刻付钱的客户。门边已经堆着打好标签的箱子。','第一批系统','研究伙伴'],
  employee:['公司 · 共享计算间','机柜只有一个空位','公司批准你试做一组内部算力服务。业务方先来问排期，年轻工程师抱着一份研究计划等在旁边。你没有权卖掉机器，有权决定试用顺序。','内部算力名额','跨组使用者'],
  studio:['工作室 · 租来的计算间','该接下那笔大单吗？','旧客户愿意出高价包下工作室全部算力。几位研究者则希望用一小部分换来一份公开基准。团队第一次不必为房租发愁，也第一次要选以后为谁做事。','共享实验时间','外部开发者'],
  sold:['大学 · 项目合作桌','他们缺的不是一位老板','有团队请你用以前积累的联系人帮忙借机器。眼下你是独立顾问，可以收下独家合同，也可以留下让团队以后自己拿得到资源的办法。','能借到的试验时段','联合研究团队'],
  researcher:['实验室 · 第一份共享排期','谁先拿到机房门卡','赞助方同意增加一套计算设备，想先得到独家结果。学生们有可以重复的训练任务，也想让别校一起跑。你手上是第一份机房排期。','新一批机时','其他学校的实验组'],
};

function ai(s) {
  const [place,title,story,product,people] = scene11[s.route] ?? scene11.employee;
  const mainline = s.route==='company' && !s.flags.counterfactual;
  const artifact = mainline ? '第一批 DGX-1' : product;
  const returning = s.flags.platform_adoption && (s.flags.pivot_freed_capacity || s.flags.pivot_split);
  return {
    year:'2016',place,title,story:mainline?'第一批 DGX-1 装好了。真实历史里，首台送去了 OpenAI。你眼下重做这次分配：发给愿意共同验证的研究团队，还是交给愿意立刻付钱的客户？':story,prepTitle:'把说明书塞进箱子之前',prepStory:`现在要给${artifact}写规则。谁先用、怎么反馈、旧贡献算在谁名下，都还来得及谈。`,
    fact:fact('2016 年，首台 NVIDIA DGX-1 交付 OpenAI。这是黄仁勋实际人生的一幕；玩家的分配对象与合作结果为创作。','dgx','timeline'),
    prep:[
      P('和试用方一起写公开说明','预留长期维护时间，让后来的人可以直接照做。',[1,1],{effects:{ecosystem:8,bonds:5,energy:-4},flags:['public_docs'],prepTags:['evidence']}),
      P('先把当前合同写到能签','确认谁买单、交什么和验收日期，先解决这一批资源的成本。',[-1,-1],{effects:{money:6,stress:-4},flags:['contract_ready'],prepTags:['plan']}),
      P('先听新人讲他卡在哪里','帮人解掉眼前的一个问题，再判断接下来是否需要长期支持。',[0,1],{effects:{leadership:6,bonds:6,energy:-3},flags:['listened_junior'],prepTags:['listen']}),
    ],
    choices:[
      R(returning?'请早期使用者回来做开放试用':'留一份给开放合作',`与${people}约定分享复现步骤，由你协调第一轮试用反馈。${returning?'如果这次跑通，早期使用者还愿意把自测脚本一并放出来。':''}`,[0,-1],odds(.62,'ecosystem'),[
        O('第二个团队自己跑通了','第一批反馈找出一个重复出错的设置。你们把修法公开，另一组照着说明完成实验。发表时，维护工具的人和做出研究的人各有自己的署名。'+(returning?'早期使用者也如约发布了自测脚本。':''),{ecosystem:returning?23:17,reputation:8,bonds:6},['ai_shared_success']),
        O('公开了说明，暂时没人复现','另一组拿走了文档，却卡在硬件条件上。你们又开了一次小会，先承诺支持能做的一部分。',{ecosystem:8,engineering:4,energy:-5},['ai_shared_partial']),
        O('第一轮公开试用延期','资源调配没赶上，合作方先做了别的事。你把还不能开放的条件逐项列清，并留了联系窗口。',{ecosystem:3,stress:8,reputation:-3},['ai_shared_delayed']),
      ],{cost:{money:-8},effects:{energy:-5}}),
      D('签一家独家，先收款再开工','把优先权给能承担成本的一方，暂时把技术进展放进保密范围。',[1,1],O('合同当天生效','测试资源全数排给一个客户。付款让你们买得起备件；另一个团队只好去别处排队。',{money:16,reputation:4,ecosystem:-6,control:-5},['ai_exclusive']),mainline?{flags:['counterfactual']}:{}),
      D('让后辈做主，自己做交接','把第一轮试用和对外沟通交给下一位负责人，自己留下复盘。',[-1,-1],O('邮件抄送里少了你','新人独自改了试用顺序，做法和你的不同。晚些时候，对方把对照数据发给你：下一次即使你不在，他们也知道怎么做。',{bonds:10,leadership:10,ecosystem:5,control:-10,energy:3},['mentored','ai_handoff']),mainline?{flags:['counterfactual']}:{}),
    ],
  };
}

const scene12 = {
  company:['硅谷 · 下一轮决策会','灯亮着，钥匙该给谁','AI 计算需求正在变大。采购表比去年长，所有决定也跟着回来找你。桌上有一份下一轮扩张计划、一份接班清单，和一个已经取消过两次的晚饭提醒。','下一轮基础设施扩张','接任的经营团队'],
  employee:['公司 · 部门搬迁前','往上走，还是把工作交稳','公司要设一个新团队，主管问你愿不愿意带队。原组已经有人能把项目讲明白；你也终于能认真考虑一份不必把手机放在枕边的岗位。','新技术部门','已经接手部分工作的同事'],
  studio:['工作室 · 续租日','要多租一层，还是少接一单','行业火热，上门的单子够工作室租下另一层楼。原来那间屋子还有一张当年自己装起来的桌子；搭档想知道，大家打算怎样使用下一年的时间。','工作室扩张','留下来带项目的搭档'],
  sold:['家中 · 邮件和空白日历','离场之后，要不要再进场','有人请你加入新项目，酬劳足以把顾问期再延几年。你有权决定下一份承诺，也有权让旧的工作方式留在过去。','新顾问合同','继续跟客户对接的顾问'],
  researcher:['实验室 · 交回门卡之前','关掉谁都不怕的那盏灯','算力需求使实验室忙碌起来；学界也有人开出大课题。旧学生已经带自己的学生进门。有人问你要不要负责扩建，另有人只问你下周还能不能来吃饭。','下一轮实验室计划','已经能带组的后辈'],
};

function close(s) {
  const [place,title,story,artifact,people] = scene12[s.route] ?? scene12.employee;
  const trained = s.flags.mentored || s.flags.delegated_stage || s.flags.shared_ownership;
  const supported = trained && (s.stats?.money ?? 0)>=5;
  return {
    year:'2024',place,title,story,prepTitle:'把日历翻到明年',prepStory:`先算清${artifact}需要什么，再想好哪部分生活不想重新外包给手机里的提醒。`,
    fact:fact('到 2024 年，NVIDIA 已推出面向 AI 基础设施的 Blackwell 平台。此幕的扩张、交接或退一步都是玩家自己的选择，不表示黄仁勋实际卸任。','timeline'),
    prep:[
      P('列出该停止的项目','把不再兑现的承诺逐项交代清楚，给重要的事腾地方。',[1,0],{effects:{money:5,stress:-6,control:-4},flags:['final_cut_list'],prepTags:['plan']}),
      P('先给自己放一天假','空出电话，走远一点。今天这份计划不需要在车上改。',[0,1],{effects:{energy:10,stress:-6,reputation:-2},flags:['final_day_off'],prepTags:['rest']}),
      P('把预算和排期复查到底','先确认还有多少空间能做下一轮，不急着删掉旧项目。',[-1,-1],{effects:{engineering:5,leadership:4,energy:-5},flags:['final_budget'],prepTags:['evidence']}),
    ],
    choices:[
      R('继续做下一轮',`接下${artifact}。把尚未结束的事托给团队，自己先扛起新承诺。`,[-1,1],odds(.63,'leadership'),[
        O('新项目有人一起扛','下一轮计划有人签字，有人愿意在你开会时自己判断。离开时你还有一通工作电话，但它不再要你回答每件事。',{money:12,reputation:9,leadership:5,stress:5},['ending_expand','ending_expand_supported']),
        O('只按原计划一半启动','你把大方案缩小到可以交付的范围。账和人暂时平衡，下一年的日历已经少掉几页空白。',{money:5,engineering:5,stress:8},['ending_expand','ending_expand_partial']),
        O('下一轮没谈成','对方没跟签。你把没兑现的扩张条件写下来，取消了几场会，把还在做的项目留在手里。',{reputation:-5,bonds:-3,stress:10},['ending_expand','ending_expand_stalled']),
      ],{cost:{money:-9},effects:{energy:-7}}),
      D(supported?'把日常决定交给下一位':'先交一半，排好过渡期',
        supported?`有人练过独立负责，余款也够支持磨合。这次和${people}确认边界，把最后的签字交出去。`:`${trained?'预算还不够让两个人同时腾出整段交接时间。':'还没有人完整负责过。'}和${people}共管一个季度，从不需要你签字的部分开始。`,
        [0,-1],supported?
          O('钥匙转了一次手','下一位负责人把会议改到了你以前从不选的时间。你收到通知，发现自己可以只回一句“收到”。',{money:-5,leadership:9,bonds:8,stress:-10,control:-17},['ending_handoff','mentored']):
          O('先交出一张钥匙','对方接走排班和进度会；你留下来共签高风险的事。等对方走过一轮，钥匙才会全部交出去。',{leadership:6,bonds:7,stress:-3,control:-8,energy:-4},['ending_handoff','handoff_in_progress'])),
      D('把晚饭写成不改期的约','减掉一部分工作，保留真正答应要做完的几件事。',[1,1],O('留了一盏饭桌上的灯','人先到齐了，手机还在口袋里。你并没有做完所有想做的事；有人把盘子推过来，你先问了他们最近怎么样。',{bonds:14,energy:10,stress:-12,reputation:-4,money:-3},['ending_balance','protected_evenings'])),
    ],
  };
}

// Each row handles every possible result of the preceding decision.
const echoes = [
  {},
  {
    home_letter:'家里的回信上写着可以慢慢说。你把它放进围裙口袋，遇到没听清的点单便请客人重说一遍。',
    study_buddy:'图书室的伙伴来吃过一次饭。你第一次在七号桌听见有人把你的名字念对。',
    half_page:'图书室只读完半页的练习还在继续。记不住菜名时，你也把它们拆成半页一组。',
    locked_library:'上回扑过图书室的空。这次你先核对柜台上的营业时间，再抄自己的班次。',
    rested_first:'你记得那半天休息帮自己熬过了整周。眼下排班表上，也有一格可以不写。',
  },
  {
    rush_managed:'排高峰那晚练出来的顺序，用到了实验台：等机器启动的五分钟，先派人核对接线。',
    rush_overtime:'落下的练习曾拖到收班后做完。答辩前你把本来安排在深夜的那项测试圈了出来。',
    rush_missed:'那两张送反的单还留在旧本子里。组员问你要不要全包，你先把仍在等回复的几件事摊开了。',
    protected_classes:'保住的那两晚课，让你认得波形里那段不该出现的信号。你在黑板上圈出了位置。',
    trained_shift:'出餐口那张交接纸如今有了实验室版。第一次上台位的人，也知道把坏板放在哪边。',
  },
  {
    solo_demo:'毕业演示的技术说明替你争取到一次单独展示。现在几个同事也默认，第二天早上总能找你排错。',
    partial_demo:'当初只点亮一块板的经历派上用场。有人想让你在报告里多写一项功能，你先问哪里能亲手验证。',
    demo_failure:'旧故障报告比旧板子留得久。一个同事照着它学会读信号，转头替你检查这次的测试。',
    delegated_demo:'当年的组员寄来近况，也介绍了一位做硬件的人。你不必在晚课下课后独自摸索新设备。',
    bounded_demo:'招聘时有人记住了你那份范围有限的报告。现在主管也把需要明确边界的测试交给你。',
  },
  {
    benchmark_proof:'饭桌上翻开的第一份材料是你做过的基准报告。合伙人用笔圈住了那个性能差别最大的场景。',
    benchmark_partial:'报告里那两个可用结果还在。桌上有人提议，先把它们当成一周能重做的立项条件。',
    benchmark_retracted:'撤回过第一份结论之后，你随身带着冷机和热机都要重跑的清单。合伙人给启动计划多留了一栏测试。',
    degree_finished:'整理旧讲义时空出来的一周，让你有时间把家庭预算也带上桌。三个人谈的不只有产品。',
    sketch_demo:'你带来那份只跑几分钟的动画。有人看完先问延迟，三个人因此开始争论谁来管真正的交付。',
  },
  {
    founder_backed:'开局租到的小屋还有一个空座位。支持你们的人来问下一份样机何时验收；能解释的日期越来越少。',
    founder_lean:'当初轮着用的仪器又被推回门边。这次没有余机可以顶上，演示得在排班表里抢位置。',
    founder_bootstrap:'创立时带来的旧设备还是主力。合伙人把维修账放到桌上，问还能不能再等一个月。',
    staff_graphics:'你没有交出去的辞职信还在抽屉里。内部试验名额即将到期，这次要说服的是分配台位的人。',
    small_studio:'两把椅子现在都有了人，但租金账单始终只找两个人。最大客户改规格的邮件落到你们共同的收件箱。',
  },
  {
    crisis_help:'对方给的喘息期还没用完，团队保住了同一班人手。你可以把约定的检查项直接放进本次验收。',
    crisis_window:'上次谈回来的只是一次验证窗口。交付表上只留下对方答应复测的那几项。',
    crisis_denied:'续约没回来，重新约到的试用者要求先看能跑的那部分。这回支持名单上少了原合作方。',
    crisis_patch:'过渡层替你多换来一笔短单，也吃掉一个人的排期。新版本的第一项测试得避开那台旧设备。',
    crisis_partial:'上一回只收了半笔钱。负责补齐另一半的同伴先完成旧支持，再来帮你交付。',
    crisis_broken:'停在第一帧的样机还在。有人把它贴上红纸条，要求新验收先复现那次失败。',
    crisis_exit:'原项目停工那天，团队把可继续维护的部件单独装箱。眼下你用的就是那箱剩下的东西。',
  },
  {
    release_hit:'第一批需求清单比发布计划长。今天的争论从能不能做出来，变成应该答应服务哪些人。',
    release_limited:'上一次只肯承诺已测环境。这次邀请里，有人正是因为那个明确范围才愿意来试。',
    release_recalled:'被收回的下载包已经替换。测试组仍要求展示时带上他们的环境和撤回方案。',
    release_bounded:'上一幕那份验收表终于被别人复用了。负责下一批交付的人想把名字写到签字栏。',
    release_recovered:'轮值之后，搭档可以独自处理故障。这次排台前台后分工时，不用把你列进每一项。',
  },
  {
    stage_breakout:'台前收到的支持让账上有了些余量。后来要求兑现规模的人，也等着看这个季度。',
    stage_pilot:'舞台上谈来的试点方现在写来了第一封反馈。对方只肯帮忙测一种场景，预算得按它缩小。',
    stage_missed:'那次掌声之后空着的回信栏提醒你：工具需要有人试，没人会只为承诺续款。',
    delegated_stage:'上次拿到话筒的人直接带来一位试用者，连第一份说明都由两人写好；新工具不用从空白页开始。',
    quiet_growth:'那份提前结束的会议留了一项好处：预算里每项日常工作都有人认领。这次不必先为旧计划填窟窿。',
  },
  {
    platform_adoption:'计算工具的使用者发来一份并行实验。它还不是合同，但新方向已有一个可以重跑的起点。',
    platform_niche:'只剩几位试用者的邮件列表还在。一人愿意跑对照实验，条件是有人继续维护小版本。',
    platform_stalled:'放弃安装的几位试用者都卡在同一步。你把那一步提到新试验的第一天。',
    platform_deferred:'过去的现款换来了时间，也让最初的试用者各找了替代品。这回没人能直接把新结果接走。',
    sold_company:'出售条款保留了原有产品。你现在能选自己的工作，却不能替原团队承诺机器或工期。',
    left_platform:'退出原计划换来固定课表或新的岗位权限。现在可以借机器试验，前提是给已有承诺排在前面。',
  },
  {
    pivot_freed_capacity:'提前退掉订单时留下的机器，现在有连续一周可以做验证；同时，合作得自己补上断掉的收入。',
    pivot_old_wins:'旧合同买得起一批备件，最后一个维护条款却还没结束。留给开放试用的时间只有一部分。',
    pivot_old_small:'上一份合同只收了半款，剩余验证就挪到了夜里。新试用规则得写清楚谁能在白天用机器。',
    pivot_old_breaks:'那封撤回预算的邮件还在。刚空出来的设备可以重做新结果，但没人想先垫一笔无法追回的钱。',
    pivot_split:'两份同时跑出的结果，各自拉来一个合作方。开放试用时终于不必只拿自己的测量做对照。',
  },
  {
    ai_shared_success:'按说明跑通的另一组人已经在独立维护方案。扩张清单里少了几行需要你本人处理的事。',
    ai_shared_partial:'上次公开的流程仍有一处只能用特定设备。接班清单上，这条还留着你负责答疑的名字。',
    ai_shared_delayed:'第一次开放试用延期，合作方仍留着联系窗口。你可以把它交给别人，但得说清哪些承诺还没兑现。',
    ai_exclusive:'独家合同付了钱，也锁定了几份尚不能公开的资料。交接要先列出哪些文件需要对方签字。',
    ai_handoff:'那个改过试用顺序的新人已经能独自解释选择。交接时，你只需补充边界和过去踩过的坑。',
  },
];

// The earlier outcome changes a visible cost or an up-front effect next time.
// Nothing here changes an already displayed probability or re-rolls a result.
const carry = [
  {},
  {
    home_letter:[0,{bonds:3},'家里的回信让你更愿意请同事搭把手。'],
    study_buddy:[0,{communication:3},'一起练过的口语，让你更敢接下高峰。'],
    half_page:[2,{communication:3},'你把半页一组的练习法教给新人。'],
    locked_library:[1,{stress:-3},'提前核对营业时间，省去一次临时调班。'],
    rested_first:[0,{energy:3},'周末留过半天，这班开始时没那么累。'],
  },
  {
    rush_managed:[0,{leadership:3},'你能把最后几次上机分得更顺。'],
    rush_overtime:[1,{stress:-4},'有人接手排错，你不用再补一个通宵。'],
    rush_missed:[2,{stress:-4},'这次只承诺验收过的东西，少留一个待补的窟窿。'],
    protected_classes:[0,{engineering:3},'留下的两晚课，省去重新查波形的时间。'],
    trained_shift:[1,{leadership:3},'交接纸已经写好，对方少问你一次怎么开始。'],
  },
  {
    solo_demo:[0,{stress:4},'同事都来找你排错，基准测试多了一轮值守。'],
    partial_demo:[0,{engineering:3},'你复用当初筛选可演示功能的方法。'],
    demo_failure:[0,{energy:4},'读过旧报告的同事愿意帮你看一次信号。'],
    delegated_demo:[2,{bonds:3},'旧组员的介绍让你找到了能给反馈的人。'],
    bounded_demo:[1,{reputation:3},'提前交代边界，收尾不会让主管措手不及。'],
  },
  {
    benchmark_proof:[0,{reputation:4},'可重做的基准数据随融资材料一起交上去。'],
    benchmark_partial:[2,{engineering:3},'工作室可以直接用两个已经跑过的用例。'],
    benchmark_retracted:[1,{stress:-3},'测试清单已附在申请上，审批不用再补一轮。'],
    degree_finished:[1,{energy:3},'毕业事项已经收完，手上有完整的一周留给内部项目。'],
    sketch_demo:[2,{money:3},'先前看过动画的人帮你找到一家便宜的设备出租方。'],
  },
  {
    founder_backed:[0,{stress:-3},'支持者愿意等你先把合作条件谈清。'],
    founder_lean:[1,{energy:-4},'同一台仪器要轮用，复测得从夜里开始。'],
    founder_bootstrap:[1,{money:-3},'那台旧设备得先维修才能连跑一晚。'],
    staff_graphics:[2,{reputation:3},'原来的工牌和履历使内部转岗少过一轮审核。'],
    small_studio:[2,{money:4},'搭档联系到维护小单，停掉原型也能接上租金。'],
  },
  {
    crisis_help:[0,{energy:4},'手头有对方已经认可的一批检查项。'],
    crisis_window:[1,{reputation:4},'验收范围与上次谈下的复测条件相同。'],
    crisis_denied:[0,{money:-3},'原合作方不再借设备，要自己付一笔短租。'],
    crisis_patch:[0,{energy:-4},'维护旧过渡层的人没法全程一起测试。'],
    crisis_partial:[1,{money:3},'接着用旧支持的测试机，不用再租一台。'],
    crisis_broken:[1,{engineering:4},'卡在第一帧的旧样机留下了现成的回归用例。'],
    crisis_exit:[1,{energy:4},'上次装箱时已经挑好了还能维护的部件。'],
  },
  {
    release_hit:[0,{communication:4},'用真实工单来讲需求，少做一轮假设。'],
    release_limited:[2,{reputation:3},'受邀试用的人已认可那份有限的交付范围。'],
    release_recalled:[0,{stress:4},'必须同时演示怎样撤回，彩排增加一轮。'],
    release_bounded:[1,{leadership:4},'复用验收表的人已经准备好接过话筒。'],
    release_recovered:[1,{energy:4},'搭档自己就能负责准备，你不用全程陪跑。'],
  },
  {
    stage_breakout:[0,{money:5},'之前争取到一小笔可拨给试用的预算。'],
    stage_pilot:[0,{engineering:3},'试点方带来了可以直接使用的测试样例。'],
    stage_missed:[1,{reputation:-3},'先前没有接上的合作方，对暂停探索也失去兴趣。'],
    delegated_stage:[0,{energy:4},'搭档与试用者已写好第一份说明。'],
    quiet_growth:[1,{energy:4},'旧交付已经有人负责，能省下一轮临时调度。'],
  },
  {
    platform_adoption:[2,{energy:5},'外部使用者的并行实验可以直接用作一组对照。'],
    platform_niche:[2,{bonds:4},'已有一位小版本用户答应协作复测。'],
    platform_stalled:[0,{energy:-4},'先修掉过去阻挡试用者的安装步骤。'],
    platform_deferred:[0,{ecosystem:-3},'之前暂停维护，暂时没人能帮你接手新实验。'],
    sold_company:[2,{energy:-3},'旧设备不归你调度，得多跑一趟借用手续。'],
    left_platform:[2,{stress:-4},'手上没有旧平台的值守，可以用完整的两段机时。'],
  },
  {
    pivot_freed_capacity:[0,{energy:5},'止掉旧项目后，机时能连成完整的一周。'],
    pivot_old_wins:[1,{money:4},'上一份合同买齐了备件，这次不用再垫。'],
    pivot_old_small:[0,{energy:-4},'白天还要先做旧支持，开放试用须加一班。'],
    pivot_old_breaks:[1,{stress:-4},'这次先收款，填上上一轮合同撤回留下的空档。'],
    pivot_split:[0,{ecosystem:5},'另一组合作方愿意带自己的结果来做对照。'],
  },
  {
    ai_shared_success:[0,{energy:5},'旧工具已有外部团队能自行维护。'],
    ai_shared_partial:[1,{energy:-4},'交接前还要带人走一遍特定设备的安装。'],
    ai_shared_delayed:[1,{stress:3},'交接时必须逐个核对没有兑现的试用承诺。'],
    ai_exclusive:[1,{control:-4},'独家条款要求接任者跟客户共签几项变更。'],
    ai_handoff:[1,{energy:4},'新人已经练过一次自己负责，少开几次交接会。'],
  },
];

const preparationEchoes = [
  {},
  {asked_for_map:'碰到不认识的同事，你沿用问路时的方法，先问谁负责交接。',shared_names:'你开始把同事的名字写在排班表旁，跟当年记同桌名字一样。',private_schedule:'床头那张作息表已经换成排班表；上面仍给睡觉画了线。'},
  {shift_calendar:'原来的排班表背面，刚好够画一份上机时间。',shift_swap:'一次换班的人情还没还完，你给实验约了不会撞班的时间。',table_timing:'你沿用晚班记上菜时间的办法，开始记每块板从通电到熄灭的秒数。'},
  {bench_data:'毕业时那五份测试样本，后来成了你教新同事记日志的例子。',minimum_demo:'答辩前先圈最低交付的习惯，这回用来划清晚课和工作各自的范围。',open_notebook:'旧实验笔记被后来一届借去；有人在你留白的地方补了一条测量。'},
  {chip_foundation:'那页流片履历被放在启动计划旁：要离开的是已有基础的工作。',graphics_probe:'租来设备上的原型这回成了可演示的参考，不必只靠箭头讲想法。',market_listening:'你复述听到的真实订单。桌上的三个人暂时不讨论想象中的买家。'},
  {runway_budget:'半年的生活费还留在单独一栏，你不必把它和项目的现金合在一起算。',called_network:'当初被拉进讨论的销售朋友帮你约了半小时，要求你提前写明坏消息。',prototype_1993:'那份只有自己懂的小样需要别人接手时，你才开始补第一张示意图。'},
  {crisis_ledger:'那张现金表背面现在写着新版本的停止条件。',crisis_rehearsal:'陪你演练的人也来听发布计划，问起上次没答好的同一个问题。',crisis_retest:'旧方案最后一晚跑过的日志还在，足够拿来和新版本对照。'},
  {regression_suite:'台上将用已经通过的回归测试，答复“坏了怎么办”。',closed_demo:'闭门演示里没让人看到的争议功能，现在被从公开清单上移掉。',recovery_shift:'轮休时有人接过进度板，这次分配台上台下也能照着那份名单来。'},
  {audience_listening:'买方说过安装最耗工。新预算先留了一行写示例。',kept_veto:'上次只留一人的签字栏还在；这回团队问它会不会拖慢每一次小修。',shared_ownership:'上次确认署名时接过签字的人，这次可以自己带一次试用。'},
  {developer_pilot:'小试用时测过的几个场景，如今用来验证新工作该先做哪一个。',current_cash:'当季收入还剩下一点，足够让你把预算做成两档。',partner_scope:'你拿出此前约定的维护边界，对方终于能指出哪部分不算新承诺。'},
  {read_alexnet:'那份手抄的复现条件放进试用申请，合作者能先核对自己缺什么。',priced_commitments:'旧交付的价目表还用得上；你已经知道哪一段机时不能借出去。',searched_mobile:'上一轮差旅找到的买家回了邮件，问是否有独家档期。'},
  {public_docs:'写过的公开说明如今成了接班材料，不必从头讲一次安装。',contract_ready:'签过的验收日期也被抄进新日历；交班也不能让它突然消失。',listened_junior:'你认得来问问题的新人。对方现在已经能自己带人试用。'},
];

function followThrough(step, base, flags) {
  const preceding = Object.keys(echoes[step]).find(key=>flags[key]);
  const prepared = Object.entries(preparationEchoes[step]).find(([key])=>flags[key])?.[1];
  const immediate = echoes[step][preceding];
  const echo = [immediate,prepared].filter(Boolean).join(' ');
  const rule = carry[step][preceding];
  if (!rule) return {choices:base.choices,echo};
  const [index,adjustment,why] = rule;
  const choices = base.choices.map((option,i)=>{
    if (i !== index) return option;
    const effects = {...option.effects};
    const cost = {...option.cost};
    for (const [stat,amount] of Object.entries(adjustment)) {
      if (stat==='money' && cost.money < 0) cost.money += amount;
      else effects[stat] = (effects[stat] ?? 0) + amount;
    }
    return {...option,...(option.cost?{cost}:{}),effects,description:option.description+' '+why};
  });
  return {choices,echo};
}

function distantEcho(step, flags) {
  if (step===5 && flags.bench_data) return '毕业前那五次复测还在旧本子里。这回你留出一列，让客户自己填失败条件。';
  if (step===6 && flags.crisis_broken && flags.demo_failure) return '这已经是第二次看着屏幕不亮。你认出了一件可以先做的事：把失败写成下一位工程师能重现的步骤。';
  if (step===7 && flags.trained_shift) return '你又写了一张交接纸。这回纸不贴在出餐口，贴在演示机背后。';
  if (step===10 && flags.platform_adoption) return '早年给第一批陌生用户补的说明，现在替你找回了一个熟悉的名字：有人愿意带着自己的数据来做对照。';
  if (step===11 && flags.home_letter) return '学生时代有些话写进信里才说得出口。如今你把还要交代的事一条条写清，终于有空坐下听人说完。';
  if (step===11 && flags.rested_first) return '你记得第一次把周末留出半天的感觉。几十年过去，日历的空格仍然可以是自己选的。';
  if (step===11 && flags.study_buddy) return '那本借来的书不是你一个人念完的。如今又有人问能不能一起把最后几件事做完。';
  return '';
}

const later = [crisis,reset,scale,platform,pivot,ai,close];

function materialize(options, id, phase, dims) {
  return options.map(({axes,...option},index)=>({
    id:`${id}-${phase}${index+1}`,...option,
    traits:axes.map((d,i)=>({dim:dims[i],d})),
  }));
}

export function getScene(state) {
  const {step,flags={}} = state;
  const route = state.phase === 'result' && step > 0 ? state.journal?.[step-1]?.route ?? state.route : state.route;
  const context = {...state,route,flags};
  const future = isExpandedStory(state) && step >= 12;
  const original = future ? createFutureCompanyScene(context) : opening[step] ?? later[step-5]?.(context);
  if (!original) throw new RangeError('找不到这个人生节点');
  const base = future ? original : groundCareerScene(groundScene(original,context),context);
  const id = `scene-${String(step+1).padStart(2,'0')}`;
  const {choices,echo} = future ? {choices:base.choices,echo:base.echo} : followThrough(step,base,flags);
  const callback = distantEcho(step,flags);
  const enriched = enrichContinuityScene(enrichDilemmaScene({
    ...base,id,chapter:Math.floor(step/2),
    prep:materialize(base.prep,id,'p',matrix[step].slice(0,2)),
    choices:materialize(choices,id,'c',matrix[step].slice(2)),
    ...(callback ? {prepStory:base.prepStory+' '+callback} : {}),
    alternate:Boolean(flags.counterfactual || (step>=5 && route!=='company')),
    ...(echo ? {echo} : {}),
  }, context, 'career'), context, 'career');
  return enrichAffairScene(enrichIfScene(enrichLayoffScene(enriched, context, 'career'), context, 'career'), context, 'career');
}
