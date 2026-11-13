// Result nicknames describe this run's ending × existing score band.
// They never change scores, save data, probabilities, or personality evidence.
export const SCORE_BANDS = Object.freeze([
  { id: 'D', min: 0, max: 429, label: '人间补丁包', edition: '战损版', quip: '生活弹了不少报错，你把这一局的日志留了下来。' },
  { id: 'C', min: 430, max: 579, label: '缝补小能手', edition: '补丁版', quip: '这边刚补好，那边又漏风。好在胶带还没用完。' },
  { id: 'B', min: 580, max: 719, label: '稳住选手', edition: '耐玩版', quip: '没把人生玩成速通，倒是摸出了自己的存档点。' },
  { id: 'A', min: 720, max: 849, label: '多边形战士', edition: '高配版', quip: '好几条进度条都挺能打，偶尔也允许自己掉一格。' },
  { id: 'S', min: 850, max: 1000, label: '人生开挂玩家', edition: '开挂版', quip: '这局的积累高得像开挂，回放里却都是你做过的选择。' },
].map(Object.freeze));

// Explicit, stable IDs: distinct outcomes keep distinct names, even at one score.
const rows = [
  ['company', 'BOSS', '公司永动机', '别人下班关电脑，你下班给公司续航。'],
  ['ecosystem', 'ROOT', '生态种树人', '种下去的是工具，长出来的是一群会自己折腾的人。'],
  ['employee', 'DEBUG', '工单终结者', '宏大叙事先放旁边，这个报错今天得修。'],
  ['studio', 'SOLO', '一人有限公司', '老板是你，员工是你，催款的还是你。'],
  ['researcher', 'WHY', '问题繁殖户', '解决一个问题，顺手给下一届留下三个。'],
  ['sold', 'SOLD', '工牌前任', '签字把公司交出去，日历终于可以重新认领。'],
  ['life', 'HOME', '晚饭钉子户', '会议可以延期，今晚这双筷子必须有人拿。'],
  ['future_keep_building', 'BUILD', '退休绝缘体', '退休申请写到一半，你又在背面画了个方案。'],
  ['future_comeback', 'REBOOT', '人生重启器', '旧剧本合上，新事业又开了机。'],
  ['comeback_unfinished', 'STOP', '重启后刹车员', '重开过，也试过。停机键同样是你亲手按的。'],
  ['comeback_small', 'SHOP', '小店二周目', '没有王者归来的烟花，先把今天这单做好。'],
  ['comeback_project', 'SEED', '小项目孵化员', '先养活手里这个小项目，传奇下次再排期。'],
  ['future_retire', 'OFF', '退休执行官', '终于有一个日程：今天不安排日程。'],
  ['future_academic', 'PAPER', '学术回锅肉', '带着一身故事回校园，发现不会的题还是不会。'],
  ['future_hobby', 'NOOB', '高龄萌新', '资历放门口，这个爱好请从新手教程教起。'],
  ['future_memoir', 'MEMO', '回忆录话痨', '这一生讲不完，只好再加一章。'],
  ['nightlife_success', 'RAVE', '夜场永动机', '旧工牌已经熄灭，你负责把舞台点亮。'],
  ['nightlife_partial', 'GIG', '小舞台显眼包', '整座城没包下来，小舞台也能站得很认真。'],
  ['nightlife_failure', 'RAIN', '雨天撤场员', '演出没开成，散场的账却一笔也没缺席。'],
  ['nightlife_bounded', 'NIGHT', '准点散场人', '夜生活可以有，包下整座城就免了。'],
  ['nightlife_memoir', 'SETLIST', '夜场野史官', '不再包场，改把那几夜写进书里。'],
  ['research_global', 'CHIP', '显卡掀桌人', '这回真把对手的桌子掀动了，风扇还是一样吵。'],
  ['research_niche_won', 'NICHE', '细分赛道刺客', '没拿下全世界，但这一个场景你真赢了。'],
  ['research_validated', 'PROOF', '原型转正员', '终于不只在自己电脑上能跑，世界大战以后再说。'],
  ['research_partial', 'BETA', '局部领先人', '有一项指标很争气，其他指标表示还要开会。'],
  ['research_failure', 'LOG', '实验日志收藏家', '翻盘没有成功，失败记录倒是写得明明白白。'],
  ['research_bounded', 'ARCHIVE', '样片封存员', '停止追加预算，把有用的部分交给下一双手。'],
  ['research_memoir', 'LABBOOK', '实验室说书人', '芯片没法替你开口，实验笔记可以。'],
  ['rival_niche_won', 'RED', '对家上分王', '换个队伍拿下一单，咖啡机依然不认人。'],
  ['rival_hired', 'BADGE', '工牌转生者', '创始人光环先卸载，新工牌已经能刷开门。'],
  ['rival_partial', 'TASK', '限量版打工人', '职责书只有这么长，宇宙暂时不归你管。'],
  ['rival_failure', 'CV', '简历漂流瓶', '这一轮没谈成，履历还在下一站的路上。'],
  ['rival_bounded', 'SCOPE', '工位边界大师', '只接说得清的小任务，剩下的竞争请另请高明。'],
  ['rival_memoir', 'BADGEBOOK', '工牌编年史家', '换过的工牌，够给回忆录编个目录。'],
  ['president_elected', 'PRES', '总统跨界王', '前一份工牌失效，下一份工作竟然是总统。'],
  ['president_civic', 'CIVIC', '社区技术外援', '总统还没当上，服务站先多了一双能干活的手。'],
  ['president_lost', 'VOTE', '落选演讲家', '选票没够，承诺过的事还得接着交代。'],
  ['president_pending', 'QUEUE', '候选资格排队员', '海报先别印，资格申请还在等叫号。'],
  ['president_failure', 'BALLOT', '竞选收尾队长', '胜选演讲没用上，结账清单倒是一页不少。'],
  ['president_denied', 'VISA', '总统梦退件人', '头衔停在草稿里，退回的申请倒是正式版。'],
  ['president_bounded', 'LOCAL', '公共事务搭把手', '收起总统计划，先帮上眼前能帮的忙。'],
  ['president_memoir', 'POLIT', '总统梦执笔人', '愿望与实绩分开写，书稿总算不用参加竞选。'],
  ['solar_city', 'CITY', '海上机房包租公', '蓝图真的浮在海上了，下一页是维护排班表。'],
  ['solar_network', 'GRID', '海上插排队长', '离一座城还早，这几处节点已经通了电。'],
  ['solar_pilot', 'PLUG', '一座平台守夜人', '城市鸟瞰图先收起来，脚下这盏灯是真的。'],
  ['solar_partial', 'SHORE', '岸边机房掌柜', '浮城缩了水，岸上的服务器还在接单。'],
  ['solar_failure', 'TIDE', '浮城收摊员', '城没浮起来，回收设备和账单得先上岸。'],
  ['solar_bounded', 'DOCK', '浮城计划刹车员', '蓝图可以很大，追加预算的笔先放下。'],
  ['solar_memoir', 'SHIPLOG', '浮城航海书记', '没兑现的城市不补画，把真走过的航线写下来。'],
  ['early', 'SAVE', '中途存档侠', '故事先存到这里，下次开机再说。'],
  ['open', 'BOOKMARK', '人生书签人', '这一页折个角，后面的空白先留着。'],
  ['empty', 'LOADING', '片头逗留员', '片头看完了，第一步还没按下去。'],
  ['tragedy', 'UNFINISHED', '未完之页', '这一页记录失去，也记得此前整段生活。'],
  ['other', 'WANDER', '自定义路线人', '这一程的走法，留在你自己的记录里。'],
];
export const ENDING_LABELS = Object.freeze(Object.fromEntries(rows.map(([id, code, label, quip]) =>
  [id, Object.freeze({ id, code, label, quip })])));

