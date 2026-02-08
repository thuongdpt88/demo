import React from 'react';
import { useUserStore } from '../../store/userStore';
import AvatarPicker from '../common/AvatarPicker';
import { useSound } from '../../hooks/useSound';

const ChildProfile = () => {
    const { currentUser, updateAvatar } = useUserStore();
    const { playSound } = useSound();

    const handleAvatarChange = (avatar) => {
        updateAvatar(avatar);
        playSound('button-click');
    };

    return (
        <div className="child-profile">
            <h2>{currentUser?.name || 'Child'}'s Profile</h2>
            <div className="avatar-section">
                <h3>Select Avatar</h3>
                <AvatarPicker
                    selectedAvatar={currentUser.avatar}
                    onAvatarChange={handleAvatarChange}
                />
            </div>
            <div className="profile-info">
                <p>Email: {currentUser?.email || 'unknown'}</p>
                <p>Completed Drawings: {currentUser?.completedDrawings?.length || 0}</p>
            </div>
        </div>
    );
};

export default ChildProfile;