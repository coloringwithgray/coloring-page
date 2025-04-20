/*******************************
 *  DOM References
 *******************************/
// === Grand Prix-Level Constants ===
// All values below are chosen for a poetic, tactile, and performant experience.
const DRAW_COLOR = 'gray'; // Monochrome for brand identity
const DRAW_LINE_WIDTH = 15; // Visually satisfying, tactile stroke
const POINTER_THROTTLE_MS = 33; // ~30 FPS for smoothness without overloading CPU
const PIXEL_SKIP_FACTOR = 10; // Skip pixels for perf when checking colored area
const GRAY_COLOR = 128; // RGB value for 'gray' crayon
const PORTAL_REVEAL_THRESHOLD = 1.37; // Minimum % colored to reveal portal
const CRAYON_SOUND_FILE = '11L-1_singular_slow_cray-1745020327208.mp3'; // Tactile crayon sound
const HUM_SOUND_FILE = 'low-hum-14645.mp3'; // Portal ambient hum
const CRAYON_SOUND_VOLUME = 0.4; // Tuned for subtlety
const HUM_SOUND_VOLUME = 0.23; // Tuned for subtlety
const HUM_FADE_STEP = 0.03; // Smooth fade for hum


const canvas = document.getElementById('canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const crayon = document.getElementById('crayon');
const liveRegion = document.getElementById('portal-announcement');

// Enhanced crayon activation logic
if (crayon) {
  // Set accessibility attributes
  crayon.setAttribute('role', 'button');
  crayon.setAttribute('aria-pressed', 'false');

  // Center crayon on load
  function centerCrayon() {
    crayon.style.left = '50%';
    crayon.style.top = '50%';
    crayon.style.transform = 'translate(-50%, -50%)';
  }
  centerCrayon();
  window.addEventListener('resize', centerCrayon);

  function activateCrayonHandler(e) {
    if (e) e.preventDefault();
    crayon.classList.add('active');
    crayon.setAttribute('aria-pressed', 'true');
    if (liveRegion) liveRegion.textContent = 'Crayon activated. You can now draw.';
    // Optionally: setTimeout to remove .active after animation
    setTimeout(() => crayon.classList.remove('active'), 600);
    // Call the main activateCrayon logic if it exists
    if (typeof activateCrayon === 'function') activateCrayon();
  }

  crayon.addEventListener('click', activateCrayonHandler);
  crayon.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      activateCrayonHandler(e);
    }
  });
  crayon.addEventListener('focus', () => crayon.classList.add('focus-ring'));
  crayon.addEventListener('blur', () => crayon.classList.remove('focus-ring'));
}




/*******************************
 *  State Variables
 *******************************/
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let crayonActive = false;

// Crayon sound effect
const crayonSound = new Audio(CRAYON_SOUND_FILE);
crayonSound.loop = true;
crayonSound.preload = 'auto';
crayonSound.volume = 0;
let crayonSoundFadeRAF = null;
let crayonSoundMuted = false;

// Mute toggle for crayon sound (add button with id 'crayon-mute-btn' in HTML if desired)
const crayonMuteBtn = document.getElementById('crayon-mute-btn');
if (crayonMuteBtn) {
  crayonMuteBtn.addEventListener('click', () => {
    crayonSoundMuted = !crayonSoundMuted;
    if (crayonSoundMuted) {
      fadeOutCrayonSound();
      crayonMuteBtn.setAttribute('aria-label', 'Unmute crayon sound');
      if (liveRegion) liveRegion.textContent = 'Crayon sound muted.';
    } else {
      playCrayonSound();
      crayonMuteBtn.setAttribute('aria-label', 'Mute crayon sound');
      if (liveRegion) liveRegion.textContent = 'Crayon sound unmuted.';
    }
  });
}

