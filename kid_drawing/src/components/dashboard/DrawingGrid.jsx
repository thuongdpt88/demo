import React from 'react';
import DrawingCard from './DrawingCard';
import { useDrawingStore } from '../../store/drawingStore';

const DrawingGrid = () => {
    const { drawings } = useDrawingStore();

    return (
        <div className="drawing-grid">
            {drawings.length > 0 ? (
                drawings.map((drawing) => (
                    <DrawingCard key={drawing.id} drawing={drawing} />
                ))
            ) : (
                <p>No drawings available.</p>
            )}
        </div>
    );
};

export default DrawingGrid;