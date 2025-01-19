/const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const crayon = document.getElementById("crayon");
const mirrorLink = document.getElementById("mirror-link");
const mirrorDiv = document.getElementById("mirror");

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let crayonActive = false;

function initializeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  console.log("Canvas initialized.");
}

window.addEventListener("resize", initializeCanvas);
initializeCanvas();

function activateCrayon() {
  crayonActive = true;
  document.body.classList.add("hide-cursor");
  console.log("Crayon activated.");
}

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

// Throttling pointermove
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
  crayon.style.display = "block";
  moveCrayon(e.clientX, e.clientY);
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
}

function checkCanvasColored() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let coloredPixels = 0;
  const totalPixels = canvas.width * canvas.height;

  const skipFactor = 10;
  for (let i = 0; i < imageData.length; i += 4 * skipFactor) {
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

  if (coloredPercentage >= 1.37) {
    mirrorLink.style.display = "block";
    // Apply the glow to the #mirror div (the round container)
    mirrorDiv.classList.add("mirror-glow");
  }
}

function moveCrayon(x, y) {
  crayon.style.left = `${x - 15}px`;
  crayon.style.top = `${y - 50}px`;
}

canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", throttledPointerMove);
canvas.addEventListener("pointerup", handlePointerUp);
canvas.addEventListener("pointercancel", handlePointerUp);
