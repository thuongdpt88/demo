import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaUnlock, FaPlus, FaTrash, FaEdit, FaTimes, FaYoutube, FaTv, FaCog, FaUsers, FaSave, FaUserShield, FaRedo, FaSearch, FaCheck, FaDownload, FaUpload } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { useVideoStore, extractYouTubeId, getYouTubeThumbnail, categories } from '../store/videoStore';
import './ParentMode.css';

// Generate random math question
const generateMathQuestion = () => {
  const operations = ['+', '-', '×'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let num1, num2, answer;

  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 20) + 1;
      num2 = Math.floor(Math.random() * 20) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * num1);
      answer = num1 - num2;
      break;
    case '×':
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
      break;
    default:
      num1 = 1;
      num2 = 1;
      answer = 2;
  }

  return {
    question: `${num1} ${operation} ${num2} = ?`,
    answer: answer.toString()
  };
};

const avatars = ['👶', '🧒', '👦', '👧', '🧒🏻', '👦🏻', '👧🏻', '🐻', '🐰', '🦊', '🐱', '🐶'];

// Validate if video is available on YouTube
const validateVideoAvailability = async (url) => {
  const videoId = extractYouTubeId(url);
  if (!videoId) return { valid: false, error: 'URL không hợp lệ' };

  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (response.ok) {
      const data = await response.json();
      return {
        valid: true,
        title: data.title,
        channel: data.author_name,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      };
    } else if (response.status === 404) {
      return { valid: false, error: 'Video không tồn tại hoặc đã bị xóa' };
    } else if (response.status === 401) {
      return { valid: false, error: 'Video bị hạn chế, không thể nhúng' };
    }
    return { valid: false, error: 'Không thể kiểm tra video' };
  } catch (error) {
    console.log('Validation failed:', error);
    return { valid: false, error: 'Lỗi kết nối, không thể kiểm tra video' };
  }
};

// Fetch video info from YouTube URL using oEmbed
const fetchVideoInfo = async (url) => {
  const result = await validateVideoAvailability(url);
  if (result.valid) {
    return {
      title: result.title,
      channel: result.channel,
      thumbnail: result.thumbnail
    };
  }
  return null;
};

// Fetch channel videos using YouTube RSS feed (no API key needed)
const fetchChannelVideos = async (channelId, channelName) => {
  try {
    // Use a CORS proxy for the RSS feed
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    // Try using allorigins.win as CORS proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;

    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Failed to fetch');

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const entries = xmlDoc.querySelectorAll('entry');
    const videos = [];

    entries.forEach((entry, index) => {
      if (index >= 20) return; // Limit to 20 videos

      const videoId = entry.querySelector('yt\\:videoId, videoId')?.textContent;
      const title = entry.querySelector('title')?.textContent;
      const published = entry.querySelector('published')?.textContent;

      if (videoId && title) {
        videos.push({
          id: videoId,
          videoId: videoId,
          title: title,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          channel: channelName,
          publishedAt: published
        });
      }
    });

    return videos;
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    return [];
  }
};

