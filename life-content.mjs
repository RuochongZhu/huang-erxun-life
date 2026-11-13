// Deterministic life choices for Huang Erxun's parallel life.
// This module owns prose and small serializable fields only. It never imports the engine.
import { enrichRelationshipScene, enrichRelationshipPortrait, createFutureRelationshipScene, RELATIONSHIP_SOURCES } from './story-relationships.mjs';
import { isExpandedStory } from './story-timeline.mjs';
import { enrichDilemmaScene } from './story-dilemmas.mjs';
import { enrichContinuityScene } from './story-continuity.mjs';
import { enrichAffairScene } from './story-affair.mjs';

export const LIFE_SOURCES = [
  ...RELATIONSHIP_SOURCES,
  { id:'life-obi', title:'Oneida 校刊：兄弟寄宿与当地小学', url:'https://www.oneidaschool.org/copy094915_2018_JulAug_Mountaineer.pdf', note:'用于少年寄宿背景；家书内容、日程和对话为创作。' },
  { id:'life-obi-address', title:'Oneida Baptist Institute：公开校址', url:'https://www.oneidaschool.org/editoruploads/files/Contact%20Us/ContactUs.pdf', note:'现公布校区定位地址，不用于推断1973年的宿舍房间或校规。' },
  { id:'life-aloha', title:'Aloha High School：校址', url:'https://aloha.beaverton.k12.or.us/', note:'公开学校地址；未核实的少年打工门店不写门牌。' },
  { id:'life-dennys', title:'NVIDIA：Denny’s 打工与创业饭桌', url:'https://blogs.nvidia.com/blog/nvidia-dennys-trillion/', note:'15岁时在波特兰地区工作，以及后来三位创始人的讨论背景。' },
  { id:'life-dennys-address', title:'Denny’s：Berryessa Road 门店', url:'https://locations.dennys.com/ca/san-jose/249526', note:'公共会面地点；不是主角、伴侣或父母的住址。' },
  { id:'life-osu-pair', title:'OSU：工程实验搭档与两人的毕业年份', url:'https://news.oregonstate.edu/news/nvidia-ceo-spouse-give-25-million-kelley-engineering-center', note:'黄仁勋1984年、Lori1985年取得电气工程学士；两人在工程课上结为实验搭档。' },
  { id:'life-osu-marriage', title:'OSU：2013年工程名人堂', url:'https://engineering.oregonstate.edu/alumni-partners/oregon-stater-awards/searchable-awards-database/jen-hsun-huang-engineering-hall', note:'原型的求学和婚姻背景；游戏不声称复原真实婚礼或私人谈话。' },
  { id:'life-dearborn', title:'OSU 档案馆：Dearborn Hall', url:'https://guides.library.oregonstate.edu/buildings/dearborn-hall', note:'真实教学楼与地址；场景中的邀约为创作。' },
  { id:'life-stanford-family', title:'Stanford Engineering：在职硕士、两个孩子与乒乓球', url:'https://engineering.stanford.edu/news/jen-hsun-huang-nvidia-co-founder-invests-next-generation-stanford-engineers', note:'本人回忆全职工作、兼职求学与育儿；Spencer先出生，一年多后Madison出生，减少课程后历时八年于1992年完成硕士；也谈到成年后恢复运动。' },
  { id:'life-stanford-address', title:'Stanford：主校址2019年更名', url:'https://news.stanford.edu/stories/2019/09/naming-jane-stanford-way-moves-ahead', note:'2019年前使用450 Serra Mall，之后使用450 Jane Stanford Way；均作校区定位。' },
  { id:'life-1993-family', title:'Stanford GSB：创业时的家庭与选择', url:'https://www.gsb.stanford.edu/insights/jensen-huang-how-use-first-principles-thinking-drive-decisions', note:'本人回忆1992—1993年创业筹备时已有两个孩子；本局预算谈判为创作。' },
  { id:'life-sega', title:'NVIDIA：黄仁勋2023年台大演讲摘录', url:'https://blogs.nvidia.com/blog/huang-ntu-commencement/', note:'本人回顾早期产品路线、世嘉合作与求援；不用于推断家人的私人反应。' },
  { id:'life-nvidia-timeline', title:'NVIDIA：官方公司时间线', url:'https://www.nvidia.com/en-us/about-nvidia/corporate-timeline/', note:'CUDA等公开产品节点仅作为时代背景。' },
  { id:'life-tiros', title:'计算机历史博物馆：1996年产业资料', url:'https://archive.computerhistory.org/resources/access/text/2013/04/102723332-05-01-acc.pdf', note:'用于1226 Tiros Way这一同期公开公司地址。' },
  { id:'life-monroe', title:'SEC：NVIDIA 1999年申报地址', url:'https://www.sec.gov/Archives/edgar/data/1045810/000101287099004592/0001012870-99-004592-index.html', note:'用于3535 Monroe Street这一同期公开公司地址。' },
  { id:'life-san-tomas-2007', title:'SEC：NVIDIA 2007年股东文件', url:'https://www.sec.gov/Archives/edgar/data/1045810/000119312507106999/ddef14a.htm', note:'用于2701 San Tomas Expressway这一年代的总部地址。' },
  { id:'life-san-tomas-2012', title:'SEC：NVIDIA 2012年公司文件', url:'https://www.sec.gov/Archives/edgar/data/1045810/000104581012000029/s-8exhibit51.htm', note:'用于2012年的公开总部地址。' },
  { id:'life-san-tomas-2016', title:'NVIDIA：2016年企业责任报告', url:'https://images.nvidia.com/content/crr/2016/sustainability-report/pdf/2016_NVIDIA_Sustainability_Report_FINAL-1.pdf', note:'用于2016年的公开总部地址。' },
  { id:'life-current-address', title:'NVIDIA：公开总部地址', url:'https://www.nvidia.com/en-us/contact/', note:'2788 San Tomas Expressway仅作公开地点定位，绝不作为家庭住址。' },
  { id:'life-spencer', title:'Taipei Times：Spencer Huang与餐饮创业', url:'https://www.taipeitimes.com/News/feat/archives/2015/09/26/2003628605', note:'2015年公开采访，作为成年子女拥有各自事业的时代参照。' },
  { id:'life-madison', title:'Le Cordon Bleu：Madison Huang毕业生访谈', url:'https://www.cordonbleu.edu/london/madison-huang-wine-diploma-graduate/en', note:'Madison于2015年完成葡萄酒、美食与管理文凭；本局不替真人儿女安排职业。' },
];

export function createLifeState({ legacy = false, recordedFromStep = 0 } = {}) {
  return {
    partner:'none', formerPartner:'none', relationship:'single',
    children:'undecided', childCount:0, childStartYear:0,
    hobby:'none', hobbyPractice:'dormant', familyPractice:'unformed',
    workBoundary:'porous', carePlan:'undecided', familyPact:'undecided',
    partnerCareer:'undecided', parenting:'undecided', socialPractice:'close_circle',
    studyPace:'steady', nextChapter:'undecided',
    historyKnown:!legacy, recordedFromStep,
  };
}

const YEARS = [1973,1978,1984,1992,1993,1996,1997,1999,2007,2012,2016,2024];
const CHAPTERS = ['与家里保持联系','把课外时间给什么','和谁开始一段关系','一家人的形状','风险由谁一起承担','忙乱中怎样照顾人','找回一项没用的爱好','为另一种人生腾地方','关心到哪里停下','照护由谁承担','让后来的人自己决定','接下来怎样过日子'];
const real = (name, role) => ({ name, role, kind:'历史人物' });
const fictional = (name, role) => ({ name, role, kind:'虚构角色' });
const jeff = () => real('Jeff','哥哥；本局书信与对话为创作');
const friend = () => fictional('陈立文（Leo Chen）','老朋友；有自己的工作与空闲');
const maya = role => fictional('陈麦雅（Maya Chen）', role || '成年平面设计师；1984年23岁');
const lori = role => real('Lori Mills', role || '电气工程同学；1985年毕业，有自己的职业计划');
const lifeOf = state => ({ ...createLifeState(), ...(state.life || {}) });
const knows = (state, ...fields) => lifeOf(state).historyKnown
  || (state.lifeJournal || []).some(entry => fields.some(field => Object.hasOwn(entry.set || {}, field)));
const paired = life => ['dating','married'].includes(life.relationship) && life.partner !== 'none';
const partnerName = life => life.partner === 'lori' ? 'Lori' : life.partner === 'maya' ? '麦雅' : '你亲近的人';
const partnerPerson = (life, role) => life.partner === 'lori' ? lori(role || '本局伴侣；工程专业出身，有独立的工作安排') : maya(role || '本局伴侣；平面设计师，有独立的项目安排');
const childPeople = life => life.children === 'parent'
  ? [fictional('黄景安（Jamie Huang）','本局选择育儿后出现的虚构儿子'), ...(life.childCount > 1 ? [fictional('黄雨禾（Robin Huang）','本局选择育儿后出现的虚构女儿')] : [])]
  : [];
const familyPeople = life => [...(paired(life) ? [partnerPerson(life)] : [friend()]), ...childPeople(life)];
const hobbyName = life => ({ table_tennis:'乒乓球', cooking:'做饭', walking:'散步', none:'一段不用产出成果的时间' }[life.hobby] || '自己的爱好');
const workName = state => ({ student:'课程', employee:'公司的项目', company:'公司的经营', studio:'工作室的订单', researcher:'研究与课程', sold:'交接后的顾问工作' }[state.route] || '手上的工作');
const T = (...items) => items.map(([dim,d,w]) => ({dim,d,...(w === undefined ? {} : {w})}));

function option(id, title, description, tradeoff, consequence, effects, set, traits) {
  return { id, title, description, tradeoff, consequence, effects, set, text:consequence, label:title, traits:traits || [] };
}

