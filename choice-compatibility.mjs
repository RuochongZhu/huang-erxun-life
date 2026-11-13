// Semantic permission only. The engine owns edition gating, resource limits,
// weighting and the one shared outcome tier. A pair is allowed only after its
// actions and all corresponding outcome tiers have been reviewed together.
const sceneId = (step, index) => `scene-${String(step + 1).padStart(2, '0')}-c${index}`;
const rules = (step, entries) => entries.map(([left, right, reason]) => ({
  step,
  ids: [left, right].map(value => typeof value === 'number' ? sceneId(step, value) : value),
  reason,
}));

export const PRIMARY_COMPATIBILITY_RULES = Object.freeze([
  ...rules(1, [
    [1, 'impact-1978-career-bell-code', '接下高峰班，同时在与艾迪的交接中试用餐台暗号。'],
    [2, 'impact-1978-career-bell-code', '仍只承担两班，在已约定的班次内改进交接。'],
    [3, 'impact-1978-career-bell-code', '固定班次与交接单不变，暗号只补充你和艾迪的沟通。'],
  ]),
  ...rules(3, [
    [1, 4, '技术对照验证与岗位竞聘分别进行，实验结果不会保证升职。'],
    [1, 5, '做技术对照，同时把岗位职责留在关键设计与评审。'],
    [1, 6, '继续对照验证，并和搭档分清技术、排期与值守。'],
    [2, 4, '交清学业和现有工作，同时申请下一阶段的管理职责。'],
    [2, 5, '完成当前承诺，同时谈清下一阶段的专家职责。'],
    [2, 6, '把当前承诺收尾，再用共同负责的安排分担后续工作。'],
    [3, 5, '只做一个有限演示，同时选择技术专家职责；不把演示当完整验证。'],
    [3, 6, '保留有限演示的范围，同时分清搭档的值守与签字责任。'],
    [5, 'impact-1992-career-empty-chair', '保留技术主责，也让实际做出成果的搭档完整汇报。'],
    [6, 'impact-1992-career-empty-chair', '共同承担工作，并在汇报时把发言机会交给搭档。'],
  ]),
  ...rules(5, [
    [1, 2, '承认旧方案的问题后，只争取并验证可交付的过渡样机，不宣称原架构已经正确。'],
    [1, 4, '先说明路线问题，再把旧范围的结算与新接口分开处理。'],
    [1, 5, '坦陈路线问题，同时提出按样品验收分段支持的条件。'],
    [1, 6, '说明旧路线的问题，并把后续技术投入转向通用规范。'],
    [2, 5, '过渡样机是阶段验收对象；开工前的预款与验收后的结算分别确认。'],
    [4, 5, '结束旧范围后，下一轮只按一个样品分阶段争取支持。'],
    [4, 6, '合同上结束旧范围，技术上停止为旧接口增加人手。'],
    [5, 6, '新规范只先做可验证的样品，后续支持仍取决于阶段验收。'],
    [4, 'impact-1996-career-failure-room', '共同划掉做不到的部分，同时结清旧承诺与收尾范围。'],
    [6, 'impact-1996-career-failure-room', '公开检视失败，再把人手从旧接口转到新的验证。'],
  ]),
  ...rules(6, [
    [2, 6, '只交已经通过的范围，并由独立测试负责人决定放行。'],
    [3, 6, '接受延期与轮休，同时把质量签字交给测试负责人。'],
    [4, 6, '小批验证与独立放行配合；失败的批次仍需停下返工。'],
    [5, 6, '预订的是下一批窗口，当前批次仍必须经过质量放行。'],
    [3, 'impact-1997-career-red-button', '留出延期和恢复时间，也让测试员能实际叫停未通过的交付。'],
    [5, 'impact-1997-career-red-button', '未来的排期可以先谈，未过关的当前批次仍由测试员叫停。'],
  ]),
  ...rules(7, [
    [1, 4, '亲自展示争取支持，同时把客户优先权限定在明确期限内。'],
    [1, 6, '负责对外展示，同时让各项目负责人接过预算与交付。'],
    [2, 4, '由实际负责人讲成果，优先合作的期限与验收另行谈判。'],
    [2, 5, '让做出成果的人发言，同时保留多方使用与合作的空间。'],
    [2, 6, '把台前发言与台后的预算权限一起交给实际负责人。'],
    [3, 4, '在小范围会议中讲清能力，再谈有期限的优先安排。'],
    [3, 5, '分别向少数合作方确认能力，不把全部资源交给一家。'],
    [3, 6, '控制展示与承诺的范围，同时明确各项目的签字人。'],
    [4, 6, '客户优先安排由合同约束，内部交付由项目负责人承担。'],
    [5, 6, '多家合作共用规则，各项目的负责人处理排期和预算。'],
  ]),
  ...rules(8, [
    [1, 5, '继续工具投入，并通过直接技术评审处理试用中暴露的问题。'],
    [1, 6, '投入工具与文档，同时把日常试验预算分给各负责人。'],
    [2, 5, '暂停长线维护，仍可改进现有工作中的跨组技术评审。'],
    [2, 6, '本季优先兑现现有承诺，日常预算由负责人在限额内处理。'],
    [4, 5, '工具维护有专人排期，跨组技术问题进入共同评审。'],
    [4, 6, '设立共用维护团队，同时给各组明确的试验预算。'],
    [5, 6, '技术评审减少转述，日常预算下放；两项权限分别写清。'],
    [6, 'impact-2007-career-wild-lab', '给小队一个月的有限试验，并让负责人在预算上限内决定做法。'],
  ]),
  ...rules(9, [
    [1, 4, '先从旧任务中腾出资源，再用有限预算支持复现。'],
    [3, 4, '两条路线都只做有限试验，研究合作承担其中的复现工作。'],
    [1, 'impact-2012-career-skeptic-seat', '腾出机时以后，仍让质疑者检查新方向的证据。'],
    [3, 'impact-2012-career-skeptic-seat', '给两个小实验相同截止线，并邀请质疑者比较结果。'],
    [5, 'impact-2012-career-skeptic-seat', '保留两支小队，也让反对意见进入同一轮技术评审。'],
  ]),
  ...rules(10, [
    [1, 4, '开放一部分资源，并与研究伙伴一起验证系统与维护方法。'],
    [1, 6, '保留开放合作，同时安排系统整合与故障维护的人手。'],
    [2, 6, '给付费客户约定独家范围，同时承担对应的系统集成与售后。'],
    [3, 4, '研究合作继续验证，由下一位负责人组织首轮试用。'],
    [3, 5, '通过共享服务提供资源，首轮名单与反馈由接手者组织。'],
    [3, 6, '安排系统维护，也把试用排期与对外答复交给下一位负责人。'],
    [4, 6, '共同验证系统，同时保留承担集成与长期维护的岗位。'],
  ]),
  ...rules(11, [
    [1, 4, '申请下一轮项目，同时分阶段确认设备、产能或服务窗口。'],
    [1, 6, '亲自投入下一轮方向，把日常预算与排期交给试任负责人。'],
    [2, 3, '分批交接日常决定，也给自己的生活保留固定时间。'],
    [2, 4, '交接日常工作，同时由明确负责人跟进分阶段采购安排。'],
    [2, 5, '先把质量与维护问题修好，再按交接安排分担日常工作。'],
    [3, 5, '暂缓扩张与补做验证，并减少挤占私人时间的新承诺。'],
    [3, 6, '把日常安排交出去，同时落实固定的私人时间。'],
    [4, 6, '设备与服务按阶段预订，日常预算与调度也有接手者。'],
    [5, 6, '接受质量复核带来的延期，并让下一位负责人处理日常调度。'],
    [5, 'impact-2024-career-live-failure', '先修未通过的项目，也向使用者公开这次验证与修复过程。'],
  ]),
  ...rules(12, [
    ['layoff-2026-handoff', 'layoff-2026-records', '交清无争议的工作与款项，同时保留材料处理尚有分歧的结算。'],
    ['layoff-2026-handoff', 'layoff-2026-transition', '原岗位完成交接，收尾工作另签有期限的合同。'],
    ['layoff-2026-records', 'layoff-2026-transition', '旧岗位的结算分歧继续核对，新收尾合同按独立范围履行。'],
  ]),
  ...rules(13, [
    ['layoff-2028-apply', 'affair-2028-career-disclose-conflict', '申请新岗位，同时披露个人纪录片合作的关联；任职结果与独立评审分别处理。'],
    ['layoff-2028-small-work', 'affair-2028-career-disclose-conflict', '用自己的技能接小单，同时退出存在私人关联的合作评审。'],
    ['layoff-2028-academic', 'affair-2028-career-disclose-conflict', '申请教学或研究合作，同时把个人合作关联交由独立人员评审。'],
    ['bond-2028-career-small-restart', 'affair-2028-career-disclose-conflict', '按已经约定的有限帮助试报价，同时披露另一个个人项目的关联。'],
  ]),
  ...rules(14, [
    ['layoff-2032-technical-work', 'affair-2032-career-disclose-conflict', '谈清技术工作，同时回避存在私人关联的个人合作选择。'],
    ['layoff-2032-product', 'affair-2032-career-disclose-conflict', '验证小产品的实际需求，同时让独立人员处理个人纪录片合作。'],
    ['layoff-2032-teaching', 'affair-2032-career-disclose-conflict', '履行有限教学合作，同时把个人项目的关联如实交代。'],
    ['bond-2032-career-delivery', 'affair-2032-career-disclose-conflict', '按既有生活分工完成小批交付，同时回避另一份关联项目的评审。'],
  ]),
].map(rule => Object.freeze({ ...rule,
  ids: Object.freeze(rule.ids), id: `pair:${rule.ids.join('+')}`,
})));

