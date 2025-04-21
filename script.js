/*******************************
 *  DOM References
 *******************************/
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const crayon = document.getElementById('crayon');
const mirrorLink = document.getElementById('mirror-link');
const mirrorDiv = document.getElementById('mirror');

// --- Grand Prix: Dust/Ash Particle Canvas ---
let dustCanvas, dustCtx, dustParticles = [];
function createDustCanvas() {
  if (dustCanvas) return;
  dustCanvas = document.createElement('canvas');
  dustCanvas.className = 'dust-canvas';
  mirrorDiv.appendChild(dustCanvas);
  dustCtx = dustCanvas.getContext('2d');
  resizeDustCanvas();
  for (let i = 0; i < 38; i++) {
    dustParticles.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.7 + Math.random() * 1.6,
      alpha: 0.11 + Math.random() * 0.16,
      dx: (Math.random() - 0.5) * 0.0007,
      dy: (Math.random() - 0.5) * 0.0007
    });
  }
  requestAnimationFrame(animateDust);
}
function resizeDustCanvas() {
  if (!dustCanvas) return;
  dustCanvas.width = mirrorDiv.offsetWidth;
  dustCanvas.height = mirrorDiv.offsetHeight;
}
function animateDust() {
  if (!dustCtx || !dustCanvas) return;
  dustCtx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);
  for (const p of dustParticles) {
    p.x += p.dx + (Math.random() - 0.5) * 0.0002;
    p.y += p.dy + (Math.random() - 0.5) * 0.0002;
    if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
    if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0;
    const cx = dustCanvas.width * p.x;
    const cy = dustCanvas.height * p.y;
    dustCtx.beginPath();
    dustCtx.arc(cx, cy, p.r, 0, 2 * Math.PI);
    dustCtx.fillStyle = `rgba(60,60,60,${p.alpha})`;
    dustCtx.fill();
  }
  requestAnimationFrame(animateDust);
}
window.addEventListener('resize', resizeDustCanvas);
createDustCanvas();

