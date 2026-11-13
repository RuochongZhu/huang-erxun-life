// Reactions are derived from the actual before/after pair, never from a hoped-for
// success. Copying metadata keeps consumers from mutating shared scene data.
const EDITION='2026.11.impact';
const TONES=new Set(['warm','tense','angry','hopeful','wry']);
const paired=life=>['dating','married'].includes(life?.relationship)&&['lori','maya'].includes(life?.partner);
const partner=life=>life.partner==='lori'?'Lori':'麦雅';
const line=(speaker,text,tone='tense')=>({speaker,text,tone});
const world=(environment,...reactions)=>({reactions:reactions.slice(0,2),environment});
const chosen=(state,pattern)=>(state.lifeJournal||[]).filter(entry=>pattern.test(entry.optionId||'')).length;

function clean(value) {
  if(!value||!Array.isArray(value.reactions)||typeof value.environment!=='string')return null;
  const reactions=value.reactions.filter(item=>item&&typeof item.speaker==='string'&&typeof item.text==='string')
    .slice(0,2).map(item=>({speaker:item.speaker,text:item.text,tone:TONES.has(item.tone)?item.tone:'tense'}));
  return {reactions,environment:value.environment};
}

function careerRole(state) {
  if(state.step===0)return {peer:'汤姆',client:'值班老师',place:'书页还摊在桌上，走廊里响起晚饭的脚步。'};
  if(state.step===1)return {peer:'艾迪',client:'领班玛丽',place:'出餐铃又响了一次，下一桌客人已经坐下。'};
  if(state.step===2)return {peer:'陈立文',client:'招聘或研究项目联络人',place:'纸箱还没封口，实验室门口的人已经换了一批。'};
  const route=state.route;
  return route==='company'?{peer:'工程负责人',client:'客户代表',place:'办公室的电话重新响起来，门外有人等下一项安排。'}
    :route==='researcher'?{peer:'研究搭档',client:'合作研究者',place:'机房风扇仍在转，桌上留下了这次测试的记录。'}
      :route==='employee'?{peer:'同组工程师',client:'主管',place:'组里的灯还亮着，交接板上多了一行具体安排。'}
        :route==='sold'?{peer:'顾问搭档',client:'委托方',place:'线上会面已经结束，待回复的事项仍留在窗口里。'}
          :{peer:'工作室搭档',client:'客户',place:'工作台上的设备没有停，搭档把接下来的任务重新排好。'};
}

function preparation(before,option) {
  const c=careerRole(before), tags=option.prepTags||[];
  if(tags.includes('evidence')||tags.includes('prototype'))return world(c.place,
    line(c.peer,before.step<2?'先试一遍，卡在哪里我们就从哪里开始。':'把没跑过的也标出来，别只拿最好看的那一次。','tense'));
  if(tags.includes('listen')||tags.includes('ask'))return world(c.place,
    line(c.peer,before.step<2?'你先说，我听着。':'既然你问了，我想把上次没说完的担心也讲清楚。','warm'));
  if(tags.includes('plan'))return world(c.place,
    line(c.peer,before.step<2?'这个时间你真能来，我就先给你留着。':'范围写好了，临时多出来的事就别又默认加回来。','tense'));
  return world(c.place,line(c.peer,'这一步准备好了，接下来还得看我们实际怎么做。','hopeful'));
}

