import React from 'react';
import { useUserStore } from '../../store/userStore';
import AvatarPicker from '../common/AvatarPicker';
import Button from '../common/Button';

const ChildManager = () => {
    const { children, updateAvatar, rateDrawing } = useUserStore(state => ({
        children: state.children,
        updateAvatar: state.updateAvatar,
        rateDrawing: state.rateDrawing,
    }));

    const handleAvatarChange = (childId, newAvatar) => {
        updateAvatar(childId, newAvatar);
    };

    const handleRating = (drawingId, rating) => {
        rateDrawing(drawingId, rating);
    };

    return (
        <div className="child-manager">
            <h2>Manage Children</h2>
            <ul>
                {children.map(child => (
                    <li key={child.id}>
                        <div>
                            <h3>{child.name}</h3>
                            <AvatarPicker 
                                selectedAvatar={child.avatar} 
                                onAvatarChange={(newAvatar) => handleAvatarChange(child.id, newAvatar)} 
                            />
                            <Button onClick={() => handleRating(child.drawingId, 5)}>Rate Drawing 5 Stars</Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChildManager;