const canvas = document.getElementById('canvas');
const crayon = document.getElementById('crayon');
const mirrorLink = document.getElementById('mirror-link');
const mirrorIframe = document.getElementById('mirror-iframe');

let isDrawing = false, crayonActive = false;

function initializeCanvas() {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log("Canvas initialized.");
}

function activateCrayon() {
    crayonActive = true;
    crayon.style.cursor = 'none';
    console.log("Crayon activated.");
}

function jumpThroughPortal() {
    mirrorLink.classList.add('portal-expand');
    setTimeout(() => {
        window.location.href = 'https://coloringwithgray.github.io/reflection/';
    }, 1000); // Adjust timing as needed to match the animation duration
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
