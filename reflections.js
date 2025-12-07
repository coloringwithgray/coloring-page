/*******************************
 *  REFLECTIONS PAGE SCRIPT
 *******************************/

// Animation Constants
const ANIMATION_CONFIG = {
  FREEZE_DURATION: 600, // milliseconds - realistic crack spreading time
  FALL_START_DELAY: 200, // milliseconds - brief pause before shatter
  TOTAL_DURATION: 3200, // milliseconds
  EMERGE_START_TIME: 2600, // milliseconds
  FRAGMENT_COUNT: 40,
  GRID_COLS: 8,
  GRID_ROWS: 5,
  INITIAL_SCALE: 0.05,
  EMERGE_DURATION: 3500, // milliseconds
  NUM_RADIAL_CRACKS: 12, // Number of main cracks radiating from impact
  NUM_SECONDARY_CRACKS: 20 // Number of connecting cracks
};

// DOM References
const loadingScreen = document.getElementById('loading-screen');
const reflectionImage = document.getElementById('reflection-image');
const shatterCanvas = document.getElementById('shatter-canvas');
const bottleCartContainer = document.getElementById('bottle-cart-container');
const videoModal = document.getElementById('video-modal');
const videoIframe = document.getElementById('video-iframe');
const videoCloseBtn = document.getElementById('video-close-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const addToCartBtn = document.getElementById('add-to-cart-btn');

// Hotspot references
const bottleHotspot = document.getElementById('bottle-hotspot');
const crackGlow = document.getElementById('crack-glow');
const womanHotspot = document.getElementById('woman-hotspot');
const womanCrackGlow = document.getElementById('woman-crack-glow');

// Audio references
const lightHumAudio = document.getElementById('light-hum-audio');
const glassShatterAudio = document.getElementById('glass-shatter-audio');

// Set audio volumes
lightHumAudio.volume = 0.6;
glassShatterAudio.volume = 0.8;

// Debug audio loading and prime audio for instant playback
lightHumAudio.addEventListener('canplaythrough', () => {
  console.log('Light hum audio loaded and ready');
  // Prime the audio by playing and immediately pausing - eliminates delay
  lightHumAudio.play().then(() => {
    lightHumAudio.pause();
    lightHumAudio.currentTime = 0;
  }).catch(err => console.log('Audio priming prevented (normal on some browsers):', err));
  assetsLoaded.audioHum = true;
  checkAllAssetsLoaded();
});
lightHumAudio.addEventListener('error', (e) => {
  console.error('Light hum audio failed to load:', e);
  assetsLoaded.audioHum = true; // Continue anyway
  checkAllAssetsLoaded();
});
glassShatterAudio.addEventListener('canplaythrough', () => {
  console.log('Glass shatter audio loaded and ready');
  // Prime the audio by playing and immediately pausing - eliminates delay
  glassShatterAudio.play().then(() => {
    glassShatterAudio.pause();
    glassShatterAudio.currentTime = 0;
  }).catch(err => console.log('Audio priming prevented (normal on some browsers):', err));
  assetsLoaded.audioShatter = true;
  checkAllAssetsLoaded();
});
glassShatterAudio.addEventListener('error', (e) => {
  console.error('Glass shatter audio failed to load:', e);
  assetsLoaded.audioShatter = true; // Continue anyway
  checkAllAssetsLoaded();
});

// Canvas setup with error checking
let ctx;
try {
  ctx = shatterCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }
} catch (error) {
  console.error('Canvas not supported:', error);
  alert('Your browser does not support canvas. Please use a modern browser.');
}

let shatterFragments = [];
let crackLines = []; // Realistic crack lines
let capturedImage = null;

// Memory pools for reuse (avoid garbage collection)
const crackLinePool = [];
const fragmentPool = [];
const MAX_POOL_SIZE = 100;

// Animation state management
let isAnimating = false;
let animationStartTime = null;
let hasEmerged = false;

// Memory pool helper functions
function getCrackLineFromPool() {
  if (crackLinePool.length > 0) {
    return crackLinePool.pop();
  }
  return { points: [], delay: 0, type: '' };
}

