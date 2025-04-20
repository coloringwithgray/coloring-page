# Coloring with Gray: Shared, Decaying Memory Server

This backend enables a shared, decaying canvas for all visitors. Everyone draws on the same evolving surface; marks slowly fade, embodying impermanence and collective memory.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install express cors jimp
   ```
2. **Run the server:**
   ```bash
   node server.js
   ```
   The server listens on port 3000 by default.

## API Endpoints

- `POST /upload` — Upload new marks as a PNG data URL (composited onto the shared canvas)
- `GET /latest` — Fetch the current shared, decaying canvas as a PNG data URL

## Artistic Framing
- The canvas is a living palimpsest: all marks are collective, and all eventually fade.
- The rate of decay (and canvas size) can be tuned in `server.js`.

---

**To integrate with your frontend:**
- On page load, fetch `/latest` and draw onto your canvas.
- After drawing, POST your new marks to `/upload`.
- Poll `/latest` periodically to see the evolving memory.
