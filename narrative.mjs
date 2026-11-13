// Story copy is separate from the stable option IDs, effects and probabilities.
// Public addresses locate the scene; individual meetings and assignments are fiction.
export const PROTAGONIST = '黄二勋';
export const PREMISE = {
  year: '1973', age: 10,
  lead: '1973 年，你叫黄二勋，十岁，刚和哥哥来到美国读书。父母还在曼谷。你想写封信回家，却不知道该不该说自己想家。',
  past: '你出生在台湾，在曼谷长大。来美国后，你和哥哥 Jeff 先住在塔科马的亲戚家，后来搬进肯塔基州 Oneida 的寄宿学校。白天去当地小学上课，晚上回宿舍。英语还不熟，很多事都得问哥哥。',
  hope: '年轻时读书、谋生，后来也会遇到新选择：继续奋斗、重新来过，或退休、回学校、学点新东西、写一本自己的传记。结婚后，夫妻也可能重新和好，或选择分居、离婚。',
  task: '新开一局共 16 站，从 1973 年到 2036 年。每站先处理生活中的事，再做准备、决定接下来的安排，共 48 次选择。选好后点「提交安排」，这次选择就会生效。进度自动保存在当前浏览器。一局最多计时 26 分钟，暂停或切走页面时不计时；时间到了，就回看已经走过的经历。旧存档仍按原来的 12 站继续。',
};

export const NARRATIVE_SOURCES = [
  {id:'obi-address',title:'Oneida Baptist Institute：公开校址',url:'https://www.oneidaschool.org/editoruploads/files/Contact%20Us/ContactUs.pdf',note:'11 Mulberry Street 为学校公布的实体地址，用于定位校区；不将现行手册当作 1973 年校规。'},
  {id:'obi-history',title:'Oneida 校刊：黄仁勋与哥哥寄宿、在当地小学就读',url:'https://www.oneidaschool.org/copy094915_2018_JulAug_Mountaineer.pdf'},
  {id:'aloha-address',title:'Aloha High School：学校官网与校址',url:'https://aloha.beaverton.k12.or.us/',note:'第二幕从学校出发，未把未核实的 Denny’s 打工门店写成真实地址。'},
  {id:'dearborn',title:'OSU 档案馆：Dearborn Hall 历史与地址',url:'https://guides.library.oregonstate.edu/buildings/dearborn-hall',note:'1949 年建成，曾长期供电气工程专业使用；1891 SW Campus Way。'},
  {id:'lori',title:'OSU：黄仁勋与 Lori 的工程课堂经历',url:'https://news.oregonstate.edu/news/nvidia-ceo-spouse-give-25-million-kelley-engineering-center'},
  {id:'stanford-address',title:'斯坦福：2019 年主校址由 Serra Mall 更名',url:'https://news.stanford.edu/stories/2019/09/naming-jane-stanford-way-moves-ahead',note:'2019 年以前使用 450 Serra Mall；以后使用 450 Jane Stanford Way。均为校区定位地址。'},
  {id:'dennys-history',title:'NVIDIA：Denny’s 打工经历与三位创始人的饭桌',url:'https://blogs.nvidia.com/blog/nvidia-dennys-trillion/'},
  {id:'dennys-address',title:'Denny’s：2484 Berryessa Road 门店',url:'https://locations.dennys.com/ca/san-jose/249526'},
  {id:'tiros-1996',title:'计算机历史博物馆：1996 年产业资料中的 NVIDIA 地址',url:'https://archive.computerhistory.org/resources/access/text/2013/04/102723332-05-01-acc.pdf'},
  {id:'tiros',title:'SEC：NVIDIA 早期公司申报地址',url:'https://www.sec.gov/Archives/edgar/data/1045810/000092962499000772/0000929624-99-000772-index.htm'},
  {id:'monroe',title:'SEC：NVIDIA 1999 年申报地址',url:'https://www.sec.gov/Archives/edgar/data/1045810/000101287099004592/0001012870-99-004592-index.html'},
  {id:'san-tomas-2007',title:'SEC：NVIDIA 2007 年股东文件与总部地址',url:'https://www.sec.gov/Archives/edgar/data/1045810/000119312507106999/ddef14a.htm'},
  {id:'san-tomas-2012',title:'SEC：NVIDIA 2012 年文件与总部地址',url:'https://www.sec.gov/Archives/edgar/data/1045810/000104581012000029/s-8exhibit51.htm'},
  {id:'san-tomas-2016',title:'NVIDIA：2016 年报告与总部地址',url:'https://images.nvidia.com/content/crr/2016/sustainability-report/pdf/2016_NVIDIA_Sustainability_Report_FINAL-1.pdf'},
  {id:'nvidia-address',title:'NVIDIA：公开总部地址',url:'https://www.nvidia.com/en-us/contact/'},
  {id:'nvidia-address-history',title:'NVIDIA：2018 年报告中的 San Tomas 总部地址',url:'https://www.nvidia.com/content/dam/en-zz/Solutions/careers/2018-NVIDIA-EEO-1-Consolidated-Report.pdf'},
  {id:'buck',title:'NVIDIA：Ian Buck 与 CUDA',url:'https://blogs.nvidia.com/blog/author/ian-buck/'},
  {id:'sega-history',title:'Sequoia：黄仁勋与创始团队回顾世嘉危机',url:'https://sequoiacap.com/podcast/crucible-moments-nvidia'},
];