// --- Grand Prix: Dynamic, unique SVG mask for each portal emergence ---
function generateIrregularPortalMask() {
  // Portal: torn, ruptured, never blobby
  const cx = 200, cy = 200, rBase = 164, points = 28;
  let d = '';
  for (let i = 0; i < points; i++) {
    const angle = (2 * Math.PI * i) / points;
    // Sharper, torn effect: more variance, random spikes
    let r = rBase
      + Math.sin(i * 2.4) * 36
      + Math.cos(i * 1.3) * 22
      + (i % 2 === 0 ? Math.random() * 44 - 22 : Math.random() * 18 - 9)
      + (i % 5 === 0 ? Math.random() * 44 : 0)
      + (i % 7 === 0 ? Math.random() * 64 - 32 : 0);
    // Prevent any one point from being too close to center (avoid blobs)
    r = Math.max(r, rBase * 0.72);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
  }
  d += 'Z';
  // SVG: stronger turbulence, more analog rupture
  const svg = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"
><defs><filter id="turb"><feTurbulence type="turbulence" baseFrequency="0.09 0.21" numOctaves="3" seed="${Math.floor(Math.random()*1000)}" result="turb"/><feDisplacementMap in2="turb" in="SourceGraphic" scale="54" xChannelSelector="R" yChannelSelector="G"/></filter></defs><path d="${d}" fill="white" filter="url(#turb)"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function applyRandomPortalMask() {
  const url = generateIrregularPortalMask();
  const mirror = document.getElementById('mirror');
  mirror.style.webkitMaskImage = `url('${url}')`;
  mirror.style.maskImage = `url('${url}')`;
  // Also apply to ::before and ::after for analog shadow/gradient
  mirror.style.setProperty('--portal-mask-url', `url('${url}')`);
}

// Call this function whenever the portal emerges (e.g., threshold met)
window.applyRandomPortalMask = applyRandomPortalMask;

// Optionally, apply once on load for preview
window.addEventListener('DOMContentLoaded', applyRandomPortalMask);

// --- Portal progress-driven emergence (aesthetic, poetic) ---
// progress: 0 (closed) ... 1 (fully open)
// --- Animated Living Vortex Portal ---
(function() {
  const mirror = document.getElementById('mirror');
  let current = { scale: 0.13, opacity: 0.10, blur: 8 };
  let target = { scale: 0.13, opacity: 0.10, blur: 8 };
  let animating = false;
  let vortexAnimating = false;
  let vortexAngle = 0;
  let lastVortexTime = performance.now();
  let vortexWobble = 0;

  function animate() {
    let changed = false;
    for (const prop of ['scale','opacity','blur']) {
      const diff = target[prop] - current[prop];
      if (Math.abs(diff) > 0.002) {
        current[prop] += diff * 0.19;
        changed = true;
      } else {
        current[prop] = target[prop];
      }
    }
    // Blend with vortex rotation and analog wobble
    if (!vortexAnimating) startVortex();
    mirror.style.transform =
      `scale(${current.scale}) rotate(${vortexAngle + vortexWobble}deg)`;
    mirror.style.opacity = current.opacity;
    mirror.style.filter = `blur(${current.blur}px)`;
    if (changed) requestAnimationFrame(animate);
    else animating = false;
  }

  function startVortex() {
    vortexAnimating = true;
    function vortexFrame(now) {
      // Animate slow, analog vortex with subtle oscillation
      const elapsed = (now - lastVortexTime) / 1000;
      lastVortexTime = now;
      // Very slow rotation, 360deg in ~120s (2 minutes)
      vortexAngle += elapsed * 3;
      // Analog wobble: slow, irregular oscillation
      vortexWobble = Math.sin(now/1700) * 2.1 + Math.sin(now/3400) * 1.1 + Math.cos(now/2600) * 0.7;
      // Always update transform to keep portal alive
      mirror.style.transform =
        `scale(${current.scale}) rotate(${vortexAngle + vortexWobble}deg)`;
      requestAnimationFrame(vortexFrame);
    }
    requestAnimationFrame(vortexFrame);
  }

  window.setPortalProgress = function(progress) {
    // Clamp and ease
    const p = Math.max(0, Math.min(1, progress));
    const ease = p < 0.5 ? 2*p*p : -1+(4-2*p)*p;
    // Portal bounds
    const minScale = 0.13, maxScale = 1;
    const minOpacity = 0.10, maxOpacity = 1;
    const minBlur = 8, maxBlur = 2.5;
    target.scale = minScale + (maxScale - minScale) * ease;
    target.opacity = minOpacity + (maxOpacity - minOpacity) * ease;
    target.blur = minBlur + (maxBlur - minBlur) * ease;
    if (!animating) {
      animating = true;
      animate();
    }
  };
  // Start vortex on load for living effect (even before fully emerged)
  startVortex();
})();



/*******************************
 *  State Variables
 *******************************/
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let crayonActive = false;
let portalShown = false; // Track if portal has popped up this activation

// --- Palais de Tokyo: Fine Crayon Pattern ---
let texturedPattern = null;
function createAuthenticCrayonPattern() {
  const size = 32;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = size;
  offCanvas.height = size;
  const offCtx = offCanvas.getContext('2d');
  offCtx.clearRect(0, 0, size, size);

  // Pigment dots: varied gray, size, and opacity
  for (let i = 0; i < 65; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 0.9 + Math.random() * 1.8;
    // Use a range of grays for more depth
    const gray = 95 + Math.floor(Math.random() * 70); // 95–165
    const alpha = 0.22 + Math.random() * 0.18;
    offCtx.beginPath();
    offCtx.arc(x, y, radius, 0, 2 * Math.PI);
    offCtx.fillStyle = `rgba(${gray},${gray},${gray},${alpha})`;
    offCtx.fill();
  }
  // Irregular, expressive streaks
  for (let i = 0; i < 7; i++) {
    const x1 = Math.random() * size;
    const y1 = Math.random() * size;
    const x2 = x1 + (Math.random() - 0.5) * 12;
    const y2 = y1 + (Math.random() - 0.5) * 12;
    const gray = 85 + Math.floor(Math.random() * 90); // 85–175
    const alpha = 0.17 + Math.random() * 0.13;
    offCtx.strokeStyle = `rgba(${gray},${gray},${gray},${alpha})`;
    offCtx.lineWidth = 1.2 + Math.random() * 2.8;
    offCtx.beginPath();
    offCtx.moveTo(x1, y1);
    offCtx.lineTo(x2, y2);
    offCtx.stroke();
  }
  return ctx.createPattern(offCanvas, 'repeat');
}

function ensureCrayonPattern() {
  if (!texturedPattern) texturedPattern = createAuthenticCrayonPattern();
}
window.addEventListener('load', ensureCrayonPattern);
// Also ensure pattern is ready on crayon activation
function activateCrayon() {
  crayonActive = true;
  portalShown = false; // Reset portal state
  ensureCrayonPattern();
  
  // Hide the actual cursor, we'll use the crayon image element instead
  document.body.style.cursor = 'none';
  canvas.style.cursor = 'none';
  
  // Show the crayon element as a physical tool
  crayon.style.display = 'block';
  crayon.style.position = 'fixed';
  crayon.style.pointerEvents = 'none'; // Prevent blocking interactions
  crayon.style.zIndex = 1000; // Keep above other elements
  
  console.log('Crayon activated.');
}





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
  portalShown = false; // Reset portal state
  
  // Hide the actual cursor, we'll use the crayon image element instead
  document.body.style.cursor = 'none';
  canvas.style.cursor = 'none';
  
  // Make sure crayon is visible and following the cursor
  crayon.style.display = 'block';
  
  console.log('Crayon activated.');
}

