import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useDrawingStore } from '../store/drawingStore';
import StarRating from '../components/common/StarRating';

const DashboardPage = () => {
    const { user, children } = useUserStore();
    const { completedDrawings, setEditingDrawing } = useDrawingStore();
    const history = useHistory();
    const [filterChildId, setFilterChildId] = useState('mine'); // 'mine', 'all', or a child id
    const [zoomedDrawing, setZoomedDrawing] = useState(null);

    // This child's drawings
    const myDrawings = completedDrawings.filter(d => d.childId === user?.id);
    const ratedDrawings = myDrawings.filter(d => d.rating > 0);
    const avgRating = ratedDrawings.length > 0
        ? (ratedDrawings.reduce((sum, d) => sum + d.rating, 0) / ratedDrawings.length).toFixed(1)
        : '0.0';
    const totalStars = myDrawings.reduce((sum, d) => sum + (d.rating || 0), 0);

    // Filtered drawings based on filter
    const displayDrawings = filterChildId === 'mine'
        ? myDrawings
        : filterChildId === 'all'
            ? completedDrawings
            : completedDrawings.filter(d => String(d.childId) === String(filterChildId));

    // Ranking: all children sorted by total stars
    const ranking = children.map(child => {
        const childDrawings = completedDrawings.filter(d => d.childId === child.id);
        const stars = childDrawings.reduce((sum, d) => sum + (d.rating || 0), 0);
        const count = childDrawings.length;
        return { ...child, totalStars: stars, drawingCount: count };
    }).sort((a, b) => b.totalStars - a.totalStars);

    const handleEdit = (drawing) => {
        setEditingDrawing(drawing.id);
        if (drawing.type === 'coloring') {
            history.push('/color', { editing: true });
        } else {
            history.push('/draw', { editing: true });
        }
    };

    const isMine = (drawing) => String(drawing.childId) === String(user?.id);

    return (
        <div className="dashboard">
            <h2>📊 Bộ sưu tập của {user?.name || 'bé'}</h2>

            <div className="stats-overview">
                <div className="stat-item">
                    <h3>🎨 Bài của tôi</h3>
                    <p>{myDrawings.length}</p>
                </div>
                <div className="stat-item">
                    <h3>⭐ Tổng sao</h3>
                    <p>{totalStars}</p>
                </div>
                <div className="stat-item">
                    <h3>📊 Điểm TB</h3>
                    <p>{avgRating} / 5</p>
                </div>
            </div>

            {/* Ranking Section */}
            {children.length > 1 && (
                <div className="ranking-section">
                    <h3>🏆 Bảng xếp hạng</h3>
                    <div className="ranking-list">
                        {ranking.map((child, idx) => (
                            <div
                                key={child.id}
                                className={`ranking-item ${child.id === user?.id ? 'ranking-me' : ''}`}
                            >
                                <span className="ranking-position">
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                </span>
                                <span className="ranking-avatar">{child.avatar}</span>
                                <span className="ranking-name">{child.name}</span>
                                <span className="ranking-stars">⭐ {child.totalStars}</span>
                                <span className="ranking-count">🎨 {child.drawingCount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter bar */}
            {children.length > 1 && (
                <div className="filter-bar" style={{ marginBottom: '16px' }}>
                    <span className="filter-label">🔍 Xem bài:</span>
                    <button
                        className={`filter-chip ${filterChildId === 'mine' ? 'active' : ''}`}
                        onClick={() => setFilterChildId('mine')}
                    >
                        📌 Của tôi
                    </button>
                    <button
                        className={`filter-chip ${filterChildId === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterChildId('all')}
                    >
                        👥 Tất cả
                    </button>
                    {children.filter(c => c.id !== user?.id).map(child => (
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

            {displayDrawings.length > 0 ? (
                <div className="drawing-grid">
                    {displayDrawings.map((drawing) => {
                        const isRated = drawing.rating > 0;
                        const mine = isMine(drawing);
                        return (
                            <div key={drawing.id} className={`drawing-card ${isRated ? 'drawing-card-rated' : ''}`}>
                                <div className="drawing-card-status">
                                    {isRated
                                        ? <span className="status-badge status-rated">✅ Đã chấm</span>
                                        : <span className="status-badge status-pending">📝 Chờ chấm</span>
                                    }
                                </div>
                                <img
                                    src={drawing.imageUrl}
                                    alt={drawing.title}
                                    className="drawing-image"
                                    onClick={() => setZoomedDrawing(drawing)}
                                    style={{ cursor: 'zoom-in' }}
                                    title="Nhấn để phóng to"
                                />
                                <h3 className="drawing-title">{drawing.title}</h3>
                                <StarRating
                                    rating={drawing.rating || 0}
                                    disabled={true}
                                />
                                <p className="drawing-status">
                                    {drawing.type === 'coloring' ? '🖌️ Tô màu' : '✏️ Vẽ tự do'}
                                    {isRated && ` • ${drawing.rating}⭐`}
                                    {!mine && drawing.childName && ` • ${drawing.childName}`}
                                </p>
                                {mine && !isRated && (
                                    <button
                                        className="btn-secondary edit-drawing-btn"
                                        onClick={() => handleEdit(drawing)}
                                    >
                                        ✏️ Chỉnh sửa
                                    </button>
                                )}
                                {mine && isRated && (
                                    <div className="drawing-locked">🔒 Không thể chỉnh sửa</div>
                                )}
                                {!mine && (
                                    <div className="drawing-owner-badge">
                                        👤 {drawing.childName || 'Bạn khác'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <p className="empty-icon">🎨</p>
                    <p>
                        {filterChildId === 'mine'
                            ? <>Chưa có bài vẽ nào! Đến <strong>Vẽ tự do</strong> hoặc <strong>Tô màu</strong> để tạo tác phẩm nhé!</>
                            : 'Chưa có bài vẽ nào trong mục này.'}
                    </p>
                </div>
            )}

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
                                {zoomedDrawing.rating > 0 && <span> • {zoomedDrawing.rating}⭐</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;