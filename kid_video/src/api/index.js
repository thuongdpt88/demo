// ============ LOCAL STORAGE API (No Backend Required) ============

// Storage keys
const STORAGE_KEYS = {
  VIDEOS: 'kidvideo_videos',
  CHANNELS: 'kidvideo_channels',
  USERS: 'kidvideo_users',
  SETTINGS: 'kidvideo_settings',
};

// Default data (from server/data/)
const DEFAULT_VIDEOS = [
  {
    "id": "d23adffc-2fa8-4819-a5f6-c885a825cd05",
    "url": "https://www.youtube.com/watch?v=XqZsoesa55w",
    "title": "Baby Shark Dance",
    "thumbnail": "https://img.youtube.com/vi/XqZsoesa55w/mqdefault.jpg",
    "ageGroup": "0-3",
    "category": "music",
    "channel": "Pinkfong",
    "addedAt": Date.now()
  },
  {
    "id": "19c5ca3c-bb2d-45cf-bc62-66231b91426c",
    "url": "https://www.youtube.com/watch?v=75p-N9YKqNo",
    "title": "ABC Song - Học bảng chữ cái",
    "thumbnail": "https://img.youtube.com/vi/75p-N9YKqNo/mqdefault.jpg",
    "ageGroup": "3-6",
    "category": "english",
    "channel": "Cocomelon",
    "addedAt": Date.now()
  },
  {
    "id": "41201742-12f9-4042-9a9f-57f2af9c48b3",
    "url": "https://www.youtube.com/watch?v=DR-cfDsHCGA",
    "title": "Học đếm số 1-10",
    "thumbnail": "https://img.youtube.com/vi/DR-cfDsHCGA/mqdefault.jpg",
    "ageGroup": "3-6",
    "category": "math",
    "channel": "Kids Learning",
    "addedAt": Date.now()
  }
];

const DEFAULT_CHANNELS = [
  {
    "id": "c4c1d160-c03e-4838-818e-38ce32735ee2",
    "name": "Pinkfong",
    "channelId": "UCcdwLMPsaU2ezNSJU1nFoBQ",
    "ageGroup": "0-3",
    "category": "music"
  },
  {
    "id": "889f5a59-aed3-4e48-b140-0f15bb348e47",
    "name": "Cocomelon",
    "channelId": "UCbCmjCuTUZos6Inko4u57UQ",
    "ageGroup": "0-3",
    "category": "music"
  },
  {
    "id": "649f5399-0f3d-4d15-be14-0b2698ccebe7",
    "name": "Super Simple Songs",
    "channelId": "UCLsooMJoIpl_7ux2jvdPB-Q",
    "ageGroup": "3-6",
    "category": "english"
  }
];

const DEFAULT_USERS = [
  {
    "id": "parent",
    "name": "Phụ huynh",
    "type": "parent",
    "avatar": "👨‍👩‍👧",
    "createdAt": Date.now()
  },
  {
    "id": "45baf2a9-8f46-4392-b495-84af97984b4f",
    "name": "Bé Bi",
    "type": "child",
    "avatar": "👶",
    "ageGroup": "0-3",
    "allowedCategories": ["music", "entertainment"],
    "allowedVideos": [],
    "blockedVideos": [],
    "dailyLimit": 60,
    "createdAt": Date.now()
  },
  {
    "id": "ae7b28a0-b6c0-484a-b101-3044cb3d62fb",
    "name": "Bé Bo",
    "type": "child",
    "avatar": "🧒",
    "ageGroup": "3-6",
    "allowedCategories": ["music", "english", "math", "entertainment"],
    "allowedVideos": [],
    "blockedVideos": [],
    "dailyLimit": 90,
    "createdAt": Date.now()
  }
];

const DEFAULT_SETTINGS = {
  categories: [
    { id: "math", name: "Toán học", icon: "🔢", color: "#ff6b6b" },
    { id: "english", name: "Anh văn", icon: "🇬🇧", color: "#4ecdc4" },
    { id: "communication", name: "Giao tiếp", icon: "💬", color: "#45b7d1" },
    { id: "thinking", name: "Tư duy", icon: "🧠", color: "#96ceb4" },
    { id: "entertainment", name: "Giải trí", icon: "🎮", color: "#ffeaa7" },
    { id: "learning", name: "Học tập", icon: "📚", color: "#dfe6e9" },
    { id: "music", name: "Âm nhạc", icon: "🎵", color: "#fd79a8" },
    { id: "science", name: "Khoa học", icon: "🔬", color: "#a29bfe" }
  ],
  dailyLimit: 60
};

