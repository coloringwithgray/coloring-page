// Dynamically set crayon size based on canvas width for Cannes-level rigor
function setCrayonSize() {
  const crayon = document.getElementById('crayon');
  const canvas = document.getElementById('canvas');
  if (!crayon || !canvas) return;
  const crayonLength = Math.max(80, canvas.width * 0.09); // 9% of canvas width, min 80px
  crayon.style.width = (crayonLength * 0.4) + 'px'; // width: 40% of length
  crayon.style.height = crayonLength + 'px';
}
