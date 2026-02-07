// Game State
let userPoints = 10000000;
let selectedRacerId = null;
let raceRounds = 3;
let soundEnabled = true;
let isRacing = false;
let history = [];

// ============================================================
// Web Audio API Sound Engine — all sounds synthesized in-browser
// ============================================================
const AudioEngine = (() => {
    let ctx = null;
    const activeNodes = {};            // keyed by sound name

    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    // ---- helpers ----
    function gain(c, v) { const g = c.createGain(); g.gain.value = v; return g; }

    function osc(c, type, freq, detune = 0) {
        const o = c.createOscillator(); o.type = type; o.frequency.value = freq; o.detune.value = detune; return o;
    }

    function noise(c, seconds) {
        const sr = c.sampleRate;
        const buf = c.createBuffer(1, sr * seconds, sr);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = c.createBufferSource(); src.buffer = buf; return src;
    }

    function stopKey(key) {
        if (activeNodes[key]) {
            activeNodes[key].forEach(n => { try { n.stop(); } catch (_) {} });
            delete activeNodes[key];
        }
    }

    function remember(key, ...nodes) {
        if (!activeNodes[key]) activeNodes[key] = [];
        activeNodes[key].push(...nodes);
    }

    // ---- SOUND DEFINITIONS ----

    // 🎯 SELECT RACER — bright pop / coin-like ding
    function playSelect() {
        const c = getCtx(), t = c.currentTime;
        const g = gain(c, 0.25); g.connect(c.destination);
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        const o1 = osc(c, 'sine', 880); o1.connect(g); o1.start(t); o1.stop(t + 0.25);
        const o2 = osc(c, 'sine', 1320); o2.connect(g); o2.start(t + 0.05); o2.stop(t + 0.2);
        // tiny click transient
        const o3 = osc(c, 'square', 2400);
        const g3 = gain(c, 0.08); o3.connect(g3); g3.connect(c.destination);
        g3.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        o3.start(t); o3.stop(t + 0.04);
    }

    // ⏱️ COUNTDOWN BEEP (pitch rises with each tick)
    function playCountdown(step = 3) {
        const c = getCtx(), t = c.currentTime;
        const freq = step === 1 ? 1000 : step === 2 ? 800 : 600;
        const g = gain(c, 0.3); g.connect(c.destination);
        g.gain.setValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        const o = osc(c, 'square', freq); o.connect(g); o.start(t); o.stop(t + 0.35);
    }

    // 🏁 GO! — ascending burst
    function playGo() {
        const c = getCtx(), t = c.currentTime;
        const g = gain(c, 0.3); g.connect(c.destination);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.3, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        const o = osc(c, 'sawtooth', 400);
        o.frequency.exponentialRampToValueAtTime(1200, t + 0.15);
        o.frequency.exponentialRampToValueAtTime(800, t + 0.4);
        o.connect(g); o.start(t); o.stop(t + 0.5);

        const o2 = osc(c, 'sine', 800);
        o2.frequency.exponentialRampToValueAtTime(1600, t + 0.12);
        const g2 = gain(c, 0.15); o2.connect(g2); g2.connect(c.destination);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        o2.start(t); o2.stop(t + 0.35);
    }

    // 🎵 THEME (racing BGM) — looped drum-like beat + bass
    function playTheme() {
        stopKey('theme');
        const c = getCtx(), t = c.currentTime;

        // --- Bass line loop ---
        const bassNotes = [110, 130.81, 146.83, 130.81];  // A2 C3 D3 C3
        const loopDur = 1.6; // seconds per loop
        const noteLen = loopDur / bassNotes.length;

        const bassOsc = osc(c, 'sawtooth', bassNotes[0]);
        const bassGain = gain(c, 0.08);
        const bassFilter = c.createBiquadFilter();
        bassFilter.type = 'lowpass'; bassFilter.frequency.value = 300;
        bassOsc.connect(bassFilter); bassFilter.connect(bassGain); bassGain.connect(c.destination);

        // Schedule note changes for ~60 seconds
        for (let loop = 0; loop < 40; loop++) {
            for (let i = 0; i < bassNotes.length; i++) {
                bassOsc.frequency.setValueAtTime(bassNotes[i], t + loop * loopDur + i * noteLen);
            }
        }
        bassOsc.start(t); bassOsc.stop(t + 64);

        // --- Kick / hi-hat loop ---
        const kickBuf = c.createBuffer(1, c.sampleRate * 0.15, c.sampleRate);
        const kickData = kickBuf.getChannelData(0);
        for (let i = 0; i < kickData.length; i++) {
            kickData[i] = Math.sin(i * 0.05 * Math.PI) * Math.exp(-i / 400) * 0.6;
        }
        const hihatBuf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
        const hihatData = hihatBuf.getChannelData(0);
        for (let i = 0; i < hihatData.length; i++) hihatData[i] = (Math.random() * 2 - 1) * Math.exp(-i / 200) * 0.3;

        const drumGain = gain(c, 0.15); drumGain.connect(c.destination);
        const beatInterval = loopDur / 4;
        const sources = [];
        for (let b = 0; b < 160; b++) {
            const time = t + b * beatInterval;
            const kick = c.createBufferSource(); kick.buffer = kickBuf; kick.connect(drumGain); kick.start(time); sources.push(kick);
            if (b % 2 === 1) {
                const hh = c.createBufferSource(); hh.buffer = hihatBuf; hh.connect(drumGain); hh.start(time); sources.push(hh);
            }
        }

        // --- Melody arp ---
        const melNotes = [523.25, 659.25, 783.99, 659.25]; // C5 E5 G5 E5
        const melOsc = osc(c, 'triangle', melNotes[0]);
        const melGain = gain(c, 0.04);
        melOsc.connect(melGain); melGain.connect(c.destination);
        for (let loop = 0; loop < 40; loop++) {
            for (let i = 0; i < melNotes.length; i++) {
                const time = t + loop * loopDur + i * noteLen;
                melOsc.frequency.setValueAtTime(melNotes[i], time);
                melGain.gain.setValueAtTime(0.04, time);
                melGain.gain.exponentialRampToValueAtTime(0.005, time + noteLen * 0.8);
            }
        }
        melOsc.start(t); melOsc.stop(t + 64);

        remember('theme', bassOsc, melOsc, ...sources);
    }

    // 🏎️ ENGINE — continuous low rumble
    function playEngine() {
        stopKey('engine');
        const c = getCtx(), t = c.currentTime;
        const o1 = osc(c, 'sawtooth', 55);
        const o2 = osc(c, 'sawtooth', 55.5); // slight detune for rumble
        const g = gain(c, 0.06);
        const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 200;
        o1.connect(filter); o2.connect(filter); filter.connect(g); g.connect(c.destination);
        // LFO for RPM wobble
        const lfo = osc(c, 'sine', 4);
        const lfoGain = gain(c, 15);
        lfo.connect(lfoGain); lfoGain.connect(o1.frequency); lfoGain.connect(o2.frequency);
        lfo.start(t); o1.start(t); o2.start(t);
        o1.stop(t + 120); o2.stop(t + 120); lfo.stop(t + 120);
        remember('engine', o1, o2, lfo);
    }

    // 🚀 BOOST — ascending whoosh
    function playBoost() {
        const c = getCtx(), t = c.currentTime;
        const g = gain(c, 0.2); g.connect(c.destination);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.2, t + 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        const o = osc(c, 'sawtooth', 200);
        o.frequency.exponentialRampToValueAtTime(2000, t + 0.3);
        o.connect(g); o.start(t); o.stop(t + 0.6);

        // shimmer layer
        const n = noise(c, 0.5);
        const nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 3000; nf.Q.value = 2;
        const ng = gain(c, 0.08); n.connect(nf); nf.connect(ng); ng.connect(c.destination);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        n.start(t); n.stop(t + 0.5);
    }

    // 💣 BOMB — low explosion
    function playBomb() {
        const c = getCtx(), t = c.currentTime;
        // impact noise burst
        const n = noise(c, 0.6);
        const nf = c.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 500;
        const ng = gain(c, 0.35); n.connect(nf); nf.connect(ng); ng.connect(c.destination);
        ng.gain.setValueAtTime(0.35, t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        n.start(t); n.stop(t + 0.6);

        // sub bass thump
        const o = osc(c, 'sine', 80);
        const og = gain(c, 0.3); o.connect(og); og.connect(c.destination);
        o.frequency.exponentialRampToValueAtTime(20, t + 0.4);
        og.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        o.start(t); o.stop(t + 0.5);
    }

    // 🎉 CHEER — short noise burst simulating crowd
    function playCheer() {
        const c = getCtx(), t = c.currentTime;
        const n = noise(c, 0.8);
        const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = 0.5;
        const g = gain(c, 0.12); n.connect(bp); bp.connect(g); g.connect(c.destination);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.12, t + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        n.start(t); n.stop(t + 0.8);
    }

    // 🏆 WIN FANFARE — triumphant "victory royale" style
    function playWin() {
        const c = getCtx(), t = c.currentTime;

        // --- Opening trumpet call (3 quick notes + hero chord) ---
        const master = gain(c, 0.22); master.connect(c.destination);
        const trumpetNotes = [
            { f: 523.25, start: 0, dur: 0.15 },     // C5
            { f: 659.25, start: 0.16, dur: 0.15 },  // E5
            { f: 783.99, start: 0.32, dur: 0.15 },  // G5
            { f: 1046.5, start: 0.5,  dur: 0.6 },   // C6 — held
        ];
        trumpetNotes.forEach(({ f, start: s, dur }) => {
            const st = t + s;
            const o = osc(c, 'square', f);
            const filt = c.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 2000;
            const g = gain(c, 0.22);
            o.connect(filt); filt.connect(g); g.connect(master);
            g.gain.setValueAtTime(0.001, st);
            g.gain.linearRampToValueAtTime(0.22, st + 0.02);
            g.gain.setValueAtTime(0.22, st + dur * 0.7);
            g.gain.exponentialRampToValueAtTime(0.001, st + dur);
            o.start(st); o.stop(st + dur);
        });

        // --- Triumphant chord (C major spread) ---
        const chordStart = t + 1.15;
        const chordFreqs = [261.63, 329.63, 392, 523.25, 659.25]; // C4-E4-G4-C5-E5
        chordFreqs.forEach((f, i) => {
            const o = osc(c, 'triangle', f);
            const g = gain(c, 0.06);
            o.connect(g); g.connect(master);
            g.gain.setValueAtTime(0.001, chordStart);
            g.gain.linearRampToValueAtTime(0.06, chordStart + 0.1);
            g.gain.setValueAtTime(0.06, chordStart + 1.5);
            g.gain.exponentialRampToValueAtTime(0.001, chordStart + 2.5);
            o.start(chordStart); o.stop(chordStart + 2.5);
        });

        // --- Sparkle arpeggios ---
        const sparkleNotes = [1046.5, 1318.5, 1568, 2093, 1568, 1318.5];
        sparkleNotes.forEach((f, i) => {
            const st = chordStart + 0.1 + i * 0.08;
            const o = osc(c, 'sine', f);
            const g = gain(c, 0.07);
            o.connect(g); g.connect(master);
            g.gain.setValueAtTime(0.07, st);
            g.gain.exponentialRampToValueAtTime(0.001, st + 0.3);
            o.start(st); o.stop(st + 0.3);
        });

        // --- Crowd roar (layered noise) ---
        const crowdLen = 3.5;
        const n = noise(c, crowdLen);
        const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.3;
        const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 800;
        const ng = gain(c, 0.13);
        n.connect(bp); bp.connect(hp); hp.connect(ng); ng.connect(c.destination);
        ng.gain.setValueAtTime(0.001, t);
        ng.gain.linearRampToValueAtTime(0.05, t + 0.3);
        ng.gain.linearRampToValueAtTime(0.13, t + 1.2);
        ng.gain.setValueAtTime(0.13, t + 2.0);
        ng.gain.exponentialRampToValueAtTime(0.001, t + crowdLen);
        n.start(t); n.stop(t + crowdLen);

        // --- Cymbal shimmer ---
        const cymbal = noise(c, 2);
        const cbp = c.createBiquadFilter(); cbp.type = 'highpass'; cbp.frequency.value = 6000;
        const cg = gain(c, 0.06);
        cymbal.connect(cbp); cbp.connect(cg); cg.connect(c.destination);
        cg.gain.setValueAtTime(0.001, chordStart);
        cg.gain.linearRampToValueAtTime(0.06, chordStart + 0.05);
        cg.gain.exponentialRampToValueAtTime(0.001, chordStart + 2);
        cymbal.start(chordStart); cymbal.stop(chordStart + 2);
    }

    // 😢 LOSE — sad trombone "wah wah wah wahhh" + melancholy
    function playLose() {
        const c = getCtx(), t = c.currentTime;
        const master = gain(c, 0.18); master.connect(c.destination);

        // --- Classic sad trombone (Bb-A-Ab-G ... slide down) ---
        const notes = [
            { f: 466.16, dur: 0.4,  slide: 0 },     // Bb4
            { f: 440.00, dur: 0.4,  slide: 0 },     // A4
            { f: 415.30, dur: 0.4,  slide: 0 },     // Ab4
            { f: 349.23, dur: 1.4,  slide: -30 },   // F4 slide down — long sad
        ];
        let offset = 0;
        notes.forEach(({ f, dur, slide }, i) => {
            const st = t + offset;
            // Double oscillator for rich brass feel
            const o1 = osc(c, 'sawtooth', f);
            const o2 = osc(c, 'sawtooth', f * 1.003); // slight detune
            const filt = c.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 900;
            const g = gain(c, 0.15);
            o1.connect(filt); o2.connect(filt); filt.connect(g); g.connect(master);

            // Attack envelope
            g.gain.setValueAtTime(0.001, st);
            g.gain.linearRampToValueAtTime(0.15, st + 0.03);

            if (i === notes.length - 1) {
                // Vibrato on the last note
                const vib = osc(c, 'sine', 5.5);
                const vibG = gain(c, 10);
                vib.connect(vibG); vibG.connect(o1.frequency); vibG.connect(o2.frequency);
                vib.start(st); vib.stop(st + dur);
                // Pitch slide down
                o1.frequency.exponentialRampToValueAtTime(f + slide, st + dur);
                o2.frequency.exponentialRampToValueAtTime((f + slide) * 1.003, st + dur);
                // Slower fade
                g.gain.setValueAtTime(0.15, st + dur * 0.5);
                g.gain.exponentialRampToValueAtTime(0.001, st + dur);
            } else {
                // Quick staccato fade
                g.gain.setValueAtTime(0.15, st + dur * 0.6);
                g.gain.exponentialRampToValueAtTime(0.005, st + dur * 0.95);
            }
            o1.start(st); o1.stop(st + dur);
            o2.start(st); o2.stop(st + dur);
            offset += dur + 0.03;
        });

        // --- Sad reverb-like tail ---
        const tailStart = t + offset;
        const tailNoise = noise(c, 1.5);
        const tailBp = c.createBiquadFilter(); tailBp.type = 'bandpass'; tailBp.frequency.value = 600; tailBp.Q.value = 1;
        const tailG = gain(c, 0.04);
        tailNoise.connect(tailBp); tailBp.connect(tailG); tailG.connect(c.destination);
        tailG.gain.setValueAtTime(0.04, tailStart);
        tailG.gain.exponentialRampToValueAtTime(0.001, tailStart + 1.5);
        tailNoise.start(tailStart); tailNoise.stop(tailStart + 1.5);

        // --- Low "bwomp" sub to emphasize sadness ---
        const bwomp = osc(c, 'sine', 120);
        const bwompG = gain(c, 0.12); bwomp.connect(bwompG); bwompG.connect(c.destination);
        bwomp.frequency.exponentialRampToValueAtTime(60, t + offset + 0.8);
        bwompG.gain.setValueAtTime(0.12, t + offset - 0.2);
        bwompG.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.8);
        bwomp.start(t + offset - 0.2); bwomp.stop(t + offset + 0.8);
    }

    // ---- PUBLIC API ----
    return {
        play(key, opts) {
            if (!soundEnabled) return;
            try {
                switch (key) {
                    case 'select':    playSelect(); break;
                    case 'countdown': playCountdown(opts); break;
                    case 'go':        playGo(); break;
                    case 'theme':     playTheme(); break;
                    case 'engine':    playEngine(); break;
                    case 'boost':     playBoost(); break;
                    case 'bomb':      playBomb(); break;
                    case 'cheer':     playCheer(); break;
                    case 'win':       playWin(); break;
                    case 'lose':      playLose(); break;
                }
            } catch (e) { console.warn('AudioEngine error:', e); }
        },
        stop(key) {
            stopKey(key);
        },
        stopAll() {
            Object.keys(activeNodes).forEach(k => stopKey(k));
        }
    };
})();

