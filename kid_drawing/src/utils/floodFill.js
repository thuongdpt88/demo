/**
 * Scanline-based flood fill algorithm for canvas coloring.
 * Fills a connected region of similar color with a new color.
 */

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Flood fill a region on the canvas.
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {number} startX - X coordinate of the click
 * @param {number} startY - Y coordinate of the click
 * @param {string} fillColorHex - Hex color string (e.g. '#FF0000')
 * @param {number} tolerance - Color matching tolerance (0-255)
 * @returns {boolean} Whether any pixels were filled
 */
export function floodFill(ctx, startX, startY, fillColorHex, tolerance = 30) {
  const canvas = ctx.canvas;
  const width = canvas.width;
  const height = canvas.height;

  // Clamp coordinates
  startX = Math.max(0, Math.min(width - 1, Math.round(startX)));
  startY = Math.max(0, Math.min(height - 1, Math.round(startY)));

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Get target color at click point
  const startIdx = (startY * width + startX) * 4;
  const tR = data[startIdx];
  const tG = data[startIdx + 1];
  const tB = data[startIdx + 2];

  const fill = hexToRgb(fillColorHex);

  // Don't fill dark outlines (black lines)
  if (tR < 50 && tG < 50 && tB < 50) return false;

  // Don't fill if already the same color
  if (Math.abs(tR - fill.r) < 3 && Math.abs(tG - fill.g) < 3 && Math.abs(tB - fill.b) < 3) {
    return false;
  }

  const match = (i) =>
    Math.abs(data[i] - tR) <= tolerance &&
    Math.abs(data[i + 1] - tG) <= tolerance &&
    Math.abs(data[i + 2] - tB) <= tolerance;

  const visited = new Uint8Array(width * height);
  const stack = [[startX, startY]];
  let filled = false;

  while (stack.length > 0) {
    let [x, y] = stack.pop();

    // Scan upward to find top of this column segment
    while (y > 0 && match(((y - 1) * width + x) * 4) && !visited[(y - 1) * width + x]) {
      y--;
    }

    let spanLeft = false;
    let spanRight = false;

    // Scan downward, filling pixels and checking neighbors
    while (y < height) {
      const idx = (y * width + x) * 4;
      const vIdx = y * width + x;

      if (!match(idx) || visited[vIdx]) break;

      visited[vIdx] = 1;
      data[idx] = fill.r;
      data[idx + 1] = fill.g;
      data[idx + 2] = fill.b;
      data[idx + 3] = 255;
      filled = true;

      // Check left neighbor
      if (x > 0) {
        const leftIdx = (y * width + x - 1) * 4;
        if (match(leftIdx) && !visited[y * width + x - 1]) {
          if (!spanLeft) {
            stack.push([x - 1, y]);
            spanLeft = true;
          }
        } else {
          spanLeft = false;
        }
      }

      // Check right neighbor
      if (x < width - 1) {
        const rightIdx = (y * width + x + 1) * 4;
        if (match(rightIdx) && !visited[y * width + x + 1]) {
          if (!spanRight) {
            stack.push([x + 1, y]);
            spanRight = true;
          }
        } else {
          spanRight = false;
        }
      }

      y++;
    }
  }

  if (filled) {
    ctx.putImageData(imageData, 0, 0);
  }

  return filled;
}
