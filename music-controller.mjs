import { Sound } from './economics-audio.mjs';

let started = false;
let track = 'title';
const button = document.querySelector('#music-toggle');
const supported = Boolean(window.AudioContext || window.webkitAudioContext);

export function musicTrack(state, screen) {
  if (!state || screen === 'home') return 'title';
  if (screen === 'ending') return state.stats?.stress > 75 ? 'winter' : 'spring';
  if (state.phase === 'prep') return 'focus';
  if (state.phase.endsWith('result')) return state.lastResult?.outcomeIndex === 2 ? 'winter' : 'spring';
  if (state.stats?.stress > 75 || state.step === 12) return 'winter';
  return ['autumn', 'winter', 'spring', 'summer'][state.step % 4];
}

function paint() {
  if (!button) return;
  const playing = started && !Sound.isMuted();
  button.textContent = !supported ? '配乐暂不可用' : playing ? '♫ 配乐已开' : '♫ 开启配乐';
  button.setAttribute('aria-pressed', String(playing));
  button.setAttribute('aria-label', playing ? '关闭经济博士配乐' : '开启经济博士配乐');
  button.disabled = !supported;
}

export function syncMusic(state, screen) {
  track = musicTrack(state, screen);
  if (started) Sound.bgm(track);
  paint();
}

function start() {
  if (!supported || document.hidden) return;
  try {
    Sound.init();
    started = true;
    Sound.bgm(track);
    paint();
  } catch {
    if (button) button.textContent = '重试开启配乐';
  }
}

button?.addEventListener('click', () => {
  if (!started) {
    if (Sound.isMuted()) Sound.toggleMute();
    start();
  } else {
    Sound.toggleMute();
    (Sound.isMuted() ? Sound.pause() : Sound.resume()).catch(() => {});
    paint();
  }
});

// Start only on an explicit interaction; saved mute preference is respected.
document.addEventListener('click', event => {
  if (event.target.closest('#music-toggle')) return;
  if (!started && !Sound.isMuted()) start();
});
document.addEventListener('visibilitychange', () => {
  (document.hidden ? Sound.pause() : Sound.resume()).catch(() => {});
});
window.addEventListener('pagehide', () => { Sound.pause().catch(() => {}); });
window.addEventListener('pageshow', () => {
  if (!document.hidden) Sound.resume().catch(() => {});
});
paint();
