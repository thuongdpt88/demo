import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import AvatarPicker from '../components/common/AvatarPicker';
import Button from '../components/common/Button';

const ProfilePage = () => {
    const { user, setUser, updateUserAvatar, children, createChild, removeChild, selectUser } = useUserStore();
    const [name, setName] = useState(user?.name || '');
    const [saved, setSaved] = useState(false);
    const [showCreateChild, setShowCreateChild] = useState(false);
    const [newChildName, setNewChildName] = useState('');
    const [newChildAvatar, setNewChildAvatar] = useState('🐱');

    const handleAvatarChange = (newAvatar) => {
        updateUserAvatar(newAvatar);
    };

    const handleSave = () => {
        setUser({ name });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleCreateChild = () => {
        if (!newChildName.trim()) return;
        createChild(newChildName.trim(), newChildAvatar);
        setNewChildName('');
        setNewChildAvatar('🐱');
        setShowCreateChild(false);
    };

    return (
        <div className="profile-page">
            <h2>👤 Hồ sơ của tôi</h2>

            <div className="profile-card">
                <div className="profile-avatar-display">
                    <span style={{ fontSize: '4rem' }}>{user?.avatar || '🐱'}</span>
                </div>

                <AvatarPicker selectedAvatar={user?.avatar} onAvatarChange={handleAvatarChange} />

                <div className="profile-form">
                    <label>
                        <strong>Tên:</strong>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="profile-input"
                            placeholder="Nhập tên bé"
                        />
                    </label>
                </div>

                <Button onClick={handleSave}>
                    {saved ? '✅ Đã lưu!' : '💾 Lưu thay đổi'}
                </Button>
            </div>

            {/* Child Accounts Management */}
            <div className="child-accounts-section">
                <h3>👥 Danh sách hồ sơ bé</h3>
                <div className="child-list">
                    {children.map((child) => (
                        <div key={child.id} className={`child-list-item ${user?.id === child.id ? 'active' : ''}`}>
                            <span className="child-list-avatar">{child.avatar}</span>
                            <div className="child-list-info">
                                <strong>{child.name}</strong>
                                {child.createdAt && (
                                    <small>Tạo: {new Date(child.createdAt).toLocaleDateString('vi-VN')}</small>
                                )}
                            </div>
                            <div className="child-list-actions">
                                {user?.id !== child.id && (
                                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                        onClick={() => selectUser(child.id)}>
                                        Chọn
                                    </button>
                                )}
                                {children.length > 1 && user?.id !== child.id && (
                                    <button className="btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                        onClick={() => { if (window.confirm(`Xoá hồ sơ "${child.name}"?`)) removeChild(child.id); }}>
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <button className="btn-primary" style={{ marginTop: '12px' }} onClick={() => setShowCreateChild(true)}>
                    ➕ Thêm hồ sơ bé mới
                </button>
            </div>

            {/* Create Child Modal */}
            {showCreateChild && (
                <div className="pin-gate-overlay" onClick={() => setShowCreateChild(false)}>
                    <div className="pin-gate-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>🧒 Tạo hồ sơ mới</h3>
                        <input
                            type="text"
                            value={newChildName}
                            onChange={(e) => setNewChildName(e.target.value)}
                            placeholder="Tên bé..."
                            className="profile-input"
                            autoFocus
                        />
                        <p style={{ margin: '12px 0 4px', fontWeight: 600 }}>Chọn avatar:</p>
                        <AvatarPicker selectedAvatar={newChildAvatar} onAvatarChange={(a) => setNewChildAvatar(a)} />
                        <div className="pin-actions">
                            <button className="btn-primary" onClick={handleCreateChild} disabled={!newChildName.trim()}>
                                ✅ Tạo hồ sơ
                            </button>
                            <button className="btn-secondary" onClick={() => setShowCreateChild(false)}>Huỷ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;