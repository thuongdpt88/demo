import React from 'react';
import { useDrawingStore } from '../../store/drawingStore';
import ColorPalette from './ColorPalette';

const ToolBar = () => {
    const { tool, setTool, clearCanvas, brushSize, setBrushSize } = useDrawingStore();

    return (
        <div className="toolbar">
            <div className="tool-group">
                <button
                    className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
                    onClick={() => setTool('brush')}
                    title="Brush"
                >
                    ✏️ Brush
                </button>
                <button
                    className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                    onClick={() => setTool('eraser')}
                    title="Eraser"
                >
                    🧹 Eraser
                </button>
                <button className="tool-btn" onClick={clearCanvas} title="Clear All">
                    🗑️ Clear
                </button>
            </div>
            <div className="tool-group">
                <label className="brush-size-label">
                    Size: {brushSize}
                    <input
                        type="range"
                        min="1"
                        max="30"
                        value={brushSize}
                        onChange={(e) => setBrushSize(e.target.value)}
                    />
                </label>
            </div>
            <ColorPalette />
        </div>
    );
};

export default ToolBar;