function location(state, step) {
  if (step === 0) return { place:'肯塔基州 Oneida · 寄宿部的写字桌', address:'11 Mulberry Street, Oneida, KY 40972', addressNote:'学校现公布的校区地址；宿舍、书桌和家书情节为创作。', sourceIds:['life-obi-address'] };
  if (step === 1) return { place:'俄勒冈州比弗顿 · Aloha 高中校门口', address:'18550 SW Kinnaman Rd, Beaverton, OR 97078', addressNote:'真实学校校址；不将未核实的打工门店写成真实门牌。', sourceIds:['life-aloha'] };
  if (step === 2) return { place:'科瓦利斯 · OSU Dearborn Hall 门外', address:'1891 SW Campus Way, Corvallis, OR 97331', addressNote:'真实教学楼地址；饭局与恋爱分支为创作。', sourceIds:['life-dearborn'] };
  if (step === 3 || state.route === 'researcher') return { place:'斯坦福大学 · 晚课后的公共长椅', address:YEARS[step] < 2019 ? '450 Serra Mall, Stanford, CA 94305' : '450 Jane Stanford Way, Stanford, CA 94305', addressNote:'主校区定位地址；这里不是任何人的住宅，具体会面为创作。', sourceIds:['life-stanford-address'] };
  if (step === 4 || state.route !== 'company') return { place:'圣何塞 · Denny’s 靠窗的桌子', address:'2484 Berryessa Rd, San Jose, CA 95133', addressNote:'真实公共餐馆地址；这次生活会面为平行剧情。', sourceIds:['life-dennys-address'] };
  if (step <= 6) return { place:'森尼韦尔 · 早期办公室门外', address:'1226 Tiros Way, Sunnyvale, CA 94086', addressNote:'同期公开公司地址；家庭谈话发生在电话里，不公开家庭住址。', sourceIds:['life-tiros'] };
  if (step === 7) return { place:'圣克拉拉 · 办公室外的台阶', address:'3535 Monroe Street, Santa Clara, CA 95051', addressNote:'1999年公开公司地址；谈话与人物行程为创作。', sourceIds:['life-monroe'] };
  if (step < 11) return { place:'圣克拉拉 · 下班前的公共会面', address:'2701 San Tomas Expressway, Santa Clara, CA 95050', addressNote:'对应年代的公开总部地址；生活情节不是公司或家属的私人记录。', sourceIds:[step === 8 ? 'life-san-tomas-2007' : step === 9 ? 'life-san-tomas-2012' : 'life-san-tomas-2016'] };
  return { place:'圣克拉拉 · 离开办公室之前', address:'2788 San Tomas Expressway, Santa Clara, CA 95051', addressNote:'公开总部地址；退休、交班与家庭安排均由本局选择。', sourceIds:['life-current-address'] };
}

function scene(state, step, data) {
  const located = location(state, step);
  const { sourceIds = [], factText, ...rest } = data;
  return {
    id:`life-${YEARS[step]}`, chapter:Math.floor(step / 2), lifeChapter:CHAPTERS[step], year:String(YEARS[step]), age:YEARS[step]-1963,
    date:`${YEARS[step]} 年 · 工作决定之前`, ...located, ...rest,
    fact:{ text:factText, sourceIds:[...new Set([...located.sourceIds,...sourceIds])] },
  };
}

function school(state) {
  return scene(state, 0, {
    date:'1973 年 · 到校后的第一个周末', people:[jeff(), fictional('黄二勋的父母','远在曼谷；本局通信内容与家庭生活为创作')],
    title:'信里要不要写“我想回家”',
    story:'到学校后的第一个周末，你坐在桌前给父母写信。英语课跟不上，吃饭也不习惯，可开头还是写了“这里很好”。你盯着这四个字，半天没往下写。\n哥哥 Jeff 过来问你要不要去吃饭。他也有些想家。离熄灯还有一点时间，你想把信写完，也想听听他这周过得怎么样。',
    mission:{deadline:'周日熄灯前',objective:'写完家书，或先陪哥哥吃饭。今晚想先做哪件事？',deliverable:'一封真实的信、一次兄弟晚饭，或一个固定联系日期。'},
    factText:'黄仁勋与哥哥曾寄宿 Oneida，白天在当地小学上课；本局以1973年、10岁的黄二勋开局，家书、对话和生活决定均为创作。', sourceIds:['life-obi'],
    echo:'一张信纸不会解决想家，但你今天采用的联系办法，会在以后忙起来时再次出现。',
    options:[
      option('life-1973-letter','把想家也写进去','给父母写这一周真正难过的事，请 Jeff 在信尾添一句自己的近况。','今晚少半小时练英文，还要花一张邮票。','信封里没有“我全都能行”。你和 Jeff 各留了一行，约好以后有难事也写，不只寄好消息。',{energy:-3,money:-1,bonds:5,stress:-2},{familyPractice:'letter'},T([5,1],[10,1])),
      option('life-1973-brother','先和哥哥一起吃顿晚饭','把信留到明天，问 Jeff 这一周怎么样。两人商量每周固定一起吃一顿。','父母要晚一点收到信；今晚也少一点独处。','Jeff 说起自己也没听懂的一句玩笑。你们把每周见面的日子写在纸背，开始用坐在同一张桌旁代替“有事再说”。',{energy:-4,bonds:7,stress:-3},{familyPractice:'shared_table'},T([10,1],[14,1])),
      option('life-1973-date','先报平安，把长信定在周日','写一张简短卡片，告诉父母下次写信的日子；今晚洗澡、睡觉。','这一次没有讲完心事；家人只能等到约好的日子。','卡片很短，但寄出日期是真的。你在床头画了一个小方格：周日写信。家人的联系和自己的休息，都有了边界。',{energy:7,stress:-5,bonds:-1},{familyPractice:'scheduled'},T([7,1],[13,1],[14,1])),
    ],
  });
}

function teenager(state) {
  const life = lifeOf(state);
  const echo = life.familyPractice === 'shared_table' ? '你和 Jeff 那顿固定的饭仍在日历里；加一项活动，就得先和他改时间。' : life.familyPractice === 'letter' ? '你还留着写信的习惯。现在你想给下一封信添一点“除了上学和工作，我还喜欢什么”。' : '你已经知道，约在某一天的事，比“有空再说”更可能发生。';
  return scene(state, 1, {
    date:'1978 年 · 放学后的一个周五', people:[jeff(), fictional('艾迪·布朗（Eddie Brown）','Denny’s同事，和你同龄'), fictional('苏珊·李（Susan Lee）','校内球友，愿意一起练习')],
    title:'球拍、围裙，还是再加一班',
    story:'十五岁，你在 Aloha 高中上学，放学后去 Denny’s 打工。周六苏珊等你练球，艾迪问你收班后要不要一起做饭。领班也在找人顶周六的班。\n“今晚我得把班表交上去。”你忙了一周，听见这话还是先算了一下，多上一班能拿多少钱。',
    mission:{deadline:'今晚交下周班表之前',objective:'决定周六去练球、和朋友做饭，还是加班。',deliverable:'一个每周约定、一顿一起做的饭，或一张多接一班的班表。'},
    factText:'黄仁勋少年时打乒乓球，15岁曾在波特兰地区 Denny’s 工作；球友、同事和本幕安排为创作。', sourceIds:['life-stanford-family','life-dennys'], echo,
    options:[
      option('life-1978-table-tennis','每周留一个下午打乒乓球','和苏珊约定固定练球；不把每次练习都变成比赛。','少接一班，还要留出买球和换胶皮的钱。','球拍被你放进书包最外层。每周那个下午不总打得好，但你开始拥有一项与工资和成绩都无关的爱好。',{money:-4,energy:-3,stress:-5},{hobby:'table_tennis',hobbyPractice:'weekly'},T([13,1],[14,1])),
      option('life-1978-cooking','收班后和艾迪做一顿饭','两人各带一点食材，轮流决定下一次做什么；偶尔也叫上 Jeff。','要花一点钱和一个晚上，作业得提早完成。','第一锅有点咸，艾迪照样添了半碗。你发现自己喜欢的不只是做饭，还有吃完后不急着散掉的桌子。',{money:-2,energy:-3,bonds:6,stress:-2},{hobby:'cooking',hobbyPractice:'occasional',socialPractice:'open_table'},T([10,1],[14,1])),
      option('life-1978-extra-shift','先把这个学期的余暇换成工资','接下一班，把钱收进读书信封；告诉朋友这学期暂不固定参加。','攒下现金，但球友和朋友不再每次等你。','工资单厚了一点。球拍留在柜里，朋友的聚会照常继续；你把“下学期再安排”写在信封背面，知道它还只是一个待办。',{money:7,energy:-6,stress:3},{hobby:'none',hobbyPractice:'dormant',workBoundary:'seasonal'},T([12,1],[14,-1])),
    ],
  });
}

function relationship(state) {
  const life = lifeOf(state);
  return scene(state, 2, {
    date:'1984 年 · 离开校园以前', people:[lori(),maya(),friend()],
    title:'毕业之后，想和谁继续见面',
    story:'你快从 OSU 毕业了，最近一直在找工作、收拾东西。Lori 还要再读一年。做完实验，她问你离校前要不要一起吃顿饭。你们认识很久了，这次你想和她聊点上课以外的事。\n朋友陈立文介绍你认识的麦雅，也约你周末见面。她二十三岁，做平面设计，接下来会留在俄勒冈。你还没想好工作会把自己带去哪儿，也没想好要不要开始一段关系。',
    mission:{deadline:'离校前的这个周末',objective:'回复邀约，想想要不要开始交往。',deliverable:'一份不替对方安排前途的约定，或一个清楚的单身决定。'},
    factText:'OSU记载黄仁勋1984年、Lori1985年取得电气工程学士，两人曾是实验搭档；本幕恋情与对话为黄二勋的平行剧情，成年设计师陈麦雅为虚构角色。', sourceIds:['life-osu-pair'],
    echo:life.hobby === 'none' ? '过去你常把空闲换成工作；这次如果开始一段关系，日历里需要出现真实的空格。' : `你已有${hobbyName(life)}这项爱好。关系开始后，它仍可以属于你，也可以成为你们偶尔一起做的事。`,
    options:[
      option('life-1984-lori','和 Lori 开始交往','在这条剧情里，两人同意交往。你尊重她1985年毕业的计划，一起约定异地期间怎样联系。','来往要花时间与交通费；她的学业不会自动为你让路。','你们约定下一次见面，也把“各自完成该完成的事”说清。她是你的恋人，仍然是有自己课程和职业选择的工程学生。',{money:-3,energy:-3,bonds:6},{partner:'lori',formerPartner:'none',relationship:'dating',partnerCareer:'parallel'},T([10,1],[14,1])),
      option('life-1984-maya','和陈麦雅开始交往','在这条剧情里，两个成年人同意交往。先试着经营跨城市的关系，不急着把生活并成一张日程表。','设计截稿和芯片项目不会同时放假，你们要轮流腾出时间。','麦雅把下一次项目截止日告诉你，你也留下搬家后的联系方式。关系开始于两份真实日程，而不是一句以后总有空。',{money:-3,energy:-3,bonds:6},{partner:'maya',formerPartner:'none',relationship:'dating',partnerCareer:'parallel'},T([5,1],[14,1])),
      option('life-1984-single','不开始恋情，认真经营单身生活','向两人说清心意，保留朋友关系；把搬家后的第一个周末留给自己和老朋友。','你有更多可支配时间，也得主动维持联系，孤单时没有默认的同行者。','你没有给任何人一个含糊的等待。陈立文记下你的新电话；日历上空出来的一格，暂时只写着“安顿自己”。',{energy:5,money:2,bonds:-2},{partner:'none',relationship:'single',socialPractice:'close_circle'},T([9,-1],[13,1])),
    ],
  });
}

