const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hiddenText = document.querySelector('.hidden-text');

let totalPixels, coloredPixels;

function initializeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    totalPixels = canvas.width * canvas.height;
    coloredPixels = new Set();
    hiddenText.style.display = 'none';
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
    if (coloredPixels.size >= totalPixels / 4) {
        hiddenText.style.display = 'block';
    }
}

initializeCanvas();

canvas.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const radius = 50;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'gray';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    updateColoredPixels(x, y, radius);
});

window.addEventListener('resize', initializeCanvas);
