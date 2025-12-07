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
  // Adaptive particle count based on performance
  const particleCount = performanceLevel === 'low' ? 8 : 
                       performanceLevel === 'medium' ? 12 : 18;
  
  for (let i = 0; i < particleCount; i++) {
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
let dustFrameCount = 0;
function animateDust() {
  if (!dustCtx || !dustCanvas) return;
  
  // Adaptive frame rate based on performance
  dustFrameCount++;
  const skipFrames = performanceLevel === 'low' ? 4 : 
                    performanceLevel === 'medium' ? 3 : 2;
  
  if (dustFrameCount % skipFrames !== 0) {
    requestAnimationFrame(animateDust);
    return;
  }
  
  checkPerformance(); // Monitor performance during animation
  
  // Check if tab is visible - pause when not visible
  if (document.hidden) {
    requestAnimationFrame(animateDust);
    return;
  }
  
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
// Don't create dust canvas until portal appears - performance optimization
// createDustCanvas();

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

  // Update mask less frequently for better performance (every 6 seconds for Intel MacBook compatibility)
  maskUpdateIntervalId = setInterval(() => {
    // Interval check: If portal is NOT active, stop the interval.
    // This handles cases where hideMirrorLink might not have been called.
    if (!mirrorLink.classList.contains('active')) {
        stopMaskEdgeAnimation();
    } else {
      // Only regenerate mask occasionally to reduce CPU load
      // Skip if tab is hidden to save CPU
      if (!document.hidden) {
        applyRandomPortalMask(Date.now());
      }
    }
  }, 6000); // Further reduced frequency: 6s for Intel MacBook performance
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
// Global variables for portal animations
let vortexAnimating = false;
let startVortex;

(function() {
  const mirror = document.getElementById('mirror');
  let current = { scale: 0.13, opacity: 0.10, blur: 8 };
  let target = { scale: 0.13, opacity: 0.10, blur: 8 };
  let animating = false;
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

  startVortex = function() {
    vortexAnimating = true;
    function vortexFrame(now) {
      // Skip animation if tab is hidden to save CPU
      if (document.hidden) {
        if (mirrorLink.classList.contains('active')) {
          requestAnimationFrame(vortexFrame);
        } else {
          vortexAnimating = false;
        }
        return;
      }
      
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
      
      // Only continue animation if portal is actually active
      if (mirrorLink.classList.contains('active')) {
        requestAnimationFrame(vortexFrame);
      } else {
        vortexAnimating = false;
      }
    }
    requestAnimationFrame(vortexFrame);
  };

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
  // Don't start vortex until needed - major performance optimization
  // startVortex();
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

// Palais de Tokyo: Sequential emergence of icons after portal activation
const igIcon = document.getElementById('ig-icon');
const mailIcon = document.getElementById('mail-icon');
const photoIcon = document.getElementById('photo-icon');
const igLink = document.getElementById('ig-link');
const mailLink = document.getElementById('mail-link');
const photoLink = document.getElementById('photo-link');

// Store timers for sequential appearance
let iconTimers = [];

function syncIconsWithPortal() {
  console.log('Portal state changed - active:', mirrorLink.classList.contains('active'));
  console.log('Icon elements found:', {
    igIcon: !!igIcon,
    photoIcon: !!photoIcon,
    mailIcon: !!mailIcon,
    igLink: !!igLink,
    photoLink: !!photoLink,
    mailLink: !!mailLink
  });

  // Clear any existing timers
  iconTimers.forEach(timer => clearTimeout(timer));
  iconTimers = [];

  // If portal is active, show icons sequentially
  if (mirrorLink.classList.contains('active')) {
    console.log('Portal is active - scheduling icon appearance');

    // Instagram appears first after 750ms
    iconTimers.push(setTimeout(() => {
      console.log('Showing Instagram icon NOW');
      if (igIcon) {
        igIcon.style.opacity = '1';
        igIcon.style.transform = 'translateY(0)';
        igIcon.style.pointerEvents = 'auto';
      }
      if (igLink) {
        igLink.style.opacity = '1';
        igLink.style.pointerEvents = 'auto';
      }
    }, 750));

    // Photo icon appears second after 1125ms
    iconTimers.push(setTimeout(() => {
      console.log('Showing Photo icon NOW');
      if (photoIcon) {
        photoIcon.style.opacity = '1';
        photoIcon.style.transform = 'translateY(0)';
        photoIcon.style.pointerEvents = 'auto';
      }
      if (photoLink) {
        photoLink.style.opacity = '1';
        photoLink.style.pointerEvents = 'auto';
      }
    }, 1125));

    // Mail icon appears last after 1500ms
    iconTimers.push(setTimeout(() => {
      console.log('Showing Mail icon NOW');
      if (mailIcon) {
        mailIcon.style.opacity = '1';
        mailIcon.style.transform = 'translateY(0)';
        mailIcon.style.pointerEvents = 'auto';
      }
      if (mailLink) {
        mailLink.style.opacity = '1';
        mailLink.style.pointerEvents = 'auto';
      }
    }, 1500));
  } else {
    console.log('Portal inactive - hiding icons');
    // Immediately hide all icons when portal is inactive
    if (igIcon) {
      igIcon.style.opacity = '0';
      igIcon.style.transform = 'translateY(15px)';
      igIcon.style.pointerEvents = 'none';
    }
    if (photoIcon) {
      photoIcon.style.opacity = '0';
      photoIcon.style.transform = 'translateY(15px)';
      photoIcon.style.pointerEvents = 'none';
    }
    if (mailIcon) {
      mailIcon.style.opacity = '0';
      mailIcon.style.transform = 'translateY(15px)';
      mailIcon.style.pointerEvents = 'none';
    }
    if (igLink) igLink.style.opacity = '0';
    if (photoLink) photoLink.style.opacity = '0';
    if (mailLink) mailLink.style.opacity = '0';
  }
}
// Observe class changes on #mirror-link for conceptual restraint
const observer = new MutationObserver(syncIconsWithPortal);
observer.observe(mirrorLink, { attributes: true, attributeFilter: ['class'] });
// Initial sync
syncIconsWithPortal();

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
  // Palais de Tokyo: Material density and poetic grayscale rigor (refined)
  const size = 32;
  const offCanvas = document.createElement('canvas');
  offCanvas.width = size;
  offCanvas.height = size;
  const offCtx = offCanvas.getContext('2d');
  offCtx.clearRect(0, 0, size, size);

  // Intensified pigment density for fuller, analog texture
  for (let i = 0; i < 260; i++) { // More dots for richer fill
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 0.7 + Math.random() * 1.8;
    // Lighter, poetic matte gray (never black)
    const gray = 145 + Math.floor(Math.random() * 65); // 145–210
    const alpha = 0.18 + Math.random() * 0.19; // More presence, still soft
    offCtx.beginPath();
    offCtx.arc(x, y, radius, 0, 2 * Math.PI);
    offCtx.fillStyle = `rgba(${gray},${gray},${gray},${alpha})`;
    offCtx.fill();
  }
  // More streaks, increased layering and width variation
  for (let i = 0; i < 28; i++) {
    const x1 = Math.random() * size;
    const y1 = Math.random() * size;
    const x2 = x1 + (Math.random() - 0.5) * 15;
    const y2 = y1 + (Math.random() - 0.5) * 15;
    const gray = 145 + Math.floor(Math.random() * 65); // 145–210
    const alpha = 0.14 + Math.random() * 0.15;
    offCtx.strokeStyle = `rgba(${gray},${gray},${gray},${alpha})`;
    offCtx.lineWidth = 1.2 + Math.random() * 3.8;
    offCtx.beginPath();
    offCtx.moveTo(x1, y1);
    offCtx.lineTo(x2, y2);
    offCtx.stroke();
  }
  // Optional: subtle noise for analog richness
  for (let i = 0; i < 48; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const gray = 160 + Math.floor(Math.random() * 40); // Mid-gray
    const alpha = 0.08 + Math.random() * 0.09;
    offCtx.fillStyle = `rgba(${gray},${gray},${gray},${alpha})`;
    offCtx.fillRect(x, y, 1, 1);
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

// Make activateCrayon globally available for HTML onclick
window.activateCrayon = activateCrayon;





// Crayon sound effect - lazy loaded for better initial performance
let crayonSound = null;

function initCrayonSound() {
  if (!crayonSound) {
    crayonSound = new Audio('assets/11L-1_singular_slow_cray-1745020327208.mp3');
    crayonSound.loop = true;
    crayonSound.preload = 'auto';
    crayonSound.volume = 0.4;
  }
  return crayonSound;
}

function playCrayonSound() {
  const audio = initCrayonSound();
  if (audio.paused) {
    audio.currentTime = 0;
    audio.play().catch(() => {}); // ignore autoplay errors
  }
}

function pauseCrayonSound() {
  if (crayonSound && !crayonSound.paused) {
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
 *  Draw Helper
 *******************************/
// --- Grand Prix Level: Dynamic Wiggle + Batching ---
let lastDrawTimestamp = Date.now();
let lastDrawSeed = Math.random() * 10000;
let pendingDrawOps = [];
let drawAnimationId = null;

function batchedDraw() {
  if (pendingDrawOps.length === 0) {
    drawAnimationId = null;
    return;
  }
  
  for (const op of pendingDrawOps) {
    drawLineImmediate(op.x, op.y, op.fromX, op.fromY);
  }
  pendingDrawOps = [];
  drawAnimationId = null;
}

function drawLine(x, y, fromX, fromY) {
  // Batch multiple draw calls into single animation frame
  pendingDrawOps.push({ x, y, fromX, fromY });
  
  if (!drawAnimationId) {
    drawAnimationId = requestAnimationFrame(batchedDraw);
  }
}

function drawLineImmediate(x, y, fromX, fromY) {
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

  // Fast pseudo-random jitter (much cheaper than sin calculations)
  if (dt > 100) lastDrawSeed = Math.random() * 1000; // New seed if pause between segments
  
  // Ultra-fast jitter using simple hash function (no expensive trigonometry)
  const fastRandom1 = ((lastDrawSeed * 9301 + x * 49297) % 233280) / 233280 - 0.5;
  const fastRandom2 = ((lastDrawSeed * 9301 + y * 49297) % 233280) / 233280 - 0.5;

  // Apply jitter
  const jitterX = x + fastRandom1 * wiggle;
  const jitterY = y + fastRandom2 * wiggle;

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
// Adaptive pointer throttling based on performance
let lastMoveTime = 0;
function throttledPointerMove(e) {
  const now = Date.now();
  
  // Adaptive throttling: lower performance = more throttling
  const throttleMs = performanceLevel === 'low' ? 80 :     // 12.5fps
                     performanceLevel === 'medium' ? 60 :  // 16.7fps
                     40; // 25fps for high performance
  
  if (now - lastMoveTime < throttleMs) return;
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
// Performance cache - only do expensive pixel check every few strokes
let checkCounter = 0;
let lastCheckResult = { percentage: 0, spreadCount: 0 };

function checkCanvasColored() {
  // Smart caching: only do full pixel scan every 3 strokes
  // But always check when getting close to threshold
  checkCounter++;
  if (checkCounter < 3 && lastCheckResult.percentage < 1.0) {
    return; // Skip expensive check
  }
  checkCounter = 0;
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
  
  // Cache results for performance
  lastCheckResult = { percentage: coloredPercentage, spreadCount };
  
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

  // Constrain portal to stay away from bottom icons (max 65% down the page)
  const constrainedTop = Math.min(pos.top, 65);

  mirrorLink.style.left = `${pos.left}%`;
  mirrorLink.style.top = `${constrainedTop}%`;

  // Generate a new mask when threshold is reached
  applyRandomPortalMask(Date.now());
  startMaskEdgeAnimation();
  
  // Start animations when portal appears (performance optimization)
  createDustCanvas();
  if (!vortexAnimating) {
    startVortex();
  }
  
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
// Throttle crayon movement for better performance
let lastCrayonMoveTime = 0;

function moveCrayon(x, y) {
  // Adaptive crayon movement throttling
  const now = Date.now();
  const crayonThrottle = performanceLevel === 'low' ? 50 :    // 20fps
                        performanceLevel === 'medium' ? 40 :  // 25fps  
                        32; // 30fps for high performance
                        
  if (now - lastCrayonMoveTime < crayonThrottle) return;
  lastCrayonMoveTime = now;
  
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
let portalHum = null;
let portalHumFading = false;

function initPortalHum() {
  if (!portalHum) {
    portalHum = new Audio('assets/low hum.mp3');
    portalHum.loop = true;
    portalHum.preload = 'auto';
    portalHum.volume = 0;
  }
  return portalHum;
}

function fadeInHum() {
  if (portalHumFading) return;
  portalHumFading = true;
  const hum = initPortalHum();
  hum.currentTime = 0;
  hum.play().catch(() => {});
  let v = hum.volume;
  const target = 0.23;
  const step = 0.03;
  function up() {
    if (v < target) {
      v = Math.min(target, v + step);
      hum.volume = v;
      requestAnimationFrame(up);
    } else {
      portalHumFading = false;
    }
  }
  up();
}
function fadeOutHum() {
  if (portalHumFading || !portalHum) return;
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

mirrorLink.addEventListener('mouseenter', fadeInHum);
mirrorLink.addEventListener('mouseleave', fadeOutHum);
mirrorLink.addEventListener('focus', fadeInHum);
mirrorLink.addEventListener('blur', fadeOutHum);

// Dimensional parallax effect for hologram preview
const mirrorIframe = document.getElementById('mirror-iframe');
let parallaxActive = false;

// --- Removed all dynamic transform/parallax logic for mirror-iframe ---
// Billboard hologram is now always perfectly centered via CSS only.
// Only show/hide logic remains.

console.log('Script loaded.');

// Prevent multiple initialization on reload
let isPageInitialized = false;

// Adaptive performance system
let performanceLevel = 'high'; // high, medium, low
let frameCount = 0;
let lastFPSCheck = Date.now();

function checkPerformance() {
  frameCount++;
  const now = Date.now();
  if (now - lastFPSCheck > 2000) { // Check every 2 seconds
    const fps = (frameCount * 1000) / (now - lastFPSCheck);
    frameCount = 0;
    lastFPSCheck = now;
    
    if (fps < 40) {
      performanceLevel = 'low';
      console.log('Performance: LOW - reducing quality');
    } else if (fps < 55) {
      performanceLevel = 'medium';
      console.log('Performance: MEDIUM');
    } else {
      performanceLevel = 'high';
    }
  }
}

// Wait for the DOM to be fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
  if (isPageInitialized) return;
  isPageInitialized = true;
  // Get icon and text elements
  const igLink = document.getElementById('ig-link');
  const igIcon = document.getElementById('ig-icon');
  const igHoverText = document.getElementById('ig-hover-text');
  const mailLink = document.getElementById('mail-link');
  const mailIcon = document.getElementById('mail-icon');
  const mailHoverText = document.getElementById('mail-hover-text');

  // --- State Variables --- 
  let igHoverTimeoutId = null;
  let mailHoverTimeoutId = null;

  // --- Helper: Remove animation classes on completion --- 
  function handleAnimationEnd(event) {
    // Remove all potential animation classes to clean up
    event.target.classList.remove('trembling', 'pulsing', 'shuddering', 'flickering');
  }
  igIcon.addEventListener('animationend', handleAnimationEnd);
  mailIcon.addEventListener('animationend', handleAnimationEnd);


  // --- Instagram Icon Logic --- 
  igLink.addEventListener('mouseenter', () => {
    if (igHoverTimeoutId) clearTimeout(igHoverTimeoutId); // Clear previous timer if hovering again quickly
    
    // Only add pulsing if not already animating (prevents re-triggering mid-pulse)
    if (!igIcon.classList.contains('pulsing')) {
        igIcon.classList.add('pulsing');
    }
    
    igHoverText.classList.add('visible');
    
    // Set timer to hide text after a delay, regardless of continued hover
    igHoverTimeoutId = setTimeout(() => {
      igHoverText.classList.remove('visible');
      igHoverTimeoutId = null;
    }, 3000); // Text stays visible for 3 seconds
  });

  igLink.addEventListener('mouseleave', () => {
    // Let the animation finish naturally via animationend listener
    // Let the text fade out naturally via its timer
    igIcon.classList.remove('pulsing');
    clearTimeout(igHoverTimeoutId); // Clear fade-out timer
    igHoverText.classList.remove('visible'); // Stop writing animation immediately
  });

  igLink.addEventListener('click', (event) => {
    event.preventDefault(); // Stop browser from navigating immediately
    
    if (!igIcon.classList.contains('flickering')) {
        igIcon.classList.add('flickering');
    }
    
    // Wait for flicker animation to roughly complete, then navigate
    setTimeout(() => {
        // Add fading trace effect
        igIcon.classList.add('fading-trace');
        // Set short timeout to remove trace class, triggering CSS fade
        setTimeout(() => { 
          igIcon.classList.remove('fading-trace');
        }, 100); // Start the 1s fade-out quickly after trace appears

        window.open(igLink.href, '_blank'); // Open in new tab
    }, 500); // Slightly longer pause (was 350ms)
  });

  // Clean up animation classes
  igIcon.addEventListener('animationend', () => {
    igIcon.classList.remove('pulsing', 'flickering');
  });

  // --- Mail Icon Logic --- 
  mailLink.addEventListener('mouseenter', () => {
    if (mailHoverTimeoutId) clearTimeout(mailHoverTimeoutId);
    
    if (!mailIcon.classList.contains('trembling')) {
        mailIcon.classList.add('trembling');
    }
    
    mailHoverText.classList.add('visible');
    
    mailHoverTimeoutId = setTimeout(() => {
      mailHoverText.classList.remove('visible');
      mailHoverTimeoutId = null;
    }, 3000);
  });

  mailLink.addEventListener('mouseleave', () => {
     // Let animations/text fade finish naturally
     mailIcon.classList.remove('trembling');
     clearTimeout(mailHoverTimeoutId); // Clear fade-out timer
     mailHoverText.classList.remove('visible'); // Stop writing animation immediately
  });

  mailLink.addEventListener('click', (event) => {
    event.preventDefault();
    
    if (!mailIcon.classList.contains('shuddering')) {
        mailIcon.classList.add('shuddering');
    }
    
    // Wait for shudder animation, then navigate
    setTimeout(() => {
         // Add fading trace effect
        mailIcon.classList.add('fading-trace');
         // Set short timeout to remove trace class, triggering CSS fade
        setTimeout(() => { 
          mailIcon.classList.remove('fading-trace');
        }, 100); // Start the 1s fade-out quickly after trace appears

        window.location.href = mailLink.href;
    }, 700); // Slightly longer pause (was 500ms)
  });

  // Clean up animation classes
  mailIcon.addEventListener('animationend', () => {
    mailIcon.classList.remove('trembling', 'shuddering');
  });

});

// Wait for the DOM to be fully loaded before setting up hover text
document.addEventListener('DOMContentLoaded', () => {
  // --- Hover Text Visibility --- //
  // No longer needed - CSS handles the typewriter animation directly
  function setupHoverText(linkId, textId) {
    // Hover text now handled by CSS animations directly
    console.log('Using CSS-based hover text animations instead');
  }

    // Setup icon interactions that feel like memories surfacing and vanishing
  setupIconInteractions();
  
  function setupIconInteractions() {
    // Create interaction counters to track memory variation
    let igInteractionCount = 0;
    let mailInteractionCount = 0;
    
    // Reference icons
    const igWrapper = document.getElementById('ig-link');
    const mailWrapper = document.getElementById('mail-link');
    const igIcon = igWrapper.querySelector('.ig-icon');
    const mailIcon = mailWrapper.querySelector('.email-icon');
    
    // Handle Instagram icon hover with subtle variations
    igWrapper.addEventListener('mouseenter', function() {
      // Create slight variations in animation timing based on interaction count
      // This creates the effect of imperfect memory recall
      const variationFactor = 1 + (Math.random() * 0.08 - 0.04); // ±4% variation
      const baseDelay = 0.08 * variationFactor;
      const animDuration = 1.2 * variationFactor;
      
      // Apply custom animation properties with slightly different timing each time
      igIcon.style.animationDelay = `${baseDelay}s`;
      igIcon.style.animationDuration = `${animDuration}s`;
      
      igInteractionCount++;
    });
    
    // Handle Mailbox icon hover with subtle variations
    mailWrapper.addEventListener('mouseenter', function() {
      // Different variation for mailbox to ensure unique memory patterns
      const variationFactor = 1 + (Math.random() * 0.09 - 0.03); // +6%/-3% variation
      const baseDelay = 0.08 * variationFactor;
      const animDuration = 1.5 * variationFactor;
      
      // Apply custom animation properties
      mailIcon.style.animationDelay = `${baseDelay}s`;
      mailIcon.style.animationDuration = `${animDuration}s`;
      
      mailInteractionCount++;
    });
    
    // Hover interactions for text residue
    [igWrapper, mailWrapper].forEach(wrapper => {
      wrapper.addEventListener('mouseleave', function() {
        // Add text residue class after hover text fades
        setTimeout(() => {
          wrapper.classList.add('text-residue');
          
          // Remove residue class after it lingers
          setTimeout(() => {
            wrapper.classList.remove('text-residue');
          }, 1200); // Residue lingers briefly
        }, 3000); // After hover text animation completes
      });
    });
    
    // Set up portal sync for dimensional coherence
    setupPortalSyncedIconBehavior();
  
    // Handle Instagram icon click - spiral unwinds then navigates
    igWrapper.addEventListener('click', function(e) {
      // Only if browser doesn't prefer reduced motion
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        e.preventDefault(); // Prevent immediate navigation
        igWrapper.classList.add('active'); // Trigger spiral unwind animation
        
        // Create micro-variation in timing for the navigation delay
        const memoryPauseVariation = 1500 + (Math.random() * 200 - 100); // ±100ms
        
        // Simulate memory flickering
        setTimeout(() => {
          // Navigate after animation completes
          window.open('https://instagram.com/coloringwithgray', '_blank');
          
          // Reset animation state after navigation
          setTimeout(() => {
            igWrapper.classList.remove('active');
          }, 500);
        }, memoryPauseVariation); // Variable timing for memory-like quality
      }
      // If reduced motion is preferred, link works normally without delay
    });
    
    // Handle Mail icon click - mailbox shudders and note slides in
    mailWrapper.addEventListener('click', function(e) {
      // Only if browser doesn't prefer reduced motion
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        e.preventDefault(); // Prevent immediate opening of mailto
        mailWrapper.classList.add('active'); // Trigger mailbox shudder animation
        
        // Create micro-variation in timing
        const memoryPauseVariation = 1000 + (Math.random() * 150 - 75); // ±75ms
        
        // Open mailto after animation completes
        setTimeout(() => {
          window.location.href = 'mailto:coloringwithgray@gmail.com';
          
          // Reset animation state after a delay
          setTimeout(() => {
            mailWrapper.classList.remove('active');
          }, 500);
        }, memoryPauseVariation); // Variable timing
      }
      // If reduced motion is preferred, mailto works normally without delay
    });
  }
  
  // Ensure icons maintain dimensional coherence with the portal's rotation
  function setupPortalSyncedIconBehavior() {
    // Get references to elements
    const icons = document.querySelectorAll('.email-icon, .ig-icon');
    
    // Create a subtle sync with portal rotation (completes a cycle every 120s)
    let lastTime = Date.now();
    let portalPhase = 0; // 0-1 representing position in 120s cycle
    
    function updateIconsBasedOnPortalPhase() {
      // Only run if portal is active - stop animation if not active
      if (!mirrorLink.classList.contains('active')) {
        return; // Stop the animation loop when portal not active
      }
      
      // Update phase based on 120s rotation
      const now = Date.now();
      const elapsed = (now - lastTime) / 1000; // seconds
      lastTime = now;
      
      // Update phase (0-1 representing position in cycle)
      portalPhase = (portalPhase + elapsed/120) % 1;
      
      // Apply subtle brightness shift based on portal phase
      // Maximum variation of ±2% brightness
      const brightnessShift = Math.sin(portalPhase * Math.PI * 2) * 0.02;
      
      // Apply to icons with extremely subtle transitions (less frequently for performance)
      if (Math.floor(now / 1000) % 2 === 0) { // Only every 2 seconds
        icons.forEach(icon => {
          const baseVal = parseFloat(getComputedStyle(document.documentElement)
            .getPropertyValue('--icon-brightness').trim() || 0.96);
          const newVal = baseVal + brightnessShift;
          icon.style.filter = `grayscale(1) brightness(${newVal}) drop-shadow(0 2px 6px rgba(90,90,90, var(--shadow-opacity-base)))`;
        });
      }
      
      requestAnimationFrame(updateIconsBasedOnPortalPhase);
    }
    
    // Start the subtle animation sync when portal is active
    if (mirrorLink.classList.contains('active')) {
      updateIconsBasedOnPortalPhase();
    } else {
      // Wait for portal to become active
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.target.classList.contains('active')) {
            updateIconsBasedOnPortalPhase();
            observer.disconnect();
          }
        });
      });
      
      if (mirrorLink) {
        observer.observe(mirrorLink, { attributes: true, attributeFilter: ['class'] });
      }
    }
  }
});

// Wait for the DOM to be fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
  applyTimeBasedStyles(); // Apply styles based on current time

  // --- Vimeo Modal on Portal Click --- //
  // DISABLED: Portal link now goes directly to reflections.html instead of showing video modal
  /*
  const modalIframe = document.getElementById('vimeo-modal-iframe');
  const modal = document.getElementById('vimeo-modal'); // Get the modal element
  const modalClose = document.getElementById('modal-close'); // Get the close button

  if (modalIframe && modal && modalClose) { // Ensure all elements exist
    try {
      const player = new Vimeo.Player(modalIframe);

      // Portal Click Logic
      mirrorLink.addEventListener('click', (event) => {
        console.log('>>> Portal link click event fired!'); // Add this line for diagnostics
        event.preventDefault(); // Prevent default link behavior

        // Fade out the portal hum sound
        if (typeof fadeOutHum === 'function') {
          fadeOutHum();
        } else {
          console.warn('fadeOutHum function not found, cannot mute hum.');
        }

        // Show the modal
        modal.style.display = 'flex'; // Use flex for centering
        modal.setAttribute('aria-hidden', 'false');
        modal.style.opacity = '1'; // Start fade-in (assuming CSS transition)
        document.body.style.overflow = 'hidden'; // Prevent background scroll

        // Seek to beginning and play
        player.setCurrentTime(0).then(() => {
          console.log('Vimeo video time set to 0.');
          // Ensure video is unmuted (autoplay param should handle this, but be sure)
          return player.setVolume(1);
        }).then(() => {
           return player.play();
        }).then(() => {
          console.log('Vimeo video started playing.');
        }).catch((error) => {
          console.error('Error seeking to 0, setting volume, or playing video:', error);
        });
      });

      // Modal Close Button Logic
      modalClose.addEventListener('click', () => {
        modal.style.opacity = '0'; // Start fade-out
        // Wait for fade-out transition before hiding and pausing
        setTimeout(() => {
           modal.style.display = 'none';
           modal.setAttribute('aria-hidden', 'true');
           player.pause(); // Pause video when closing modal
           document.body.style.overflow = ''; // Restore background scroll
        }, 500); // Adjust timing to match CSS transition duration
      });

    } catch (error) {
      console.error('Error initializing Vimeo Player or setting up modal:', error);
    }
  } else {
    console.error('Required elements for Vimeo modal interaction not found (portalLink, modalIframe, modal, or modalClose).');
  }
  */
  // --- End Vimeo Modal Logic --- //
});

// Wait for the DOM to be fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
  applyTimeBasedStyles(); // Apply styles based on current time

  // --- Time-Based Aesthetic Adjustments --- //
  function applyTimeBasedStyles() {
    const hour = new Date().getHours();
    const rootStyle = document.documentElement.style;

    let brightness = 0.96;
    let shadowOpacity = 0.08;
    let portalShadowOpacity = 0.16;
    let textColor = '#666'; // Default gray

    if (hour < 6 || hour >= 20) { // Night (8 PM - 5:59 AM)
      brightness = 0.92;
      shadowOpacity = 0.06;
      portalShadowOpacity = 0.12;
      textColor = '#555'; // Slightly darker
    } else if (hour >= 6 && hour < 9) { // Morning (6 AM - 8:59 AM)
      brightness = 0.98;
      shadowOpacity = 0.09;
      portalShadowOpacity = 0.17;
      textColor = '#6a6a6a'; // Slightly lighter
    } else if (hour >= 9 && hour < 18) { // Daytime (9 AM - 5:59 PM)
      brightness = 1.0; // Slightly brighter icons
      shadowOpacity = 0.10;
      portalShadowOpacity = 0.18;
      textColor = '#707070'; // Lighter text
    } else { // Evening (6 PM - 7:59 PM)
      brightness = 0.95;
      shadowOpacity = 0.07;
      portalShadowOpacity = 0.15;
      textColor = '#606060';
    }

    rootStyle.setProperty('--icon-brightness', brightness);
    rootStyle.setProperty('--shadow-opacity-base', shadowOpacity);
    rootStyle.setProperty('--portal-shadow-opacity', portalShadowOpacity);
    rootStyle.setProperty('--text-color', textColor);
  }

  // --- Initialization --- //
  document.addEventListener('DOMContentLoaded', () => {
    applyTimeBasedStyles(); // Apply styles based on current time
  });
});