function legacyHousehold(state) {
  return scene(state, 3, {
    date:'1992 年 · 给眼前的生活安排时间', people:[friend(),jeff()],
    title:'过去没有记下的部分，先留白',
    story:'陈立文约你下周见面，Jeff 想找你打一次长电话。你翻了翻课表，发现能空出来的晚上已经不多。\n旧存档没有记录感情和家庭情况。这次先安排眼前的工作、课程和休息。',
    mission:{deadline:'下一期课程排定前',objective:'在已知的工作之外确定一项生活安排，保留未知的家庭经历。',deliverable:'一个固定联系时段，或一次明确的课程调整。'},
    factText:'旧版存档未包含亲密关系与婚育记录；本幕从这次生活安排开始记载，不推断未记录的过去。',
    echo:'课程和项目已有记录，生活的其他部分可以从今天这一项具体安排继续。',
    options:[
      option('life-1992-legacy-schedule','按现有课表继续，留一个联系时段','先把工作与课程的边界写清，固定与 Jeff 或朋友联系；不把每晚都视作可以追加工作。','空闲减少，需要主动协调，临时任务不能全部接下。','课表继续按原计划推进，生活也出现了一个固定时段。你记录的是这次安排，过去的亲密关系与婚育保持未记录。',{energy:-2,stress:-2,bonds:3},{studyPace:'steady',familyPractice:'scheduled',workBoundary:'protected'},T([7,1],[14,1])),
      option('life-1992-legacy-reduced','少上一门课，给生活留一晚','降低这一阶段的课程量；腾出的晚上由你留给需要联系的人和自己的休息。','学业进度放慢，原定完成时间需要重排。','少一门课之后，你终于保留了一段完整的晚上。没有家庭身份被凭空补上，只有学业节奏和这一晚的安排开始有了记录。',{energy:5,stress:-4},{studyPace:'reduced',workBoundary:'protected'},T([13,1],[14,1])),
      option('life-1992-legacy-pause','暂缓课程，先把日常安顿好','暂停一个阶段的课程，先清点答应过的工作与生活安排，再决定恢复时间。','毕业节点后移，也可能需要重新适应课程。','你把暂停日期写清，讲义仍然留着。先处理日常不等于替过去编一个原因，恢复学业留待后续职业选择。',{energy:7,stress:-5,reputation:-1},{studyPace:'paused',workBoundary:'seasonal'},T([3,1],[13,1])),
    ],
  });
}

function household(state) {
  const life = lifeOf(state);
  if (!knows(state, 'partner', 'relationship')) return legacyHousehold(state);
  const name = partnerName(life);
  const couple = paired(life);
  const beginning = couple
    ? `从 1984 年起，你和${name}就一直见面。谈起结婚时，话头绕到了孩子和工作上。${life.partner === 'lori' ? 'Lori 在 1985 年完成了工程学位。她手上的工作有自己的安排，也想听听你以后准备怎么分担家里的事。' : '麦雅的设计业务有了稳定客户。她问你：“你上晚课的那几天，家里的事都我做吗？”'}`
    : '毕业后的几年，有时周末朋友能坐满一桌，有时你下班只给自己带一份晚饭。陈立文换了工作，大家原先吃饭的时间常常凑不齐。下一次有事，你想得出可以打给谁，只是还没约好平时怎么来往。';
  const options = couple ? [
    option('life-1992-marry-parent',`和${name}结婚，一起承担育儿`,'明确选择婚姻与孩子。在这条平行人生里，你们后来成为景安和雨禾的父母；你减少晚课，两人共同承担照护。','学业放慢、现金和睡眠减少；伴侣不默认辞职，照护必须共同安排。','婚姻和孩子进入了这条人生。奶瓶、两张小椅子和晚课讲义挤在一起；你减少课程，按轮班接手夜间照护，学位不再拥有压过一切的截止日期。',{money:-9,energy:-8,stress:5,bonds:5},{relationship:'married',children:'parent',childCount:2,childStartYear:1990,studyPace:'reduced',familyPractice:'scheduled',workBoundary:'shared',parenting:'guide'},T([10,1],[12,-1],[14,1])),
    option('life-1992-marry-childfree',`和${name}结婚，选择不育儿`,'把婚姻与生育分开讨论。共同确认不育儿，各自保有工作、朋友与爱好，也分担家务。','少了一种家庭经验；需要承受亲友的询问，并认真经营两个人的日常。','你们结婚，也把不育儿的决定说清。厨房里的两只杯子没有等待第三只；两份职业计划和每周的家务轮值都写进了同一本日历。',{money:-4,energy:-3,stress:-3,bonds:5},{relationship:'married',children:'childfree',childCount:0,childStartYear:0,studyPace:'steady',familyPractice:'shared_table',workBoundary:'shared'},T([7,1],[9,-1],[14,1])),
    option('life-1992-keep-dating','继续交往，暂不结婚和育儿','承认两人现在还没有准备好合并家庭，保留各自住处与计划，约定一年后重新谈。','双份生活开销仍在；悬而未决的部分不能一直靠忙碌拖延。','你们继续交往，没有婚礼，也没有孩子。那张写着“一年后再谈”的纸被留下；关系仍在，但下一次谈话不会由学位证书代替。',{energy:-2,bonds:3,stress:2},{relationship:'dating',children:'undecided',childCount:0,childStartYear:0,studyPace:'steady',partnerCareer:'parallel'},T([9,-1],[7,1])),
    option('life-1992-separate','承认步调不同，好好分开','结束恋爱关系，整理共同物品和账目；暂缓一段课程，给两人重新安顿的时间。','失去日常的亲近，学业也慢一段；分开并不会立刻轻松。','你们把各自的东西带走，没有拿工作忙当借口继续拖着。你暂停一段课程，重新学着一个人安排饭和周末。对方的生活继续，不再等待你的排期。',{energy:-3,stress:5,bonds:-5,money:-2},{formerPartner:life.partner,partner:'none',relationship:'separated',children:'undecided',childCount:0,childStartYear:0,studyPace:'paused',partnerCareer:'undecided'},T([3,1],[9,-1],[15,1])),
  ] : [
    option('life-1992-new-relationship','和陈麦雅开始一段成年关系','通过老朋友再次见面；这条剧情里，你们同意交往。先了解彼此生活，不把婚育作为交往的附赠条件。','关系需要稳定时间和交通费；课程之外又多了一份要兑现的约定。','麦雅有自己的设计工作，你有晚课和项目。你们从每两周一次见面开始；婚姻和孩子仍未决定。',{money:-3,energy:-3,bonds:6},{partner:'maya',relationship:'dating',children:'undecided',childCount:0,studyPace:'steady',partnerCareer:'parallel'},T([5,1],[14,1])),
    option('life-1992-single-childfree','选择单身与不育儿，建立自己的生活圈','把不想结婚育儿说清，固定参加朋友的晚饭，保留自己的住处和作息。','朋友会有各自优先的生活；需要主动约人，也要独自承担部分日常。','你把备用钥匙交给愿意互相照应的朋友，说明只在约定情形下使用。你的家庭没有配偶和孩子，也有能叫出名字的人。',{money:-2,energy:-2,bonds:4,stress:-3},{partner:'none',relationship:'single',children:'childfree',childCount:0,studyPace:'steady',socialPractice:'open_table',familyPractice:'help_network'},T([5,1],[9,-1],[14,1])),
    option('life-1992-open-future','暂不决定婚育，少上一门课','不替未来许诺。减少本学期课程，把腾出的晚上留给父母、朋友和自己。','学位会慢下来；下一段关系或家庭仍没有确定答案。','你没有得到一个现成的家庭答案，却终于在工作和晚课之间留了一晚。朋友见到你的次数变多，学业按减少后的课表继续。',{energy:6,stress:-4},{partner:'none',relationship:'single',children:'undecided',childCount:0,studyPace:'reduced',workBoundary:'protected'},T([13,1],[14,1],[9,-1])),
  ];
  return scene(state, 3, {
    date:'1985—1992 年 · 工作、晚课与新生活之间', people:couple ? [partnerPerson(life),...childPeople(life)] : [friend(),maya()],
    title:couple ? '结婚与孩子，要分开想清楚' : '没有现成的家庭，也要安排照应',
    story:`${beginning}\n下学期的选课表压着房租账单。你数了数，如果照原来那样选，能留在家里的晚上还剩几个。`,
    mission:{deadline:'为这段生活签下承诺以前',objective:'分别确定伴侣关系、是否育儿，以及愿意给课程和生活多少时间。',deliverable:'一份明确的家庭选择与课表节奏；学位是否完成留待职业选择。'},
    factText:'黄仁勋在职攻读Stanford硕士时已婚育有Spencer和Madison，曾因育儿减少课程、于1992年完成学位；本局的婚育选择、孩子景安与雨禾及家庭场景为虚构。', sourceIds:['life-stanford-family','life-osu-pair'],
    echo:life.familyPractice === 'letter' ? '小时候你靠一封信说明真实近况。如今要说明的，是自己到底能承担多少。' : '早年的联系习惯仍在，但共同生活需要把“我会帮忙”变成一个具体日期。', options,
  });
}

