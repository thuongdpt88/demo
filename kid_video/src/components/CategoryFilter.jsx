import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useVideoStore, categories } from '../store/videoStore';
import './CategoryFilter.css';

function CategoryFilter() {
  const { selectedCategory, setCategory, currentUser } = useVideoStore();

  // Filter categories based on parent config (user's allowed categories)
  const allowedCategories = useMemo(() => {
    const userAllowedCategories = currentUser?.allowedCategories || [];

    // If no restrictions (empty array), show all categories
    if (userAllowedCategories.length === 0) {
      return [
        { id: 'all', name: 'Tất cả', icon: '🌟', color: '#84fab0' },
        ...categories
      ];
    }

    // Filter to only show allowed categories
    const filtered = categories.filter(cat => userAllowedCategories.includes(cat.id));
    return [
      { id: 'all', name: 'Tất cả', icon: '🌟', color: '#84fab0' },
      ...filtered
    ];
  }, [currentUser?.allowedCategories]);

  return (
    <div className="category-filter">
      <div className="category-scroll">
        {allowedCategories.map((cat, index) => (
          <motion.button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            style={{
              '--cat-color': cat.color,
            }}
            onClick={() => setCategory(cat.id)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="category-icon">{cat.icon}</span>
            <span className="category-name">{cat.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default CategoryFilter;
