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

function setupGiftBox() {
  const wrapper = document.getElementById('giftWrapper');
  const hint = document.getElementById('giftHint');
  if (!wrapper) return;

  let isOpened = false;
  wrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isOpened) {
      isOpened = true;
      wrapper.classList.add('opened');
      if (hint) hint.innerText = "✨ Surprise Opened! Happy Birthday! 💖";
      launchConfetti();
    } else {
      wrapper.classList.toggle('opened');
    }
  });
}
setupGiftBox();

function setupBiometricScanner() {
  const pad = document.getElementById('scannerPad');
  const btn = document.getElementById('scanBtn');
  const text = document.getElementById('readoutText');
  if (!pad || !btn || !text) return;

  let isScanning = false;
  let scanTimer = null;
  let isDone = false;

  const startScan = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isDone) return;

    isScanning = true;
    pad.classList.add('scanning');
    text.innerText = "Scanning fingerprint & energy vibe... 📡";
    text.style.opacity = '1';

    scanTimer = setTimeout(() => {
      text.innerText = "🚨 BEEP! Ooh... a cute penguin detected using the internet! 🐧🌐";
      launchConfetti();

      setTimeout(() => {
        text.innerText = "✨ Verified: Esha 👑 | Age: 25 | Heart: Pure Gold 💛 | You are truly one in a billion. Keep shining! 💖🌸";
        pad.classList.remove('scanning');
        btn.innerText = "👑 QUEEN AUTHENTICATED! ✨";
        btn.disabled = true;
        isDone = true;
        launchConfetti();
      }, 2000);
    }, 1800);
  };

  const cancelScan = (e) => {
    e.stopPropagation();
    if (!isDone && isScanning) {
      isScanning = false;
      pad.classList.remove('scanning');
      clearTimeout(scanTimer);
      text.innerText = "Scan incomplete! Please hold your thumb down 👆";
    }
  };

  btn.addEventListener('mousedown', startScan);
  window.addEventListener('mouseup', cancelScan);

  btn.addEventListener('touchstart', startScan, { passive: false });
  window.addEventListener('touchend', cancelScan);
}
setupBiometricScanner();

function setupConstellation() {
  const canvas = document.getElementById('skyCanvas');
  const stars = document.querySelectorAll('.star-node');
  const hint = document.getElementById('constellationHint');
  if (!canvas || !stars.length) return;

  const ctx = canvas.getContext('2d');
  let currentStep = 1;
  const starCoords = {
    1: { x: 185, y: 25 },
    2: { x: 75, y: 25 },
    3: { x: 75, y: 75 },
    4: { x: 165, y: 75 },
    5: { x: 75, y: 125 },
    6: { x: 185, y: 125 }
  };

  const drawLine = (from, to) => {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  stars.forEach((s) => {
    s.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(s.getAttribute('data-id'), 10);
      if (id === currentStep) {
        s.classList.add('connected');
        if (currentStep === 2) drawLine(starCoords[1], starCoords[2]);
        if (currentStep === 3) drawLine(starCoords[2], starCoords[3]);
        if (currentStep === 4) drawLine(starCoords[3], starCoords[4]);
        if (currentStep === 5) drawLine(starCoords[3], starCoords[5]);
        if (currentStep === 6) drawLine(starCoords[5], starCoords[6]);

        currentStep++;
        if (currentStep > 6) {
          hint.innerText = "✨ Constellation 'E' for Esha! The stars say 25 looks magnificent on you! 👑💖";
          launchConfetti();
        }
      }
    });
  });
}
setupConstellation();

