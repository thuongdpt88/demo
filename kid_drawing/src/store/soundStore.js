import { create } from 'zustand';

const SOUND_FILES = {
  brushStroke: '/sounds/brush-stroke.mp3',
  colorPick: '/sounds/color-pick.mp3',
  starRating: '/sounds/star-rating.mp3',
  complete: '/sounds/complete.mp3',
  buttonClick: '/sounds/button-click.mp3',
  success: '/sounds/complete.mp3',
};

const useSoundStore = create((set, get) => ({
  muted: false,
  toggleMute: () => set((state) => ({ muted: !state.muted })),
  playSound: (soundName) => {
    const { muted } = get();
    if (muted) return;
    const src = SOUND_FILES[soundName];
    if (!src) return;
    try {
      const audio = new Audio(src);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {
      // silently fail
    }
  },
}));

export { useSoundStore };
export default useSoundStore;