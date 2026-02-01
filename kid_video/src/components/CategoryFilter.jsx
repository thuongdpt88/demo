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
        {allCategories.map((cat) => (
          <motion.button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            style={{
              '--cat-color': cat.color,
              background: selectedCategory === cat.id ? cat.color : 'white',
            }}
            onClick={() => setCategory(cat.id)}
            whileHover={{ scale: 1.05, y: -2 }}
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
