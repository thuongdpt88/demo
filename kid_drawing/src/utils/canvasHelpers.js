export const drawLine = (ctx, startX, startY, endX, endY, color, lineWidth) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
};

export const clearCanvas = (ctx, canvas) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export const setCanvasBackground = (ctx, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

export const saveDrawing = (canvas) => {
    return canvas.toDataURL('image/png');
};

export const loadImageToCanvas = (ctx, imageUrl) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
    };
};