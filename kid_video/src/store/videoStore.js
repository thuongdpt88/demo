import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { videosAPI, channelsAPI, usersAPI, settingsAPI } from '../api';

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
      // Data
      videos: [],
      channels: [],
      users: [],
      settings: { categories },

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

      // Loading states
      isLoading: false,
      error: null,

      // ============ INITIALIZATION ============
      initializeData: async () => {
        set({ isLoading: true, error: null });
        try {
          const [videos, channels, users, settings] = await Promise.all([
            videosAPI.getAll(),
            channelsAPI.getAll(),
            usersAPI.getAll(),
            settingsAPI.get()
          ]);
          set({
            videos,
            channels,
            users,
            settings: { ...get().settings, ...settings },
            isLoading: false
          });
        } catch (error) {
          console.error('Failed to initialize data:', error);
          set({ error: error.message, isLoading: false });
        }
      },

      // ============ USER / LOGIN ============
      login: (userId) => {
        const users = get().users;
        const user = users.find(u => u.id === userId);
        if (user) {
          set({
            currentUser: user,
            dailyLimit: user.dailyLimit || 60
          });
          if (user.type === 'child') {
            get().loadVideosForUser(userId);
          }
          return true;
        }
        return false;
      },

      logout: () => {
        set({ currentUser: null, parentMode: false });
      },

      loadVideosForUser: async (userId) => {
        try {
          const videos = await videosAPI.getForUser(userId);
          set({ videos });
        } catch (error) {
          console.error('Failed to load videos for user:', error);
        }
      },

      // ============ VIDEO ACTIONS ============
      addVideo: async (video) => {
        try {
          const newVideo = await videosAPI.create(video);
          set((state) => ({ videos: [...state.videos, newVideo] }));
          return newVideo;
        } catch (error) {
          console.error('Failed to add video:', error);
          throw error;
        }
      },

      updateVideo: async (id, updates) => {
        try {
          const updatedVideo = await videosAPI.update(id, updates);
          set((state) => ({
            videos: state.videos.map(v => v.id === id ? updatedVideo : v)
          }));
          return updatedVideo;
        } catch (error) {
          console.error('Failed to update video:', error);
          throw error;
        }
      },

      deleteVideo: async (id) => {
        try {
          await videosAPI.delete(id);
          set((state) => ({
            videos: state.videos.filter(v => v.id !== id)
          }));
        } catch (error) {
          console.error('Failed to delete video:', error);
          throw error;
        }
      },

      // ============ CHANNEL ACTIONS ============
      addChannel: async (channel) => {
        try {
          const newChannel = await channelsAPI.create(channel);
          set((state) => ({ channels: [...state.channels, newChannel] }));
          return newChannel;
        } catch (error) {
          console.error('Failed to add channel:', error);
          throw error;
        }
      },

      deleteChannel: async (id) => {
        try {
          await channelsAPI.delete(id);
          set((state) => ({
            channels: state.channels.filter(c => c.id !== id)
          }));
        } catch (error) {
          console.error('Failed to delete channel:', error);
          throw error;
        }
      },

      // ============ USER MANAGEMENT ============
      addUser: async (user) => {
        try {
          const newUser = await usersAPI.create(user);
          set((state) => ({ users: [...state.users, newUser] }));
          return newUser;
        } catch (error) {
          console.error('Failed to add user:', error);
          throw error;
        }
      },

      updateUser: async (id, updates) => {
        try {
          const updatedUser = await usersAPI.update(id, updates);
          set((state) => ({
            users: state.users.map(u => u.id === id ? updatedUser : u),
            currentUser: state.currentUser?.id === id ? updatedUser : state.currentUser
          }));
          return updatedUser;
        } catch (error) {
          console.error('Failed to update user:', error);
          throw error;
        }
      },

      deleteUser: async (id) => {
        try {
          await usersAPI.delete(id);
          set((state) => ({
            users: state.users.filter(u => u.id !== id)
          }));
        } catch (error) {
          console.error('Failed to delete user:', error);
          throw error;
        }
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
      setDailyLimit: (limit) => set({ dailyLimit: limit }),

      // ============ FILTERED VIDEOS ============
      getFilteredVideos: () => {
        const state = get();
        let filtered = state.videos;

        if (state.selectedAgeGroup !== 'all') {
          filtered = filtered.filter(v =>
            v.ageGroup === state.selectedAgeGroup || v.ageGroup === 'all'
          );
        }

        if (state.selectedCategory !== 'all') {
          filtered = filtered.filter(v => v.category === state.selectedCategory);
        }

        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(v =>
            v.title.toLowerCase().includes(query) ||
            v.channel.toLowerCase().includes(query) ||
            (v.category && categories.find(c => c.id === v.category)?.name.toLowerCase().includes(query))
          );
        }

        return filtered;
      },

      // ============ RESET ============
      resetToDefaults: async () => {
        try {
          const [videos, channels] = await Promise.all([
            videosAPI.getAll(),
            channelsAPI.getAll()
          ]);
          set({ videos, channels });
        } catch (error) {
          console.error('Failed to reset:', error);
        }
      }
    }),
    {
      name: 'kid-video-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        watchHistory: state.watchHistory,
        favorites: state.favorites,
        todayWatchTime: state.todayWatchTime
      })
    }
  )
);

// Helper to extract YouTube video ID
export const extractYouTubeId = (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Helper to get thumbnail
export const getYouTubeThumbnail = (url) => {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
};
