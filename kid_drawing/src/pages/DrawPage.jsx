import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import DrawingCanvas from '../components/canvas/DrawingCanvas';
import ToolBar from '../components/canvas/ToolBar';
import { useDrawingStore } from '../store/drawingStore';
import { useUserStore } from '../store/userStore';
import { useSound } from '../hooks/useSound';
import CelebrationPopup from '../components/common/CelebrationPopup';

const DrawPage = () => {
    const { saveDrawing, currentDrawing, editingDrawingId, completedDrawings, clearEditingDrawing } = useDrawingStore();
    const { user } = useUserStore();
    const { playSound } = useSound();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
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
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const handleSave = () => {
        if (isRated) return; // Cannot edit rated drawings
        saveDrawing({ childId: user?.id, childName: user?.name });
        setShowCelebration(true);
    };

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen((prev) => !prev);
    }, []);

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

    return (
        <div className={`draw-page ${isFullscreen ? 'fullscreen-canvas-mode' : ''}`}>
            <div className="draw-header">
                <h2>{isEditing ? '✏️ Chỉnh sửa bài vẽ' : '✏️ Vẽ tự do'}</h2>
                <div className="draw-actions">
                    <button className="tool-btn" onClick={toggleFullscreen}>
                        {isFullscreen ? '⬜ Thu nhỏ' : '⛶ Phóng to'}
                    </button>
                    <button className="btn-primary" onClick={handleSave} disabled={!currentDrawing}>
                        💾 {editingDrawingId ? 'Cập nhật' : 'Lưu bài vẽ'}
                    </button>
                </div>
            </div>
            <ToolBar />
            <DrawingCanvas
                width={1200}
                height={800}
                initialImage={editingDrawing?.imageUrl || null}
            />
            <CelebrationPopup
                show={showCelebration}
                onClose={() => setShowCelebration(false)}
                title={editingDrawingId ? 'Đã cập nhật! ✏️' : 'Bài vẽ tuyệt đẹp! ✏️'}
                message={`Bé ${user?.name || ''} đã hoàn thành bài vẽ. Giỏi lắm! 🌟`}
            />
        </div>
    );
};

export default DrawPage;