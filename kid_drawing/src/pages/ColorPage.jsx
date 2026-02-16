import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { floodFill } from '../utils/floodFill';
import { coloringTemplates, svgToDataUrl } from '../data/coloringTemplates';
import { useSound } from '../hooks/useSound';
import { useDrawingStore } from '../store/drawingStore';
import { useUserStore } from '../store/userStore';
import CelebrationPopup from '../components/common/CelebrationPopup';

const COLORS = [
  '#FF0000', '#FF6B00', '#FFD700', '#00C853',
  '#2196F3', '#6A1B9A', '#FF4081', '#795548',
  '#000000', '#FFFFFF', '#FF9800', '#00BCD4',
  '#8BC34A', '#E91E63', '#3F51B5', '#FFC107',
];

const ColorPage = () => {
  const [view, setView] = useState('gallery');
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [history, setHistory] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const canvasRef = useRef(null);
  const { playSound } = useSound();
  const { addCompletedDrawing, updateCompletedDrawing, editingDrawingId, completedDrawings, clearEditingDrawing, setEditingDrawing } = useDrawingStore();
  const { user } = useUserStore();
  const location = useLocation();
  const navHistory = useHistory();

  // Check if editing an existing coloring
  const isEditing = location.state?.editing && editingDrawingId;
  const editingDrawing = isEditing
    ? completedDrawings.find(d => d.id === editingDrawingId)
    : null;
  const isRated = editingDrawing?.rating > 0;

  // Load existing drawing if editing
  useEffect(() => {
    if (isEditing && editingDrawing && !isRated) {
      setSelectedTemplate({ name: editingDrawing.title, emoji: '🖌️' });
      setView('coloring');
      setTimeout(() => loadImageOnCanvas(editingDrawing.imageUrl), 50);
    } else if (!location.state?.editing) {
      clearEditingDrawing();
    }
  }, []);

  // ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev.slice(-20), data]);
    } catch (e) {
      console.warn('Cannot save history (tainted canvas)');
    }
  }, []);

  const loadImageOnCanvas = useCallback((imgSrc, useCors = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoading(true);

    const img = new Image();
    if (useCors) img.crossOrigin = 'anonymous';

    img.onload = () => {
      // Match drawing canvas size (1200x800) as target, keep aspect ratio
      const targetW = 1200, targetH = 800;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w === 0 || h === 0) { w = 800; h = 800; }
      const scale = Math.min(targetW / w, targetH / h);
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setOriginalData(data);
      } catch (e) {
        setOriginalData(null);
      }
      setHistory([]);
      setLoading(false);
    };

    img.onerror = () => {
      if (useCors) {
        // Retry without CORS
        loadImageOnCanvas(imgSrc, false);
      } else {
        setLoading(false);
      }
    };

    img.src = imgSrc;
  }, []);

  const selectTemplate = useCallback((template) => {
    setSelectedTemplate(template);
    setView('coloring');
    setTimeout(() => loadImageOnCanvas(svgToDataUrl(template.svg)), 50);
  }, [loadImageOnCanvas]);

  const handleCanvasInteraction = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((clientX - rect.left) * scaleX);
    const y = Math.round((clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d');
    saveToHistory();
    try {
      const filled = floodFill(ctx, x, y, selectedColor);
      if (!filled) {
        setHistory((prev) => prev.slice(0, -1));
      }
    } catch (e) {
      console.error('Fill error:', e);
      setHistory((prev) => prev.slice(0, -1));
    }
  }, [selectedColor, saveToHistory]);

  const handleCanvasClick = useCallback((e) => {
    handleCanvasInteraction(e.clientX, e.clientY);
    playSound('COLOR_PICK');
  }, [handleCanvasInteraction, playSound]);

  const handleCanvasTouch = useCallback((e) => {
    e.preventDefault();
    if (e.touches && e.touches.length > 0) {
      handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleCanvasInteraction]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const prev = history[history.length - 1];
    canvas.width = prev.width;
    canvas.height = prev.height;
    ctx.putImageData(prev, 0, 0);
    setHistory((h) => h.slice(0, -1));
  }, [history]);

  const handleReset = useCallback(() => {
    if (!originalData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = originalData.width;
    canvas.height = originalData.height;
    ctx.putImageData(originalData, 0, 0);
    setHistory([]);
  }, [originalData]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isRated) return; // Cannot edit rated drawings
    const imageUrl = canvas.toDataURL();

    if (editingDrawingId) {
      // Update existing drawing (replace old file, no download)
      updateCompletedDrawing(editingDrawingId, { imageUrl });
    } else {
      // Save new coloring to store (no download popup)
      const coloringId = `color-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const coloringDrawing = {
        id: coloringId,
        title: `🖌️ Tô màu: ${selectedTemplate?.name || 'Bài tô'}`,
        imageUrl,
        rating: 0,
        completed: true,
        type: 'coloring',
        childName: user?.name || 'Bé',
        childId: user?.id,
        createdAt: new Date().toISOString(),
      };
      addCompletedDrawing(coloringDrawing);
      setEditingDrawing(coloringId); // Subsequent saves update this entry
    }

    // Show celebration (no download popup)
    setShowCelebration(true);
  }, [selectedTemplate, editingDrawingId, user, addCompletedDrawing, updateCompletedDrawing, setEditingDrawing, isRated]);

  const goBackToGallery = () => {
    setView('gallery');
    setSelectedTemplate(null);
    setHistory([]);
    setOriginalData(null);
  };

  // ====== GALLERY VIEW ======
  if (view === 'gallery') {
    return (
      <div className="color-page-gallery">
        <h2>🖌️ Tô Màu</h2>
        <p className="gallery-subtitle">Chọn hình bé thích để bắt đầu tô màu nào!</p>

        <div className="template-grid">
          {coloringTemplates.map((t) => (
            <div key={t.id} className="template-card" onClick={() => selectTemplate(t)}>
              <div className="template-preview">
                <img src={svgToDataUrl(t.svg)} alt={t.name} loading="lazy" />
              </div>
              <span className="template-name">{t.emoji} {t.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ====== COLORING VIEW ======
  const canvasContent = (
    <div className={`color-page-coloring ${isFullscreen ? 'fullscreen-canvas-mode' : ''}`}>
      <div className="coloring-header">
        {!isFullscreen && (
          <button className="btn-secondary" onClick={goBackToGallery}>
            ← Quay lại
          </button>
        )}
        <h3>{selectedTemplate?.emoji} {selectedTemplate?.name}</h3>
        <div className="coloring-actions">
          <button className="tool-btn" onClick={handleUndo} disabled={history.length === 0}>
            ↩️ Hoàn tác
          </button>
          <button className="tool-btn" onClick={handleReset} disabled={!originalData}>
            🔄 Đặt lại
          </button>
          <button className="tool-btn" onClick={toggleFullscreen}>
            {isFullscreen ? '⬜ Thu nhỏ' : '⛶ Phóng to'}
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={isRated}>
            💾 {editingDrawingId ? 'Cập nhật' : 'Lưu'}
          </button>
          {isFullscreen && (
            <button className="btn-secondary" onClick={() => { setIsFullscreen(false); goBackToGallery(); }}>
              ✕ Đóng
            </button>
          )}
        </div>
      </div>

      <div className="coloring-palette">
        {COLORS.map((color) => (
          <div
            key={color}
            className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
            style={{
              backgroundColor: color,
              border: color === '#FFFFFF' ? '2px solid #ccc' : 'none',
            }}
            onClick={() => { setSelectedColor(color); playSound('COLOR_PICK'); }}
            title={color}
          />
        ))}
      </div>

      <div className="coloring-canvas-wrapper">
        {loading && <div className="coloring-loading">⏳ Đang tải hình...</div>}
        <canvas
          ref={canvasRef}
          className="coloring-canvas"
          onClick={handleCanvasClick}
          onTouchStart={handleCanvasTouch}
          style={{ display: loading ? 'none' : 'block' }}
        />
      </div>
    </div>
  );

  return (
    <>
      {canvasContent}
      <CelebrationPopup
        show={showCelebration}
        onClose={() => setShowCelebration(false)}
        title={editingDrawingId ? 'Đã cập nhật! 🖌️' : 'Tô màu tuyệt vời! 🖌️'}
        message={`Bé ${user?.name || ''} đã hoàn thành bài tô màu "${selectedTemplate?.name || ''}". Giỏi lắm! 🌟`}
      />
    </>
  );
};

export default ColorPage;