function fadeCrayonSound(direction) {
  if (crayonSoundFadeRAF) {
    cancelAnimationFrame(crayonSoundFadeRAF);
    crayonSoundFadeRAF = null;
  }
  if (crayonSoundMuted) {
    crayonSound.volume = 0;
    crayonSound.pause();
    return;
  }
  let v = crayonSound.volume;
  const target = direction === 'in' ? CRAYON_SOUND_VOLUME : 0;
  const step = direction === 'in' ? 0.06 : 0.06;
  if (direction === 'in') {
    crayonSound.currentTime = 0;
    if (crayonSound.paused) crayonSound.play().catch(() => {});
  }
  function fade() {
    if (direction === 'in' && v < target) {
      v = Math.min(target, v + step);
      crayonSound.volume = v;
      crayonSoundFadeRAF = requestAnimationFrame(fade);
    } else if (direction === 'out' && v > target) {
      v = Math.max(target, v - step);
      crayonSound.volume = v;
      crayonSoundFadeRAF = requestAnimationFrame(fade);
    } else {
      crayonSound.volume = target;
      if (direction === 'out') crayonSound.pause();
      crayonSoundFadeRAF = null;
    }
  }
  fade();
}
function playCrayonSound() {
  if (crayonSoundMuted) return;
  fadeCrayonSound('in');
}
function fadeOutCrayonSound() {
  fadeCrayonSound('out');
}



function pauseCrayonSound() {
  if (!crayonSound.paused) {
    // Fade out
    let v = crayonSound.volume;
    const step = 0.04;
    function down() {
      if (v > 0) {
        v = Math.max(0, v - step);
        crayonSound.volume = v;
        requestAnimationFrame(down);
      } else {
        crayonSound.pause();
        crayonSound.currentTime = 0;
        crayonSound.volume = CRAYON_SOUND_VOLUME; // reset for next time
      }
    }
    down();
  }
}

/*******************************
 *  Initialize Canvas
 *******************************/
function initializeCanvas() {
  if (!canvas || !ctx) return;
  // Save current drawing
  let dataUrl = null;
  if (canvas.width > 0 && canvas.height > 0) {
    dataUrl = canvas.toDataURL();
  }
  // Resize canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Restore drawing if available
  if (dataUrl) {
    const img = new window.Image();
    img.onload = function() {
      // Center the restored image if aspect ratio changed
      const x = (canvas.width - img.width) / 2;
      const y = (canvas.height - img.height) / 2;
      // Animate fade-in for poetry
      ctx.globalAlpha = 0;
      ctx.drawImage(img, x, y);
      let alpha = 0;
      function fadeIn() {
        alpha += 0.07;
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y);
        if (alpha < 1) {
          requestAnimationFrame(fadeIn);
        } else {
          ctx.globalAlpha = 1;
        }
      }
      fadeIn();
      if (liveRegion) liveRegion.textContent = 'Canvas restored after resize.';
    };
    img.src = dataUrl;
  } else {
    if (liveRegion) liveRegion.textContent = 'Canvas resized.';
  }
}

// Throttle resize event
let resizeTimeout = null;
window.addEventListener('resize', () => {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    initializeCanvas();
    resizeTimeout = null;
  }, 120);
});
initializeCanvas();


window.addEventListener('resize', initializeCanvas);
initializeCanvas();

/*******************************
 *  Activate Crayon
 *******************************/
function activateCrayon(e) {
  if (!crayon || crayonActive) return;
  crayonActive = true;
  document.body.classList.add('hide-cursor');
  // Move crayon to pointer position if available, else keep at center
  if (e && e.clientX && e.clientY) {
    moveCrayon(e.clientX, e.clientY);
  } else {
    moveCrayon(window.innerWidth / 2, window.innerHeight / 2);
  }
  crayon.style.display = 'block';
  crayon.classList.add('crayon-activated');
  // Animate crayon for tactile feedback
  crayon.classList.add('crayon-animate');
  setTimeout(() => crayon.classList.remove('crayon-animate'), 500);
  // Remove tab focus outline after activation
  crayon.blur && crayon.blur();
  // Announce activation in live region
  if (liveRegion) liveRegion.textContent = 'Crayon activated. You can now draw.';
  // Optionally, return focus to canvas for keyboard users
  if (e && e.type === 'keydown' && canvas) canvas.focus && canvas.focus();
}



