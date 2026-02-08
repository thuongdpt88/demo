import React, { useEffect, useState } from 'react';
import DrawingCanvas from '../canvas/DrawingCanvas';
import ColorPalette from '../canvas/ColorPalette';
import ImageSelector from './ImageSelector';
import RandomImageGenerator from './RandomImageGenerator';
import { useSound } from '../../hooks/useSound';

const ColoringPage = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const { playSound } = useSound();

    useEffect(() => {
        // Load default image or random image on mount
        setSelectedImage(null);
    }, []);

    const handleImageSelect = (image) => {
        setSelectedImage(image);
        playSound('color-pick');
    };

    const handleDrawingComplete = () => {
        playSound('complete');
    };

    return (
        <div className="coloring-page">
            <h1>Coloring Page</h1>
            <ImageSelector onSelect={handleImageSelect} />
            <RandomImageGenerator onSelect={handleImageSelect} />
            {selectedImage && (
                <DrawingCanvas
                    image={selectedImage}
                    onComplete={handleDrawingComplete}
                />
            )}
            <ColorPalette />
        </div>
    );
};

export default ColoringPage;