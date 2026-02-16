import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useDrawingStore } from '../store/drawingStore';
import StarRating from '../components/common/StarRating';
import AvatarPicker from '../components/common/AvatarPicker';

const ParentDashboardPage = () => {
    const { children, updateAvatar, createChild, removeChild } = useUserStore();
    const { drawings, completedDrawings, rateDrawing } = useDrawingStore();
    const [editingChild, setEditingChild] = useState(null);
    const [showCreateChild, setShowCreateChild] = useState(false);
    const [newChildName, setNewChildName] = useState('');
    const [newChildAvatar, setNewChildAvatar] = useState('🐱');
    const [filterChildId, setFilterChildId] = useState('all');
    const [zoomedDrawing, setZoomedDrawing] = useState(null);

    const handleCreateChild = () => {
        if (!newChildName.trim()) return;
        createChild(newChildName.trim(), newChildAvatar);
        setNewChildName('');
        setNewChildAvatar('🐱');
        setShowCreateChild(false);
    };

    // Filter drawings
    const filteredDrawings = filterChildId === 'all'
        ? completedDrawings
        : completedDrawings.filter(d => String(d.childId) === String(filterChildId));

    const totalRated = filteredDrawings.filter(d => d.rating > 0).length;
    const avgRating = totalRated > 0
        ? (filteredDrawings.filter(d => d.rating > 0).reduce((s, d) => s + d.rating, 0) / totalRated).toFixed(1)
        : '0.0';

    return (
        <div className="dashboard parent-dashboard-page">
            <h2>👨‍👩‍👧 Bảng điều khiển Phụ huynh</h2>

            {/* Stats */}
            <div className="stats-overview">
                <div className="stat-item stat-children">
                    <h3>👧 Số bé</h3>
                    <p>{children.length}</p>
                </div>
                <div className="stat-item stat-drawings">
                    <h3>🎨 Tổng bài</h3>
                    <p>{filteredDrawings.length}</p>
                </div>
                <div className="stat-item stat-completed">
                    <h3>✅ Đã chấm</h3>
                    <p>{totalRated}</p>
                </div>
                <div className="stat-item stat-rating">
                    <h3>⭐ Điểm TB</h3>
                    <p>{avgRating} / 5</p>
                </div>
            </div>

            {/* Manage Children */}
            <div className="dashboard-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3>👥 Quản lý hồ sơ bé</h3>
                    <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                        onClick={() => setShowCreateChild(true)}>
                        ➕ Thêm bé
                    </button>
                </div>

                {children.map((child) => (
                    <div key={child.id} className="parent-child-card">
                        <div className="parent-child-header">
                            <span style={{ fontSize: '2.5rem' }}>{child.avatar}</span>
                            <div>
                                <strong style={{ fontSize: '1.1rem' }}>{child.name}</strong>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                                    {child.createdAt ? `Tạo: ${new Date(child.createdAt).toLocaleDateString('vi-VN')}` : ''}
                                </p>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                                <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                                    onClick={() => setEditingChild(editingChild === child.id ? null : child.id)}>
                                    ✏️ Sửa avatar
                                </button>
                                {children.length > 1 && (
                                    <button className="btn-danger" style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                                        onClick={() => { if (window.confirm(`Xoá hồ sơ "${child.name}"?`)) removeChild(child.id); }}>
                                        🗑️ Xoá
                                    </button>
                                )}
                            </div>
                        </div>
                        {editingChild === child.id && (
                            <div className="avatar-edit-section fade-in">
                                <AvatarPicker
                                    selectedAvatar={child.avatar}
                                    onAvatarChange={(newAvatar) => updateAvatar(child.id, newAvatar)}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Review Drawings */}
            <div className="dashboard-section">
                <div className="drawing-section-header">
                    <h3>🎨 Chấm điểm bài của bé</h3>
                    {children.length > 1 && (
                        <div className="filter-bar">
                            <span className="filter-label">🔍 Lọc theo:</span>
                            <button
                                className={`filter-chip ${filterChildId === 'all' ? 'active' : ''}`}
                                onClick={() => setFilterChildId('all')}
                            >
                                Tất cả
                            </button>
                            {children.map(child => (
                                <button
                                    key={child.id}
                                    className={`filter-chip ${String(filterChildId) === String(child.id) ? 'active' : ''}`}
                                    onClick={() => setFilterChildId(child.id)}
                                >
                                    {child.avatar} {child.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {filteredDrawings.length > 0 ? (
                    <div className="drawing-grid">
                        {filteredDrawings.map((drawing) => {
                            const isRated = drawing.rating > 0;
                            return (
                                <div key={drawing.id} className={`drawing-card ${isRated ? 'drawing-card-rated' : ''}`}>
                                    <div className="drawing-card-status">
                                        {isRated
                                            ? <span className="status-badge status-rated">✅ Đã chấm • {drawing.rating}⭐</span>
                                            : <span className="status-badge status-pending">📝 Chờ chấm</span>
                                        }
                                    </div>
                                    <img
                                        src={drawing.imageUrl}
                                        alt={drawing.title}
                                        onClick={() => setZoomedDrawing(drawing)}
                                        style={{ cursor: 'zoom-in' }}
                                        title="Nhấn để phóng to"
                                    />
                                    <h3>{drawing.title}</h3>
                                    <StarRating
                                        rating={drawing.rating || 0}
                                        onRate={(rating) => rateDrawing(drawing.id, rating)}
                                    />
                                    <p className="drawing-status">
                                        {drawing.type === 'coloring' ? '🖌️ Tô màu' : '✏️ Vẽ tự do'}
                                        {drawing.childName && ` • ${drawing.childName}`}
                                    </p>
                                    {isRated && (
                                        <div className="drawing-locked" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                            🔒 Bé sẽ không chỉnh sửa được bài này
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <p style={{ fontSize: '3rem' }}>🎨</p>
                        <p style={{ color: '#94a3b8' }}>
                            {filterChildId === 'all'
                                ? 'Chưa có bài vẽ nào. Hãy để bé bắt đầu sáng tạo!'
                                : 'Bé này chưa có bài vẽ nào.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Zoom Modal */}
            {zoomedDrawing && (
                <div className="zoom-overlay" onClick={() => setZoomedDrawing(null)}>
                    <div className="zoom-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="zoom-header">
                            <h3>{zoomedDrawing.title}</h3>
                            <button className="zoom-close-btn" onClick={() => setZoomedDrawing(null)}>✕</button>
                        </div>
                        <div className="zoom-image-wrapper">
                            <img src={zoomedDrawing.imageUrl} alt={zoomedDrawing.title} />
                        </div>
                        <div className="zoom-footer">
                            <div className="zoom-info">
                                <span>{zoomedDrawing.type === 'coloring' ? '🖌️ Tô màu' : '✏️ Vẽ tự do'}</span>
                                {zoomedDrawing.childName && <span> • {zoomedDrawing.childName}</span>}
                                {zoomedDrawing.createdAt && (
                                    <span> • {new Date(zoomedDrawing.createdAt).toLocaleDateString('vi-VN')}</span>
                                )}
                            </div>
                            <div className="zoom-rating">
                                <span style={{ fontWeight: 600, marginRight: '8px' }}>Chấm điểm:</span>
                                <StarRating
                                    rating={zoomedDrawing.rating || 0}
                                    onRate={(rating) => {
                                        rateDrawing(zoomedDrawing.id, rating);
                                        setZoomedDrawing({ ...zoomedDrawing, rating });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

export default ParentDashboardPage;