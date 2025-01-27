// DOM Elements
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const crayon = document.getElementById('crayon');
const mirrorLink = document.getElementById('mirror-link');
const mirror = document.getElementById('mirror');

// State Management
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let crayonActive = false;

// Canvas Setup
function initCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', initCanvas);
initCanvas();

// Crayon Activation
function activateCrayon() {
  crayonActive = true;
  document.body.classList.add('hide-cursor');
  crayon.style.transform = 'translate(-50%, -50%) scale(0.25)';
}

// Drawing Mechanics
function draw(x, y) {
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 15;
  ctx.lineCap = 'round';
  ctx.stroke();
  [lastX, lastY] = [x, y];
}

// Input Handlers
canvas.addEventListener('pointerdown', (e) => {
  if (!crayonActive) return;
  isDrawing = true;
  [lastX, lastY] = [e.clientX, e.clientY];
  draw(e.clientX, e.clientY);
});

canvas.addEventListener('pointermove', (e) => {
  if (!isDrawing) return;
  draw(e.clientX, e.clientY);
  checkProgress();
});

window.addEventListener('pointerup', () => {
  isDrawing = false;
});

// Progress Check
function checkProgress() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let grayPixels = 0;
  
  // Pixel analysis (optimized)
  for (let i = 0; i < imageData.data.length; i += 16) {
    if (imageData.data[i] === 128 && 
        imageData.data[i+1] === 128 && 
        imageData.data[i+2] === 128) {
      grayPixels++;
    }
  }

  const coverage = (grayPixels / (canvas.width * canvas.height)) * 100;
  
  if (coverage >= 1.37) {
    mirrorLink.style.display = 'block';
    mirror.classList.add('mirror-glow');
    createParticles();
  }
}

// Particle System
function createParticles() {
  const container = document.getElementById('particle-container');
  container.innerHTML = '';

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 2}s;
      opacity: ${Math.random() * 0.4 + 0.2};
    `;
    container.appendChild(particle);
  }
}
