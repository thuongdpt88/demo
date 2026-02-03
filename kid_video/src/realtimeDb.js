/**
 * Firebase Realtime Database API
 * Đơn giản hơn Firestore, dễ setup hơn
 */

import { db } from './firebase';
import { ref, get, set, push, remove, update, onValue } from 'firebase/database';

// Default data
const DEFAULT_VIDEOS = [
  { id: "v001", url: "https://www.youtube.com/watch?v=XqZsoesa55w", title: "Baby Shark Dance - Pinkfong", thumbnail: "https://img.youtube.com/vi/XqZsoesa55w/mqdefault.jpg", ageGroup: "0-3", category: "music", channel: "Pinkfong" },
  { id: "v002", url: "https://www.youtube.com/watch?v=e_04ZrNroTo", title: "Wheels on the Bus - Cocomelon", thumbnail: "https://img.youtube.com/vi/e_04ZrNroTo/mqdefault.jpg", ageGroup: "0-3", category: "music", channel: "Cocomelon" },
  { id: "v003", url: "https://www.youtube.com/watch?v=75NQK-Sm1YY", title: "Baby Bus - Five Little Ducks", thumbnail: "https://img.youtube.com/vi/75NQK-Sm1YY/mqdefault.jpg", ageGroup: "0-3", category: "music", channel: "BabyBus" },
  { id: "v004", url: "https://www.youtube.com/watch?v=_UR-l3QI2nE", title: "ABC Song - Học bảng chữ cái", thumbnail: "https://img.youtube.com/vi/_UR-l3QI2nE/mqdefault.jpg", ageGroup: "3-6", category: "english", channel: "Pinkfong" },
  { id: "v005", url: "https://www.youtube.com/watch?v=ZanHgPprl-0", title: "Phonics Song - Học phát âm", thumbnail: "https://img.youtube.com/vi/ZanHgPprl-0/mqdefault.jpg", ageGroup: "3-6", category: "english", channel: "Pinkfong" },
  { id: "v006", url: "https://www.youtube.com/watch?v=L0MK7qz13bU", title: "Numbers Song - Học đếm số", thumbnail: "https://img.youtube.com/vi/L0MK7qz13bU/mqdefault.jpg", ageGroup: "3-6", category: "english", channel: "Pinkfong" },
  { id: "v007", url: "https://www.youtube.com/watch?v=QkHQ0CYwjaI", title: "Counting 1-100 - Đếm số", thumbnail: "https://img.youtube.com/vi/QkHQ0CYwjaI/mqdefault.jpg", ageGroup: "3-6", category: "math", channel: "Jack Hartmann" },
  { id: "v008", url: "https://www.youtube.com/watch?v=teMdjJ3w9iM", title: "Five Little Monkeys - Học đếm", thumbnail: "https://img.youtube.com/vi/teMdjJ3w9iM/mqdefault.jpg", ageGroup: "3-6", category: "math", channel: "Super Simple Songs" }
];

const DEFAULT_CHANNELS = [
  { id: "c001", name: "Pinkfong", channelId: "UCcdwLMPsaU2ezNSJU1nFoBQ", ageGroup: "0-3", category: "music" },
  { id: "c002", name: "Cocomelon", channelId: "UCbCmjCuTUZos6Inko4u57UQ", ageGroup: "0-3", category: "music" },
  { id: "c003", name: "Super Simple Songs", channelId: "UCLsooMJoIpl_7ux2jvdPB-Q", ageGroup: "3-6", category: "english" }
];

const DEFAULT_USERS = [
  { id: "parent", name: "Phụ huynh", type: "parent", avatar: "👨‍👩‍👧" },
  { id: "user001", name: "Bé Bi", type: "child", avatar: "👶", ageGroup: "0-3", dailyLimit: 60, allowedCategories: ["music", "entertainment"] },
  { id: "user002", name: "Bé Bo", type: "child", avatar: "🧒", ageGroup: "3-6", dailyLimit: 90, allowedCategories: ["music", "english", "math"] }
];

const DEFAULT_SETTINGS = { dailyLimit: 60, parentPin: "1234" };

// Helper: Convert object to array
const objectToArray = (obj) => {
  if (!obj) return [];
  return Object.keys(obj).map(key => ({ ...obj[key], id: key }));
};