export function getScoreBand(score) {
  if (!Number.isFinite(score) || score < 0 || score > 1000) return null;
  return SCORE_BANDS.find(band => score >= band.min && score < band.max + 1) || null;
}

function endingKey(state, report) {
  const f = state.flags || {};
  if (report.ifEpilogue?.tragedy) return 'tragedy';
  if (!report.decisionCount) return 'empty';
  if (report.ifEpilogue?.kind === 'open') return 'open';
  // Only a settled IF epilogue can select these outcomes. Earlier success flags
  // never promote an unfinished run into a completed victory.
  const path = { nightlife: 'nightlife', research: 'research', rival: 'rival', president: 'president', 'solar-city': 'solar' }[report.ifEpilogue?.kind];
  if (path) {
    const has = suffix => f[`if_final_${path}_${suffix}`] === true;
    if (has('memoir')) return `${path}_memoir`;
    if (has('bounded')) return `${path}_bounded`;
    if (path === 'research' && has('niche_won') && f.if_research_prototype && f.if_research_verified) return 'research_global';
    if (path === 'solar' && has('network') && f.if_solar_pilot && f.if_solar_operating) return 'solar_city';
    if (path === 'president' && has('partial')) return f.if_president_eligible ? 'president_lost' : 'president_pending';
    if (path === 'president' && has('failure')) return f.if_president_eligible ? 'president_failure' : 'president_denied';
    for (const suffix of ['success', 'niche_won', 'validated', 'hired', 'elected', 'civic', 'network', 'pilot', 'partial', 'failure']) {
      if (has(suffix) && ENDING_LABELS[`${path}_${suffix}`]) return `${path}_${suffix}`;
    }
  }
  const id = report.ending?.id;
  if (id === 'future_comeback') {
    if (f.future_comeback_unfinished) return 'comeback_unfinished';
    if (f.future_comeback_small) return 'comeback_small';
    if (!(f.future_restart_plan && (f.future_rebuilt_product || f.future_rebuild_small))) return 'comeback_project';
  }
  return Object.hasOwn(ENDING_LABELS, id) ? id : report.early ? 'early' : 'other';
}

export function getResultLabel(state, report) {
  const ending = ENDING_LABELS[endingKey(state, report)];
  const unscored = ending.id === 'tragedy' || ending.id === 'empty';
  const band = !unscored && report.lifeScore?.maxScore === 1000 ? getScoreBand(report.lifeScore.score) : null;
  const provisional = ending.id !== 'tragedy' && (ending.id === 'empty' || !!report.early || !!report.lifeScore?.provisional);
  const code = `${ending.code}${band ? `-${band.id}` : ''}${provisional ? '-P' : ''}`;
  return {
    id: `${ending.id}:${band?.id || 'unscored'}${provisional ? ':partial' : ''}`,
    code, title: band ? `${band.edition}·${ending.label}` : ending.label,
    quip: ending.quip, ending, band, provisional,
    outcome: report.ifEpilogue?.title || report.ending?.title || '',
    note: ending.id === 'tragedy' ? '特殊叙事结局，不参与分段。'
      : ending.id === 'empty' ? '还没有选择记录，暂不分段。'
        : !band ? '本局没有可用总分，仅按已有结局命名。'
          : provisional ? '按这一程已发生的结局与分数暂定，P 表示阶段称号。'
            : '结局决定称呼，分数决定版本；只描述这局怎么玩。',
  };
}