/*******************************
 *  Draw Helper
 *******************************/
// --- Grand Prix Level: Dynamic Wiggle ---
let lastDrawTimestamp = Date.now();
let lastDrawSeed = Math.random() * 10000;

function drawLine(x, y, fromX, fromY) {
  ensureCrayonPattern();

  // Calculate speed (pixels per millisecond)
  const now = Date.now();
  const dx = x - fromX;
  const dy = y - fromY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const dt = now - lastDrawTimestamp || 1;
  const speed = distance / dt; // pixels/ms

  // Map speed to wiggle amplitude (tunable)
  // Slow: 0.5px, Fast: up to 3px
  const minWiggle = 0.5;
  const maxWiggle = 3.0;
  const speedClamp = Math.min(speed, 2.5); // Clamp for wild gestures
  const wiggle = minWiggle + (maxWiggle - minWiggle) * (speedClamp / 2.5);

  // Unique per-stroke seed for subtle individuality
  if (dt > 100) lastDrawSeed = Math.random() * 10000; // New seed if pause between segments
  function seededJitter(val) {
    // Simple pseudo-random with seed
    return (
      Math.sin(val * 12.9898 + lastDrawSeed) * 43758.5453 -
      Math.floor(Math.sin(val * 12.9898 + lastDrawSeed) * 43758.5453)
    );
  }

  // Apply jitter
  const jitterX = x + (seededJitter(x + now) - 0.5) * 2 * wiggle;
  const jitterY = y + (seededJitter(y + now) - 0.5) * 2 * wiggle;

  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = texturedPattern || '#888888';

  // Slight imperfection in width for humanistic quality
  const width = 15 + (Math.random() * 3 - 1.5);
  ctx.lineWidth = width;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(jitterX, jitterY);
  ctx.stroke();

  lastDrawTimestamp = now;
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
  // Move the crayon element to follow the pointer
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
  // --- Cannes Grand Prix Level: Portal Emergence Threshold ---
  // 1. Pixel threshold: at least 0.5% of canvas colored
  // 2. Spread threshold: marks in at least 3 distinct regions of a 3x3 grid

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let coloredPixels = 0;

  // Track which grid cells have been marked
  const gridRows = 3;
  const gridCols = 3;
  const gridTouched = new Array(gridRows * gridCols).fill(false);

  for (let i = 0; i < imageData.length; i += 4) {
    // Check if pixel is colored (not white/transparent)
    if (imageData[i + 3] > 10) { // Alpha > 10 (not transparent)
      coloredPixels++;

      // Track which grid cell this pixel belongs to
      const pixelIndex = i / 4;
      const x = pixelIndex % canvas.width;
      const y = Math.floor(pixelIndex / canvas.width);

      // Calculate grid cell
      const gridCol = Math.floor(x / (canvas.width / gridCols));
      const gridRow = Math.floor(y / (canvas.height / gridRows));
      const gridIndex = gridRow * gridCols + gridCol;

      if (gridIndex >= 0 && gridIndex < gridTouched.length) {
        gridTouched[gridIndex] = true;
      }
    }
  }

  const coloredPercentage = (coloredPixels / (canvas.width * canvas.height)) * 100;
  const spreadCount = gridTouched.filter(Boolean).length;
  
  // --- Palais de Tokyo: Portal grows in direct response to user input ---
  // Calculate progress as a combination of colored percentage and spread
  // Threshold: 0.5% colored and 3 grid zones
  const colorProgress = Math.min(1, coloredPercentage / 0.5);
  const spreadProgress = Math.min(1, spreadCount / 3);
  // Combined progress (weighted toward the lesser value for poetic tension)
  const combinedProgress = Math.min(colorProgress, spreadProgress) * 0.7 + 
                          Math.max(colorProgress, spreadProgress) * 0.3;
  
  // Update portal scale/opacity based on drawing progress
  setPortalProgress(combinedProgress);
  
  console.log(`Colored: ${coloredPercentage.toFixed(2)}% | Spread: ${spreadCount} grid zones | Portal: ${(combinedProgress*100).toFixed(0)}%`);

  // Portal fully emerges only if both thresholds are met
  if (coloredPercentage >= 0.5 && spreadCount >= 3) {
    showMirrorLink();
    console.log('Mirror displayed: threshold met (authorship + spread).');
  }
}

/*******************************
 *  Show Mirror Link with Scaling
 *******************************/
function showMirrorLink() {
  if (portalShown) return; // Only show once per activation
  
  // --- Palais de Tokyo: Portal Placement ---
  // Rule of thirds intersection points (as percentages)
  const thirds = [33.33, 66.66];
  const intersections = [
    { left: thirds[0], top: thirds[0] }, // (1/3, 1/3)
    { left: thirds[0], top: thirds[1] }, // (1/3, 2/3)
    { left: thirds[1], top: thirds[0] }, // (2/3, 1/3)
    { left: thirds[1], top: thirds[1] }, // (2/3, 2/3)
  ];

  // Helper function for random position within an ellipse
  function randomInEllipse(center, radiusX, radiusY) {
    const angle = Math.random() * 2 * Math.PI;
    const r = Math.sqrt(Math.random()); // Square root for uniform distribution
    return {
      left: center.left + r * radiusX * Math.cos(angle),
      top: center.top + r * radiusY * Math.sin(angle)
    };
  }

  // Choose a random rule-of-thirds intersection
  const intersection = intersections[Math.floor(Math.random() * intersections.length)];
  
  // Place portal within an elliptical area around the intersection
  const ellipseRadiusX = 13; // percent
  const ellipseRadiusY = 13; // percent
  const pos = randomInEllipse(intersection, ellipseRadiusX, ellipseRadiusY);

  mirrorLink.style.left = `${pos.left}%`;
  mirrorLink.style.top = `${pos.top}%`;

  // Generate a new mask when threshold is reached
  applyRandomPortalMask();
  
  // Set portal to fully open
  setPortalProgress(1.0);
  
  // Add the 'active' class to make it clickable
  mirrorLink.classList.add('active');
  
  // Mark portal as shown
  portalShown = true;
  
  // Enable pointer events
  mirrorLink.style.pointerEvents = 'auto';
}


/*******************************
 *  Move Crayon with Cursor
 *******************************/
function moveCrayon(x, y) {
  // Position crayon so its tip aligns with cursor position for authentic drawing
  crayon.style.position = 'fixed'; // Use fixed to follow cursor precisely
  
  // Position with slight offset to align the tip with the cursor
  crayon.style.left = `${x}px`;
  crayon.style.top = `${y - 15}px`; // Offset for drawing tip alignment
  
  // Add subtle tilt based on movement to enhance the physical tool feeling
  if (lastX && lastY) {
    const deltaX = x - lastX;
    // Slight tilt angle based on horizontal movement (5 degrees max)
    const tiltAngle = Math.min(Math.max(deltaX * 0.2, -5), 5);
    crayon.style.transform = `translate(-50%, -50%) rotate(${tiltAngle}deg) scale(0.5)`;
  }
  
  // Prevent crayon from blocking interactions with canvas
  crayon.style.pointerEvents = 'none';
  
  // Make sure crayon is above other elements
  crayon.style.zIndex = 1000;
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

console.log('Script loaded.');
