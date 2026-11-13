// This overlay is active only for the whole-life edition. Legacy saves keep
// their original choices, prose and numeric replay contract.
import { enrichCompanyScene } from './story-company.mjs';
export const CAREER_SOURCES = [
  {id:'career-sec',title:'NVIDIA 2006 年股东文件：AMD 与 LSI 任职履历',url:'https://www.sec.gov/Archives/edgar/data/1045810/000119312506110604/ddef14a.htm',note:'1984–1985 年任 AMD 微处理器设计师，1985–1993 年任职 LSI Logic。'},
  {id:'career-board',title:'NVIDIA 董事履历：黄仁勋',url:'https://www.nvidia.com/en-us/about-nvidia/board-of-directors/jensen-huang/'},
  {id:'career-study',title:'斯坦福访谈：全职工作、育儿与八年硕士',url:'https://engineering.stanford.edu/news/jen-hsun-huang-nvidia-co-founder-invests-next-generation-stanford-engineers'},
];

function person(name, role, kind = '虚构角色') { return {name,role,kind}; }
function partnerName(life) {
  if (!['dating','married'].includes(life.relationship)) return '';
  return life.partner === 'lori' ? 'Lori' : life.partner === 'maya' ? '陈麦雅' : '';
}
function replaceCopy(scene, name) {
  const replace = text => typeof text === 'string'
    ? text.replaceAll('Lori Mills', name).replaceAll('Lori',name) : text;
  const options = list => list.map(option=>({...option,title:replace(option.title),description:replace(option.description),
    ...(option.outcomes?{outcomes:option.outcomes.map(outcome=>({...outcome,text:replace(outcome.text)}))}:{}),
  }));
  return {...scene,story:replace(scene.story),prepTitle:replace(scene.prepTitle),prepStory:replace(scene.prepStory),
    prep:options(scene.prep),choices:options(scene.choices),
    people:scene.people.map(p=>p.name.includes('Lori')
      ? name === 'Lori' ? {...p,role:'工程师；与你共同安排生活',kind:'历史人物'}
        : person(name,name==='陈麦雅'?'平面设计师；与你共同安排生活':'多年的朋友') : p),
  };
}
function jobChoice(template, title, description, text, effects, flag, route, alternate = false) {
  const {check,cost,outcomes,flags,...base}=template;
  const moneyCost=effects.money<0?effects.money:0;
  const immediate={...effects};
  if(moneyCost)delete immediate.money;
  return {...base,title,description,effects:immediate,route,...(moneyCost?{cost:{money:moneyCost}}:{}),
    flags:[flag,...(alternate?['counterfactual']:[])],
    outcomes:[{label:'下一步有了名字',text}],
  };
}

