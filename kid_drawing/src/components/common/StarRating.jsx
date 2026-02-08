import React, { useState } from 'react';

const StarRating = ({ rating = 0, onRate = () => {}, disabled = false }) => {
    const [hoveredRating, setHoveredRating] = useState(0);

    return (
        <div className={`star-rating ${disabled ? 'star-rating-disabled' : ''}`} onClick={(e) => e.stopPropagation()}>
            {[1, 2, 3, 4, 5].map((value) => (
                <span
                    key={value}
                    className={`star ${value <= (hoveredRating || rating) ? 'filled' : ''}`}
                    onMouseEnter={() => !disabled && setHoveredRating(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!disabled) onRate(value);
                    }}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    style={disabled ? { cursor: 'default' } : {}}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;