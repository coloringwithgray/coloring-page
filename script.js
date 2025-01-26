const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const crayon = document.getElementById('crayon');
const mirrorLink = document.getElementById('mirror-link');
const CRAYON_TIP_OFFSET = { x: 22, y: 140 };

let isDrawing = false;
let lastPos = { x: 0, y: 0 };
let crayonAngle = 0;
let crayonActive = false;

function init() {
  resizeCanvas();
  ctx.lineCap = 'round';
  ctx.lineWidth = 15;
  ctx.strokeStyle = '#808080';
  
  window.addEventListener('resize', resizeCanvas);
  canvas.addEventListener('pointerdown', startDrawing);
  canvas.addEventListener('pointermove', updatePosition);
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

function getTipPosition(x, y) {
  return {
    x: x - CRAYON_TIP_OFFSET.x,
    y: y - CRAYON_TIP_OFFSET.y
  };
}

function startDrawing(e) {
  if (!crayonActive) return;
  isDrawing = true;
  const pos = getTipPosition(e.clientX, e.clientY);
  lastPos = pos;
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  updateCrayon(e);
}

function updatePosition(e) {
  if (!isDrawing) return;
  const pos = getTipPosition(e.clientX, e.clientY);
  
  // Smooth drawing with path averaging
  const avgX = (pos.x + lastPos.x * 3) / 4;
  const avgY = (pos.y + lastPos.y * 3) / 4;
  
  ctx.lineTo(avgX, avgY);
  ctx.stroke();
  
  // Natural line width variation
  ctx.lineWidth = 15 + Math.random() * 2 - 1;
  
  lastPos = { x: avgX, y: avgY };
  updateCrayon(e);
  checkProgress();
}

function updateCrayon(e) {
  const x = e.clientX - CRAYON_TIP_OFFSET.x;
  const y = e.clientY - CRAYON_TIP_OFFSET.y;
  
  // Natural rotation physics
  crayonAngle = crayonAngle * 0.7 + (-e.movementX * 0.3);
  crayon.style.transform = `
    translate(${x}px, ${y}px)
    rotate(${crayonAngle}deg)
  `;
}

function endDrawing() {
  isDrawing = false;
  ctx.closePath();
}

function checkProgress() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let colored = 0;
  const stride = 20;

  for (let y = 0; y < canvas.height; y += stride) {
    for (let x = 0; x < canvas.width; x += stride) {
      const i = (y * canvas.width + x) * 4;
      if (data[i] === 128 && data[i+1] === 128 && data[i+2] === 128) {
        colored++;
      }
    }
  }

  const coverage = (colored * stride ** 2) / (canvas.width * canvas.height) * 100;
  if (coverage >= 1.37 && !mirrorLink.style.display) {
    mirrorLink.style.display = 'block';
    document.getElementById('mirror').classList.add('mirror-glow');
    document.getElementById('mirror-iframe').src = 
      document.getElementById('mirror-iframe').dataset.src;
  }
}

init();