const real = (name,role) => ({name,role,kind:'历史人物'});
const invented = (name,role) => ({name,role,kind:'虚构角色'});
const chris = real('Chris Malachowsky','联合创始人，负责工程协作');
const curtis = real('Curtis Priem','联合创始人，负责图形架构');
const lori = real('Lori Mills','工程专业同学；原型人物后来的人生伴侣');
const denny = {place:'圣何塞 · Denny’s 项目碰头',address:'2484 Berryessa Rd, San Jose, CA 95133',addressNote:'真实餐馆地址；本幕碰头为虚构，并非在此设立办公室。',sourceIds:['dennys-address']};
const campus = year => ({place:'斯坦福大学 · 校区项目讨论',address:year<2019?'450 Serra Mall, Stanford, CA 94305':'450 Jane Stanford Way, Stanford, CA 94305',addressNote:'主校区定位地址；具体项目、任职与会面为创作。',sourceIds:['stanford-address']});
const office = (year) => year<=1997
  ? {place:'森尼韦尔 · NVIDIA 早期办公室',address:'1226 Tiros Way, Sunnyvale, CA 94086',addressNote:'同期公开公司地址；会议与任务经过创作。',sourceIds:['tiros-1996','tiros']}
  : year===1999
    ? {place:'圣克拉拉 · NVIDIA 办公室',address:'3535 Monroe Street, Santa Clara, CA 95051',addressNote:'1999 年公开公司地址；并非纽约上市现场。',sourceIds:['monroe']}
    : year<2017
      ? {place:'圣克拉拉 · NVIDIA 总部',address:'2701 San Tomas Expressway, Santa Clara, CA 95050',addressNote:'采用该年代公开总部地址，具体会议为创作。',sourceIds:[year===2007?'san-tomas-2007':year===2012?'san-tomas-2012':'san-tomas-2016']}
      : {place:'圣克拉拉 · NVIDIA 总部',address:'2788 San Tomas Expressway, Santa Clara, CA 95051',addressNote:'公开总部地址；交班与退休是本局选择。',sourceIds:['nvidia-address','nvidia-address-history']};