function setupBloomCard() {
  const can = document.getElementById('wateringCan');
  const drops = document.getElementById('waterDrops');
  const plant = document.getElementById('sproutPlant');
  const msg = document.getElementById('bloomMsg');
  if (!can || !plant) return;

  let waters = 0;
  can.addEventListener('click', (e) => {
    e.stopPropagation();
    can.classList.add('pouring');
    drops.classList.add('show');

    setTimeout(() => {
      can.classList.remove('pouring');
      drops.classList.remove('show');
      waters++;

      if (waters === 1) {
        plant.classList.add('growing');
        msg.innerText = "It's growing! Water once more! 🌱✨";
      } else if (waters >= 2) {
        plant.classList.add('bloomed');
        msg.innerText = "🌸 You bloom more beautifully every year! 💖";
        launchConfetti();
      }
    }, 600);
  });
}
setupBloomCard();

function setupSlotMachine() {
  const btn = document.getElementById('slotSpinBtn');
  const r1 = document.getElementById('reel1');
  const r2 = document.getElementById('reel2');
  const r3 = document.getElementById('reel3');
  const msg = document.getElementById('slotMessage');

  if (!btn || !r1 || !r2 || !r3 || !msg) return;

  const symbols = ['🐧', '👑', '💖', '🌸', '🎂', '💎', '⭐'];
  let isSpinning = false;
  let spinsCount = 0;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isSpinning) return;
    isSpinning = true;
    spinsCount++;

    r1.classList.add('spinning');
    r2.classList.add('spinning');
    r3.classList.add('spinning');
    btn.disabled = true;
    msg.innerText = "Reels are spinning... 🍀✨";

    const spinInterval = setInterval(() => {
      r1.innerText = symbols[Math.floor(Math.random() * symbols.length)];
      r2.innerText = symbols[Math.floor(Math.random() * symbols.length)];
      r3.innerText = symbols[Math.floor(Math.random() * symbols.length)];
    }, 80);

    setTimeout(() => {
      clearInterval(spinInterval);
      r1.classList.remove('spinning');
      r2.classList.remove('spinning');
      r3.classList.remove('spinning');

      r1.innerText = '🐧';
      r2.innerText = '🐧';
      r3.innerText = '🐧';

      msg.innerText = "🎉 TRIPLE PENGUIN JACKPOT! 🐧🏆 Unlimited hugs & happiness unlocked! 💖";
      launchConfetti();
      isSpinning = false;
      btn.disabled = false;
      btn.innerText = "🎰 SPIN AGAIN! 🍀";
    }, 1600);
  });
}
setupSlotMachine();

function setupCrystalBall() {
  const ball = document.getElementById('crystalBall');
  const btn = document.getElementById('crystalBtn');
  const text = document.getElementById('prophecyText');

  if (!ball || !btn || !text) return;

  const prophecies = [
    "The crystal sees: Random joint pain starting tomorrow morning! Welcome to 25! 👵🦴",
    "The stars predict: Spontaneous shopping sprees and zero financial regrets this year! 🛍️✨",
    "A vision appears: You complaining that the music at parties is 'way too loud' now. 🎧😴",
    "Prophecy: 25 will be your biggest glow-up year with unlimited happiness & success! 🌟💖",
    "The orb reveals: A sudden, uncontrollable obsession with fancy house plants & organizing! 🪴🧺",
    "Destiny speaks: You will soon be treated to the most delicious birthday dinner date ever! 🍝🍨",
    "The mist shows: Going to bed at 9:45 PM and considering it the best decision of your life! 🛌💤",
    "Future update: 100% chance of staying the most charming and adorable human alive! 🌸👑",
    "The crystal whispers: You owe MBN ice cream and a PS5 for this amazing birthday surprise! 🍦🎮",
    "Prophecy: 25 brings zero drama, flawless skin, and endless iced lattes! ☕💅",
    "The vision is clear: You will laugh so hard your stomach hurts throughout your 25th year! 😂✨",
    "A message from the spirits: Halfway to 50! Time to start stretching every morning! 🧘‍♀️👵"
  ];

  let lastIndex = -1;

  const revealProphecy = (e) => {
    e.stopPropagation();
    ball.classList.add('active');
    text.style.opacity = '0.4';

    setTimeout(() => {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * prophecies.length);
      } while (randomIndex === lastIndex);
      lastIndex = randomIndex;

      text.innerText = prophecies[randomIndex];
      text.style.opacity = '1';
      ball.classList.remove('active');
      launchConfetti();
    }, 450);
  };

  ball.addEventListener('click', revealProphecy);
  btn.addEventListener('click', revealProphecy);
}
setupCrystalBall();