const FINAL_FLAGS = new Set(['future_keep_building', 'future_comeback', 'future_retire',
  'future_academic', 'future_hobby', 'future_memoir']);
const hasFinalFlag = option => [...(option.flags || []),
  ...(option.outcomes || []).flatMap(outcome => outcome.flags || [])].some(flag => FINAL_FLAGS.has(flag));
const samePair = (a, b) => a.length === 2 && b.length === 2 && a.every(id => b.includes(id));

function conflictReason(step, ids) {
  const has = index => ids.includes(sceneId(step, index));
  const named = suffix => ids.some(id => id.endsWith(suffix));
  if (named('secret-contract') && named('disclose-conflict')) return '不能同时隐瞒关联，又声称已经完整披露并退出评审。';
  if (step === 2) return 'AMD、LSI 与校园研究是不同的去向；一次只能接受一套入职或研究安排。';
  if (step === 3 && [4, 5, 6].filter(has).length > 1) return '主管、技术专家与共同负责采用不同的职责安排，这一轮只能确定其中一套。';
  if (step === 3 && has(1) && has(3)) return '两晚完整对照与只做一晚小演示是同一项工作的不同投入范围，不能重复结算。';
  if (step === 3 && named('credit') && named('empty-chair')) return '不能把成果只记在自己名下，同时又把完整汇报与署名交给搭档。';
  if (step === 4) return '创业、留职与工作室各有一套启动承诺；同一轮不能叠加两份去向或重复成立团队。';
  if (step === 5 && has(3)) return '一项已经退出或撤下原项目，另一项仍在为该项目谈后续投入；先确定是否继续。';
  if (step === 5 && has(2) && (has(4) || has(6) || named('failure-room'))) return '过渡样机要继续使用旧方案，另一项则停止旧范围或旧接口，两项技术安排相反。';
  if (step === 5 && named('quiet-bad-news') && (has(1) || has(4) || has(6) || named('failure-room'))) return '不能隐去同一份失败记录，又以完整披露问题为前提重谈路线。';
  if (step === 6 && has(1)) return '按原窗口发完整版本，与限量、延期或质量叫停的承诺不能同时成立。';
  if (step === 6 && named('ship') && (has(6) || named('red-button'))) return '选择性展示并报成完成，与让测试人员叫停未通过交付的规则冲突。';
  if (step === 7 && ((has(1) && has(2)) || (has(2) && named('chair-mic')))) return '这一场展示不能既由你接过主讲，又把同一段完整发言交给实际负责人。';
  if (step === 7 && has(5) && (has(4) || named('one-whale'))) return '优先或集中给一家，与把这一批资源按共同规则分给多方，是不同的合作承诺。';
  if (step === 8 && has(3)) return '退出当前产品或管理职责后，不能同时替原团队决定继续投资与组织权限。';
  if (step === 8 && has(2) && (has(1) || has(4))) return '一项暂停长线维护，另一项为同一项维护持续配置预算与人手。';
  if (step === 8 && has(6) && named('everything-mine')) return '所有决定都先由你批准，与负责人在预算内独立决定，采用相反的审批规则。';
  if (step === 9 && ((has(2) && has(6)) || (has(3) && has(5)))) return '这两项重复安排同一批旧项目或双轨试验，不能当成两份独立成果计入。';
  if (step === 9 && has(2)) return '保留旧方向的本轮排期，与同时抽走或分摊同一批设备和人手的承诺冲突。';
  if (step === 9 && has(6)) return '先完成旧方向并让新方向等候，不能同时把这一轮排期算给新的双轨或复现投入。';
  if (step === 10 && has(2) && (has(1) || has(4) || named('free-world'))) return '这一批资源和成果不能既授予独家，又承诺开放给其他研究使用者。';
  if (step === 10 && has(5) && has(6)) return '通过伙伴共享服务与自行承担整套集成维护，当前选项没有划分各自的交付范围。';
  if (step === 11 && has(2) && has(6)) return '两项都在安排同一次日常权限交接，不能重复任命或重复计算交接成果。';
  if (step === 11 && has(4) && has(5)) return '先锁定扩量窗口与先撤回未验证的量，需要不同的采购排期，当前没有一份共同方案。';
  if (step === 11 && has(5) && named('presale')) return '明知交期没有把握仍先承诺，与主动推迟并如实说明验证限制相冲突。';
  if ([13, 14].includes(step)) return '这些选项会重新确定任职、创业或教学身份，当前没有可同时履行的两份工作范围。';
  if (step === 12) return '这两项对离场后的工作与恢复时间有不同安排，当前没有可同时执行的交接方案。';
  return '这两项没有经过核对的共同执行范围；可能重复计算同一份工作，或给出相互冲突的承诺。';
}

