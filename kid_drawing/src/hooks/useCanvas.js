import { useRef, useEffect, useCallback } from 'react';
import { useDrawingStore } from '../store/drawingStore';

const useCanvas = (canvasRef) => {
    const { brushSize, brushColor, tool } = useDrawingStore();
    const ctxRef = useRef(null);
    const isDrawingRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctxRef.current = ctx;

        // Fill white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, [canvasRef]);

    const getPoint = useCallback((event) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Handle both mouse and touch events
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    }, [canvasRef]);

    const startDrawing = useCallback((event) => {
        const ctx = ctxRef.current;
        if (!ctx) return;
        isDrawingRef.current = true;
        const { x, y } = getPoint(event);
        ctx.beginPath();
        ctx.moveTo(x, y);
    }, [getPoint]);

    const draw = useCallback((event) => {
        if (!isDrawingRef.current) return;
        const ctx = ctxRef.current;
        if (!ctx) return;
        const { x, y } = getPoint(event);

        ctx.lineWidth = brushSize;
        if (tool === 'eraser') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = brushSize * 2;
        } else {
            ctx.strokeStyle = brushColor;
        }
        ctx.lineTo(x, y);
        ctx.stroke();
    }, [brushColor, brushSize, tool, getPoint]);

    const finishDrawing = useCallback(() => {
        if (!isDrawingRef.current) return null;
        isDrawingRef.current = false;
        const ctx = ctxRef.current;
        if (!ctx) return null;
        ctx.closePath();

        // Save current canvas state as the "current drawing" snapshot
        // Use a stable ID so repeated strokes update the same drawing
        const drawing = {
            id: 'current-draft',
            title: 'Bài vẽ mới',
            imageUrl: ctx.canvas.toDataURL(),
            rating: 0,
            completed: false,
        };
        // Update currentDrawing without adding duplicates to drawings[]
        const { setCurrentDrawing } = useDrawingStore.getState();
        setCurrentDrawing(drawing);
        return drawing;
    }, []);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, [canvasRef]);

    return {
        draw,
        startDrawing,
        finishDrawing,
        clearCanvas,
        isDrawing: isDrawingRef,
    };
};

export { useCanvas };
export default useCanvas;