// Convenience wrappers (drop-in replacements)
const playSound = (key, opts) => AudioEngine.play(key, opts);
const stopSound = (key) => AudioEngine.stop(key);

// Racer SVG Avatars — inline, transparent background
const racerSVGs = {
    bunny: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bunnyFur" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fff0f3"/><stop offset="100%" style="stop-color:#ffc1cc"/>
        </linearGradient>
        <filter id="bunnyGlow"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#ff4757" flood-opacity="0.4"/></filter>
      </defs>
      <!-- Ears with inner glow -->
      <ellipse cx="32" cy="14" rx="11" ry="30" fill="url(#bunnyFur)" stroke="#ff6b81" stroke-width="2"/>
      <ellipse cx="68" cy="14" rx="11" ry="30" fill="url(#bunnyFur)" stroke="#ff6b81" stroke-width="2"/>
      <ellipse cx="32" cy="12" rx="5" ry="20" fill="#ff8a9e" opacity="0.7"/>
      <ellipse cx="68" cy="12" rx="5" ry="20" fill="#ff8a9e" opacity="0.7"/>
      <!-- Head -->
      <circle cx="50" cy="58" r="32" fill="url(#bunnyFur)" stroke="#ff6b81" stroke-width="2.5" filter="url(#bunnyGlow)"/>
      <!-- Racing goggles -->
      <ellipse cx="36" cy="50" rx="12" ry="10" fill="none" stroke="#333" stroke-width="2.5" rx="12"/>
      <ellipse cx="64" cy="50" rx="12" ry="10" fill="none" stroke="#333" stroke-width="2.5"/>
      <line x1="48" y1="50" x2="52" y2="50" stroke="#333" stroke-width="2.5"/>
      <ellipse cx="36" cy="50" rx="10" ry="8" fill="#44d4ff" opacity="0.3"/>
      <ellipse cx="64" cy="50" rx="10" ry="8" fill="#44d4ff" opacity="0.3"/>
      <!-- Eyes behind goggles -->
      <circle cx="36" cy="50" r="4" fill="#1a1a2e"/><circle cx="64" cy="50" r="4" fill="#1a1a2e"/>
      <circle cx="38" cy="48" r="1.8" fill="#fff"/><circle cx="66" cy="48" r="1.8" fill="#fff"/>
      <!-- Confident smirk -->
      <ellipse cx="50" cy="63" rx="4" ry="2.5" fill="#ff6b81"/>
      <path d="M42 66 Q50 74 58 66" fill="none" stroke="#d63031" stroke-width="2" stroke-linecap="round"/>
      <!-- Lightning bolt scar/marking -->
      <polygon points="56,32 60,38 57,38 61,46 55,39 58,39" fill="#ffd700" opacity="0.8"/>
      <!-- Speed lines -->
      <line x1="5" y1="45" x2="15" y2="45" stroke="#ff4757" stroke-width="1.5" opacity="0.5"/>
      <line x1="3" y1="55" x2="12" y2="55" stroke="#ff4757" stroke-width="1" opacity="0.4"/>
      <line x1="7" y1="65" x2="14" y2="65" stroke="#ff4757" stroke-width="1.5" opacity="0.3"/>
    </svg>`,
    fox: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="foxFur" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff9f43"/><stop offset="100%" style="stop-color:#ee5a24"/>
        </linearGradient>
        <filter id="foxGlow"><feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#ffa502" flood-opacity="0.5"/></filter>
      </defs>
      <!-- Sharp pointed ears -->
      <polygon points="18,38 10,5 40,35" fill="url(#foxFur)" stroke="#cc6600" stroke-width="2"/>
      <polygon points="82,38 90,5 60,35" fill="url(#foxFur)" stroke="#cc6600" stroke-width="2"/>
      <polygon points="18,38 15,12 34,35" fill="#2c2c54" opacity="0.8"/>
      <polygon points="82,38 85,12 66,35" fill="#2c2c54" opacity="0.8"/>
      <!-- Head -->
      <ellipse cx="50" cy="60" rx="32" ry="30" fill="url(#foxFur)" stroke="#cc6600" stroke-width="2" filter="url(#foxGlow)"/>
      <!-- Dark mask marking -->
      <path d="M25,52 Q50,42 75,52 Q65,58 50,55 Q35,58 25,52Z" fill="#2c2c54" opacity="0.35"/>
      <!-- Muzzle -->
      <ellipse cx="50" cy="68" rx="16" ry="14" fill="#fff5e6"/>
      <!-- Sly narrowed eyes -->
      <path d="M30,50 Q37,44 44,50" fill="none" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round"/>
      <path d="M56,50 Q63,44 70,50" fill="none" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round"/>
      <circle cx="37" cy="49" r="2" fill="#ffd700"/><circle cx="63" cy="49" r="2" fill="#ffd700"/>
      <!-- Nose & smirk -->
      <ellipse cx="50" cy="64" rx="4" ry="3" fill="#1a1a2e"/>
      <path d="M44 68 Q47 72 50 68 Q53 72 56 68" fill="none" stroke="#cc6600" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Bandana -->
      <path d="M22,42 Q50,36 78,42" fill="none" stroke="#e74c3c" stroke-width="3"/>
      <polygon points="80,42 92,50 86,42" fill="#e74c3c"/>
      <polygon points="80,42 90,55 84,44" fill="#c0392b"/>
    </svg>`,
    panda: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="pandaBody" cx="50%" cy="40%" r="60%">
          <stop offset="0%" style="stop-color:#ffffff"/><stop offset="100%" style="stop-color:#e0e0e0"/>
        </radialGradient>
        <filter id="pandaGlow"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#2ed573" flood-opacity="0.4"/></filter>
      </defs>
      <!-- Ears -->
      <circle cx="26" cy="28" r="17" fill="#1a1a2e"/><circle cx="74" cy="28" r="17" fill="#1a1a2e"/>
      <circle cx="26" cy="28" r="9" fill="#2ed573" opacity="0.3"/>
      <circle cx="74" cy="28" r="9" fill="#2ed573" opacity="0.3"/>
      <!-- Head -->
      <circle cx="50" cy="58" r="33" fill="url(#pandaBody)" stroke="#ccc" stroke-width="1.5" filter="url(#pandaGlow)"/>
      <!-- Eye patches -->
      <ellipse cx="35" cy="52" rx="13" ry="11" fill="#1a1a2e" transform="rotate(-8 35 52)"/>
      <ellipse cx="65" cy="52" rx="13" ry="11" fill="#1a1a2e" transform="rotate(8 65 52)"/>
      <!-- Eyes - fierce -->
      <circle cx="35" cy="51" r="6" fill="#fff"/>
      <circle cx="65" cy="51" r="6" fill="#fff"/>
      <circle cx="36" cy="50" r="3.5" fill="#2ed573"/>
      <circle cx="66" cy="50" r="3.5" fill="#2ed573"/>
      <circle cx="36" cy="50" r="1.5" fill="#111"/>
      <circle cx="66" cy="50" r="1.5" fill="#111"/>
      <circle cx="37" cy="48" r="1" fill="#fff"/>
      <circle cx="67" cy="48" r="1" fill="#fff"/>
      <!-- Determined eyebrows -->
      <line x1="26" y1="42" x2="40" y2="44" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round"/>
      <line x1="74" y1="42" x2="60" y2="44" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round"/>
      <!-- Nose & mouth -->
      <ellipse cx="50" cy="63" rx="4.5" ry="3" fill="#1a1a2e"/>
      <path d="M46 66 Q50 70 54 66" fill="none" stroke="#555" stroke-width="1.5" stroke-linecap="round"/>
      <!-- Headband -->
      <rect x="18" y="38" width="64" height="5" rx="2" fill="#2ed573"/>
      <circle cx="50" cy="40" r="5" fill="#ffd700" stroke="#2ed573" stroke-width="1.5"/>
      <text x="50" y="43" text-anchor="middle" font-size="7" font-weight="bold" fill="#2ed573">★</text>
    </svg>`,
    cat: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="catFur" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#485460"/><stop offset="100%" style="stop-color:#1e272e"/>
        </linearGradient>
        <filter id="catGlow"><feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#1e90ff" flood-opacity="0.5"/></filter>
      </defs>
      <!-- Pointed ears -->
      <polygon points="22,42 12,6 42,34" fill="url(#catFur)" stroke="#1e90ff" stroke-width="1.5"/>
      <polygon points="78,42 88,6 58,34" fill="url(#catFur)" stroke="#1e90ff" stroke-width="1.5"/>
      <polygon points="22,42 17,14 36,34" fill="#1e90ff" opacity="0.3"/>
      <polygon points="78,42 83,14 64,34" fill="#1e90ff" opacity="0.3"/>
      <!-- Head -->
      <circle cx="50" cy="58" r="32" fill="url(#catFur)" stroke="#1e90ff" stroke-width="1.5" filter="url(#catGlow)"/>
      <!-- Cyber visor -->
      <rect x="24" y="45" width="52" height="14" rx="7" fill="#0a0a23" stroke="#1e90ff" stroke-width="1.5" opacity="0.9"/>
      <rect x="26" y="47" width="20" height="10" rx="5" fill="#1e90ff" opacity="0.15"/>
      <rect x="54" y="47" width="20" height="10" rx="5" fill="#1e90ff" opacity="0.15"/>
      <!-- Glowing eyes -->
      <circle cx="36" cy="52" r="4" fill="#00ff88">
        <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="64" cy="52" r="4" fill="#00ff88">
        <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="36" cy="52" r="2" fill="#fff"/><circle cx="64" cy="52" r="2" fill="#fff"/>
      <!-- Nose -->
      <polygon points="50,62 47,65 53,65" fill="#ff6b9d"/>
      <!-- Whiskers - electric -->
      <line x1="10" y1="58" x2="32" y2="62" stroke="#1e90ff" stroke-width="1" opacity="0.6"/>
      <line x1="10" y1="65" x2="32" y2="66" stroke="#1e90ff" stroke-width="1" opacity="0.5"/>
      <line x1="10" y1="72" x2="32" y2="70" stroke="#1e90ff" stroke-width="1" opacity="0.4"/>
      <line x1="90" y1="58" x2="68" y2="62" stroke="#1e90ff" stroke-width="1" opacity="0.6"/>
      <line x1="90" y1="65" x2="68" y2="66" stroke="#1e90ff" stroke-width="1" opacity="0.5"/>
      <line x1="90" y1="72" x2="68" y2="70" stroke="#1e90ff" stroke-width="1" opacity="0.4"/>
      <!-- Cool scar -->
      <path d="M58,35 L62,42 L56,42 L60,50" fill="none" stroke="#1e90ff" stroke-width="1.5" opacity="0.7"/>
      <!-- Smirk -->
      <path d="M44 68 Q50 73 56 68" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    penguin: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="penguinBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#34495e"/><stop offset="100%" style="stop-color:#1a252f"/>
        </linearGradient>
        <filter id="penguinGlow"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#3742fa" flood-opacity="0.4"/></filter>
      </defs>
      <!-- Body -->
      <ellipse cx="50" cy="58" rx="32" ry="36" fill="url(#penguinBody)" stroke="#1a252f" stroke-width="2" filter="url(#penguinGlow)"/>
      <!-- Belly -->
      <ellipse cx="50" cy="65" rx="20" ry="25" fill="#ecf0f1"/>
      <!-- Wings/flippers -->
      <ellipse cx="18" cy="58" rx="10" ry="22" fill="url(#penguinBody)" stroke="#1a252f" stroke-width="1.5" transform="rotate(-10 18 58)"/>
      <ellipse cx="82" cy="58" rx="10" ry="22" fill="url(#penguinBody)" stroke="#1a252f" stroke-width="1.5" transform="rotate(10 82 58)"/>
      <!-- Aviator helmet -->
      <path d="M25,42 Q50,28 75,42 Q72,32 50,28 Q28,32 25,42Z" fill="#8b4513" stroke="#5c2d0e" stroke-width="1.5"/>
      <ellipse cx="50" cy="35" rx="20" ry="10" fill="#a0522d"/>
      <ellipse cx="50" cy="35" rx="14" ry="7" fill="#cd853f" opacity="0.5"/>
      <!-- Goggle strap -->
      <path d="M28,44 Q50,40 72,44" fill="none" stroke="#5c2d0e" stroke-width="2"/>
      <!-- Eyes - determined -->
      <circle cx="37" cy="48" r="7" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="63" cy="48" r="7" fill="#fff" stroke="#333" stroke-width="1.5"/>
      <circle cx="38" cy="47" r="3.5" fill="#3742fa"/>
      <circle cx="64" cy="47" r="3.5" fill="#3742fa"/>
      <circle cx="38" cy="47" r="1.5" fill="#111"/>
      <circle cx="64" cy="47" r="1.5" fill="#111"/>
      <circle cx="39" cy="46" r="1" fill="#fff"/>
      <circle cx="65" cy="46" r="1" fill="#fff"/>
      <!-- Determined brows -->
      <line x1="30" y1="40" x2="42" y2="42" stroke="#1a252f" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="70" y1="40" x2="58" y2="42" stroke="#1a252f" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Beak -->
      <polygon points="50,55 43,63 57,63" fill="#f39c12" stroke="#e67e22" stroke-width="1"/>
      <!-- Feet -->
      <ellipse cx="38" cy="93" rx="11" ry="5" fill="#f39c12" stroke="#e67e22" stroke-width="1"/>
      <ellipse cx="62" cy="93" rx="11" ry="5" fill="#f39c12" stroke="#e67e22" stroke-width="1"/>
    </svg>`,
    penguin_neon: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="neonG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7f5af0"/><stop offset="100%" style="stop-color:#2cb5e8"/>
        </linearGradient>
        <linearGradient id="neonG2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#e040fb"/><stop offset="100%" style="stop-color:#7f5af0"/>
        </linearGradient>
        <filter id="neonGlow">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#7f5af0" flood-opacity="0.6"/>
        </filter>
        <filter id="neonGlow2">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Outer glow ring -->
      <circle cx="50" cy="55" r="44" fill="none" stroke="url(#neonG)" stroke-width="2" opacity="0.3">
        <animate attributeName="r" values="44;47;44" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
      </circle>
      <!-- Body -->
      <ellipse cx="50" cy="58" rx="32" ry="36" fill="url(#neonG)" stroke="#5a3fc0" stroke-width="2" filter="url(#neonGlow)"/>
      <!-- Belly with glow -->
      <ellipse cx="50" cy="65" rx="20" ry="25" fill="#e8e0ff"/>
      <ellipse cx="50" cy="62" rx="12" ry="15" fill="#f0e6ff" opacity="0.5"/>
      <!-- Wings -->
      <ellipse cx="18" cy="58" rx="10" ry="22" fill="url(#neonG)" stroke="#5a3fc0" stroke-width="1.5" transform="rotate(-10 18 58)"/>
      <ellipse cx="82" cy="58" rx="10" ry="22" fill="url(#neonG)" stroke="#5a3fc0" stroke-width="1.5" transform="rotate(10 82 58)"/>
      <!-- Cyber crown -->
      <polygon points="30,30 37,18 44,28 50,12 56,28 63,18 70,30" fill="url(#neonG2)" stroke="#e040fb" stroke-width="1.5" filter="url(#neonGlow2)"/>
      <circle cx="50" cy="22" r="3" fill="#fff" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite"/>
      </circle>
      <!-- Eyes - neon glow -->
      <circle cx="37" cy="48" r="7" fill="#1a0a30" stroke="#e040fb" stroke-width="1.5"/>
      <circle cx="63" cy="48" r="7" fill="#1a0a30" stroke="#e040fb" stroke-width="1.5"/>
      <circle cx="37" cy="48" r="4" fill="#e040fb">
        <animate attributeName="r" values="4;3;4" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="63" cy="48" r="4" fill="#2cb5e8">
        <animate attributeName="r" values="4;3;4" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="37" cy="48" r="1.5" fill="#fff"/>
      <circle cx="63" cy="48" r="1.5" fill="#fff"/>
      <!-- Beak -->
      <polygon points="50,55 43,63 57,63" fill="#e040fb" stroke="#c030db" stroke-width="1"/>
      <!-- Feet -->
      <ellipse cx="38" cy="93" rx="11" ry="5" fill="#e040fb"/>
      <ellipse cx="62" cy="93" rx="11" ry="5" fill="#e040fb"/>
      <!-- Electric particles -->
      <circle cx="20" cy="40" r="1.5" fill="#2cb5e8" opacity="0.7">
        <animate attributeName="cy" values="40;35;40" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="80" cy="45" r="1" fill="#e040fb" opacity="0.6">
        <animate attributeName="cy" values="45;40;45" dur="0.9s" repeatCount="indefinite"/>
      </circle>
      <circle cx="15" cy="60" r="1" fill="#7f5af0" opacity="0.5">
        <animate attributeName="cx" values="15;12;15" dur="1.5s" repeatCount="indefinite"/>
      </circle>
    </svg>`
};

const racers = [
    {
        id: 1,
        name: 'Thỏ Siêu Tốc',
        emoji: '🐰',
        svgKey: 'bunny',
        color: '#ff4757',
        speed: 8.5,
        stamina: 4,
        luck: 7,
        desc: 'Siêu nhanh nhưng mau mệt',
        form: 0
    },
    {
        id: 2,
        name: 'Cáo Mưu Mẹo',
        emoji: '🦊',
        svgKey: 'fox',
        color: '#ffa502',
        speed: 6.5,
        stamina: 7,
        luck: 6,
        desc: 'Chạy khéo léo, né bẫy giỏi',
        form: 0
    },
    {
        id: 3,
        name: 'Gấu Trúc Bền Bỉ',
        emoji: '🐼',
        svgKey: 'panda',
        color: '#2ed573',
        speed: 5.5,
        stamina: 9,
        luck: 5,
        desc: 'Cực kỳ bền bỉ, chạy đường dài',
        form: 0
    },
    {
        id: 4,
        name: 'Mèo Mun May Mắn',
        emoji: '🐱',
        svgKey: 'cat',
        color: '#1e90ff',
        speed: 7.2,
        stamina: 5,
        luck: 8,
        desc: 'May mắn bất ngờ, nước rút cuối vòng',
        form: 0
    },
    {
        id: 5,
        name: 'Cánh Cụt Lướt Băng',
        emoji: '🐧',
        svgKey: 'penguin',
        color: '#3742fa',
        speed: 6.8,
        stamina: 6,
        luck: 6,
        desc: 'Cân bằng, trượt băng ổn định',
        form: 0
    },
    {
        id: 6,
        name: 'Cánh Cụt Sao Băng',
        emoji: '🐧',
        svgKey: 'penguin_neon',
        color: '#7f5af0',
        speed: 8.2,
        stamina: 4,
        luck: 8,
        desc: 'Phiên bản neon bứt tốc',
        form: 0
    }
];

function buildAvatarImg(racer) {
    if (!racer) return '';
    return racerSVGs[racer.svgKey] || racer.emoji;
}

// Randomize form before each race
function randomizeForm() {
    racers.forEach(r => {
        r.form = 5 + Math.floor(Math.random() * 6); // 5-10
    });
}

// UI Elements
const racerListEl = document.getElementById('racerList');
const userPointsEl = document.getElementById('userPoints');
const betAmountInput = document.getElementById('betAmount');
const btnStartRace = document.getElementById('btnStartRace');
const selectedRacerNameEl = document.getElementById('selectedRacerName');
const raceModal = document.getElementById('raceModal');
const configModal = document.getElementById('configModal');
const resultModal = document.getElementById('resultModal');
const trackContainer = document.getElementById('trackContainer');
const raceEventsEl = document.getElementById('raceEvents');
const raceRoundEl = document.getElementById('raceRound');

function renderRacers() {
    racerListEl.innerHTML = racers.map(r => {
        const formColor = r.form >= 8 ? '#2ed573' : r.form >= 6 ? '#eab308' : '#ff4757';
        return `
    <div class="racer-card" onclick="selectRacer(${r.id})">
            <div class="racer-avatar" aria-hidden="true">${buildAvatarImg(r)}</div>
      <h4>${r.name}</h4>
      <p style="font-size: 0.8rem; margin: 5px 0; color: #94a3b8;">${r.desc}</p>
      <div class="stats-group">
        <label style="font-size: 0.75rem;">Phong độ</label>
        <div class="stats-bar"><div class="stats-fill" style="width: ${r.form * 10}%; background: ${formColor}"></div></div>
        <label style="font-size: 0.75rem;">Tốc độ</label>
        <div class="stats-bar"><div class="stats-fill" style="width: ${r.speed * 10}%"></div></div>
        <label style="font-size: 0.75rem;">Bền bỉ</label>
        <div class="stats-bar"><div class="stats-fill" style="width: ${r.stamina * 10}%; background: #3b82f6"></div></div>
      </div>
    </div>
  `;
    }).join('');
}

window.selectRacer = (id) => {
    if (isRacing) return;
    selectedRacerId = id;
    const racer = racers.find(r => r.id === id);
    selectedRacerNameEl.textContent = "Bạn chọn: " + racer.name;
    document.querySelectorAll('.racer-card').forEach((card, index) => {
        card.classList.toggle('selected', racers[index].id === id);
    });
    btnStartRace.disabled = false;
    playSound('select');
};

// Race Logic
async function startRace() {
    const betAmount = parseInt(betAmountInput.value);
    if (betAmount > userPoints) {
        alert("Bạn không đủ điểm!");
        return;
    }

    isRacing = true;
    userPoints -= betAmount;
    updateUI();

    randomizeForm();
    renderRacers();

    raceModal.style.display = 'flex';
    initTrack();

    const totalRounds = parseInt(document.getElementById('roundsInput').value) || 3;
    const isEasy = document.getElementById('easyMode').checked;
    const finishLinePosition = 88;

    let racerLaps = racers.map(() => 0);
    let racerPositions = racers.map(() => 0);
    let racerLastPosition = racers.map(() => 0);
    let finishOrder = [];
    let winnerId = null;

    await showMarioKartCountdown();

    playSound('go');

    // Start continuous BGM and Engine
    playSound('theme');
    playSound('engine');

    // Random cheering (occasional)
    const cheerInterval = setInterval(() => {
        if (finishOrder.length < 3 && Math.random() > 0.7) {
            playSound('cheer');
        }
    }, 3500);

    window.raceCheerInterval = cheerInterval;

    await new Promise(resolve => {
        const interval = setInterval(() => {
            // --- Update Real-time Ranking ---
            const currentStandings = racers.map((r, i) => {
                const finishedIdx = finishOrder.indexOf(r.id);
                // Score:
                // - Finished: High score based on finish order (1st = highest)
                // - Racing: Score based on laps + position
                let score = 0;
                if (finishedIdx !== -1) {
                    score = 1000000 - finishedIdx * 10000;
                } else {
                    score = racerLaps[i] * 1000 + racerPositions[i];
                }
                return { ...r, score };
            }).sort((a, b) => b.score - a.score);

            const rankingList = document.getElementById('miniRankingList');
            if (rankingList) {
                rankingList.innerHTML = currentStandings.slice(0, 3).map((r, idx) => `
                    <li class="rank-${idx + 1}" style="animation: slideIn 0.3s ease-out">
                        <span style="display:flex; align-items:center; gap:5px;">
                            ${idx === 0 ? '👑' : `#${idx + 1}`}
                            <span class="mini-avatar">${buildAvatarImg(r)}</span>
                        </span>
                        <span style="max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${r.name}</span>
                    </li>
                `).join('');
            }
            // --------------------------------

            racers.forEach((racer, i) => {
                if (finishOrder.includes(racer.id)) return;
                if (racerLaps[i] >= totalRounds) return;

                let move = (racer.speed * (0.08 + Math.random() * 0.06));
                move += (racer.form / 10) * 0.2;

                const totalProgress = (racerLaps[i] / totalRounds);
                const fatigue = totalProgress * (10 - racer.stamina);
                move = Math.max(0.05, move - fatigue * 0.03);

                if (isEasy && racer.id === selectedRacerId) {
                    move *= 1.8;
                    move += 0.3;
                }

                if (racerLaps[i] >= totalRounds - 1 && Math.random() > 0.99) {
                    const eventType = Math.random() > 0.5 ? 'bomb' : 'boost';
                    if (eventType === 'bomb' && !(isEasy && racer.id === selectedRacerId)) {
                        move -= 2;
                        createVisualEffect(i, '💣');
                        raceEventsEl.textContent = `💥 ${racer.name} dính bẫy!`;
                        playSound('bomb');
                    } else if (eventType === 'boost') {
                        move += 1.5;
                        createVisualEffect(i, '🚀');
                        raceEventsEl.textContent = `⚡ ${racer.name} tăng tốc!`;
                        playSound('boost');
                    }
                }

                racerPositions[i] += move;

                if (racerLastPosition[i] < finishLinePosition && racerPositions[i] >= finishLinePosition) {
                    racerLaps[i]++;

                    if (racerLaps[i] >= totalRounds) {
                        finishOrder.push(racer.id);
                        if (!winnerId) winnerId = racer.id;
                        if (finishOrder.length <= 3) playSound('cheer');
                    } else {
                        racerPositions[i] = 0;
                    }
                }

                racerLastPosition[i] = racerPositions[i];

                const token = document.getElementById(`token-${racer.id}`);
                if (token) {
                    token.style.left = `${Math.min(90, racerPositions[i])}%`;
                    token.style.transform = `translateY(${Math.sin(Date.now() / 100 + i) * 2}px)`;
                }
            });

            const leadLap = Math.max(...racerLaps);
            raceRoundEl.textContent = `Vòng ${leadLap} / ${totalRounds}`;

            if (finishOrder.length >= 3 || finishOrder.length === racers.length) {
                clearInterval(interval);
                resolve();
            }
        }, 50);
    });

    if (window.raceCheerInterval) clearInterval(window.raceCheerInterval);

    AudioEngine.stopAll();

    const winner = racers.find(r => r.id === winnerId);
    const win = winnerId === selectedRacerId;
    const payout = win ? betAmount * 5 : 0;

    userPoints += payout;
    recordHistory(winner.name, win, payout - betAmount);

    raceModal.style.display = 'none';
    showResultModal(win, winner, betAmount, payout, finishOrder);

    isRacing = false;
    updateUI();
}

async function showMarioKartCountdown() {
    const countdownEl = document.createElement('div');
    countdownEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 150px;
        font-weight: 900;
        text-shadow: 0 0 20px rgba(0,0,0,0.8);
        z-index: 10000;
        font-family: 'Outfit', sans-serif;
    `;

    const colors = ['#ef4444', '#eab308', '#2ed573'];

    for (let i = 3; i >= 1; i--) {
        countdownEl.textContent = i;
        countdownEl.style.color = colors[i - 1];
        countdownEl.style.transform = 'translate(-50%, -50%) scale(0.5)';
        countdownEl.style.opacity = '0';
        document.body.appendChild(countdownEl);

        // Simple animation
        countdownEl.animate([
            { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
            { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 1 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }
        ], { duration: 300, fill: 'forwards' });

        playSound('countdown', i);
        await new Promise(r => setTimeout(r, 1000));
        countdownEl.remove();
    }

    countdownEl.textContent = 'GO!';
    countdownEl.style.color = '#2ed573';
    document.body.appendChild(countdownEl);
    countdownEl.animate([
        { transform: 'translate(-50%, -50%) scale(1)' },
        { transform: 'translate(-50%, -50%) scale(2)', opacity: 0 }
    ], { duration: 800 });

    await new Promise(r => setTimeout(r, 800));
    countdownEl.remove();
}

function showResultModal(win, winner, betAmount, payout, finishOrder) {
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultMessage = document.getElementById('resultMessage');
    const fireworksCont = document.getElementById('fireworksContainer');

    fireworksCont.innerHTML = '';

    if (win) {
        resultIcon.textContent = '🏆';
        resultTitle.textContent = 'CHIẾN THẮNG!';
        resultMessage.innerHTML = `
            Chúc mừng! Bạn đã thắng lớn!<br>
            <span style="font-size: 1.5rem; color: #ffd700;">+${payout.toLocaleString()}</span> points
        `;
        playSound('win');
        launchFireworks(fireworksCont);
    } else {
        resultIcon.textContent = '😅';
        resultTitle.textContent = 'CỐ GẮNG LẦN SAU!';
        resultMessage.innerHTML = `
            Bạn đã thua cuộc đua này.<br>
            <span style="font-size: 1.2rem; color: #ff6b6b;">-${betAmount.toLocaleString()}</span> points
        `;
        playSound('lose');
    }

    // Add Podium
    if (finishOrder && finishOrder.length >= 3) {
        const top3Names = finishOrder.slice(0, 3).map(id => racers.find(r => r.id === id));
        let podiumHTML = '<div class="podium-container">';

        // 2nd Place
        podiumHTML += `
            <div class="podium-step step-2">
                <div class="podium-name">${top3Names[1].name}</div>
                <div class="podium-avatar">${buildAvatarImg(top3Names[1])}</div>
                <div class="podium-block">2</div>
            </div>`;

        // 1st Place
        podiumHTML += `
            <div class="podium-step step-1">
                <div class="podium-avatar">👑</div>
                <div class="podium-name" style="font-weight: bold; color: gold;">${top3Names[0].name}</div>
                <div class="podium-avatar">${buildAvatarImg(top3Names[0])}</div>
                <div class="podium-block">1</div>
            </div>`;

        // 3rd Place
        podiumHTML += `
            <div class="podium-step step-3">
                <div class="podium-name">${top3Names[2].name}</div>
                <div class="podium-avatar">${buildAvatarImg(top3Names[2])}</div>
                <div class="podium-block">3</div>
            </div>`;

        podiumHTML += '</div>';
        resultMessage.innerHTML += podiumHTML;
    }

    resultModal.style.display = 'flex';
}

function launchFireworks(container) {
    const colors = ['#ff4757', '#ffd700', '#2ed573', '#3b82f6', '#8b5cf6'];
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const x = Math.random() * container.offsetWidth;
            const y = Math.random() * container.offsetHeight;
            createFirework(container, x, y, colors[Math.floor(Math.random() * colors.length)]);
        }, i * 50);
    }
}

