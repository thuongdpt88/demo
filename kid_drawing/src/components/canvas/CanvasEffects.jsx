import React from 'react';
import { useSound } from '../../hooks/useSound';

const CanvasEffects = ({ onComplete }) => {
    const { playSound } = useSound();

    const handleBrushStroke = () => {
        playSound('brush-stroke');
    };

    const handleColorPick = () => {
        playSound('color-pick');
    };

    const handleComplete = () => {
        playSound('complete');
        if (onComplete) {
            onComplete();
        }
    };

    return (
        <div className="canvas-effects">
            <button onClick={handleBrushStroke}>Brush Stroke</button>
            <button onClick={handleColorPick}>Pick Color</button>
            <button onClick={handleComplete}>Complete Drawing</button>
        </div>
    );
};

export default CanvasEffects;