// ============ INITIALIZATION ============
export const initDatabase = async () => {
  try {
    const videosSnap = await get(ref(db, 'videos'));

    if (!videosSnap.exists()) {
      console.log('Initializing database with default data...');
      await seedDefaultData();
    }

    return await getAllData();
  } catch (error) {
    console.error('Firebase init error:', error);
    return {
      videos: DEFAULT_VIDEOS,
      channels: DEFAULT_CHANNELS,
      users: DEFAULT_USERS,
      settings: DEFAULT_SETTINGS
    };
  }
};

const seedDefaultData = async () => {
  const videosObj = {};
  DEFAULT_VIDEOS.forEach(v => { videosObj[v.id] = v; });

  const channelsObj = {};
  DEFAULT_CHANNELS.forEach(c => { channelsObj[c.id] = c; });

  const usersObj = {};
  DEFAULT_USERS.forEach(u => { usersObj[u.id] = u; });

  await set(ref(db, 'videos'), videosObj);
  await set(ref(db, 'channels'), channelsObj);
  await set(ref(db, 'users'), usersObj);
  await set(ref(db, 'settings'), DEFAULT_SETTINGS);
};

const getAllData = async () => {
  const [videosSnap, channelsSnap, usersSnap, settingsSnap] = await Promise.all([
    get(ref(db, 'videos')),
    get(ref(db, 'channels')),
    get(ref(db, 'users')),
    get(ref(db, 'settings'))
  ]);

  return {
    videos: objectToArray(videosSnap.val()),
    channels: objectToArray(channelsSnap.val()),
    users: objectToArray(usersSnap.val()),
    settings: settingsSnap.val() || DEFAULT_SETTINGS
  };
};

// ============ VIDEOS ============
export const getVideos = async () => {
  const snap = await get(ref(db, 'videos'));
  return objectToArray(snap.val());
};

export const addVideo = async (video) => {
  const id = video.id || `v${Date.now()}`;
  const newVideo = { ...video, id, addedAt: Date.now() };
  await set(ref(db, `videos/${id}`), newVideo);
  return newVideo;
};

export const updateVideo = async (id, updates) => {
  await update(ref(db, `videos/${id}`), updates);
};

export const deleteVideo = async (id) => {
  await remove(ref(db, `videos/${id}`));
};

// ============ CHANNELS ============
export const getChannels = async () => {
  const snap = await get(ref(db, 'channels'));
  return objectToArray(snap.val());
};

export const addChannel = async (channel) => {
  const id = channel.id || `c${Date.now()}`;
  const newChannel = { ...channel, id };
  await set(ref(db, `channels/${id}`), newChannel);
  return newChannel;
};

export const deleteChannel = async (id) => {
  await remove(ref(db, `channels/${id}`));
};

// ============ USERS ============
export const getUsers = async () => {
  const snap = await get(ref(db, 'users'));
  return objectToArray(snap.val());
};

export const addUser = async (user) => {
  const id = user.id || `u${Date.now()}`;
  const newUser = { ...user, id, createdAt: Date.now() };
  await set(ref(db, `users/${id}`), newUser);
  return newUser;
};

export const updateUser = async (id, updates) => {
  await update(ref(db, `users/${id}`), updates);
};

export const deleteUser = async (id) => {
  await remove(ref(db, `users/${id}`));
};

// ============ SETTINGS ============
export const getSettings = async () => {
  const snap = await get(ref(db, 'settings'));
  return snap.val() || DEFAULT_SETTINGS;
};

export const updateSettings = async (updates) => {
  await update(ref(db, 'settings'), updates);
};

// ============ REAL-TIME LISTENERS ============
export const subscribeToVideos = (callback) => {
  return onValue(ref(db, 'videos'), (snap) => {
    callback(objectToArray(snap.val()));
  });
};

export const subscribeToUsers = (callback) => {
  return onValue(ref(db, 'users'), (snap) => {
    callback(objectToArray(snap.val()));
  });
};

export const subscribeToChannels = (callback) => {
  return onValue(ref(db, 'channels'), (snap) => {
    callback(objectToArray(snap.val()));
  });
};

// ============ RESET ============
export const resetDatabase = async () => {
  await seedDefaultData();
  return await getAllData();
};

// ============ EXPORT ============
export const downloadDatabase = async () => {
  const data = await getAllData();
  const blob = new Blob([JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kid_video_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importDatabase = async (data) => {
  if (data.videos) {
    const videosObj = {};
    data.videos.forEach(v => { videosObj[v.id] = v; });
    await set(ref(db, 'videos'), videosObj);
  }
  return await getAllData();
};
