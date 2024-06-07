const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let isDrawing = false, lastX, lastY;

// Adjusted threshold for colored percentage check
const COLOR_THRESHOLD = 2.47;

function initializeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Position the gray crayon initially at the center of the page
    const centerX = canvas.width / 2 - crayon.width / 2;
    const centerY = canvas.height / 2 - crayon.height / 2;
    crayon.style.left = `${centerX}px`;
    crayon.style.top = `${centerY}px`;
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

function handlePointerDown(e) {
    if (!isDrawing) {
        const [x, y] = getPointerPosition(e);
        [lastX, lastY] = [x, y];
        isDrawing = true;
    }
}

function handlePointerMove(e) {
    if (isDrawing) {
        const [x, y] = getPointerPosition(e);
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
    const totalPixels = canvas.width * canvas.height;
    for (let i = 0; i < imageData.length; i += 4) {
        if (imageData[i] === 128 && imageData[i + 1] === 128 && imageData[i + 2] === 128) {
            coloredPixels++;
        }
    }
    const coloredPercentage = (coloredPixels / totalPixels) * 100;
    if (coloredPercentage >= COLOR_THRESHOLD) {
        mirrorLink.style.display = 'block';
    }
}

function getPointerPosition(e) {
    if (e.touches) {
        return [e.touches[0].clientX, e.touches[0].clientY];
    } else {
        return [e.clientX, e.clientY];
    }
}

function triggerPortalEffect() {
    mirrorLink.classList.add('portal-animation');
    setTimeout(() => {
        window.location.href = 'https://coloringwithgray.github.io/reflection/';
    }, 1000); // Match the duration of the transition
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
