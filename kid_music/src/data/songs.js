// Helper: convert melody array to timed notes with lane assignments
function createNotes(melody, bpm, startDelay = 3) {
  const beatDur = 60 / bpm
  let time = startDelay
  let lastLane = -1

  const laneMap = {
    'C4': 0, 'D4': 1, 'E4': 2, 'F4': 3,
    'G4': 3, 'A4': 2, 'B4': 1, 'C5': 0,
    'Bb4': 1, 'D5': 2, 'E5': 3,
    'C3': 0, 'D3': 1, 'E3': 2, 'F3': 3,
    'G3': 3, 'A3': 2,
  }

  const offsets = [1, 3, 2]

  return melody.map((item, i) => {
    const [noteName, beats] = Array.isArray(item) ? item : [item, 1]
    let lane = laneMap[noteName] ?? (i % 4)

    // Avoid consecutive same-lane tiles
    if (lane === lastLane) {
      lane = (lane + offsets[i % 3]) % 4
    }
    lastLane = lane

    const note = { id: i, note: noteName, lane, time, beats }
    time += beats * beatDur
    return note
  })
}

export const SONGS = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Nhạc thiếu nhi kinh điển',
    bpm: 110,
    difficulty: 1,
    color: '#ffd700',
    gradient: 'linear-gradient(135deg, #ffd700, #ff8c00)',
    emoji: '⭐',
    notes: createNotes([
      'C4', 'C4', 'G4', 'G4', 'A4', 'A4', ['G4', 2],
      'F4', 'F4', 'E4', 'E4', 'D4', 'D4', ['C4', 2],
      'G4', 'G4', 'F4', 'F4', 'E4', 'E4', ['D4', 2],
      'G4', 'G4', 'F4', 'F4', 'E4', 'E4', ['D4', 2],
      'C4', 'C4', 'G4', 'G4', 'A4', 'A4', ['G4', 2],
      'F4', 'F4', 'E4', 'E4', 'D4', 'D4', ['C4', 2],
    ], 110),
  },
  {
    id: 'mary',
    title: 'Mary Had a Little Lamb',
    artist: 'Nhạc thiếu nhi Anh',
    bpm: 120,
    difficulty: 1,
    color: '#ff69b4',
    gradient: 'linear-gradient(135deg, #ff69b4, #ff1493)',
    emoji: '🐑',
    notes: createNotes([
      'E4', 'D4', 'C4', 'D4', 'E4', 'E4', ['E4', 2],
      'D4', 'D4', ['D4', 2], 'E4', 'G4', ['G4', 2],
      'E4', 'D4', 'C4', 'D4', 'E4', 'E4', 'E4', 'E4',
      'D4', 'D4', 'E4', 'D4', ['C4', 2],
    ], 120),
  },
  {
    id: 'londonBridge',
    title: 'London Bridge',
    artist: 'Nhạc thiếu nhi Anh',
    bpm: 120,
    difficulty: 1,
    color: '#9370db',
    gradient: 'linear-gradient(135deg, #9370db, #6a0dad)',
    emoji: '🌉',
    notes: createNotes([
      'G4', ['A4', 0.5], ['G4', 0.5], 'F4', 'E4', 'F4', ['G4', 2],
      'D4', 'E4', ['F4', 2], 'E4', 'F4', ['G4', 2],
      'G4', ['A4', 0.5], ['G4', 0.5], 'F4', 'E4', 'F4', ['G4', 2],
      ['D4', 2], 'G4', 'E4', ['C4', 3],
      'G4', ['A4', 0.5], ['G4', 0.5], 'F4', 'E4', 'F4', ['G4', 2],
      'D4', 'E4', ['F4', 2], 'E4', 'F4', ['G4', 2],
    ], 120),
  },
  {
    id: 'happyBirthday',
    title: 'Happy Birthday',
    artist: 'Chúc mừng sinh nhật',
    bpm: 100,
    difficulty: 2,
    color: '#ff6347',
    gradient: 'linear-gradient(135deg, #ff6347, #dc143c)',
    emoji: '🎂',
    notes: createNotes([
      ['C4', 0.75], ['C4', 0.25], 'D4', 'C4', 'F4', ['E4', 2],
      ['C4', 0.75], ['C4', 0.25], 'D4', 'C4', 'G4', ['F4', 2],
      ['C4', 0.75], ['C4', 0.25], 'C5', 'A4', 'F4', 'E4', ['D4', 2],
      ['Bb4', 0.75], ['Bb4', 0.25], 'A4', 'F4', 'G4', ['F4', 2],
      ['C4', 0.75], ['C4', 0.25], 'D4', 'C4', 'F4', ['E4', 2],
      ['C4', 0.75], ['C4', 0.25], 'D4', 'C4', 'G4', ['F4', 2],
    ], 100),
  },
  {
    id: 'jingleBells',
    title: 'Jingle Bells',
    artist: 'Nhạc Giáng Sinh',
    bpm: 130,
    difficulty: 2,
    color: '#00ced1',
    gradient: 'linear-gradient(135deg, #00ced1, #008b8b)',
    emoji: '🔔',
    notes: createNotes([
      'E4', 'E4', ['E4', 2], 'E4', 'E4', ['E4', 2],
      'E4', 'G4', 'C4', 'D4', ['E4', 3],
      'F4', 'F4', 'F4', 'F4', 'F4', 'E4', 'E4', ['E4', 0.5], ['E4', 0.5],
      'E4', 'D4', 'D4', 'E4', ['D4', 2], ['G4', 2],
      'E4', 'E4', ['E4', 2], 'E4', 'E4', ['E4', 2],
      'E4', 'G4', 'C4', 'D4', ['E4', 3],
    ], 130),
  },
  {
    id: 'babyShark',
    title: 'Baby Shark',
    artist: 'Pinkfong',
    bpm: 115,
    difficulty: 2,
    color: '#1e90ff',
    gradient: 'linear-gradient(135deg, #1e90ff, #0047ab)',
    emoji: '🦈',
    notes: createNotes([
      // Baby shark
      ['C4', 0.5], ['D4', 0.5], ['F4', 0.5], ['F4', 0.5],
      ['F4', 0.5], ['F4', 0.5], ['F4', 0.5], ['F4', 0.5],
      ['C4', 0.5], ['D4', 0.5], ['F4', 0.5], ['F4', 0.5],
      ['F4', 0.5], ['F4', 0.5], ['F4', 1],
      ['C4', 0.5], ['D4', 0.5], ['F4', 0.5], ['F4', 0.5],
      ['F4', 0.5], ['F4', 0.5], ['F4', 0.5], ['F4', 0.5],
      ['F4', 0.5], ['E4', 0.5], ['D4', 0.5], ['C4', 1.5],
      // Mommy shark
      ['C4', 0.5], ['D4', 0.5], ['G4', 0.5], ['G4', 0.5],
      ['G4', 0.5], ['G4', 0.5], ['G4', 0.5], ['G4', 0.5],
      ['C4', 0.5], ['D4', 0.5], ['G4', 0.5], ['G4', 0.5],
      ['G4', 0.5], ['G4', 0.5], ['G4', 1],
      ['C4', 0.5], ['D4', 0.5], ['G4', 0.5], ['G4', 0.5],
      ['G4', 0.5], ['G4', 0.5], ['G4', 0.5], ['G4', 0.5],
      ['G4', 0.5], ['F4', 0.5], ['E4', 0.5], ['D4', 1.5],
    ], 115),
  },
  {
    id: 'odeToJoy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    bpm: 108,
    difficulty: 3,
    color: '#e040fb',
    gradient: 'linear-gradient(135deg, #e040fb, #7b1fa2)',
    emoji: '🎼',
    notes: createNotes([
      'E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4',
      'C4', 'C4', 'D4', 'E4', ['E4', 1.5], ['D4', 0.5], ['D4', 2],
      'E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4',
      'C4', 'C4', 'D4', 'E4', ['D4', 1.5], ['C4', 0.5], ['C4', 2],
      'D4', 'D4', 'E4', 'C4', 'D4', ['E4', 0.5], ['F4', 0.5], 'E4', 'C4',
      'D4', ['E4', 0.5], ['F4', 0.5], 'E4', 'D4', 'C4', 'D4', ['G4', 2],
      'E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4',
      'C4', 'C4', 'D4', 'E4', ['D4', 1.5], ['C4', 0.5], ['C4', 2],
    ], 108),
  },
  {
    id: 'rowBoat',
    title: 'Row Row Row Your Boat',
    artist: 'Nhạc thiếu nhi',
    bpm: 100,
    difficulty: 1,
    color: '#2ecc71',
    gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)',
    emoji: '🚣',
    notes: createNotes([
      ['C4', 1.5], ['C4', 0.5], ['C4', 1], ['D4', 0.5], ['E4', 1.5],
      ['E4', 1], ['D4', 0.5], ['E4', 1], ['F4', 0.5], ['G4', 3],
      ['C5', 0.5], ['C5', 0.5], ['C5', 0.5],
      ['G4', 0.5], ['G4', 0.5], ['G4', 0.5],
      ['E4', 0.5], ['E4', 0.5], ['E4', 0.5],
      ['C4', 0.5], ['C4', 0.5], ['C4', 0.5],
      ['G4', 1], ['F4', 0.5], ['E4', 1], ['D4', 0.5], ['C4', 3],
    ], 100),
  },
]