function setupPhotoBooth() {
  const input = document.getElementById('photoInput');
  const img = document.getElementById('boothImage');
  const stickersLayer = document.getElementById('boothStickersLayer');
  const stickers = document.querySelectorAll('.sticker-opt');
  const saveBtn = document.getElementById('boothSaveBtn');

  if (!input || !img || !stickersLayer) return;

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target.result;
        launchConfetti();
      };
      reader.readAsDataURL(file);
    }
  });

  stickers.forEach((s) => {
    s.addEventListener('click', (e) => {
      e.stopPropagation();
      const symbol = s.getAttribute('data-sticker');
      const el = document.createElement('span');
      el.className = 'booth-placed-sticker';
      el.innerText = symbol;
      el.style.left = `${20 + Math.random() * 60}%`;
      el.style.top = `${20 + Math.random() * 60}%`;

      let isDragging = false;
      let startX = 0, startY = 0;
      let initL = 0, initT = 0;

      const onStart = (cx, cy) => {
        isDragging = true;
        startX = cx;
        startY = cy;
        initL = el.offsetLeft;
        initT = el.offsetTop;
      };

      const onMove = (cx, cy) => {
        if (!isDragging) return;
        const dx = cx - startX;
        const dy = cy - startY;
        el.style.left = `${initL + dx}px`;
        el.style.top = `${initT + dy}px`;
      };

      const onEnd = () => {
        isDragging = false;
      };

      el.addEventListener('mousedown', (ev) => { ev.stopPropagation(); onStart(ev.clientX, ev.clientY); });
      window.addEventListener('mousemove', (ev) => onMove(ev.clientX, ev.clientY));
      window.addEventListener('mouseup', onEnd);

      el.addEventListener('touchstart', (ev) => { ev.stopPropagation(); onStart(ev.touches[0].clientX, ev.touches[0].clientY); }, { passive: true });
      window.addEventListener('touchmove', (ev) => { if (ev.touches.length) onMove(ev.touches[0].clientX, ev.touches[0].clientY); }, { passive: true });
      window.addEventListener('touchend', onEnd);

      stickersLayer.appendChild(el);
    });
  });

  saveBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    saveBtn.innerText = "✨ Polaroid Saved! 💖";
    launchConfetti();
    setTimeout(() => {
      saveBtn.innerText = "✨ Save Decorated Polaroid 💾";
    }, 2500);
  });
}
setupPhotoBooth();

function setupBottle() {
  const cork = document.getElementById('bottleCork');
  const bottle = document.getElementById('glassBottle');
  const scroll = document.getElementById('scrollUnrolled');
  const hint = document.getElementById('bottleHint');

  if (!cork || !bottle || !scroll) return;

  let isUncorked = false;

  const uncork = (e) => {
    e.stopPropagation();
    if (!isUncorked) {
      isUncorked = true;
      cork.classList.add('popped');
      setTimeout(() => {
        scroll.classList.add('show');
        if (hint) hint.innerText = "✨ Read your ocean message ✨";
        launchConfetti();
      }, 350);
    } else {
      scroll.classList.toggle('show');
    }
  };

  cork.addEventListener('click', uncork);
  bottle.addEventListener('click', uncork);
}
setupBottle();