// Each item changes copy only, preserving the original choices and their tradeoffs.
const early = [
  {
    year:'1973',date:'1973 年 · 入学后的第一个周五',age:10,
    place:'肯塔基州 Oneida · 寄宿部',address:'11 Mulberry Street, Oneida, KY 40972',
    addressNote:'学校现公布的校区地址。具体宿舍、星期与作息为剧情设定。',
    people:[real('Jeff','和你一起赴美的哥哥'),invented('汤姆·米勒','同班同学，愿意陪你练英文')],
    title:'周一之前，先在 Oneida 站稳脚跟',
    story:'周五放学，你从 Oneida Elementary School 走回 Oneida Baptist Institute 的寄宿部。哥哥 Jeff 和你住在这里，爸妈还在曼谷。你想写信告诉他们自己过得还好，可周一要当着全班读短文，第一段里就有两个词，你今天听了也没听清。\n汤姆·米勒问你周六去不去图书室。Jeff 看了一眼周末作息表：“你知道怎么走吗？别到了才发现没开门。”你这几天没睡够，上课点到名字就低头。那两个词偏偏都在开头。',
    prepTitle:'周五晚，先花十分钟把事情问明白',prepStory:'Jeff 在走廊等你，汤姆还没离校。你抄下的图书室开放时间少了一行，作息表上的几个英文缩写也看不懂；周一朗读的那页纸已经被你捏皱了。',
    mission:{deadline:'周一上课前',objective:'为第一段英文朗读做准备，并在练习、给家里报平安和补觉之间确定周末的重点。',deliverable:'一封家书、一页共同练习的生词，或一份能兑现的休息安排。'},
    factText:'黄仁勋与哥哥曾寄宿 Oneida Baptist Institute，白天在当地小学上课。公开资料对抵美年份和年龄的叙述不尽一致；本游戏明确设定黄二勋在 1973 年、10 岁开局。Jeff 为公开传记中的哥哥姓名；汤姆、课堂任务和周末安排为虚构。',
    sourceIds:['witt','obi-history','obi-address'],
    prep:[
      ['请 Jeff 画出上学和借书路线','把宿舍、学校与图书室画在一页纸上，再请哥哥帮你确认周六几点能借书。'],
      ['找汤姆互相念对名字','请汤姆慢慢念一遍短文里不会的词，再问他这周有没有没听懂的地方。'],
      ['把周一课程和熄灯时间抄好','不再挨个问人。把作息表放到床头，给周末自习和睡眠各留出时段。'],
    ],
    choices:[
      ['写信给曼谷的父母，然后睡觉','写清学校名称、这周最难的一件事和哥哥的近况。买邮票寄出，把今晚留给睡眠。'],
      ['周六和汤姆读完第一段','带着课本去图书室，轮流朗读，把不认识的词写在同一张纸上。要多花半天，也可能白跑。'],
      ['留半天休息，周日再独自练习','告诉 Jeff 你先补觉，把短文留到周日。少练几遍，换一个有精神的周一。'],
    ],
    outcomes:[
      ['家书里留下了 Oneida 的校名和你真实的困难。Jeff 帮你检查收信人，信寄出后，你第一次按时关灯。朗读仍要自己补上，至少家里会知道你这一周怎样度过。'],
      ['汤姆和你把第一段读完，纸上留下六个生词和下周再见的时间。你能独自念出开头，也终于有一个会在走廊叫你名字的人。','你和汤姆只练完半段，最难的一句仍然卡住。不过周一前不再是一张白纸；你们约好下次从这句接着读。','图书室已经关门，汤姆白跑一趟。你抄下开放时间，向他解释，下次出发前先确认。第一段只能带回宿舍独自练习。'],
      ['周六下午，Jeff 叫你吃饭时，你已经补了一个完整的觉。短文没多背一页，但周日你终于能坐下来，把周一要读的开头逐词过一遍。'],
    ],
    outcomeLabels:[['家书已寄出'],['读完第一段','练完半段','图书室关了'],['周末补足一觉']],
  },
  {
    year:'1978',date:'1978 年 · 一个周五放学后',age:15,
    place:'俄勒冈州比弗顿 · Aloha 高中',address:'18550 SW Kinnaman Rd, Beaverton, OR 97078',
    addressNote:'本幕从真实学校校址出发；晚班发生在波特兰地区 Denny’s，原打工门店的门牌未核实。',
    people:[real('Jeff','哥哥，关心你的课业安排'),invented('玛丽·戴维斯','Denny’s 领班'),invented('艾迪·布朗','刚到店里的同事')],
    title:'先交排班表，还是先把作业做完',
    story:'你和家人已经搬到俄勒冈。周五走出 Kinnaman Road 上的 Aloha 高中，周一要交的数学作业还在书包里。晚些时候，你要去 Denny’s 洗碗、收桌，客人一多还得帮着送餐。\n“周末缺人，你能多来一班吗？”领班玛丽·戴维斯今晚就要定下周的班表，新来的艾迪还分不清七号桌和九号桌。多上一班能多攒一点学费。Jeff 问过你，数学作业打算留到哪天做，你还没答他。',
    prepTitle:'到店前，把课表和班表放在一起',prepStory:'玛丽的班表压着你的数学作业，周二和周四晚都还空着。艾迪留下的七号桌交接单只写了桌号，没有送餐顺序；今晚收班前，玛丽就要拿走这张表。',
    mission:{deadline:'今晚收班前',objective:'交给玛丽一份下周能兑现的班表，决定多挣钱、保住课堂还是带会新人。',deliverable:'明确接几班、谁负责七号桌，以及周一作业何时完成。'},
    factText:'黄仁勋曾就读 Aloha High School。NVIDIA 的回顾记载，他 15 岁时在波特兰 Denny’s 工作，做过洗碗、收桌和服务工作。本幕设于 1978 年，具体班次、作业、领班与同事为创作。',
    sourceIds:['witt','dennys-history','aloha-address'],
    prep:[['把两晚作业时间先划出来','先在课表上圈出周二、周四，再给玛丽写出你能承担的班次。'],['和艾迪商量换一班','用周六的一班换回周二晚，答应艾迪下一次需要时回换。'],['先记一轮七号桌的送餐时间','从点单到上菜逐项记时，收班后再决定自己能多接多少桌。']],
    choices:[['接下周末高峰，协调七号桌','答应玛丽多上一班，带艾迪核对桌号和送餐顺序。收入会增加，周一作业只能晚些做。'],['只签两班，留两晚做作业','告诉玛丽下周只能上两班，少挣一些，按时完成数学作业和大学申请准备。'],['签固定班，给艾迪写交接单','不争高峰班，把桌号、热餐顺序和收班事项写给艾迪，代价是今晚晚些下班。']],
    resultLead:'这一周的班表执行完，玛丽把七号桌的记录交还给你。',
  },
  {
    year:'1984',date:'1984 年 · 毕业答辩前一晚',age:21,
    place:'科瓦利斯 · OSU Dearborn Hall',address:'1891 SW Campus Way, Corvallis, OR 97331',
    addressNote:'真实电气工程教学楼地址；毕业项目与答辩情节为创作。',
    people:[lori,invented('陈立文','毕业项目组员，负责电路排错')],
    title:'明早九点，交出能复测的电路板',
    story:'你在俄勒冈州立大学读电气工程，毕业后准备去加州找芯片设计工作。Dearborn Hall 的实验台上，两块计数电路板一块稳定，一块反复复位。明早九点要交演示和测试记录，今晚的台位只剩四小时。\n陈立文愿意接手查焊点，但需要你把排错方法交给他。Lori Mills 是你在工程课上认识的人，她约你在答辩后一起吃饭。你想给第一份工程工作留下可靠的作品，也不愿总让亲近的人等到散场。',
    prepTitle:'把四小时分给测量、文档或交接',prepStory:'测试纸上，同一块板子留下了几次不同的复位结果，旁边却没写清通电顺序。陈立文拿着探针等你的记录，台位预约表已经翻到了明早的答辩名单。',
    mission:{deadline:'明早 9:00 答辩前',objective:'提交可演示的计数电路、测试记录与分工说明，并决定今晚由谁负责最后排错。',deliverable:'两块完整演示、一块可靠演示，或一份诚实的故障报告。'},
    factText:'黄仁勋于 1984 年取得 OSU 电气工程学士学位。OSU 记载，他与 Lori 在工程课程中结为实验搭档。Dearborn Hall 是真实电气工程教学楼；陈立文、计数板项目与饭局是本游戏的创作。',
    sourceIds:['osu','bio','dearborn','lori'],
    prep:[['把反复复位的板子测五遍','记录每次通电、复位和信号变化，让陈立文也能按相同步骤重现问题。'],['圈出明早只演示哪些功能','和陈立文确认最低验收范围，把演示时间和收台时间都写在白板上。'],['复印一套能交给下一届的笔记','买齐备件和复印纸，画出电路与测量点，让后来的人能从同一个实验继续。']],
    choices:[['独自修完两块板，负责全部演示','请陈立文先去准备答辩稿，自己承担最后测试。可能完成整套，也可能错过答辩后的饭。'],['让陈立文排错，你负责报告','把板子和日志交出去，在报告上写清他的贡献；完成验收后按时去见 Lori。'],['提交一块已验证的板和限制清单','自己签下可复现的版本，明确另一块还不能用，争取准时结束这次交付。']],
    resultLead:'第二天，Dearborn Hall 的答辩桌上摆着你的板子和记录。',
  },
  {
    year:'1992',date:'1992 年 · 硕士课程收尾的一周',age:29,
    ...campus(1992),
    people:[real('Chris Malachowsky','在 Sun 工作的工程师'),real('Curtis Priem','在 Sun 工作的图形芯片设计者'),lori],
    title:'把新机会变成一份能复测的报告',
    story:'离开 OSU 后，你先在 AMD 做过芯片设计，又进入 LSI Logic。白天交公司项目，晚上继续读斯坦福的电气工程硕士；到 1992 年，学位终于接近完成。你和 Lori 已经有了自己的家庭，夜晚不能无限延长。\n在 Sun 工作的 Chris Malachowsky 和 Curtis Priem 也在琢磨：个人电脑能不能画出更像真的三维场景？他们带来的性能数字用了不同的测试条件，还不能放在同一张表里比较。下周碰头的日期已经定下，毕业手续和公司项目的截止日也挤在这一周。',
    prepTitle:'下次碰头前，还剩两个晚上',prepStory:'工程笔记上记着两次设计失误。三维图形草稿还没写要在哪台机器上跑、能用多贵的设备。Chris 和 Curtis 留下的问题夹在毕业手续里，你从头翻一遍，今晚就过去了一半。',
    mission:{deadline:'下周碰头前',objective:'决定这周交出性能报告、小演示，还是完成学位收尾，为下一年的职业选择腾出空间。',deliverable:'一份可复测的图形性能对照，或一次边界清楚的阶段收尾。'},
    factText:'黄仁勋曾任职 AMD、LSI Logic，1992 年获斯坦福电气工程硕士学位。Chris Malachowsky、Curtis Priem 与他后来共同创业。此处课程安排、测试和碰头为创作；地址使用 2019 年更名前的校名地址。',
    sourceIds:['bio','osu','dennys-history','stanford-address'],
    prep:[['整理 AMD、LSI 的两次设计教训','用一页纸写出一次成功流片与一次失败复测的原因，先确认自己的工程底子。'],['租设备做一个旋转方块','把三维图形想法做成几分钟能跑的小样，付出设备费与一个晚上的精力。'],['请 Chris、Curtis 拆开客户需求','问清游戏开发者需要的速度、画面和价格，把三个人的假设各写成一行。']],
    choices:[['用两个晚上跑同场景对照','比较同一段图形在两种方案上的表现，把设备、条件和失败记录一起交给 Chris 与 Curtis。'],['办完毕业手续，按约回家','先完成硕士课程与现有工作，给 Lori 和自己留出一段不被新演示占用的时间。'],['只用一晚拼一个小演示','把旋转方块演给 Chris 和 Curtis 看，主动说明性能还未验证，以此约下一次谈话。']],
    resultLead:'一周后，你把这一阶段真正完成的东西放到下一次碰头的桌上。',
  },
  {
    year:'1993',date:'1993 年 · 春天的一次创业讨论',age:30,
    ...denny,place:'圣何塞 · Denny’s 创业饭桌',
    people:[chris,curtis,invented('陈立文','老同学，工作室支线的搭档')],title:'离开 LSI 之前，把三个人的责任写清',
    story:'你和 Chris Malachowsky、Curtis Priem 坐在 Berryessa Road 的 Denny’s。两人想做一块图形芯片，让普通 PC 也能跑起更好的三维游戏。你熟悉芯片生意，也知道一个工程团队每月要花多少钱。架构已经画满一张餐巾纸，产品和订单都还没有，启动预算也没人签字。\n你今年 30 岁，每月还有 LSI Logic 的工资，家里的开支也照常。店员来添咖啡时，你们还在算同一笔钱。设备要租，第一批样片要付费，下个月的生活费也得从存款里出。',
    prepTitle:'咖啡续杯前，先写钱和分工',prepStory:'Chris 把工程排期推过来，Curtis 在架构草图旁写下样片需求。你带来的账单上，生活费、租设备和做样片各有一项；谈过的投资还没到账，眼下能付出去的只有现有储备。',
    mission:{deadline:'这次饭桌讨论结束前',objective:'选定下一年的职业路线，写下预算、合作者与第一份交付；创业时明确三位合伙人的责任。',deliverable:'一页启动计划、内部项目申请，或工作室第一份小单范围。'},
    factText:'1993 年黄仁勋、Chris Malachowsky 与 Curtis Priem 创立 NVIDIA，Denny’s 是其早期讨论地点。本幕使用 Berryessa Road 门店地址；辞职、预算和三条可选人生均为创作，不是当年会议记录。',
    sourceIds:['timeline','bio','dennys-history','dennys-address'],
    prep:[['把家里半年开支列给两位搭档','先留生活缓冲，再讨论能投入产品多少；不把还没到账的投资算成现金。'],['请陈立文帮忙找第一批客户','把样片需求和订单周期问清楚，承认销售伙伴也能挑战技术方向。'],['先做一份自己能跑通的核心小样','用一个晚上验证芯片构想最关键的部分，暂时把架构决定留在自己手里。']],
    choices:[['辞职，和 Chris、Curtis 创业','由你组织公司、Chris 协调工程、Curtis 负责图形架构。投入启动资金，争取第一轮支持。'],['留在 LSI，提交内部图形项目申请','工资继续，试验预算交给公司审批。陈立文作为这条虚构路线的工程同伴加入讨论。'],['和陈立文做两人工作室','租一套设备，先接游戏图形移植小单。两个人自己决定范围，也自己负责找客户和交租。']],
    resultLead:'离开 Berryessa Road 时，你终于有了一份写着责任和预算的决定。',
  },
];

