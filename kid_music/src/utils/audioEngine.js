let audioCtx = null
let initialized = false

const NOTE_FREQ = {
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61,
  'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
  'G5': 783.99,
}

export function initAudio() {
  if (initialized) return
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  initialized = true
}

export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
}

export function playNote(noteName, durationBeats = 1, bpm = 120) {
  if (!audioCtx) initAudio()
  resumeAudio()

  const freq = NOTE_FREQ[noteName]
  if (!freq) return

  const duration = Math.min((durationBeats * 60) / bpm, 2)
  const now = audioCtx.currentTime

  // Main oscillator - warm triangle
  const osc1 = audioCtx.createOscillator()
  osc1.type = 'triangle'
  osc1.frequency.setValueAtTime(freq, now)

  // Harmonic - soft sine one octave up
  const osc2 = audioCtx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(freq * 2, now)

  // Sub - sine one octave lower
  const osc3 = audioCtx.createOscillator()
  osc3.type = 'sine'
  osc3.frequency.setValueAtTime(freq / 2, now)

  const mainGain = audioCtx.createGain()
  const harmGain = audioCtx.createGain()
  const subGain = audioCtx.createGain()
  const master = audioCtx.createGain()

  mainGain.gain.setValueAtTime(0.22, now)
  harmGain.gain.setValueAtTime(0.06, now)
  subGain.gain.setValueAtTime(0.04, now)

  master.gain.setValueAtTime(0.5, now)
  master.gain.exponentialRampToValueAtTime(0.01, now + duration)

  osc1.connect(mainGain)
  osc2.connect(harmGain)
  osc3.connect(subGain)
  mainGain.connect(master)
  harmGain.connect(master)
  subGain.connect(master)
  master.connect(audioCtx.destination)

  osc1.start(now)
  osc2.start(now)
  osc3.start(now)
  osc1.stop(now + duration + 0.05)
  osc2.stop(now + duration + 0.05)
  osc3.stop(now + duration + 0.05)
}

export function playMissSound() {
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(150, now)
  osc.frequency.linearRampToValueAtTime(80, now + 0.15)
  gain.gain.setValueAtTime(0.1, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.2)
}

export function playSuccessSound() {
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const notes = [523.25, 659.25, 783.99]
  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now + i * 0.12)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.18, now + i * 0.12)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start(now + i * 0.12)
    osc.stop(now + i * 0.12 + 0.35)
  })
}

export function playCountdownBeep(high = false) {
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(high ? 880 : 660, now)
  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.2)
}
