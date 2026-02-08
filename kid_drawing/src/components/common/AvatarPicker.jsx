import React from 'react';
import { useUserStore } from '../../store/userStore';
import { avatars } from '../../assets/avatars';

const AvatarPicker = ({ onSelect, onAvatarChange, selectedAvatar }) => {
    const { currentUser } = useUserStore();
    const activeAvatar = selectedAvatar || currentUser?.avatar;
    const handleSelect = onSelect || onAvatarChange;

    return (
        <div className="avatar-picker">
            <h3>Chọn Avatar</h3>
            <div className="avatar-grid">
                {avatars.map((avatar, index) => (
                    <div
                        key={index}
                        className={`avatar-item ${activeAvatar === avatar ? 'selected' : ''}`}
                        onClick={() => handleSelect && handleSelect(avatar)}
                        role="button"
                        tabIndex={0}
                    >
                        <span className="avatar-emoji">{avatar}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvatarPicker;