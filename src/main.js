import './style.css';

const SECRET_URL = "https://hbd-eight-kappa.vercel.app/";

const papers = Array.from(document.querySelectorAll('.paper'));
let highestZ = papers.length + 10;
let movedCardsCount = 0;
const movedHistory = [];

const bringBackBtn = document.getElementById('bringBackBtn');

const updateBringBackButton = () => {
  if (!bringBackBtn) return;
  if (movedHistory.length > 0) {
    bringBackBtn.classList.add('show');
  } else {
    bringBackBtn.classList.remove('show');
  }
};

bringBackBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (movedHistory.length === 0) return;

  const lastMoved = movedHistory.pop();
  lastMoved.snapBack();
  if (movedCardsCount > 0) movedCardsCount--;
  updateBringBackButton();
});

const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let isMusicStarted = false;

function playAudio() {
  if (!bgMusic) return;
  bgMusic.play().then(() => {
    isMusicStarted = true;
    musicToggle?.classList.add('playing');
  }).catch(() => {});
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

const startAudioOnFirstInteraction = () => {
  if (!isMusicStarted) {
    playAudio();
  }
  window.removeEventListener('click', startAudioOnFirstInteraction);
  window.removeEventListener('touchstart', startAudioOnFirstInteraction);
};
window.addEventListener('click', startAudioOnFirstInteraction);
window.addEventListener('touchstart', startAudioOnFirstInteraction, { passive: true });

window.addEventListener('load', () => {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), 900);
    }, 2400);
  }
});

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

function spawnBalloon(customLeft = null, customDelay = 0) {
  const bContainer = document.getElementById('balloonsContainer');
  if (!bContainer) return;

  const colors = ['#ff85a1', '#fbb1bd', '#ffd166', '#a2d2ff', '#bde0fe', '#ff99c8'];
  const balloon = document.createElement('div');
  balloon.className = 'balloon';
  balloon.style.left = customLeft !== null ? `${customLeft}vw` : `${Math.random() * 90}vw`;
  balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
  balloon.style.animationDelay = `${customDelay}s`;
  balloon.style.animationDuration = `${5.5 + Math.random() * 2.5}s`;

  const popBalloon = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (balloon.classList.contains('popping')) return;
    
    balloon.classList.add('popping');
    const rect = balloon.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const emojis = ['✨', '💖', '⭐', '🎉', '🌸'];
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.className = 'pop-particle';
      p.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      const angle = (Math.PI * 2 / 6) * i;
      const dist = 30 + Math.random() * 25;
      p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }

    setTimeout(() => {
      balloon.remove();
    }, 150);
  };

  balloon.addEventListener('mousedown', popBalloon);
  balloon.addEventListener('touchstart', popBalloon, { passive: false });

  balloon.addEventListener('animationend', () => {
    balloon.remove();
  });

  bContainer.appendChild(balloon);
}

function startAmbientBalloons() {
  setInterval(() => {
    if (document.querySelectorAll('.balloon').length < 6) {
      spawnBalloon();
    }
  }, 3500);
}
startAmbientBalloons();

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
    size: Math.random() * 7 + 4,
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
    if (frame < 130) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  animate();

  for (let i = 0; i < 15; i++) {
    spawnBalloon(Math.random() * 92, Math.random() * 1.2);
  }
}

function setupFortuneCookie() {
  const cookie = document.getElementById('fortuneCookie');
  const paper = document.getElementById('fortunePaper');
  const text = document.getElementById('fortuneText');
  const btn = document.getElementById('cookieActionBtn');

  if (!cookie || !paper || !btn) return;

  const compliments = [
    "Wow how lucky! The stars say you owe MBN a brand new PS5! 🎮✨",
    "Officially 25! Your quarter-life crisis subscription is now active! 👵🎂",
    "You’re not 25... you’re 18 with 7 years of legendary experience! 💅👑",
    "Warning: Turning 25 means 10 PM is now officially bedtime! 😴💤",
    "May your 25th year bring you unlimited iced coffee & zero back pain! ☕🌸",
    "You are genuinely one in 8 billion! The world is so lucky to have you! 💖✨",
    "Fortune says: Today calories are cancelled, eat all the cake you want! 🍰🤤",
    "A certified queen since day one! Keep ruling with that gorgeous smile! 👑🥰",
    "May all your wishes, goals, and secret shopping sprees come true! 🛍️✨",
    "Breaking news: You're still the cutest person on this planet today! 🌸😍"
  ];

  let isCracked = false;
  let clickCount = 0;

  const crackCookie = (e) => {
    e.stopPropagation();
    clickCount++;

    if (clickCount >= 11) {
      cookie.classList.add('cracked');
      text.innerText = "Okay enough with the cookies! 🛑 This much sugar is harmful to your health! 🍪❌";
      paper.classList.add('show');
      btn.innerText = "No more cookies for you! 🙅‍♀️";
      btn.classList.add('disabled');
      launchConfetti();
      return;
    }

    if (!isCracked) {
      isCracked = true;
      cookie.classList.add('cracked');
      const randomMsg = compliments[Math.floor(Math.random() * compliments.length)];
      text.innerText = randomMsg;
      paper.classList.add('show');
      btn.innerText = "✨ Crack Another! 🥠";
      launchConfetti();
    } else {
      paper.classList.remove('show');
      cookie.classList.remove('cracked');
      isCracked = false;
      btn.innerText = "✨ Tap Cookie to Crack Open 🥠";
    }
  };

  cookie.addEventListener('click', crackCookie);
  btn.addEventListener('click', crackCookie);
}
setupFortuneCookie();

