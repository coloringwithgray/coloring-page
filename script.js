/*******************************
 *  DOM References
 *******************************/
// === Grand Prix-Level Constants ===
// All values below are chosen for a poetic, tactile, and performant experience.
const DRAW_COLOR = 'gray'; // Monochrome for brand identity
const DRAW_LINE_WIDTH = 15; // Visually satisfying, tactile stroke
const POINTER_THROTTLE_MS = 33; // ~30 FPS for smoothness without overloading CPU
const PIXEL_SKIP_FACTOR = 10; // Skip pixels for perf when checking colored area
const GRAY_COLOR = 128; // RGB value for 'gray' crayon
const PORTAL_REVEAL_THRESHOLD = 1.37; // Minimum % colored to reveal portal
const CRAYON_SOUND_FILE = '11L-1_singular_slow_cray-1745020327208.mp3'; // Tactile crayon sound
const HUM_SOUND_FILE = 'low-hum-14645.mp3'; // Portal ambient hum
const CRAYON_SOUND_VOLUME = 0.4; // Tuned for subtlety
const HUM_SOUND_VOLUME = 0.23; // Tuned for subtlety
const HUM_FADE_STEP = 0.03; // Smooth fade for hum


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const crayon = document.getElementById('crayon');

// Ensure crayon can be activated by click and keyboard (Enter/Space)
if (crayon) {
  crayon.addEventListener('click', activateCrayon);
  crayon.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activateCrayon();
    }
  });
}



/*******************************
 *  State Variables
 *******************************/
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let crayonActive = false;

// Crayon sound effect
const crayonSound = new Audio(CRAYON_SOUND_FILE);
crayonSound.loop = true;
crayonSound.preload = 'auto';
crayonSound.volume = CRAYON_SOUND_VOLUME;

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
  // console.log('Canvas initialized.');
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

  // console.log('Crayon activated.');
}

/*******************************
 *  Draw Helper
 *******************************/
function drawLine(x, y, fromX, fromY) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = DRAW_COLOR;
  ctx.lineWidth = DRAW_LINE_WIDTH;
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
// Throttle pointer move events for performance (limits to ~30 FPS)
let lastMoveTime = 0;
function throttledPointerMove(e) {
  const now = Date.now();
  if (now - lastMoveTime < POINTER_THROTTLE_MS) return;
  lastMoveTime = now;
  handlePointerMove(e);
}

function handlePointerDown(e) {
  if (!crayonActive) return;
  isDrawing = true;
  lastX = e.clientX;
  lastY = e.clientY;
  crayon.style.display = 'block';
  moveCrayon(e.clientX, e.clientY);
  playCrayonSound();
  // console.log('Pointer down: drawing started.');
}

function handlePointerMove(e) {
  if (isDrawing) {
    drawLine(e.clientX, e.clientY, lastX, lastY);
    lastX = e.clientX;
    lastY = e.clientY;
  }
  if (crayonActive) {
    moveCrayon(e.clientX, e.clientY);
  }
}

function handlePointerUp() {
  if (!crayonActive) return;
  isDrawing = false;
  pauseCrayonSound();
  checkCanvasColored();
  // console.log('Pointer up: drawing stopped.');
}

/*******************************
 *  Check How Much is Colored
 *******************************/
