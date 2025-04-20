// LiquidPortal: World-class, poetic, memory-rich portal with SVG morphing, tactile feedback, and accessibility
// To use: new LiquidPortal({
//   portalSelector: '#portal',
//   previewSelector: '#portal-preview',
//   fullscreenSelector: '#portal-fullscreen',
//   closeSelector: '#portal-close',
// });

class LiquidPortal {
  constructor({ portalSelector, previewSelector, fullscreenSelector, closeSelector }) {
    this.portal = document.querySelector(portalSelector);
    this.preview = document.querySelector(previewSelector);
    this.fullscreen = document.querySelector(fullscreenSelector);
    this.closeBtn = document.querySelector(closeSelector);
    this.svgNS = 'http://www.w3.org/2000/svg';
    this.animating = false;
    this.ripple = 0;
    this.rippleTarget = 0;
    this.pointer = { x: 0.5, y: 0.5 };
    this.createSVG();
    this.attachEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createSVG() {
    // Portal SVG
    const size = 90;
    this.svg = document.createElementNS(this.svgNS, 'svg');
    this.svg.setAttribute('width', size);
    this.svg.setAttribute('height', size);
    this.svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    this.svg.style.position = 'absolute';
    this.svg.style.left = '50%';
    this.svg.style.top = '50%';
    this.svg.style.transform = 'translate(-50%, -50%)';
    this.svg.style.pointerEvents = 'none';
    this.svg.style.zIndex = '20';
    this.portal.appendChild(this.svg);

    // Liquid shape
    this.path = document.createElementNS(this.svgNS, 'path');
    this.path.setAttribute('fill', 'url(#liquid-grad)');
    this.path.setAttribute('stroke', 'rgba(120,120,120,0.13)');
    this.path.setAttribute('stroke-width', '2');
    this.svg.appendChild(this.path);

    // Gradients
    const defs = document.createElementNS(this.svgNS, 'defs');
    const grad = document.createElementNS(this.svgNS, 'radialGradient');
    grad.setAttribute('id', 'liquid-grad');
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

    // For preview masking
    this.clipPath = document.createElementNS(this.svgNS, 'clipPath');
    this.clipPath.setAttribute('id', 'portal-clip');
    this.maskPath = document.createElementNS(this.svgNS, 'path');
    this.clipPath.appendChild(this.maskPath);
    this.svg.appendChild(this.clipPath);
    // Apply mask to preview
    this.preview.style.clipPath = 'url(#portal-clip)';
    this.preview.style.webkitClipPath = 'url(#portal-clip)';
  }

  attachEvents() {
    this.portal.addEventListener('mouseenter', () => {
      this.rippleTarget = 1.5;
    });
    this.portal.addEventListener('mouseleave', () => {
      this.rippleTarget = 0;
    });
    this.portal.addEventListener('mousedown', () => {
      this.rippleTarget = 3.2;
    });
    this.portal.addEventListener('mouseup', () => {
      this.rippleTarget = 1.5;
    });
    this.portal.addEventListener('mousemove', e => {
      const rect = this.portal.getBoundingClientRect();
      this.pointer.x = (e.clientX - rect.left) / rect.width;
      this.pointer.y = (e.clientY - rect.top) / rect.height;
    });
    this.portal.addEventListener('focus', () => {
      this.rippleTarget = 1.5;
    });
    this.portal.addEventListener('blur', () => {
      this.rippleTarget = 0;
    });
    // Accessibility: keyboard ripple
    this.portal.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') {
        this.rippleTarget = 3.2;
        setTimeout(() => { this.rippleTarget = 1.5; }, 300);
      }
    });
  }

  animate() {
    // Animate ripple/undulation
    const t = performance.now() * 0.001;
    this.ripple += (this.rippleTarget - this.ripple) * 0.11;
    // Generate 8 control points for a wobbly ellipse
    const s = 90;
    const r = s * 0.44 + this.ripple * 2.5;
    const cx = s / 2, cy = s / 2;
    let pts = [];
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const u = Math.sin(t * 0.9 + i * 0.8) * 3.2 + Math.cos(t * 0.7 + i) * 2.1;
      const rad = r + u + this.ripple * (Math.sin(t * 2 + i) * 0.9);
      pts.push([
        cx + Math.cos(ang) * rad,
        cy + Math.sin(ang) * rad
      ]);
    }
    // Create SVG path (smooth cubic Bezier)
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i <= 8; i++) {
      const p1 = pts[i % 8];
      const c1 = [
        pts[(i - 1) % 8][0] + (p1[0] - pts[(i - 1) % 8][0]) * 0.5,
        pts[(i - 1) % 8][1] + (p1[1] - pts[(i - 1) % 8][1]) * 0.5
      ];
      d += ` Q${c1[0]},${c1[1]} ${p1[0]},${p1[1]}`;
    }
    d += ' Z';
    this.path.setAttribute('d', d);
    this.maskPath.setAttribute('d', d);
    requestAnimationFrame(this.animate);
  }
}

// Usage example (after DOM loaded):
// new LiquidPortal({
//   portalSelector: '#portal',
//   previewSelector: '#portal-preview',
//   fullscreenSelector: '#portal-fullscreen',
//   closeSelector: '#portal-close',
// });
