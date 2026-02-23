import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { playSuccessSound } from '../utils/audioEngine'

export default function ResultScreen() {
  const { lastResult, replay, goHome, goToSelect } = useGameStore()

  useEffect(() => {
    if (lastResult) {
      setTimeout(() => playSuccessSound(), 300)
    }
  }, [lastResult])

  if (!lastResult) return null

  const { songTitle, emoji, score, maxCombo, perfect, great, good, miss, totalNotes, health } = lastResult

  // Star rating
  const accuracy = totalNotes > 0 ? (perfect + great) / totalNotes : 0
  const stars = accuracy >= 0.85 ? 3 : accuracy >= 0.55 ? 2 : accuracy >= 0.25 ? 1 : 0

  // Game over or completed
  const gameOver = health <= 0

  return (
    <div className="result-screen">
      <div className="result-card">
        <div className="result-song-title">{emoji} {songTitle}</div>
        <div className="result-subtitle">
          {gameOver ? '💔 Game Over' : stars === 3 ? '🌟 Tuyệt vời!' : stars >= 2 ? '👏 Rất giỏi!' : '🎵 Cố lên nào!'}
        </div>

        {/* Stars */}
        <div className="result-stars">
          {[1, 2, 3].map(i => (
            <span
              key={i}
              className={`result-star ${i <= stars ? '' : 'empty'}`}
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Score */}
        <div className="result-score">{score}</div>
        <div className="result-max-combo">Max Combo: {maxCombo}x</div>

        {/* Stats */}
        <div className="result-stats">
          <div className="stat-item">
            <div className="stat-label">Perfect</div>
            <div className="stat-value perfect">{perfect}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Great</div>
            <div className="stat-value great">{great}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Good</div>
            <div className="stat-value good">{good}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Miss</div>
            <div className="stat-value miss">{miss}</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="result-buttons">
          <button className="result-btn btn-home" onClick={goHome}>🏠 Home</button>
          <button className="result-btn btn-retry" onClick={replay}>🔄 Chơi lại</button>
          <button className="result-btn btn-songs" onClick={goToSelect}>🎵 Bài khác</button>
        </div>
      </div>
    </div>
  )
}
