import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserShield, FaSignOutAlt } from 'react-icons/fa';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import AgeFilter from './components/AgeFilter';
import CategoryFilter from './components/CategoryFilter';
import VideoGrid from './components/VideoGrid';
import VideoPlayer from './components/VideoPlayer';
import ParentMode from './components/ParentMode';
import LoginScreen from './components/LoginScreen';
import { useVideoStore } from './store/videoStore';
import { subscribeToVideos, subscribeToUsers, subscribeToChannels } from './realtimeDb';
import './App.css';

function App() {
  const { currentUser, todayWatchTime, dailyLimit, logout, initializeData, setVideos, setUsers, setChannels } = useVideoStore();
  const watchProgress = Math.min((todayWatchTime / dailyLimit) * 100, 100);

  useEffect(() => {
    initializeData();

    // Real-time sync: Listen for changes from other browsers
    const unsubVideos = subscribeToVideos((videos) => {
      console.log('Videos synced:', videos.length);
      setVideos(videos);
    });

    const unsubUsers = subscribeToUsers((users) => {
      console.log('Users synced:', users.length);
      setUsers(users);
    });

    const unsubChannels = subscribeToChannels((channels) => {
      console.log('Channels synced:', channels.length);
      setChannels(channels);
    });

    // Cleanup on unmount
    return () => {
      unsubVideos();
      unsubUsers();
      unsubChannels();
    };
  }, []);

  // Show login screen if no user logged in
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="app">
      <motion.header
        className="header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content">
          <motion.h1
            className="app-title"
            whileHover={{ scale: 1.05 }}
          >
            🎬 Kid Video
          </motion.h1>
          <p className="app-subtitle">Video an toàn cho bé yêu</p>
        </div>

        <div className="user-info">
          <span className="current-user">
            <span className="user-avatar-small">{currentUser.avatar}</span>
            <span className="user-name-small">{currentUser.name}</span>
          </span>
          <button className="logout-btn" onClick={logout}>
            <FaSignOutAlt /> Đổi bé
          </button>
          <ParentMode inHeader={true} />
        </div>

        <div className="watch-time-indicator">
          <span className="watch-time-label">⏱️ Thời gian xem hôm nay</span>
          <div className="watch-time-bar">
            <motion.div
              className="watch-time-progress"
              initial={{ width: 0 }}
              animate={{ width: `${watchProgress}%` }}
              style={{
                background: watchProgress > 80 ? '#ff6b6b' : watchProgress > 50 ? '#ffa502' : '#84fab0'
              }}
            />
          </div>
          <span className="watch-time-text">{todayWatchTime}/{dailyLimit} phút</span>
        </div>
      </motion.header>

      <main className="main-content">
        <motion.div
          className="controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SearchBar />
          <CategoryFilter />
          <AgeFilter />
        </motion.div>

        <SearchResults />

        <VideoGrid />
      </main>

      <VideoPlayer />

      <footer className="footer">
        <p>🛡️ An toàn & Thân thiện với trẻ em</p>
      </footer>
    </div>
  );
}

export default App;
