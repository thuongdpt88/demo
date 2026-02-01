import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaUnlock, FaPlus, FaTrash, FaEdit, FaTimes, FaYoutube, FaTv, FaCog, FaUsers, FaSave, FaUserShield, FaRedo } from 'react-icons/fa';
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

  const childUsers = users.filter(u => u.type === 'child');

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

    const videoId = extractYouTubeId(newVideo.url);
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
                <FaYoutube /> Video ({videos.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'channels' ? 'active' : ''}`}
                onClick={() => setActiveTab('channels')}
              >
                <FaTv /> Kênh ({channels.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <FaUsers /> Bé ({childUsers.length})
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
                className="add-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="close-modal" onClick={() => setEditingUser(null)}>
                  <FaTimes />
                </button>
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
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                className="add-modal"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="close-modal" onClick={() => setShowAddModal(false)}>
                  <FaTimes />
                </button>

                {activeTab === 'videos' && (
                  <>
                    <h3>🎬 Thêm video mới</h3>
                    <div className="form-group">
                      <label>URL YouTube:</label>
                      <input
                        type="url"
                        value={newVideo.url}
                        onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Tiêu đề:</label>
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
                  <button className="submit-btn" onClick={handleAddVideo}>Thêm video</button>
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
                  <button className="submit-btn" onClick={handleAddChannel}>Thêm kênh</button>
                </>
              )}

              {activeTab === 'users' && (
                <>
                  <h3>👶 Thêm bé mới</h3>
                  <div className="form-group">
                    <label>Tên bé:</label>
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
                  <button className="submit-btn" onClick={handleAddUser}>➕ Thêm bé</button>
                </>
              )}
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