function setupScratchCard() {
  const canvas = document.getElementById('scratchCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = 240;
  canvas.height = 110;

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#e5c07b');
  grad.addColorStop(0.5, '#ffd700');
  grad.addColorStop(1, '#d4af37');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#6d4c41';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✨ Scratch to Reveal! ✨', canvas.width / 2, canvas.height / 2 + 5);

  let isScratching = false;

  const scratch = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
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

function setupCandle() {
  const container = document.getElementById('cakeContainer');
  const flame = document.getElementById('candleFlame');
  const smoke = document.getElementById('candleSmoke');
  const msg = document.getElementById('wishMessage');
  const title = document.getElementById('candleTitle');
  const micBtn = document.getElementById('micBlowBtn');

  if (!container || !flame) return;

  let isBlownOut = false;
  let audioStream = null;
  let audioContext = null;
  let analyser = null;
  let micAnimationId = null;

  const extinguishCandle = () => {
    if (isBlownOut) return;
    isBlownOut = true;
    flame.classList.remove('waver');
    flame.classList.add('blown-out');
    smoke.style.display = 'block';
    title.innerText = "Wish Granted! ✨🎂";
    msg.innerText = "May all your dreams come true! 💖";
    if (micBtn) {
      micBtn.innerText = "✨ Flame Extinguished ✨";
      micBtn.classList.remove('listening');
      micBtn.disabled = true;
    }
    launchConfetti();

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
    }
    if (micAnimationId) {
      cancelAnimationFrame(micAnimationId);
    }
  };

  container.addEventListener('click', (e) => {
    e.stopPropagation();
    extinguishCandle();
  });

  const initMicBlow = async (e) => {
    e?.stopPropagation();
    if (isBlownOut) return;

    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(audioStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);

      micBtn.innerText = "💨 Blow into your mic now!";
      micBtn.classList.add('listening');
      msg.innerText = "Blow hard into your microphone! 🌬️";

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkBlow = () => {
        if (isBlownOut) return;
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < 40; i++) {
          sum += dataArray[i];
        }
        const lowFreqAverage = sum / 40;

        if (lowFreqAverage > 45) {
          flame.classList.add('waver');
        } else {
          flame.classList.remove('waver');
        }

        if (lowFreqAverage > 75) {
          extinguishCandle();
          return;
        }

        micAnimationId = requestAnimationFrame(checkBlow);
      };

      checkBlow();
    } catch {
      micBtn.innerText = "Mic unavailable (Tap flame instead)";
      setTimeout(() => {
        micBtn.innerText = "🎙️ Enable Mic to Blow";
      }, 3000);
    }
  };

  micBtn?.addEventListener('click', initMicBlow);
}
setupCandle();

document.querySelectorAll('.flip-indicator').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = btn.closest('.polaroid-flip-card');
    card.classList.toggle('flipped');
  });
});

class Paper {
  holdingPaper = false;
  hasMovedSignificantly = false;
  startX = 0;
  startY = 0;
  prevMouseX = 0;
  prevMouseY = 0;
  velX = 0;
  velY = 0;
  rotation = (Math.random() * 6 - 3);
  currentPaperX = 0;
  currentPaperY = 0;
  domElement = null;

  init(paper, index) {
    this.domElement = paper;
    paper.style.zIndex = index + 1;
    paper.style.transform = `translate(0px, 0px) rotateZ(${this.rotation}deg)`;

    const isHeart = paper.classList.contains('heart');

    const handleStart = (clientX, clientY, target) => {
      if (
        target.closest('#scratchCanvas') || 
        target.closest('.flip-indicator') || 
        target.closest('#cakeContainer') ||
        target.closest('#cookieWrapper') ||
        target.closest('#cookieActionBtn') ||
        target.closest('#micBlowBtn')
      ) {
        return;
      }
      if (this.holdingPaper) return;
      this.holdingPaper = true;

      this.startX = clientX;
      this.startY = clientY;
      this.prevMouseX = clientX;
      this.prevMouseY = clientY;

      paper.classList.remove('snapping-back');
      paper.classList.add('is-dragging');
      paper.style.zIndex = highestZ++;
      paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) scale(1.03) rotateZ(${this.rotation}deg)`;
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

      paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) scale(1.03) rotateZ(${this.rotation}deg)`;
    };

    const handleEnd = (endX, endY) => {
      if (!this.holdingPaper) return;
      this.holdingPaper = false;
      paper.classList.remove('is-dragging');
      paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) scale(1) rotateZ(${this.rotation}deg)`;

      const distanceMoved = Math.hypot(endX - this.startX, endY - this.startY);

      if (distanceMoved > 50 && !this.hasMovedSignificantly) {
        this.hasMovedSignificantly = true;
        movedCardsCount++;
        movedHistory.push(this);
        updateBringBackButton();

        if (movedCardsCount === papers.length - 1) {
          launchConfetti();
        }
      }

      if (isHeart && distanceMoved < 15) {
        launchConfetti();
        setTimeout(() => {
          window.location.href = SECRET_URL;
        }, 500);
      }
    };

    paper.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      handleStart(e.clientX, e.clientY, e.target);
    });

    window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', (e) => handleEnd(e.clientX, e.clientY));

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

  snapBack() {
    this.currentPaperX = 0;
    this.currentPaperY = 0;
    this.hasMovedSignificantly = false;
    this.domElement.classList.add('snapping-back');
    this.domElement.style.zIndex = highestZ++;
    this.domElement.style.transform = `translate(0px, 0px) scale(1) rotateZ(${this.rotation}deg)`;
    setTimeout(() => {
      this.domElement.classList.remove('snapping-back');
    }, 450);
  }
}

papers.forEach((paper, index) => {
  const p = new Paper();
  p.init(paper, index);
});