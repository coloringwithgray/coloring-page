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
  console.log('Crayon activated.');
}

/*******************************
 *  Draw Helper
 *******************************/
function drawLine(x, y, fromX, fromY) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'gray';
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
  crayon.style.display = 'block';
  moveCrayon(e.clientX, e.clientY);
  playCrayonSound();
  // Make portal emerge on first draw
  if (!window.portalEmerged) {
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
    window.portalEmerged = true;
    console.log('Portal emerged on first draw.');
  }
  console.log('Pointer down: drawing started.');
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
    // Check if pixel is "gray" (128,128,128)
    if (
      imageData[i] === 128 &&
      imageData[i + 1] === 128 &&
      imageData[i + 2] === 128
    ) {
      coloredPixels++;
    }
  }

  const approxColored = coloredPixels * skipFactor;
  const coloredPercentage = (approxColored / totalPixels) * 100;
  console.log(`Colored: ${coloredPercentage.toFixed(2)}%`);

  // Portal emergence now handled on first draw; threshold logic removed.
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

console.log('Script loaded.');
