const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hiddenText = document.querySelector('.hidden-text');
const crayon = document.getElementById('crayon');

let totalPixels, coloredPixels, isDrawing = false, lastX, lastY;

function initializeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    totalPixels = canvas.width * canvas.height;
    coloredPixels = new Set();
    hiddenText.style.opacity = 0;
}

function updateColoredPixels(x, y, radius) {
    const imageData = ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2).data;
    for (let i = 0; i < imageData.length; i += 4) {
        if (imageData[i] === 128 && imageData[i + 1] === 128 && imageData[i + 2] === 128) {
            const pixelX = x + ((i / 4) % (radius * 2)) - radius;
            const pixelY = y + Math.floor((i / 4) / (radius * 2)) - radius;
            coloredPixels.add(`${pixelX}-${pixelY}`);
        }
    }
    const coloredPercentage = (coloredPixels.size / totalPixels) * 100;
    hiddenText.style.opacity = Math.min(coloredPercentage / 7, 1); // Adjust opacity based on the percentage colored
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

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    crayon.style.display = 'block';
    [lastX, lastY] = [e.clientX, e.clientY];
    crayon.style.left = `${e.clientX}px`;
    crayon.style.top = `${e.clientY}px`;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const x = e.clientX;
        const y = e.clientY;
        drawLine(x, y, lastX, lastY);
        updateColoredPixels(x, y, 10); // Update colored pixels with thicker line
        crayon.style.left = `${x}px`;
        crayon.style.top = `${y}px`;
        [lastX, lastY] = [x, y];
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    crayon.style.display = 'none';
});

canvas.addEventListener('mouseout', () => {
    isDrawing = false;
    crayon.style.display = 'none';
});

window.addEventListener('resize', () => {
    initializeCanvas();
});

initializeCanvas();
