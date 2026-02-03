import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as db from '../realtimeDb';

// Helper to extract YouTube video ID
const extractVideoId = (url) => {
  if (!url) return null;
  if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
    return url;
  }
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Categories
export const categories = [
  { id: 'math', name: 'Toán học', icon: '🔢', color: '#ff6b6b' },
  { id: 'english', name: 'Anh văn', icon: '🇬🇧', color: '#4ecdc4' },
  { id: 'communication', name: 'Giao tiếp', icon: '💬', color: '#45b7d1' },
  { id: 'thinking', name: 'Tư duy', icon: '🧠', color: '#96ceb4' },
  { id: 'entertainment', name: 'Giải trí', icon: '🎮', color: '#ffeaa7' },
  { id: 'learning', name: 'Học tập', icon: '📚', color: '#dfe6e9' },
  { id: 'music', name: 'Âm nhạc', icon: '🎵', color: '#fd79a8' },
  { id: 'science', name: 'Khoa học', icon: '🔬', color: '#a29bfe' }
];

export const useVideoStore = create(
  persist(
    (set, get) => ({
      // Data from JSON database
      videos: [],
      channels: [],
      users: [],
      settings: { categories, dailyLimit: 60 },

      // Current state
      currentVideo: null,
      currentUser: null,
      selectedAgeGroup: 'all',
      selectedCategory: 'all',
      searchQuery: '',

      // Parent mode
      parentMode: false,

      // Watch tracking
      watchHistory: [],
      favorites: [],
      dailyLimit: 60,
      todayWatchTime: 0,

      // Unavailable videos
      unavailableVideos: [],

      // Loading
      isLoading: false,
      error: null,

      // ============ DIRECT SETTERS (for real-time sync) ============
      setVideos: (videos) => set({ videos }),
      setUsers: (users) => set({ users }),
      setChannels: (channels) => set({ channels }),

      // ============ INITIALIZATION ============
      initializeData: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await db.initDatabase();
          set({
            videos: data.videos || [],
            channels: data.channels || [],
            users: data.users || [],
            settings: { ...get().settings, ...data.settings },
            dailyLimit: data.settings?.dailyLimit || 60,
            isLoading: false
          });
        } catch (error) {
          console.error('Failed to initialize:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      // ============ VIDEO AVAILABILITY ============
      markVideoUnavailable: (videoId) => {
        const { unavailableVideos } = get();
        if (!unavailableVideos.includes(videoId)) {
          set({ unavailableVideos: [...unavailableVideos, videoId] });
        }
      },

      clearUnavailableVideos: () => set({ unavailableVideos: [] }),

      isVideoAvailable: (videoId) => !get().unavailableVideos.includes(videoId),

      // ============ USER / LOGIN ============
      login: (userId) => {
        const users = get().users;
        const user = users.find(u => u.id === userId);
        if (user) {
          set({
            currentUser: user,
            dailyLimit: user.dailyLimit || 60
          });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUser: null, parentMode: false }),

      // ============ VIDEO ACTIONS ============
      addVideo: async (video) => {
        const newVideo = await db.addVideo(video);
        set((state) => ({ videos: [...state.videos, newVideo] }));
        return newVideo;
      },

      updateVideo: async (id, updates) => {
        await db.updateVideo(id, updates);
        set((state) => ({
          videos: state.videos.map(v => v.id === id ? { ...v, ...updates } : v)
        }));
      },

      deleteVideo: async (id) => {
        await db.deleteVideo(id);
        set((state) => ({ videos: state.videos.filter(v => v.id !== id) }));
      },

      // Add video from YouTube URL
      addVideoFromURL: async (url, category = 'entertainment', ageGroup = 'all') => {
        const videoId = extractVideoId(url);
        if (!videoId) throw new Error('URL YouTube không hợp lệ');

        const existing = get().videos.find(v => extractVideoId(v.url) === videoId);
        if (existing) throw new Error('Video này đã có trong danh sách');

        // Validate via oEmbed
        const response = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        );
        if (!response.ok) throw new Error('Video không tồn tại hoặc không khả dụng');

        const data = await response.json();
        const newVideo = await db.addVideo({
          url: `https://www.youtube.com/watch?v=${videoId}`,
          title: data.title,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          channel: data.author_name,
          category,
          ageGroup
        });

        set((state) => ({ videos: [...state.videos, newVideo] }));
        return newVideo;
      },

      // ============ CHANNEL ACTIONS ============
      addChannel: async (channel) => {
        const newChannel = await db.addChannel(channel);
        set((state) => ({ channels: [...state.channels, newChannel] }));
        return newChannel;
      },

      deleteChannel: async (id) => {
        await db.deleteChannel(id);
        set((state) => ({ channels: state.channels.filter(c => c.id !== id) }));
      },

      // ============ USER MANAGEMENT ============
      addUser: async (user) => {
        const newUser = await db.addUser(user);
        set((state) => ({ users: [...state.users, newUser] }));
        return newUser;
      },

      updateUser: async (id, updates) => {
        await db.updateUser(id, updates);
        set((state) => ({
          users: state.users.map(u => u.id === id ? { ...u, ...updates } : u),
          currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...updates } : state.currentUser
        }));
      },

      deleteUser: async (id) => {
        await db.deleteUser(id);
        set((state) => ({ users: state.users.filter(u => u.id !== id) }));
      },

      // ============ PLAYBACK ============
      setCurrentVideo: (video) => set({ currentVideo: video }),

      // ============ FILTERS ============
      setAgeGroup: (ageGroup) => set({ selectedAgeGroup: ageGroup }),
      setCategory: (category) => set({ selectedCategory: category }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      // ============ PARENT MODE ============
      toggleParentMode: (bypass) => {
        const state = get();
        if (state.parentMode) {
          set({ parentMode: false });
          return true;
        }
        if (bypass === 'bypass') {
          set({ parentMode: true });
          return true;
        }
        return false;
      },

      // ============ WATCH HISTORY ============
      addToHistory: (video) => set((state) => ({
        watchHistory: [
          { ...video, watchedAt: Date.now() },
          ...state.watchHistory.filter(v => v.id !== video.id).slice(0, 49)
        ]
      })),

      // ============ FAVORITES ============
      toggleFavorite: (videoId) => set((state) => ({
        favorites: state.favorites.includes(videoId)
          ? state.favorites.filter(id => id !== videoId)
          : [...state.favorites, videoId]
      })),

      // ============ WATCH TIME ============
      addWatchTime: (minutes) => set((state) => ({
        todayWatchTime: state.todayWatchTime + minutes
      })),

      resetDailyWatchTime: () => set({ todayWatchTime: 0 }),

      setDailyLimit: async (limit) => {
        await db.updateSettings({ dailyLimit: limit });
        set({ dailyLimit: limit });
      },

      // ============ FILTERED VIDEOS ============
      getFilteredVideos: () => {
        const state = get();
        let filtered = state.videos.filter(v => !state.unavailableVideos.includes(v.id));

        if (state.selectedAgeGroup !== 'all') {
          filtered = filtered.filter(v => v.ageGroup === state.selectedAgeGroup || v.ageGroup === 'all');
        }

        if (state.selectedCategory !== 'all') {
          filtered = filtered.filter(v => v.category === state.selectedCategory);
        }

        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(v =>
            v.title?.toLowerCase().includes(query) ||
            v.channel?.toLowerCase().includes(query)
          );
        }

        return filtered;
      },

      // ============ EXPORT/IMPORT ============
      exportData: async () => await db.downloadDatabase(),

      importData: async (jsonData) => {
        const result = await db.importDatabase(jsonData);
        set({
          videos: result.videos,
          channels: result.channels,
          users: result.users
        });
      },

      // ============ RESET ============
      resetToDefaults: async () => {
        const data = await db.resetDatabase();
        set({
          videos: data.videos || [],
          channels: data.channels || [],
          users: data.users || []
        });
      }
    }),
    {
      name: 'kid-video-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        watchHistory: state.watchHistory,
        favorites: state.favorites,
        todayWatchTime: state.todayWatchTime,
        unavailableVideos: state.unavailableVideos
      })
    }
  )
);

// Export helpers
export const extractYouTubeId = extractVideoId;
export const getYouTubeThumbnail = (url) => {
  const videoId = extractVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
};