/*******************************
 *  Draw Helper
 *******************************/
let hasDrawn = false;
function drawLine(x, y, fromX, fromY, color = DRAW_COLOR, width = DRAW_LINE_WIDTH) {
  if (!ctx) return;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  // Simulate crayon texture with alpha noise
  const steps = Math.max(2, Math.ceil(Math.hypot(x - fromX, y - fromY) / 2));
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const px = fromX + (x - fromX) * t + (Math.random() - 0.5) * 1.2; // jitter
    const py = fromY + (y - fromY) * t + (Math.random() - 0.5) * 1.2;
    ctx.globalAlpha = 0.7 + (Math.random() - 0.5) * 0.15; // subtle alpha noise
    ctx.beginPath();
    ctx.arc(px, py, width / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
  ctx.restore();
  // Announce first drawing action for accessibility
  if (!hasDrawn && liveRegion) {
    liveRegion.textContent = 'Drawing started.';
    hasDrawn = true;
  }
}

/*******************************
 *  Pointer Handlers
 *******************************/
// Throttle pointer move events (~30 FPS)
// Throttle pointer move events for performance (limits to ~30 FPS)
let lastMoveTime = 0;
function throttledPointerMove(e) {
  const now = Date.now();
  if (now - lastMoveTime < POINTER_THROTTLE_MS) return;
  lastMoveTime = now;
  handlePointerMove(e);
}

function handlePointerDown(e) {
  if (!crayonActive || !crayon) return;
  if (typeof e.clientX !== 'number' || typeof e.clientY !== 'number') return;
  // Prevent drawing outside canvas
  const rect = canvas.getBoundingClientRect();
  if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
  isDrawing = true;
  lastX = e.clientX;
  lastY = e.clientY;
  crayon.style.display = 'block';
  moveCrayon(e.clientX, e.clientY);
  playCrayonSound();
  // Animate crayon on drawing start
  crayon.classList.add('crayon-drawing');
  // console.log('Pointer down: drawing started.');
}

function handlePointerMove(e) {
  if (!crayon) return;
  if (typeof e.clientX !== 'number' || typeof e.clientY !== 'number') return;
  // Prevent drawing outside canvas
  const rect = canvas.getBoundingClientRect();
  if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
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
  if (!crayonActive || !crayon) return;
  isDrawing = false;
  pauseCrayonSound();
  checkCanvasColored();
  crayon.classList.remove('crayon-activated');
  // Animate crayon on drawing stop
  crayon.classList.remove('crayon-drawing');
  // Announce drawing stopped in live region
  if (liveRegion) liveRegion.textContent = 'Drawing stopped.';
  // Do NOT hide or remove crayon; keep it visible as custom cursor
  // console.log('Pointer up: drawing stopped.');
}

/*******************************
 *  Check How Much is Colored
 *******************************/
// Checks how much of the canvas has been colored with the crayon.
// Uses pixel skipping for performance and only counts pixels that exactly match the crayon's gray.
// When a poetic threshold is crossed, the portal emerges.
function isGray(r, g, b, tolerance = 10) {
  return (
    Math.abs(r - GRAY_COLOR) <= tolerance &&
    Math.abs(g - GRAY_COLOR) <= tolerance &&
    Math.abs(b - GRAY_COLOR) <= tolerance
  );
}

function updateProgressIndicator(percent) {
  const indicator = document.getElementById('progress-indicator');
  if (!indicator) return;
  const bar = indicator.querySelector('.progress-bar');
  const text = indicator.querySelector('.progress-text');
  // Circumference of the circle
  const r = 24;
  const circumference = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(100, percent));
  const dash = (progress / 100) * circumference;
  // Animate progress bar
  if (bar) {
    bar.style.transition = 'stroke-dasharray 0.5s cubic-bezier(0.4,0,0.2,1)';
    bar.setAttribute('stroke-dasharray', `${dash} ${circumference - dash}`);
  }
  if (text) {
    text.textContent = `${Math.round(progress)}% colored`;
    text.setAttribute('aria-valuenow', Math.round(progress));
  }
  // ARIA live feedback
  indicator.setAttribute('role', 'progressbar');
  indicator.setAttribute('aria-valuemin', '0');
  indicator.setAttribute('aria-valuemax', '100');
  indicator.setAttribute('aria-valuenow', Math.round(progress));
  // Announce progress in live region
  if (liveRegion) liveRegion.textContent = `Canvas ${Math.round(progress)} percent colored.`;
}


