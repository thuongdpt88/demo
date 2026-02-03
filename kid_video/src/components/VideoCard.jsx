import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaPlay } from 'react-icons/fa';
import { useVideoStore, categories } from '../store/videoStore';
import './VideoCard.css';

function VideoCard({ video, index }) {
  const { setCurrentVideo, favorites, markVideoUnavailable } = useVideoStore();
  const [thumbnailError, setThumbnailError] = useState(false);
  const isFavorite = favorites.includes(video.id);

  const ageColors = {
    '0-3': 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)',
    '3-6': 'linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)',
    '6-9': 'linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%)',
    'all': 'linear-gradient(135deg, #FFE66D 0%, #FF9A3D 100%)'
  };

  const category = categories.find(c => c.id === video.category);

  const handleThumbnailError = () => {
    setThumbnailError(true);
  };

  const defaultThumbnail = 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">
      <rect fill="#1A3A32" width="320" height="180"/>
      <text x="160" y="90" fill="#00D4AA" font-size="48" text-anchor="middle" dominant-baseline="middle">🎬</text>
    </svg>
  `);

  return (
    <motion.div
      className="video-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setCurrentVideo(video)}
    >
      <div className="thumbnail-container">
        <img
          src={thumbnailError ? defaultThumbnail : video.thumbnail}
          alt={video.title}
          className="thumbnail"
          loading="lazy"
          onError={handleThumbnailError}
        />
        <div className="play-overlay">
          <motion.div
            className="play-button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaPlay />
          </motion.div>
        </div>
        {isFavorite && (
          <div className="favorite-indicator">
            <FaHeart color="#FF6B9D" />
          </div>
        )}
        {category && (
          <div
            className="category-tag"
            style={{ background: category.color }}
          >
            {category.icon}
          </div>
        )}
        <div
          className="age-tag"
          style={{ background: ageColors[video.ageGroup] || ageColors['all'] }}
        >
          {video.ageGroup === 'all' ? '🌟 Tất cả' : `👶 ${video.ageGroup}`}
        </div>
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <p className="channel-name">📺 {video.channel}</p>
      </div>
    </motion.div>
  );
}

export default VideoCard;
