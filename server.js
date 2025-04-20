// Shared, Decaying Canvas Backend for Coloring with Gray
// Requires: npm install express cors jimp

const express = require('express');
const cors = require('cors');
const Jimp = require('jimp');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Use /app/shared-canvas.png for Railway persistent volume compatibility
const IMAGE_PATH = '/app/shared-canvas.png';
const WIDTH = 1200; // Adjust as needed
const HEIGHT = 900;
const path = require('path');

// Ensure /app directory exists (for Railway persistent volume)
const dir = path.dirname(IMAGE_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Initialize blank canvas if needed
if (!fs.existsSync(IMAGE_PATH)) {
  new Jimp(WIDTH, HEIGHT, 0xffffffff).write(IMAGE_PATH);
}

// Periodically apply decay (every 10 seconds)
setInterval(() => {
  Jimp.read(IMAGE_PATH).then(img => {
    // Overlay a semi-transparent white rectangle for gentle fading
    const overlay = new Jimp(WIDTH, HEIGHT, '#ffffffDD'); // DD = ~87/255 alpha
    img.composite(overlay, 0, 0, { mode: Jimp.BLEND_SOURCE_OVER, opacitySource: 0.04 });
    img.write(IMAGE_PATH);
  });
}, 10000);

// Upload: composite new marks over current canvas
app.post('/upload', (req, res) => {
  const data = req.body.image.replace(/^data:image\/png;base64,/, "");
  Jimp.read(Buffer.from(data, 'base64')).then(overlay => {
    Jimp.read(IMAGE_PATH).then(base => {
      base.composite(overlay, 0, 0, { mode: Jimp.BLEND_SOURCE_OVER, opacitySource: 1 })
          .write(IMAGE_PATH, () => res.sendStatus(200));
    });
  });
});

// Serve latest canvas
app.get('/latest', (req, res) => {
  fs.readFile(IMAGE_PATH, (err, data) => {
    res.json({ image: 'data:image/png;base64,' + data.toString('base64') });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Decaying shared memory server on ${PORT}`));