// Helper functions for localStorage
const getFromStorage = (key, defaultValue) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default value
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  } catch (error) {
    console.error(`Storage Error (${key}):`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Storage Save Error (${key}):`, error);
    return false;
  }
};

const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Videos API (localStorage)
export const videosAPI = {
  getAll: async () => {
    return getFromStorage(STORAGE_KEYS.VIDEOS, DEFAULT_VIDEOS);
  },

  getForUser: async (userId) => {
    const videos = getFromStorage(STORAGE_KEYS.VIDEOS, DEFAULT_VIDEOS);
    const users = getFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const user = users.find(u => u.id === userId);

    if (!user || user.type === 'parent') {
      return videos;
    }

    // Filter videos based on user's allowed categories and age group
    return videos.filter(video => {
      // Check blocked videos
      if (user.blockedVideos?.includes(video.id)) return false;

      // Check allowed videos (if specified, only show those)
      if (user.allowedVideos?.length > 0) {
        return user.allowedVideos.includes(video.id);
      }

      // Check category
      if (user.allowedCategories?.length > 0 && !user.allowedCategories.includes(video.category)) {
        return false;
      }

      // Check age group
      if (video.ageGroup !== 'all' && user.ageGroup && video.ageGroup !== user.ageGroup) {
        // Allow videos for younger age groups
        const ageOrder = ['0-3', '3-6', '6-9', '9-12', 'all'];
        const videoAgeIndex = ageOrder.indexOf(video.ageGroup);
        const userAgeIndex = ageOrder.indexOf(user.ageGroup);
        if (videoAgeIndex > userAgeIndex) return false;
      }

      return true;
    });
  },

  create: async (video) => {
    const videos = getFromStorage(STORAGE_KEYS.VIDEOS, DEFAULT_VIDEOS);
    const newVideo = {
      ...video,
      id: generateId(),
      addedAt: Date.now()
    };
    videos.push(newVideo);
    saveToStorage(STORAGE_KEYS.VIDEOS, videos);
    return newVideo;
  },

  update: async (id, updates) => {
    const videos = getFromStorage(STORAGE_KEYS.VIDEOS, DEFAULT_VIDEOS);
    const index = videos.findIndex(v => v.id === id);
    if (index !== -1) {
      videos[index] = { ...videos[index], ...updates };
      saveToStorage(STORAGE_KEYS.VIDEOS, videos);
      return videos[index];
    }
    throw new Error('Video not found');
  },

  delete: async (id) => {
    const videos = getFromStorage(STORAGE_KEYS.VIDEOS, DEFAULT_VIDEOS);
    const filtered = videos.filter(v => v.id !== id);
    saveToStorage(STORAGE_KEYS.VIDEOS, filtered);
    return { success: true };
  }
};

// Channels API (localStorage)
export const channelsAPI = {
  getAll: async () => {
    return getFromStorage(STORAGE_KEYS.CHANNELS, DEFAULT_CHANNELS);
  },

  create: async (channel) => {
    const channels = getFromStorage(STORAGE_KEYS.CHANNELS, DEFAULT_CHANNELS);
    const newChannel = {
      ...channel,
      id: generateId()
    };
    channels.push(newChannel);
    saveToStorage(STORAGE_KEYS.CHANNELS, channels);
    return newChannel;
  },

  delete: async (id) => {
    const channels = getFromStorage(STORAGE_KEYS.CHANNELS, DEFAULT_CHANNELS);
    const filtered = channels.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CHANNELS, filtered);
    return { success: true };
  }
};

// Users API (localStorage)
export const usersAPI = {
  getAll: async () => {
    return getFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  },

  get: async (id) => {
    const users = getFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const user = users.find(u => u.id === id);
    if (user) return user;
    throw new Error('User not found');
  },

  create: async (user) => {
    const users = getFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const newUser = {
      ...user,
      id: generateId(),
      createdAt: Date.now()
    };
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  update: async (id, updates) => {
    const users = getFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      saveToStorage(STORAGE_KEYS.USERS, users);
      return users[index];
    }
    throw new Error('User not found');
  },

  delete: async (id) => {
    const users = getFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const filtered = users.filter(u => u.id !== id);
    saveToStorage(STORAGE_KEYS.USERS, filtered);
    return { success: true };
  }
};

// Settings API (localStorage)
export const settingsAPI = {
  get: async () => {
    return getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  update: async (settings) => {
    const current = getFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const updated = { ...current, ...settings };
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }
};

// Utility: Reset all data to defaults
export const resetAllData = () => {
  localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(DEFAULT_VIDEOS));
  localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(DEFAULT_CHANNELS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  return true;
};
