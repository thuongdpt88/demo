import { useGameStore } from './store/gameStore'
import StartScreen from './components/StartScreen'
import SongSelect from './components/SongSelect'
import GameScreen from './components/GameScreen'
import ResultScreen from './components/ResultScreen'

export default function App() {
  const screen = useGameStore(s => s.screen)

  return (
    <div className="app-container">
      {screen === 'start' && <StartScreen />}
      {screen === 'select' && <SongSelect />}
      {screen === 'game' && <GameScreen />}
      {screen === 'result' && <ResultScreen />}
    </div>
  )
}