function setupPowerMeter() {
  const btn = document.getElementById('chargeBtn');
  const needle = document.getElementById('gaugeNeedle');
  const val = document.getElementById('gaugeValue');
  const status = document.getElementById('gaugeStatus');

  if (!btn || !needle || !val || !status) return;

  let charge = 0;
  let chargeInterval = null;
  let isMaxed = false;

  const statuses = [
    { threshold: 0, text: "Status: Resting Power ✨" },
    { threshold: 25, text: "Status: Dangerously Cute 🥰" },
    { threshold: 55, text: "Status: Radiant Energy 🌟" },
    { threshold: 85, text: "Status: Absolute Slay 💅" },
    { threshold: 100, text: "Status: 👑 QUEEN LEVEL OVERLOAD 👑" }
  ];

  const updateUI = () => {
    const angle = -90 + (charge / 100) * 180;
    needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    val.innerText = `${Math.floor(charge)}%`;

    for (let i = statuses.length - 1; i >= 0; i--) {
      if (charge >= statuses[i].threshold) {
        status.innerText = statuses[i].text;
        break;
      }
    }

    if (charge >= 100 && !isMaxed) {
      isMaxed = true;
      btn.innerText = "👑 1000% QUEEN POWER UNLOCKED! ✨";
      btn.classList.add('maxed');
      btn.classList.remove('charging');
      val.innerText = "OVER 9000%! 💥";
      launchConfetti();
      clearInterval(chargeInterval);
    }
  };

  const startCharging = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isMaxed) return;

    btn.classList.add('charging');
    clearInterval(chargeInterval);
    chargeInterval = setInterval(() => {
      if (charge < 100) {
        charge += 2.5;
        updateUI();
      }
    }, 50);
  };

  const stopCharging = (e) => {
    e.stopPropagation();
    if (isMaxed) return;

    btn.classList.remove('charging');
    clearInterval(chargeInterval);
    chargeInterval = setInterval(() => {
      if (charge > 0) {
        charge -= 3.5;
        if (charge < 0) charge = 0;
        updateUI();
      } else {
        clearInterval(chargeInterval);
      }
    }, 40);
  };

  btn.addEventListener('mousedown', startCharging);
  window.addEventListener('mouseup', stopCharging);

  btn.addEventListener('touchstart', startCharging, { passive: false });
  window.addEventListener('touchend', stopCharging);
}
setupPowerMeter();

function setupCakeDecor() {
  const cake = document.getElementById('bigCake');
  const slice = document.getElementById('cakeSlice');
  const toppingsContainer = document.getElementById('toppingsContainer');
  const cutBtn = document.getElementById('cutCakeBtn');
  const toppingButtons = document.querySelectorAll('.topping-btn');

  if (!cake || !slice || !cutBtn) return;

  toppingButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const symbol = btn.getAttribute('data-topping');
      const el = document.createElement('span');
      el.className = 'placed-topping';
      el.innerText = symbol;
      el.style.left = `${15 + Math.random() * 65}%`;
      el.style.top = `${Math.random() * 45}px`;
      toppingsContainer.appendChild(el);
    });
  });

  let isCut = false;
  cutBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isCut) {
      isCut = true;
      cake.style.transform = 'scale(0.8) translateX(-35px)';
      slice.classList.add('show');
      cutBtn.innerText = "✨ Decorate Another Cake 🎂";
      launchConfetti();
    } else {
      isCut = false;
      cake.style.transform = 'scale(1) translateX(0)';
      slice.classList.remove('show');
      toppingsContainer.innerHTML = '';
      cutBtn.innerText = "🔪 Cut a Slice & Eat! 🍰";
    }
  });
}
setupCakeDecor();

function setupUVFlashlight() {
  const board = document.getElementById('uvBoard');
  const beam = document.getElementById('uvBeamLight');
  const hiddenLayer = document.getElementById('uvHiddenLayer');

  if (!board || !beam || !hiddenLayer) return;

  const handleUVMove = (clientX, clientY) => {
    const rect = board.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      beam.style.opacity = '1';
      hiddenLayer.style.opacity = '1';
      beam.style.left = `${x}px`;
      beam.style.top = `${y}px`;
      hiddenLayer.style.clipPath = `circle(55px at ${x}px ${y}px)`;
    } else {
      beam.style.opacity = '0';
      hiddenLayer.style.opacity = '0';
    }
  };

  board.addEventListener('mousemove', (e) => handleUVMove(e.clientX, e.clientY));
  board.addEventListener('mouseleave', () => {
    beam.style.opacity = '0';
    hiddenLayer.style.opacity = '0';
  });

  board.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      handleUVMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  board.addEventListener('touchend', () => {
    beam.style.opacity = '0';
    hiddenLayer.style.opacity = '0';
  });
}
setupUVFlashlight();

