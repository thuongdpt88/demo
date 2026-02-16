import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import DrawingCanvas from '../components/canvas/DrawingCanvas';
import ToolBar from '../components/canvas/ToolBar';
import { useDrawingStore } from '../store/drawingStore';
import { useUserStore } from '../store/userStore';
import { useSound } from '../hooks/useSound';
import CelebrationPopup from '../components/common/CelebrationPopup';

/* ===== Drawing Challenges ===== */
const DRAWING_CHALLENGES = [
    { id: 1, name: 'Cái ly nước', emoji: '🥤', hint: 'Hãy vẽ một cái ly nước thật đẹp nhé!' },
    { id: 2, name: 'Ngôi nhà', emoji: '🏠', hint: 'Vẽ ngôi nhà mơ ước của bé nào!' },
    { id: 3, name: 'Mặt trời', emoji: '☀️', hint: 'Vẽ ông mặt trời đang tươi cười!' },
    { id: 4, name: 'Con mèo', emoji: '🐱', hint: 'Vẽ một chú mèo dễ thương!' },
    { id: 5, name: 'Bông hoa', emoji: '🌸', hint: 'Vẽ bông hoa rực rỡ sắc màu!' },
    { id: 6, name: 'Cái cây', emoji: '🌳', hint: 'Vẽ cây to với nhiều lá xanh!' },
    { id: 7, name: 'Con cá', emoji: '🐟', hint: 'Vẽ chú cá đang bơi dưới biển!' },
    { id: 8, name: 'Chiếc xe', emoji: '🚗', hint: 'Vẽ một chiếc xe ô tô thật đẹp!' },
    { id: 9, name: 'Trái tim', emoji: '❤️', hint: 'Vẽ trái tim yêu thương!' },
    { id: 10, name: 'Ngôi sao', emoji: '⭐', hint: 'Vẽ ngôi sao lấp lánh trên trời!' },
    { id: 11, name: 'Quả táo', emoji: '🍎', hint: 'Vẽ quả táo chín mọng nào!' },
    { id: 12, name: 'Con bướm', emoji: '🦋', hint: 'Vẽ chú bướm cánh rực rỡ!' },
    { id: 13, name: 'Cầu vồng', emoji: '🌈', hint: 'Vẽ cầu vồng bảy sắc sau mưa!' },
    { id: 14, name: 'Kem ốc quế', emoji: '🍦', hint: 'Vẽ que kem mát lạnh mùa hè!' },
    { id: 15, name: 'Con chó', emoji: '🐶', hint: 'Vẽ chú cún trung thành đáng yêu!' },
    { id: 16, name: 'Mặt trăng', emoji: '🌙', hint: 'Vẽ mặt trăng lung linh đêm khuya!' },
    { id: 17, name: 'Chiếc thuyền', emoji: '⛵', hint: 'Vẽ thuyền buồm lướt trên biển!' },
    { id: 18, name: 'Máy bay', emoji: '✈️', hint: 'Vẽ máy bay bay vút trên trời!' },
    { id: 19, name: 'Con voi', emoji: '🐘', hint: 'Vẽ chú voi to lớn thân thiện!' },
    { id: 20, name: 'Pizza', emoji: '🍕', hint: 'Vẽ miếng pizza ngon lành nào!' },
    { id: 21, name: 'Con ốc sên', emoji: '🐌', hint: 'Vẽ chú ốc sên mang ngôi nhà!' },
    { id: 22, name: 'Chiếc ô', emoji: '☂️', hint: 'Vẽ chiếc ô che mưa thật xinh!' },
    { id: 23, name: 'Robot', emoji: '🤖', hint: 'Vẽ robot siêu thông minh!' },
    { id: 24, name: 'Người tuyết', emoji: '⛄', hint: 'Vẽ người tuyết đội mũ vui vẻ!' },
    { id: 25, name: 'Con rùa', emoji: '🐢', hint: 'Vẽ chú rùa chậm rãi dễ thương!' },
];

