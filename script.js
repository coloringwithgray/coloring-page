const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hiddenText = document.querySelector('.hidden-text');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function isCanvasColored() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 128 || data[i + 1] !== 128 || data[i + 2] !== 128) {
            return false;
        }
    }
    return true;
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

    if (isCanvasColored()) {
        hiddenText.style.display = 'block';
    }
});

window.addEventListener('resize', resizeCanvas);
hiddenText.style.display = 'none';
