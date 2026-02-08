import React from 'react';
import { useUserStore } from '../../store/userStore';
import { useDrawingStore } from '../../store/drawingStore';
import DrawingCard from './DrawingCard';
import './ProgressTracker.css';

const ProgressTracker = () => {
    const { user } = useUserStore();
    const { completedDrawings } = useDrawingStore();

    return (
        <div className="progress-tracker">
            <h2>{user.isParent ? "Children's Progress" : "Your Progress"}</h2>
            <div className="drawing-grid">
                {completedDrawings.length > 0 ? (
                    completedDrawings.map((drawing) => (
                        <DrawingCard key={drawing.id} drawing={drawing} />
                    ))
                ) : (
                    <p>No completed drawings yet!</p>
                )}
            </div>
        </div>
    );
};

export default ProgressTracker;