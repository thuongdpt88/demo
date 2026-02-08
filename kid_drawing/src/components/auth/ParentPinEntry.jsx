import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import Button from '../common/Button';
import './ParentPinEntry.css';

const ParentPinEntry = ({ onPinSubmit }) => {
    const [pin, setPin] = useState('');
    const { playSound } = useSound();
    const { authenticateParent } = useAuth();

    const handlePinChange = (e) => {
        setPin(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        playSound('button-click');
        if (authenticateParent(pin)) {
            onPinSubmit(pin);
        } else {
            alert('Invalid PIN. Please try again.');
        }
    };

    return (
        <div className="parent-pin-entry">
            <h2>Enter Parent PIN</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    value={pin}
                    onChange={handlePinChange}
                    placeholder="Enter your PIN"
                    required
                />
                <Button type="submit">Submit</Button>
            </form>
        </div>
    );
};

export default ParentPinEntry;