export function groundCareerScene(original, state) {
  if (!state.life) return original;
  const {life,flags={},step}=state;
  const closePerson=partnerName(life);
  let scene=replaceCopy(original,closePerson || '汤姆');

  if (step === 2) {
    scene={...scene,title:'毕业之后，第一份工作去哪里',
      date:'1984 年 · OSU 毕业前的最后一周',
      story:`Dearborn Hall 的实验台快要交给下一届学生。你把计数板装进纸箱。这块板平时数得准，时钟一调快，显示偶尔就少跳一格。你想留校弄明白原因，可研究助理还得申请，项目经费也还没批。\n求职资料就压在纸箱底下。AMD 的岗位从微处理器的运算和控制电路做起，招人看的是能不能用测试数据找出故障、说清改过哪段电路。LSI Logic 那边在谈一块定制芯片，要把客户控制板上的计数、地址译码和数据交换放到一起。客户在意芯片有多少引脚、反应够不够快、做出来要多少钱。\n陈立文问：“你走以后，我往哪儿寄信？”${closePerson?`你连加州的住址都还没定，也还没和${closePerson}说好搬走后怎么见面。`:'你还想跟朋友常来往，连落脚的城市都没定。'}`,
      prepTitle:'带走纸箱前，把一个问题问透',
      prepStory:'实验室只剩你这张桌子还没收好。两次排错的输入、实测波形和修改结果分散在几张纸上。招聘的人问起加法进位、寄存器读写或信号时序，一块会亮的板还答不了这些问题。LSI 的客户也要知道，按他们的引脚、速度和价格要求，有哪些功能没法同时保留。\n研究申请上写着“时钟加快为什么会漏计”。两种接线会用同一组脉冲比较，波形、最高可靠频率和器件数量都有各自的记录栏。导师还等着一页别人能照着重做的实验步骤和器材预算。\n加州房租押金和搬家报价夹在表格下面。你还不知道什么时候入职，也不知道第一笔工资几号到账。',
      mission:{deadline:'离开科瓦利斯之前',objective:'选择毕业后的职业起点，给下一年写下工作、收入与搬迁安排。',deliverable:'一份 AMD 入职计划、LSI 客户芯片方案方向，或一份留校研究申请。'},
      people:[person('陈立文','工程专业同学'),...(closePerson?[person(closePerson,life.partner==='lori'?'仍在 OSU 完成电气工程学业':'成年平面设计师',life.partner==='lori'?'历史人物':'虚构角色')]:[person('汤姆·米勒','仍与你通信的老朋友')])],
      prep:scene.prep.map((p,i)=>({...p,...[
        {title:'把两次电路排错写进作品集',description:'让招聘者能看见你怎样发现错误、复现问题，而不只看到一块会亮的板。'},
        {title:'先算搬迁和第一笔工资之间的空档',description:'把房租、交通与毕业后的几周开支列好，再约一个能兑现的出发日期。'},
        {title:'给研究项目写一页可重做的计划',description:'整理电路资料，说明还不知道什么，也准备申请经费和复印材料。'},
      ][i]})),
      choices:[
        jobChoice(scene.choices[0],'去 AMD 做微处理器设计','从具体的芯片设计问题做起，搬去加州，接受企业的项目节奏。','你在入职计划上写下 AMD。第一份工资有了着落，交付日期也进入日历。接下来先学会把一块芯片做对；毕业前选下的关系，需要另外花时间经营。',{money:8,engineering:6,energy:-4,control:-3},'employer_amd','employee'),
        jobChoice(scene.choices[1],'提前去 LSI Logic 做客户芯片方案','在这条平行经历里，争取更早接触 ASIC 与客户系统。要频繁解释需求，也会遇到不断变化的规格。','你把下一段经历选在 LSI Logic。客户带来的问题很具体，却很少按教科书排列。你获得跨团队学习的机会，安静独自排错的时间减少了。',{money:7,communication:7,engineering:3,stress:4},'employer_lsi','employee',true),
        jobChoice(scene.choices[2],'留在校园申请研究项目','接受较紧的预算，先做研究助理与深造申请。读博、论文与正式教职仍要一步步走。','你留下一只装着电路板的纸箱，向导师提交研究申请。生活费开始需要细算，问题却可以多追一层。这是研究训练的起点，教职尚未到来。',{money:-5,engineering:8,energy:3},'employer_research','researcher',true),
      ],
      fact:{text:'公开履历记载，黄仁勋 1984 年取得 OSU 电气工程学士，1984—1985 年在 AMD 做微处理器设计，1985—1993 年任职 LSI Logic。Lori 于 1985 年毕业。提前加入 LSI、留校研究、具体岗位谈判和迁居安排是游戏分支。',sourceIds:['osu','lori','dearborn','career-sec','career-board']},
    };
  }

  if (step === 3) {
    const research=flags.employer_research;
    const career=research
      ? '毕业时那块漏计的板子让你接着研究芯片时序和电路验证。你用同一组输入比较不同电路方案，实测波形有时还是和仿真对不上。别的组也要照你的记录复测。下一轮实验经费还要申请，你也得算算校园工作的收入够不够。'
      : flags.employer_lsi
        ? '你一毕业就去了 LSI Logic。现在，客户等着你把控制板上的功能写成定制芯片规格。接口和时序还要用实测结果核对。对方又问了一遍，要跑得更快，器件要多加几个，成本又会上去多少。'
        : '毕业后，你先在 AMD 做微处理器设计，1985 年转进 LSI Logic。客户芯片的接口和时序还等着核对测试结果，你到点却得去斯坦福上课。讲义下面还压着白天没看完的记录。';
    const family=life.children==='parent'
      ? `家里还有孩子的作息。哪晚要上课、那天谁照看孩子，${closePerson?`你得和${closePerson}对一下`:'你得先安排好'}。`
      : closePerson?`你和${closePerson}都有自己的安排，能一起吃饭的晚上得提前约。`:'住处和课表由你自己安排。朋友叫你出去吃饭时，你有时只想回家睡觉。';
    const pace=life.studyPace==='paused'?'暂停课程以后，你把修过的学分和复学条件收在一起。'
      :life.studyPace==='reduced'?'你少选了几门课，晚上能多留一点时间。':'你照原来的节奏修课，学位还有一段没读完。';
    scene={...scene,title:research?'研究要继续，日子也要过下去':'一份工作，一张课表，还有回家的路',date:'1992 年 · 安排下一阶段的学习与工作',
      story:`${career}${family}${pace}\nChris Malachowsky 和 Curtis Priem 想知道，给普通电脑加一块专用图形电路，能不能让屏幕上的三维物体转得更顺。你们拿它和通用处理器比帧率，也得记下显存用量和每帧搬了多少数据。Chris 已经问过一次演示进展，你手里还没有一段能稳定跑完的画面。下次碰头的日期紧挨着${research?'实验室的设备归还日':'手上客户项目的验收日'}。`,
      prepStory:research?'两组实测波形都和仿真对不上，记录上却漏了出错时的输入和时钟设置。图形小样里的物体一转快，画面也跟着卡住。帧率填了几栏，显存和每帧的数据量还没测全。\nChris 和 Curtis 在等这张表。究竟是算得慢，还是数据来不及从内存搬过去，关系到专门加一块电路值不值那个价。':scene.prepStory,
      prep:scene.prep.map((p,i)=>i===0?{...p,title:research?'整理研究中两次被推翻的假设':'整理芯片项目中两次设计教训',description:'用一页纸写清一次可复现的结果和一次失败，判断下一步该验证什么。'}:p),
      mission:{deadline:'下一次与 Chris、Curtis 交流之前',objective:'交出一份性能对照、学习与工作收尾安排，或一段图形演示，并给生活留出能兑现的时间。',deliverable:'可重做的测试数据、一份学业收尾文件，或标明限制的小演示。'},
      choices:scene.choices.map((o,i)=>i===1?{...o,title:'先交清眼前的课程与工作',description:life.studyPace==='paused'?'办好暂停和保留学分的手续，把这段时间交还给已经选下的生活安排。':'把多年修读的课程与现有工作收尾，办妥毕业文件，给自己留一个完整的晚上。',outcomes:o.outcomes.map(r=>({...r,flags:life.studyPace==='paused'?['study_paused']:['degree_finished'],label:life.studyPace==='paused'?'留下复学的条件':'学业告一段落',text:life.studyPace==='paused'?'你拿到课程暂停的确认，把复学条件收进文件夹。学位尚未完成，这个晚上留给了你已经决定要承担的事。':'你交清课程任务与工作材料，办妥毕业文件。多年修读终于有了收尾，日历空出一个完整的晚上，下一步可以重新安排。'}))}:o),
      fact:{text:scene.fact.text+' 斯坦福公开采访记载，黄仁勋在全职工作与育儿期间减少选课，八年完成硕士。本局的学历与照护安排随选择发展。',sourceIds:[...scene.fact.sourceIds,'career-study']},
    };
  }

  if (step === 4 && flags.employer_research) {
    const replace=text=>typeof text==='string'?text.replaceAll('离开 LSI','离开校园项目').replaceAll('LSI Logic 的工作','校园研究项目').replaceAll('留在 LSI','留在研究团队').replaceAll('LSI','研究团队').replaceAll('工资继续','项目收入继续').replaceAll('公司审批','项目负责人审批'):text;
    const researchOptions=list=>list.map(o=>({...o,title:replace(o.title),description:replace(o.description),...(o.outcomes?{outcomes:o.outcomes.map(r=>({...r,text:replace(r.text)}))}:{})}));
    scene={...scene,title:replace(scene.title),story:replace(scene.story),
      prepTitle:replace(scene.prepTitle),prepStory:replace(scene.prepStory),prep:researchOptions(scene.prep),
      choices:researchOptions(scene.choices).map((o,i)=>({...o,...(i===1?{route:'researcher'}:{})})),
    };
  }
  if (step === 4 && flags.study_paused) {
    scene={...scene,echo:'你把保留学分与复学条件收在同一个文件夹里。新机会出现了，尚未完成的学业也仍在等你决定何时继续。'};
  }
  // The original edition grouped CUDA's 2006 architecture and 2007 tools in
  // one year. In this edition both parts of the chapter take place in 2007.
  if (step === 8) scene={...scene,year:'2007',age:44};

  if (step === 11 && !closePerson) {
    scene={...scene,
      story:scene.story.replace('汤姆 的晚饭约定也在日历上。几个项目偏偏把签字排在同几天，签字人还只写了你。','你本来想把几天留给朋友和休息。项目偏偏把签字排在那几天，签字人还只写了你。'),
      prepStory:scene.prepStory.replace('约 汤姆 吃饭','见朋友'),
      choices:scene.choices.map((o,i)=>i===2?{...o,title:'把每周两晚留给自己的生活',description:'减掉一部分工作，交代剩余承诺，给朋友、兴趣和休息留出不会随便取消的时间。'}:o),
    };
  }
  return enrichCompanyScene(scene, state);
}
