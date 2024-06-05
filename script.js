const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hiddenText = document.querySelector('.hidden-text');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.fillStyle = 'gray';
ctx.fillRect(0, 0, canvas.width, canvas.height);

canvas.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const radius = 50;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over';
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
