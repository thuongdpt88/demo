import React from 'react';
import { useDrawingStore } from '../../store/drawingStore';
import { useSound } from '../../hooks/useSound';

const UndoRedoControls = () => {
    const { undo, redo, canUndo, canRedo } = useDrawingStore();
    const { playSound } = useSound();

    const handleUndo = () => {
        playSound('button-click');
        undo();
    };

    const handleRedo = () => {
        playSound('button-click');
        redo();
    };

    return (
        <div className="undo-redo-controls">
            <button onClick={handleUndo} disabled={!canUndo}>
                Undo
            </button>
            <button onClick={handleRedo} disabled={!canRedo}>
                Redo
            </button>
        </div>
    );
};

export default UndoRedoControls;