import { useGameStore } from '../store/gameStore'
import { SONGS } from '../data/songs'

export default function SongSelect() {
  const { selectSong, goHome, highScores, gameMode, setGameMode } = useGameStore()

  return (
    <div className="select-screen">
      <div className="select-header">
        <button className="back-btn" onClick={goHome}>←</button>
        <h2 className="select-title">Chọn bài hát</h2>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${gameMode === 'duet' ? 'active' : ''}`}
            onClick={() => setGameMode('duet')}
          >
            🐱 Duet
          </button>
          <button
            className={`mode-btn ${gameMode === 'classic' ? 'active' : ''}`}
            onClick={() => setGameMode('classic')}
          >
            🎹 Classic
          </button>
        </div>
      </div>

      <div className="songs-grid">
        {SONGS.map(song => (
          <div
            key={song.id}
            className="song-card"
            style={{ '--card-gradient': song.gradient }}
            onClick={() => selectSong(song)}
          >
            <div className="song-card-top">
              <div className="song-emoji" style={{ background: `${song.color}18` }}>
                {song.emoji}
              </div>
              <div className="song-info">
                <div className="song-name">{song.title}</div>
                <div className="song-artist">{song.artist}</div>
              </div>
            </div>
            <div className="song-card-bottom">
              <div className="difficulty-stars">
                {[1, 2, 3].map(d => (
                  <span key={d} className={`diff-star ${d <= song.difficulty ? 'active' : ''}`}>
                    ⭐
                  </span>
                ))}
              </div>
              {highScores[song.id] > 0 && (
                <div className="high-score">
                  Best: <span>{highScores[song.id]}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
