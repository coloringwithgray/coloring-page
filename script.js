const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hiddenText = document.querySelector('.hidden-text');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const coloredPixels = new Set();

function trackColoredPixels(x, y, radius) {
    const imageData = ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 128 && data[i + 1] === 128 && data[i + 2] === 128) {
            const posX = x + (i / 4) % (radius * 2) - radius;
            const posY = y + Math.floor((i / 4) / (radius * 2)) - radius;
            coloredPixels.add(`${posX}-${posY}`);
        }
    }
    if (coloredPixels.size >= (canvas.width * canvas.height) / 4) {
        hiddenText.style.display = 'block';
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    coloredPixels.clear();
    hiddenText.style.display = 'none';
}

resizeCanvas();

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

    trackColoredPixels(x, y, radius);
});

window.addEventListener('resize', resizeCanvas);
hiddenText.style.display = 'none';
