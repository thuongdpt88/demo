import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import AvatarPicker from '../common/AvatarPicker';
import Button from '../common/Button';

const AvatarEditor = () => {
    const { currentUser, updateAvatar } = useUserStore();
    const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || null);

    const handleAvatarChange = (avatar) => {
        setSelectedAvatar(avatar);
    };

    const handleSave = () => {
        if (selectedAvatar) {
            updateAvatar(selectedAvatar);
        }
    };

    return (
        <div className="avatar-editor">
            <h2>Edit Avatar</h2>
            <AvatarPicker selectedAvatar={selectedAvatar} onAvatarChange={handleAvatarChange} />
            <Button onClick={handleSave}>Save Avatar</Button>
        </div>
    );
};

export default AvatarEditor;