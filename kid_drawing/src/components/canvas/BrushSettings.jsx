import React, { useState } from 'react';
import { useDrawingStore } from '../../store/drawingStore';
import { useSound } from '../../hooks/useSound';

const BrushSettings = () => {
    const { setBrushSize, setBrushColor } = useDrawingStore();
    const { playSound } = useSound();
    
    const [brushSize, setLocalBrushSize] = useState(5);
    const [brushColor, setLocalBrushColor] = useState('#000000');

    const handleBrushSizeChange = (event) => {
        const size = event.target.value;
        setLocalBrushSize(size);
        setBrushSize(size);
        playSound('brush-stroke');
    };

    const handleBrushColorChange = (event) => {
        const color = event.target.value;
        setLocalBrushColor(color);
        setBrushColor(color);
        playSound('color-pick');
    };

    return (
        <div className="brush-settings">
            <label>
                Brush Size:
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={handleBrushSizeChange}
                />
            </label>
            <label>
                Brush Color:
                <input
                    type="color"
                    value={brushColor}
                    onChange={handleBrushColorChange}
                />
            </label>
        </div>
    );
};

export default BrushSettings;