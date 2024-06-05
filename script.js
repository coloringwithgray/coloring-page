const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hiddenText = document.querySelector('.hidden-text');
const crayon = document.getElementById('crayon');

let totalPixels, coloredPixels, drawing = false;

function initializeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    totalPixels = canvas.width * canvas.height;
    coloredPixels = new Set();
    hiddenText.style.display = 'none';
    crayon.style.display = 'none';
    drawing = false;
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
    if (coloredPixels.size >= totalPixels * 0.07) {  // 7% threshold
        hiddenText.style.display = 'block';
    }
}

function drawLine(x, y, radius) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'gray';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

canvas.addEventListener('click', (e) => {
    if (!drawing) {
        drawing = true;
        crayon.style.display = 'block';
        crayon.style.left = `${e.clientX - crayon.width / 2}px`;
        crayon.style.top = `${e.clientY - crayon.height / 2}px`;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        const x = e.clientX;
        const y = e.clientY;
        const radius = 5;  // Thinner drawing line

        crayon.style.left = `${x - crayon.width / 2}px`;
        crayon.style.top = `${y - crayon.height / 2}px`;

        drawLine(x, y, radius);
        updateColoredPixels(x, y, radius);
    }
});

window.addEventListener('resize', initializeCanvas);

initializeCanvas();