export function getPrimaryCompatibility(state, optionIds, scene) {
  const reject = (reason, canonicalIds = []) => ({ compatible: false, reason, canonicalIds });
  if (!Array.isArray(optionIds) || optionIds.some(id => typeof id !== 'string' || !id)) return reject('主决定记录不正确。');
  if (!optionIds.length) return reject('请先选择一项主决定。');
  if (new Set(optionIds).size !== optionIds.length) return reject('同一项主决定不能重复选择。');
  const phase = state?.phase;
  const options = phase === 'life' ? scene?.options : phase === 'prep' ? scene?.prep : phase === 'choice' ? scene?.choices : [];
  if (!Array.isArray(options) || optionIds.some(id => !options.some(option => option.id === id))) return reject('找不到当前阶段的主决定。');
  const selected = options.filter(option => optionIds.includes(option.id));
  const canonicalIds = selected.map(option => option.id);
  if (selected.length === 1) return { compatible: true, reason: '', canonicalIds };
  if (selected.length > 2) return reject('一轮最多组合两项事业主决定。', canonicalIds);
  if (phase !== 'choice') return reject(phase === 'life'
    ? '关系、居住与家庭承诺不能同时按两套主安排结算；生活阶段仍选一项主决定。'
    : '两项准备都占用同一段准备时间；准备阶段仍选一项主决定。', canonicalIds);
  if (state.step === 15 || selected.some(hasFinalFlag)) return reject('终章需要确定一条最终去向，不能同时结算两种人生结局。', canonicalIds);
  if (canonicalIds.some(id => id.startsWith('if-'))) return reject('这条 IF 路线会改变身份与后续去向，必须单独决定，不能与另一条事业路线各走一半。', canonicalIds);
  const rule = PRIMARY_COMPATIBILITY_RULES.find(item => item.step === state.step && samePair(item.ids, canonicalIds));
  if (!rule) return reject(conflictReason(state.step, canonicalIds), canonicalIds);
  return { compatible: true, reason: rule.reason, canonicalIds, ruleId: rule.id };
}

export function getCompatiblePrimaryPairs(state, scene) {
  if (state?.phase !== 'choice') return [];
  return PRIMARY_COMPATIBILITY_RULES.filter(rule => rule.step === state.step).flatMap(rule => {
    const match = getPrimaryCompatibility(state, rule.ids, scene);
    return match.compatible ? [{ ids: match.canonicalIds, ruleId: match.ruleId, reason: match.reason }] : [];
  });
}
