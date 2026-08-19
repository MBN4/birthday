import './style.css';

// 👉 Put your secret page link here:
const SECRET_URL = "https://example.com"; 

const papers = Array.from(document.querySelectorAll('.paper'));
let highestZ = papers.length + 10;
let movedCardsCount = 0;

// 1. Background Music Controller
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let isMusicStarted = false;

function playAudio() {
  if (!bgMusic) return;
  bgMusic.play().then(() => {
    isMusicStarted = true;
    musicToggle?.classList.add('playing');
  }).catch(() => {
    // Autoplay prevented until user gesture
  });
}

function toggleAudio(e) {
  e?.stopPropagation();
  if (!bgMusic) return;

  if (bgMusic.paused) {
    bgMusic.play();
    musicToggle?.classList.add('playing');
  } else {
    bgMusic.pause();
    musicToggle?.classList.remove('playing');
  }
}

musicToggle?.addEventListener('click', toggleAudio);

// Automatically start music on the very first touch/click anywhere on screen
const startAudioOnFirstInteraction = () => {
  if (!isMusicStarted) {
    playAudio();
  }
  window.removeEventListener('click', startAudioOnFirstInteraction);
  window.removeEventListener('touchstart', startAudioOnFirstInteraction);
};
window.addEventListener('click', startAudioOnFirstInteraction);
window.addEventListener('touchstart', startAudioOnFirstInteraction, { passive: true });

// 2. Splash Screen Dismissal
window.addEventListener('load', () => {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), 900);
    }, 2400);
  }
});

// 3. Ambient Particles
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

// 4. Sparkle Trail
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

// 5. Confetti & Balloons on Finale
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiPieces = Array.from({ length: 100 }).map(() => ({
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: (Math.random() - 0.5) * 18,
    vy: (Math.random() - 0.7) * 20,
    size: Math.random() * 8 + 4,
    color: ['#ff4d6d', '#ff758f', '#ffb3c1', '#ffd166', '#06d6a0', '#118ab2'][Math.floor(Math.random() * 6)],
    rotation: Math.random() * 360,
    rSpeed: (Math.random() - 0.5) * 10,
  }));

  let frame = 0;
  function animate() {
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
    if (frame < 140) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();

  // Launch Balloons
  const bContainer = document.getElementById('balloonsContainer');
  const colors = ['#ff85a1', '#fbb1bd', '#ffd166', '#a2d2ff', '#bde0fe'];
  for (let i = 0; i < 18; i++) {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.left = `${Math.random() * 95}vw`;
    balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.animationDelay = `${Math.random() * 1.5}s`;
    balloon.style.animationDuration = `${5 + Math.random() * 3}s`;
    bContainer.appendChild(balloon);
  }
}

// 6. Scratch Card Setup
function setupScratchCard() {
  const canvas = document.getElementById('scratchCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#e5c07b');
  grad.addColorStop(0.5, '#ffd700');
  grad.addColorStop(1, '#d4af37');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#6d4c41';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✨ Scratch to Reveal! ✨', canvas.width / 2, canvas.height / 2 + 5);

  let isScratching = false;

  const scratch = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
  };

  canvas.addEventListener('mousedown', (e) => { isScratching = true; scratch(e.clientX, e.clientY); });
  window.addEventListener('mousemove', (e) => { if (isScratching) scratch(e.clientX, e.clientY); });
  window.addEventListener('mouseup', () => { isScratching = false; });

  canvas.addEventListener('touchstart', (e) => { isScratching = true; scratch(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  canvas.addEventListener('touchmove', (e) => { if (isScratching) scratch(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  window.addEventListener('touchend', () => { isScratching = false; });
}
setupScratchCard();

// 7. Candle Flame Blow Out
function setupCandle() {
  const container = document.getElementById('cakeContainer');
  const flame = document.getElementById('candleFlame');
  const smoke = document.getElementById('candleSmoke');
  const msg = document.getElementById('wishMessage');
  const title = document.getElementById('candleTitle');

  if (!container || !flame) return;

  container.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!flame.classList.contains('blown-out')) {
      flame.classList.add('blown-out');
      smoke.style.display = 'block';
      title.innerText = "Wish Granted! ✨🎂";
      msg.innerText = "May all your dreams come true! 💖";
      launchConfetti();
    }
  });
}
setupCandle();

// 8. 3D Flip Polaroid
document.querySelectorAll('.flip-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = btn.closest('.polaroid-flip-card');
    card.classList.toggle('flipped');
  });
});

// 9. Draggable Paper Logic
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

    const handleStart = (clientX, clientY, target) => {
      if (target.closest('#scratchCanvas') || target.closest('.flip-btn') || target.closest('#cakeContainer')) {
        return;
      }
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

      if (distanceMoved > 60 && !this.hasMovedSignificantly) {
        this.hasMovedSignificantly = true;
        movedCardsCount++;
        if (movedCardsCount === papers.length - 1) {
          launchConfetti();
        }
      }

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
      handleStart(e.clientX, e.clientY, e.target);
    });

    window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', (e) => handleEnd(e.clientX, e.clientY));

    // Touch Events
    paper.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) return;
      handleStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.holdingPaper) return;
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
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