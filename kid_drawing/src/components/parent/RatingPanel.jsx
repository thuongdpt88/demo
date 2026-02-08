import React, { useState } from 'react';
import StarRating from '../common/StarRating';
import { useSound } from '../../hooks/useSound';

const RatingPanel = ({ drawingId, onRatingSubmit }) => {
    const [rating, setRating] = useState(0);
    const { playSound } = useSound();

    const handleRatingChange = (newRating) => {
        setRating(newRating);
        playSound('star-rating');
    };

    const handleSubmit = () => {
        if (rating > 0) {
            onRatingSubmit(drawingId, rating);
            setRating(0); // Reset rating after submission
        }
    };

    return (
        <div className="rating-panel">
            <h3>Rate this Drawing</h3>
            <StarRating rating={rating} onRate={handleRatingChange} />
            <button onClick={handleSubmit} disabled={rating === 0}>
                Submit Rating
            </button>
        </div>
    );
};

export default RatingPanel;