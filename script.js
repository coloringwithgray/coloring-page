/*******************************
 *  DOM References
 *******************************/
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const crayon = document.getElementById('crayon');
const mirrorLink = document.getElementById('mirror-link');
const mirrorDiv = document.getElementById('mirror');

/*******************************
 *  State Variables
 *******************************/
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let crayonActive = false;
let portalShown = false; // Track if portal has popped up this activation

// --- Palais de Tokyo: Textured Line Pattern ---
let texturedPattern = null;
function createCrayonTexture() {
  const size = 32;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = size;
  offCanvas.height = size;
  const offCtx = offCanvas.getContext('2d');

  // Fill with transparent base
  offCtx.clearRect(0, 0, size, size);

  // Draw random dots/lines for crayon effect
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const alpha = 0.12 + Math.random() * 0.13;
    offCtx.beginPath();
    offCtx.arc(x, y, 1 + Math.random() * 1.6, 0, Math.PI * 2);
    offCtx.fillStyle = `rgba(128,128,128,${alpha})`;
    offCtx.fill();
  }

  // Optionally add some streaks
  for (let i = 0; i < 6; i++) {
    const x1 = Math.random() * size;
    const y1 = Math.random() * size;
    const x2 = x1 + (Math.random() - 0.5) * 8;
    const y2 = y1 + (Math.random() - 0.5) * 8;
    offCtx.strokeStyle = `rgba(128,128,128,${0.06 + Math.random() * 0.10})`;
    offCtx.lineWidth = 1 + Math.random();
    offCtx.beginPath();
    offCtx.moveTo(x1, y1);
    offCtx.lineTo(x2, y2);
    offCtx.stroke();
  }

  return ctx.createPattern(offCanvas, 'repeat');
}

// Initialize pattern after canvas/context are available
window.addEventListener('load', () => {
  texturedPattern = createCrayonTexture();
});


// Crayon sound effect
const crayonSound = new Audio('11L-1_singular_slow_cray-1745020327208.mp3');
crayonSound.loop = true;
crayonSound.preload = 'auto';
crayonSound.volume = 0.4; // adjust as needed

function playCrayonSound() {
  if (crayonSound.paused) {
    crayonSound.currentTime = 0;
    crayonSound.play().catch(() => {}); // ignore autoplay errors
  }
}

function pauseCrayonSound() {
  if (!crayonSound.paused) {
    crayonSound.pause();
    crayonSound.currentTime = 0;
  }
}

/*******************************
 *  Initialize Canvas
 *******************************/
function initializeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  console.log('Canvas initialized.');
}

window.addEventListener('resize', initializeCanvas);
initializeCanvas();

/*******************************
 *  Activate Crayon
 *******************************/
function activateCrayon() {
  crayonActive = true;
  // Hide the default cursor on the entire page
  document.body.classList.add('hide-cursor');
  // Hide the crayon element when activated
  crayon.style.display = 'none';
  console.log('Crayon activated.');
}

/*******************************
 *  Draw Helper
 *******************************/
function drawLine(x, y, fromX, fromY) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = texturedPattern || 'gray'; // fallback if not loaded yet
  ctx.lineWidth = 15;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(x, y);
  ctx.stroke();
}

/*******************************
 *  Pointer Handlers
 *******************************/
// Throttle pointer move events (~30 FPS)
let lastMoveTime = 0;
function throttledPointerMove(e) {
  const now = Date.now();
  if (now - lastMoveTime < 33) return;
  lastMoveTime = now;
  handlePointerMove(e);
}

function handlePointerDown(e) {
  if (!crayonActive) return;
  isDrawing = true;
  lastX = e.clientX;
  lastY = e.clientY;
  // Don't show crayon element - use cursor instead
  playCrayonSound();
  console.log('Pointer down: drawing started.');
}

function handlePointerMove(e) {
  if (isDrawing) {
    drawLine(e.clientX, e.clientY, lastX, lastY);
    lastX = e.clientX;
    lastY = e.clientY;
  }
  // Let CSS cursor handle the crayon movement
}

function handlePointerUp() {
  if (!crayonActive) return;
  isDrawing = false;
  pauseCrayonSound();
  checkCanvasColored();
  console.log('Pointer up: drawing stopped.');
}

/*******************************
 *  Check How Much is Colored
 *******************************/
