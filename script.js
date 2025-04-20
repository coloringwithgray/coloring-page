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
  // Center crayon on load
  function centerCrayon() {
    crayon.style.left = '50%';
    crayon.style.top = '50%';
    crayon.style.transform = 'translate(-50%, -50%)';
  }
  centerCrayon();
  window.addEventListener('resize', centerCrayon);

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
    crayonSound.volume = 0;
    crayonSound.play().then(() => {
      // Fade in
      let v = 0;
      const target = CRAYON_SOUND_VOLUME;
      const step = 0.04;
      function up() {
        if (v < target) {
          v = Math.min(target, v + step);
          crayonSound.volume = v;
          requestAnimationFrame(up);
        } else {
          crayonSound.volume = target;
        }
      }
      up();
    }).catch((err) => {
      // Autoplay restriction or other error
      console.warn('Crayon sound error:', err);
    });
  }
}

function pauseCrayonSound() {
  if (!crayonSound.paused) {
    // Fade out
    let v = crayonSound.volume;
    const step = 0.04;
    function down() {
      if (v > 0) {
        v = Math.max(0, v - step);
        crayonSound.volume = v;
        requestAnimationFrame(down);
      } else {
        crayonSound.pause();
        crayonSound.currentTime = 0;
        crayonSound.volume = CRAYON_SOUND_VOLUME; // reset for next time
      }
    }
    down();
  }
}

/*******************************
 *  Initialize Canvas
 *******************************/
function initializeCanvas() {
  // Save current drawing
  let dataUrl = null;
  if (canvas.width > 0 && canvas.height > 0) {
    dataUrl = canvas.toDataURL();
  }
  // Resize canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Restore drawing if available
  if (dataUrl) {
    const img = new window.Image();
    img.onload = function() {
      // Center the restored image if aspect ratio changed
      const x = (canvas.width - img.width) / 2;
      const y = (canvas.height - img.height) / 2;
      ctx.drawImage(img, x, y);
    };
    img.src = dataUrl;
  }
  // console.log('Canvas initialized.');
}

window.addEventListener('resize', initializeCanvas);
initializeCanvas();

/*******************************
 *  Activate Crayon
 *******************************/
function activateCrayon(e) {
  crayonActive = true;
  document.body.classList.add('hide-cursor');
  // Move crayon to pointer position if available, else keep at center
  if (e && e.clientX && e.clientY) {
    moveCrayon(e.clientX, e.clientY);
  } else {
    moveCrayon(window.innerWidth / 2, window.innerHeight / 2);
  }
  crayon.style.display = 'block';
  crayon.classList.add('crayon-activated');
  // Remove tab focus outline after activation
  crayon.blur && crayon.blur();
}


/*******************************
 *  Draw Helper
 *******************************/
function drawLine(x, y, fromX, fromY) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = DRAW_COLOR;
  ctx.lineWidth = DRAW_LINE_WIDTH;
  ctx.lineCap = 'round';
  // Simulate crayon texture with alpha noise
  const steps = Math.max(2, Math.ceil(Math.hypot(x - fromX, y - fromY) / 2));
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const px = fromX + (x - fromX) * t + (Math.random() - 0.5) * 1.2; // jitter
    const py = fromY + (y - fromY) * t + (Math.random() - 0.5) * 1.2;
    ctx.globalAlpha = 0.7 + (Math.random() - 0.5) * 0.15; // subtle alpha noise
    ctx.beginPath();
    ctx.arc(px, py, DRAW_LINE_WIDTH / 2, 0, Math.PI * 2);
    ctx.fillStyle = DRAW_COLOR;
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
  ctx.restore();
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
  crayon.classList.remove('crayon-activated');
  // Do NOT hide or remove crayon; keep it visible as custom cursor
  // console.log('Pointer up: drawing stopped.');
}

/*******************************
 *  Check How Much is Colored
 *******************************/
// Checks how much of the canvas has been colored with the crayon.
// Uses pixel skipping for performance and only counts pixels that exactly match the crayon's gray.
// When a poetic threshold is crossed, the portal emerges.
function isGray(r, g, b, tolerance = 10) {
  return (
    Math.abs(r - GRAY_COLOR) <= tolerance &&
    Math.abs(g - GRAY_COLOR) <= tolerance &&
    Math.abs(b - GRAY_COLOR) <= tolerance
  );
}