function checkCanvasColored() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let coloredPixels = 0;
  const totalPixels = canvas.width * canvas.height;

  // Skip some pixels for performance (tradeoff: less precision, much faster)
  const skipFactor = PIXEL_SKIP_FACTOR;
  for (let i = 0; i < imageData.length; i += 4 * skipFactor) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    if (isGray(r, g, b)) {
      coloredPixels++;
    }
  }

  const percentColored = (coloredPixels * skipFactor) / totalPixels * 100;
  updateProgressIndicator(percentColored);
  // Reveal portal if threshold crossed
  if (percentColored >= PORTAL_REVEAL_THRESHOLD) {
    showMirrorLink();
    const portal = document.getElementById('portal');
    const preview = document.getElementById('portal-preview');
    const fullscreen = document.getElementById('portal-fullscreen');
    // Defensive checks
    if (portal && portal.classList.contains('hidden')) {
      portal.classList.remove('hidden');
      portal.classList.add('visible');
      // Animate portal for magical effect
      portal.classList.add('portal-animate');
      setTimeout(() => portal.classList.remove('portal-animate'), 900);
    }
    if (preview && preview.classList.contains('hidden')) {
      preview.classList.remove('hidden');
      preview.classList.add('visible');
    }
    if (fullscreen && fullscreen.classList.contains('hidden')) {
      fullscreen.classList.remove('hidden');
      fullscreen.classList.add('visible');
    }
    // Announce portal emergence in live region
    if (liveRegion) liveRegion.textContent = 'A portal has emerged. Press Enter or click to explore.';
    // Optionally shift focus for accessibility
    if (portal) portal.focus && portal.focus();
    // console.log('Portal displayed after drawing threshold.');
  }
}

/*******************************
 *  Show Mirror Link with Scaling
 *******************************/
let portalRevealed = false;

function showMirrorLink() {
  if (portalRevealed) return;
  portalRevealed = true;

  // Robust DOM references
  const mirrorLink = document.getElementById('portal');
  const mirrorDiv = document.getElementById('portal-preview');
  const liveRegion = document.getElementById('portal-announcement');

  // Rule of thirds intersection points (as percentages)
  const thirds = [33.33, 66.66];
  const positions = [
    { left: thirds[0], top: thirds[0] }, // (1/3, 1/3)
    { left: thirds[0], top: thirds[1] }, // (1/3, 2/3)
    { left: thirds[1], top: thirds[0] }, // (2/3, 1/3)
    { left: thirds[1], top: thirds[1] }  // (2/3, 2/3)
  ];
  const chosen = positions[Math.floor(Math.random() * positions.length)];
  // Defensive checks and focusability
  if (mirrorLink) {
    mirrorLink.style.left = `${chosen.left}%`;
    mirrorLink.style.top = `${chosen.top}%`;
    mirrorLink.classList.add('active');
    mirrorLink.style.pointerEvents = 'auto';
    mirrorLink.setAttribute('tabindex', '0'); // Make focusable
    mirrorLink.focus && mirrorLink.focus();
  }
  if (mirrorDiv) {
    mirrorDiv.classList.add('mirror-glow');
  }
  // Accessibility: announce portal emergence and position
  if (liveRegion) {
    let posDesc = '';
    if (chosen.left < 50 && chosen.top < 50) posDesc = 'upper left';
    else if (chosen.left < 50 && chosen.top > 50) posDesc = 'lower left';
    else if (chosen.left > 50 && chosen.top < 50) posDesc = 'upper right';
    else posDesc = 'lower right';
    liveRegion.textContent = `The portal has appeared at the ${posDesc}.`;
  }
}

