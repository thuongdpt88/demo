import { useGameStore } from '../store/gameStore'
import { initAudio, resumeAudio } from '../utils/audioEngine'

const MUSIC_EMOJIS = ['🎵', '🎶', '🎹', '🎸', '🎺', '🎻', '🥁', '🎷', '🎤', '♪', '♫', '🎼', '🎧', '🪗']

const floatingNotes = Array.from({ length: 18 }, (_, i) => ({
  emoji: MUSIC_EMOJIS[i % MUSIC_EMOJIS.length],
  left: `${(i * 7 + 3) % 100}%`,
  delay: `${(i * 1.3) % 12}s`,
  duration: `${9 + (i % 6) * 1.5}s`,
  size: `${22 + (i % 5) * 8}px`,
}))

export default function StartScreen() {
  const goToSelect = useGameStore(s => s.goToSelect)

  const handlePlay = () => {
    initAudio()
    resumeAudio()
    goToSelect()
  }

  return (
    <div className="start-screen">
      {/* Floating background notes */}
      <div className="floating-notes-bg">
        {floatingNotes.map((n, i) => (
          <span
            key={i}
            className="floating-note"
            style={{
              left: n.left,
              animationDelay: n.delay,
              animationDuration: n.duration,
              fontSize: n.size,
            }}
          >
            {n.emoji}
          </span>
        ))}
      </div>

      <div className="start-content">
        <div className="app-icon">🎹</div>
        <h1 className="app-title">Magic Music<br/>Tiles</h1>
        <p className="app-subtitle">
          Chạm vào những phím nhạc rơi xuống và chơi những bản nhạc tuyệt vời! 🎶
        </p>
        <button className="play-btn" onClick={handlePlay}>
          ▶ Chơi ngay
        </button>
      </div>
    </div>
  )
}
