import React, { useEffect, useState } from 'react';
import { useSound } from '../../hooks/useSound';

const EMOJIS = ['🎉', '⭐', '🌟', '🎨', '✨', '🏆', '🎊', '💖', '🌈', '🦄'];

const CelebrationPopup = ({ show, onClose, title, message }) => {
    const { playSound } = useSound();
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (show) {
            playSound('COMPLETE');
            // Generate confetti particles
            const newParticles = Array.from({ length: 20 }, (_, i) => ({
                id: i,
                emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
                left: Math.random() * 100,
                delay: Math.random() * 0.5,
                duration: 1.5 + Math.random() * 1.5,
                size: 1 + Math.random() * 1.2,
            }));
            setParticles(newParticles);

            const timer = setTimeout(() => {
                onClose?.();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className="celebration-overlay" onClick={onClose}>
            {/* Confetti particles */}
            <div className="confetti-container">
                {particles.map((p) => (
                    <span
                        key={p.id}
                        className="confetti-particle"
                        style={{
                            left: `${p.left}%`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                            fontSize: `${p.size}rem`,
                        }}
                    >
                        {p.emoji}
                    </span>
                ))}
            </div>

            {/* Modal */}
            <div className="celebration-modal" onClick={(e) => e.stopPropagation()}>
                <div className="celebration-icon">🎉</div>
                <h2 className="celebration-title">{title || 'Tuyệt vời!'}</h2>
                <p className="celebration-message">
                    {message || 'Bé đã hoàn thành xuất sắc! Tiếp tục sáng tạo nhé! 🌟'}
                </p>
                <div className="celebration-stars">
                    {'⭐'.repeat(5)}
                </div>
                <button className="btn-primary celebration-btn" onClick={onClose}>
                    🎨 Tiếp tục sáng tạo!
                </button>
            </div>
        </div>
    );
};

export default CelebrationPopup;