function lifeFeedback(before,after,option) {
  const previous=before.life||{},life=after.life||{}, set=option.set||{}, id=option.id||'',title=option.title||'';
  const wasPaired=paired(previous),isPaired=paired(life),oldName=wasPaired?partner(previous):'',name=isPaired?partner(life):'';
  const close=isPaired?name:before.step<2?'Jeff':'陈立文';
  const adults=life.children==='parent'&&(Number(after.lastResult?.year)||2036)-(life.childStartYear||1990)>=18;
  if(id==='life-1978-extra-shift')return world('苏珊把这学期的练球名单改好了，艾迪也知道不用每次替你留饭。读书信封被你收进了书包。',
    line('苏珊','那我们照常打。你想回来那周，提前告诉我。','warm'));
  if(id==='life-1996-show-up') {
    if(life.children==='parent')return world('节目结束后，孩子从台侧跑下来，隔着几排椅子先朝你挥手。手机在口袋里震了一下，你没有立刻拿出来。',
      line('景安','我刚才在台上看见你了！','warm'));
    if(isPaired)return world('展示结束后，人群慢慢散开。你仍站在作品旁，等对方把最后一个问题答完。',
      line(name,'刚才最紧张的时候，我看见你在听。','warm'));
    return world('电话一直没有被工作打断。Jeff 说完近况，又想起一件很小的事，你这次也听完了。',
      line('Jeff','这件事没多要紧，就是一直想跟你说。','warm'));
  }
  if(id==='life-1996-share-care')return life.children==='parent'
    ?world('接送时间和联系人发了过去，照护伙伴回了一条确认。你留在工作现场，孩子的那一晚却终于有人能按时接上。',
      line('照护伙伴','这次我来接。之后你答应陪他们的时间，记得自己留出来。','warm'))
    :world('共同朋友接过现场或联络的安排，你也把回请与补约写进了日历。工作没有停，缺席的说明已经送到。',
      line('接手的朋友','这次我帮你接上，后面的约定还是要你自己来。','tense'));
  if(id==='life-1996-reschedule')return world('补约的日期在电话两端分别记下。对方仍有些失落，但已经可以重新安排今晚，不必一直看钟等你。',
    line(isPaired?name:life.children==='parent'?'照护搭档':'Jeff','谢谢你提前说。补约那天请真的留出来，别又被工作挤掉。','tense'));
  if(wasPaired&&!isPaired)return world(
    life.children==='parent'?'共同安排写完后，两人各自收起自己的那一页。孩子的联系仍单独留着。':'门边的物品被分成两份，接下来的日历不再填在同一页。',
    line(oldName,'之后的安排我会自己决定。需要交代的事，我们还是说清。','tense'),
    ...(adults?[line('景安','我会分别联系你们，但不替任何一边作决定。','tense')]:[]));
  if(!wasPaired&&isPaired)return world('下一次见面的时间第一次被两个人写进各自日历，其他空格仍留给自己的生活。',
    line(name,previous.formerPartner===life.partner?'以前的事我们不能跳过。这次慢一点，把能做到的说清。':'我也愿意试试。先约好下一次，其他的慢慢谈。','hopeful'));
  if(wasPaired&&isPaired&&previous.partner!==life.partner)return world('这段新关系有了自己的开始，没有把旧经历从记录里擦掉。',line(name,'我们从现在各自真实的生活开始，不用演一个圆满的故事。','hopeful'));
  if(set.marriageOutcome==='divorced'&&!isPaired)return world('共同事项分别收好，亲近的人没有被要求为关系的结束选边。',line('陈立文','之后要是想找人吃饭，先给我打个电话。','warm'));
  if(set.livingArrangement==='apart'&&isPaired)return world('两把钥匙被分别收好，下一次见面写在了不同住处的日历上。',
    line(name,'分开住这段时间，我也会想清楚自己要什么。','tense'));
  if(set.marriageOutcome==='repairing'||set.relationshipRepair==='trying')return world('谈话结束后，没有人急着合影或宣布结果，下一次见面的时间留在桌上。',
    line(close,'我愿意试，但今天说完，不等于那些事已经过去。','tense'));
  if(set.relationship==='married'&&previous.relationship!=='married')return world('新的约定写下了，桌上的日常开支和两份工作安排也没有因此消失。',
    line(close,set.children==='childfree'?'我们的决定已经说清。以后别人再问，也别把回答全留给我。':'我愿意一起过，也想保留自己的工作和生活。','warm'));
  if(set.children==='parent'&&previous.children!=='parent')return world('新的家庭安排挤进了课表或工作表，空白时间比原来少了。',
    line(close,'照顾的那几段时间，要真的有人来接，不只是在纸上有名字。','hopeful'));
  if(set.children==='childfree'&&previous.children!=='childfree')return world('关于孩子的那一栏写了清楚的决定，其他日常仍要继续安排。',
    line(close,isPaired?'这也是我们的生活。把自己的日子过具体就好。':'你已经想清楚，我就不替你安排另一种答案。','warm'));
  if(/postpone-again|one-last-sacrifice/.test(id)||set.relationshipRepair==='unrepaired') {
    const repeated=(before.lifeJournal||[]).some(entry=>
      /^(life-1996-(?:story-)?postpone-again|impact-1996-life-gift-cover|impact-2036-life-one-last-sacrifice)$/.test(entry.optionId||'')
      &&(entry.lifeBefore?.partner||'none')===(life.partner||'none'));
    return world(repeated?'原来留给你的椅子已经收走，消息停在很短的最后一句。':'电话那头先问你有没有吃饭，随后才说起自己的失望。',
      line(close,repeated?'别赶了，我们已经散场了。':'我知道你有难处。先顾好眼前，但这次我确实等了你。',repeated?'angry':'tense'));
  }
  if(/make-up|show-up|honest-night|private-evening|ordinary-days|repair|weekends|phone-in-drawer/.test(id)||set.relationshipRepair==='repair_done') {
    const reliable=chosen(before,/show-up|make-up|private-evening|ordinary-days|phone-in-drawer|weekly/)>0;
    return world(reliable?'有人先把你落下的材料放到门边，饭菜留在还能一起吃的温度。':'门开的时候，对方先看了一眼钟，随后把桌上的东西往旁边挪了挪。',
      line(close,reliable?'材料我替你放好了。这一会儿先坐下吃饭。':'这次你真到了。先坐吧，我还想把刚才那件事讲完。','warm'));
  }
  if(set.memoirBoundary)return world(set.memoirBoundary==='private_archive'?'照片背面补上了名字，几封信仍留在原来的信封里。':'书稿里的几段私人经历被重新标出，编辑没有催你立刻补回去。',
    line('编辑',set.memoirBoundary==='private_archive'?'先给愿意收的人看。留下记录，不一定要让所有人看见。':'有些空白可以留下，别用别人的隐私填满它。','tense'));
  if(set.publicBoundary)return world(set.publicBoundary==='private'?'公开活动的安排缩小了，私人见面的日期仍然留着。':'对外能说的内容缩成几句，私人聊天仍留在当事人之间。',
    line(close,set.publicBoundary==='private'?'这次我可以只想自己愿不愿意来，不用先想镜头。':'需要提到我的部分，先让我自己看过。','warm'));
  if(set.partnerCareer&&isPaired)return world('两个人的工作安排并排放好，谁也没有把自己的那张收起来。',
    line(name,set.partnerCareer==='protected'?'这个机会我想认真试。你答应腾出的那段时间，对我很重要。':'各自忙的时候也先告诉对方，别只剩互相猜。','hopeful'));
  if((set.carePlan&&Number(after.lastResult?.year)===2012)||set.careBalance)return world('下一次探望的日期写好了，仍有几件事等当事人自己决定。',
    line('Jeff',set.carePlan==='personal'?'你多跑几次我知道，但撑不住时别等到最后才说。':set.carePlan==='community'?'他们不愿意的部分先留着，别把照顾变成催他们答应。':'谁临时有事就提前说，别再等到谁撑不住才换班。','warm'));
  if(set.carePlan)return world('交接的事项有了明确时间和接手的人，临时变化也要重新商量。',
    line(life.children==='parent'?'照护伙伴':'接手的朋友','这次按说好的来，之后需要调整就提前联系。','warm'));
  if(life.children==='parent'&&(set.parenting||set.familyEmployment||set.childIndependence))return world(adults?'孩子收起自己的计划，没有等你替他写最后一个决定。':'孩子把说到一半的事情继续讲完，暂时没有再把纸藏起来。',
    line('景安',set.parenting==='guide'?'我会听你的意见，但也想试试自己的办法。':'谢谢你先听完。需要帮忙的那部分，我会自己告诉你。',set.parenting==='guide'?'tense':'hopeful'));
  if(set.familyExposure||set.familyPact)return world('预算纸从梦想清单旁边移开，变成了一份需要定期重看的约定。',
    line(close,set.familyExposure==='capped'||set.familyPact==='shared_risk'?'我愿意支持这一段，但之后有变化要早点告诉我。':'留下的日常开支，之后别又当成随时可以拿走的钱。','tense'));
  if(set.hobby||set.hobbyPractice||set.lateLifeFocus==='hobby')return world('练习用的东西被放在容易拿到的位置，第一次不太熟练的尝试已经留下。',
    line(close,set.hobbyPractice==='dormant'?'那我们先不等你这一轮。有空的时候，记得自己来问。':'做得普通也没关系，下次想来就提前约。',set.hobbyPractice==='dormant'?'tense':'wry'));
  if(set.socialPractice||set.familyPractice)return world('通讯录里多了一个明确日期，下一次联系不必再等到谁有难处。',
    line(close,set.socialPractice==='mentoring'?'你答应的这几次，我会认真准备。之后我也得自己试。':'这次时间说清了，我也好安排自己的事。','warm'));
  const bonds=(after.stats?.bonds||0)-(before.stats?.bonds||0);
  if(bonds<0)return world('话说完后，对方没有立刻接话，自己的安排仍留在手边。',line(close,'我听到了。我的这部分，也需要你认真听。','tense'));
  return world('门外的日常还在继续，这一次谈话留下一项真正需要兑现的安排。',line(close,'先把这一次做好，后面的事我们再谈。','hopeful'));
}

