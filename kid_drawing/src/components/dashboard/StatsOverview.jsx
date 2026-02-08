import React from 'react';
import { useUserStore } from '../../store/userStore';
import { useDrawingStore } from '../../store/drawingStore';

const StatsOverview = () => {
    const { users } = useUserStore();
    const { completedDrawings } = useDrawingStore();

    const totalUsers = users.length;
    const totalDrawings = completedDrawings.length;
    const averageRating = completedDrawings.reduce((acc, drawing) => acc + drawing.rating, 0) / (totalDrawings || 1);

    return (
        <div className="stats-overview">
            <h2>User Statistics</h2>
            <div className="stat-item">
                <h3>Total Users</h3>
                <p>{totalUsers}</p>
            </div>
            <div className="stat-item">
                <h3>Total Completed Drawings</h3>
                <p>{totalDrawings}</p>
            </div>
            <div className="stat-item">
                <h3>Average Rating</h3>
                <p>{averageRating.toFixed(1)} / 5</p>
            </div>
        </div>
    );
};

export default StatsOverview;