function returnCrackLineToPool(crackLine) {
  if (crackLinePool.length < MAX_POOL_SIZE) {
    crackLine.points = [];
    crackLine.delay = 0;
    crackLine.type = '';
    crackLinePool.push(crackLine);
  }
}

function getFragmentFromPool() {
  if (fragmentPool.length > 0) {
    return fragmentPool.pop();
  }
  return {
    vertices: [],
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rotation: 0,
    rotationSpeed: 0,
    opacity: 0,
    fadeSpeed: 0,
    scale: 0
  };
}

function returnFragmentToPool(fragment) {
  if (fragmentPool.length < MAX_POOL_SIZE) {
    fragment.vertices = [];
    fragmentPool.push(fragment);
  }
}

// Resize canvas to match window
function resizeCanvas() {
  shatterCanvas.width = window.innerWidth;
  shatterCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Asset loading management
let assetsLoaded = {
  image: false,
  audioHum: false,
  audioShatter: false
};

function checkAllAssetsLoaded() {
  console.log('Asset loading status:', assetsLoaded);
  const allLoaded = Object.values(assetsLoaded).every(loaded => loaded);
  if (allLoaded) {
    console.log('All assets loaded successfully');
    hideLoadingScreen();
  }
}

function hideLoadingScreen() {
  setTimeout(() => {
    loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }, 300); // Brief delay to ensure smooth transition
}

// Fallback: Force hide loading screen after 8 seconds on mobile (in case assets fail)
setTimeout(() => {
  if (loadingScreen && loadingScreen.style.display !== 'none') {
    console.warn('Loading screen timeout - forcing hide after 8 seconds');
    hideLoadingScreen();
  }
}, 8000);

// Load audio after page is visible (saves ~244KB on initial load)
function loadAudioLazy() {
  console.log('Loading audio files...');
  lightHumAudio.load();
  glassShatterAudio.load();
}

// Cache image on page load
window.addEventListener('load', () => {
  // Check if reflection image loaded successfully
  if (reflectionImage.complete && reflectionImage.naturalHeight !== 0) {
    captureReflectionImage().then(canvas => {
      capturedImage = canvas;
      assetsLoaded.image = true;
      console.log('Reflection image cached successfully');
      checkAllAssetsLoaded();
      // Load audio after main image is ready
      setTimeout(loadAudioLazy, 500);
    }).catch(err => {
      console.error('Failed to cache reflection image:', err);
      assetsLoaded.image = true; // Continue anyway
      checkAllAssetsLoaded();
      setTimeout(loadAudioLazy, 500);
    });
  } else {
    console.error('Reflection image failed to load');
    reflectionImage.addEventListener('error', () => {
      assetsLoaded.image = true; // Continue anyway
      checkAllAssetsLoaded();
      setTimeout(loadAudioLazy, 500);
    });
  }

  // Add error handling for video iframe
  videoIframe.addEventListener('error', () => {
    console.error('Video failed to load');
  });
});

// Capture the reflection image for use in shatter fragments
function captureReflectionImage() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Don't use crossOrigin for local files
    img.onload = () => {
      try {
        // Create a temporary canvas to capture the image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = window.innerWidth;
        tempCanvas.height = window.innerHeight;
        const tempCtx = tempCanvas.getContext('2d');

        // Calculate how to fit the image (object-fit: contain)
        const imgRatio = img.width / img.height;
        const windowRatio = window.innerWidth / window.innerHeight;
        let drawWidth, drawHeight, drawX, drawY;

        if (windowRatio > imgRatio) {
          // Window is wider - fit by height
          drawHeight = window.innerHeight;
          drawWidth = drawHeight * imgRatio;
          drawX = (window.innerWidth - drawWidth) / 2;
          drawY = 0;
        } else {
          // Window is taller - fit by width
          drawWidth = window.innerWidth;
          drawHeight = drawWidth / imgRatio;
          drawX = 0;
          drawY = (window.innerHeight - drawHeight) / 2;
        }

        tempCtx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        resolve(tempCanvas);
      } catch (error) {
        console.error('Error capturing image:', error);
        reject(error);
      }
    };
    img.onerror = (error) => {
      console.error('Error loading image:', error);
      reject(error);
    };
    img.src = reflectionImage.src;
  });
}

