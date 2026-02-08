import { useCallback, useEffect, useRef } from 'react';
import { SOUND_EFFECTS } from '../utils/constants';

const resolveSoundSrc = (sound) => {
    if (!sound) {
        return null;
    }

    if (SOUND_EFFECTS[sound]) {
        return SOUND_EFFECTS[sound];
    }

    if (typeof sound === 'string') {
        const normalizedKey = sound.toUpperCase().replace(/-/g, '_');
        if (SOUND_EFFECTS[normalizedKey]) {
            return SOUND_EFFECTS[normalizedKey];
        }
    }

    if (typeof sound === 'string') {
        if (sound.endsWith('.mp3')) {
            return sound.startsWith('/') ? sound : `/sounds/${sound}`;
        }
        return sound;
    }

    return null;
};

const useSound = (defaultSound) => {
    const audioRef = useRef(null);

    const playSound = useCallback((sound) => {
        const resolved = resolveSoundSrc(sound || defaultSound);
        if (!resolved) {
            return;
        }

        if (!audioRef.current || audioRef.current.src !== resolved) {
            audioRef.current = new Audio(resolved);
        }

        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
            console.error('Error playing sound:', error);
        });
    }, [defaultSound]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    return { playSound };
};

export { useSound };
export default useSound;