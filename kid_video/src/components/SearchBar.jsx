import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaYoutube } from 'react-icons/fa';
import { useVideoStore } from '../store/videoStore';
import './SearchBar.css';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function SearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    searchYouTube,
    youtubeSearchLoading,
    clearYouTubeSearch,
    parentMode
  } = useVideoStore();

  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);

  // Debounce local search (filter existing videos)
  const debouncedLocalSearch = useDebounce(inputValue, 300);

  // Update local filter when debounced value changes
  useEffect(() => {
    setSearchQuery(debouncedLocalSearch);
  }, [debouncedLocalSearch, setSearchQuery]);

  // Handle YouTube search (manual trigger)
  const handleYouTubeSearch = useCallback(() => {
    if (inputValue.trim()) {
      searchYouTube(inputValue.trim());
    }
  }, [inputValue, searchYouTube]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleYouTubeSearch();
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
    clearYouTubeSearch();
  };

  return (
    <motion.div
      className="search-bar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`search-container ${isFocused ? 'focused' : ''}`}>
        <input
          type="text"
          placeholder="🔍 Tìm video yêu thích..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        {inputValue && (
          <motion.button
            className="clear-btn"
            onClick={handleClear}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Xóa tìm kiếm"
          >
            ✕
          </motion.button>
        )}

        {/* YouTube Search Button - only for parent mode or when enabled */}
        <motion.button
          className={`search-btn youtube-search ${youtubeSearchLoading ? 'loading' : ''}`}
          onClick={handleYouTubeSearch}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!inputValue.trim() || youtubeSearchLoading}
          title={parentMode ? "Tìm trên YouTube" : "Tìm video"}
        >
          {youtubeSearchLoading ? (
            <span className="search-spinner">⏳</span>
          ) : parentMode ? (
            <FaYoutube />
          ) : (
            <FaSearch />
          )}
        </motion.button>
      </div>

      {parentMode && inputValue && (
        <div className="search-hint">
          💡 Nhấn Enter hoặc nút <FaYoutube style={{ color: '#ff0000' }} /> để tìm video mới từ YouTube
        </div>
      )}
    </motion.div>
  );
}

export default SearchBar;
