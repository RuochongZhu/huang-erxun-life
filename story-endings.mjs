import { isExpandedStory, getStepCount } from './story-timeline.mjs';

const ENDINGS = [
  ['future_keep_building', '持续奋斗', '继续做事，也接受不必事事亲自决定'],
  ['future_comeback', '东山再起', '从一项重新起步的事业继续往前走'],
  ['future_retire', '颐养天年', '把时间留给自己和愿意同行的人'],
  ['future_academic', '回到学术界', '重新做研究、带学生、面对不知道的问题'],
  ['future_hobby', '七十三岁的新爱好', '从初学者开始，不急着证明什么'],
  ['future_memoir', '把这一生写下来', '留下自己的经历，也尊重别人的隐私'],
];

export function getFutureEnding(state, original) {
  if (!isExpandedStory(state) || state.journal.length < getStepCount(state)) return original;
  const ending = ENDINGS.find(([flag]) => state.flags[flag]);
  if (!ending) return original;
  const [id, title, subtitle] = ending;
  const rebuilt = state.flags.future_restart_plan && (state.flags.future_rebuilt_product || state.flags.future_rebuild_small);
  const actualTitle = id === 'future_comeback' && state.flags.future_comeback_unfinished
    ? '重来过，也懂得停下'
    : id === 'future_comeback' && state.flags.future_comeback_small ? '重新开张，慢慢站稳'
    : id === 'future_comeback' && !rebuilt ? '从一个小项目重新起步' : title;
  const actualSubtitle = id === 'future_comeback' && state.flags.future_comeback_unfinished
    ? '这次尝试没有做成，经历仍然留下' : subtitle;
  return { id, title:actualTitle, subtitle: `2036 · 73 岁 · 假设人生｜${actualSubtitle}`,
    text: state.journal.at(-1).resultText };
}
