const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const crayon = document.getElementById('crayon');
const mirrorLink = document.getElementById('mirror-link');
const dynamicContent = document.getElementById('dynamic-content');

let isDrawing = false, lastX, lastY, crayonActive = false;

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
    console.log(`Drew line from (${lastX}, ${lastY}) to (${x}, ${y}).`);
}

function activateCrayon() {
    crayonActive = true;
    crayon.style.cursor = 'none';
    console.log("Crayon activated.");
}

function handlePointerDown(e) {
    if (!crayonActive) return;
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
    if (crayonActive) moveCrayon(x, y);
}

function handlePointerUp() {
    if (!crayonActive) return;
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
    if (coloredPercentage >= 1.37) {  // Adjusted percentage threshold
        mirrorLink.style.display = 'block';
        console.log("Mirror displayed.");
    } else {
        console.log("No colored pixels detected or less than 1.37% colored.");
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
    crayon.style.left = `${x - 15}px`;
    crayon.style.top = `${y - 50}px`;
}

function jumpThroughPortal(event) {
    event.preventDefault();
    const portalAnimation = document.getElementById('portal-animation');
    portalAnimation.classList.add('portal-active');

    // Fetch the content dynamically
    fetch('https://coloringwithgray.github.io/reflection/')
        .then(response => response.text())
        .then(html => {
            setTimeout(() => {
                dynamicContent.innerHTML = html;
                dynamicContent.style.display = 'block';
                portalAnimation.classList.remove('portal-active');
                mirrorLink.style.display = 'none';
                console.log("Content loaded dynamically.");
            }, 1000); // Match the duration of the transition
        })
        .catch(error => console.error('Error loading content:', error));
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
