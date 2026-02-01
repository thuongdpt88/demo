import { motion } from 'framer-motion';
import VideoCard from './VideoCard';
import { useVideoStore } from '../store/videoStore';
import './VideoGrid.css';

function VideoGrid() {
  const { getFilteredVideos, searchQuery, selectedAgeGroup } = useVideoStore();
  const videos = getFilteredVideos();

  if (videos.length === 0) {
    return (
      <motion.div
        className="empty-state"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="empty-icon">🎬</div>
        <h3>Không tìm thấy video</h3>
        <p>
          {searchQuery
            ? `Không có video nào phù hợp với "${searchQuery}"`
            : 'Chưa có video nào trong danh sách'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="video-grid-container">
      <div className="results-info">
        <span className="results-count">🎥 {videos.length} video</span>
        {selectedAgeGroup !== 'all' && (
          <span className="filter-info">• Lọc theo: {selectedAgeGroup} tuổi</span>
        )}
      </div>
      <motion.div
        className="video-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {videos.map((video, index) => (
          <VideoCard key={video.id} video={video} index={index} />
        ))}
      </motion.div>
    </div>
  );
}

export default VideoGrid;
