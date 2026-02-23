import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { playNote, initAudio, resumeAudio, playMissSound, playCountdownBeep } from '../utils/audioEngine'
import '../classic.css'

// Duet Cats style: 2 lanes (Left: 0, Right: 1)
// Classic style: 4 lanes (0, 1, 2, 3)

// Cat SVGs
const CatLeft = ({ open }) => (
  <svg viewBox="0 0 100 100" className={`cat-svg ${open ? 'open' : ''}`}>
    <path d="M20 70 Q 10 20 40 10 Q 70 20 60 70" fill="#fff" stroke="#333" strokeWidth="3" />
    <circle cx="30" cy="40" r="5" fill="#333" />
    <circle cx="50" cy="40" r="5" fill="#333" />
    <path d={open ? "M35 55 Q 40 75 45 55" : "M35 55 Q 40 60 45 55"} fill="#ff9999" stroke="#333" strokeWidth="2" />
    <path d="M10 50 L 5 45 M10 55 L 2 55 M10 60 L 5 65" stroke="#333" strokeWidth="2" />
    <path d="M70 50 L 75 45 M70 55 L 78 55 M70 60 L 75 65" stroke="#333" strokeWidth="2" />
    <path d="M25 80 Q 40 90 55 80" fill="none" stroke="#333" strokeWidth="2" />
  </svg>
)

const CatRight = ({ open }) => (
  <svg viewBox="0 0 100 100" className={`cat-svg ${open ? 'open' : ''}`}>
    <path d="M40 70 Q 30 20 60 10 Q 90 20 80 70" fill="#ffccdd" stroke="#333" strokeWidth="3" />
    <circle cx="50" cy="40" r="5" fill="#333" />
    <circle cx="70" cy="40" r="5" fill="#333" />
    <path d={open ? "M55 55 Q 60 75 65 55" : "M55 55 Q 60 60 65 55"} fill="#ff9999" stroke="#333" strokeWidth="2" />
    <path d="M30 50 L 25 45 M30 55 L 22 55 M30 60 L 25 65" stroke="#333" strokeWidth="2" />
    <path d="M90 50 L 95 45 M90 55 L 98 55 M90 60 L 95 65" stroke="#333" strokeWidth="2" />
     <path d="M45 80 Q 60 90 75 80" fill="none" stroke="#333" strokeWidth="2" />
     <path d="M70 15 Q 85 5 90 20" fill="#ff69b4" />
  </svg>
)

const FOOD_ITEMS = ['🍓', '🍦', '🍩', '🍪', '🍎', '🍔', '🍕', '🍰']
const LANE_COLORS = ['#00d4ff', '#ff6bcb', '#4dff91', '#ffaa00']

