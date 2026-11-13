// Render the protagonist's quoted speech and writing without changing replay data.
const PROTAGONIST_QUOTES = new Map([
  ['这里很好', '這裡很好'],
  ['有事再说', '有事再說'],
  ['除了上学和工作，我还喜欢什么', '除了上學和工作，我還喜歡什麼'],
  ['有空再说', '有空再說'],
  ['下学期再安排', '下學期再安排'],
  ['各自完成该完成的事', '各自完成該完成的事'],
  ['安顿自己', '安頓自己'],
  ['一年后再谈', '一年後再談'],
  ['我会帮忙', '我會幫忙'],
  ['先缓一缓', '先緩一緩'],
  ['家里可以再想办法', '家裡可以再想辦法'],
  ['忙完再说', '忙完再說'],
  ['忙完这阵就好了', '忙完這陣就好了'],
  ['随时都可以', '隨時都可以'],
  ['以后再谈', '以後再談'],
  ['以后也许', '以後也許'],
  ['为你好', '為你好'],
  ['随时找我', '隨時找我'],
  ['市场很大', '市場很大'],
  ['团队负责', '團隊負責'],
  ['先送热的', '先送熱的'],
  ['听起来更快', '聽起來更快'],
  ['在哪个场景快', '在哪個場景快'],
  ['以后再说', '以後再說'],
  ['再撑一下', '再撐一下'],
  ['谁方便谁去', '誰方便誰去'],
  ['我来负责', '我來負責'],
  ['我负责', '我負責'],
]);

export function formatProtagonistText(value) {
  return String(value ?? '').replace(/“([^”]+)”|「([^」]+)」/g, (quote, rounded, cornered) => {
    const translated = PROTAGONIST_QUOTES.get(rounded ?? cornered);
    return translated ? `${quote[0]}${translated}${quote.at(-1)}` : quote;
  });
}
