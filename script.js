// Add this new particle system function
function createParticles() {
  const particleContainer = document.getElementById('particle-container');
  const particleCount = 50;

  // Clear existing particles
  particleContainer.innerHTML = '';

  // Create new particles
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation-delay: ${Math.random() * 3}s;
      opacity: ${Math.random() * 0.5 + 0.3};
    `;
    particleContainer.appendChild(particle);
  }
}

// Update the checkCanvasColored function
function checkCanvasColored() {
  // ... existing counting code ...

  if (coloredPercentage >= 1.37) {
    mirrorLink.style.display = 'block';
    mirrorDiv.classList.add('mirror-glow');
    createParticles();
    
    // Add continuous particle refresh
    setInterval(() => {
      createParticles();
    }, 5000);
  }
}