/*******************************
 *  SHATTER SYSTEM - WORKS FOR BOTH BOTTLE AND WOMAN
 *******************************/

let shatterTarget = null; // 'bottle' or 'woman'

async function initiateShatter(target) {
  // Prevent overlapping animations
  if (isAnimating) {
    console.log('Animation already in progress, ignoring click');
    return;
  }

  // Check canvas support
  if (!ctx) {
    console.error('Canvas not available, cannot animate');
    return;
  }

  // Start loading bottle image now if targeting bottle (gives 3+ seconds to load during animation)
  if (target === 'bottle') {
    const bottleImg = document.getElementById('emerged-bottle');
    if (bottleImg && bottleImg.hasAttribute('data-src')) {
      console.log('Preloading bottle image during shatter animation...');
      bottleImg.src = bottleImg.getAttribute('data-src');
      bottleImg.removeAttribute('data-src');
    }
  }

  // Stop light hum and play shatter sound IMMEDIATELY
  lightHumAudio.pause();
  lightHumAudio.currentTime = 0;
  glassShatterAudio.currentTime = 0;
  glassShatterAudio.play().catch(err => console.log('Audio play prevented:', err));

  isAnimating = true;
  shatterTarget = target;
  hasEmerged = false;

  try {
    console.log(`Starting shatter animation for: ${target}`);

    // Use cached image if available, otherwise capture
    if (!capturedImage) {
      console.log('Image not cached, capturing now...');
      capturedImage = await captureReflectionImage();
    }
    console.log('Image ready for shatter');

    // Activate shatter canvas
    shatterCanvas.classList.add('active');

    // Create realistic crack lines
    createRealisticCracks();

    // Create shatter fragments
    createShatterFragments();

    // Start animation with timestamp
    animationStartTime = performance.now();
    animateShatter();
  } catch (error) {
    console.error('Error in shatter animation:', error);
    isAnimating = false;
    alert('Shatter animation failed. Please refresh and try again.');
  }
}

function createRealisticCracks() {
  // Return old crack lines to pool
  crackLines.forEach(crack => returnCrackLineToPool(crack));
  crackLines = [];

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // Dynamically calculate impact point from crack glow position
  // This ensures cracks originate from the correct spot on all screen sizes
  const glowElement = shatterTarget === 'bottle' ? crackGlow : womanCrackGlow;
  const glowRect = glowElement.getBoundingClientRect();
  const impactX = glowRect.left + (glowRect.width / 2);
  const impactY = glowRect.top + (glowRect.height / 2);

  // Create radial cracks emanating from impact point
  for (let i = 0; i < ANIMATION_CONFIG.NUM_RADIAL_CRACKS; i++) {
    const angle = (Math.PI * 2 * i) / ANIMATION_CONFIG.NUM_RADIAL_CRACKS + (Math.random() - 0.5) * 0.3;
    const length = Math.max(canvasWidth, canvasHeight) * (0.7 + Math.random() * 0.5);

    // Create segments for this crack line (for progressive drawing)
    const segments = 8;
    const points = [{ x: impactX, y: impactY }];

    for (let j = 1; j <= segments; j++) {
      const progress = j / segments;
      const wobble = Math.sin(progress * Math.PI * 4) * (Math.random() * 30 + 20);
      const perpAngle = angle + Math.PI / 2;

      const x = impactX + Math.cos(angle) * length * progress + Math.cos(perpAngle) * wobble;
      const y = impactY + Math.sin(angle) * length * progress + Math.sin(perpAngle) * wobble;

      points.push({ x, y });
    }

    const crack = getCrackLineFromPool();
    crack.points = points;
    crack.delay = i * 30;
    crack.type = 'radial';
    crackLines.push(crack);
  }

  // Create secondary connecting cracks
  for (let i = 0; i < ANIMATION_CONFIG.NUM_SECONDARY_CRACKS; i++) {
    // Pick random points along existing radial cracks
    const crack1 = crackLines[Math.floor(Math.random() * crackLines.length)];
    const crack2 = crackLines[Math.floor(Math.random() * crackLines.length)];

    if (crack1 === crack2) continue;

    const point1Index = Math.floor(Math.random() * crack1.points.length);
    const point2Index = Math.floor(Math.random() * crack2.points.length);

    const p1 = crack1.points[point1Index];
    const p2 = crack2.points[point2Index];

    // Create curved connecting line
    const midX = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 50;
    const midY = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 50;

    const crack = getCrackLineFromPool();
    crack.points = [p1, { x: midX, y: midY }, p2];
    crack.delay = 200 + i * 20;
    crack.type = 'secondary';
    crackLines.push(crack);
  }
}

