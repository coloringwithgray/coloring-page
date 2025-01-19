/****************************
 *  Global Variables & Flags
 ****************************/
const DEBUG_MODE = false; // Set to true if you want console logs

function debugLog(...args) {
  if (DEBUG_MODE) console.log(...args);
}

// Get DOM references
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const crayon = document.getElementById("crayon");
const mirrorLink = document.getElementById("mirror-link");

// State variables
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let crayonActive = false;

/****************************
 *  Canvas Initialization
 ****************************/
function initializeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  debugLog("Canvas initialized.");
}

window.addEventListener("resize", initializeCanvas);
initializeCanvas();

/****************************
 *  Crayon Activation
 ****************************/
function activateCrayon() {
  crayonActive = true;
  // Hide default mouse cursor, but we show the crayon
  crayon.style.cursor = "none";
  debugLog("Crayon activated.");
}

/****************************
 *  Drawing Logic
 ****************************/
function drawLine(x, y, lastX, lastY) {
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 15;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
}

/****************************
 *  Pointer Event Handlers
 ****************************/
// Throttle pointer moves (e.g., ~30 fps)
let lastMoveTime = 0;
function throttledPointerMove(e) {
  const now = Date.now();
  // ~33 ms interval => ~30 fps
  if (now - lastMoveTime < 33) return;
  lastMoveTime = now;
  handlePointerMove(e);
}

function handlePointerDown(e) {
  if (!crayonActive) return;
  isDrawing = true;

  // Record starting position
  lastX = e.clientX;
  lastY = e.clientY;

  // Show crayon
  crayon.style.display = "block";
  moveCrayon(e.clientX, e.clientY);

  debugLog("Pointer down. Drawing started.");
}

function handlePointerMove(e) {
  if (isDrawing) {
    // Draw
    drawLine(e.clientX, e.clientY, lastX, lastY);
    lastX = e.clientX;
    lastY = e.clientY;
  }

  // Move crayon if active
  if (crayonActive) {
    moveCrayon(e.clientX, e.clientY);
  }
}

function handlePointerUp() {
  if (!crayonActive) return;
  isDrawing = false;
  checkCanvasColored();
  debugLog("Pointer up. Drawing stopped.");
}

/****************************
 *  Pixel Check Optimization
 ****************************/
function checkCanvasColored() {
  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let coloredPixels = 0;
  const totalPixels = canvas.width * canvas.height;

  // Skip some pixels to reduce overhead (check every 10th pixel)
  for (let i = 0; i < imageData.length; i += 4 * 10) {
    // We only check the R, G, B in [i, i+1, i+2]
    if (imageData[i] === 128 && imageData[i + 1] === 128 && imageData[i + 2] === 128) {
      coloredPixels++;
    }
  }

  const skipFactor = 10; // We checked every 10th pixel
  // Adjust the count accordingly
  const approxColored = coloredPixels * skipFactor; 
  const coloredPercentage = (approxColored / totalPixels) * 100;

  debugLog(`Colored approx: ${approxColored} of ${totalPixels} => ${coloredPercentage.toFixed(2)}%`);

  // 1.37% threshold from your original code
  if (coloredPercentage >= 1.37) {
    mirrorLink.style.display = "block";
    debugLog("Mirror displayed.");
  } else {
    debugLog("Not enough colored pixels yet.");
  }
}

/****************************
 *  Crayon Movement
 ****************************/
function moveCrayon(x, y) {
  crayon.style.left = `${x - 15}px`;
  crayon.style.top = `${y - 50}px`;
}

/****************************
 *  Register Pointer Events
 ****************************/
canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", throttledPointerMove);
canvas.addEventListener("pointerup", handlePointerUp);
canvas.addEventListener("pointercancel", handlePointerUp);

debugLog("Script loaded successfully.");
