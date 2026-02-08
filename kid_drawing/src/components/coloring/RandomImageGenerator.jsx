import React, { useEffect, useState } from 'react';
import { generateRandomImage } from '../../utils/imageGenerator';
import { useSound } from '../../hooks/useSound';

const RandomImageGenerator = ({ onSelect, onImageGenerated }) => {
    const [image, setImage] = useState(null);
    const { playSound } = useSound('/sounds/button-click.mp3');

    const handleGenerateImage = () => {
        const newImage = generateRandomImage();
        setImage(newImage);
        if (onImageGenerated) {
            onImageGenerated(newImage);
        }
        if (onSelect) {
            onSelect(newImage);
        }
        playSound();
    };

    useEffect(() => {
        handleGenerateImage();
    }, []);

    return (
        <div className="random-image-generator">
            <button onClick={handleGenerateImage} className="generate-button">
                Generate Random Image
            </button>
            {image && <img src={image} alt="Randomly generated" className="generated-image" />}
        </div>
    );
};

export default RandomImageGenerator;