function createShatterFragments() {
  // Return old fragments to pool
  shatterFragments.forEach(fragment => returnFragmentToPool(fragment));
  shatterFragments = [];

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  // Create a grid-like distribution with randomness (like actual glass breaking)
  const cellWidth = canvasWidth / ANIMATION_CONFIG.GRID_COLS;
  const cellHeight = canvasHeight / ANIMATION_CONFIG.GRID_ROWS;

  for (let i = 0; i < ANIMATION_CONFIG.FRAGMENT_COUNT; i++) {
    // Grid-based position with randomness
    const col = i % ANIMATION_CONFIG.GRID_COLS;
    const row = Math.floor(i / ANIMATION_CONFIG.GRID_COLS);
    const x = col * cellWidth + cellWidth / 2 + (Math.random() - 0.5) * cellWidth * 0.5;
    const y = row * cellHeight + cellHeight / 2 + (Math.random() - 0.5) * cellHeight * 0.5;

    // Get fragment from pool and set properties
    const fragment = getFragmentFromPool();
    fragment.vertices = [
      { x: (Math.random() - 0.5) * cellWidth * 0.8, y: (Math.random() - 0.5) * cellHeight * 0.8 },
      { x: (Math.random() - 0.5) * cellWidth * 0.8, y: (Math.random() - 0.5) * cellHeight * 0.8 },
      { x: (Math.random() - 0.5) * cellWidth * 0.8, y: (Math.random() - 0.5) * cellHeight * 0.8 },
      { x: (Math.random() - 0.5) * cellWidth * 0.8, y: (Math.random() - 0.5) * cellHeight * 0.8 }
    ];
    fragment.startX = x;
    fragment.startY = y;
    fragment.x = x;
    fragment.y = y;
    fragment.vx = (Math.random() - 0.5) * 2;
    fragment.vy = 0;
    fragment.rotation = Math.random() * Math.PI * 2;
    fragment.rotationSpeed = (Math.random() - 0.5) * 0.12;
    fragment.opacity = 0.9;
    fragment.fadeSpeed = 0.012 + Math.random() * 0.008;
    fragment.scale = 0.8 + Math.random() * 0.4;

    shatterFragments.push(fragment);
  }
}