// --- Time-Based Aesthetic Adjustments --- //
function applyTimeBasedStyles() {
  const hour = new Date().getHours();
  const rootStyle = document.documentElement.style;

  let brightness = 0.96;
  let shadowOpacity = 0.08;
  let portalShadowOpacity = 0.16;
  let textColor = '#666'; // Default gray

  if (hour < 6 || hour >= 20) { // Night (8 PM - 5:59 AM)
    brightness = 0.92;
    shadowOpacity = 0.06;
    portalShadowOpacity = 0.12;
    textColor = '#555'; // Slightly darker
  } else if (hour >= 6 && hour < 9) { // Morning (6 AM - 8:59 AM)
    brightness = 0.98;
    shadowOpacity = 0.09;
    portalShadowOpacity = 0.17;
    textColor = '#6a6a6a'; // Slightly lighter
  } else if (hour >= 9 && hour < 18) { // Daytime (9 AM - 5:59 PM)
    brightness = 1.0; // Slightly brighter icons
    shadowOpacity = 0.10;
    portalShadowOpacity = 0.18;
    textColor = '#707070'; // Lighter text
  } else { // Evening (6 PM - 7:59 PM)
    brightness = 0.95;
    shadowOpacity = 0.07;
    portalShadowOpacity = 0.15;
    textColor = '#606060';
  }

  rootStyle.setProperty('--icon-brightness', brightness);
  rootStyle.setProperty('--shadow-opacity-base', shadowOpacity);
  rootStyle.setProperty('--portal-shadow-opacity', portalShadowOpacity);
  rootStyle.setProperty('--text-color', textColor);
}

