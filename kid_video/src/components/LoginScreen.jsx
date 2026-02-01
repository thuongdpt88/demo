import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useVideoStore } from '../store/videoStore';
import './LoginScreen.css';

function LoginScreen() {
  const { users, login, initializeData, isLoading } = useVideoStore();

  useEffect(() => {
    initializeData();
  }, []);

  const children = users.filter(u => u.type === 'child');

  if (isLoading) {
    return (
      <div className="login-screen">
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="login-header">
          <h1>🎬 Kid Video</h1>
          <p>Chọn tài khoản của bé</p>
        </div>

        <div className="user-grid">
          {children.map((user, index) => (
            <motion.button
              key={user.id}
              className="user-card"
              onClick={() => login(user.id)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="user-avatar">{user.avatar}</div>
              <span className="user-name">{user.name}</span>
              <span className="user-age">{user.ageGroup} tuổi</span>
            </motion.button>
          ))}
        </div>

        <div className="login-footer">
          <p>🛡️ Video an toàn cho bé yêu</p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginScreen;