function animateShatter() {
  function render(currentTime) {
    const elapsed = currentTime - animationStartTime;

    // Phase 1: FREEZE - Realistic crack lines spreading
    if (elapsed <= ANIMATION_CONFIG.FREEZE_DURATION) {
      // Clear and draw full image as background
      ctx.clearRect(0, 0, shatterCanvas.width, shatterCanvas.height);
      ctx.drawImage(capturedImage, 0, 0);

      // Draw realistic crack lines
      crackLines.forEach(crack => {
        if (elapsed < crack.delay) return;

        const crackElapsed = elapsed - crack.delay;
        const crackDuration = ANIMATION_CONFIG.FREEZE_DURATION - crack.delay;
        const crackProgress = Math.min(1, crackElapsed / crackDuration);

        // Draw progressive crack line
        const pointsToDraw = Math.floor(crack.points.length * crackProgress);
        if (pointsToDraw < 2) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(crack.points[0].x, crack.points[0].y);

        for (let i = 1; i < pointsToDraw; i++) {
          ctx.lineTo(crack.points[i].x, crack.points[i].y);
        }

        // Realistic crack styling
        ctx.strokeStyle = `rgba(255, 255, 255, 0.9)`;
        ctx.lineWidth = crack.type === 'radial' ? 2 : 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Subtle shadow for depth
        ctx.strokeStyle = `rgba(0, 0, 0, 0.3)`;
        ctx.lineWidth = crack.type === 'radial' ? 1 : 0.5;
        ctx.stroke();

        ctx.restore();
      });
    }
    // Phase 1.5: PAUSE - Hold fully cracked image before shatter
    else if (elapsed <= ANIMATION_CONFIG.FREEZE_DURATION + ANIMATION_CONFIG.FALL_START_DELAY) {
      // Clear and draw full image as background
      ctx.clearRect(0, 0, shatterCanvas.width, shatterCanvas.height);
      ctx.drawImage(capturedImage, 0, 0);

      // Draw all crack lines at full opacity
      crackLines.forEach(crack => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(crack.points[0].x, crack.points[0].y);

        for (let i = 1; i < crack.points.length; i++) {
          ctx.lineTo(crack.points[i].x, crack.points[i].y);
        }

        // Full opacity cracks
        ctx.strokeStyle = `rgba(255, 255, 255, 0.9)`;
        ctx.lineWidth = crack.type === 'radial' ? 2 : 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Subtle shadow for depth
        ctx.strokeStyle = `rgba(0, 0, 0, 0.3)`;
        ctx.lineWidth = crack.type === 'radial' ? 1 : 0.5;
        ctx.stroke();

        ctx.restore();
      });
    }
    // Phase 2: FALL - Floor drops out, everything falls
    else {
      // Fade background to black as fragments fall
      const fallDuration = ANIMATION_CONFIG.TOTAL_DURATION - (ANIMATION_CONFIG.FREEZE_DURATION + ANIMATION_CONFIG.FALL_START_DELAY);
      const fallElapsed = elapsed - (ANIMATION_CONFIG.FREEZE_DURATION + ANIMATION_CONFIG.FALL_START_DELAY);
      const fallProgress = Math.max(0, fallElapsed / fallDuration);
      const bgOpacity = Math.min(1, fallProgress * 1.2);
      ctx.fillStyle = `rgba(0, 0, 0, ${bgOpacity})`;
      ctx.fillRect(0, 0, shatterCanvas.width, shatterCanvas.height);

      // Draw and update falling fragments
      shatterFragments.forEach(fragment => {
        if (fragment.opacity <= 0) return;

        ctx.save();
        ctx.translate(fragment.x, fragment.y);
        ctx.rotate(fragment.rotation);
        ctx.scale(fragment.scale, fragment.scale);

        // Create clipping path for jagged fragment
        ctx.beginPath();
        ctx.moveTo(fragment.vertices[0].x, fragment.vertices[0].y);
        fragment.vertices.forEach(v => {
          ctx.lineTo(v.x, v.y);
        });
        ctx.closePath();
        ctx.clip();

        // Draw the actual image piece
        ctx.globalAlpha = fragment.opacity;
        const offsetX = -fragment.x;
        const offsetY = -fragment.y;
        ctx.drawImage(capturedImage, offsetX, offsetY);

        // Add subtle glass shine overlay
        ctx.globalAlpha = fragment.opacity * 0.15;
        const gradient = ctx.createLinearGradient(-50, -50, 50, 50);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();

        // Draw sharp edges outside of clip
        ctx.save();
        ctx.translate(fragment.x, fragment.y);
        ctx.rotate(fragment.rotation);
        ctx.scale(fragment.scale, fragment.scale);

        ctx.beginPath();
        ctx.moveTo(fragment.vertices[0].x, fragment.vertices[0].y);
        fragment.vertices.forEach(v => {
          ctx.lineTo(v.x, v.y);
        });
        ctx.closePath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${fragment.opacity * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

        // Update physics - accelerating downward fall
        fragment.x += fragment.vx;
        fragment.y += fragment.vy;
        fragment.vy += 0.6; // Strong gravity - floor dropped out
        fragment.rotation += fragment.rotationSpeed;

        // Fade faster as they fall off screen
        if (fragment.y > shatterCanvas.height * 0.7) {
          fragment.opacity -= fragment.fadeSpeed * 2;
        } else {
          fragment.opacity -= fragment.fadeSpeed * 0.5;
        }
      });
    }

    // Start emergence before shatter completes
    if (elapsed >= ANIMATION_CONFIG.EMERGE_START_TIME && !hasEmerged) {
      hasEmerged = true;
      if (shatterTarget === 'bottle') {
        showBottleCart();
      } else if (shatterTarget === 'woman') {
        openVideoModal();
      }
    }

    // Continue animation or finish
    if (elapsed < ANIMATION_CONFIG.TOTAL_DURATION) {
      requestAnimationFrame(render);
    } else {
      // Shatter complete - pure black
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, shatterCanvas.width, shatterCanvas.height);
      isAnimating = false;
    }
  }

  requestAnimationFrame(render);
}