// Wait for the DOM to be fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
  applyTimeBasedStyles(); // Apply styles based on current time

  // --- Vimeo Modal on Portal Click --- //
  // DISABLED: Portal link now goes directly to reflections.html instead of showing video modal
  /*
  const portalLink = document.getElementById('mirror-link');
  const modalIframe = document.getElementById('vimeo-modal-iframe');
  const modal = document.getElementById('vimeo-modal'); // Get the modal element
  const modalClose = document.getElementById('modal-close'); // Get the close button

  if (portalLink && modalIframe && modal && modalClose) { // Ensure all elements exist
    try {
      const player = new Vimeo.Player(modalIframe);

      // Portal Click Logic
      portalLink.addEventListener('click', (event) => {
        console.log('>>> Portal link click event fired!'); // Add this line for diagnostics
        event.preventDefault(); // Prevent default link behavior

        // Fade out the portal hum sound
        if (typeof fadeOutHum === 'function') {
          fadeOutHum();
        } else {
          console.warn('fadeOutHum function not found, cannot mute hum.');
        }

        // Show the modal
        modal.style.display = 'flex'; // Use flex for centering
        modal.setAttribute('aria-hidden', 'false');
        modal.style.opacity = '1'; // Start fade-in (assuming CSS transition)
        document.body.style.overflow = 'hidden'; // Prevent background scroll

        // Seek to beginning and play
        player.setCurrentTime(0).then(() => {
          console.log('Vimeo video time set to 0.');
          // Ensure video is unmuted (autoplay param should handle this, but be sure)
          return player.setVolume(1);
        }).then(() => {
           return player.play();
        }).then(() => {
          console.log('Vimeo video started playing.');
        }).catch((error) => {
          console.error('Error seeking to 0, setting volume, or playing video:', error);
        });
      });

      // Modal Close Button Logic
      modalClose.addEventListener('click', () => {
        modal.style.opacity = '0'; // Start fade-out
        // Wait for fade-out transition before hiding and pausing
        setTimeout(() => {
           modal.style.display = 'none';
           modal.setAttribute('aria-hidden', 'true');
           player.pause(); // Pause video when closing modal
           document.body.style.overflow = ''; // Restore background scroll
        }, 500); // Adjust timing to match CSS transition duration
      });

    } catch (error) {
      console.error('Error initializing Vimeo Player or setting up modal:', error);
    }
  } else {
    console.error('Required elements for Vimeo modal interaction not found (portalLink, modalIframe, modal, or modalClose).');
  }
  */
  // --- End Vimeo Modal Logic --- //
});