function riskPact(state) {
  const life = lifeOf(state);
  const name = partnerName(life);
  const companion = paired(life) ? name : '陈立文';
  const familyCost = !knows(state, 'children') ? '你手里只有眼下的日常账单，以前的家用没有记全。' : life.children === 'parent' ? '你翻到孩子的日常开支，每个月都得照付。' : life.children === 'childfree' ? '账上没有育儿开支，房租和探望父母的路费却都得留着。' : '这几个月房租还得照交，已经答应的开支也写在本子上。';
  return scene(state, 4, {
    date:'1993 年 · 创业饭桌之前', people:[...familyPeople(life),real('Chris Malachowsky','创业讨论伙伴'),real('Curtis Priem','创业讨论伙伴')],
    title:'先谈家里的钱，再谈改变世界',
    story:`你约${companion}喝咖啡，把收支摊在桌上。现在每月有固定进账，真换了工作，手里的钱能撑多久？${familyCost}\n${paired(life) ? `${name}也带了自己的计划，问你家用留多少、忙起来家里的事谁做。` : '陈立文帮你把房租从能动用的钱里扣出来。你往下算，连探望父母的次数可能都得减。'}`,
    mission:{deadline:'向合伙人或主管给出承诺以前',objective:'把生活储备、可投入金额和失约后的处理办法写清。',deliverable:'一份半年复查的家庭风险约定。'},
    factText:'黄仁勋回忆1992—1993年筹备创业时已有两个孩子；本局风险预算、伴侣谈判与各条职业路线为创作。', sourceIds:['life-1993-family','life-dennys'],
    echo:life.studyPace === 'reduced' ? '你已经为生活减少过课程。这一次也要承认，时间和钱有真实的上限。' : life.studyPace === 'paused' ? '上一段生活还在重新安顿，新的风险不能让旧账凭空消失。' : '课表曾经能写得很满，家庭预算却不能靠把字写小腾出空间。',
    options:[
      option('life-1993-guardrail','先留下六个月日常开支','把生活账户和试验预算分开，每三个月复查；超出上限要重新讨论。','能投进职业尝试的钱减少，可能错过一部分机会。','你在预算纸上画出两栏。那笔生活储备不参与下一轮豪言；职业路线仍能选，但不能默认拿所有人的日常作追加筹码。',{money:-5,stress:-5,energy:-1},{familyPact:'guardrail',workBoundary:'protected'},T([0,-1],[7,1],[9,-1])),
      option('life-1993-shared-risk','接受一年紧日子，约定复查日',`${paired(life) ? `和${name}共同` : '自己'}缩减消费，把更多可支配资源投入新尝试；写明一年后重新评估。`,'储备变薄，压力增加；即便愿意承担，家人也不会因此免于疲惫。','削减后的开支表贴到日历旁，旁边写着复查日期。你得到更大的试验余地，也答应届时可以改口，不要求亲近的人一直证明支持。',{money:5,energy:-3,stress:6},{familyPact:'shared_risk',workBoundary:'seasonal'},T([0,1],[7,1],[10,1])),
      option('life-1993-limited-stake','只投入自己能承担的那一部分','保留各自账户和工作安排；不把伴侣收入、父母储蓄或朋友担保计入计划。','启动资源较少，更多事情得由你自己慢慢做。','你删掉预算中写着“家里可以再想办法”的一行。能开始的规模变小，承担关系却清楚了：这次尝试不能自动征用别人的人生。',{money:-2,energy:-4,stress:1},{familyPact:'limited_stake',partnerCareer:'parallel'},T([0,-1],[9,-1],[8,-1])),
    ],
  });
}

function crisisCare(state) {
  const life = lifeOf(state);
  const name = partnerName(life);
  const children = life.children === 'parent';
  const task = children ? '孩子那场已经答应出席的小演出' : paired(life) ? `${name}早已约好的项目展示` : 'Jeff 早就约好的那次长电话';
  const scheduled = ['scheduled','shared_table','help_network'].includes(life.familyPractice);
  const workCrisis = {
    company: 'NV1 和世嘉的下一代图形方案都用四边形拼画面，其他厂商正转向微软支持的三角形路线。照旧做下去，就算赶得上世嘉的项目，也很难接上后来的 PC 游戏。明天要去见世嘉，Chris 还在算账上的钱够发几轮工资。Curtis 的测试已经失败，日志还没写到对方能重跑的程度。下一版能交哪些功能、要请世嘉先支持哪段开发，重谈方案里还没有写。',
    employee: '旋转物体的演示到了隔壁部门的测试机上就缺面，颜色也错了。接口转换代码还没人愿意维护。明天主管要决定下季度还给不给这个项目台位，眼下的三份失败日志连重跑步骤都没写全。哪几项功能能先交、还得占用测试台多久，方案里也没写。',
    studio: '最大的客户把目标显卡换成了另一家芯片，原定移植工具里的纹理上传和显示驱动都得重新适配。明天要和客户的制作人重谈验收范围和追加报价：哪些功能已经完成，哪些测试得在新硬件上重做。你和陈立文还没核完工时，两套接口同时维护要多花的钱，也没算进报价。',
    researcher: '图形实验只在你们自己的机器上跑通。同一段测试场景到了联合实验室，画面缺面，帧率也低于报告里的记录；对方不肯采用这个版本。明天是续约评审，两边的软硬件差异、失败步骤和下一轮最小验证还散在几封邮件里。需要申请哪些设备时段、现有经费能覆盖哪些实验，预算表也没填完。',
    sold: '演示装到接手方的机器上，启动后一直黑屏，日志停在显示驱动的调用处。产品移交卡在最后一轮验收。明天要核对交接范围：哪些故障由你补修，哪些作为已知限制交过去，顾问合同结束后谁负责维护。测试日志已经到了，能让双方逐项确认的故障与责任清单还没整理好。',
  }[state.route] || '图形原型换到另一台机器就运行失败，明天指导老师要检查它能否进入下一轮演示。出错时的输入、两台机器的配置差异和可复现的测试步骤，还散在几张草稿上。';
  return scene(state, 5, {
    date:'1996 年 · 危机谈判前的一晚', people:[...familyPeople(life),jeff()],
    title:'坏消息来了，谁的约定先被划掉',
    story:`${workCrisis}\n今晚你还答应了${task}。日志摊在桌上，电话一直没拨出去。${children ? `孩子已经问了好几次你会不会来。${paired(life) ? name : '照护搭档'}今晚也有安排，要换人得趁早说。` : paired(life) ? `${name}又问了一遍：“你到底几点到？”` : 'Jeff 特意把这一晚空出来，还在等你打过去。'}`,
    mission:{deadline:'今晚约定开始之前',objective:'找人接手工作，或打电话把今晚的安排改好。',deliverable:'一位知道情况的接班者，或一条说清补偿日期的消息。'},
    factText:'1996年前后是NVIDIA早期产品与合作的艰难阶段；本幕家人行程、照护任务和对话为平行剧情，未据此描述真实家属的私生活。', sourceIds:['life-sega'],
    echo:scheduled ? '以前写下的固定时段，让你比较容易找出冲突；兑现它仍需要有人接班。' : life.familyPractice === 'letter' ? '你会把困难写进信里。今晚需要再多一步：在别人等你之前把消息送到。' : '没有固定联系办法时，忙碌总会先占满空白。今晚要现找一个可执行的安排。',
    options:[
      option('life-1996-show-up',children ? '把材料交接出去，去看孩子的演出' : paired(life) ? `请人接一晚，去支持${name}` : '把材料交接出去，按约打给 Jeff','提前交代哪些问题可以决定、哪些等你回来；承担少做一轮准备的代价。','材料不再全按你的方式收尾，职业准备少一段完整时间。',`${children ? '你坐进观众席，手机留在口袋里。孩子的节目很短，却没有被写成下一次。' : paired(life) ? `你赶到${name}的展示现场，听她完整讲完自己的工作。` : '电话接通后，你先问 Jeff 的近况，暂时不讲自己的危机。'}工作仍有缺口，但这一次约定发生了。`,{energy:scheduled ? -3 : -5,stress:2,bonds:6,control:-2},{workBoundary:'protected',familyPractice:'scheduled'},T([8,-1],[10,1],[14,1])),
      option('life-1996-share-care','找一位愿意接手的人，把安排做实',children ? '请愿意帮忙的照护伙伴接送孩子，承担交通与照护费用；之后亲自补上固定陪伴。' : '请共同朋友协助现场或联络，说明你的缺席；付出组织时间，并约定自己下一次到场。','需要花钱和人情；对方愿意帮这次，不等于今后默认接班。','接手的人收到清楚的时间和联系人。你留在工作现场，但没有把照护凭空丢给最近的人；账本上增加费用，日历上增加一项由你兑现的回请。',{money:-5,energy:-2,stress:-1,bonds:2},{carePlan:'shared',familyPractice:'help_network',workBoundary:'shared'},T([5,1],[7,1],[9,-1])),
      option('life-1996-reschedule','亲自解释缺席，给出一个补约日','在约定前打电话说明，承认这次做不到；把补约写入日历，今晚完成谈判材料。','当下的失落不会被未来日期抵消；你还欠一段需要真空出来的时间。','你把“忙完再说”换成了具体日期。对方没有立刻高兴起来。材料多完成了一页，而这次未到场和后来的补约，都留在生活记录里。',{energy:-5,stress:4,bonds:-3,engineering:2},{workBoundary:'seasonal',familyPractice:'scheduled'},T([9,-1],[12,1],[14,-1])),
    ],
  });
}

