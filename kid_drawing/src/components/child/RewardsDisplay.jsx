import React from 'react';
import { useDrawingStore } from '../../store/drawingStore';
import StarRating from '../common/StarRating';
import './RewardsDisplay.css';

const RewardsDisplay = () => {
    const { completedDrawings } = useDrawingStore();

    return (
        <div className="rewards-display">
            <h2>Your Rewards</h2>
            <div className="completed-drawings">
                {completedDrawings.length > 0 ? (
                    completedDrawings.map((drawing) => (
                        <div key={drawing.id} className="drawing-card">
                            <img src={drawing.imageUrl} alt={drawing.title} />
                            <h3>{drawing.title}</h3>
                            <StarRating rating={drawing.rating} />
                        </div>
                    ))
                ) : (
                    <p>No completed drawings yet!</p>
                )}
            </div>
        </div>
    );
};

export default RewardsDisplay;