const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const crayon = document.getElementById('crayon');
const mirrorLink = document.getElementById('mirror-link');

let isDrawing = false;
let lastPos = { x: 0, y: 0 };
let crayonActive = false;
const CRAYON_TIP_OFFSET = { x: 22, y: 140 }; // Precise tip position in pre-scaled image

function init() {
  resizeCanvas();
  ctx.lineCap = 'round';
  ctx.lineWidth = 15;
  ctx.strokeStyle = '#808080';
  window.addEventListener('resize', resizeCanvas);
  canvas.addEventListener('pointerdown', startDrawing);
  canvas.addEventListener('pointermove', draw);
  canvas.addEventListener('pointerup', endDrawing);
  canvas.addEventListener('pointercancel', endDrawing);
  crayon.addEventListener('click', activateCrayon);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function activateCrayon() {
  crayonActive = true;
  crayon.style.display = 'block';
  document.body.style.cursor = 'none';
}

function getTipPosition(clientX, clientY) {
  return {
    x: clientX - CRAYON_TIP_OFFSET.x,
    y: clientY - CRAYON_TIP_OFFSET.y
  };
}

function startDrawing(e) {
  if (!crayonActive) return;
  isDrawing = true;
  const tipPos = getTipPosition(e.clientX, e.clientY);
  lastPos = tipPos;
  ctx.beginPath();
  ctx.moveTo(tipPos.x, tipPos.y);
  updateCrayonPosition(e);
}

function draw(e) {
  if (!isDrawing) return;
  updateCrayonPosition(e);
  
  const tipPos = getTipPosition(e.clientX, e.clientY);
  ctx.lineTo(tipPos.x, tipPos.y);
  ctx.stroke();
  
  lastPos = tipPos;
  checkProgress();
}

function updateCrayonPosition(e) {
  crayon.style.left = `${e.clientX}px`;
  crayon.style.top = `${e.clientY}px`;
}

function endDrawing() {
  if (!crayonActive) return;
  isDrawing = false;
  ctx.closePath();
}

function checkProgress() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let colored = 0;
  const sampleStride = 20;
  
  for (let y = 0; y < canvas.height; y += sampleStride) {
    for (let x = 0; x < canvas.width; x += sampleStride) {
      const i = (y * canvas.width + x) * 4;
      if (data[i] === 128 && data[i+1] === 128 && data[i+2] === 128) {
        colored++;
      }
    }
  }
  
  const coverage = (colored * sampleStride ** 2) / (canvas.width * canvas.height) * 100;
  if (coverage >= 1.37) {
    mirrorLink.style.display = 'block';
    document.getElementById('mirror').classList.add('mirror-glow');
    const iframe = document.getElementById('mirror-iframe');
    iframe.src = iframe.dataset.src;
  }
}

init();