function hobby(state) {
  const life = lifeOf(state);
  const practiced = life.hobbyPractice === 'weekly';
  const hasHobby = life.hobby !== 'none';
  const name = hobbyName(life);
  return scene(state, 6, {
    date:'1997 年 · 一个没有排满的周末', people:[friend(),...(paired(life) ? [partnerPerson(life)] : [])],
    title:hasHobby ? `那件${life.hobby === 'table_tennis' ? '旧球拍' : life.hobby === 'cooking' ? '旧围裙' : '旧外套'}，还用不用` : '空出一个下午以后，做什么',
    story:`最近终于没那么忙了。收拾柜子时，你找到${life.hobby === 'table_tennis' ? '以前的球拍套，边角已经开线' : life.hobby === 'cooking' ? '记着艾迪那道菜的纸，半行调料被油渍盖住了' : '一张旧的周末活动单'}。${practiced ? `这些年你还在做${name}，只是经常做到一半就被工作电话叫走。` : '你已经很久没空出一个完整的下午。'}\n陈立文打来电话：“周末出来吧，这次不聊工作。”你翻开下个月的日历，看看哪一天还空着。`,
    mission:{deadline:'下个月的周末被工作填满之前',objective:'留几个周末给爱好，或等工作忙完再说。',deliverable:'四次固定活动、一顿开放的饭，或一个暂时搁置的决定。'},
    factText:'黄仁勋在公开Stanford访谈中谈过少年打球与成年后恢复运动的经历；本局具体爱好、球友和周末活动为创作。', sourceIds:['life-stanford-family'],
    echo:!knows(state, 'hobby', 'hobbyPractice') ? '过去的休闲经历没有记录；这次只从眼前的周末安排开始。' : practiced ? '早年留下的习惯让重新开始省力一些；它仍需要一个不会随便取消的时段。' : hasHobby ? `你曾经选择过${name}。那件旧物还在，习惯却得重新练。` : '少年时你把余暇换成收入。现在可以重新选择，不必证明当年选错了。',
    options:[
      option('life-1997-weekly',hasHobby ? `把${name}恢复成每周一次` : '从每周散步一小时开始',hasHobby ? `先排四次${name}，不设成绩目标；让相关的人知道这段时间不接临时会。` : '约一个走得完的路线，不买装备，不把步数变成新的绩效。','需要留出稳定时间；有些工作机会和聚会会因此错开。',hasHobby ? `${name}重新占据每周的一个格子。你没有因此更高效，只是开始有一件事可以做得普通，也愿意继续。` : '你走完第一条路线，没顺手开任何会。一小时不长，但下周同一天仍留着。',{money:practiced ? -1 : -3,energy:5,stress:-6},{hobby:hasHobby ? life.hobby : 'walking',hobbyPractice:'weekly',workBoundary:'protected'},T([13,1],[14,1])),
      option('life-1997-table','每月做一顿不聊工作的饭','轮流下厨，朋友可以带一道菜来；不把主办变成全部由你服务。','采购、做饭和收拾要花钱与体力；自己安静休息的时间变少。','第一顿饭的菜没全做好，大家照样坐了很久。你把下一次的主菜交给朋友，留下一项共同的爱好，而不是一份新的接待工作。',{money:-4,energy:-3,bonds:6,stress:-3},{hobby:'cooking',hobbyPractice:'occasional',socialPractice:'open_table'},T([5,1],[10,1],[14,1])),
      option('life-1997-pause','这半年先搁下，明确一个重看日期','保留这段时间处理积压工作；把爱好暂时搁置说清，不再不停爽约。','眼前工作多一点余地，但恢复和朋友联系会变少。','你把活动单收回柜子，没有要求球友继续为你空台。半年后的提醒留下了；是否重拾仍待下一次真正的选择。',{money:3,energy:-4,stress:3},{hobbyPractice:'dormant',workBoundary:'seasonal'},T([9,-1],[12,1],[14,-1])),
    ],
  });
}

function legacyFriendship(state) {
  return scene(state, 7, {
    date:'1999 年 · 重新安排联系', people:[friend(),jeff()],
    title:'工作之外，还要留谁的时间',
    story:'陈立文搬去了别的城市，Jeff 周末也常有安排。以前临时打个电话就能凑一顿饭，现在各自翻过一遍日历，才找得到同一天。\n早些年的家事没有记在旧手记里。陈立文倒是问了句很实在的：“要不这次就约好下次几号？”',
    mission:{deadline:'下一季日程确定前',objective:'为朋友与手足安排一项能兑现的联系。',deliverable:'一张联系日历，或一个范围明确的互助约定。'},
    factText:'旧版未记录亲密关系和婚育经历；本幕只记录当前的朋友与手足联系，不补造配偶、孩子或单身历史。',
    echo:'没有记录的生活领域仍然留白，这次见面却可以留下一个明确安排。',
    options:[
      option('life-1999-legacy-circle','每月轮流约一次饭','由不同的人轮流约时间和地点，尊重各自已有的生活安排。','需要组织与交通费用，自己的日程也少一点随意。','下一次见面有了日期，也有了负责联络的人。大家并未承诺随叫随到，只把能够持续的联系写清。',{money:-3,energy:-3,bonds:5},{socialPractice:'open_table',familyPractice:'scheduled'},T([5,1],[10,1])),
      option('life-1999-legacy-network','问清彼此可以帮到哪里','交换一项愿意承担的实际帮助，也说清各自无法承担的部分。','需要付出时间和回请，不能只在自己有需要时出现。','你们各自说了一件可以帮的事，也保留了拒绝临时请求的权利。互助有了名字，过去的家庭情况仍不作推断。',{energy:-4,bonds:4},{socialPractice:'open_table',familyPractice:'help_network'},T([5,1],[9,-1],[10,1])),
      option('life-1999-legacy-small','少约几次，但把约好的时间守住','说明这一阶段只能维持少量联系，选择一个能兑现的固定日期。','错过一部分聚会与新关系，也不能期待别人一直空出时间。','你没有留下“随时都可以”的承诺。联系变少，但下一次什么时候见，双方都知道。',{energy:3,stress:-3,bonds:-1},{socialPractice:'close_circle',familyPractice:'scheduled',workBoundary:'protected'},T([9,-1],[13,1])),
    ],
  });
}

function partnerCareer(state) {
  const life = lifeOf(state);
  const name = partnerName(life);
  if (!knows(state, 'partner', 'relationship')) return legacyFriendship(state);
  if (!paired(life)) return scene(state, 7, {
    date:'1999 年 · 朋友们的日程开始不同', people:[friend(),maya(),jeff()],
    title:'没有默认同行的人，怎样不散掉',
    story:`陈立文搬了家，Jeff 的周末也排得很满。你最近几次想约人吃饭，都没凑上时间。\n${life.formerPartner === 'maya' ? '麦雅来圣何塞办事，带来了新的设计作品。你们聊起分开后的生活，气氛比想象中轻松。' : '麦雅来圣何塞办事，你们约着吃了顿饭，聊到餐厅快关门。'}她问你下周还想不想见面。`,
    mission:{deadline:'下一季的日程确定之前',objective:'选择关系或友谊的具体经营方式，不把陪伴当成随时可用的资源。',deliverable:'一次关系承诺、一张朋友轮流相约的日历，或明确的独处安排。'},
    factText:'本幕朋友往来与成年虚构人物陈麦雅的关系为平行剧情；地址仅采用公开地点定位，不代表真实家属经历。',
    echo:life.socialPractice === 'open_table' ? '以前留下的饭桌让你还有人可以约；每个人仍有权说这周不行。' : life.relationship === 'separated' ? '分开之后的生活已经重新开始；新的关系不负责证明上一段有没有价值。' : '你可以继续单身，但亲近的人不会只因为时间过去就自然留下。',
    options:[
      option('life-1999-friend-circle','固定约朋友，也轮流照应彼此','每月一次轮流约饭，交换紧急联系人；问清每个人愿意帮到哪里。','需要主动组织与回请，自己的时间不再完全随意。','朋友们各写下能帮的一件事，也各写下不能帮的部分。没有配偶自动到场，但你有了一圈彼此知道边界的人。',{money:-3,energy:-3,bonds:6},{socialPractice:'open_table',familyPractice:'help_network'},T([5,1],[10,1],[9,-1])),
      option('life-1999-new-love',life.formerPartner === 'maya' ? '和陈麦雅重新交往，不跳过过去' : '和陈麦雅开始交往，保留各自生活',life.formerPartner === 'maya' ? '谈清上次分开的原因与这次各自愿意承担的事，双方同意重新交往；不把复合当成自动结婚。' : '两人明确同意交往，安排稳定见面；当前不结婚，也不自动进入育儿。','要从工作和独处中拿出时间，生活计划需要与另一人协商。',life.formerPartner === 'maya' ? '你们承认上一次没能继续的部分，也交换了下一季的真实日程。两人重新交往，不把分开的经历抹掉；住处与职业仍各自独立，婚姻与孩子没有自动补上。' : '你们交换了下一季真实的日程。关系开始了，住处和职业仍各自独立；婚姻与孩子留待两人真正谈过再决定。',{money:-3,energy:-4,bonds:6},{partner:'maya',relationship:'dating',partnerCareer:'parallel',children:life.children,workBoundary:'shared'},T([10,1],[14,1])),
      option('life-1999-solitude','保留独处，只维持几个深联系','不开始恋情，也不扩大社交；固定给 Jeff 和两位老朋友留联系时间。','日常安静自由，遇到忙乱时可找的人也较少。','你把通讯录缩到真正愿意联系的人，先发出两条明确邀约。独处不是失联，只是这条生活里没有一个默认一直在场的人。',{energy:5,stress:-4,bonds:-2},{socialPractice:'close_circle',familyPractice:'scheduled',workBoundary:'protected'},T([9,-1],[13,1])),
    ],
  });
  if (life.relationship === 'dating' && life.children === 'undecided') return scene(state, 7, {
    date:'1999 年 · 重新谈承诺的那个周末', people:[partnerPerson(life)],
    title:'“以后再谈”，终于到了以后',
    story:`你和${name}交往这些年，提过几次结婚和孩子，每次都说忙完再谈。${life.partner === 'lori' ? '她最近也在调整自己的工作安排。' : '麦雅的设计业务已经有了稳定客户。'}\n今晚她把时间留出来了，问你：“上次说忙完再谈。你现在怎么想？”`,
    mission:{deadline:'下个季度安排开始之前',objective:'重新确认关系、育儿意愿和双方职业的时间份额。',deliverable:'一项明确决定，以及不默认由一方承担全部照护的安排。'},
    factText:'黄仁勋与Lori的婚姻仅作为时代背景；本幕延后的婚育、关系谈话与虚构孩子景安为玩家分支。', sourceIds:['life-osu-marriage'],
    echo:'暂缓并不等于拒绝，也不等于默认同意。今天要把那张旧便签重新读一遍。',
    options:[
      option('life-1999-late-family',`和${name}结婚，开始育儿生活`,'在这条人生里，你们选择婚姻与一个孩子景安；轮流调整工作，安排照护预算。','现金、睡眠和职业时间减少，双方的计划都需要重排。','你们结婚，景安进入这条平行人生。新的家庭日程里有两人的工作，也有轮流接手照护的名字；孩子不会自动由一人负责。',{money:-8,energy:-7,stress:4,bonds:5},{relationship:'married',children:'parent',childCount:1,childStartYear:1999,partnerCareer:'alternating',familyPractice:'scheduled',workBoundary:'shared',parenting:'guide'},T([10,1],[14,1])),
      option('life-1999-late-childfree',`和${name}结婚，确认不育儿`,'把共同生活定下来，保留两份事业与各自的爱好；清楚说明不育儿。','亲友可能不理解，日常关系仍要靠两人主动经营。','婚姻进入了生活，孩子没有。你们把下一次共同假期和各自忙季都写清，不用“以后也许”去应付已经想清楚的问题。',{money:-4,energy:-2,bonds:5,stress:-2},{relationship:'married',children:'childfree',childCount:0,partnerCareer:'parallel',workBoundary:'shared'},T([9,-1],[14,1])),
      option('life-1999-partners','保持伴侣关系，不结婚也不育儿','双方确认愿意继续交往，也确认不以婚礼或生育证明关系；约定照应与共同开支。','某些正式安排需要另行处理，外界也未必理解。','你们继续作为伴侣生活，没有婚礼和孩子。两人的名字却清楚写在共同开支与照应清单上，这段关系有自己的形式。',{energy:-2,bonds:4},{relationship:'dating',children:'childfree',childCount:0,partnerCareer:'parallel',familyPractice:'help_network'},T([7,1],[9,-1])),
      option('life-1999-part','结束关系，把共同事项收尾','承认双方想要的未来不同；结束恋情，归还物品与共同款项。','分别会难过，也会带来搬动与重新安顿的成本。','你们结束了这段关系，没有把对方留在一个等不来的未来里。联系方式没有变成后备承诺，生活开始分开书写。',{money:-3,energy:-3,bonds:-5,stress:4},{formerPartner:life.partner,partner:'none',relationship:'separated',partnerCareer:'undecided',workBoundary:'protected'},T([3,1],[9,-1],[15,1])),
    ],
  });
  const supportTask = life.children === 'parent' ? '这六周的接送、晚饭和家务' : '这六周的家务、共同账目和探望安排';
  return scene(state, 7, {
    date:'1999 年 · 伴侣收到一份新机会', people:[partnerPerson(life),...childPeople(life)],
    title:`这一次，日历围着${name}的事转吗`,
    story:`${name}想接一个新项目，${life.partner === 'lori' ? '要做六周的工程与教育工作' : '要带六周的设计团队，几乎每晚都要审稿'}。对方等她回话，她先把这六周的日程拿给你看。\n你手上的${workName(state)}也正忙。她指着同一段时间，问你${supportTask}能接下哪些。`,
    mission:{deadline:'她回复项目以前',objective:'为伴侣的六周计划安排生活分工，说明你能承担多少。',deliverable:'带名字的轮值表与一项由你让出的工作时段。'},
    factText:'Lori毕业于OSU电气工程专业；本幕工程教育项目、职业安排与家庭分工均为黄二勋的平行剧情，不作为真人职业履历。', sourceIds:['life-osu-pair'],
    echo:life.familyPact === 'limited_stake' ? '1993年你保留了各自承担风险的边界。现在，对方的职业也需要同样明确的空间。' : life.workBoundary === 'protected' ? '你已经为生活交接过工作，这次可以用同一个办法支持另一个人的计划。' : '一直由别人补位的日程，在对方也需要整段时间时会露出缺口。',
    options:[
      option('life-1999-partner-first',`这六周由你多承担，让${name}专心`,'接过大部分日常事务，把一个自己的工作窗口交出去；让同事知道时限。','职业推进变慢，自己会累；支持不是没有成本的口头赞成。',`${name}的项目得到一段完整时间。你学会了几件过去没真正负责的日常事，也错过一个工作窗口；这六周留下的是双方看得见的分工。`,{energy:-6,stress:2,bonds:5},{partnerCareer:'protected',workBoundary:'shared',familyPractice:'scheduled'},T([8,-1],[10,1],[14,1])),
      option('life-1999-alternate','两人轮流忙，付费补上缺口','把两份工作按周排开；必要时购买家务或照护服务，不默认一方随时救场。','花费增加，日程需要反复协调；没有任何一人能全程自由。','轮值表上两个名字都出现了。该付的钱付出去，该交接的工作交出去；项目继续，家务也不再只靠谁先看不下去。',{money:-6,energy:-3,stress:-1,bonds:3},{partnerCareer:'alternating',workBoundary:'shared',carePlan:'shared',familyPractice:'scheduled'},T([5,1],[7,1],[10,1])),
      option('life-1999-parallel','各自保住工作，只承诺固定份额','说清你无法承担额外六周，只签下固定日常份额；共同另找补足方案，接受相处时间减少。','关系可能更疏，外部支持更贵；你不能要求对方放弃项目来补位。','两份事业都继续。你们减少了一部分共同活动，花钱补上日常缺口；没有谁的机会被自动撤掉，但这段日子也少了许多一起吃饭的晚上。',{money:-5,energy:-2,bonds:-3,stress:3},{partnerCareer:'parallel',workBoundary:'porous',carePlan:'shared'},T([9,-1],[12,1],[14,-1])),
    ],
  });
}

