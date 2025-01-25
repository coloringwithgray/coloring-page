/*******************************
 *  Encapsulate Code to Avoid Global Scope Pollution
 *******************************/
(() => {
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
   *  Constants
   *******************************/
  const CRAYON_SIZE = { widthOffset: 15, heightOffset: 25 };
  const LINE_WIDTH = 15;
  const LINE_COLOR = "gray";
  const DRAW_THRESHOLD_PERCENTAGE = 1.37;
  const PORTAL_SIZE = 400;
  const SKIP_FACTOR = 10;
  const PARTICLE_COUNT = 100;
  const PARTICLE_DISTANCE_MAX = 150;
  const PARTICLE_SPEED_MIN = 0.01;
  const PARTICLE_SPEED_MAX = 0.06;
  const PARTICLE_SIZE_MIN = 1;
  const PARTICLE_SIZE_MAX = 4;
  const GLOW_COLOR = "rgba(0, 150, 255, ";

  /*******************************
   *  State Variables
   *******************************/
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let crayonActive = false;
  let portalActive = false;
  let animationFrameId = null;

  /*******************************
   *  Initialize Canvas
   *******************************/
  function initializeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "#ffffff"; // Use hex for consistency
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Initialize portal canvas size
    portalCanvas.width = PORTAL_SIZE;
    portalCanvas.height = PORTAL_SIZE;

    // Optional: Clear portal canvas when initializing
    portalCtx.clearRect(0, 0, portalCanvas.width, portalCanvas.height);
  }

  window.addEventListener("resize", initializeCanvas);
  window.addEventListener("orientationchange", initializeCanvas);
  initializeCanvas();

  /*******************************
   *  Activate Crayon
   *******************************/
  function activateCrayon() {
    if (crayonActive) return; // Prevent multiple activations
    crayonActive = true;
    document.body.classList.add("hide-cursor");
    crayon.setAttribute("aria-pressed", "true");
    portalContainer.setAttribute("aria-hidden", "false");
  }

  /*******************************
   *  Draw Helper
   *******************************/
  function drawLine(x, y, fromX, fromY) {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
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
    if (isDrawing) {
      isDrawing = false;
      debounceCheckCanvasColored();
    }
  }

  /*******************************
   *  Debounce Function to Optimize Checks
   *******************************/
  let debounceTimer;
  function debounceCheckCanvasColored() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(checkCanvasColored, 500); // 500ms debounce
  }

  /*******************************
   *  Check How Much is Colored
   *******************************/
  function checkCanvasColored() {
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let coloredPixels = 0;
      const totalPixels = canvas.width * canvas.height;

      for (let i = 0; i < imageData.length; i += 4 * SKIP_FACTOR) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        // Assuming "gray" corresponds to RGB (128, 128, 128)
        if (r === 128 && g === 128 && b === 128) {
          coloredPixels++;
        }
      }

      const coloredPercentage = ((coloredPixels * SKIP_FACTOR) / totalPixels) * 100;

      if (coloredPercentage >= DRAW_THRESHOLD_PERCENTAGE && !portalActive) {
        portalActive = true;
        showPortal();
      }
    } catch (error) {
      console.error("Error checking canvas colored percentage:", error);
    }
  }

  /*******************************
   *  Show Portal
   *******************************/
  function showPortal() {
    portalContainer.classList.remove("hidden");

    // Initialize particles
    const particles = createParticles(PARTICLE_COUNT);

    // Start the swirling animation
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
      animationFrameId = requestAnimationFrame(drawSwirl);
    }

    drawSwirl();
  }

  /*******************************
   *  Create Particles for Swirl
   *******************************/
  function createParticles(count) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * PARTICLE_DISTANCE_MAX,
        speed: Math.random() * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN) + PARTICLE_SPEED_MIN,
        size: Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN,
        color: `${GLOW_COLOR}${Math.random() * 0.6 + 0.2})`,
      });
    }
    return particles;
  }

  /*******************************
   *  Move Crayon (Cursor)
   *******************************/
  function moveCrayon(x, y) {
    crayon.style.left = `${x - canvas.offsetLeft - CRAYON_SIZE.widthOffset}px`;
    crayon.style.top = `${y - canvas.offsetTop - CRAYON_SIZE.heightOffset}px`;
  }

  /*******************************
   *  Register Pointer Events
   *******************************/
  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);

  /*******************************
   *  Accessibility Enhancements
   *******************************/
  crayon.setAttribute("tabindex", "0");

  // Allow activation via keyboard (e.g., Enter or Space)
  crayon.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activateCrayon();
    }
  });

  // Allow activation via mouse click
  crayon.addEventListener("click", activateCrayon);

  /*******************************
   *  Cleanup on Page Unload
   *******************************/
  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(animationFrameId);
  });
})();
