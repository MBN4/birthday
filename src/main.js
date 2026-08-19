import './style.css';

// 👉 Put your secret page link here:
const SECRET_URL = "https://example.com"; 

let highestZ = 1;

class Paper {
  holdingPaper = false;
  startX = 0;
  startY = 0;
  prevMouseX = 0;
  prevMouseY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 12 - 6; // Organic tilt (-6deg to +6deg)
  currentPaperX = 0;
  currentPaperY = 0;

  init(paper) {
    paper.style.transform = `translate(0px, 0px) rotateZ(${this.rotation}deg)`;

    const isHeart = paper.classList.contains('heart');

    const handleStart = (clientX, clientY) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;
      
      this.startX = clientX;
      this.startY = clientY;
      this.prevMouseX = clientX;
      this.prevMouseY = clientY;

      paper.style.zIndex = highestZ++;
    };

    const handleMove = (clientX, clientY) => {
      if (!this.holdingPaper) return;

      this.velX = clientX - this.prevMouseX;
      this.velY = clientY - this.prevMouseY;

      this.currentPaperX += this.velX;
      this.currentPaperY += this.velY;

      this.prevMouseX = clientX;
      this.prevMouseY = clientY;

      paper.style.transform = `translate(${this.currentPaperX}px, ${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
    };

    const handleEnd = (endX, endY) => {
      if (!this.holdingPaper) return;
      this.holdingPaper = false;

      // Detect click/tap on the heart (movement less than 10px)
      const distanceMoved = Math.hypot(endX - this.startX, endY - this.startY);
      if (isHeart && distanceMoved < 10) {
        window.location.href = SECRET_URL;
      }
    };

    // Desktop Mouse Events
    paper.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      handleStart(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', (e) => {
      handleEnd(e.clientX, e.clientY);
    });

    // Mobile Touch Events
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
    });
  }
}

// Initialize all cards
document.querySelectorAll('.paper').forEach((paper) => {
  const p = new Paper();
  p.init(paper);
});