function createFirework(container, x, y, color) {
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = color;

        const angle = (Math.PI * 2 * i) / 12;
        const velocity = 50 + Math.random() * 50;
        particle.style.setProperty('--tx', Math.cos(angle) * velocity + 'px');
        particle.style.setProperty('--ty', Math.sin(angle) * velocity + 'px');

        container.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}

function initTrack() {
    trackContainer.innerHTML = racers.map((r, i) => {
        const isSelected = r.id === selectedRacerId ? 'user-pick' : '';
        return `
    <div class="track-line">
      <div id="token-${r.id}" class="racer-token ${isSelected}">
        <div class="kart-wrap">
            <div class="kart-body" style="--kart-color: ${r.color};">
                <div class="kart-wheel wheel-front"></div>
                <div class="kart-wheel wheel-back"></div>
                <div class="kart-spoiler"></div>
            </div>
            <div class="driver-avatar">${buildAvatarImg(r)}</div>
        </div>
      </div>
    </div>
  `;
    }).join('') + '<div class="finish-line"></div>';
}

function createVisualEffect(racerIdx, text) {
    const el = document.createElement('div');
    el.className = 'bomb-effect';
    el.textContent = text;
    el.style.left = '50%';
    el.style.top = `${racerIdx * 60}px`;
    trackContainer.appendChild(el);
    setTimeout(() => el.remove(), 1200);
    // Sound now played in race logic for better context
}

