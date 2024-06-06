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
    hiddenText.style.left = `${(canvas.width / 2) - (hiddenText.offsetWidth / 2)}px`;
    hiddenText.style.top = `${(canvas.height / 2) - (hiddenText.offsetHeight / 2)}px`;
    console.log("Canvas initialized. Hidden text position set.");
}

function drawLine(x, y, lastX, lastY) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 15;  // Thicker drawing line
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    console.log(`Drew line from (${lastX}, ${lastY}) to (${x}, ${y}).`);
}

function handlePointerDown(e) {
    const [x, y] = getPointerPosition(e);
    [lastX, lastY] = [x, y];
    isDrawing = true;
    crayon.style.display = 'block';
    moveCrayon(x, y);
    console.log("Pointer down event. Drawing started.");
}

function handlePointerMove(e) {
    const [x, y] = getPointerPosition(e);
    if (isDrawing) {
        drawLine(x, y, lastX, lastY);
        [lastX, lastY] = [x, y];
    }
    moveCrayon(x, y);
}

function handlePointerUp() {
    isDrawing = false;
    checkCanvasColored();
    console.log("Pointer up event. Drawing stopped.");
}

function checkCanvasColored() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let coloredPixels = 0;
    const totalPixels = canvas.width * canvas.height;
    for (let i = 0; i < imageData.length; i += 4) {
        if (imageData[i] === 128 && imageData[i + 1] === 128 && imageData[i + 2] === 128) {
            coloredPixels++;
        }
    }
    const coloredPercentage = (coloredPixels / totalPixels) * 100;
    console.log(`Total pixels: ${totalPixels}, Colored pixels: ${coloredPixels}, Colored percentage: ${coloredPercentage}%`);
    if (coloredPercentage > 0) {
        hiddenText.style.opacity = 1;
        hiddenText.style.pointerEvents = 'auto';
        console.log("Hidden text displayed.");
    }
}

function getPointerPosition(e) {
    if (e.touches) {
        return [e.touches[0].clientX, e.touches[0].clientY];
    } else {
        return [e.clientX, e.clientY];
    }
}

function moveCrayon(x, y) {
    crayon.style.left = `${x - 15}px`; // Adjusted to be closer to the cursor
    crayon.style.top = `${y - 50}px`;  // Adjusted to be closer to the cursor
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