const laterYears=[1996,1997,1999,2007,2012,2016,2024];
const contexts = {
  employee:{ally:invented('陈立文','一起做图形工具的工程师'),partner:invented('马丁·科尔','审批试点的产品主管'),product:'内部图形工具',team:'陈立文与内部图形组'},
  studio:{ally:invented('陈立文','工作室搭档'),partner:invented('马丁·科尔','游戏客户的制作人'),product:'工作室移植工具',team:'陈立文与工作室伙伴'},
  researcher:{ally:invented('陈立文','合作研究员'),partner:invented('马丁·科尔','联合项目协调人'),product:'可复现的图形实验包',team:'陈立文与学生'},
  sold:{ally:invented('陈立文','独立技术合作人'),partner:invented('马丁·科尔','接手产品的项目负责人'),product:'交接后的维护工具',team:'陈立文与接手团队'},
};

function laterBrief(s,base) {
  const year=laterYears[s.step-5];
  const company=s.route==='company';
  const historical=company&&!s.flags.counterfactual;
  const other=contexts[s.route]??contexts.employee;
  const person=company?'Chris Malachowsky':'陈立文';
  const client=company&&s.step===5?'入交昭一郎（Shoichiro Irimajiri）':company?'外部试用团队的林晓':'马丁·科尔';
  const junior=invented('林晓',s.route==='researcher'?'研究生、后来的研究负责人':'工程师、潜在项目接手者');
  const product=historical?({6:'RIVA 128',7:'GeForce 256',8:'CUDA 工具链',9:'GPU 计算实验',10:'DGX-1',11:'下一代 AI 计算系统'}[s.step]??'NV2 图形方案'):company?'公司图形与计算产品':other.product;
  const team=company?'Chris 与工程团队':other.team;
  const located=company?office(year):s.route==='researcher'?campus(year):denny;
  const common={year:String(year),age:year-1963,date:`${year} 年 · 本次项目决定`,...located,
    people:company?[chris, ...(s.step<=6?[curtis]:[junior])]:[other.ally,other.partner],
    sourceIds:[...located.sourceIds],
  };
  if(s.step===5) return {...common,date:'1996 年 · 重谈合作前一晚',
    people:company?[chris,curtis,real('入交昭一郎（Shoichiro Irimajiri）','世嘉高管，历史中的求援对象')]:common.people,
    title:company?'明天见世嘉，先把架构问题讲清':'明天重谈合同，先交出失败清单',
    story:company
      ?'NV1 用四边形拼出三维画面，和世嘉合作的下一代方案也沿用了这个思路。其他厂商正转向微软支持的三角形路线。Curtis Priem 的测试说明，就算旧方案能交给世嘉，往后的 PC 游戏也很难接上。Chris Malachowsky 已经排好工程师下个月的工作，工资还得照发。\n明天你要见世嘉的入交昭一郎。对方要看钱已经花在哪儿、原来答应的功能还有哪些能交，才会考虑要不要出下一版样机的验证费。承认旧方案走不通，合同可能保不住。照原样做下去，账上的钱也许先用完。今晚得把能核实的情况写进那三页说明。'
      :s.route==='studio'
        ?'最大的客户换了目标显卡，纹理上传和显示驱动都得重新适配。陈立文把新增工时写在旧合同边上。三次测试都卡在客户的新机器上，旧报价里没有这段工作，设备租金和下个月房租倒是已经到了付款的时候。\n马丁·科尔明天要带着新的验收范围回去重报预算。你翻到合同首页，原定交付日还印在那里。'
        :s.route==='researcher'
          ?'同一段图形实验在你们的机器上跑得好好的，到了联合实验室，画面少了几块面，帧率也比报告里低。对方连跑三次都没能复现，已经暂停采用这个版本。明天续约评审，马丁·科尔要问同一份代码为什么会跑出两种结果。\n陈立文把两边的硬件配置和日志摊开，软件版本还有几处没对齐。预约表已经排到下一轮实验，连只复测出错场景也还没有独占的机时。'
          :s.route==='sold'
            ?'接手方把演示装到自己的机器上，程序一启动就黑屏。日志停在调用显示驱动的地方。移交合同快到期了，陈立文拿来的故障单上，原有问题和接手之后提出的改动还混在一起。\n马丁·科尔明天要确认最后一次验收。接手团队按手里的说明还跑不出你交付时的演示，现场要求也有几项超出了合同写明的范围。'
            :'隔壁部门拿到内部图形原型后，旋转物体一跑就缺面，颜色也错了。对方拒绝接手，接口转换代码也还没人愿意维护。陈立文带来三次失败的日志，程序每次都停在相近的位置，原因还没找出来。\n马丁·科尔明天要审下季度的台位。现有试验时段快用完了，下一轮按什么验收还没写，同事也排不下后面的工作。',
    prepTitle:'做完现金表、故障表与下一版计划',prepStory:company
      ?'Chris 把发薪日圈了出来。现金表上的余额还要扣掉已经答应的付款。Curtis 找到了旧架构出错的场景，日志却还缺几步，世嘉拿去未必能重跑。下一版能交哪些功能、何时验收，还得在明天见入交昭一郎前说清。'
      :s.route==='studio'
        ?'陈立文的工时表多了一段新显卡适配，旧报价仍按原机器算。马丁带回去的附表要写明哪些功能重做、做到哪一步算通过。设备租金和待收款的日期已经定了。'
        :s.route==='researcher'
          ?'两组日志旁是各自的软硬件配置，版本差异还没排除。陈立文在预约表上找了一遍，复测至少要占用一整晚，和别组的实验撞在一起。'
          :s.route==='sold'
            ?'陈立文把移交合同翻到责任范围一页，旁边就是那份黑屏日志。故障单有几项没写怎样重现，双方也还没签字确认哪些是原交付的问题、哪些是接手后的新要求。'
            :'陈立文把三次运行日志夹进台位申请，接口依赖一栏还缺隔壁部门的环境记录。现有台位快到期了，马丁要在评审表上看到下一轮具体测什么、怎么判断通过。',
    mission:{deadline:'明天的重谈会议前',objective:`向${client}交代架构失败，选定求援、补旧方案或退出的路径。`,deliverable:'可支撑多久的现金表、失败复现步骤、下一版的验收条件。'},
    prep:[['列出工资日和三个交付缺口','把还能撑多久、哪三项没做成、何时必须停做写在同一张纸上。'],[`请${person}追问最难的问题`,'演练如何承认做不到的部分，不用新的空承诺换一个模糊的延期。'],['把旧原型的失败再复测一晚','重跑最容易卡住的场景，找出是否还有兼容办法，代价是今晚不能睡足。']],
    choices:[[company?'向入交昭一郎承认路线问题':'向马丁交代失败，请求缩小验收',`用故障日志与现金表申请一个可验证的窗口，明确${team}下一轮只交哪部分。`],['再付一轮设备费，交过渡样机',`请${person}保留旧方案排期，承诺送出一台能演示的样机，同时承担继续失利的风险。`],[base.choices[2].title,`${base.choices[2].description} 由${person}核对移交、欠款和剩余设备，逐项通知${client}。`]],
    resultLead:`重谈结束，你把${client}的答复带回给${team}。`,sourceIds:[...common.sourceIds,'sega-history','ntu'],
  };
  if(s.step===6) return {...common,date:'1997 年 · 试用交付前的三天',
    title:`把${product}交到别人手里`,
    story:`${historical?'RIVA 128 的样机已经摆上测试台。':`这次要交的${product}已经摆上测试台。`}${person}在验收单上勾了启动和完整演示，换机测试那一栏还空着。旧项目的板子也曾在这里跑通过。\n三天后就要交给${company?'第一批整机厂':'马丁·科尔安排的试用组'}。${person}想再换一台机器跑一轮。团队已经连着赶了几夜，值夜班的人低头一看，刚才那条报错抄了两遍。`,
    prepTitle:'交付倒数三天，先补哪一处',prepStory:company?`${product}的启动和完整演示已有记录，换机测试仍缺最后一轮结果。Chris 手边压着试产扩量报价，代工与封测窗口都有确认期限，报价里的数量还没有对应上通过验收的版本。`:`${product}的清单列着启动、完整演示和换机测试，最后一栏还没有结果。${person}手里拿着试用组的环境记录，交付包里的安装说明却仍按你们自己的机器编写。`,
    mission:{deadline:'三天后的试用交付',objective:`交付别人能运行的${product}，确定支持范围、已知故障与值班安排。`,deliverable:'安装包或样机、三项验收结果、一个可联系的维护负责人。'},
    prep:[['把旧故障写成三项回归用例','重跑启动、完整演示与换机测试，把失败日志也附上。'],[`和${person}做一次闭门演示`,'先检查自己相信的核心功能，争议部分暂时不向外部展示。'],[`让${person}接班，安排一天轮休`,'把进度表和未完成测试逐项交接，代价是今晚少跑几项。']],
    choices:[['按窗口交完整版本',`将${product}连同安装步骤交给试用方；如果换机失败，要立刻召回并由${team}修复。`],['只交三项测试均通过的部分',`让${person}签验收单，限制未通过环境，先确保试用方拿到稳定版本。`],['延期一周，重新排测试和值班',`由${person}接手排期。先让疲劳的人休息，接受有人因此放弃这次试用。`]],resultLead:`${product}的验收结果回到了${person}手上。`,
  };
  if(s.step===7) return {...common,date:'1999 年 · 对外展示前一天',
    title:historical?'GeForce 的舞台上，谁来讲这次成果':'明天的展示，写上谁的名字',
    story:`${historical?'NVIDIA 今年已经上市，明天要展示 GeForce 256。':base.story}\n${person}拿来修复记录，${company?'外部试用者林晓':'马丁·科尔'}在问，明天看完${product}的演示，遇到问题找谁。邀请函已经发了，讲稿封面只有你的名字，修复记录上却有一长串签名。下季度能抽出多少人做支持，得看哪些指标已经测过、还有多少工作没做完。`,
    prepTitle:'明天上台前，确认署名和承诺',prepStory:`${product}的讲稿和修复记录摊在一起，两边的署名还没对上。试用方来信问，演示里那项新功能什么时候能交给他们用，试用期出了故障又该找谁。回信还没署名。`,
    mission:{deadline:'明天展示开始前',objective:'交出能兑现的展示方案，决定谁上台、谁签字、下季度最多接多少工作。',deliverable:'署名表、演示范围和带负责人的后续计划。'},
    prep:[['请试用方逐条说清要买什么','让实际交付的工程师旁听，避免把掌声当成订单。'],['由自己保管最后的范围签字权','写出未经你确认就不能承诺的功能，也接受所有临场问题还得回到你这里。'],[`和${person}核对署名及授权`,'把展示后的技术答复交给真正负责的人，让他们能直接对接用户。']],
    choices:[['自己登台，为下一季争取支持',`带${product}的演示和预算上台，回答客户什么时候能用；更多关注也会带来更多亲自负责的工单。`],[`把话筒交给${person}`,'让实际负责人讲结果，你在场接困难问题，接受有些合作今后不必经你转达。'],['只开小会，讲清账目和产能',`请${person}与合作方确认一份按周执行的计划，拒绝超出能力的指标。`]],resultLead:`展示结束，${person}把新的联系人与承诺写回交付表。`,
  };
  if(s.step===8) return {...common,date:'2007 年 · 第一轮开发者计划评审',
    people:company?[real('Ian Buck','CUDA 技术负责人'),chris]:[...common.people,real('Ian Buck','时代背景中的 CUDA 开发者')],
    title:historical?'给 CUDA 一年，先让三位开发者跑通':'给工具一年，还是先交这季的账',
    story:`NVIDIA 去年推出了 CUDA 架构。${historical?'到了 2007 年，Ian Buck 拿到的试用反馈说，有人平时会用图形卡，真要在上面写通用计算程序，连第一个示例也没跑起来。':`到了 2007 年，你负责的${product}也遇到了开发者支持的问题。`}\n试用者发了三份反馈，有人卡在安装，有人没看懂示例，还有人出了错也不知道该写信给谁。${company?'Ian Buck':person}想给工具和文档留一年的时间。你翻开眼下的交付排期，同一批人也排在上面，最新那封求助邮件还没有人回。`,
    prepTitle:'签预算前，先定义第一轮试用',prepStory:'三份安装记录各卡在不同的步骤，照着示例文档还查不出这些报错。第一轮试用的人都留了联系方式。交付排期却没给回邮件和修安装问题留工时。',
    mission:{deadline:'本次年度预算评审结束前',objective:`决定${product}是否获得持续支持，并写清第一轮开发者试用的验收条件。`,deliverable:'三位试用者的安装记录、一个可运行示例，以及维护或退出计划。'},
    prep:[['用现有收入请三位用户试装','承担一次试用与答疑成本，要求对方留下卡住的具体步骤。'],['先把本季能到账的交付排好','核对合同、负责人和收款节点，给当前工作留足现金。'],[`和${company?'Ian Buck':person}拆出三个试用阶段`,'先安装，再跑示例，最后交反馈；逐项约定谁维护、何时评估是否继续。']],
    choices:[['持续投入工具、示例和文档',`为${product}保留分阶段预算，安排${company?'Ian Buck':person}组织外部试用与问题修复。`],['暂停长线维护，交完本季合同','逐个告知试用者支持边界，把人手退回已经答应的产品、课程或客户。'],[base.choices[2].title,`${base.choices[2].description} 让${person}核对代码、客户联系人和未结工单。`]],resultLead:`第一轮试用结束，${company?'Ian Buck':person}将安装记录和维护清单放回预算桌。`,sourceIds:[...common.sourceIds,'buck','timeline','ntu'],
  };
  if(s.step===9) return {...common,date:'2012 年 · AlexNet 结果发表之后',
    people:[...common.people.filter(p=>p.name!=='林晓'),junior,real('Alex Krizhevsky、Ilya Sutskever、Geoffrey Hinton','AlexNet 论文作者；本幕通过论文出现')],
    title:'两台 GPU 的论文，能换来多少排期',
    story:`${company?'移动计算项目的验收日期已经定了，做测试的人还腾不出手。':base.story}2012 年，Alex Krizhevsky、Ilya Sutskever 和 Geoffrey Hinton 发表了 AlexNet 论文，报告了用 GPU 训练图像识别模型的结果。\n${person}把论文打了出来。林晓想用两周重跑其中一段训练，看看在你们的设备上要跑多久、要占多少资源。她要的那段机时已经留给旧项目了。验收日不会跟着这篇论文往后挪，而你们还没跑出论文上的结果。`,
    prepTitle:'今天先列设备、样本与旧承诺',prepStory:'论文里的显存配置和手边的机器不完全一样。林晓的清单上，训练数据和代码版本还没确认。她要连着用机的那几天，已经排给了旧项目的交付测试。',
    mission:{deadline:'下一轮两周排期确定前',objective:'在旧项目和 GPU 训练验证之间分配机器与人手，写清停止、续做或并行的边界。',deliverable:'两份限时实验清单，或一份已通知相关人的停做与转向安排。'},
    prep:[['和林晓写出 AlexNet 复现条件','列出数据、显存、代码和训练片段，先查新结果能否在你的设备上验证。'],[`和${person}给旧承诺逐项定范围`,'区分必须交付、可以退款和可以延期的工作，先照顾已经答应的人。'],['带着旧项目方案再找一位买家','支付差旅，询问具体采购需求，判断旧方向是否还能养活团队。']],
    choices:[['停一半旧工作，给林晓连续机时',`由${person}通知合作方新的边界，补齐必要成本，再把人和机器给训练验证。`],['保留旧方向再跑一个周期','争取一份付费合同，明确告诉林晓新验证要等；仍可能拿不到订单。'],['两边各跑一个有截止线的小实验',`让${person}管旧版、林晓管验证，轮流用机，两周后按同一份数据表决定。`]],resultLead:`本轮排期结束，${person}和林晓分别交回旧项目与训练验证的记录。`,sourceIds:[...common.sourceIds,'alexnet','ntu'],
  };
  if(s.step===10) return {...common,date:'2016 年 · 第一批系统分配前',
    people:company?[real('Ian Buck','计算平台负责人'),real('Ilya Sutskever','OpenAI 研究者，开放研究的时代参照'),junior]:[...common.people,junior,real('Ilya Sutskever','OpenAI 研究者，时代参照')],
    title:historical?'DGX-1 装箱前，先决定谁来用':'只有一批机时，先给谁使用',
    story:`${historical?'DGX-1 已经准备装箱。现实中，NVIDIA 在 2016 年把首台系统送往 OpenAI。在这条人生里，首批设备怎么分还没有定。':`新闻里，NVIDIA 把首台 DGX-1 交给了 OpenAI。你手里排的是${product}的使用和支持。`}\n${company?'Ian Buck':person}已经算过成本。林晓想让首批试用者跑同一段训练，把安装情况和日志一并交回来。研究伙伴愿意公开复现方法，付费客户却要求优先使用，还加了独家条款。两边都申请了同一批资源，协议还没法签。`,
    prepTitle:'装箱或排机时之前，写清三条规则',prepStory:'两批试用申请挤在同一周，哪天安装、哪天交训练日志还没写到同一份排期里。林晓收到了几封邮件，都在问出了故障找谁。申请表的维护栏只写着“团队”。',
    mission:{deadline:'第一批系统发出或机时开放前',objective:'确定首批使用者、验收步骤和维护责任，选择开放合作、独家合同或培养接手者。',deliverable:'带负责人的使用排期、安装说明和一次可核验的反馈约定。'},
    prep:[[`和${company?'Ian Buck':person}写一份公开安装说明`,'让试用者逐步走完安装和验证，把后续维护时间也算进去。'],['把付费客户的验收日期写进合同','先确认付款、交付范围与验收负责人，降低第一批资源的成本压力。'],['请林晓演示卡住的那一步','一起解决安装或排期问题，再判断哪些事可以让林晓独立负责。']],
    choices:[[base.choices[0].title,`给研究合作保留一部分${historical?'DGX-1 系统':'可用机时'}，约定分享测试日志，由${team}承担初期支持。`],['优先签独家客户，按约交付','用明确的付款与验收覆盖成本，同时告诉其他研究者哪些资料暂不能公开。'],['把首轮试用交给林晓组织','请林晓列名单、排先后、回收日志；你保留必要支持，让下一位负责人真正练一次。']],resultLead:`首轮使用结束，林晓把安装记录与对外承诺整理进同一本交接册。`,sourceIds:[...common.sourceIds,'dgx','timeline'],
  };
  return {...common,date:'2024 年 · 安排下一年之前',
    people:[...(company?[chris]:[other.ally]),junior,lori],
    title:'61 岁，把下一年的日历交给谁',
    story:`你今年 61 岁。${s.route==='company'?'AI 计算系统的需求又涨了，采购的人拿来更长的订货表，每一项还在等你的签字。':s.route==='employee'?'主管要设一个新技术组，来问你愿不愿意带队。现在这个组已经有人能接下手上的项目。':s.route==='studio'?'上门的订单多了，搭档来问要不要再租一层楼。他把报价搁在你们当年自己装的那张桌上。':s.route==='sold'?'委托方发来新项目的报价，问你愿不愿意再做几年顾问。现有项目的联系人也还在等交接。':'算力需求上来以后，实验室想扩建。你从前带过的学生已经开始带人，这次想知道你还要不要亲自主持。'}\n${person}拿着明年的预算来找你，林晓也带来了交接清单。Lori 的晚饭约定也在日历上。几个项目偏偏把签字排在同几天，签字人还只写了你。林晓把清单翻到最后一页，问你从哪天起她能自己签。`,
    prepTitle:'翻到下一年，先写下不再拖延的事',prepStory:company?'Chris 的预算附件里，晶圆、封装和 HBM 的到货日期还没完全对齐，预付款却已有截止日。验证表上未通过的项目占着值守人手，林晓的交接排期也压在同一周；你留作休息和约 Lori 吃饭的几天，也碰上了这一周。':`${person}带来的预算已经列出设备和维护开支，林晓手里的交接清单仍有几项只写着你的名字。你原本留给休息和约 Lori 吃饭的几天，碰上了明年的项目排期。清单上还没人接这些工作。`,
    mission:{deadline:'下一年计划签字前',objective:'确定扩张、交接或收回个人时间的安排，把责任和生活约定落到具体日期。',deliverable:'一份由负责人签字的年度计划，或一张分阶段交接与固定晚饭的日历。'},
    prep:[['把三项不再继续的承诺写清','通知相关人何时结束、谁接余下的工作，把回收的时间写进新日历。'],['给 Lori 和自己留完整一天','先从不接工作电话的一天开始，接受计划今天不会继续推进。'],[`和${person}逐项复核预算与人手`,'查完下一轮的设备、维护与负责人，判断还有多少空间再接项目。']],
    choices:[['签下下一轮项目，继续带队',`为${base.choices[0].description.includes('顾问')?'新顾问合同':product}投入资源，和${person}分担旧承诺，亲自承担扩张成败。`],[base.choices[1].title,`${base.choices[1].description} 把林晓负责的排期、答疑与签字权限逐项写进交接清单。`],['把和 Lori 的晚饭定成不改期的约','减掉一部分工作，逐项交代剩余承诺，把每周两晚从可用排期中划掉。']],
    resultLead:'下一年的第一版日历上，终于出现了你亲手确定的名字和时间。',
  };
}

export function groundScene(base,state) {
  const brief=early[state.step]??laterBrief(state,base);
  const {prep,choices,outcomes,outcomeLabels,resultLead,factText,sourceIds,...details}=brief;
  const rewrite=(options,copy,decision=false)=>options.map((option,i)=>({
    ...option,title:copy[i][0],description:copy[i][1],
    ...(decision?{outcomes:option.outcomes.map((outcome,j)=>({...outcome,
      label:outcomeLabels?.[i]?.[j]??outcome.label,
      text:outcomes?.[i]?.[j]??`${resultLead} ${outcome.text}`,
    }))}:{}),
  }));
  return {...base,...details,
    prep:rewrite(base.prep,prep),choices:rewrite(base.choices,choices,true),
    fact:{text:factText??`${base.fact.text} 本幕具体日期、人物会面、项目任务与验收期限均为创作；历史人物按公开身份出现，陈立文、马丁·科尔和林晓为虚构角色。`,sourceIds:[...new Set([...base.fact.sourceIds,...sourceIds])]},
  };
}