const DrawPage = () => {
    const { saveDrawing, currentDrawing, editingDrawingId, completedDrawings, clearEditingDrawing, clearCanvas } = useDrawingStore();
    const { user } = useUserStore();
    const { playSound } = useSound();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [mode, setMode] = useState(null); // null = pick, 'free' = tự do, 'challenge' = theo đề
    const [challenge, setChallenge] = useState(null);
    const location = useLocation();
    const history = useHistory();

    // Determine if editing and get the drawing being edited
    const isEditing = location.state?.editing && editingDrawingId;
    const editingDrawing = isEditing
        ? completedDrawings.find(d => d.id === editingDrawingId)
        : null;
    const isRated = editingDrawing?.rating > 0;

    useEffect(() => {
        // If navigated here without editing intent, clear any stale editing state
        if (!location.state?.editing) {
            clearEditingDrawing();
        }
        // If editing, go straight to draw mode
        if (location.state?.editing) {
            setMode('free');
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const pickRandomChallenge = useCallback(() => {
        const idx = Math.floor(Math.random() * DRAWING_CHALLENGES.length);
        setChallenge(DRAWING_CHALLENGES[idx]);
    }, []);

    const startChallenge = useCallback(() => {
        setMode('challenge');
        pickRandomChallenge();
    }, [pickRandomChallenge]);

    const handleNewChallenge = useCallback(() => {
        if (window.confirm('Đổi đề mới sẽ xoá bài vẽ hiện tại. Tiếp tục?')) {
            pickRandomChallenge();
            clearCanvas();
            clearEditingDrawing();
        }
    }, [pickRandomChallenge, clearCanvas, clearEditingDrawing]);

    const handleSave = () => {
        if (isRated) return; // Cannot edit rated drawings
        const title = mode === 'challenge' && challenge
            ? `🎯 ${challenge.name}`
            : '✏️ Vẽ tự do';
        saveDrawing({ childId: user?.id, childName: user?.name, title });
        setShowCelebration(true);
    };

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen((prev) => !prev);
    }, []);

    const handleBackToModes = () => {
        if (currentDrawing || editingDrawingId) {
            if (!window.confirm('Quay lại sẽ mất bài vẽ hiện tại. Tiếp tục?')) return;
        }
        setMode(null);
        setChallenge(null);
        clearEditingDrawing();
        clearCanvas();
    };

    // If trying to edit a rated drawing, show warning
    if (isRated) {
        return (
            <div className="draw-page" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <h2>🔒 Bài vẽ đã được chấm điểm</h2>
                <p style={{ color: '#94a3b8', marginTop: '12px' }}>
                    Bài vẽ này đã được phụ huynh chấm <strong>{editingDrawing.rating}⭐</strong> nên không thể chỉnh sửa.
                </p>
                <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => history.push('/dashboard')}>
                    ← Quay lại bộ sưu tập
                </button>
            </div>
        );
    }

    // ====== MODE PICKER ======
    if (!mode && !isEditing) {
        return (
            <div className="draw-page">
                <div className="mode-picker">
                    <h2>✏️ Chọn kiểu vẽ</h2>
                    <p className="mode-picker-subtitle">Hôm nay bé muốn vẽ gì nào?</p>
                    <div className="mode-cards">
                        <div className="mode-card mode-card-free" onClick={() => setMode('free')}>
                            <span className="mode-icon">🎨</span>
                            <h3>Vẽ tự do</h3>
                            <p>Thoả sức sáng tạo! Vẽ bất cứ gì bé thích.</p>
                        </div>
                        <div className="mode-card mode-card-challenge" onClick={startChallenge}>
                            <span className="mode-icon">🎯</span>
                            <h3>Vẽ theo đề</h3>
                            <p>Thử thách vẽ theo chủ đề bất ngờ!</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ====== DRAWING MODE ======
    return (
        <div className={`draw-page ${isFullscreen ? 'fullscreen-canvas-mode' : ''}`}>
            {/* Challenge banner */}
            {mode === 'challenge' && challenge && (
                <div className="challenge-banner">
                    <span className="challenge-emoji">{challenge.emoji}</span>
                    <div className="challenge-info">
                        <h3>🎯 Đề bài: Vẽ {challenge.name}</h3>
                        <p>{challenge.hint}</p>
                    </div>
                    <button className="btn-secondary challenge-new-btn" onClick={handleNewChallenge}>
                        🎲 Đề khác
                    </button>
                </div>
            )}

            <div className="draw-header">
                <h2>
                    {isEditing ? '✏️ Chỉnh sửa'
                        : mode === 'challenge' ? `🎯 ${challenge?.name || 'Thử thách'}`
                        : '🎨 Vẽ tự do'}
                </h2>
                <div className="draw-actions">
                    {isFullscreen ? (
                        <button className="tool-btn fullscreen-back-btn" onClick={toggleFullscreen}>
                            ← Quay lại
                        </button>
                    ) : (
                        <>
                            <button className="tool-btn" onClick={handleBackToModes}>
                                ← Chọn lại
                            </button>
                            <button className="tool-btn" onClick={toggleFullscreen}>
                                ⛶ Phóng to
                            </button>
                        </>
                    )}
                    <button className="btn-primary" onClick={handleSave} disabled={!currentDrawing}>
                        💾 {editingDrawingId ? 'Cập nhật' : 'Lưu bài vẽ'}
                    </button>
                </div>
            </div>
            <ToolBar />
            <DrawingCanvas
                width={1400}
                height={900}
                initialImage={editingDrawing?.imageUrl || null}
            />
            <CelebrationPopup
                show={showCelebration}
                onClose={() => setShowCelebration(false)}
                title={editingDrawingId ? 'Đã cập nhật! ✏️' : mode === 'challenge' ? `Vẽ ${challenge?.name} tuyệt vời! 🎯` : 'Bài vẽ tuyệt đẹp! ✏️'}
                message={`Bé ${user?.name || ''} đã hoàn thành${mode === 'challenge' ? ` thử thách vẽ ${challenge?.name}` : ' bài vẽ'}. Giỏi lắm! 🌟`}
            />
        </div>
    );
};

export default DrawPage;