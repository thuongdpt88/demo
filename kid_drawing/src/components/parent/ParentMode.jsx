import React from 'react';
import { useUserStore } from '../../store/userStore';
import ChildManager from './ChildManager';
import DrawingReview from './DrawingReview';
import AvatarEditor from './AvatarEditor';
import RatingPanel from './RatingPanel';

const ParentMode = () => {
    const { currentUser } = useUserStore();

    return (
        <div className="parent-mode">
            <h1>Welcome, {currentUser.name}</h1>
            <div className="parent-options">
                <ChildManager />
                <AvatarEditor />
                <DrawingReview />
                <RatingPanel />
            </div>
        </div>
    );
};

export default ParentMode;