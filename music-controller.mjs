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
  const enabled = supported && !Sound.isMuted();
  button.textContent = !supported ? '配乐暂不可用' : enabled ? '♫ 配乐已开' : '♫ 配乐已关';
  button.setAttribute('aria-pressed', String(enabled));
  button.disabled = !supported;
}

export function syncMusic(state, screen) {
  track = musicTrack(state, screen);
  if (started) Sound.bgm(track);
  paint();
}

function start() {
  if (!supported || document.hidden || Sound.isMuted()) return false;
  if (started) return true;
  try {
    Sound.init();
    Sound.bgm(track);
    started = true;
    return true;
  } catch {
    return false;
  }
}

function resumeMusic() {
  if (start()) Sound.resume().catch(() => {});
}

button?.addEventListener('click', () => {
  if (Sound.toggleMute()) Sound.pause().catch(() => {});
  else resumeMusic();
  paint();
});

// Browsers may suspend audio until a user interaction.
function resumeOnInteraction(event) {
  if (!button?.contains(event.target)) resumeMusic();
}
document.addEventListener('click', resumeOnInteraction);
document.addEventListener('keydown', resumeOnInteraction);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) Sound.pause().catch(() => {});
  else resumeMusic();
});
window.addEventListener('pagehide', () => { Sound.pause().catch(() => {}); });
window.addEventListener('pageshow', event => {
  if (event.persisted) resumeMusic();
});
paint();
start();