function updateUI() {
    userPointsEl.textContent = userPoints.toLocaleString();
}

function recordHistory(winner, isWin, profit) {
    const item = {
        time: new Date().toLocaleTimeString(),
        winner,
        status: isWin ? 'Thắng' : 'Thua',
        profit
    };
    history.unshift(item);
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = history.slice(0, 10).map(h => `
        <div class="history-item">
            <span style="color: grey">${h.time}</span> |
            <b>${h.winner}</b> |
            <span style="color: ${h.profit >= 0 ? 'var(--secondary-color)' : 'var(--primary-color)'}">
                ${h.profit >= 0 ? '+' : ''}${h.profit.toLocaleString()}
            </span>
        </div>
    `).join('');
}

// Event Listeners
btnStartRace.addEventListener('click', startRace);
document.getElementById('btnConfig').addEventListener('click', () => configModal.style.display = 'flex');
document.getElementById('saveConfig').addEventListener('click', () => {
    raceRounds = parseInt(document.getElementById('roundsInput').value);
    soundEnabled = document.getElementById('soundToggle').checked;
    configModal.style.display = 'none';
});
document.getElementById('btnCloseResult').addEventListener('click', () => {
    resultModal.style.display = 'none';
});

// Close modals on outside click
window.onclick = (event) => {
    if (event.target == configModal) configModal.style.display = "none";
    if (event.target == resultModal) resultModal.style.display = "none";
};

// Init
randomizeForm();
renderRacers();
updateUI();
