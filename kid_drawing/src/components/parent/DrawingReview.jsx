import React from 'react';
import { useDrawingStore } from '../../store/drawingStore';
import { useUserStore } from '../../store/userStore';
import StarRating from '../common/StarRating';
import Button from '../common/Button';
import './DrawingReview.css';

const DrawingReview = () => {
    const { drawings, rateDrawing } = useDrawingStore();
    const { currentUser } = useUserStore();

    const handleRating = (drawingId, rating) => {
        rateDrawing(drawingId, rating);
        // Play sound effect for rating
        const audio = new Audio('/sounds/star-rating.mp3');
        audio.play();
    };

    return (
        <div className="drawing-review">
            <h2>Review Children's Drawings</h2>
            <div className="drawing-list">
                {drawings.map(drawing => (
                    <div key={drawing.id} className="drawing-card">
                        <img src={drawing.imageUrl} alt={`Drawing by ${drawing.childName}`} />
                        <div className="drawing-info">
                            <h3>{drawing.childName}'s Drawing</h3>
                            <StarRating 
                                rating={drawing.rating} 
                                onRate={(rating) => handleRating(drawing.id, rating)} 
                            />
                        </div>
                    </div>
                ))}
            </div>
            {currentUser.isParent && (
                <Button onClick={() => {/* Logic to go back to parent dashboard */}}>
                    Back to Dashboard
                </Button>
            )}
        </div>
    );
};

export default DrawingReview;