function autonomy(state) {
  const life = lifeOf(state);
  const hasChildren = life.children === 'parent';
  const younger = hasChildren && life.childStartYear >= 1999;
  const subject = hasChildren ? '景安' : paired(life) ? partnerName(life) : '陈立文';
  return scene(state, 8, {
    date:'2006—2007 年 · 一次关于“为你好”的谈话', people:hasChildren ? childPeople(life) : familyPeople(life),
    title:hasChildren ? '孩子要试的路，不一定像你的路' : '关心一个成年人，到哪里停下',
    story:hasChildren
      ? `景安拿来一张${younger ? '画画课' : '艺术与设计课程'}的报名单，说想试试。你本来替他看好了${younger ? '科学兴趣班' : '工程课程'}。${life.childCount > 1 ? '雨禾在旁边插话，说她也想自己选。' : '他拿着那张纸，等你答复。'}\n报名快截止了，费用和接送还没定。你差一点就问他能不能坚持学下去，想了想，连他喜欢画什么都还没听过。`
      : `${subject}跟你说，${paired(life) ? '想去进修一段时间，以后可能换个工作方向' : '想离开现在的岗位，去一家小公司试试'}。对方已经问了什么时候能给答复。你一听就想到几个风险，刚要开口，对方说：“你等等，我还想跟你说说为什么。”`,
    mission:{deadline:hasChildren ? '课程报名截止前' : '对方回复新计划以前',objective:hasChildren ? '商量孩子能试什么、由谁支付和何时复盘，同时保留孩子的表达。' : '问清对方需要倾听、建议还是具体帮助，再决定自己参与的范围。',deliverable:hasChildren ? '一份有期限的尝试安排，或一次清楚表达分歧的谈话。' : '一个得到同意的帮助范围。'},
    factText:'2006—2007年CUDA进入公开发展阶段；本幕家庭、课程与对话为创作，景安和雨禾是本局育儿分支中的虚构孩子。', sourceIds:['life-nvidia-timeline'],
    echo:life.partnerCareer === 'protected' ? '你曾经为伴侣的计划让出一段时间。今天也需要先听懂另一个人的计划。' : life.familyPractice === 'help_network' ? '互相照应的圈子已经有边界；这次要把边界也留给对方。' : '你能提供经验，经验却不能代替对方的人生。',
    options:hasChildren ? [
      option('life-2007-child-trial','支持一段有期限的自主尝试','共同确定预算与试学时间，由孩子选择内容；结束后一起看实际体验。','花钱和接送时间，结果未必能变成成绩或职业优势。','报名单由景安自己递出，你负责答应过的费用和接送。孩子可以试，也可以承认不喜欢；这次支持没有附带必须走成某种人生的条件。',{money:-5,energy:-4,bonds:5},{parenting:'support',workBoundary:'shared'},T([0,0],[8,-1],[10,1])),
      option('life-2007-child-guide','提出你的顾虑，一起保留两种课','先保留基础课程，再留一部分给孩子选；明确承认这是你的偏好。','孩子空闲减少，你也要花更多协调时间；分歧并未因此消失。','课表里留下两种方向。景安接受了这次折中，也要求下一次减少你替他选的部分。你记下那句话，明白安排得周全不等于被完全认同。',{money:-3,energy:-4,stress:2,bonds:-1},{parenting:'guide'},T([7,1],[8,1],[10,0])),
      option('life-2007-child-listen','先问孩子为什么喜欢，暂不替选','留一个完整下午听孩子讲，说明家庭能承担的费用；选课由孩子在范围内决定。','你要忍住立刻给结论的冲动，也得接受方向仍然不确定。','你第一次听完孩子为什么喜欢那件事。报名没有当场完成，但预算说清了，决定权也说清了；下一次谈话不再从你的答案开始。',{energy:-3,stress:2,bonds:4},{parenting:'listen'},T([5,1],[8,-1],[14,1])),
    ] : [
      option('life-2007-adult-listen','先听完，问对方想要哪种帮助','把建议留到对方邀请之后；明确你愿意做的具体一件事。','需要一段完整时间，却未必能改变对方决定。','对方说完了自己的理由，也挑了一件需要你帮忙的事。你们没有得出相同结论，谈话仍能继续。',{energy:-3,bonds:5,stress:1},{parenting:'listen',socialPractice:'close_circle'},T([5,1],[8,-1],[10,1])),
      option('life-2007-adult-help','在对方同意后，帮一次实际忙','帮查一份资料或跑一次手续，约定到哪一步停止。','消耗工作时间与交通费用；帮忙不等于获得决定权。','你做完约定的那件事，资料交到对方手上。接下来的选择仍由对方签字，关系没有变成一个需要你批准的项目。',{money:-3,energy:-4,bonds:4},{socialPractice:'open_table',familyPractice:'help_network'},T([5,1],[9,-1],[10,1])),
      option('life-2007-adult-boundary','表达不同意见，但不接管','说清你担心什么，也说清自己这段时间无法额外帮忙；保持原来的联系。','对方可能失望，你也得接受建议没有被采纳。','你没有把“为你好”变成最后通牒。谈话有些安静，但两人仍知道下次什么时候见；不同意见没有让关系成为控制的理由。',{energy:3,bonds:-2,stress:2},{workBoundary:'protected',socialPractice:'close_circle'},T([9,-1],[8,-1])),
    ],
  });
}

