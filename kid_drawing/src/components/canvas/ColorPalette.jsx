import React from 'react';
import { useDrawingStore } from '../../store/drawingStore';

const DEFAULT_COLORS = [
    '#000000', '#ffffff', '#ff3b30', '#ff9500', '#ffcc00',
    '#34c759', '#007aff', '#5856d6', '#af52de', '#ff2d55',
    '#8b4513', '#ff69b4',
];

const ColorPalette = ({ colors = DEFAULT_COLORS }) => {
    const { brushColor, setBrushColor } = useDrawingStore();

    return (
        <div className="color-palette">
            {colors.map((color) => (
                <div
                    key={color}
                    className={`color-swatch ${brushColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color, border: color === '#ffffff' ? '2px solid #ccc' : 'none' }}
                    onClick={() => setBrushColor(color)}
                    role="button"
                    tabIndex={0}
                    title={color}
                />
            ))}
        </div>
    );
};

export default ColorPalette;