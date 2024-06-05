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
    if (coloredPercentage >= 7) {
        hiddenText.style.opacity = (coloredPercentage - 7) / 93; // Adjust opacity based on the percentage above 7%
    }
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
    [lastX, lastY] = [e.clientX, e.clientY];
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        const x = e.clientX;
        const y = e.clientY;
        drawLine(x, y, lastX, lastY);
        updateColoredPixels(x, y, 10); // Update colored pixels with thicker line
        [lastX, lastY] = [x, y];
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseout', () => {
    isDrawing = false;
});

window.addEventListener('resize', () => {
    initializeCanvas();
});

initializeCanvas();