function checkCanvasColored() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let coloredPixels = 0;
  const totalPixels = canvas.width * canvas.height;

  // Skip some pixels for performance
  const skipFactor = 10;
  for (let i = 0; i < imageData.length; i += 4 * skipFactor) {
    // Check if pixel is "gray-ish" (allow range for each channel)
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    // Allow a tolerance of ±24
    if (
      Math.abs(r - 128) <= 24 &&
      Math.abs(g - 128) <= 24 &&
      Math.abs(b - 128) <= 24
    ) {
      coloredPixels++;
    }
  }

  const approxColored = coloredPixels * skipFactor;
  const coloredPercentage = (approxColored / totalPixels) * 100;
  console.log(`Colored: ${coloredPercentage.toFixed(2)}%`);

  // 0.5% threshold (lowered for easier testing)
  if (coloredPercentage >= 0.5) {
    // Show mirror link with scaling effect
    showMirrorLink();
    console.log('Mirror displayed with dark grey glow.');
  }
}

/*******************************
 *  Show Mirror Link with Scaling
 *******************************/
function showMirrorLink() {
  if (portalShown) return; // Only show once per activation
  portalShown = true;
  // Rule of thirds intersection points (as percentages)
  const thirds = [0, 33.33, 66.66, 100];
  // Generate all 9 intersection points (skip 0% and 100%)
  const positions = [];
  for (let i = 1; i <= 2; i++) {
    for (let j = 1; j <= 2; j++) {
      positions.push({
        left: thirds[i] + (Math.random() - 0.5) * 6, // jitter ±3%
        top: thirds[j] + (Math.random() - 0.5) * 6
      });
    }
  }
  // Add corners and center for more variety (optional)
  positions.push({ left: 33.33 + (Math.random() - 0.5) * 6, top: 50 + (Math.random() - 0.5) * 6 }); // left center
  positions.push({ left: 66.66 + (Math.random() - 0.5) * 6, top: 50 + (Math.random() - 0.5) * 6 }); // right center
  positions.push({ left: 50 + (Math.random() - 0.5) * 6, top: 33.33 + (Math.random() - 0.5) * 6 }); // top center
  positions.push({ left: 50 + (Math.random() - 0.5) * 6, top: 66.66 + (Math.random() - 0.5) * 6 }); // bottom center
  positions.push({ left: 50 + (Math.random() - 0.5) * 6, top: 50 + (Math.random() - 0.5) * 6 }); // center

  const chosen = positions[Math.floor(Math.random() * positions.length)];
  mirrorLink.style.left = `${chosen.left}%`;
  mirrorLink.style.top = `${chosen.top}%`;

  // Add the 'active' class to trigger the scale-up animation
  mirrorLink.classList.add('active');
  
  // Add glow to the #mirror div
  mirrorDiv.classList.add('mirror-glow');

  // Enable pointer events after animation
  mirrorLink.style.pointerEvents = 'auto';
}

// Function removed - now using CSS cursor instead

/*******************************
 *  Register Pointer Events
 *******************************/
canvas.addEventListener('pointerdown', handlePointerDown);
canvas.addEventListener('pointermove', throttledPointerMove);
canvas.addEventListener('pointerup', handlePointerUp);
canvas.addEventListener('pointercancel', handlePointerUp);
// Also pause sound if window loses focus or pointer leaves canvas
window.addEventListener('blur', pauseCrayonSound);
canvas.addEventListener('pointerleave', pauseCrayonSound);

/*******************************
 *  Portal Ambient Hum
 *******************************/
const portalHum = new Audio('low-hum-14645.mp3');
portalHum.loop = true;
portalHum.preload = 'auto';
portalHum.volume = 0;
let portalHumFading = false;

function fadeInHum() {
  if (portalHumFading) return;
  portalHumFading = true;
  portalHum.currentTime = 0;
  portalHum.play().catch(() => {});
  let v = portalHum.volume;
  const target = 0.23;
  const step = 0.03;
  function up() {
    if (v < target) {
      v = Math.min(target, v + step);
      portalHum.volume = v;
      requestAnimationFrame(up);
    } else {
      portalHumFading = false;
    }
  }
  up();
}
function fadeOutHum() {
  if (portalHumFading) return;
  portalHumFading = true;
  let v = portalHum.volume;
  const step = 0.03;
  function down() {
    if (v > 0) {
      v = Math.max(0, v - step);
      portalHum.volume = v;
      requestAnimationFrame(down);
    } else {
      portalHum.pause();
      portalHumFading = false;
    }
  }
  down();
}

const mirrorLinkEl = document.getElementById('mirror-link');
mirrorLinkEl.addEventListener('mouseenter', fadeInHum);
mirrorLinkEl.addEventListener('mouseleave', fadeOutHum);
mirrorLinkEl.addEventListener('focus', fadeInHum);
mirrorLinkEl.addEventListener('blur', fadeOutHum);

console.log('Script loaded.');
