/****************************
 *  Debug Logging (Optional)
 ****************************/
const DEBUG_MODE = false; // Set to true to see console logs

function debugLog(...args) {
  if (DEBUG_MODE) console.log(...args);
}

/****************************
 *  DOM Elements
 ****************************/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const crayon = document.getElementById("crayon");
const mirrorLink = document.getElementById("mirror-link");

/****************************
 *  State Variables
 ****************************/
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let crayonActive = false;

/****************************
 *  Initialize Canvas
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
 *  Activate Crayon
 ****************************/
function activateCrayon() {
  crayonActive = true;
  // Hide the default cursor on the entire page
  document.body.classList.add("hide-cursor");
  debugLog("Crayon activated.");
}

/****************************
 *  Draw Function
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
// Throttle pointer moves (~30 fps)
let lastMoveTime = 0;
function throttledPointerMove(e) {
  const now = Date.now();
  if (now - lastMoveTime < 33) return; // ~33ms => 30 fps
  lastMoveTime = now;
  handlePointerMove(e);
}

function handlePointerDown(e) {
  if (!crayonActive) return;
  isDrawing = true;
  lastX = e.clientX;
  lastY = e.clientY;
  // Show the crayon image
  crayon.style.display = "block";
  moveCrayon(e.clientX, e.clientY);
  debugLog("Pointer down: drawing started.");
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
  checkCanvasColored();
  debugLog("Pointer up: drawing stopped.");
}

/****************************
 *  Check Canvas Colored
 ****************************/
function checkCanvasColored() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let coloredPixels = 0;
  const totalPixels = canvas.width * canvas.height;

  // Skip pixels (check every 10th) for performance
  const skipFactor = 10;
  for (let i = 0; i < imageData.length; i += 4 * skipFactor) {
    if (
      imageData[i] === 128 &&    // R
      imageData[i + 1] === 128 &&// G
      imageData[i + 2] === 128   // B
    ) {
      coloredPixels++;
    }
  }

  const approxColored = coloredPixels * skipFactor;
  const coloredPercentage = (approxColored / totalPixels) * 100;
  debugLog(
    `Colored approx: ${approxColored} of ${totalPixels} => ${coloredPercentage.toFixed(2)}%`
  );

  // 1.37% threshold (adjust if you wish)
  if (coloredPercentage >= 1.37) {
    mirrorLink.style.display = "block";
    // Add a glowing pulse
    mirrorLink.classList.add("mirror-glow");
    debugLog("Mirror displayed with glow effect.");
  } else {
    // If you want to hide the mirror again below threshold:
    // mirrorLink.style.display = "none";
    // mirrorLink.classList.remove("mirror-glow");
    debugLog("Not enough colored pixels yet.");
  }
}

/****************************
 *  Move Crayon
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

debugLog("Script loaded.");
