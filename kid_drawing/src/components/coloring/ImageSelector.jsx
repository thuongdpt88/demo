import React from 'react';

const ImageSelector = ({ images = [], onSelect, onSelectImage }) => {
    const handleSelect = onSelect || onSelectImage;
    return (
        <div className="image-selector">
            <h2>Select an Image to Color</h2>
            <div className="image-grid">
                {images.length === 0 ? (
                    <p>No images available.</p>
                ) : (
                    images.map((image, index) => (
                        <div
                            key={index}
                            className="image-item"
                            onClick={() => handleSelect && handleSelect(image)}
                        >
                            <img src={image.url || image} alt={image.title || `Image ${index + 1}`} />
                            {image.title && <p>{image.title}</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ImageSelector;