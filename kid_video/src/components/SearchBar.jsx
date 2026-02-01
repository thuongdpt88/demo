import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { useVideoStore } from '../store/videoStore';
import './SearchBar.css';

function SearchBar() {
  const { searchQuery, setSearchQuery } = useVideoStore();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className="search-bar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`search-container ${isFocused ? 'focused' : ''}`}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm video yêu thích..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="search-input"
        />
        {searchQuery && (
          <motion.button
            className="clear-btn"
            onClick={() => setSearchQuery('')}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Xóa tìm kiếm"
          >
            ✕
          </motion.button>
        )}
        <motion.button
          className="search-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaSearch />
          <span>Tìm kiếm</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default SearchBar;
