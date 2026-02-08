import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AvatarPicker from '../components/common/AvatarPicker';
import { useUserStore } from '../store/userStore';

const HomePage = () => {
    const { user, children, selectUser, createChild, setUser } = useUserStore();
    const [showCreateChild, setShowCreateChild] = useState(false);
    const [newChildName, setNewChildName] = useState('');
    const [newChildAvatar, setNewChildAvatar] = useState('🐱');

    const handleAvatarSelect = (avatar) => {
        setUser({ avatar });
    };

    const handleCreateChild = () => {
        if (!newChildName.trim()) return;
        createChild(newChildName.trim(), newChildAvatar);
        setNewChildName('');
        setNewChildAvatar('🐱');
        setShowCreateChild(false);
    };

    return (
        <div className="home-page">
            <div className="welcome-section">
                <h1>Xin chào{user?.name ? `, ${user.name}` : ''}! 🎨</h1>
                <p className="subtitle">Chọn hồ sơ và bắt đầu sáng tạo nào!</p>
            </div>

            {/* Profile Selector */}
            <div className="child-profiles-section">
                <h3>👥 Chọn hồ sơ bé</h3>
                <div className="child-profiles-grid">
                    {children.map((child) => (
                        <div
                            key={child.id}
                            className={`child-profile-card ${user?.id === child.id ? 'active' : ''}`}
                            onClick={() => selectUser(child.id)}
                        >
                            <span className="child-avatar">{child.avatar}</span>
                            <span className="child-name">{child.name}</span>
                            {user?.id === child.id && <span className="active-badge">✓</span>}
                        </div>
                    ))}
                    <div className="child-profile-card add-child" onClick={() => setShowCreateChild(true)}>
                        <span className="child-avatar">➕</span>
                        <span className="child-name">Thêm bé</span>
                    </div>
                </div>
            </div>

            {/* Create Child Modal */}
            {showCreateChild && (
                <div className="pin-gate-overlay" onClick={() => setShowCreateChild(false)}>
                    <div className="pin-gate-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>🧒 Tạo hồ sơ mới</h3>
                        <div className="create-child-form">
                            <input
                                type="text"
                                value={newChildName}
                                onChange={(e) => setNewChildName(e.target.value)}
                                placeholder="Tên bé..."
                                className="profile-input"
                                autoFocus
                            />
                            <p style={{ margin: '12px 0 4px', fontWeight: 600 }}>Chọn avatar:</p>
                            <AvatarPicker
                                selectedAvatar={newChildAvatar}
                                onAvatarChange={(a) => setNewChildAvatar(a)}
                            />
                            <div className="pin-actions">
                                <button className="btn-primary" onClick={handleCreateChild} disabled={!newChildName.trim()}>
                                    ✅ Tạo hồ sơ
                                </button>
                                <button className="btn-secondary" onClick={() => setShowCreateChild(false)}>
                                    Huỷ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AvatarPicker onSelect={handleAvatarSelect} selectedAvatar={user?.avatar} />

            <div className="home-cards">
                <Link to="/draw" className="home-card card-draw">
                    <span className="card-icon">✏️</span>
                    <h3>Vẽ tự do</h3>
                    <p>Vẽ bất cứ gì bé tưởng tượng!</p>
                </Link>
                <Link to="/color" className="home-card card-color">
                    <span className="card-icon">🖌️</span>
                    <h3>Tô màu</h3>
                    <p>Tô màu những bức tranh đẹp!</p>
                </Link>
                <Link to="/dashboard" className="home-card card-dashboard">
                    <span className="card-icon">📊</span>
                    <h3>Bộ sưu tập</h3>
                    <p>Xem tất cả bức vẽ của bé!</p>
                </Link>
                <Link to="/profile" className="home-card card-profile">
                    <span className="card-icon">👤</span>
                    <h3>Hồ sơ</h3>
                    <p>Quản lý hồ sơ của bé!</p>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;