// Search YouTube videos (using Invidious API - no key needed)
const searchYouTubeVideos = async (query, channelName = '') => {
  try {
    // Use Invidious API instances for search
    const searchQuery = channelName ? `${query} ${channelName}` : query;
    const apiUrl = `https://inv.nadeko.net/api/v1/search?q=${encodeURIComponent(searchQuery)}&type=video`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Search failed');

    const data = await response.json();

    return data.slice(0, 20).map(video => ({
      id: video.videoId,
      videoId: video.videoId,
      title: video.title,
      thumbnail: `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      channel: video.author || channelName,
      duration: video.lengthSeconds
    }));
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
};

function ParentMode({ inHeader = false }) {
  const {
    parentMode,
    toggleParentMode,
    videos,
    channels,
    users,
    addVideo,
    deleteVideo,
    addChannel,
    deleteChannel,
    addUser,
    updateUser,
    deleteUser,
    dailyLimit,
    setDailyLimit,
    resetToDefaults,
    initializeData
  } = useVideoStore();

  const [showPinModal, setShowPinModal] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState('videos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVideo, setNewVideo] = useState({ url: '', title: '', channel: '', ageGroup: 'all', category: 'entertainment' });
  const [newChannel, setNewChannel] = useState({ name: '', channelId: '', ageGroup: 'all', category: 'entertainment' });
  const [newUser, setNewUser] = useState({ name: '', avatar: '👶', ageGroup: '0-3', dailyLimit: 60, allowedCategories: [] });
  const [showSettings, setShowSettings] = useState(false);
  const [mathQuestion, setMathQuestion] = useState(() => generateMathQuestion());
  const [editingUser, setEditingUser] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  // States for YouTube search
  const [searchMode, setSearchMode] = useState('url'); // 'url' or 'search'
  const [selectedChannel, setSelectedChannel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]); // Selected videos to add
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);

  const childUsers = users.filter(u => u.type === 'child');

  // Export data to file
  const handleExportData = () => {
    const data = {
      videos,
      channels,
      users,
      settings: { dailyLimit },
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kid_video_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSaveMessage('✅ Đã xuất dữ liệu thành công!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Import data from file
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.videos && Array.isArray(data.videos)) {
          // Import videos
          for (const video of data.videos) {
            if (!videos.find(v => v.id === video.id)) {
              addVideo(video);
            }
          }
        }
        if (data.channels && Array.isArray(data.channels)) {
          for (const channel of data.channels) {
            if (!channels.find(c => c.id === channel.id)) {
              addChannel(channel);
            }
          }
        }
        if (data.users && Array.isArray(data.users)) {
          for (const user of data.users) {
            if (!users.find(u => u.id === user.id)) {
              addUser(user);
            }
          }
        }
        setSaveMessage('✅ Đã nhập dữ liệu thành công!');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (err) {
        setSaveMessage('❌ File không hợp lệ');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  // Auto fetch video info when URL changes
  useEffect(() => {
    const fetchInfo = async () => {
      if (newVideo.url && extractYouTubeId(newVideo.url)) {
        setIsFetchingInfo(true);
        const info = await fetchVideoInfo(newVideo.url);
        if (info) {
          setNewVideo(prev => ({
            ...prev,
            title: prev.title || info.title,
            channel: prev.channel || info.channel
          }));
        }
        setIsFetchingInfo(false);
      }
    };

    const debounce = setTimeout(fetchInfo, 500);
    return () => clearTimeout(debounce);
  }, [newVideo.url]);

  // Fetch channel videos when channel is selected
  useEffect(() => {
    const loadChannelVideos = async () => {
      if (selectedChannel && searchMode === 'search') {
        setIsSearching(true);
        setSearchResults([]);
        const channel = channels.find(c => c.id === selectedChannel);
        if (channel) {
          const videos = await fetchChannelVideos(channel.channelId, channel.name);
          setSearchResults(videos);
        }
        setIsSearching(false);
      }
    };

    loadChannelVideos();
  }, [selectedChannel, searchMode, channels]);

  // Handle search within channel
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If no query, reload channel videos
      if (selectedChannel) {
        setIsSearching(true);
        const channel = channels.find(c => c.id === selectedChannel);
        if (channel) {
          const videos = await fetchChannelVideos(channel.channelId, channel.name);
          setSearchResults(videos);
        }
        setIsSearching(false);
      }
      return;
    }

    setIsSearching(true);
    const channel = channels.find(c => c.id === selectedChannel);
    const channelName = channel?.name || '';

    // Search with channel name to filter results
    const results = await searchYouTubeVideos(searchQuery, channelName);
    setSearchResults(results);
    setIsSearching(false);
  };

  // Toggle video selection
  const toggleVideoSelection = (video) => {
    setSelectedVideos(prev => {
      const exists = prev.find(v => v.videoId === video.videoId);
      if (exists) {
        return prev.filter(v => v.videoId !== video.videoId);
      } else {
        return [...prev, video];
      }
    });
  };

  // Check if video is selected
  const isVideoSelected = (videoId) => {
    return selectedVideos.some(v => v.videoId === videoId);
  };

  // Check if video already exists in library
  const isVideoInLibrary = (videoId) => {
    return videos.some(v => extractYouTubeId(v.url) === videoId);
  };

  // Add selected videos to library
  const handleAddSelectedVideos = async () => {
    if (selectedVideos.length === 0) return;

    const channel = channels.find(c => c.id === selectedChannel);

    try {
      for (const video of selectedVideos) {
        await addVideo({
          url: video.url,
          title: video.title,
          channel: video.channel || channel?.name || '',
          thumbnail: video.thumbnail,
          ageGroup: channel?.ageGroup || 'all',
          category: channel?.category || 'entertainment'
        });
      }
      setSaveMessage(`✅ Đã thêm ${selectedVideos.length} video!`);
      setTimeout(() => setSaveMessage(''), 2000);
      setSelectedVideos([]);
      setSearchResults([]);
      setSearchQuery('');
      setShowAddModal(false);
      setSearchMode('url');
    } catch (error) {
      setSaveMessage('❌ Lỗi khi lưu!');
    }
  };

  const handleUnlock = () => {
    if (parentMode) {
      toggleParentMode();
      return;
    }
    setMathQuestion(generateMathQuestion());
    setShowPinModal(true);
    setMathAnswer('');
    setPinError('');
  };

  const handleMathSubmit = () => {
    if (mathAnswer === mathQuestion.answer) {
      toggleParentMode('bypass');
      setShowPinModal(false);
      setMathAnswer('');
      setPinError('');
    } else {
      setPinError('Sai rồi! Thử lại nhé 😊');
      setMathQuestion(generateMathQuestion());
      setMathAnswer('');
    }
  };

  const handleAddVideo = async () => {
    if (!newVideo.url || !newVideo.title) return;

    // Validate video availability before adding
    setSaveMessage('🔄 Đang kiểm tra video...');
    const validation = await validateVideoAvailability(newVideo.url);

    if (!validation.valid) {
      setSaveMessage(`❌ ${validation.error}`);
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    const thumbnail = getYouTubeThumbnail(newVideo.url);

    try {
      await addVideo({
        ...newVideo,
        thumbnail: thumbnail || 'https://via.placeholder.com/320x180?text=Video'
      });
      setSaveMessage('✅ Đã lưu video!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      setSaveMessage('❌ Lỗi khi lưu!');
    }

    setNewVideo({ url: '', title: '', channel: '', ageGroup: 'all', category: 'entertainment' });
    setShowAddModal(false);
    setSearchMode('url');
    setSearchResults([]);
    setSelectedVideos([]);
  };

  const handleAddChannel = async () => {
    if (!newChannel.name || !newChannel.channelId) return;
    try {
      await addChannel(newChannel);
      setSaveMessage('✅ Đã lưu kênh!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      setSaveMessage('❌ Lỗi khi lưu!');
    }
    setNewChannel({ name: '', channelId: '', ageGroup: 'all', category: 'entertainment' });
    setShowAddModal(false);
  };

  const handleAddUser = async () => {
    if (!newUser.name) return;
    try {
      await addUser(newUser);
      setSaveMessage('✅ Đã thêm bé!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      setSaveMessage('❌ Lỗi khi lưu!');
    }
    setNewUser({ name: '', avatar: '👶', ageGroup: '0-3', dailyLimit: 60, allowedCategories: [] });
    setShowAddModal(false);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, editingUser);
      setSaveMessage('✅ Đã cập nhật!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      setSaveMessage('❌ Lỗi khi lưu!');
    }
    setEditingUser(null);
  };

  const toggleUserCategory = (catId) => {
    if (editingUser) {
      const current = editingUser.allowedCategories || [];
      const updated = current.includes(catId)
        ? current.filter(c => c !== catId)
        : [...current, catId];
      setEditingUser({ ...editingUser, allowedCategories: updated });
    } else {
      const current = newUser.allowedCategories || [];
      const updated = current.includes(catId)
        ? current.filter(c => c !== catId)
        : [...current, catId];
      setNewUser({ ...newUser, allowedCategories: updated });
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setSearchMode('url');
    setSearchResults([]);
    setSelectedVideos([]);
    setSearchQuery('');
    setSelectedChannel('');
  };

  return (
    <>
      {/* Parent Mode Toggle Button */}
      <motion.button
        className={`parent-mode-btn ${inHeader ? 'in-header' : ''}`}
        onClick={handleUnlock}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={parentMode ? 'Thoát chế độ phụ huynh' : 'Chế độ phụ huynh'}
      >
        <FaUserShield />
        {inHeader && <span className="btn-label">Phụ huynh</span>}
      </motion.button>

      {/* Math Question Modal - using Portal */}
      {createPortal(
        <AnimatePresence>
          {showPinModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPinModal(false)}
            >
              <motion.div
                className="pin-modal math-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3>🧮 Giải bài toán để vào</h3>
                <p className="pin-hint">Chỉ người lớn mới giải được nhanh!</p>

                <div className="math-question">
                  {mathQuestion.question}
                </div>

                <input
                  type="number"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  placeholder="Nhập đáp án..."
                  className="pin-input math-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleMathSubmit()}
                  autoFocus
                />
                {pinError && <p className="pin-error">{pinError}</p>}
                <div className="pin-actions">
                  <button className="cancel-btn" onClick={() => setShowPinModal(false)}>Hủy</button>
                  <button className="submit-btn" onClick={handleMathSubmit}>Trả lời</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Parent Control Panel - using Portal */}
      {createPortal(
        <AnimatePresence>
          {parentMode && (
            <>
              {/* Backdrop overlay */}
              <motion.div
                className="panel-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => toggleParentMode()}
              />
              <motion.div
                className="parent-panel"
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="panel-header">
                  <h3>👨‍👩‍👧 Chế độ phụ huynh</h3>
                  <div className="panel-header-actions">
                    <button className="settings-btn" onClick={() => setShowSettings(!showSettings)} title="Cài đặt">
                      ⚙️
                    </button>
                    <button className="close-panel-btn" onClick={() => toggleParentMode()} title="Đóng">
                      ✕
                    </button>
                  </div>
                </div>

                {/* Settings Section */}
                {showSettings && (
                  <div className="settings-section">
                    <h4>⚙️ Cài đặt</h4>

                    {/* Export/Import */}
                    <div className="setting-group">
                      <label>💾 Sao lưu dữ liệu:</label>
                      <p className="storage-note" style={{marginTop: 0}}>
                        Dữ liệu lưu trong trình duyệt. Dùng Xuất/Nhập để chia sẻ giữa các thiết bị.
                      </p>
                      <div className="storage-actions">
                        <button className="export-btn" onClick={handleExportData}>
                          <FaDownload /> Xuất dữ liệu
                        </button>
                        <label className="import-btn">
                          <FaUpload /> Nhập dữ liệu
                          <input type="file" accept=".json" onChange={handleImportData} hidden />
                        </label>
                      </div>
                    </div>

                    <div className="setting-item">
                      <label>Giới hạn xem/ngày (phút):</label>
                      <input
                        type="number"
                        value={dailyLimit}
                        onChange={(e) => setDailyLimit(Number(e.target.value))}
                        min="10"
                        max="180"
                      />
                    </div>
                    <button className="reset-btn" onClick={resetToDefaults}>
                      🔄 Khôi phục mặc định
                    </button>
                  </div>
                )}

                {/* Tabs */}
                <div className="panel-tabs">
                  <button
                    className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('videos')}
                  >
                    <FaYoutube /> <span className="tab-text">Video</span> <span className="tab-count">({videos.length})</span>
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'channels' ? 'active' : ''}`}
                    onClick={() => setActiveTab('channels')}
                  >
                    <FaTv /> <span className="tab-text">Kênh</span> <span className="tab-count">({channels.length})</span>
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                  >
                    <FaUsers /> <span className="tab-text">Bé</span> <span className="tab-count">({childUsers.length})</span>
                  </button>
                </div>

                {/* Save Message */}
                {saveMessage && (
                  <div className="save-message">{saveMessage}</div>
                )}

                {/* Content */}
                <div className="panel-content">
                  {activeTab === 'videos' && (
                    <>
                      <button className="add-btn" onClick={() => setShowAddModal(true)}>
                        <FaPlus /> Thêm video
                      </button>
                      <div className="item-list">
                        {videos.map((video) => (
                          <div key={video.id} className="list-item">
                            <img src={video.thumbnail} alt={video.title} className="item-thumb" />
                            <div className="item-info">
                              <span className="item-title">{video.title}</span>
                              <span className="item-meta">
                                {video.channel} • {video.ageGroup} • {categories.find(c => c.id === video.category)?.icon || '🎬'}
                              </span>
                            </div>
                            <button className="delete-btn" onClick={() => deleteVideo(video.id)}>
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {activeTab === 'channels' && (
                    <>
                      <button className="add-btn" onClick={() => setShowAddModal(true)}>
                        <FaPlus /> Thêm kênh
                      </button>
                      <div className="item-list">
                        {channels.map((channel) => (
                          <div key={channel.id} className="list-item">
                            <div className="channel-icon">📺</div>
                            <div className="item-info">
                              <span className="item-title">{channel.name}</span>
                              <span className="item-meta">{channel.ageGroup} tuổi</span>
                            </div>
                            <button className="delete-btn" onClick={() => deleteChannel(channel.id)}>
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {activeTab === 'users' && (
                    <>
                      <button className="add-btn" onClick={() => { setEditingUser(null); setShowAddModal(true); }}>
                        <FaPlus /> Thêm bé
                      </button>
                      <div className="item-list">
                        {childUsers.map((user) => (
                          <div key={user.id} className="list-item">
                            <div className="channel-icon">{user.avatar}</div>
                            <div className="item-info">
                              <span className="item-title">{user.name}</span>
                              <span className="item-meta">{user.ageGroup} tuổi • {user.dailyLimit}p/ngày</span>
                            </div>
                            <button className="edit-btn" onClick={() => setEditingUser(user)}>
                              ✏️
                            </button>
                            <button className="delete-btn" onClick={() => deleteUser(user.id)}>
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Edit User Modal - using Portal */}
      {createPortal(
        <AnimatePresence>
          {editingUser && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
            >
              <motion.div
                className="add-modal modal-scrollable"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="close-modal" onClick={() => setEditingUser(null)}>
                  <FaTimes />
                </button>
                <div className="modal-scroll-content">
                  <h3>✏️ Chỉnh sửa: {editingUser.name}</h3>

                  <div className="form-group">
                    <label>Tên:</label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Avatar:</label>
                    <div className="avatar-picker">
                      {avatars.map(av => (
                        <button
                          key={av}
                          className={`avatar-btn ${editingUser.avatar === av ? 'active' : ''}`}
                          onClick={() => setEditingUser({ ...editingUser, avatar: av })}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Độ tuổi:</label>
                    <select
                      value={editingUser.ageGroup || '0-3'}
                      onChange={(e) => setEditingUser({ ...editingUser, ageGroup: e.target.value })}
                    >
                      <option value="0-3">0-3 tuổi</option>
                      <option value="3-6">3-6 tuổi</option>
                      <option value="6-9">6-9 tuổi</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Giới hạn xem/ngày (phút):</label>
                    <input
                      type="number"
                      value={editingUser.dailyLimit}
                      onChange={(e) => setEditingUser({ ...editingUser, dailyLimit: Number(e.target.value) })}
                      min="10"
                      max="180"
                    />
                  </div>

                  <div className="form-group">
                    <label>Chủ đề được phép xem:</label>
                    <div className="category-picker">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          className={`category-chip ${(editingUser.allowedCategories || []).includes(cat.id) ? 'active' : ''}`}
                          style={{ '--cat-color': cat.color }}
                          onClick={() => toggleUserCategory(cat.id)}
                        >
                          {cat.icon} {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="submit-btn save-btn" onClick={handleUpdateUser}>
                    💾 Lưu thay đổi
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Add Modal - using Portal */}
      {createPortal(
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAddModal}
            >
              <motion.div
                className="add-modal modal-scrollable"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="close-modal" onClick={closeAddModal}>
                  ✕
                </button>

                <div className="modal-scroll-content">
                  {activeTab === 'videos' && (
                    <>
                      <h3>🎬 Thêm video mới</h3>

                      {/* Mode Toggle */}
                      {channels.length > 0 && (
                        <div className="mode-toggle">
                          <button
                            className={`mode-btn ${searchMode === 'url' ? 'active' : ''}`}
                            onClick={() => {
                              setSearchMode('url');
                              setSearchResults([]);
                              setSelectedVideos([]);
                            }}
                          >
                            🔗 Nhập URL
                          </button>
                          <button
                            className={`mode-btn ${searchMode === 'search' ? 'active' : ''}`}
                            onClick={() => setSearchMode('search')}
                          >
                            🔍 Tìm từ kênh
                          </button>
                        </div>
                      )}

                      {/* Search from Channel Mode */}
                      {searchMode === 'search' && channels.length > 0 && (
                        <div className="channel-search-section">
                          <div className="form-group">
                            <label>Chọn kênh:</label>
                            <select
                              value={selectedChannel}
                              onChange={(e) => {
                                setSelectedChannel(e.target.value);
                                setSearchResults([]);
                                setSelectedVideos([]);
                                setSearchQuery('');
                              }}
                            >
                              <option value="">-- Chọn kênh --</option>
                              {channels.map(ch => (
                                <option key={ch.id} value={ch.id}>{ch.name}</option>
                              ))}
                            </select>
                          </div>

                          {selectedChannel && (
                            <>
                              {/* Search Box */}
                              <div className="search-box">
                                <div className="search-input-wrapper">
                                  <FaSearch className="search-icon" />
                                  <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tìm video trong kênh..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                  />
                                </div>
                                <button className="search-btn" onClick={handleSearch} disabled={isSearching}>
                                  {isSearching ? '⏳' : '🔍'}
                                </button>
                              </div>

                              {/* Search Results */}
                              {isSearching && (
                                <div className="search-loading">
                                  <span className="loading-spinner-small">⏳</span>
                                  <span>Đang tải video từ kênh...</span>
                                </div>
                              )}

                              {!isSearching && searchResults.length > 0 && (
                                <>
                                  <div className="search-results-header">
                                    <span>📺 {searchResults.length} video</span>
                                    {selectedVideos.length > 0 && (
                                      <span className="selected-count">
                                        ✅ Đã chọn: {selectedVideos.length}
                                      </span>
                                    )}
                                  </div>
                                  <div className="search-results">
                                    {searchResults.map(video => {
                                      const inLibrary = isVideoInLibrary(video.videoId);
                                      const selected = isVideoSelected(video.videoId);

                                      return (
                                        <div
                                          key={video.videoId}
                                          className={`search-result-item ${selected ? 'selected' : ''} ${inLibrary ? 'in-library' : ''}`}
                                          onClick={() => !inLibrary && toggleVideoSelection(video)}
                                        >
                                          <div className="result-thumb-wrapper">
                                            <img src={video.thumbnail} alt={video.title} className="result-thumb" />
                                            {selected && (
                                              <div className="check-overlay">
                                                <FaCheck />
                                              </div>
                                            )}
                                            {inLibrary && (
                                              <div className="in-library-badge">
                                                ✓ Đã có
                                              </div>
                                            )}
                                          </div>
                                          <div className="result-info">
                                            <span className="result-title">{video.title}</span>
                                            <span className="result-channel">{video.channel}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {selectedVideos.length > 0 && (
                                    <button className="submit-btn add-selected-btn" onClick={handleAddSelectedVideos}>
                                      <FaPlus /> Thêm {selectedVideos.length} video đã chọn
                                    </button>
                                  )}
                                </>
                              )}

                              {!isSearching && searchResults.length === 0 && selectedChannel && (
                                <div className="no-results">
                                  <p>😕 Không tìm thấy video</p>
                                  <small>Thử tìm kiếm với từ khóa khác hoặc kiểm tra Channel ID</small>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* URL Mode */}
                      {searchMode === 'url' && (
                        <>
                          <div className="form-group">
                            <label>URL YouTube:</label>
                            <div className="input-with-icon">
                              <input
                                type="url"
                                value={newVideo.url}
                                onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                                placeholder="https://www.youtube.com/watch?v=..."
                              />
                              {isFetchingInfo && <span className="loading-spinner">⏳</span>}
                            </div>
                          </div>

                          {newVideo.url && extractYouTubeId(newVideo.url) && (
                            <div className="video-preview">
                              <img
                                src={`https://img.youtube.com/vi/${extractYouTubeId(newVideo.url)}/mqdefault.jpg`}
                                alt="Preview"
                                className="preview-thumb"
                              />
                            </div>
                          )}

                          <div className="form-group">
                            <label>Tiêu đề: {isFetchingInfo && <span className="auto-fill-hint">(đang tải...)</span>}</label>
                            <input
                              type="text"
                              value={newVideo.title}
                              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                              placeholder="Tên video..."
                            />
                          </div>

                          <div className="form-group">
                            <label>Kênh:</label>
                            <input
                              type="text"
                              value={newVideo.channel}
                              onChange={(e) => setNewVideo({ ...newVideo, channel: e.target.value })}
                              placeholder="Tên kênh..."
                            />
                          </div>

                          <div className="form-group">
                            <label>Độ tuổi:</label>
                            <select
                              value={newVideo.ageGroup}
                              onChange={(e) => setNewVideo({ ...newVideo, ageGroup: e.target.value })}
                            >
                              <option value="all">Mọi lứa tuổi</option>
                              <option value="0-3">0-3 tuổi</option>
                              <option value="3-6">3-6 tuổi</option>
                              <option value="6-9">6-9 tuổi</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Chủ đề:</label>
                            <select
                              value={newVideo.category || 'entertainment'}
                              onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                            >
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                              ))}
                            </select>
                          </div>

                          <button className="submit-btn" onClick={handleAddVideo}>
                            <FaPlus /> Thêm video
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {activeTab === 'channels' && (
                    <>
                      <h3>📺 Thêm kênh mới</h3>
                      <div className="form-group">
                        <label>Tên kênh:</label>
                        <input
                          type="text"
                          value={newChannel.name}
                          onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                          placeholder="Tên kênh..."
                        />
                      </div>
                      <div className="form-group">
                        <label>Channel ID:</label>
                        <input
                          type="text"
                          value={newChannel.channelId}
                          onChange={(e) => setNewChannel({ ...newChannel, channelId: e.target.value })}
                          placeholder="UCxxxxxx..."
                        />
                        <small className="form-hint">Lấy từ URL kênh YouTube: youtube.com/channel/[Channel ID]</small>
                      </div>
                      <div className="form-group">
                        <label>Độ tuổi:</label>
                        <select
                          value={newChannel.ageGroup}
                          onChange={(e) => setNewChannel({ ...newChannel, ageGroup: e.target.value })}
                        >
                          <option value="all">Mọi lứa tuổi</option>
                          <option value="0-3">0-3 tuổi</option>
                          <option value="3-6">3-6 tuổi</option>
                          <option value="6-9">6-9 tuổi</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Chủ đề:</label>
                        <select
                          value={newChannel.category || 'entertainment'}
                          onChange={(e) => setNewChannel({ ...newChannel, category: e.target.value })}
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <button className="submit-btn" onClick={handleAddChannel}>
                        <FaPlus /> Thêm kênh
                      </button>
                    </>
                  )}

                  {activeTab === 'users' && (
                    <>
                      <h3>👶 Thêm bé mới</h3>
                      <div className="form-group">
                        <label>Tên:</label>
                        <input
                          type="text"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          placeholder="Tên bé..."
                        />
                      </div>

                      <div className="form-group">
                        <label>Avatar:</label>
                        <div className="avatar-picker">
                          {avatars.map(av => (
                            <button
                              key={av}
                              className={`avatar-btn ${newUser.avatar === av ? 'active' : ''}`}
                              onClick={() => setNewUser({ ...newUser, avatar: av })}
                            >
                              {av}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Độ tuổi:</label>
                        <select
                          value={newUser.ageGroup}
                          onChange={(e) => setNewUser({ ...newUser, ageGroup: e.target.value })}
                        >
                          <option value="0-3">0-3 tuổi</option>
                          <option value="3-6">3-6 tuổi</option>
                          <option value="6-9">6-9 tuổi</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Giới hạn xem/ngày (phút):</label>
                        <input
                          type="number"
                          value={newUser.dailyLimit}
                          onChange={(e) => setNewUser({ ...newUser, dailyLimit: Number(e.target.value) })}
                          min="10"
                          max="180"
                        />
                      </div>

                      <div className="form-group">
                        <label>Chủ đề được phép xem:</label>
                        <div className="category-picker">
                          {categories.map(cat => (
                            <button
                              key={cat.id}
                              className={`category-chip ${(newUser.allowedCategories || []).includes(cat.id) ? 'active' : ''}`}
                              style={{ '--cat-color': cat.color }}
                              onClick={() => toggleUserCategory(cat.id)}
                            >
                              {cat.icon} {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button className="submit-btn" onClick={handleAddUser}>
                        <FaPlus /> Thêm bé
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default ParentMode;
