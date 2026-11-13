// An edition belongs to the save: the original twelve-station game still replays unchanged.
export const STORY_EDITION = '2026.11';
export const STORY_YEARS = [1973,1978,1984,1992,1993,1996,1997,1999,2007,2012,2016,2024,2026,2028,2032,2036];
export const STORY_CHAPTERS = ['离家与长大','相爱与谋生','成家与冒险','事业与陪伴','放手与回望','往后的日子','风波与重新选择','十年以后的生活'];
export function isExpandedStory(state) { return state?.storyEdition === STORY_EDITION; }
export function getStepCount(state) { return isExpandedStory(state) ? STORY_YEARS.length : 12; }
export function getStoryChapters(state) { return STORY_CHAPTERS.slice(0, getStepCount(state) / 2); }
