const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hiddenText = document.querySelector('.hidden-text');
const crayon = document.getElementById('crayon');

let isDrawing = false, lastX, lastY;
let totalPixels, coloredPixels;

function initializeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    totalPixels = canvas.width * canvas.height;
    coloredPixels = new Set();
    hiddenText.style.opacity = 0;
    hiddenText.style.pointerEvents = 'none';
}

function updateColoredPixels(x, y, radius) {
    const imageData = ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2).data;
    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        if (r === 128 && g === 128 && b === 128) {
            const pixelX = x + ((i / 4) % (radius * 2)) - radius;
            const pixelY = y + Math.floor((i / 4) / (radius * 2)) - radius;
            coloredPixels.add(`${pixelX}-${pixelY}`);
        }
    }
    const coloredPercentage = (coloredPixels.size / totalPixels) * 100;
    hiddenText.style.opacity = Math.min(coloredPercentage / 7, 1);
    hiddenText.style.pointerEvents = coloredPercentage >= 7 ? 'auto' : 'none';
    console.log(`Colored percentage: ${coloredPercentage}%`); // Debugging line
}

function drawLine(x, y, lastX, lastY) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 10;  // Thicker drawing line
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function handlePointerDown(e) {
    const [x, y] = getPointerPosition(e);
    [lastX, lastY] = [x, y];
    isDrawing = true;
    crayon.style.display = 'block';
    crayon.style.left = `${x}px`;
    crayon.style.top = `${y}px`;
}

function handlePointerMove(e) {
    const [x, y] = getPointerPosition(e);
    if (isDrawing) {
        drawLine(x, y, lastX, lastY);
        updateColoredPixels(x, y, 10); // Update colored pixels with thicker line
        [lastX, lastY] = [x, y];
    }
    crayon.style.left = `${x}px`;
    crayon.style.top = `${y}px`;
}

function handlePointerUp() {
    isDrawing = false;
    crayon.style.display = 'none';
}

function getPointerPosition(e) {
    if (e.touches) {
        return [e.touches[0].clientX, e.touches[0].clientY];
    } else {
        return [e.clientX, e.clientY];
    }
}

canvas.addEventListener('mousedown', handlePointerDown);
canvas.addEventListener('mousemove', handlePointerMove);
canvas.addEventListener('mouseup', handlePointerUp);
canvas.addEventListener('mouseout', handlePointerUp);

canvas.addEventListener('touchstart', handlePointerDown);
canvas.addEventListener('touchmove', handlePointerMove);
canvas.addEventListener('touchend', handlePointerUp);
canvas.addEventListener('touchcancel', handlePointerUp);

window.addEventListener('resize', initializeCanvas);

initializeCanvas();
