/**
 * Firebase Firestore Database API
 *
 * Collections:
 * - videos: Danh sách video
 * - channels: Danh sách kênh
 * - users: Danh sách user (parent/child)
 * - settings: Cài đặt chung
 */

import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

// Collection names
const COLLECTIONS = {
  VIDEOS: 'videos',
  CHANNELS: 'channels',
  USERS: 'users',
  SETTINGS: 'settings'
};

// Default data (used when Firestore is empty)
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

const DEFAULT_SETTINGS = {
  dailyLimit: 60,
  parentPin: "1234"
};

// ============ INITIALIZATION ============
export const initDatabase = async () => {
  try {
    // Check if videos collection exists and has data
    const videosSnap = await getDocs(collection(db, COLLECTIONS.VIDEOS));

    if (videosSnap.empty) {
      console.log('Initializing Firestore with default data...');
      await seedDefaultData();
    }

    return await getAllData();
  } catch (error) {
    console.error('Firebase init error:', error);
    // Return default data if Firebase fails
    return {
      videos: DEFAULT_VIDEOS,
      channels: DEFAULT_CHANNELS,
      users: DEFAULT_USERS,
      settings: DEFAULT_SETTINGS
    };
  }
};

// Seed default data to Firestore
const seedDefaultData = async () => {
  // Add videos
  for (const video of DEFAULT_VIDEOS) {
    await setDoc(doc(db, COLLECTIONS.VIDEOS, video.id), video);
  }

  // Add channels
  for (const channel of DEFAULT_CHANNELS) {
    await setDoc(doc(db, COLLECTIONS.CHANNELS, channel.id), channel);
  }

  // Add users
  for (const user of DEFAULT_USERS) {
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), user);
  }

  // Add settings
  await setDoc(doc(db, COLLECTIONS.SETTINGS, 'global'), DEFAULT_SETTINGS);
};

// Get all data from Firestore
const getAllData = async () => {
  const [videosSnap, channelsSnap, usersSnap, settingsSnap] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.VIDEOS)),
    getDocs(collection(db, COLLECTIONS.CHANNELS)),
    getDocs(collection(db, COLLECTIONS.USERS)),
    getDoc(doc(db, COLLECTIONS.SETTINGS, 'global'))
  ]);

  return {
    videos: videosSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    channels: channelsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    users: usersSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    settings: settingsSnap.exists() ? settingsSnap.data() : DEFAULT_SETTINGS
  };
};

// ============ VIDEOS ============
export const getVideos = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.VIDEOS));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addVideo = async (video) => {
  const id = video.id || `v${Date.now()}`;
  const newVideo = { ...video, id, addedAt: Date.now() };
  await setDoc(doc(db, COLLECTIONS.VIDEOS, id), newVideo);
  return newVideo;
};

export const updateVideo = async (id, updates) => {
  await updateDoc(doc(db, COLLECTIONS.VIDEOS, id), updates);
};

export const deleteVideo = async (id) => {
  await deleteDoc(doc(db, COLLECTIONS.VIDEOS, id));
};

// ============ CHANNELS ============
export const getChannels = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.CHANNELS));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addChannel = async (channel) => {
  const id = channel.id || `c${Date.now()}`;
  const newChannel = { ...channel, id };
  await setDoc(doc(db, COLLECTIONS.CHANNELS, id), newChannel);
  return newChannel;
};

export const deleteChannel = async (id) => {
  await deleteDoc(doc(db, COLLECTIONS.CHANNELS, id));
};

// ============ USERS ============
export const getUsers = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.USERS));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addUser = async (user) => {
  const id = user.id || `u${Date.now()}`;
  const newUser = { ...user, id, createdAt: Date.now() };
  await setDoc(doc(db, COLLECTIONS.USERS, id), newUser);
  return newUser;
};

export const updateUser = async (id, updates) => {
  await updateDoc(doc(db, COLLECTIONS.USERS, id), updates);
};

export const deleteUser = async (id) => {
  await deleteDoc(doc(db, COLLECTIONS.USERS, id));
};

// ============ SETTINGS ============
export const getSettings = async () => {
  const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'global'));
  return snap.exists() ? snap.data() : DEFAULT_SETTINGS;
};

export const updateSettings = async (updates) => {
  await updateDoc(doc(db, COLLECTIONS.SETTINGS, 'global'), updates);
};

// ============ REAL-TIME LISTENERS ============
export const subscribeToVideos = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.VIDEOS), (snap) => {
    const videos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(videos);
  });
};

export const subscribeToChannels = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.CHANNELS), (snap) => {
    const channels = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(channels);
  });
};

export const subscribeToUsers = (callback) => {
  return onSnapshot(collection(db, COLLECTIONS.USERS), (snap) => {
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(users);
  });
};

// ============ RESET ============
export const resetDatabase = async () => {
  // Delete all documents
  const videosSnap = await getDocs(collection(db, COLLECTIONS.VIDEOS));
  const channelsSnap = await getDocs(collection(db, COLLECTIONS.CHANNELS));
  const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));

  for (const d of videosSnap.docs) await deleteDoc(d.ref);
  for (const d of channelsSnap.docs) await deleteDoc(d.ref);
  for (const d of usersSnap.docs) await deleteDoc(d.ref);

  // Re-seed with defaults
  await seedDefaultData();
  return await getAllData();
};

// ============ EXPORT/IMPORT ============
export const exportDatabase = async () => {
  const data = await getAllData();
  return {
    ...data,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
};

export const importDatabase = async (data) => {
  if (data.videos?.length) {
    for (const video of data.videos) {
      await setDoc(doc(db, COLLECTIONS.VIDEOS, video.id), video);
    }
  }
  if (data.channels?.length) {
    for (const channel of data.channels) {
      await setDoc(doc(db, COLLECTIONS.CHANNELS, channel.id), channel);
    }
  }
  if (data.users?.length) {
    for (const user of data.users) {
      await setDoc(doc(db, COLLECTIONS.USERS, user.id), user);
    }
  }
  return await getAllData();
};

export const downloadDatabase = async () => {
  const data = await exportDatabase();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kid_video_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
