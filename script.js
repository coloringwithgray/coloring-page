const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const crayon = document.getElementById('crayon');
const portal = document.getElementById('portal');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let crayonActive = false;

function initializeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log("Canvas initialized.");
}

function drawLine(x, y, lastX, lastY) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function activateCrayon() {
    crayonActive = true;
    crayon.style.cursor = 'none';
}

function handlePointerDown(e) {
    if (!crayonActive) return;
    [lastX, lastY] = getPointerPosition(e);
    isDrawing = true;
}

function handlePointerMove(e) {
    if (!isDrawing || !crayonActive) return;
    const [x, y] = getPointerPosition(e);
    drawLine(x, y, lastX, lastY);
    [lastX, lastY] = [x, y];
    checkCanvasColored(); // Check colored percentage while drawing
}

function handlePointerUp() {
    if (!crayonActive) return;
    isDrawing = false;
}

function checkCanvasColored() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let coloredPixels = 0;
    const totalPixels = canvas.width * canvas.height;

    for (let i = 0; i < imageData.length; i += 4) {
        // Check for gray color (128, 128, 128)
        if (imageData[i] === 128 && imageData[i + 1] === 128 && imageData[i + 2] === 128) {
            coloredPixels++;
        }
    }

    const coloredPercentage = (coloredPixels / totalPixels) * 100;

    if (coloredPercentage >= 1.37) {
        // Unlock portal when colored percentage meets threshold
        portal.innerHTML = '<iframe src="https://coloringwithgray.github.io/reflection/" frameborder="0"></iframe>';
        portal.style.display = 'block';
    }
}

function getPointerPosition(e) {
    if (e.touches) {
        return [e.touches[0].clientX, e.touches[0].clientY];
    } else {
        return [e.clientX, e.clientY];
    }
}

function jumpThroughPortal() {
    // Optional: Add transition effect or animation here
    portal.style.display = 'none'; // Hide the portal after click (optional)
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
