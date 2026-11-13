// Absurd science-fiction portraits change presentation only. A goal selected
// in 2028 is not a completed 2036 outcome, and it never changes personality.
export const IF_CARD_ART = Object.freeze({
  nightlife: { id:'if-card-nightlife', src:'./assets/portraits/if-card-nightlife-v1.webp', alt:'黄二勋顶着凌乱银发，抱着迷你霓虹舞台，夸张地打着拍子' },
  research: { id:'if-card-research', src:'./assets/portraits/if-card-research-v1.webp', alt:'黄二勋眯起一只眼，拿着冒出怪光的小型计算原型' },
  rival: { id:'if-card-rival', src:'./assets/portraits/if-card-rival-v1.webp', alt:'黄二勋抱着新团队的工具箱，挂着过大的空白工牌，一脸跃跃欲试' },
  president: { id:'if-card-president', src:'./assets/portraits/if-card-president-v1.webp', alt:'黄二勋抱着过高的空白预算文件，伸手准备回答公民的问题' },
  solar: { id:'if-card-solar', src:'./assets/portraits/if-card-solar-v1.webp', alt:'黄二勋托着巴掌大的海上太阳能平台模型，认真得有些滑稽' },
});

const completedOutcomes = {
  nightlife: ['success','partial'],
  research: ['niche_won','validated','partial'],
  rival: ['niche_won','hired','partial'],
  // This portrait has no crown, sash, flag or office insignia. The civic
  // outcome is public service, and must not be described as an election win.
  president: ['elected','civic'],
  solar: ['network','pilot','partial'],
};

export function getIfCardArt(state, report = null) {
  if (!state || state.phase !== 'ended' || state.step !== 15 || state.endReason
    || state.choicePlanEdition !== '2026.11.plans' || !state.flags?.if_2026_layoff
    || report?.early || report?.decisionCount === 0 || report?.ifEpilogue?.tragedy
    || state.flags.if_pivot_academic || state.flags.if_pivot_ordinary) return null;
  const last = state.journal?.at(-1);
  if (last?.step !== 15 || Number(last.year) !== 2036) return null;
  const match = /^if-2036-career-(nightlife|research|rival|president|solar)-upgrade$/.exec(last.optionId || '');
  if (!match) return null;
  const key = match[1], flags = state.flags;
  if (!flags['if_route_' + key] || flags['if_final_' + key + '_failure'] || state.lastResult?.outcomeIndex === 2) return null;
  if (!completedOutcomes[key].some(suffix => flags['if_final_' + key + '_' + suffix] === true)) return null;
  return { ...IF_CARD_ART[key] };
}
