import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRegHeart, FaTimes, FaExpand, FaCompress, FaPlay } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import { useVideoStore, extractYouTubeId } from '../store/videoStore';
import './VideoPlayer.css';

function VideoPlayer() {
  const { currentVideo, setCurrentVideo, favorites, toggleFavorite, addToHistory, addWatchTime } = useVideoStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isFavorite = currentVideo && favorites.includes(currentVideo.id);

  useEffect(() => {
    if (currentVideo) {
      setIsLoading(true);
      addToHistory(currentVideo);
    }
  }, [currentVideo]);

  const handleClose = () => {
    setCurrentVideo(null);
    setIsFullscreen(false);
    setIsLoading(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (!currentVideo) return null;

  const videoId = extractYouTubeId(currentVideo.url);
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : currentVideo.url;

  return (
    <AnimatePresence>
      <motion.div
        className={`video-player-overlay ${isFullscreen ? 'fullscreen' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="video-player-container"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
        >
          <div className="video-player-header">
            <h2 className="video-title">{currentVideo.title}</h2>
            <div className="video-controls">
              <button
                className="control-btn favorite-btn"
                onClick={() => toggleFavorite(currentVideo.id)}
                title={isFavorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
              <button
                className="control-btn expand-btn"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Thu nhỏ" : "Phóng to"}
              >
                {isFullscreen ? '⛶' : '⛶'}
              </button>
              <button
                className="control-btn close-btn"
                onClick={handleClose}
                title="Đóng video"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="video-wrapper">
            {isLoading && (
              <div className="video-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải video...</p>
              </div>
            )}
            <iframe
              src={embedUrl}
              title={currentVideo.title}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={handleIframeLoad}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          </div>

          <div className="video-info">
            <span className="channel-name">📺 {currentVideo.channel}</span>
            <span className="age-badge">{currentVideo.ageGroup === 'all' ? '🌟 Mọi lứa tuổi' : `👶 ${currentVideo.ageGroup} tuổi`}</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default VideoPlayer;
