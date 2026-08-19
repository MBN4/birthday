import './style.css';

// 👉 Put your secret page link here:
const SECRET_URL = "https://example.com"; 

const papers = Array.from(document.querySelectorAll('.paper'));
let highestZ = papers.length + 10;
let movedCardsCount = 0;

// 1. Splash Screen Dismissal after Lily bloom animation
window.addEventListener('load', () => {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), 900);
    }, 2400); // 2.4s display time
  }
});

// 2. Ambient floating particles in background
function createAmbientParticles() {
  const container = document.getElementById('ambientParticles');
  const symbols = ['🌸', '✨', '💖', '⭐', '🎈'];
  
  for (let i = 0; i < 15; i++) {
    const el = document.createElement('div');
    el.className = 'particle';
    el.innerText = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = `${Math.random() * 100}vw`;
    el.style.animationDelay = `${Math.random() * 8}s`;
    el.style.animationDuration = `${8 + Math.random() * 6}s`;
    container.appendChild(el);
  }
}
createAmbientParticles();

// 3. Interactive Sparkle Trail while dragging
function spawnTrailParticle(x, y) {
  if (Math.random() > 0.4) return;
  const emojis = ['✨', '💖', '⭐', '🌸'];
  const p = document.createElement('div');
  p.className = 'trail-particle';
  p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
  p.style.left = `${x}px`;
  p.style.top = `${y}px`;
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 800);
}

// 4. Confetti Cannon Effect
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiPieces = Array.from({ length: 90 }).map(() => ({
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 16,
    vy: (Math.random() - 0.7) * 18,
    size: Math.random() * 8 + 4,
    color: ['#ff4d6d', '#ff758f', '#ffb3c1', '#ffd166', '#06d6a0', '#118ab2'][Math.floor(Math.random() * 6)],
    rotation: Math.random() * 360,
    rSpeed: (Math.random() - 0.5) * 10,
  }));

  let frame = 0;
  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiPieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.rotation += p.rSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    frame++;
    if (frame < 120) {
      requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animateConfetti();
}

// 5. Draggable Paper Class
class Paper {
  holdingPaper = false;
  hasMovedSignificantly = false;
  startX = 0;
  startY = 0;
  prevMouseX = 0;
  prevMouseY = 0;
  velX = 0;
  velY = 0;
  rotation = (Math.random() * 8 - 4);
  currentPaperX = 0;
  currentPaperY = 0;

  init(paper, index) {
    paper.style.zIndex = index + 1;
    paper.style.transform = `translate(0px, 0px) rotateZ(${this.rotation}deg)`;

    const isHeart = paper.classList.contains('heart');

    const handleStart = (clientX, clientY) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;
      this.hasMovedSignificantly = false;

      this.startX = clientX;
      this.startY = clientY;
      this.prevMouseX = clientX;
      this.prevMouseY = clientY;

      paper.classList.add('is-dragging');
      paper.style.zIndex = highestZ++;
      paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) scale(1.04) rotateZ(${this.rotation}deg)`;
    };

    const handleMove = (clientX, clientY) => {
      if (!this.holdingPaper) return;

      this.velX = clientX - this.prevMouseX;
      this.velY = clientY - this.prevMouseY;

      this.currentPaperX += this.velX;
      this.currentPaperY += this.velY;

      this.prevMouseX = clientX;
      this.prevMouseY = clientY;

      spawnTrailParticle(clientX, clientY);

      paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) scale(1.04) rotateZ(${this.rotation}deg)`;
    };

    const handleEnd = (endX, endY) => {
      if (!this.holdingPaper) return;
      this.holdingPaper = false;
      paper.classList.remove('is-dragging');
      paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) scale(1) rotateZ(${this.rotation}deg)`;

      const distanceMoved = Math.hypot(endX - this.startX, endY - this.startY);

      // Track cards moved to celebrate at the end
      if (distanceMoved > 60 && !this.hasMovedSignificantly) {
        this.hasMovedSignificantly = true;
        movedCardsCount++;
        if (movedCardsCount === papers.length - 1) {
          launchConfetti();
        }
      }

      // Secret click redirect on clean heart tap
      if (isHeart && distanceMoved < 10) {
        launchConfetti();
        setTimeout(() => {
          window.location.href = SECRET_URL;
        }, 300);
      }
    };

    // Mouse Events
    paper.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      handleStart(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', (e) => handleEnd(e.clientX, e.clientY));

    // Touch Events (Mobile)
    paper.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) return;
      const t = e.touches[0];
      handleStart(t.clientX, t.clientY);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.holdingPaper) return;
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      const t = e.changedTouches ? e.changedTouches[0] : { clientX: this.prevMouseX, clientY: this.prevMouseY };
      handleEnd(t.clientX, t.clientY);
    });

    window.addEventListener('touchcancel', () => {
      this.holdingPaper = false;
      paper.classList.remove('is-dragging');
    });
  }
}

// Initialize all cards
papers.forEach((paper, index) => {
  const p = new Paper();
  p.init(paper, index);
});