/*******************************
 *  Move Crayon (Cursor)
 *******************************/
function moveCrayon(x, y) {
  if (!crayon) return;
  // Animate crayon cursor on move
  crayon.classList.add('crayon-move-animate');
  setTimeout(() => crayon.classList.remove('crayon-move-animate'), 220);
  // Keep crayon centered on pointer
  crayon.style.left = `${x - crayon.offsetWidth / 2}px`;
  crayon.style.top = `${y - crayon.offsetHeight / 2}px`;
}


/*******************************
 *  Move Crayon (Cursor)
 *******************************/


/*******************************
 *  Register Pointer Events
 *******************************/
// Register pointer events only if canvas exists
if (canvas) {
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', throttledPointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);
  // Also pause sound if pointer leaves canvas
  canvas.addEventListener('pointerleave', () => {
    pauseCrayonSound();
    if (liveRegion) liveRegion.textContent = 'Drawing paused: pointer left the canvas.';
  });
}
// Pause sound and announce if window loses focus
window.addEventListener('blur', () => {
  pauseCrayonSound();
  if (liveRegion) liveRegion.textContent = 'Drawing paused: window lost focus.';
});

/*******************************
 *  Portal Ambient Hum
 *******************************/
const portalHum = new Audio(HUM_SOUND_FILE);
portalHum.loop = true;
portalHum.preload = 'auto';
portalHum.volume = 0;
let portalHumFadeRAF = null;
let portalHumTarget = 0;
let portalHumMuted = false;

function fadeAmbientHum(direction) {
  if (portalHumFadeRAF) {
    cancelAnimationFrame(portalHumFadeRAF);
    portalHumFadeRAF = null;
  }
  if (portalHumMuted) {
    portalHum.volume = 0;
    portalHum.pause();
    return;
  }
  let v = portalHum.volume;
  const target = direction === 'in' ? HUM_SOUND_VOLUME : 0;
  portalHumTarget = target;
  const step = direction === 'in' ? HUM_FADE_STEP : 0.03;
  if (direction === 'in') {
    portalHum.currentTime = 0;
    if (portalHum.paused) portalHum.play().catch(() => {});
  }
  function fade() {
    if (direction === 'in' && v < target) {
      v = Math.min(target, v + step);
      portalHum.volume = v;
      portalHumFadeRAF = requestAnimationFrame(fade);
    } else if (direction === 'out' && v > target) {
      v = Math.max(target, v - step);
      portalHum.volume = v;
      portalHumFadeRAF = requestAnimationFrame(fade);
    } else {
      portalHum.volume = target;
      if (direction === 'out') portalHum.pause();
      portalHumFadeRAF = null;
    }
  }
  fade();
}
function fadeInHum() { fadeAmbientHum('in'); }
function fadeOutHum() { fadeAmbientHum('out'); }

// Add mute toggle for accessibility


// Portal interaction logic
const portal = document.getElementById('portal');
const preview = document.getElementById('portal-preview');
const fullscreen = document.getElementById('portal-fullscreen');
const closeBtn = document.getElementById('portal-close');

let lastActiveElement = null;