function updateProgressIndicator(percent) {
  const indicator = document.getElementById('progress-indicator');
  const bar = indicator.querySelector('.progress-bar');
  const text = indicator.querySelector('.progress-text');
  // Circumference of the circle
  const r = 24;
  const circumference = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(100, percent));
  const dash = (progress / 100) * circumference;
  bar.setAttribute('stroke-dasharray', `${dash} ${circumference - dash}`);
  text.textContent = `${Math.round(progress)}%`;
  indicator.setAttribute('aria-hidden', progress >= 100 ? 'true' : 'false');
  indicator.style.opacity = progress >= 100 ? '0' : '1';
}

function checkCanvasColored() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let coloredPixels = 0;
  const totalPixels = canvas.width * canvas.height;

  // Skip some pixels for performance (tradeoff: less precision, much faster)
  const skipFactor = PIXEL_SKIP_FACTOR;
  for (let i = 0; i < imageData.length; i += 4 * skipFactor) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    if (isGray(r, g, b)) {
      coloredPixels++;
    }
  }

  const percentColored = (coloredPixels * skipFactor) / totalPixels * 100;
  updateProgressIndicator(percentColored);
  // Reveal portal if threshold crossed
  if (percentColored >= PORTAL_REVEAL_THRESHOLD) {
    showMirrorLink();
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
let portalRevealed = false;

function showMirrorLink() {
  if (portalRevealed) return;
  portalRevealed = true;

  // Robust DOM references
  const mirrorLink = document.getElementById('portal');
  const mirrorDiv = document.getElementById('portal-preview');
  const liveRegion = document.getElementById('portal-announcement');

  // Rule of thirds intersection points (as percentages)
  const thirds = [33.33, 66.66];
  const positions = [
    { left: thirds[0], top: thirds[0] }, // (1/3, 1/3)
    { left: thirds[0], top: thirds[1] }, // (1/3, 2/3)
    { left: thirds[1], top: thirds[0] }, // (2/3, 1/3)
    { left: thirds[1], top: thirds[1] }  // (2/3, 2/3)
  ];
  const chosen = positions[Math.floor(Math.random() * positions.length)];
  if (mirrorLink) {
    mirrorLink.style.left = `${chosen.left}%`;
    mirrorLink.style.top = `${chosen.top}%`;
    mirrorLink.classList.add('active');
    mirrorLink.style.pointerEvents = 'auto';
  }
  if (mirrorDiv) {
    mirrorDiv.classList.add('mirror-glow');
  }
  // Accessibility: announce portal emergence
  if (liveRegion) {
    liveRegion.textContent = 'The portal has appeared.';
  }
}

/*******************************
 *  Move Crayon (Cursor)
 *******************************/
function moveCrayon(x, y) {
  // Keep crayon centered on pointer
  crayon.style.left = `${x - crayon.offsetWidth / 2}px`;
  crayon.style.top = `${y - crayon.offsetHeight / 2}px`;
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
  if (!preview) return;
  preview.setAttribute('aria-hidden', 'false');
  preview.classList.add('active');
}
function hidePreview() {
  if (!preview) return;
  preview.setAttribute('aria-hidden', 'true');
  preview.classList.remove('active');
}
function showFullscreen() {
  if (!fullscreen || !closeBtn) return;
  fullscreen.setAttribute('aria-hidden', 'false');
  fullscreen.classList.add('active');
  closeBtn.focus();
  document.body.style.overflow = 'hidden';
  // Trap focus in fullscreen
  fullscreen.setAttribute('tabindex', '0');
}
function hideFullscreen() {
  if (!fullscreen || !portal) return;
  fullscreen.setAttribute('aria-hidden', 'true');
  fullscreen.classList.remove('active');
  document.body.style.overflow = '';
  portal.focus();
}

if (portal) {
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
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    hideFullscreen();
    // Hum will resume only if user hovers/focuses again
  });
  closeBtn.addEventListener('click', hideFullscreen);
}

if (fullscreen) {
  fullscreen.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideFullscreen();
    // Trap focus in fullscreen
    if (e.key === 'Tab') {
      e.preventDefault();
      if (closeBtn) closeBtn.focus();
    }
  });
}


// console.log('Script loaded.');
