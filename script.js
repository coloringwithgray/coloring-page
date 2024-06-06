const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hiddenText = document.querySelector('.hidden-text');
const crayon = document.getElementById('crayon');

let isDrawing = false, lastX, lastY;

function initializeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hiddenText.style.opacity = 0;
    hiddenText.style.pointerEvents = 'none';
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
}

function handlePointerMove(e) {
    const [x, y] = getPointerPosition(e);
    if (isDrawing) {
        drawLine(x, y, lastX, lastY);
        [lastX, lastY] = [x, y];
    }
}

function handlePointerUp() {
    isDrawing = false;
    checkCanvasColored();
}

function checkCanvasColored() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let coloredPixels = 0;
    for (let i = 0; i < imageData.length; i += 4) {
        if (imageData[i] === 128 && imageData[i + 1] === 128 && imageData[i + 2] === 128) {
            coloredPixels++;
        }
    }
    if (coloredPixels > 0) {
        showHiddenText();
    }
}

function showHiddenText() {
    const canvasRect = canvas.getBoundingClientRect();
    hiddenText.style.opacity = 1;
    hiddenText.style.pointerEvents = 'auto';
    hiddenText.style.left = `${canvasRect.left + canvasRect.width / 2}px`;
    hiddenText.style.top = `${canvasRect.top + canvasRect.height / 2}px`;
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