function setupEnvelope() {
  const seal = document.getElementById('waxSeal');
  const flap = document.getElementById('envelopeFlap');
  const letter = document.getElementById('letterPaper');
  const hint = document.getElementById('envelopeHint');

  if (!seal || !flap || !letter) return;

  let isOpen = false;
  let isFullyOpen = false;

  seal.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isOpen) {
      isOpen = true;
      isFullyOpen = true;
      seal.classList.add('broken');
      setTimeout(() => {
        flap.classList.add('open');
        setTimeout(() => {
          letter.classList.remove('peeking');
          letter.classList.add('open');
          if (hint) hint.innerText = "✨ Tap letter to tuck / pull ✨";
          launchConfetti();
        }, 300);
      }, 200);
    }
  });

  letter.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) {
      if (isFullyOpen) {
        letter.classList.remove('open');
        letter.classList.add('peeking');
        isFullyOpen = false;
      } else {
        letter.classList.remove('peeking');
        letter.classList.add('open');
        isFullyOpen = true;
      }
    }
  });
}
setupEnvelope();

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
    e.stopPropagation();
    e.preventDefault();
    if (isBlownOut) return;

    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(audioStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      micBtn.innerText = "💨 Blow hard into your mic!";
      micBtn.classList.add('listening');
      msg.innerText = "Blow continuously into mic! 🌬️";

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let readyToDetect = false;

      setTimeout(() => {
        readyToDetect = true;
      }, 500);

      let sustainedBlowFrames = 0;

      const checkBlow = () => {
        if (isBlownOut) return;
        analyser.getByteFrequencyData(dataArray);

        if (readyToDetect) {
          let sum = 0;
          for (let i = 2; i < 35; i++) {
            sum += dataArray[i];
          }
          const windEnergy = sum / 33;

          if (windEnergy > 55) {
            flame.classList.add('waver');
            sustainedBlowFrames++;
          } else {
            flame.classList.remove('waver');
            sustainedBlowFrames = Math.max(0, sustainedBlowFrames - 1);
          }

          if (sustainedBlowFrames > 6 || windEnergy > 95) {
            extinguishCandle();
            return;
          }
        }

        micAnimationId = requestAnimationFrame(checkBlow);
      };

      checkBlow();
    } catch {
      micBtn.innerText = "Mic unavailable (Tap candle instead)";
      setTimeout(() => {
        micBtn.innerText = "🎙️ Enable Mic to Blow";
      }, 3000);
    }
  };

  micBtn?.addEventListener('click', initMicBlow);
  micBtn?.addEventListener('touchstart', initMicBlow, { passive: false });
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
        target.closest('#micBlowBtn') ||
        target.closest('#waxSeal') ||
        target.closest('#letterPaper') ||
        target.closest('#uvBoard') ||
        target.closest('#toppingsBar') ||
        target.closest('#cutCakeBtn') ||
        target.closest('#chargeBtn') ||
        target.closest('#glassBottle') ||
        target.closest('#scrollUnrolled') ||
        target.closest('#stickersTray') ||
        target.closest('.upload-btn') ||
        target.closest('#boothSaveBtn') ||
        target.closest('.booth-placed-sticker') ||
        target.closest('#slotSpinBtn') ||
        target.closest('#crystalBall') ||
        target.closest('#crystalBtn') ||
        target.closest('#wateringCan') ||
        target.closest('#skyContainer') ||
        target.closest('.star-node') ||
        target.closest('#giftWrapper') ||
        target.closest('#scannerPad') ||
        target.closest('#scanBtn')
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