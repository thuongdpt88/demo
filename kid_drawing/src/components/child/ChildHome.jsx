import React from 'react';
import { useDrawingStore } from '../../store/drawingStore';
import { useAuth } from '../../hooks/useAuth';
import DrawingGrid from '../dashboard/DrawingGrid';
import ProgressTracker from '../dashboard/ProgressTracker';
import RewardsDisplay from './RewardsDisplay';

const ChildHome = () => {
    const { user } = useAuth();
    const { completedDrawings } = useDrawingStore();

    return (
        <div className="child-home">
            <h1>Welcome, {user?.name || 'Friend'}!</h1>
            <ProgressTracker />
            <DrawingGrid drawings={completedDrawings} />
            <RewardsDisplay />
        </div>
    );
};

export default ChildHome;