function care(state) {
  const life = lifeOf(state);
  const sharedBefore = life.carePlan === 'shared' || life.familyPractice === 'help_network';
  return scene(state, 9, {
    date:'2012 年 · 下一次探望之前', people:[jeff(),fictional('黄二勋的父母','本局年长家人；不虚构真实疾病或失能'),...(paired(life) ? [partnerPerson(life)] : [friend()])],
    title:'父母说“我们能行”，你要先问什么',
    story:'Jeff 打来电话，问你下次什么时候一起看父母。父母想整理旧照片，还有几份文件要人帮忙核对。他们说平时照顾得过来，叫你们别两头跑。\n“照片他们想自己慢慢挑。”Jeff 翻了一下日程，“文件得有人陪着看。你下次哪天能来？”',
    mission:{deadline:'下一次探望前',objective:'询问父母愿意接受什么支持，再安排交通、联络和兄弟分工。',deliverable:'一份得到同意的照应清单，以及有具体名字的联系人。'},
    factText:'本幕年长父母的日常与照应安排为平行剧情；不据此声称真实父母患病、失能或有任何特定私人经历。',
    echo:sharedBefore ? '你已经搭过一次互助网络，这次知道先问谁愿意、能帮到哪。' : life.familyPractice === 'letter' ? '当年寄回去的信，现在换成了需要好好听完的一通电话。父母也有不想被安排的部分。' : '固定联系的习惯仍有用；接下来要把“常回去”写成双方接受的日期。',
    options:[
      option('life-2012-personal','少接一段工作，亲自多去几次','先问父母哪些事需要陪同，再安排固定探望；让 Jeff 保留自己的日程。','差旅和时间成本上升，自己的工作与家庭也要重排。','你陪父母整理完一盒照片，又留下一些他们想自己慢慢做的事。探望有了固定日期；你承担了更多路程，也没有把陪伴变成查岗。',{money:-5,energy:-6,bonds:5,stress:1},{carePlan:'personal',familyPractice:'scheduled',workBoundary:'protected'},T([10,1],[12,-1],[14,1])),
      option('life-2012-shared','和 Jeff 轮流，补上专业与当地支持','经父母同意，把交通、联络和日常协助分给愿意承担的人；需要服务的部分照实付费。','持续花钱，也要花心力协调；你不能只出一笔钱就不再过问。','表上出现你、Jeff 和当地联系人的名字，旁边分别写着能做什么。父母保留自己的决定权，兄弟也不用靠谁先撑不住来决定换班。',{money:-6,energy:sharedBefore ? -2 : -4,stress:-3,bonds:3},{carePlan:'shared',familyPractice:'help_network',workBoundary:'shared'},T([5,1],[7,1],[10,1])),
      option('life-2012-community','尊重他们独立，先把联系网接好','只协助父母同意的事项；定期联系，补全附近可信联系人的信息，也给社区互助留一个时段。','你无法随时看见日常状况，需要接受父母拒绝一部分帮助。','你把联系人抄得很大，先请父母自己核对。你们约定何时联系、何时需要开口求助；你留出社区互助时间，也没有把他们的生活全部搬进自己的日历。',{energy:-3,stress:2,bonds:2},{carePlan:'community',familyPractice:'weekly_call',socialPractice:'open_table'},T([8,-1],[9,-1],[10,1])),
    ],
  });
}

function grownChildren(state) {
  const life = lifeOf(state);
  const hasChildren = life.children === 'parent';
  const late = hasChildren && life.childStartYear >= 1999;
  if (!hasChildren) return scene(state, 10, {
    date:'2016 年 · 一个新的邀请', people:[fictional('林晓（Lin Xiao）','成年社区志愿者，正在组织公开技术活动'),friend(),...(paired(life) ? [partnerPerson(life)] : [])],
    title:knows(state, 'children') ? '还有人可以一起做事' : '从这次社区邀请开始记录',
    story:`林晓在组织社区技术活动，想请你带几次入门课。陈立文也在筹备一个小项目，问你能不能帮点忙。\n${paired(life) ? `你和${partnerName(life)}最近各有安排，` : '你最近的周末已经约了几次朋友，'}接下这些事，就得腾出时间。林晓说，这周给她答复就行。`,
    mission:{deadline:'活动排期确定以前',objective:'决定愿意承担哪一项社会参与，或明确暂不承担。',deliverable:'一段有终点的志愿安排、一笔有范围的支持，或清楚的拒绝。'},
    factText:'本幕社区人物和活动为虚构；真实Spencer与Madison曾走过餐饮等不同路径，仅作为个人生活可以有多种方向的时代参照。', sourceIds:['life-spencer','life-madison'],
    echo:life.carePlan === 'community' ? '你已经给社区互助留过时间。今天可以继续，也可以调整到自己承担得起的程度。' : `你保留的${hobbyName(life)}与私人时间，也有权出现在这张日程表里。`,
    options:[
      option('life-2016-mentor','带四次课，之后把组织交回去','把能教的内容缩成四次，帮助林晓自己主持下一轮；不把所有后续问题收回手里。','需要准备和到场，自己的工作与休息会少一部分。','第四次课结束时，下一次活动由林晓排期。你留下资料和约定好的答疑范围，支持没有变成一个永远离不开你的组织。',{energy:-5,money:-2,bonds:4,ecosystem:3},{socialPractice:'mentoring',workBoundary:'shared'},T([8,-1],[10,1],[14,1])),
      option('life-2016-support','出一笔有范围的支持，把决定权留给他们','确认用途和负责人后承担一部分费用；不要求活动变成自己的作品。','资金减少，也得接受对方采用与你不同的做法。','你的支持落实到一项看得见的开支，负责人保留组织权。名单上有你的名字，活动并不围着你运转。',{money:-6,energy:-1,bonds:2,control:-2},{socialPractice:'open_table'},T([8,-1],[10,1])),
      option('life-2016-private','这次不接，把时间留给自己的生活','向林晓说清本轮不参与；继续已经答应的朋友联系和个人爱好。','少了一次影响他人的机会，也可能错过新的关系。','你没有留下一句模糊的“随时找我”。那个下午留给原本答应的生活，林晓也能及时去找下一位愿意参加的人。',{energy:6,stress:-5,bonds:-1},{workBoundary:'protected',socialPractice:'close_circle'},T([9,-1],[13,1],[14,1])),
    ],
  });
  return scene(state, 10, {
    date:late ? '2016 年 · 景安准备下一阶段学习' : '2016 年 · 成年儿女各有自己的日程', people:childPeople(life),
    title:late ? '申请表上的名字是孩子的' : '儿女的工作，不必接在你的工作后面',
    story:late
      ? '景安把想申请的几所学校拿给你看。名单上有离家远的，也有费用高的，他想知道家里能出多少。\n你想到自己当年选专业，把纸接过来。申请快要交了，他却还没说为什么把那所最远的学校排在第一。'
      : '景安想做一个餐饮设计项目，雨禾准备去另一座城市工作。吃饭时他们轮流说自己的计划，也想听听你的意见。你不熟悉他们选的行当，好几处听得还没太明白。\n他们要给对方回信了。景安问你能不能帮上一次忙，你停了一下，先问他想请你做什么。',
    mission:{deadline:late ? '申请与预算确认前' : '他们回复新机会以前',objective:'明确能提供的支持与边界，允许孩子独立作出选择。',deliverable:'一项经过对方同意的帮助，以及不附带职业控制的条件。'},
    factText:'真实Spencer曾在台北参与餐饮创业，Madison学习餐饮与葡萄酒；本局景安和雨禾为虚构子女，他们的职业和谈话不代表真人经历。', sourceIds:['life-spencer','life-madison'],
    echo:life.parenting === 'support' ? '你曾给过一段自主尝试，现在要接受那段尝试可能真的把孩子带向别处。' : life.parenting === 'listen' ? '当年听孩子讲喜欢什么的那个下午，终于有了后续。' : '过去你更习惯替孩子规划。今天可以继续给建议，也可以练习把最后的决定留下。',
    options:[
      option('life-2016-child-support',late ? '给出清楚预算，让景安自己选择' : '支持一次尝试，不要求回到你的行业','把可承担金额和支持期限讲清，不把资金变成选择学校或职业的交换条件。','资金和可支配时间减少，也要接受尝试可能没有理想结果。','支持的数额和终点写在纸上，路线由孩子自己选。你没有买到一份按自己期待发展的未来，只落实了一次愿意承担的帮助。',{money:-7,energy:-3,bonds:4},{parenting:'support',workBoundary:'shared'},T([8,-1],[10,1],[14,1])),
      option('life-2016-child-network','只在孩子同意后，介绍一位合适的人','先问需要哪一种资源，再做一次介绍；不替孩子向别人许诺结果。','要花人情和沟通时间，也得接受介绍可能用不上。','介绍发出前，你让孩子看过内容。之后的邮件由孩子自己写；你在旁边能帮忙，却不占据整段对话。',{energy:-4,bonds:3,communication:2},{parenting:'listen',socialPractice:'mentoring'},T([5,1],[8,-1],[9,-1])),
      option('life-2016-child-boundary',late ? '保留基础学业支持，额外费用有上限' : '保留家庭支持，不承担职业启动费用',late ? '明确承担基础学习与生活所需，再和景安商量额外课程和外地申请的费用上限；在范围内由他选择。' : '清楚说明目前能承担的基本照应和联系，职业投入由孩子另作计划；不贬低他们的方向。','孩子可能失望，需要调整计划；你也要容许关系经历这段分歧。',late ? '基础学业和生活支持仍在，额外费用的上限也说清了。景安需要调整部分申请，你们继续一起找范围内可行的选项；支持没有变成要求他照你的专业路线走。' : '你没有支付启动费用，也没有要求孩子撤回自己的想法。饭仍可以一起吃，意见仍然不同；家庭联系不再以是否照你的路线走为条件。',{energy:2,money:2,bonds:-2,stress:2},{parenting:'listen',familyPractice:'shared_table'},T([9,-1],[8,-1],[10,0])),
    ],
  });
}