// Checks how much of the canvas has been colored with the crayon.
// Uses pixel skipping for performance and only counts pixels that exactly match the crayon's gray.
// When a poetic threshold is crossed, the portal emerges.
function checkCanvasColored() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let coloredPixels = 0;
  const totalPixels = canvas.width * canvas.height;

  // Skip some pixels for performance (tradeoff: less precision, much faster)
  const skipFactor = PIXEL_SKIP_FACTOR;
  for (let i = 0; i < imageData.length; i += 4 * skipFactor) {
    // Only count pixels that are exactly the crayon's gray (prevents false positives)
    if (
      imageData[i] === GRAY_COLOR &&
      imageData[i + 1] === GRAY_COLOR &&
      imageData[i + 2] === GRAY_COLOR
    ) {
      coloredPixels++;
    }
  }

  // Estimate colored area by scaling up skipped count
  const approxColored = coloredPixels * skipFactor;
  const coloredPercentage = (approxColored / totalPixels) * 100;
  // console.log(`Colored: ${coloredPercentage.toFixed(2)}%`);

  // If enough is colored, reveal the portal (poetic emergence)
  if (coloredPercentage >= PORTAL_REVEAL_THRESHOLD) {
    // Show portal and preview only once
    const portal = document.getElementById('portal');
    const preview = document.getElementById('portal-preview');
    const fullscreen = document.getElementById('portal-fullscreen');
    if (portal.classList.contains('hidden')) {
      portal.classList.remove('hidden');
      portal.classList.add('visible');
    }
    if (preview.classList.contains('hidden')) {
      preview.classList.remove('hidden');
      preview.classList.add('visible');
    }
    if (fullscreen.classList.contains('hidden')) {
      fullscreen.classList.remove('hidden');
      fullscreen.classList.add('visible');
    }
    // console.log('Portal displayed after drawing threshold.');
  }
}

/*******************************
 *  Show Mirror Link with Scaling
 *******************************/
function showMirrorLink() {
  // Rule of thirds intersection points (as percentages)
  const thirds = [33.33, 66.66];
  const positions = [
    { left: thirds[0], top: thirds[0] }, // (1/3, 1/3)
    { left: thirds[0], top: thirds[1] }, // (1/3, 2/3)
    { left: thirds[1], top: thirds[0] }, // (2/3, 1/3)
    { left: thirds[1], top: thirds[1] }  // (2/3, 2/3)
  ];
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

/*******************************
 *  Move Crayon (Cursor)
 *******************************/
function moveCrayon(x, y) {
  crayon.style.left = `${x - 15}px`;
  crayon.style.top = `${y - 50}px`;
}

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
const portalHum = new Audio(HUM_SOUND_FILE);
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
  const target = HUM_SOUND_VOLUME;
  const step = HUM_FADE_STEP;
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


// Portal interaction logic
const portal = document.getElementById('portal');
const preview = document.getElementById('portal-preview');
const fullscreen = document.getElementById('portal-fullscreen');
const closeBtn = document.getElementById('portal-close');

function showPreview() {
  preview.setAttribute('aria-hidden', 'false');
  preview.classList.add('active');
}
function hidePreview() {
  preview.setAttribute('aria-hidden', 'true');
  preview.classList.remove('active');
}
function showFullscreen() {
  fullscreen.setAttribute('aria-hidden', 'false');
  fullscreen.classList.add('active');
  closeBtn.focus();
  document.body.style.overflow = 'hidden';
}
function hideFullscreen() {
  fullscreen.setAttribute('aria-hidden', 'true');
  fullscreen.classList.remove('active');
  document.body.style.overflow = '';
  portal.focus();
}

portal.addEventListener('mouseenter', () => {
  portal.classList.add('blooming');
});
portal.addEventListener('focus', () => {
  portal.classList.add('blooming');
});
portal.addEventListener('mouseleave', () => {
  portal.classList.remove('blooming');
});
portal.addEventListener('blur', () => {
  portal.classList.remove('blooming');
});
portal.addEventListener('click', e => {
  portal.classList.remove('blooming');
  showFullscreen();
  fadeOutHum(); // Stop hum when entering fullscreen
});

// When closing fullscreen, hum resumes only on hover/focus
closeBtn.addEventListener('click', () => {
  hideFullscreen();
  // Hum will resume only if user hovers/focuses again
});
closeBtn.addEventListener('click', hideFullscreen);
fullscreen.addEventListener('keydown', e => {
  if (e.key === 'Escape') hideFullscreen();
});

// Trap focus in fullscreen
fullscreen.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    closeBtn.focus();
  }
});

// console.log('Script loaded.');
