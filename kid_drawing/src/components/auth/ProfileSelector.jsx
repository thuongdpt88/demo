import React from 'react';
import { useUserStore } from '../../store/userStore';
import AvatarPicker from '../common/AvatarPicker';

const ProfileSelector = () => {
    const { users, selectUser } = useUserStore();

    return (
        <div className="profile-selector">
            <h2>Select User Profile</h2>
            <div className="user-list">
                {users.map(user => (
                    <div key={user.id} className="user-item" onClick={() => selectUser(user.id)}>
                        <AvatarPicker avatar={user.avatar} />
                        <p>{user.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileSelector;