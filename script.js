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
// Palais de Tokyo: Living Vortex Portal — Multi-layered, dimensional mask
function generateIrregularPortalMask(timePhase = 0) {
  // Parameters for poetic, sculpted depth
  const cx = 200, cy = 200, points = 40;
  const contourLayers = [
    { r: 160, amp: 18, freq: 1.07, phase: 0,   opacity: 0.18, blur: 7 },   // outermost
    { r: 144, amp: 13, freq: 1.18, phase: 0.9, opacity: 0.23, blur: 4 },   // mid-outer
    { r: 128, amp: 9,  freq: 1.32, phase: 1.7, opacity: 0.28, blur: 2 },   // mid-inner
    { r: 110, amp: 6,  freq: 1.55, phase: 2.6, opacity: 0.33, blur: 0 }    // innermost
  ];
  // Animate all phases for living effect
  const phaseBase = timePhase * 0.00017;
  // SVG header & defs
  let svg = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="portalDepth" cx="50%" cy="50%" r="1.0">
      <stop offset="0%" stop-color="#888" stop-opacity="0.80"/>
      <stop offset="65%" stop-color="#444" stop-opacity="0.48"/>
      <stop offset="100%" stop-color="#222" stop-opacity="0.07"/>
    </radialGradient>
    <filter id="softBlur" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
  </defs>
  <g>
    <ellipse cx="200" cy="200" rx="196" ry="196" fill="url(#portalDepth)" filter="url(#softBlur)" opacity="0.6"/>
`;
  // Generate undulating contours from outside in
  for (let layer = 0; layer < contourLayers.length; layer++) {
    const { r, amp, freq, phase, opacity, blur } = contourLayers[layer];
    let d = '';
    for (let i = 0; i < points; i++) {
      const angle = (2 * Math.PI * i) / points;
      // Each layer's undulation is offset in phase and frequency
      const undulation = Math.sin(i * freq + phaseBase + phase) * amp
        + Math.cos(i * freq * 0.7 + phaseBase * 0.8 + phase * 1.2) * (amp * 0.4)
        + Math.sin(phaseBase * 0.7 + i * 0.19 + layer) * (amp * 0.13);
      const rr = r + undulation;
      const x = cx + Math.cos(angle) * rr;
      const y = cy + Math.sin(angle) * rr;
      d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
    }
    d += 'Z';
    svg += `<path d="${d}" fill="white" opacity="${opacity}" ${blur ? `filter="url(#softBlur)"` : ''}/>`;
  }
  svg += '</g></svg>';
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
// (All other portal and mask logic remains unchanged)



function applyRandomPortalMask(timePhase = 0) {
  const url = generateIrregularPortalMask(timePhase);
  const mirror = document.getElementById('mirror');
  mirror.style.webkitMaskImage = `url('${url}')`;
  mirror.style.maskImage = `url('${url}')`;
  mirror.style.setProperty('--portal-mask-url', `url('${url}')`);
}

// Animate mask edge only when portal is visible
let maskUpdateIntervalId = null; // Use Interval ID

function startMaskEdgeAnimation() {
  // Ensure previous interval is cleared if somehow called again
  if (maskUpdateIntervalId) clearInterval(maskUpdateIntervalId);

  // Apply mask immediately when starting
  if (mirrorLink.classList.contains('active')) {
    applyRandomPortalMask(Date.now());
  }

  // Update mask periodically (e.g., every 1 second) for a 'living' effect
  maskUpdateIntervalId = setInterval(() => {
    // Only update if portal is still visible
    if (mirrorLink.classList.contains('active')) {
      applyRandomPortalMask(Date.now());
    } else {
      // If portal became hidden, stop the interval
      stopMaskEdgeAnimation(); 
    }
  }, 1000); // Update every 1000ms (1 second)
}

// Ensure animation stops when portal is hidden
function stopMaskEdgeAnimation() {
  if (maskUpdateIntervalId) {
    clearInterval(maskUpdateIntervalId);
    maskUpdateIntervalId = null;
  }
}


// Call this function whenever the portal emerges (e.g., threshold met)
window.applyRandomPortalMask = applyRandomPortalMask;

// Optionally, apply once on load for preview
// window.addEventListener('DOMContentLoaded', applyRandomPortalMask);

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
      // vortexWobble = Math.sin(now/1700) * 2.1 + Math.sin(now/3400) * 1.1 + Math.cos(now/2600) * 0.7;
      // Simpler, slower wobble for smoother effect
      vortexWobble = Math.sin(now / 4000) * 1.5; // Slower oscillation (4 seconds period), smaller amplitude (1.5 degrees)

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

// --- Fundamental: Track active drawing inputs for robust sound alignment ---
let activeDrawInputs = 0; // Number of active touches/pointers
function incrementDrawInputs() {
  activeDrawInputs++;
  if (activeDrawInputs === 1) playCrayonSound();
}
function decrementDrawInputs() {
  if (activeDrawInputs > 0) activeDrawInputs--;
  if (activeDrawInputs === 0) pauseCrayonSound();
}

function createAuthenticCrayonPattern() {
  // Palais de Tokyo: Material density and poetic grayscale rigor
  const size = 32;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = size;
  offCanvas.height = size;
  const offCtx = offCanvas.getContext('2d');
  offCtx.clearRect(0, 0, size, size);

  // Intensify pigment density for a more materially rich, less digital texture
  for (let i = 0; i < 170; i++) { // Increased from 65 for greater fill
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 0.8 + Math.random() * 2.2;
    // Poetic grayscale: subtle matte range
    const gray = 80 + Math.floor(Math.random() * 85); // 80–165
    const alpha = 0.18 + Math.random() * 0.20;
    offCtx.beginPath();
    offCtx.arc(x, y, radius, 0, 2 * Math.PI);
    offCtx.fillStyle = `rgba(${gray},${gray},${gray},${alpha})`;
    offCtx.fill();
  }
  // More streaks, with analog variation
  for (let i = 0; i < 16; i++) { // Increased from 7 for more layering
    const x1 = Math.random() * size;
    const y1 = Math.random() * size;
    const x2 = x1 + (Math.random() - 0.5) * 14;
    const y2 = y1 + (Math.random() - 0.5) * 14;
    const gray = 75 + Math.floor(Math.random() * 95); // 75–170
    const alpha = 0.13 + Math.random() * 0.16;
    offCtx.strokeStyle = `rgba(${gray},${gray},${gray},${alpha})`;
    offCtx.lineWidth = 1.0 + Math.random() * 3.2;
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
const crayonSound = new Audio('assets/11L-1_singular_slow_cray-1745020327208.mp3');
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

  // Palais de Tokyo: Enable pigment accumulation—each gesture deepens presence
  ctx.save();
  ctx.globalCompositeOperation = 'multiply'; // Layer pigment for analog buildup
  ctx.strokeStyle = texturedPattern || '#888888';

  // Slight imperfection in width for humanistic quality
  const width = 15 + (Math.random() * 3 - 1.5);
  ctx.lineWidth = width;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(jitterX, jitterY);
  ctx.stroke();
  ctx.restore();

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
  incrementDrawInputs();
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
  decrementDrawInputs();
  checkCanvasColored();
  console.log('Pointer up: drawing stopped.');
}

/*******************************
 *  Check How Much is Colored
 *******************************/
function checkCanvasColored() {
  // --- Palais de Tokyo Level: Portal Emergence Threshold ---
  // 1. Pixel threshold: at least 1.37% of canvas colored (more demanding creative engagement)
  // 2. Spread threshold: marks in at least 3 distinct regions of a 3x3 grid

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let coloredPixels = 0;

  // Track which grid cells have been marked
  const gridRows = 3;
  const gridCols = 3;
  const gridTouched = new Array(gridRows * gridCols).fill(false);

  // Palais de Tokyo: Use visual difference from white, not just alpha, for poetic rigor
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];
    // Luminance difference from white (perceptual):
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const diffFromWhite = 255 - luminance;
    // Count as colored if alpha > 10 OR pixel is not almost white
    if (a > 10 && diffFromWhite > 8) {
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
  // Debug: log gridTouched array for curatorial tuning
  console.log('Grid zones touched:', gridTouched.map((v,i)=>v?i:null).filter(v=>v!==null));
  console.log('Colored pixels:', coloredPixels, 'of', canvas.width * canvas.height, '| Percentage:', ((coloredPixels / (canvas.width * canvas.height))*100).toFixed(2));

  const coloredPercentage = (coloredPixels / (canvas.width * canvas.height)) * 100;
  const spreadCount = gridTouched.filter(Boolean).length;
  
  // --- Palais de Tokyo: Portal grows in direct response to user input ---
  // Calculate progress as a combination of colored percentage and spread
  // Threshold: 1.37% colored and 3 grid zones
  const colorProgress = Math.min(1, coloredPercentage / 1.37);
  const spreadProgress = Math.min(1, spreadCount / 3);
  // Combined progress (weighted toward the lesser value for poetic tension)
  const combinedProgress = Math.min(colorProgress, spreadProgress) * 0.7 + 
                          Math.max(colorProgress, spreadProgress) * 0.3;
  
  // Update portal scale/opacity based on drawing progress
  setPortalProgress(combinedProgress);
  
  console.log(`Colored: ${coloredPercentage.toFixed(2)}% | Spread: ${spreadCount} grid zones | Portal: ${(combinedProgress*100).toFixed(0)}%`);

  // Portal fully emerges only if both thresholds are met
  if (coloredPercentage >= 1.37 && spreadCount >= 3) {
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
  applyRandomPortalMask(Date.now());
  startMaskEdgeAnimation();
  
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
  // Position crayon so its tip aligns with cursor/touch for authentic drawing
  crayon.style.position = 'fixed';
  crayon.style.left = `${x}px`;
  crayon.style.top = `${y - 15}px`; // Offset for drawing tip alignment

  // Add subtle tilt based on movement to enhance the physical tool feeling
  if (lastX && lastY) {
    const deltaX = x - lastX;
    // Slight tilt angle based on horizontal movement (5 degrees max)
    const tiltAngle = Math.min(Math.max(deltaX * 0.2, -5), 5);
    // Slightly increase scale on mobile for clarity
    const isMobile = window.matchMedia && window.matchMedia('(max-width: 600px)').matches;
    const scale = isMobile ? 0.8 : 0.5;
    crayon.style.transform = `translate(-50%, -50%) rotate(${tiltAngle}deg) scale(${scale})`;
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

// --- Mobile Safari: Touch event support for coloring & crayon ---
// --- Palais de Tokyo: Unified Touch Handling for Crayon ---
canvas.addEventListener('touchstart', function(e) {
  // Use the first touch as the primary drawing point
  if (e.touches.length > 0) {
    const t = e.touches[0];
    // Update lastX/lastY for crayon alignment
    lastX = t.clientX;
    lastY = t.clientY;
    handlePointerDown({ clientX: t.clientX, clientY: t.clientY, isTouch: true });
    // Move the crayon visually to the touch point
    moveCrayon(t.clientX, t.clientY);
  }
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchmove', function(e) {
  // Use the first active touch for crayon and drawing
  if (e.touches.length > 0) {
    const t = e.touches[0];
    // Draw and move crayon with the finger
    if (isDrawing) {
      drawLine(t.clientX, t.clientY, lastX, lastY);
      lastX = t.clientX;
      lastY = t.clientY;
    }
    moveCrayon(t.clientX, t.clientY);
    e.preventDefault();
  }
}, { passive: false });
canvas.addEventListener('touchend', function(e) {
  // For each ended touch, decrement
  for (let i = 0; i < e.changedTouches.length; i++) {
    handlePointerUp({ isTouch: true });
  }
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchcancel', function(e) {
  // For each cancelled touch, decrement
  for (let i = 0; i < e.changedTouches.length; i++) {
    handlePointerUp({ isTouch: true });
  }
  e.preventDefault();
}, { passive: false });

// Prevent scrolling/zooming when drawing on canvas
canvas.addEventListener('gesturestart', e => e.preventDefault());
canvas.addEventListener('gesturechange', e => e.preventDefault());
canvas.addEventListener('gestureend', e => e.preventDefault());
// Also pause sound if window loses focus or pointer leaves canvas
window.addEventListener('blur', () => { activeDrawInputs = 0; pauseCrayonSound(); });
canvas.addEventListener('pointerleave', () => { activeDrawInputs = 0; pauseCrayonSound(); });

/*******************************
 *  Portal Ambient Hum
 *******************************/
const portalHum = new Audio('assets/low hum.mp3');
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

// Dimensional parallax effect for hologram preview
const mirrorIframe = document.getElementById('mirror-iframe');
let parallaxActive = false;

// --- Removed all dynamic transform/parallax logic for mirror-iframe ---
// Billboard hologram is now always perfectly centered via CSS only.
// Only show/hide logic remains.

console.log('Script loaded.');