export default function GameScreen() {
  const { selectedSong, setResult, goToSelect, gameMode, resetScore } = useGameStore()
  const gameAreaRef = useRef(null)
  const gameRef = useRef(null)
  const rafRef = useRef(null)
  const [tick, setTick] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [gameStarted, setGameStarted] = useState(false)
  const [effects, setEffects] = useState([])
  const [catState, setCatState] = useState({ left: false, right: false })
  const setResultRef = useRef(setResult)
  setResultRef.current = setResult

  // Config based on mode
  const IS_CLASSIC = gameMode === 'classic'
  const HIT_ZONE_Y = IS_CLASSIC ? 0.82 : 0.85

  // Init audio
  useEffect(() => {
    initAudio()
    resumeAudio()
    resetScore()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (countdown === 0) {
      const timer = setTimeout(() => setGameStarted(true), 500)
      return () => clearTimeout(timer)
    }
    if (countdown > 0) {
      playCountdownBeep(countdown === 1)
      const timer = setTimeout(() => setCountdown(c => c - 1), 800)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Game Logic Loop
  useEffect(() => {
    if (!gameStarted || !selectedSong) return

    const baseFall = [0, 2.5, 2.0, 1.5][selectedSong.difficulty] || 2.0
    const fallDuration = IS_CLASSIC ? baseFall * 1.1 : baseFall

    // Process notes for mode
    let processedNotes = []
    if (IS_CLASSIC) {
        processedNotes = selectedSong.notes.map(n => ({...n, lane: n.lane % 4})).sort((a, b) => a.time - b.time)
    } else {
        processedNotes = selectedSong.notes.map(n => ({
            ...n,
            lane: n.lane < 2 ? 0 : 1
        })).sort((a, b) => a.time - b.time)
    }

    const gs = {
      notes: processedNotes,
      tiles: [],
      noteIndex: 0,
      startTime: performance.now(),
      score: 0,
      combo: 0,
      maxCombo: 0,
      perfect: 0,
      great: 0,
      good: 0,
      miss: 0,
      health: 100,
      isRunning: true,
      bpm: selectedSong.bpm,
      fallDuration,
      totalProcessed: 0,
    }
    gameRef.current = gs

    const loop = () => {
      if (!gs.isRunning) return

      const now = performance.now()
      const elapsed = (now - gs.startTime) / 1000

      // Spawn tiles
      while (gs.noteIndex < gs.notes.length) {
        const note = gs.notes[gs.noteIndex]
        const spawnTime = note.time - HIT_ZONE_Y * fallDuration + (IS_CLASSIC ? 0.2 : 0.5)

        if (elapsed >= spawnTime) {
          gs.tiles.push({
            ...note,
            id: gs.noteIndex + Math.random(),
            spawnTime: elapsed,
            targetTime: note.time,
            y: -0.2,
            hit: false,
            missed: false,
            food: !IS_CLASSIC ? FOOD_ITEMS[(gs.noteIndex) % FOOD_ITEMS.length] : null,
          })
          gs.noteIndex++
        } else {
          break
        }
      }

      // Update tiles logic
      gs.tiles.forEach(tile => {
        if (tile.hit || tile.missed) return

        const remaining = tile.targetTime - elapsed
        // Linear movement logic
        // tile.y = 1.0 means it reached bottom
        // tile.y = HIT_ZONE_Y means it reached target lime
        // remaining = dist / speed = (HIT_ZONE_Y - y) * fallDuration / HIT_ZONE_Y ??
        // simple: y starts at -0.2. At targetTime, y should be HIT_ZONE_Y
        // Time traveled = elapsed - spawnTime
        // Total time to hit = targetTime - spawnTime
        // But spawnTime is calculated backwards.
        // Better: y = HIT_ZONE_Y - (remaining / fallDuration)

        tile.y = HIT_ZONE_Y - (remaining / fallDuration)

        // Miss detection
        if (tile.y > HIT_ZONE_Y + 0.15) {
            tile.missed = true
            gs.miss++
            gs.combo = 0
            gs.health = Math.max(0, gs.health - 15)
            playMissSound()
        }
      })

      gs.tiles = gs.tiles.filter(t => !t.hit && !t.missed && t.y < 1.2)

      const lastNoteTime = gs.notes.length > 0 ? gs.notes[gs.notes.length - 1].time : 0
      if (gs.health <= 0 || (elapsed > lastNoteTime + 2 && gs.tiles.length === 0)) {
        gs.isRunning = false
        setResultRef.current({
            songId: selectedSong.id,
            songTitle: selectedSong.title,
            emoji: selectedSong.emoji,
            score: Math.round(gs.score),
            maxCombo: gs.maxCombo,
            perfect: gs.perfect,
            great: gs.great,
            good: gs.good,
            miss: gs.miss,
            health: gs.health,
            totalNotes: gs.notes.length,
        })
        return
      }

      setTick(t => t + 1)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => { gs.isRunning = false; cancelAnimationFrame(rafRef.current) }
  }, [gameStarted, selectedSong, IS_CLASSIC, setResultRef])

  // Input Handler
  const handleInput = useCallback((lane) => {
    const gs = gameRef.current
    if (!gs || !gs.isRunning) return

    if (!IS_CLASSIC) {
        setCatState(prev => ({ ...prev, [lane === 0 ? 'left' : 'right']: true }))
        setTimeout(() => setCatState(prev => ({ ...prev, [lane === 0 ? 'left' : 'right']: false })), 150)
    }

    const elapsed = (performance.now() - gs.startTime) / 1000
    let bestTile = null
    let minDist = 0.2 // Hit window

    for (const tile of gs.tiles) {
      if (tile.lane !== lane || tile.hit || tile.missed) continue
      const timeDiff = Math.abs(tile.targetTime - elapsed)

      // Strict window for classic mode?
      if (timeDiff < minDist) {
        minDist = timeDiff
        bestTile = tile
      }
    }

    if (bestTile) {
      bestTile.hit = true
      playNote(bestTile.note, bestTile.beats, gs.bpm)

      let points = 50
      let grade = 'Good'
      if (minDist < 0.05) { points = 100; grade = 'Perfect'; gs.perfect++ }
      else if (minDist < 0.1) { points = 80; grade = 'Great'; gs.great++ }
      else { gs.good++ }

      gs.combo++
      gs.maxCombo = Math.max(gs.maxCombo, gs.combo)
      gs.score += points * (1 + gs.combo * 0.1)
      gs.health = Math.min(100, gs.health + 2)

      const id = Date.now() + Math.random()

      const newEffect = IS_CLASSIC
        ? { id, lane, grade, y: HIT_ZONE_Y, type: 'classic' }
        : { id, lane, text: grade, y: HIT_ZONE_Y, type: 'duet' }

      setEffects(prev => [...prev, newEffect])
      setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 600)
    } else {
      // Miss click penalty? optional
      // if (IS_CLASSIC) { gs.combo = 0; gs.health -= 5; }
    }
  }, [IS_CLASSIC, HIT_ZONE_Y])

  // Touch/Mouse Handlers
  const handleTouch = useCallback((e) => {
    // Prevent default to stop scrolling/zooming
    // e.preventDefault() // Sometimes blocks click, use carefuly

    const width = window.innerWidth
    if (IS_CLASSIC) {
        const laneWidth = width / 4
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i]
            const lane = Math.floor(t.clientX / laneWidth)
            if (lane >= 0 && lane < 4) handleInput(lane)
        }
    } else {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i]
            const lane = t.clientX < width / 2 ? 0 : 1
            handleInput(lane)
        }
    }
  }, [handleInput, IS_CLASSIC])

  const handleMouseDown = useCallback((e) => {
      const width = window.innerWidth
      if (IS_CLASSIC) {
          const lane = Math.floor(e.clientX / (width/4))
          if (lane >= 0 && lane < 4) handleInput(lane)
      } else {
          const lane = e.clientX < width / 2 ? 0 : 1
          handleInput(lane)
      }
  }, [handleInput, IS_CLASSIC])

  const handleKeyDown = useCallback((e) => {
      if (e.repeat) return
      if (IS_CLASSIC) {
          if (e.key === 'd' || e.key === 'ArrowLeft') handleInput(0)
          if (e.key === 'f' || e.key === 'ArrowDown') handleInput(1)
          if (e.key === 'j' || e.key === 'ArrowUp') handleInput(2)
          if (e.key === 'k' || e.key === 'ArrowRight') handleInput(3)
      } else {
          if (e.key === 'ArrowLeft' || e.key === 'a') handleInput(0)
          if (e.key === 'ArrowRight' || e.key === 'd') handleInput(1)
      }
  }, [handleInput, IS_CLASSIC])

  useEffect(() => {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!selectedSong) return null
  const gs = gameRef.current

  return (
    <div
      className={`game-screen ${IS_CLASSIC ? 'classic-theme' : 'duet-cats-theme'}`}
      onTouchStart={handleTouch}
      onMouseDown={handleMouseDown}
    >
      {/* --- DUET CATS RENDERING --- */}
      {!IS_CLASSIC && (
          <>
            <div className="bg-split left-bg"></div>
            <div className="bg-split right-bg"></div>
             {/* Cats */}
            <div className="play-area" ref={gameAreaRef}>
                <div className={`cat-container left-cat ${catState.left ? 'meow' : ''}`}>
                    <CatLeft open={catState.left} />
                </div>
                <div className={`cat-container right-cat ${catState.right ? 'meow' : ''}`}>
                    <CatRight open={catState.right} />
                </div>
                {/* Food Tiles */}
                {gs?.tiles.map(tile => (
                    !tile.hit && !tile.missed && (
                        <div key={tile.id} className="food-tile"
                            style={{
                                left: tile.lane === 0 ? '25%' : '75%',
                                top: `${tile.y * 100}%`,
                                opacity: tile.y < 0 ? 0 : 1
                            }}
                        >
                            {tile.food}
                        </div>
                    )
                ))}
                 {effects.map(e => (
                    <div key={e.id} className="hit-effect-text"
                        style={{ left: e.lane === 0 ? '25%' : '75%', top: '70%' }}
                    >
                        {e.text}
                    </div>
                ))}
            </div>
          </>
      )}

      {/* --- CLASSIC RENDERING --- */}
      {IS_CLASSIC && (
          <div className="play-area" ref={gameAreaRef}>
              {[0, 1, 2, 3].map(i => (
                  <div key={i} className="classic-lane-wrapper" style={{ left: `${i * 25}%` }}>
                       <div className="classic-lane-line"></div>
                       <div className="classic-key-hint">{['D', 'F', 'J', 'K'][i]}</div>
                  </div>
              ))}

              <div className="classic-hit-zone-line" style={{top: `${HIT_ZONE_Y*100}%`}}></div>

              {gs?.tiles.map(tile => {
                  if (tile.hit || tile.missed) return null
                  // In classic, tiles are long rectangles or just blocks
                  // Let's make them look like "Magic Tiles" (long black/colored bars)
                  const height = 120 // px
                  const yPct = tile.y * 100

                  return (
                    <div key={tile.id} className="classic-tile"
                        style={{
                            left: `${tile.lane * 25}%`,
                            top: `calc(${yPct}% - ${height}px)`, // Bottom at y
                            height: `${height}px`,
                            background: LANE_COLORS[tile.lane],
                            boxShadow: `0 0 10px ${LANE_COLORS[tile.lane]}`
                        }}
                    >
                    </div>
                  )
              })}

               {effects.map(e => (
                   <div key={e.id} className="classic-hit-effect"
                        style={{
                            left: `${e.lane * 25}%`,
                            top: `${HIT_ZONE_Y*100}%`,
                            borderColor: LANE_COLORS[e.lane]
                         }}
                   >
                       <div className="hit-text" style={{color: LANE_COLORS[e.lane]}}>{e.grade}</div>
                   </div>
               ))}
          </div>
      )}

      {/* Common UI */}
      <div className="game-top-bar">
        <button className="game-back-btn" onClick={() => { if(gs) gs.isRunning = false; goToSelect() }}>✕</button>
        <div className="score-display" style={IS_CLASSIC ? {color: '#fff', textShadow: '0 0 10px #0ff'} : {}}>
            {Math.round(gs?.score || 0)}
        </div>
        <div className="combo-display">{gs?.combo > 1 ? `${gs.combo}x` : ''}</div>
      </div>

      <div className="health-bar-container">
          <div className="health-bar-fill" style={{ width: `${gs?.health || 100}%` }}></div>
      </div>

       {!gameStarted && (
        <div className="countdown-overlay">
            <div className={`countdown-number ${IS_CLASSIC ? 'neon-text' : ''}`}>{countdown > 0 ? countdown : 'GO!'}</div>
        </div>
      )}
    </div>
  )
}
