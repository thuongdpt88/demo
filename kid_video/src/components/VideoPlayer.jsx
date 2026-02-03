import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useVideoStore, extractYouTubeId } from '../store/videoStore';
import './VideoPlayer.css';

// Timeout to detect unavailable videos - only if iframe doesn't load at all
const VIDEO_LOAD_TIMEOUT = 15000; // 15 seconds - give more time

function VideoPlayer() {
  const { currentVideo, setCurrentVideo, favorites, toggleFavorite, addToHistory, addWatchTime, markVideoUnavailable, getFilteredVideos } = useVideoStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const loadTimeoutRef = useRef(null);
  const iframeLoadedRef = useRef(false);
  const iframeRef = useRef(null);

  const isFavorite = currentVideo && favorites.includes(currentVideo.id);

  // Get filtered videos for navigation
  const filteredVideos = useMemo(() => {
    return getFilteredVideos?.() || [];
  }, [getFilteredVideos]);

  // Get current video index and navigation info
  const currentIndex = useMemo(() => {
    if (!currentVideo) return -1;
    return filteredVideos.findIndex(v => v.id === currentVideo.id);
  }, [currentVideo, filteredVideos]);

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < filteredVideos.length - 1 && currentIndex !== -1;

  // Navigate to previous video
  const handlePreviousVideo = useCallback(() => {
    if (hasPrevious) {
      const prevVideo = filteredVideos[currentIndex - 1];
      setCurrentVideo(prevVideo);
    }
  }, [hasPrevious, filteredVideos, currentIndex, setCurrentVideo]);

  // Navigate to next video
  const handleNextVideo = useCallback(() => {
    if (hasNext) {
      const nextVideo = filteredVideos[currentIndex + 1];
      setCurrentVideo(nextVideo);
    }
  }, [hasNext, filteredVideos, currentIndex, setCurrentVideo]);

  // Listen for YouTube player messages to detect errors
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'https://www.youtube.com') return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // YouTube sends error event when video is unavailable
        if (data.event === 'onError') {
          console.log('YouTube error detected via postMessage:', data);
          setIsLoading(false);
          setHasError(true);
          if (currentVideo) {
            markVideoUnavailable?.(currentVideo.id);
          }
        }

        // Video state changes - any state except error means video is working
        if (data.event === 'onStateChange') {
          console.log('YouTube state change:', data.info);
          // States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          // All states except unstarted indicate video is accessible
          if (data.info !== -1) {
            iframeLoadedRef.current = true;
            setIsLoading(false);
            // Clear timeout since we got a valid response
            if (loadTimeoutRef.current) {
              clearTimeout(loadTimeoutRef.current);
            }
          }
        }

        // onReady means player is ready
        if (data.event === 'onReady') {
          console.log('YouTube player ready');
          iframeLoadedRef.current = true;
          setIsLoading(false);
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentVideo, markVideoUnavailable]);

  // Setup timeout to detect unavailable videos - only as fallback
  useEffect(() => {
    if (currentVideo && isLoading && !hasError) {
      iframeLoadedRef.current = false;

      // Clear any existing timeout
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }

      // Set timeout - only trigger if nothing happens at all
      loadTimeoutRef.current = setTimeout(() => {
        if (!iframeLoadedRef.current && isLoading && !hasError) {
          console.log('Video load timeout - no response from YouTube');
          setIsLoading(false);
          setHasError(true);
          if (currentVideo) {
            markVideoUnavailable?.(currentVideo.id);
          }
        }
      }, VIDEO_LOAD_TIMEOUT);
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [currentVideo, isLoading, hasError, markVideoUnavailable]);

  useEffect(() => {
    if (currentVideo) {
      setIsLoading(true);
      setHasError(false);
      setRetryCount(0);
      iframeLoadedRef.current = false;
      addToHistory(currentVideo);
    }
  }, [currentVideo]);

  const handleClose = useCallback(() => {
    // Clear timeout when closing
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setCurrentVideo(null);
    setIsFullscreen(false);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
    iframeLoadedRef.current = false;
  }, [setCurrentVideo]);

  const handleIframeLoad = useCallback(() => {
    console.log('Iframe loaded for video:', currentVideo?.id);
    // Iframe loaded successfully - video is accessible
    iframeLoadedRef.current = true;

    // Give a small delay for YouTube to initialize
    setTimeout(() => {
      if (!hasError) {
        setIsLoading(false);
      }
    }, 1000);

    // Clear the timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
  }, [currentVideo, hasError]);

  const handleIframeError = useCallback(() => {
    console.log('Iframe error for video:', currentVideo?.id);
    setIsLoading(false);
    setHasError(true);
    // Mark video as unavailable so it won't be used as default
    if (currentVideo) {
      markVideoUnavailable?.(currentVideo.id);
    }
  }, [currentVideo, markVideoUnavailable]);

  const handleSkipVideo = useCallback(() => {
    // Mark current video as unavailable and try the next one
    if (currentVideo) {
      markVideoUnavailable?.(currentVideo.id);
    }

    // Get next available video
    const videos = getFilteredVideos?.() || [];
    const currentIndex = videos.findIndex(v => v.id === currentVideo?.id);
    const nextVideo = videos[currentIndex + 1] || videos[0];

    if (nextVideo && nextVideo.id !== currentVideo?.id) {
      setCurrentVideo(nextVideo);
    } else {
      handleClose();
    }
  }, [currentVideo, markVideoUnavailable, getFilteredVideos, setCurrentVideo, handleClose]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setIsLoading(true);
    videoLoadedRef.current = false;
  }, []);

  if (!currentVideo) return null;

  const videoId = extractYouTubeId(currentVideo.url);
  // YouTube embed params:
  // - autoplay=1: Tự động phát
  // - rel=0: Không hiện video liên quan
  // - modestbranding=1: Ẩn logo YouTube lớn
  // - controls=1: Hiện controls
  // - disablekb=1: Tắt keyboard controls
  // - iv_load_policy=3: Ẩn annotations
  // - showinfo=0: Ẩn title (deprecated nhưng vẫn thử)
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&disablekb=0&iv_load_policy=3&playsinline=1&enablejsapi=1&origin=${window.location.origin}`
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
            {isLoading && !hasError && (
              <div className="video-loading">
                <div className="loading-icon">🎬</div>
                <p className="loading-text">Đang tải video<span className="loading-dots"></span></p>
              </div>
            )}
            {hasError ? (
              <div className="video-error">
                <div className="error-icon">😢</div>
                <h3>Video không khả dụng</h3>
                <p>Video này đã bị xóa hoặc không cho phép nhúng.</p>
                <p className="error-suggestion">Hãy chọn video khác để xem nhé!</p>
                <div className="error-actions">
                  <button className="skip-btn primary" onClick={handleSkipVideo}>
                    ▶️ Xem video tiếp theo
                  </button>
                  <button className="close-error-btn" onClick={handleClose}>
                    ✕ Đóng
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Overlays to block ALL YouTube external links */}
                {/* Top: Watch Later, Share, title, channel info when paused */}
                <div className="youtube-block-overlay top-overlay" />
                {/* Bottom-right: YouTube logo */}
                <div className="youtube-block-overlay bottom-right-overlay" />
                {/* Bottom-left: Channel name link */}
                <div className="youtube-block-overlay channel-overlay" />
                {/* Full video area - only show when paused to block info cards */}
                <div className="youtube-block-overlay info-cards-overlay" />
                <iframe
                  ref={iframeRef}
                  key={`${currentVideo.id}-${retryCount}`}
                  src={embedUrl}
                  title={currentVideo.title}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}
                />
              </>
            )}
          </div>

          <div className="video-info">
            <div className="video-nav-controls">
              <button
                className={`nav-btn prev-btn ${!hasPrevious ? 'disabled' : ''}`}
                onClick={handlePreviousVideo}
                disabled={!hasPrevious}
                title="Video trước"
              >
                <FaChevronLeft />
                <span className="nav-text">Trước</span>
              </button>
              <span className="video-position">
                {currentIndex + 1} / {filteredVideos.length}
              </span>
              <button
                className={`nav-btn next-btn ${!hasNext ? 'disabled' : ''}`}
                onClick={handleNextVideo}
                disabled={!hasNext}
                title="Video sau"
              >
                <span className="nav-text">Sau</span>
                <FaChevronRight />
              </button>
            </div>
            <div className="video-meta">
              <span className="channel-name">📺 {currentVideo.channel}</span>
              <span className="age-badge">{currentVideo.ageGroup === 'all' ? '🌟 Mọi lứa tuổi' : `👶 ${currentVideo.ageGroup} tuổi`}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default VideoPlayer;
