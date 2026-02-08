import React from 'react';
import { useSound } from '../../hooks/useSound';
import StarRating from '../common/StarRating';
import './DrawingCard.css'; // Assuming you will create a CSS file for styling

const DrawingCard = ({ drawing, onRate }) => {
    const { playSound } = useSound();

    const handleRating = (rating) => {
        playSound('star-rating');
        if (onRate) {
            onRate(drawing.id, rating);
        }
    };

    return (
        <div className="drawing-card">
            <img src={drawing.imageUrl} alt={drawing.title} className="drawing-image" />
            <h3 className="drawing-title">{drawing.title}</h3>
            <StarRating
                rating={drawing.rating}
                onRate={handleRating}
            />
            <p className="drawing-status">{drawing.completed ? 'Completed' : 'In Progress'}</p>
        </div>
    );
};

export default DrawingCard;