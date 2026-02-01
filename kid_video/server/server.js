import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database file paths
const DB_PATH = path.join(__dirname, 'data');
const VIDEOS_FILE = path.join(DB_PATH, 'videos.json');
const CHANNELS_FILE = path.join(DB_PATH, 'channels.json');
const USERS_FILE = path.join(DB_PATH, 'users.json');
const SETTINGS_FILE = path.join(DB_PATH, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// Helper functions
const readJSON = (filePath, defaultValue = []) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
};

const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Initialize default data if not exists
const initializeData = () => {
  // Default categories
  const categories = [
    { id: 'math', name: 'Toán học', icon: '🔢', color: '#ff6b6b' },
    { id: 'english', name: 'Anh văn', icon: '🇬🇧', color: '#4ecdc4' },
    { id: 'communication', name: 'Giao tiếp', icon: '💬', color: '#45b7d1' },
    { id: 'thinking', name: 'Tư duy', icon: '🧠', color: '#96ceb4' },
    { id: 'entertainment', name: 'Giải trí', icon: '🎮', color: '#ffeaa7' },
    { id: 'learning', name: 'Học tập', icon: '📚', color: '#dfe6e9' },
    { id: 'music', name: 'Âm nhạc', icon: '🎵', color: '#fd79a8' },
    { id: 'science', name: 'Khoa học', icon: '🔬', color: '#a29bfe' }
  ];

  // Default videos
  const defaultVideos = [
    {
      id: uuidv4(),
      url: 'https://www.youtube.com/watch?v=XqZsoesa55w',
      title: 'Baby Shark Dance',
      thumbnail: 'https://img.youtube.com/vi/XqZsoesa55w/mqdefault.jpg',
      ageGroup: '0-3',
      category: 'music',
      channel: 'Pinkfong',
      addedAt: Date.now()
    },
    {
      id: uuidv4(),
      url: 'https://www.youtube.com/watch?v=kNw8V_Fkw28',
      title: 'Wheels on the Bus',
      thumbnail: 'https://img.youtube.com/vi/kNw8V_Fkw28/mqdefault.jpg',
      ageGroup: '0-3',
      category: 'music',
      channel: 'Cocomelon',
      addedAt: Date.now()
    },
    {
      id: uuidv4(),
      url: 'https://www.youtube.com/watch?v=75p-N9YKqNo',
      title: 'ABC Song - Học bảng chữ cái',
      thumbnail: 'https://img.youtube.com/vi/75p-N9YKqNo/mqdefault.jpg',
      ageGroup: '3-6',
      category: 'english',
      channel: 'Cocomelon',
      addedAt: Date.now()
    },
    {
      id: uuidv4(),
      url: 'https://www.youtube.com/watch?v=DR-cfDsHCGA',
      title: 'Học đếm số 1-10',
      thumbnail: 'https://img.youtube.com/vi/DR-cfDsHCGA/mqdefault.jpg',
      ageGroup: '3-6',
      category: 'math',
      channel: 'Kids Learning',
      addedAt: Date.now()
    },
    {
      id: uuidv4(),
      url: 'https://www.youtube.com/watch?v=ZbZSe6N_BXs',
      title: 'Happy - Pharrell Williams',
      thumbnail: 'https://img.youtube.com/vi/ZbZSe6N_BXs/mqdefault.jpg',
      ageGroup: 'all',
      category: 'entertainment',
      channel: 'Pharrell Williams',
      addedAt: Date.now()
    },
    {
      id: uuidv4(),
      url: 'https://www.youtube.com/watch?v=0Hkn-LSh7es',
      title: 'Thí nghiệm khoa học cho bé',
      thumbnail: 'https://img.youtube.com/vi/0Hkn-LSh7es/mqdefault.jpg',
      ageGroup: '6-9',
      category: 'science',
      channel: 'Science Fun',
      addedAt: Date.now()
    }
  ];

  // Default channels
  const defaultChannels = [
    { id: uuidv4(), name: 'Pinkfong', channelId: 'UCcdwLMPsaU2ezNSJU1nFoBQ', ageGroup: '0-3', category: 'music' },
    { id: uuidv4(), name: 'Cocomelon', channelId: 'UCbCmjCuTUZos6Inko4u57UQ', ageGroup: '0-3', category: 'music' },
    { id: uuidv4(), name: 'Super Simple Songs', channelId: 'UCLsooMJoIpl_7ux2jvdPB-Q', ageGroup: '3-6', category: 'english' }
  ];

  // Default users (parent + kids)
  const defaultUsers = [
    {
      id: 'parent',
      name: 'Phụ huynh',
      type: 'parent',
      avatar: '👨‍👩‍👧',
      createdAt: Date.now()
    },
    {
      id: uuidv4(),
      name: 'Bé Bi',
      type: 'child',
      avatar: '👶',
      ageGroup: '0-3',
      allowedCategories: ['music', 'entertainment'],
      allowedVideos: [],
      blockedVideos: [],
      dailyLimit: 60,
      createdAt: Date.now()
    },
    {
      id: uuidv4(),
      name: 'Bé Bo',
      type: 'child',
      avatar: '🧒',
      ageGroup: '3-6',
      allowedCategories: ['music', 'english', 'math', 'entertainment'],
      allowedVideos: [],
      blockedVideos: [],
      dailyLimit: 90,
      createdAt: Date.now()
    }
  ];

  // Default settings
  const defaultSettings = {
    categories,
    parentPin: '1234',
    globalDailyLimit: 120
  };

  // Write defaults if files don't exist
  if (!fs.existsSync(VIDEOS_FILE)) {
    writeJSON(VIDEOS_FILE, defaultVideos);
  }
  if (!fs.existsSync(CHANNELS_FILE)) {
    writeJSON(CHANNELS_FILE, defaultChannels);
  }
  if (!fs.existsSync(USERS_FILE)) {
    writeJSON(USERS_FILE, defaultUsers);
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    writeJSON(SETTINGS_FILE, defaultSettings);
  }
};

