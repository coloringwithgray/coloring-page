/************************************
 *    HIDE DEFAULT CURSOR ON BODY
 ************************************/
.hide-cursor {
  cursor: none !important;
}

/************************************
 *    BASIC PAGE & CONTAINER STYLE
 ************************************/
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden; /* Prevent scrolling */
  background-color: white;
  font-family: 'Amatic SC', sans-serif; /* Optional */
}

.container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/************************************
 *    CANVAS
 ************************************/
#canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1; /* Canvas behind other elements */
}

/************************************
 *    CRAYON
 ************************************/
#crayon {
  position: absolute;
  display: block;
  transform: translate(-50%, -50%) scale(0.3);
  top: 50%;
  left: 50%;
  cursor: pointer;
  z-index: 3; /* Above canvas so it's clickable */
}

/************************************
 *    MIRROR LINK (PORTAL)
 ************************************/
#mirror-link {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  
  /* Hidden initially so it won't block crayon clicks */
  display: none;

  /* Increase the portal size (perfect circle) */
  width: 400px;
  height: 400px;

  pointer-events: auto;
  z-index: 4; /* Above the crayon after threshold is met */
}

/* The actual circular mirror container */
#mirror {
  width: 100%;
  height: 100%;
  transform: scaleX(-1); /* Flip horizontally */
  border-radius: 50%;
  overflow: hidden;
  pointer-events: none; /* So clicks go to #mirror-link */
  box-shadow: none; /* We’ll rely on the glow animation */
}

/* The mirrored iframe content */
#mirror iframe {
  width: 100%;
  height: 100%;
  border: none;
  transform: scaleX(-1); /* Flip back the content */
  pointer-events: none;
}

/************************************
 *    DARK GREY GLOW ANIMATION
 ************************************/
@keyframes glow {
  0% {
    box-shadow: 0 0 0 0 rgba(50, 50, 50, 0.6);
  }
  50% {
    box-shadow: 0 0 25px 10px rgba(50, 50, 50, 0.7);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(50, 50, 50, 0.6);
  }
}

.mirror-glow {
  animation: glow 1.5s infinite;
  border-radius: 50%; /* ensure the glow remains circular */
}