function showBottleCart() {
  bottleCartContainer.style.display = 'flex';
  // Trigger reflow for transition
  bottleCartContainer.offsetHeight;
  bottleCartContainer.classList.add('visible');

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Focus management - focus close button
  setTimeout(() => {
    closeCartBtn.focus();
  }, 100);
}

/*******************************
 *  WOMAN HOTSPOT - VIDEO MODAL
 *******************************/

function openVideoModal() {
  // Set video source (Placeholder - user will add Vimeo URL later)
  videoIframe.src = 'https://player.vimeo.com/video/PLACEHOLDER?h=PLACEHOLDER&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1';

  videoModal.style.display = 'flex';
  // Trigger reflow for transition
  videoModal.offsetHeight;
  videoModal.classList.add('visible');

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Focus management - focus close button
  setTimeout(() => {
    videoCloseBtn.focus();
  }, 100);
}

videoCloseBtn.addEventListener('click', () => {
  closeVideoModal();
});

function closeVideoModal() {
  videoModal.classList.remove('visible');

  // Restore body scroll
  document.body.style.overflow = '';

  setTimeout(() => {
    videoModal.style.display = 'none';
    videoIframe.src = ''; // Stop video

    // Reset page state
    shatterCanvas.classList.remove('active');
    if (ctx) {
      ctx.clearRect(0, 0, shatterCanvas.width, shatterCanvas.height);
    }

    // Return objects to pools
    shatterFragments.forEach(fragment => returnFragmentToPool(fragment));
    crackLines.forEach(crack => returnCrackLineToPool(crack));
    shatterFragments = [];
    crackLines = [];

    isAnimating = false;
    hasEmerged = false;
  }, 800);
}

/*******************************
 *  STRIPE PAYMENT INTEGRATION
 *******************************/

// Initialize Stripe
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SaiyeEPtwmOzHy2hCtVWjeg7tGi78DHj76SWvlOoLif3JWgKMiORP2xXQXw42QpkvWsCpGlbbFCW1f1RPVRNwng00D6IvwXWL';
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

// Payment state
let elements;
let paymentElement;
let paymentRequest;
let prButton; // Store payment request button reference
let clientSecret;

// Initialize payment when buttons are clicked
async function initializePayment() {
  try {
    // Fetch client secret from serverless function
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment intent error details:', errorData);
      throw new Error(errorData.details || errorData.error || 'Failed to create payment intent');
    }

    const data = await response.json();
    clientSecret = data.clientSecret;

    // Create Stripe Elements instance
    const appearance = {
      theme: 'night',
      variables: {
        colorPrimary: '#ffffff',
        colorBackground: '#1a1a1a',
        colorText: '#ffffff',
        colorDanger: '#ff6b6b',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    };

    elements = stripe.elements({ appearance, clientSecret });

    // Create and mount Payment Element
    paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');

    // Setup Payment Request Button (Apple Pay / Google Pay)
    setupPaymentRequest();

    return true;
  } catch (error) {
    console.error('Payment initialization error:', error);
    showPaymentMessage('Failed to initialize payment. Please try again.', 'error');
    return false;
  }
}

