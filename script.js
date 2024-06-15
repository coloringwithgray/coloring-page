const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const crayon = document.getElementById('crayon');
const mirrorLink = document.getElementById('mirror-link');

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
    crayon.style.display = 'block'; // Show crayon image
    crayon.style.cursor = 'none'; // Hide default cursor
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
}

function handlePointerUp() {
    if (!crayonActive) return;
    isDrawing = false;
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
    setTimeout(function() {
        // Redirect to the mirror URL
        window.location.href = 'https://coloringwithgray.github.io/reflection/#section2';
    }, 1000); // Adjust delay as needed
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
