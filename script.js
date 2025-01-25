/*******************************
 *  DOM References
 *******************************/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const crayon = document.getElementById("crayon");
const portalContainer = document.getElementById("portal-container");
const portalCanvas = document.getElementById("portal-canvas");
const portalCtx = portalCanvas.getContext("2d");

/*******************************
 *  State Variables
 *******************************/
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let crayonActive = false;
let portalActive = false;

/*******************************
 *  Initialize Canvas
 *******************************/
function initializeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Initialize portal canvas size
  portalCanvas.width = 400;
  portalCanvas.height = 400;
}

window.addEventListener("resize", initializeCanvas);
initializeCanvas();

/*******************************
 *  Activate Crayon
 *******************************/
function activateCrayon() {
  crayonActive = true;
  document.body.classList.add("hide-cursor");
}

/*******************************
 *  Draw Helper
 *******************************/
function drawLine(x, y, fromX, fromY) {
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 15;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(x, y);
  ctx.stroke();
}

/*******************************
 *  Pointer Handlers
 *******************************/
function handlePointerDown(e) {
  if (!crayonActive) return;
  isDrawing = true;
  lastX = e.clientX;
  lastY = e.clientY;
  moveCrayon(e.clientX, e.clientY);
}

function handlePointerMove(e) {
  if (!isDrawing && !crayonActive) return;
  moveCrayon(e.clientX, e.clientY);
  if (isDrawing) {
    drawLine(e.clientX, e.clientY, lastX, lastY);
    lastX = e.clientX;
    lastY = e.clientY;
  }
}

function handlePointerUp() {
  if (!crayonActive) return;
  isDrawing = false;
  checkCanvasColored();
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
    if (imageData[i] === 128 && imageData[i + 1] === 128 && imageData[i + 2] === 128) {
      coloredPixels++;
    }
  }

  const coloredPercentage = ((coloredPixels * skipFactor) / totalPixels) * 100;

  if (coloredPercentage >= 1.37 && !portalActive) {
    portalActive = true;
    showPortal();
  }
}

/*******************************
 *  Show Portal
 *******************************/
function showPortal() {
  portalContainer.classList.remove("hidden");

  // Start the swirling animation
  const particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      angle: Math.random() * Math.PI * 2,
      distance: Math.random() * 150,
      speed: Math.random() * 0.05 + 0.01,
      size: Math.random() * 3 + 1,
      color: `rgba(0, 150, 255, ${Math.random() * 0.8 + 0.2})`,
    });
  }

  function drawSwirl() {
    portalCtx.clearRect(0, 0, portalCanvas.width, portalCanvas.height);
    particles.forEach((p) => {
      p.angle += p.speed;
      const x = portalCanvas.width / 2 + Math.cos(p.angle) * p.distance;
      const y = portalCanvas.height / 2 + Math.sin(p.angle) * p.distance;
      portalCtx.beginPath();
      portalCtx.arc(x, y, p.size, 0, Math.PI * 2);
      portalCtx.fillStyle = p.color;
      portalCtx.fill();
    });
    requestAnimationFrame(drawSwirl);
  }

  drawSwirl();
}

/*******************************
 *  Move Crayon (Cursor)
 *******************************/
function moveCrayon(x, y) {
  crayon.style.left = `${x - canvas.offsetLeft - 15}px`;
  crayon.style.top = `${y - canvas.offsetTop - 25}px`;
}

/*******************************
 *  Register Pointer Events
 *******************************/
canvas.addEventListener("pointerdown", handlePointerDown);
canvas.addEventListener("pointermove", handlePointerMove);
canvas.addEventListener("pointerup", handlePointerUp);
canvas.addEventListener("pointercancel", handlePointerUp);