function nextLife(state) {
  const life = lifeOf(state);
  const name = partnerName(life);
  const close = paired(life) ? `与${name}的共同时间` : '和朋友、手足的固定联系';
  const children = !knows(state, 'children') ? '此前婚育经历未记录，这张日历只从已有记录往下写。' : life.children === 'parent' ? `孩子已经${life.childStartYear >= 1999 ? '长大' : '成年多年'}，他们的日程也不再由你填写。` : life.children === 'childfree' ? '你没有养育孩子，平时常联系的还是家人和老朋友。' : '关于婚姻和孩子，你还没有新的打算。';
  return scene(state, 11, {
    date:'2024 年 · 翻开下一年的日历', people:[...familyPeople(life),jeff()],
    title:'61 岁，普通的星期二怎样过',
    story:`你六十一岁了，新一年的日历刚翻开。${children}\n${workName(state)}还有不少事等着你。你原想在日历上留出${close}，再留几天好好歇一歇。你翻到第一个星期二，手里的笔停了一会儿。`,
    mission:{deadline:'下一年的工作计划确定以前',objective:'先定下明年每周想做的事，再安排工作。',deliverable:'一周的固定日常、一段有边界的分享，或一次具体的新尝试。'},
    factText:'2024年作为本局收束年份；退休、交班、家人往来与下一年的日常安排都是黄二勋的玩家选择，不描述真实人物的私人计划。',
    echo:life.hobbyPractice === 'weekly' ? `${hobbyName(life)}已经有固定时段。你可以把它留进下一年，而不必给它附加一个宏大的用途。` : life.carePlan !== 'undecided' ? '你已知道照应别人需要具体分工。现在也需要给自己的日子一个同样具体的安排。' : '小时候你盼着知道下一周怎么过。今天，这个问题仍值得认真回答。',
    options:[
      option('life-2024-ordinary','把两晚和一个下午留给日常',`固定${close}，再给${hobbyName(life)}留一个下午；接下来工作只能使用剩余时间。`,'少接项目或出席机会，也要亲自面对空下来后不那么热闹的日子。','日历上有两晚不再候补给工作，还有一个普通下午。你没有获得一个完美结局，只把接下来能兑现的日子写得更清楚。',{energy:6,stress:-6},{nextChapter:'ordinary',workBoundary:'protected',hobby:life.hobby === 'none' ? 'walking' : life.hobby,hobbyPractice:'weekly',familyPractice:'scheduled'},T([13,1],[14,1],[9,-1])),
      option('life-2024-share','每月留一段时间，陪后来的人试一次','只接一项有起止时间的带教、社区或家庭支持；把组织权逐步交给参与者。','仍要付出精力和一点资金，自己的休息与旅行会少一些。','你答应了一段具体的支持，也写下结束日期。后来的人可以向你求助，却不必把自己的决定永久交给你；你的日历仍有未安排的空格。',{money:-3,energy:-4,bonds:4,ecosystem:2},{nextChapter:'share',socialPractice:'mentoring',workBoundary:'shared'},T([8,-1],[10,1],[9,-1])),
      option('life-2024-explore','认真学一件尚不熟练的事','选一门做饭、运动或创作课，从新手开始；先留四周，不急着承诺人生下一阶段。','要花钱和时间，也会重新遇到做不好、跟不上的时刻。','你报了第一段课程，把工作电话的空当缩小。那张报名表没有CEO、工程师或家长的位置，只有姓名和第一次上课的日期。',{money:-5,energy:-2,stress:-4},{nextChapter:'explore',hobby:life.hobby === 'cooking' ? 'table_tennis' : 'cooking',hobbyPractice:'weekly',workBoundary:'protected'},T([13,1],[14,1],[15,1])),
    ],
  });
}

const BUILDERS = [school,teenager,relationship,household,riskPact,crisisCare,hobby,partnerCareer,autonomy,care,grownChildren,nextLife];

export function getLifeScene(state) {
  if (isExpandedStory(state) && state.step >= 12 && state.step <= 15) return enrichAffairScene(enrichContinuityScene(enrichDilemmaScene(createFutureRelationshipScene(state), state, 'life'), state, 'life'), state, 'life');
  if (!state || !Number.isInteger(state.step) || !BUILDERS[state.step]) throw new RangeError('生活节点须在0至11之间');
  return enrichAffairScene(enrichContinuityScene(enrichDilemmaScene(enrichRelationshipScene(BUILDERS[state.step](state), state), state, 'life'), state, 'life'), state, 'life');
}

const PRACTICES = {
  familyPractice:{unformed:'尚未形成固定联系',letter:'愿意写下真实近况',shared_table:'把同桌吃饭留给家人',scheduled:'按约定日期联系',help_network:'与几位可信的人互相照应',weekly_call:'定期联系，保留彼此独立'},
  workBoundary:{porous:'工作经常进入私人时间',protected:'保留不接工作的时段',shared:'通过交接与轮值安排时间',seasonal:'容许一段忙季，再回头复查'},
  carePlan:{undecided:'尚未记录照护安排',personal:'更多亲自到场',shared:'兄弟与支持者共同分担',community:'尊重独立，连接当地支持'},
  partnerCareer:{undecided:'尚未记录共同职业安排',protected:'曾让对方的事业先占一段时间',alternating:'轮流承担忙季与日常',parallel:'保留双方独立的职业路线'},
  parenting:{undecided:'尚未记录如何支持下一代',guide:'更常提出规划与折中',support:'提供有边界的尝试支持',listen:'把决定权逐渐交还对方'},
  studyPace:{steady:'按原有节奏排课',reduced:'减少课程，给生活留时间',paused:'曾暂停课程以重新安顿'},
  socialPractice:{close_circle:'维持少数深联系',open_table:'经营互相往来的小圈子',mentoring:'用有期限的陪伴支持后来者'},
};

function receipts(state, steps) {
  return (state.lifeJournal || []).filter(entry => steps.includes(entry.step)).map(entry => ({
    year:String(entry.year || YEARS[entry.step] || ''),
    title:entry.choiceTitle || entry.title || '生活选择',
    text:entry.resultText || entry.text || entry.consequence || '',
  }));
}

export function getLifePortrait(state) {
  const life = lifeOf(state);
  const name = partnerName(life);
  const hasPartner = paired(life);
  const hasChildren = life.children === 'parent';
  const relationKnown = knows(state, 'partner', 'relationship');
  const childrenKnown = knows(state, 'children');
  const hobbyKnown = knows(state, 'hobby', 'hobbyPractice');
  const practice = (field, unknown) => knows(state, field) ? PRACTICES[field][life[field]] : unknown;
  const familyPractice = practice('familyPractice', '联系家人的方式此前未记录');
  const carePractice = practice('carePlan', '照护分工此前未记录');
  const boundary = practice('workBoundary', '生活边界此前未记录');
  const study = practice('studyPace', '此前生活安排对课程节奏的影响未记录');
  const social = practice('socialPractice', '此前交往方式未记录');
  const relationStatus = !relationKnown ? '此前亲密关系未记录' : hasPartner ? `${life.relationship === 'married' ? '与' : '伴侣：'}${name}${life.relationship === 'married' ? '结婚' : '；未婚'}` : life.relationship === 'separated' ? '分开后，独自生活' : '目前单身';
  const relationText = !relationKnown ? '旧存档没有记录感情经历，这里暂时留空。' : hasPartner
    ? `你和${name}仍在一起。${PRACTICES.partnerCareer[life.partnerCareer]}。下方可以回看你们商量过的安排。`
    : life.relationship === 'separated' ? '你们分开后，各自重新安排生活。你仍和家人、朋友保持联系。' : '你一直独自生活，平时和家人、朋友来往。下方记着你为这些联系做过的安排。';
  const familyStatus = !childrenKnown ? '此前婚育未记录' : hasChildren ? `育有${life.childCount === 2 ? '两个孩子：景安与雨禾' : '一个孩子：景安'}` : life.children === 'childfree' ? '选择不育儿' : '尚未确定育儿';
  const familyText = `${!childrenKnown ? '旧版未记录是否育儿，未出现孩子不能被解释为选择不育儿。' : hasChildren ? `这条平行人生中的孩子是虚构家人。${PRACTICES.parenting[life.parenting]}。` : life.children === 'childfree' ? '你选择不养育孩子。你和家人、朋友相互照应。' : '你还没有决定是否养育孩子。'}${carePractice}，${familyPractice}。`;
  const hobbyStatus = !hobbyKnown ? '此前兴趣未记录' : life.hobby === 'none' ? '尚未保留固定爱好' : `${hobbyName(life)} · ${{dormant:'暂时搁置',occasional:'偶尔进行',weekly:'固定进行'}[life.hobbyPractice] || '节奏待定'}`;
  const hobbyText = !hobbyKnown ? '旧存档没有记录爱好和休息安排。' : life.hobbyPractice === 'dormant' ? '这些年工作占去了不少空闲，爱好暂时放下了。' : `你曾为${hobbyName(life)}专门留出时间。这里记着开始、搁置或重新捡起来的几次决定。`;
  const career = {student:'求学',employee:'职业工程',company:'经营公司',studio:'独立工作室',researcher:'研究与教学',sold:'出售与交接之后'}[state.route] || '尚未确定的职业';
  const facets = [
    {id:'relationship',title:'亲密关系',status:relationStatus,text:relationText,receipts:receipts(state,[2,3,7])},
    {id:'family',title:'家人与照应',status:familyStatus,text:familyText,receipts:receipts(state,[0,3,5,8,9,10])},
    {id:'interests',title:'兴趣与自己的时间',status:hobbyStatus,text:hobbyText,receipts:receipts(state,[1,6,11])},
    {id:'work',title:'工作安排',status:`${career} · ${boundary}`,text:`${study}。除了工作，你还需要安排家用、照应家人，留出休息。`,receipts:receipts(state,[3,4,5,7,11])},
    {id:'others',title:'朋友与来往',status:social,text:knows(state, 'socialPractice') ? '这里记着你和朋友的来往，以及这些年帮过的忙。' : '旧版没有保存这部分生活安排；只展示从接入生活记录之后明确发生的交往选择。',receipts:receipts(state,[0,7,8,9,10,11])},
  ].map(facet => ({...facet,label:facet.status}));
  const title = !life.historyKnown && !(state.lifeJournal || []).length ? '生活记录从这里开始' : {ordinary:'给自己多留些时间',share:'接下来，带带新人',explore:'还有些新东西想学',undecided:'看看这些年'}[life.nextChapter] || '这些年的生活';
  const note = life.historyKnown ? '' : '此存档从中途接入生活记录；之前未记录的关系与家庭经历不作推断。';
  return enrichRelationshipPortrait({
    title,
    text:`${relationStatus}，${familyStatus}。${hobbyStatus}；${boundary}。${note}`,
    facets,
    commitments:[
      {label:'联系家人的办法',value:familyPractice},
      {label:'自己的固定时间',value:hobbyStatus},
      {label:'工作边界',value:boundary},
      {label:'照护分工',value:carePractice},
      {label:'下一段日子',value:{ordinary:'保留普通的两晚和一个下午',share:'承担一段有终点的支持',explore:'学习一件尚不熟练的事',undecided:'还没有决定'}[life.nextChapter]},
    ],
    note,
  }, state);
}
