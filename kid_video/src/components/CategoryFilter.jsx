import { motion } from 'framer-motion';
import { useVideoStore, categories } from '../store/videoStore';
import './CategoryFilter.css';

function CategoryFilter() {
  const { selectedCategory, setCategory } = useVideoStore();

  const allCategories = [
    { id: 'all', name: 'Tất cả', icon: '🌟', color: '#84fab0' },
    ...categories
  ];

  return (
    <div className="category-filter">
      <div className="category-scroll">
        {allCategories.map((cat, index) => (
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