function careerFeedback(before,after,option) {
  const c=careerRole(before),quality=after.lastResult?.quality||'good',effects=after.lastResult?.effects||{};
  const title=option.title||'',text=after.lastResult?.text||'';
  if(before.step===0)return quality==='bad'
    ?world('老师把书重新翻到开头，同桌还没有走。',line('汤姆','刚才那句我也没懂，我们从这里再来。','warm'))
    :quality==='mixed'?world('书签停在还没读顺的那一段，晚饭铃已经响了。',line('汤姆','今天先记住这一句，下次别从头硬背。','hopeful'))
      :world('书和家书都收好了一部分，走廊的灯刚亮。',line('Jeff',effects.energy>0?'今晚看起来没那么累了，走吧，去吃饭。':'先去吃饭，剩下那一点明天还在。','warm'));
  if(before.step===1)return quality==='bad'
    ?world('补送的餐盘终于端出去，艾迪也晚走了一会儿。',line('艾迪','出错就喊我，别等到整桌都在催。','tense'))
    :effects.money>=8?world('零钱落进口袋，围裙口袋里的作业纸还皱着。',line('领班玛丽','这班辛苦了。下周别把能来的时间写得太满。','warm'))
      :world('交接纸贴在出餐口，下一个班的人已经过来读。',line('艾迪','这个顺序我看懂了，下回不用每次都喊你。','hopeful'));
  if(before.step===2)return world(c.place,
    line(c.peer,after.route==='researcher'?'你留下来追这个问题，我想看看后来到底能不能跑通。':'到了新地方也报个平安。那些一起排过的错，别忘了。','hopeful'));
  if(/退休|颐养|退出|交接|交出|不再扩|一周两天|停下新增|终止|停止/.test(title))return world(c.place,
    line(c.peer,/交|退休|颐养|退出/.test(title)?'你交过来的这部分，我会自己负责。剩下说好的事也请按时收尾。':'少做一点可以，但留下的承诺要让我们知道具体还有哪些。','tense'));
  if(/教|学术|课程|研究助理/.test(title)&&before.step>=12)return world('黑板上的新问题还没擦，下一次准备的资料已经有人带来。',
    line('合作研究者','从前的经验可以讲，这一次的结论还是要一起检验。','hopeful'));
  if(/传记|回忆|书稿/.test(title))return world('编辑在一处失败经历旁画了圈，先没有翻到后面的成功。',line('编辑','这一段别急着写漂亮，你当时究竟知道多少？','tense'));
  if(/爱好|新手|练习/.test(title)&&before.step>=12)return world('第一次练习留下了不太熟练的痕迹，下一节课还在同一个时间。',line('一起练习的人','别急着教我们，你这一遍也刚开始。','wry'));
  if(quality==='bad')return world(before.step===5?'电话那头挂断后，屋里一时没人继续敲键盘。工资和开支的日期仍摆在桌边。':c.place,
    line(c.client,/拒|不|没|失败|撤|停|未/.test(text)?'这次没能按预期走，后面还能做到的部分要重新说清。':'结果摆在这里，我们需要一个能实际收尾的安排。','tense'),
    line(c.peer,effects.energy<=-8?'人已经很累了，别再用下一个通宵顶这一个。':'先把问题留下，别急着把它写成已经过去。','tense'));
  if(quality==='mixed')return world('一部分结果被勾上，剩下的空格没有被划掉；会议比原定多开了一会儿。',
    line(c.peer,'做成的这一段我们认，没做完的也别又藏进下一轮。','tense'),
    line(c.client,'先按已经确认的范围继续，别替剩下的部分提前保证。','tense'));
  if(effects.bonds<0||effects.stress>=10)return world(c.place,
    line(c.peer,effects.bonds<0?'这次结果好看，但刚才那件事我还没同意就算过去。':'结果出来了，可大家不是明天就能自动恢复体力。','tense'));
  if(effects.control<=-5||/交给|共同|轮流|带新人|授权/.test(title))return world('任务板上出现不止一个负责人的名字，有人拿起笔改了自己那一段。',
    line(c.peer,'这一段交给我之后，就让我按实际情况作决定。','hopeful'));
  if(/不|边界|缩|只|质量|复核|验证|暂停/.test(title)&&effects.money<=0)return world('有些机会从排期上划掉，留下的工作开始有了能完成的范围。',
    line(c.client,'范围比刚才小，我至少知道这次可以等到什么。','tense'));
  if(effects.money>0)return world(c.place,
    line(c.peer,'资源这次接上了，下一轮先把人手和休息排进去。','hopeful'),
    line(c.client,'我们愿意接着谈，后面的日期还得一项项确认。','tense'));
  return world(c.place,line(c.peer,effects.engineering>0?'这一段现在有了依据，下一个问题还是要重新测。':'今天答应的安排我记下了，之后需要变化就早点说。','hopeful'));
}

export function getWorldFeedback(before,after,option,scene) {
  if(before?.dynamicsEdition!==EDITION||!after||!option)return {reactions:[],environment:''};
  if(before.phase==='prep')return preparation(before,option);
  const outcome=Array.isArray(option.outcomes)?option.outcomes[after.lastResult?.outcomeIndex??0]:undefined;
  const specific=clean(outcome?.feedback)||clean(option.feedback);
  if(specific)return specific;
  return before.phase==='life'||after.lastResult?.kind==='life'
    ?lifeFeedback(before,after,option,scene):careerFeedback(before,after,option,scene);
}