// Setup Apple Pay / Google Pay via Payment Request API
function setupPaymentRequest() {
  paymentRequest = stripe.paymentRequest({
    country: 'US',
    currency: 'usd',
    total: {
      label: 'Reflections Of You',
      amount: 32400, // $324.00 in cents
    },
    requestPayerName: true,
    requestPayerEmail: true,
  });

  prButton = elements.create('paymentRequestButton', {
    paymentRequest,
  });

  // Check if Apple Pay / Google Pay is available
  paymentRequest.canMakePayment().then((result) => {
    if (result) {
      prButton.mount('#payment-request-button');
      document.getElementById('or-divider').style.display = 'block';
    } else {
      // Hide the payment request button if not available
      document.getElementById('payment-request-button').style.display = 'none';
      document.getElementById('or-divider').style.display = 'none';
    }
  });

  // Handle payment confirmation for Apple Pay / Google Pay
  paymentRequest.on('paymentmethod', async (ev) => {
    try {
      const { error: confirmError } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          payment_method: ev.paymentMethod.id,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        ev.complete('fail');
        showPaymentMessage(confirmError.message, 'error');
      } else {
        ev.complete('success');
        handlePaymentSuccess();
      }
    } catch (error) {
      ev.complete('fail');
      showPaymentMessage('Payment failed. Please try again.', 'error');
    }
  });
}

// Handle form submission
const paymentForm = document.getElementById('payment-form');
paymentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  setPaymentLoading(true);

  try {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/payment-success.html', // Optional success page
      },
      redirect: 'if_required',
    });

    if (error) {
      showPaymentMessage(error.message, 'error');
      setPaymentLoading(false);
    } else {
      // Payment succeeded
      handlePaymentSuccess();
    }
  } catch (error) {
    console.error('Payment error:', error);
    showPaymentMessage('An unexpected error occurred.', 'error');
    setPaymentLoading(false);
  }
});

// Show payment success
function handlePaymentSuccess() {
  showPaymentMessage('Payment successful! Thank you for your purchase.', 'success');
  setPaymentLoading(false);

  // Optional: Close modal after delay
  setTimeout(() => {
    closeCart();
  }, 3000);
}

// Show payment message
function showPaymentMessage(message, type = 'error') {
  const messageDiv = document.getElementById('payment-message');
  messageDiv.textContent = message;
  messageDiv.className = `payment-message ${type}`;
}

// Set loading state
function setPaymentLoading(isLoading) {
  const submitButton = document.getElementById('submit-payment');
  const buttonText = document.getElementById('button-text');
  const spinner = document.getElementById('spinner');

  if (isLoading) {
    submitButton.disabled = true;
    buttonText.style.display = 'none';
    spinner.style.display = 'inline-block';
  } else {
    submitButton.disabled = false;
    buttonText.style.display = 'inline';
    spinner.style.display = 'none';
  }
}

/*******************************
 *  CART ACTIONS
 *******************************/
closeCartBtn.addEventListener('click', () => {
  closeCart();
});

function closeCart() {
  bottleCartContainer.classList.remove('visible');

  // Restore body scroll
  document.body.style.overflow = '';

  // Hide payment form and show initial buttons again
  document.getElementById('payment-form-container').style.display = 'none';
  document.getElementById('initial-buttons').style.display = 'flex';

  setTimeout(() => {
    bottleCartContainer.style.display = 'none';

    // Reset page state
    shatterCanvas.classList.remove('active');
    if (ctx) {
      ctx.clearRect(0, 0, shatterCanvas.width, shatterCanvas.height);
    }

    // Return objects to pools
    shatterFragments.forEach(fragment => returnFragmentToPool(fragment));
    crackLines.forEach(crack => returnCrackLineToPool(crack));
    shatterFragments = [];
    crackLines = [];

    isAnimating = false;
    hasEmerged = false;
  }, 800);
}

