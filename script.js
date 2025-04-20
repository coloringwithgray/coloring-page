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

// --- Shared, Decaying Memory Integration ---
const SERVER_URL = 'http://localhost:3000'; // Change if deployed remotely
let hasDrawn = false; // Track if user has drawn since last upload

// Fetch the latest shared canvas from the server and draw onto local canvas
function fetchSharedMemory() {
  fetch(`${SERVER_URL}/latest`)
    .then(res => res.json())
    .then(data => {
      if (data.image) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = data.image;
      }
    });
}

// Upload only the new marks (entire canvas for simplicity)
function uploadCanvas() {
  if (!hasDrawn) return;
  const dataURL = canvas.toDataURL('image/png');
  fetch(`${SERVER_URL}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataURL })
  });
  hasDrawn = false;
}

// Fetch shared canvas on load
window.addEventListener('load', fetchSharedMemory);
// Poll every 10 seconds to keep in sync with decaying memory
setInterval(fetchSharedMemory, 10000);

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
function drawLine(x, y, fromX, fromY) {
  // Ensure the texture pattern is created
  ensureCrayonPattern();
  
  ctx.globalCompositeOperation = 'source-over';
  // Use textured pattern for authentic crayon mark with memory and imperfection
  ctx.strokeStyle = texturedPattern || '#888888'; 
  
  // Slight imperfection in width for humanistic quality
  const width = 15 + (Math.random() * 3 - 1.5);
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  
  // Subtle jitter for authentic mark-making - the imperfect gesture
  const jitterX = x + (Math.random() * 1.2 - 0.6);
  const jitterY = y + (Math.random() * 1.2 - 0.6);
  
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(jitterX, jitterY);
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
  hasDrawn = true;
  uploadCanvas();
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
  const gridTouched = Array.from({ length: gridRows * gridCols }, () => false);
  const cellWidth = Math.floor(canvas.width / gridCols);
  const cellHeight = Math.floor(canvas.height / gridRows);

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const r = imageData[idx];
      const g = imageData[idx + 1];
      const b = imageData[idx + 2];
      if (r < 235 || g < 235 || b < 235) {
        coloredPixels++;
        // Mark grid cell as touched
        const col = Math.min(Math.floor(x / cellWidth), gridCols - 1);
        const row = Math.min(Math.floor(y / cellHeight), gridRows - 1);
        gridTouched[row * gridCols + col] = true;
      }
    }
  }

  const coloredPercentage = (coloredPixels / (canvas.width * canvas.height)) * 100;
  const spreadCount = gridTouched.filter(Boolean).length;
  console.log(`Colored: ${coloredPercentage.toFixed(2)}% | Spread: ${spreadCount} grid zones`);

  // Portal emerges only if both thresholds are met
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
  portalShown = true;

  // --- Cannes Grand Prix Level: Portal Placement ---
  // Rule of thirds intersection points (as percentages)
  const thirds = [33.33, 66.66];
  const intersections = [
    { left: thirds[0], top: thirds[0] }, // (1/3, 1/3)
    { left: thirds[0], top: thirds[1] }, // (1/3, 2/3)
    { left: thirds[1], top: thirds[0] }, // (2/3, 1/3)
    { left: thirds[1], top: thirds[1] }  // (2/3, 2/3)
  ];

  // For each intersection, define an elliptical "zone of possibility" (±13% in x/y)
  function randomInEllipse(center, rx, ry) {
    // Polar coordinates for uniform ellipse distribution
    const t = 2 * Math.PI * Math.random();
    const r = Math.sqrt(Math.random()); // denser near center
    const dx = rx * r * Math.cos(t);
    const dy = ry * r * Math.sin(t);
    return {
      left: center.left + dx,
      top: center.top + dy
    };
  }

  // Pick a random intersection and random point in its ellipse
  const intersection = intersections[Math.floor(Math.random() * intersections.length)];
  const ellipseRadiusX = 13; // percent
  const ellipseRadiusY = 13; // percent
  const pos = randomInEllipse(intersection, ellipseRadiusX, ellipseRadiusY);

  mirrorLink.style.left = `${pos.left}%`;
  mirrorLink.style.top = `${pos.top}%`;

  // Add the 'active' class to trigger the scale-up animation
  mirrorLink.classList.add('active');
  
  // Add glow to the #mirror div
  mirrorDiv.classList.add('mirror-glow');

  // Enable pointer events after animation
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
