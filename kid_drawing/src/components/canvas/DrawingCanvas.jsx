import React, { useRef, useEffect } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { useDrawingStore } from '../../store/drawingStore';

const DrawingCanvas = ({ width = 800, height = 600, initialImage = null }) => {
    const canvasRef = useRef(null);
    const { draw, startDrawing, finishDrawing, clearCanvas } = useCanvas(canvasRef);
    const { clearToken } = useDrawingStore();

    // Load initial image (for editing existing drawings)
    useEffect(() => {
        if (!initialImage || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
            // Trigger a snapshot so save button works
            const { setCurrentDrawing } = useDrawingStore.getState();
            setCurrentDrawing({
                id: 'current-draft',
                title: 'Bài vẽ',
                imageUrl: canvasRef.current.toDataURL(),
                rating: 0,
                completed: false,
            });
        };
        img.src = initialImage;
    }, [initialImage]);

    // Mouse events
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseDown = (e) => {
            e.preventDefault();
            startDrawing(e);
        };
        const handleMouseMove = (e) => {
            e.preventDefault();
            draw(e);
        };
        const handleMouseUp = () => {
            finishDrawing();
        };
        const handleMouseLeave = () => {
            finishDrawing();
        };

        // Touch events
        const handleTouchStart = (e) => {
            e.preventDefault();
            startDrawing(e);
        };
        const handleTouchMove = (e) => {
            e.preventDefault();
            draw(e);
        };
        const handleTouchEnd = (e) => {
            e.preventDefault();
            finishDrawing();
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [draw, startDrawing, finishDrawing]);

    // Clear canvas on clearToken change
    useEffect(() => {
        if (!clearToken) return;
        clearCanvas();
    }, [clearToken, clearCanvas]);

    return (
        <div className="canvas-container">
            <canvas
                ref={canvasRef}
                className="drawing-canvas"
                width={width}
                height={height}
            />
        </div>
    );
};

export default DrawingCanvas;