// Handle "Buy Now" (cart button) - shows full payment form with all options including Apple Pay
addToCartBtn.addEventListener('click', async (e) => {
  console.log('Cart button clicked!');

  // Show payment form container immediately (don't wait for payment init)
  console.log('Opening payment form...');
  document.getElementById('initial-buttons').style.display = 'none';
  document.getElementById('payment-form-container').style.display = 'block';

  // Initialize payment if not already done
  if (!elements) {
    console.log('Initializing payment...');
    const initialized = await initializePayment();
    if (!initialized) {
      console.error('Payment initialization failed - showing error in form');
      showPaymentMessage('Unable to load payment form. Please check your Stripe configuration.', 'error');
      return;
    }
    console.log('Payment initialized successfully');
  }
});

/*******************************
 *  HOTSPOT INTERACTIONS
 *******************************/
// Bottle hotspot - triggers shatter animation
bottleHotspot.addEventListener('click', () => {
  console.log('Bottle hotspot clicked!');
  initiateShatter('bottle');
});

// Optional: Add touch support for mobile
bottleHotspot.addEventListener('touchend', (e) => {
  e.preventDefault(); // Prevent double-firing on mobile
  console.log('Bottle hotspot touched!');
  initiateShatter('bottle');
});

// Hover effect - show crack glow and play hum
bottleHotspot.addEventListener('mouseenter', () => {
  console.log('Bottle hotspot hovered - playing hum');
  crackGlow.classList.add('active');
  lightHumAudio.play().catch(err => console.error('Audio play prevented:', err));
});

bottleHotspot.addEventListener('mouseleave', () => {
  crackGlow.classList.remove('active');
  lightHumAudio.pause();
  lightHumAudio.currentTime = 0;
});

// Woman hotspot - triggers shatter animation and video modal
womanHotspot.addEventListener('click', () => {
  console.log('Woman hotspot clicked!');
  initiateShatter('woman');
});

// Optional: Add touch support for mobile
womanHotspot.addEventListener('touchend', (e) => {
  e.preventDefault(); // Prevent double-firing on mobile
  console.log('Woman hotspot touched!');
  initiateShatter('woman');
});

// Hover effect - show crack glow and play hum
womanHotspot.addEventListener('mouseenter', () => {
  womanCrackGlow.classList.add('active');
  lightHumAudio.play().catch(err => console.log('Audio play prevented:', err));
});

womanHotspot.addEventListener('mouseleave', () => {
  womanCrackGlow.classList.remove('active');
  lightHumAudio.pause();
  lightHumAudio.currentTime = 0;
});

// Keyboard accessibility for bottle hotspot
bottleHotspot.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    console.log('Bottle hotspot activated via keyboard!');
    initiateShatter('bottle');
  }
});

bottleHotspot.addEventListener('focus', () => {
  crackGlow.classList.add('active');
  lightHumAudio.play().catch(err => console.log('Audio play prevented:', err));
});

bottleHotspot.addEventListener('blur', () => {
  crackGlow.classList.remove('active');
  lightHumAudio.pause();
  lightHumAudio.currentTime = 0;
});

// Keyboard accessibility for woman hotspot
womanHotspot.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    console.log('Woman hotspot activated via keyboard!');
    initiateShatter('woman');
  }
});

womanHotspot.addEventListener('focus', () => {
  womanCrackGlow.classList.add('active');
  lightHumAudio.play().catch(err => console.log('Audio play prevented:', err));
});

womanHotspot.addEventListener('blur', () => {
  womanCrackGlow.classList.remove('active');
  lightHumAudio.pause();
  lightHumAudio.currentTime = 0;
});

/*******************************
 *  KEYBOARD ACCESSIBILITY
 *******************************/
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (videoModal.classList.contains('visible')) {
      closeVideoModal();
    }
    if (bottleCartContainer.classList.contains('visible')) {
      closeCart();
    }
  }
});
