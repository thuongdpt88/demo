import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaPlay, FaSpinner, FaChevronDown, FaTimes, FaCheck, FaLink } from 'react-icons/fa';
import { useVideoStore, categories, extractYouTubeId } from '../store/videoStore';
import './SearchResults.css';

function SearchResults() {
  const {
    youtubeSearchResults,
    youtubeSearchQuery,
    youtubeSearchLoading,
    youtubeNextPageToken,
    youtubeTotalResults,
    showYoutubeResults,
    loadMoreYouTubeResults,
    clearYouTubeSearch,
    addVideoFromYouTube,
    addVideoFromURL,
    setCurrentVideo,
    parentMode
  } = useVideoStore();

  const [addingVideo, setAddingVideo] = useState(null);
  const [addedVideos, setAddedVideos] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddByUrlModal, setShowAddByUrlModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('entertainment');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [videoUrl, setVideoUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Show add by URL button even when no search results (for parent mode)
  const showAddByUrlButton = parentMode;

  const handlePlayVideo = (video) => {
    setCurrentVideo({
      id: video.videoId || extractYouTubeId(video.url),
      url: video.url,
      title: video.title,
      thumbnail: video.thumbnail,
      channel: video.channel
    });
  };

  const handleAddClick = (video) => {
    setSelectedVideo(video);
    setShowAddModal(true);
  };

  const handleConfirmAdd = async () => {
    if (!selectedVideo) return;

    setAddingVideo(selectedVideo.videoId);
    try {
      await addVideoFromYouTube(selectedVideo, selectedCategory, selectedAgeGroup);
      setAddedVideos(prev => [...prev, selectedVideo.videoId]);
      setShowAddModal(false);
      setSelectedVideo(null);
    } catch (error) {
      console.error('Failed to add video:', error);
    } finally {
      setAddingVideo(null);
    }
  };

  const handleAddByUrl = async () => {
    if (!videoUrl.trim()) {
      setUrlError('Vui lòng nhập URL video');
      return;
    }

    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      setUrlError('URL YouTube không hợp lệ');
      return;
    }

    setIsValidating(true);
    setUrlError('');

    try {
      await addVideoFromURL(videoUrl, selectedCategory, selectedAgeGroup);
      setShowAddByUrlModal(false);
      setVideoUrl('');
      setUrlError('');
    } catch (error) {
      setUrlError(error.message || 'Không thể thêm video');
    } finally {
      setIsValidating(false);
    }
  };

  const ageGroups = [
    { id: 'all', name: 'Tất cả', icon: '👨‍👩‍👧‍👦' },
    { id: '0-3', name: '0-3 tuổi', icon: '👶' },
    { id: '3-6', name: '3-6 tuổi', icon: '🧒' },
    { id: '6-9', name: '6-9 tuổi', icon: '👦' }
  ];

  // If no search results but parent mode, show add button
  if (!showYoutubeResults && !parentMode) {
    return null;
  }

  return (
    <>
      {/* Add by URL Button for Parent Mode */}
      {parentMode && (
        <motion.div
          className="add-video-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            className="add-by-url-btn"
            onClick={() => setShowAddByUrlModal(true)}
          >
            <FaLink /> Thêm video từ YouTube URL
          </button>
        </motion.div>
      )}

      {/* Search Results */}
      {showYoutubeResults && youtubeSearchResults.length > 0 && (
        <motion.div
          className="search-results-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="search-results-header">
            <div className="search-results-info">
              <h3>🔍 Kết quả tìm kiếm: "{youtubeSearchQuery}"</h3>
              <span className="results-count">
                {youtubeSearchResults.length} video
              </span>
            </div>
            <button className="close-results-btn" onClick={clearYouTubeSearch}>
              <FaTimes />
            </button>
          </div>

          <div className="search-results-grid">
            <AnimatePresence>
              {youtubeSearchResults.map((video, index) => (
                <motion.div
                  key={video.videoId || index}
              className="search-result-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="result-thumbnail" onClick={() => handlePlayVideo(video)}>
                <img src={video.thumbnail} alt={video.title} loading="lazy" />
                <div className="play-overlay">
                  <FaPlay />
                </div>
              </div>

              <div className="result-info">
                <h4 className="result-title" title={video.title}>
                  {video.title}
                </h4>
                <p className="result-channel">{video.channel}</p>
              </div>

              <div className="result-actions">
                <button
                  className="play-btn"
                  onClick={() => handlePlayVideo(video)}
                  title="Xem video"
                >
                  <FaPlay /> Xem
                </button>

                {parentMode && (
                  <button
                    className={`add-btn ${addedVideos.includes(video.videoId) ? 'added' : ''}`}
                    onClick={() => handleAddClick(video)}
                    disabled={addingVideo === video.videoId || addedVideos.includes(video.videoId)}
                    title={addedVideos.includes(video.videoId) ? 'Đã thêm' : 'Thêm vào danh sách'}
                  >
                    {addingVideo === video.videoId ? (
                      <FaSpinner className="spinning" />
                    ) : addedVideos.includes(video.videoId) ? (
                      <><FaCheck /> Đã thêm</>
                    ) : (
                      <><FaPlus /> Thêm</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {youtubeNextPageToken && (
        <div className="load-more-container">
          <button
            className="load-more-btn"
            onClick={loadMoreYouTubeResults}
            disabled={youtubeSearchLoading}
          >
            {youtubeSearchLoading ? (
              <><FaSpinner className="spinning" /> Đang tải...</>
            ) : (
              <><FaChevronDown /> Xem thêm video</>
            )}
          </button>
        </div>
      )}

      {/* Add Video Modal */}
      <AnimatePresence>
        {showAddModal && selectedVideo && (
          <motion.div
            className="add-modal-overlay"
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
              <div className="add-modal-header">
                <h3>➕ Thêm video vào danh sách</h3>
                <button className="close-modal-btn" onClick={() => setShowAddModal(false)}>
                  <FaTimes />
                </button>
              </div>

              <div className="add-modal-content">
                <div className="video-preview">
                  <img src={selectedVideo.thumbnail} alt={selectedVideo.title} />
                  <div className="video-preview-info">
                    <h4>{selectedVideo.title}</h4>
                    <p>{selectedVideo.channel}</p>
                  </div>
                </div>

                <div className="form-group">
                  <label>📁 Danh mục:</label>
                  <div className="category-select">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        className={`category-option ${selectedCategory === cat.id ? 'selected' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{ '--cat-color': cat.color }}
                      >
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>👶 Độ tuổi:</label>
                  <div className="age-select">
                    {ageGroups.map(age => (
                      <button
                        key={age.id}
                        className={`age-option ${selectedAgeGroup === age.id ? 'selected' : ''}`}
                        onClick={() => setSelectedAgeGroup(age.id)}
                      >
                        {age.icon} {age.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="add-modal-footer">
                <button className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Hủy
                </button>
                <button className="confirm-btn" onClick={handleConfirmAdd}>
                  <FaPlus /> Thêm video
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
      )}

      {/* Add by URL Modal */}
      <AnimatePresence>
        {showAddByUrlModal && (
          <motion.div
            className="add-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddByUrlModal(false)}
          >
            <motion.div
              className="add-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="add-modal-header">
                <h3>🔗 Thêm video từ YouTube URL</h3>
                <button className="close-modal-btn" onClick={() => setShowAddByUrlModal(false)}>
                  <FaTimes />
                </button>
              </div>

              <div className="add-modal-content">
                <div className="form-group">
                  <label>📺 URL YouTube:</label>
                  <input
                    type="text"
                    className="url-input"
                    placeholder="https://www.youtube.com/watch?v=... hoặc Video ID"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setUrlError('');
                    }}
                  />
                  {urlError && <p className="url-error">{urlError}</p>}
                  <p className="url-hint">
                    Paste link YouTube hoặc chỉ Video ID (ví dụ: dQw4w9WgXcQ)
                  </p>
                </div>

                <div className="form-group">
                  <label>📁 Danh mục:</label>
                  <div className="category-select">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        className={`category-option ${selectedCategory === cat.id ? 'selected' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{ '--cat-color': cat.color }}
                      >
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>👶 Độ tuổi:</label>
                  <div className="age-select">
                    {ageGroups.map(age => (
                      <button
                        key={age.id}
                        className={`age-option ${selectedAgeGroup === age.id ? 'selected' : ''}`}
                        onClick={() => setSelectedAgeGroup(age.id)}
                      >
                        {age.icon} {age.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="add-modal-footer">
                <button className="cancel-btn" onClick={() => setShowAddByUrlModal(false)}>
                  Hủy
                </button>
                <button
                  className="confirm-btn"
                  onClick={handleAddByUrl}
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <><FaSpinner className="spinning" /> Đang xác thực...</>
                  ) : (
                    <><FaPlus /> Thêm video</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default SearchResults;