function showPreview() {
  if (!preview) return;
  preview.setAttribute('aria-hidden', 'false');
  preview.setAttribute('role', 'dialog');
  preview.setAttribute('aria-modal', 'true');
  preview.classList.add('active', 'dialog-animate');
  setTimeout(() => preview.classList.remove('dialog-animate'), 400);
  lastActiveElement = document.activeElement;
  preview.setAttribute('tabindex', '-1');
  preview.focus();
  // Announce dialog open
  if (liveRegion) liveRegion.textContent = 'Portal preview opened.';
  trapFocus(preview);
}
function hidePreview() {
  if (!preview) return;
  preview.setAttribute('aria-hidden', 'true');
  preview.classList.remove('active');
  if (lastActiveElement) lastActiveElement.focus();
  // Announce dialog close
  if (liveRegion) liveRegion.textContent = 'Portal preview closed.';
}
function showFullscreen() {
  if (!fullscreen || !closeBtn) return;
  fullscreen.setAttribute('aria-hidden', 'false');
  fullscreen.setAttribute('role', 'dialog');
  fullscreen.setAttribute('aria-modal', 'true');
  fullscreen.classList.add('active', 'dialog-animate');
  setTimeout(() => fullscreen.classList.remove('dialog-animate'), 400);
  lastActiveElement = document.activeElement;
  fullscreen.setAttribute('tabindex', '-1');
  fullscreen.focus();
  closeBtn.focus();
  document.body.style.overflow = 'hidden';
  // Announce dialog open
  if (liveRegion) liveRegion.textContent = 'Portal fullscreen opened.';
  trapFocus(fullscreen);
}
function hideFullscreen() {
  if (!fullscreen || !portal) return;
  fullscreen.setAttribute('aria-hidden', 'true');
  fullscreen.classList.remove('active');
  document.body.style.overflow = '';
  if (lastActiveElement) lastActiveElement.focus();
  // Announce dialog close
  if (liveRegion) liveRegion.textContent = 'Portal fullscreen closed.';
}

// Keyboard activation for portal
if (portal) {
  portal.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showFullscreen();
      fadeOutHum();
    }
  });
}

// ESC closes preview/fullscreen
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (fullscreen && fullscreen.classList.contains('active')) {
      hideFullscreen();
    } else if (preview && preview.classList.contains('active')) {
      hidePreview();
    }
  }
});

// Trap Tab focus in fullscreen dialog
if (fullscreen) {
  fullscreen.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      const focusable = fullscreen.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusable || focusable.length === 0) {
        e.preventDefault();
        return;
      }
      // Ensure ARIA labels for focusable elements
      focusable.forEach(el => {
        if (!el.hasAttribute('aria-label') && el.textContent) {
          el.setAttribute('aria-label', el.textContent.trim());
        }
      });
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    // Announce dialog focus for accessibility
    if (e.key === 'Tab' && liveRegion) {
      liveRegion.textContent = 'Portal dialog focused.';
    }
  });
}


if (portal) {
  let portalActivated = false;
  const liveRegion = document.getElementById('portal-announcement');
  function activatePortal() {
    if (portalActivated) return;
    portalActivated = true;
    portal.classList.remove('blooming');
    showFullscreen();
    fadeOutHum();
    if (liveRegion) liveRegion.textContent = 'Portal activated.';
    setTimeout(() => { portalActivated = false; }, 1000); // allow re-activation after 1s
  }
  portal.addEventListener('mouseenter', () => {
    portal.classList.add('blooming');
  });
  portal.addEventListener('focus', () => {
    if (liveRegion) liveRegion.textContent = 'Portal focused.';
  
    portal.classList.add('blooming');
  });
  portal.addEventListener('mouseleave', () => {
    portal.classList.remove('blooming');
  });
  portal.addEventListener('blur', () => {
    portal.classList.remove('blooming');
    if (liveRegion) liveRegion.textContent = 'Portal lost focus.';
  });
  portal.addEventListener('click', e => {
    activatePortal();
  });
}
// Remove blooming class on fullscreen close, too
function hideFullscreen() {
  if (!fullscreen || !portal) return;
  fullscreen.setAttribute('aria-hidden', 'true');
  fullscreen.classList.remove('active');
  document.body.style.overflow = '';
  portal.classList.remove('blooming');
  if (lastActiveElement) lastActiveElement.focus();
}


if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    hideFullscreen();
    // Announce portal close for accessibility
    if (liveRegion) liveRegion.textContent = 'Portal closed.';
    // Hum will resume only if user hovers/focuses again
  });
}
// Robust Tab trap for fullscreen dialog is already implemented above (see Tab trap logic)


// console.log('Script loaded.');
