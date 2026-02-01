import { motion } from 'framer-motion';
import { useVideoStore } from '../store/videoStore';
import './AgeFilter.css';

const ageGroups = [
  { id: 'all', label: '🌟 Tất cả', color: '#84fab0' },
  { id: '0-3', label: '👶 0-3 tuổi', color: '#ff9a9e' },
  { id: '3-6', label: '🧒 3-6 tuổi', color: '#a18cd1' },
  { id: '6-9', label: '👦 6-9 tuổi', color: '#fbc2eb' },
];

function AgeFilter() {
  const { selectedAgeGroup, setAgeGroup } = useVideoStore();

  return (
    <div className="age-filter">
      {ageGroups.map((group) => (
        <motion.button
          key={group.id}
          className={`age-btn ${selectedAgeGroup === group.id ? 'active' : ''}`}
          style={{
            background: selectedAgeGroup === group.id ? group.color : 'white',
            borderColor: group.color
          }}
          onClick={() => setAgeGroup(group.id)}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {group.label}
        </motion.button>
      ))}
    </div>
  );
}

export default AgeFilter;