initializeData();

// ============ API ROUTES ============

// --- Videos ---
app.get('/api/videos', (req, res) => {
  const videos = readJSON(VIDEOS_FILE);
  res.json(videos);
});

app.post('/api/videos', (req, res) => {
  const videos = readJSON(VIDEOS_FILE);
  const newVideo = {
    id: uuidv4(),
    ...req.body,
    addedAt: Date.now()
  };
  videos.push(newVideo);
  writeJSON(VIDEOS_FILE, videos);
  res.json(newVideo);
});

app.put('/api/videos/:id', (req, res) => {
  const videos = readJSON(VIDEOS_FILE);
  const index = videos.findIndex(v => v.id === req.params.id);
  if (index !== -1) {
    videos[index] = { ...videos[index], ...req.body };
    writeJSON(VIDEOS_FILE, videos);
    res.json(videos[index]);
  } else {
    res.status(404).json({ error: 'Video not found' });
  }
});

app.delete('/api/videos/:id', (req, res) => {
  let videos = readJSON(VIDEOS_FILE);
  videos = videos.filter(v => v.id !== req.params.id);
  writeJSON(VIDEOS_FILE, videos);
  res.json({ success: true });
});

// --- Channels ---
app.get('/api/channels', (req, res) => {
  const channels = readJSON(CHANNELS_FILE);
  res.json(channels);
});

app.post('/api/channels', (req, res) => {
  const channels = readJSON(CHANNELS_FILE);
  const newChannel = {
    id: uuidv4(),
    ...req.body,
    addedAt: Date.now()
  };
  channels.push(newChannel);
  writeJSON(CHANNELS_FILE, channels);
  res.json(newChannel);
});

app.delete('/api/channels/:id', (req, res) => {
  let channels = readJSON(CHANNELS_FILE);
  channels = channels.filter(c => c.id !== req.params.id);
  writeJSON(CHANNELS_FILE, channels);
  res.json({ success: true });
});

// --- Users ---
app.get('/api/users', (req, res) => {
  const users = readJSON(USERS_FILE);
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id === req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/users', (req, res) => {
  const users = readJSON(USERS_FILE);
  const newUser = {
    id: uuidv4(),
    type: 'child',
    ...req.body,
    createdAt: Date.now()
  };
  users.push(newUser);
  writeJSON(USERS_FILE, users);
  res.json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const users = readJSON(USERS_FILE);
  const index = users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    writeJSON(USERS_FILE, users);
    res.json(users[index]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  let users = readJSON(USERS_FILE);
  // Don't allow deleting parent
  if (req.params.id === 'parent') {
    return res.status(400).json({ error: 'Cannot delete parent account' });
  }
  users = users.filter(u => u.id !== req.params.id);
  writeJSON(USERS_FILE, users);
  res.json({ success: true });
});

// --- Settings ---
app.get('/api/settings', (req, res) => {
  const settings = readJSON(SETTINGS_FILE, {});
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  const settings = readJSON(SETTINGS_FILE, {});
  const updatedSettings = { ...settings, ...req.body };
  writeJSON(SETTINGS_FILE, updatedSettings);
  res.json(updatedSettings);
});

// --- Get videos for specific child ---
app.get('/api/users/:id/videos', (req, res) => {
  const users = readJSON(USERS_FILE);
  const videos = readJSON(VIDEOS_FILE);
  const user = users.find(u => u.id === req.params.id);

  if (!user || user.type !== 'child') {
    return res.json(videos);
  }

  // Filter videos based on child's allowed categories and age group
  const filteredVideos = videos.filter(video => {
    // Check if video is blocked
    if (user.blockedVideos && user.blockedVideos.includes(video.id)) {
      return false;
    }
    // Check if video is specifically allowed
    if (user.allowedVideos && user.allowedVideos.length > 0) {
      return user.allowedVideos.includes(video.id);
    }
    // Check category
    if (user.allowedCategories && user.allowedCategories.length > 0) {
      if (!user.allowedCategories.includes(video.category)) {
        return false;
      }
    }
    // Check age group
    if (video.ageGroup !== 'all' && user.ageGroup) {
      const videoAgeMax = parseInt(video.ageGroup.split('-')[1]) || 99;
      const userAgeMax = parseInt(user.ageGroup.split('-')[1]) || 99;
      if (videoAgeMax > userAgeMax + 3) {
        return false;
      }
    }
    return true;
  });

  res.json(filteredVideos);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kid Video Server running at http://localhost:${PORT}`);
  console.log(`📁 Data stored in: ${DB_PATH}`);
});
