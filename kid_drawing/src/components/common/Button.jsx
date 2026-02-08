import React from 'react';

const Button = ({ onClick, children, className = '', disabled = false, variant = 'primary' }) => {
    const baseClass = variant === 'secondary' ? 'btn-secondary' : 'btn-primary';
    return (
        <button
            onClick={onClick}
            className={`${baseClass} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;