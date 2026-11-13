// Adapted from the user-supplied UCSL PhD simulator; see music-source.json.
// Procedural audio: every sound and the music are synthesized with WebAudio, so the game
// needs no audio files. The music is a slow, warm electric-piano piece that changes key and
// pace with the season; quizzes and defences get a quieter, more focused pulse.
export const Sound = (() => {
  const MUTE_KEY = 'jensen-economics-mute';
  let ctx = null, master = null, sfxBus = null, musicBus = null, verb = null;
  let muted = false, current = null, currentName = null;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { muted = false; }

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
    // A short synthetic room so the plucks do not sound dry.
    verb = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * 1.6), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6) * 0.5;
    }
    verb.buffer = buf;
    const verbGain = ctx.createGain(); verbGain.gain.value = 0.35;
    verb.connect(verbGain); verbGain.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(master); sfxBus.connect(verb);
    musicBus = ctx.createGain(); musicBus.gain.value = 0.3; musicBus.connect(master); musicBus.connect(verb);
    if (currentName) { const n = currentName; currentName = null; bgm(n); }
  }

  // ---------- instruments ----------
  // A soft electric-piano note: sine fundamental with a couple of quiet harmonics.
  function pluck(f, { v = 0.1, d = 1.2, at = 0, bright = 1, dest = null } = {}) {
    if (!ctx) return;
    const t = ctx.currentTime + at;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    g.connect(dest || musicBus);
    [[1, 1], [2, 0.3 * bright], [3, 0.1 * bright], [4.01, 0.04 * bright]].forEach(([h, a]) => {
      const o = ctx.createOscillator(), hg = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f * h; hg.gain.value = a;
      o.connect(hg); hg.connect(g); o.start(t); o.stop(t + d + 0.1);
    });
  }
  function noise({ d = 0.2, v = 0.2, at = 0, freq = 1500, q = 0.8, to = null, dest = null } = {}) {
    if (!ctx) return;
    const t = ctx.currentTime + at;
    const len = Math.max(1, Math.floor(ctx.sampleRate * d));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.setValueAtTime(freq, t); filt.Q.value = q;
    if (to) filt.frequency.exponentialRampToValueAtTime(to, t + d);
    const g = ctx.createGain();
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(filt); filt.connect(g); g.connect(dest || sfxBus);
    src.start(t); src.stop(t + d + 0.05);
  }
  function thud(f = 90, { v = 0.3, d = 0.35, at = 0, dest = null } = {}) {
    if (!ctx) return;
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.5, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest || sfxBus); o.start(t); o.stop(t + d + 0.05);
  }

  const S = { v: 0.08 };
  const SFX = {
    tick: () => { noise({ d: 0.03, v: 0.12, freq: 2600, q: 1.2 }); pluck(1320, { v: 0.02, d: 0.08, dest: sfxBus }); },
    open: () => noise({ d: 0.14, v: 0.1, freq: 900, to: 2600, q: 0.7 }),
    close: () => noise({ d: 0.12, v: 0.08, freq: 2400, to: 800, q: 0.7 }),
    confirm: () => { pluck(659, { v: S.v, d: 0.35, dest: sfxBus }); pluck(880, { v: S.v, d: 0.5, at: 0.09, dest: sfxBus }); },
    evidence: () => [784, 988, 1175, 1568].forEach((f, i) => pluck(f, { v: 0.07, d: 0.9, at: i * 0.08, bright: 1.4, dest: sfxBus })),
    good: () => [784, 988, 1175].forEach((f, i) => pluck(f, { v: 0.06, d: 0.6, at: i * 0.07, dest: sfxBus })),
    levelup: () => [523, 659, 784, 1047, 1319].forEach((f, i) => pluck(f, { v: 0.06, d: 0.8, at: i * 0.07, bright: 1.6, dest: sfxBus })),
    damage: () => { thud(110, { v: 0.35, d: 0.4 }); noise({ d: 0.25, v: 0.12, freq: 220, q: 0.6 }); pluck(233, { v: 0.05, d: 0.6, at: 0.05, dest: sfxBus }); },
    banner: () => { thud(70, { v: 0.4, d: 0.6 }); noise({ d: 0.5, v: 0.1, freq: 1200, to: 400, q: 0.5 }); [262, 330, 392].forEach(f => pluck(f, { v: 0.05, d: 1.4, at: 0.08, dest: sfxBus })); },
    stamp: () => { thud(80, { v: 0.45, d: 0.3 }); noise({ d: 0.08, v: 0.15, freq: 1800, q: 0.8 }); },
    press: () => { pluck(880, { v: 0.05, d: 0.2, dest: sfxBus }); },
  };
  function sfx(name) { if (ctx && !muted && SFX[name]) SFX[name](); }
  function blip(pitch) { if (ctx && !muted && pitch) pluck(pitch, { v: 0.03, d: 0.12, dest: sfxBus }); }

  // ---------- music ----------
  // Chords are semitone offsets from the root; the melody draws from the chord plus the
  // pentatonic scale. Each season has its own key, pace and density.
  const TRACKS = {
    autumn: { root: 261.63, chords: [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]], scale: [0, 2, 4, 7, 9], beat: 0.52, density: 0.55, bass: 0.5, cutoff: 650, oct: 1 },
    winter: { root: 220, chords: [[0, 3, 7, 10], [8, 12, 15, 19], [5, 8, 12, 15], [7, 10, 14, 17]], scale: [0, 3, 5, 7, 10], beat: 0.62, density: 0.38, bass: 0.4, cutoff: 500, oct: 1 },
    spring: { root: 293.66, chords: [[0, 4, 7, 11], [5, 9, 12, 16], [9, 12, 16, 19], [7, 11, 14, 17]], scale: [0, 2, 4, 7, 9], beat: 0.46, density: 0.62, bass: 0.5, cutoff: 800, oct: 1.4 },
    summer: { root: 174.61, chords: [[0, 4, 7, 11], [5, 9, 12, 16], [2, 5, 9, 12], [7, 11, 14, 17]], scale: [0, 2, 4, 7, 9], beat: 0.58, density: 0.45, bass: 0.45, cutoff: 600, oct: 1.4 },
    focus: { root: 220, chords: [[0, 3, 7], [0, 3, 7], [5, 8, 12], [7, 10, 14]], scale: [0, 3, 7, 10], beat: 0.5, density: 0.2, bass: 0.7, cutoff: 420, oct: 2, pulse: true },
  };
  TRACKS.title = TRACKS.autumn;

  function play(track) {
    const T = TRACKS[track];
    const hz = st => T.root * Math.pow(2, st / 12);
    // Sustained pad that glides between chords.
    const out = ctx.createGain(); out.gain.setValueAtTime(0, ctx.currentTime); out.gain.linearRampToValueAtTime(1, ctx.currentTime + 2.5); out.connect(musicBus);
    const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = T.cutoff; filt.Q.value = 0.7; filt.connect(out);
    const padOsc = [0, 1, 2].map(i => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = hz(T.chords[0][i]) / 2; g.gain.value = 0.05; o.connect(g); g.connect(filt); o.start(); return o; });
    // Vinyl-like crackle, very quiet, for warmth.
    const cl = ctx.createBufferSource(); const len = ctx.sampleRate * 2; const buf = ctx.createBuffer(1, len, ctx.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() < 0.004 ? (Math.random() * 2 - 1) : (Math.random() * 2 - 1) * 0.02;
    cl.buffer = buf; cl.loop = true; const clf = ctx.createBiquadFilter(); clf.type = 'bandpass'; clf.frequency.value = 2200; clf.Q.value = 0.5;
    const clg = ctx.createGain(); clg.gain.value = 0.05; cl.connect(clf); clf.connect(clg); clg.connect(out); cl.start();

    let step = 0, bar = 0, last = -1;
    const timer = setInterval(() => {
      if (!ctx || muted || ctx.state !== 'running') return;
      const chord = T.chords[bar % T.chords.length];
      if (step % 8 === 0) {
        padOsc.forEach((o, i) => o.frequency.setTargetAtTime(hz(chord[i]) / 2, ctx.currentTime, 0.4));
        pluck(hz(chord[0]) / 2, { v: T.bass * 0.22, d: 2.2, bright: 0.4 });
      }
      if (T.pulse && step % 2 === 0) thud(55, { v: 0.18, d: 0.25, dest: musicBus });
      // Melody: chord tones on strong beats, scale notes in between, with rests.
      const strong = step % 4 === 0;
      if (Math.random() < (strong ? T.density + 0.25 : T.density)) {
        const pool = strong || Math.random() < 0.6 ? chord : T.scale.map(s => s + 12);
        let n = pool[Math.floor(Math.random() * pool.length)];
        while (last >= 0 && Math.abs(n - last) > 9 && Math.random() < 0.7) n = pool[Math.floor(Math.random() * pool.length)];
        last = n;
        pluck(hz(n) * T.oct, { v: 0.07 + Math.random() * 0.03, d: 1.1 + Math.random() * 0.6, bright: 0.9 + Math.random() * 0.4 });
      }
      step++;
      if (step % 8 === 0) bar++;
    }, T.beat * 1000);

    return {
      stop() {
        clearInterval(timer);
        const t = ctx.currentTime;
        out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0, t + 1.5);
        setTimeout(() => { padOsc.forEach(o => { try { o.stop(); } catch (e) { /* stopped */ } }); try { cl.stop(); } catch (e) { /* stopped */ } out.disconnect(); }, 1700);
      },
    };
  }

  function bgm(name) {
    if (name === currentName) return;
    currentName = name;
    if (!ctx) return;
    if (current) { current.stop(); current = null; }
    if (name && TRACKS[name]) current = play(name);
  }

  function toggleMute() {
    muted = !muted;
    try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) { /* ignore */ }
    if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.05);
    return muted;
  }

  // Ambient layers under the music: filtered noise shaped like a room, an office, a corridor
  // full of people, rain on a window; crossfaded when the scene changes.
  const AMBIENT = {
    room: { type: 'lowpass', f: 420, q: 0.6, g: 0.035, ticks: { every: 2.6, v: 0.05, f: 3200 } },
    quiet: { type: 'lowpass', f: 300, q: 0.6, g: 0.02 },
    office: { type: 'lowpass', f: 700, q: 0.5, g: 0.03, ticks: { every: 0.35, v: 0.03, f: 5000 } },
    cafe: { type: 'bandpass', f: 800, q: 0.4, g: 0.05, ticks: { every: 3.5, v: 0.04, f: 4200 } },
    crowd: { type: 'bandpass', f: 520, q: 0.5, g: 0.06, lfo: 0.15 },
    rain: { type: 'highpass', f: 1500, q: 0.4, g: 0.055, ticks: { every: 0.5, v: 0.03, f: 6000 } },
    outdoor: { type: 'bandpass', f: 1200, q: 0.3, g: 0.03 },
  };
  let amb = null, ambName = null;
  function ambient(name) {
    if (!ctx || name === ambName) return;
    ambName = name;
    const A = AMBIENT[name] || AMBIENT.room;
    if (!amb) {
      const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const filt = ctx.createBiquadFilter();
      const gain = ctx.createGain(); gain.gain.value = 0;
      const lfo = ctx.createOscillator(); const lg = ctx.createGain(); lfo.frequency.value = 0.15; lg.gain.value = 0; lfo.connect(lg); lg.connect(gain.gain); lfo.start();
      src.connect(filt); filt.connect(gain); gain.connect(master); src.start();
      amb = { src, filt, gain, lg, timer: null };
    }
    const t = ctx.currentTime;
    amb.filt.type = A.type; amb.filt.frequency.setTargetAtTime(A.f, t, 0.8); amb.filt.Q.value = A.q;
    amb.gain.gain.setTargetAtTime(A.g, t, 1.2);
    amb.lg.gain.setTargetAtTime(A.lfo ? A.g * 0.5 : 0, t, 1);
    if (amb.timer) { clearInterval(amb.timer); amb.timer = null; }
    if (A.ticks) {
      amb.timer = setInterval(() => {
        if (muted || Math.random() < 0.35) return;
        const o = ctx.createBufferSource(); const n = Math.floor(ctx.sampleRate * 0.03); const b = ctx.createBuffer(1, n, ctx.sampleRate); const dd = b.getChannelData(0);
        for (let i = 0; i < n; i++) dd[i] = (Math.random() * 2 - 1) * (1 - i / n);
        o.buffer = b; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = A.ticks.f * (0.8 + Math.random() * 0.4); f.Q.value = 2;
        const g = ctx.createGain(); g.gain.value = A.ticks.v * (0.6 + Math.random() * 0.6); o.connect(f); f.connect(g); g.connect(master); o.start();
      }, A.ticks.every * 1000);
    }
  }

  async function pause() { if (ctx && ctx.state === 'running') await ctx.suspend(); }
  async function resume() { if (ctx && !muted && ctx.state === 'suspended') await ctx.resume(); }
  return { init, sfx, blip, bgm, toggleMute, ambient, pause, resume, isMuted: () => muted };
})();
