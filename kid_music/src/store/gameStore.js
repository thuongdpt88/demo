import { create } from 'zustand'

const loadScores = () => {
  try {
    return JSON.parse(localStorage.getItem('magic_tiles_scores') || '{}')
  } catch { return {} }
}

export const useGameStore = create((set, get) => ({
  screen: 'start',
  selectedSong: null,
  lastResult: null,
  gameMode: 'duet', // 'duet' or 'classic'
  highScores: loadScores(),

  setScreen: (screen) => set({ screen }),
  setGameMode: (mode) => set({ gameMode: mode }),

  selectSong: (song) => set({ selectedSong: song, screen: 'game' }),

  setResult: (result) => {
    const current = get().highScores
    const newScores = {
      ...current,
      [result.songId]: Math.max(current[result.songId] || 0, result.score)
    }
    try { localStorage.setItem('magic_tiles_scores', JSON.stringify(newScores)) } catch {}
    set({ lastResult: result, screen: 'result', highScores: newScores })
  },

  resetScore: () => {},
  goHome: () => set({ screen: 'start', selectedSong: null, lastResult: null }),
  goToSelect: () => set({ screen: 'select' }),
  replay: () => set(state => ({ screen: 'game' })),
}))
