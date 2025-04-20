// Animated Liquid Portal SVG Component
// Handles undulation, parallax highlight, and ripple-on-hover

const portalNS = 'http://www.w3.org/2000/svg';

class LiquidPortal {
  constructor(container, options = {}) {
    this.container = container;
    this.size = options.size || 90;
    this.undulation = options.undulation || 4; // px
    this.speed = options.speed || 0.9; // undulation speed
    this.ripple = 0; // ripple state
    this.rippleTarget = 0;
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.createSVG();
    this.animate = this.animate.bind(this);
    this.attachEvents();
    requestAnimationFrame(this.animate);
  }

  createSVG() {
    const s = this.size;
    this.svg = document.createElementNS(portalNS, 'svg');
    this.svg.setAttribute('width', s);
    this.svg.setAttribute('height', s);
    this.svg.setAttribute('viewBox', `0 0 ${s} ${s}`);
    this.svg.style.display = 'block';
    this.svg.style.position = 'absolute';
    this.svg.style.top = '0';
    this.svg.style.left = '0';
    this.svg.style.pointerEvents = 'none';
    this.svg.style.zIndex = '3';

    // Main liquid ellipse
    this.path = document.createElementNS(portalNS, 'path');
    this.path.setAttribute('fill', 'url(#liquidGrad)');
    this.path.setAttribute('stroke', 'rgba(120,120,120,0.14)');
    this.path.setAttribute('stroke-width', '2');

    // Highlight ellipse (for parallax)
    this.highlight = document.createElementNS(portalNS, 'ellipse');
    this.highlight.setAttribute('rx', s * 0.32);
    this.highlight.setAttribute('ry', s * 0.10);
    this.highlight.setAttribute('fill', 'rgba(255,255,255,0.18)');
    this.highlight.setAttribute('stroke', 'none');

    // Gradients
    const defs = document.createElementNS(portalNS, 'defs');
    const grad = document.createElementNS(portalNS, 'radialGradient');
    grad.setAttribute('id', 'liquidGrad');
    grad.setAttribute('cx', '50%');
    grad.setAttribute('cy', '50%');
    grad.setAttribute('r', '50%');
    grad.innerHTML = `
      <stop offset="0%" stop-color="#e2e2e2" />
      <stop offset="55%" stop-color="#b0b0b0" />
      <stop offset="100%" stop-color="#888" />
    `;
    defs.appendChild(grad);
    this.svg.appendChild(defs);

    this.svg.appendChild(this.path);
    this.svg.appendChild(this.highlight);
    this.container.style.position = 'relative';
    this.container.appendChild(this.svg);
  }

  attachEvents() {
    const parent = this.container.parentElement;
    parent.addEventListener('mousemove', e => {
      const rect = parent.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / rect.width;
      this.mouseY = (e.clientY - rect.top) / rect.height;
    });
    parent.addEventListener('mouseleave', () => {
      this.mouseX = 0.5;
      this.mouseY = 0.5;
    });
    parent.addEventListener('mouseenter', () => {
      this.rippleTarget = 1;
    });
    parent.addEventListener('mouseleave', () => {
      this.rippleTarget = 0;
    });
    parent.addEventListener('mousedown', () => {
      this.rippleTarget = 2;
    });
    parent.addEventListener('mouseup', () => {
      this.rippleTarget = 1;
    });
    parent.addEventListener('focus', () => {
      this.rippleTarget = 1;
    });
    parent.addEventListener('blur', () => {
      this.rippleTarget = 0;
    });
  }

  animate() {
    // Animate undulation and ripple
    const t = performance.now() * 0.001 * this.speed;
    this.ripple += (this.rippleTarget - this.ripple) * 0.13;
    // Generate 8 control points for a wobbly ellipse
    const s = this.size;
    const r = s * 0.44 + this.ripple * 3;
    const cx = s / 2, cy = s / 2;
    let pts = [];
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const u = Math.sin(t + i * 0.8) * this.undulation + Math.cos(t * 0.7 + i) * this.undulation * 0.6;
      const rad = r + u + this.ripple * (Math.sin(t * 2 + i) * 2);
      pts.push([
        cx + Math.cos(ang) * rad,
        cy + Math.sin(ang) * rad
      ]);
    }
    // Create SVG path (smooth cubic Bezier)
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i <= 8; i++) {
      const p1 = pts[i % 8];
      const p2 = pts[(i + 1) % 8];
      const c1 = [
        pts[(i - 1) % 8][0] + (p1[0] - pts[(i - 1) % 8][0]) * 0.5,
        pts[(i - 1) % 8][1] + (p1[1] - pts[(i - 1) % 8][1]) * 0.5
      ];
      d += ` Q${c1[0]},${c1[1]} ${p1[0]},${p1[1]}`;
    }
    d += ' Z';
    this.path.setAttribute('d', d);

    // Parallax highlight
    const hx = cx + (this.mouseX - 0.5) * s * 0.18;
    const hy = cy - s * 0.18 + (this.mouseY - 0.5) * s * 0.07 + this.ripple * 2;
    this.highlight.setAttribute('cx', hx);
    this.highlight.setAttribute('cy', hy);
    this.highlight.setAttribute('rx', s * 0.32 - this.ripple * 2.5);
    this.highlight.setAttribute('ry', s * 0.10 - this.ripple * 0.7);

    requestAnimationFrame(this.animate);
  }
}

// Usage (after DOM loaded):
//   new LiquidPortal(document.getElementById('mirror'));
