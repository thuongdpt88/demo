import React from 'react';
import { useUserStore } from '../../store/userStore';
import DrawingGrid from './DrawingGrid';
import ProgressTracker from './ProgressTracker';
import StatsOverview from './StatsOverview';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useUserStore();

    return (
        <div className="dashboard">
            <h1>{user.isParent ? "Parent Dashboard" : "Child Dashboard"}</h1>
            <StatsOverview />
            <ProgressTracker />
            <DrawingGrid />
        </div>
    );
};

export default Dashboard;