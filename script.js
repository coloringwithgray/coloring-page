/*******************************
 *    INITIALIZATION
 *******************************/
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const crayon = document.getElementById('crayon');
const mirrorLink = document.getElementById('mirror-link');

// State management
let isDrawing = false;
let crayonActive = false;
let lastPos = { x: 0, y: 0 };

// Performance variables
const PIXEL_CHECK_INTERVAL = 1000; // Check every 1 second
let lastCheckTime = 0;

/*******************************
 *    CANVAS SETUP
 *******************************/
function initCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function handleResize() {
  initCanvas();
  if (crayonActive) {
    crayon.style.display = 'block';
  }
}

window.addEventListener('resize', handleResize);
initCanvas();

/*******************************
 *    CRAYON CONTROLS
 *******************************/
function activateCrayon() {
  crayonActive = true;
  document.body.classList.add('hide-cursor');
  crayon.style.display = 'block';
  canvas.style.cursor = 'none';
}

function moveCrayon(x, y) {
  crayon.style.transform = `translate(${x}px, ${y}px) scale(0.3)`;
}

/*******************************
 *    DRAWING MECHANICS
 *******************************/
function startDrawing(x, y) {
  isDrawing = true;
  lastPos = { x, y };
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function draw(x, y) {
  if (!isDrawing) return;
  
  ctx.lineWidth = 15;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#808080';
  ctx.lineTo(x, y);
  ctx.stroke();
  lastPos = { x, y };
}

/*******************************
 *    INPUT HANDLERS
 *******************************/
function handlePointerStart(e) {
  if (!crayonActive) return;
  const x = e.clientX || e.touches[0].clientX;
  const y = e.clientY || e.touches[0].clientY;
  startDrawing(x, y);
}

function handlePointerMove(e) {
  if (!crayonActive) return;
  const x = e.clientX || e.touches[0].clientX;
  const y = e.clientY || e.touches[0].clientY;
  
  moveCrayon(x, y);
  draw(x, y);
  
  // Throttled pixel check
  const now = Date.now();
  if (now - lastCheckTime > PIXEL_CHECK_INTERVAL) {
    checkColoringProgress();
    lastCheckTime = now;
  }
}

function handlePointerEnd() {
  isDrawing = false;
  ctx.closePath();
}

/*******************************
 *    PORTAL ACTIVATION
 *******************************/
function checkColoringProgress() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let grayCount = 0;
  const sampleStep = 10; // Check every 10th pixel

  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    if (data[i] === 128 && data[i+1] === 128 && data[i+2] === 128) {
      grayCount++;
    }
  }

  const coverage = (grayCount * sampleStep * 100) / (canvas.width * canvas.height);
  if (coverage >= 1.37 && !mirrorLink.classList.contains('visible')) {
    revealPortal();
  }
}

function revealPortal() {
  mirrorLink.style.display = 'block';
  setTimeout(() => mirrorLink.classList.add('visible'), 10);
  mirrorLink.classList.add('mirror-glow');
}

/*******************************
 *    EVENT LISTENERS
 *******************************/
canvas.addEventListener('pointerdown', handlePointerStart);
canvas.addEventListener('pointermove', handlePointerMove);
canvas.addEventListener('pointerup', handlePointerEnd);
canvas.addEventListener('pointerleave', handlePointerEnd);

// Touch event fallbacks
canvas.addEventListener('touchstart', handlePointerStart);
canvas.addEventListener('touchmove', handlePointerMove);
canvas.addEventListener('touchend', handlePointerEnd);

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && crayonActive) {
    crayonActive = false;
    document.body.classList.remove('hide-cursor');
  }
});
