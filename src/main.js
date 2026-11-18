import './style.css';

/* ========================================
   LOADER
======================================== */
// Remove preloader smoothly
function dismissLoader() {
  const loader = document.getElementById('loader');
  if (loader && !loader.classList.contains('hide')) {
    loader.classList.add('hide');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 800);
  }
}

window.addEventListener('load', () => {
  setTimeout(dismissLoader, 800);
});
// Fallback in case window load event already fired or is delayed
setTimeout(dismissLoader, 2500);

/* ========================================
   GOLD PARTICLES
======================================== */
(function() {
  const canvas = document.getElementById('particles-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.r    = Math.random() * 1.5 + 0.3;
      this.vx   = (Math.random() - 0.5) * 0.3;
      this.vy   = -(Math.random() * 0.4 + 0.1);
      this.life = 0;
      this.maxLife = Math.random() * 200 + 100;
      this.alpha = 0;
    }
    update() {
      this.x    += this.vx;
      this.y    += this.vy;
      this.life++;
      const p  = this.life / this.maxLife;
      this.alpha = p < 0.2 ? p / 0.2 : p > 0.8 ? (1 - p) / 0.2 : 1;
      if (this.life >= this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha * 0.6;
      ctx.fillStyle   = '#C9A84C';
      if (this.r > 1.2) {
        ctx.shadowBlur  = 4;
        ctx.shadowColor = '#E8C97A';
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const particleCount = window.innerWidth < 768 ? 40 : 65;
  for (let i = 0; i < particleCount; i++) {
    const p = new Particle();
    p.life = Math.random() * p.maxLife;
    particles.push(p);
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ========================================
   ROSE PETALS (Ambient & Scratch Shower)
======================================== */
function spawnPetal(customX, customY, isGold) {
  const el = document.createElement('div');
  el.className = 'petal' + (isGold ? ' gold' : '');
  const startX = customX !== undefined ? customX : Math.random() * 100;
  const startY = customY !== undefined ? customY : -30;
  const duration = Math.random() * 3 + 3.5;
  const drift = (Math.random() - 0.5) * 160 + 'px';
  const rot = (Math.random() * 720 - 360) + 'deg';
  
  el.style.left = (customX !== undefined ? startX + 'px' : startX + 'vw');
  el.style.top = startY + 'px';
  el.style.setProperty('--drift', drift);
  el.style.setProperty('--rot', rot);
  el.style.animationDuration = duration + 's';
  
  document.body.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, duration * 1000);
}

// Background gentle ambient petals
(function initAmbientPetals() {
  setInterval(() => {
    if (Math.random() > 0.4) {
      spawnPetal(undefined, -30, Math.random() > 0.85);
    }
  }, 1200);
})();

// Petal burst function for user scratch
function triggerPetalShower(originX, originY, count = 12) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const offsetX = originX + (Math.random() - 0.5) * 80;
      const offsetY = originY + (Math.random() - 0.5) * 40;
      spawnPetal(offsetX, offsetY, Math.random() > 0.75);
    }, i * 40);
  }
}


/* ========================================
   TAP / VIDEO INTERACTION
======================================== */
const video      = document.getElementById('hero-video');
const tapOverlay = document.getElementById('tap-overlay');
const heroNames  = document.getElementById('hero-names');
const music      = document.getElementById('bg-music');
const musicNote  = document.getElementById('music-note');

let started = false;

// Ensure 1st frame is loaded and rendered as the background under Tap to Play
if (video) {
  video.currentTime = 0.001;
  const renderFirstFrame = () => {
    video.currentTime = 0.001;
  };
  video.addEventListener('loadedmetadata', renderFirstFrame, { once: true });
}

tapOverlay.addEventListener('click', startExperience);
tapOverlay.addEventListener('touchend', e => { e.preventDefault(); startExperience(); });

function startExperience() {
  if (started) return;
  started = true;

  // Unlock scrolling now that guest has tapped to enter
  document.body.classList.remove('scroll-locked');

  // play video — pause on last frame
  video.muted = false;
  video.play().catch(() => { video.muted = true; video.play(); });
  video.classList.add('playing');

  // When video ends, pause on last frame and show names
  video.addEventListener('ended', () => {
    // Seek to just before end to freeze the last frame
    if (video.duration) {
      video.currentTime = video.duration - 0.01;
    }
    video.classList.add('ended');
  });

  // hide overlay with fade and remove completely
  tapOverlay.style.transition = 'opacity 0.6s ease';
  tapOverlay.style.opacity    = '0';
  setTimeout(() => {
    tapOverlay.classList.add('hidden');
    tapOverlay.style.display = 'none';
    if (tapOverlay.parentNode) {
      tapOverlay.parentNode.removeChild(tapOverlay);
    }
  }, 700);

  // Show sparkling scroll cue after tap overlay fades out
  const cue = document.getElementById('hero-scroll-cue');
  if (cue) {
    setTimeout(() => {
      cue.classList.add('visible');
    }, 900);

    // Clicking the cue scrolls smoothly to the invitation
    cue.addEventListener('click', (e) => {
      e.stopPropagation();
      const namesSec = document.getElementById('names-section');
      if (namesSec) {
        namesSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // start music
  music.volume = 0;
  music.play().then(() => {
    fadeAudio(music, 0, 0.5, 2000);
    musicNote.classList.add('show');
    musicNote.classList.add('playing');
  }).catch(() => {});
}

// Hide scroll cue when user scrolls down, restore if back at hero top
window.addEventListener('scroll', () => {
  const cue = document.getElementById('hero-scroll-cue');
  if (!cue || !started) return;
  if (window.scrollY > 50) {
    cue.classList.remove('visible');
  } else {
    cue.classList.add('visible');
  }
}, { passive: true });

// music toggle
musicNote.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    musicNote.classList.add('playing');
    musicNote.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
  } else {
    music.pause();
    musicNote.classList.remove('playing');
    musicNote.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73l4.27 4.27L19.54 18 4.27 3zM12 7V3h6v4h-6z"/></svg>';
  }
});

function fadeAudio(audio, from, to, duration) {
  const steps = 30;
  const step  = (to - from) / steps;
  let   val   = from;
  const id    = setInterval(() => {
    val = Math.min(to, Math.max(0, val + step));
    audio.volume = val;
    if (Math.abs(val - to) < 0.01) clearInterval(id);
  }, duration / steps);
}

// Stop audio and video when browser is closed, minimized, tab switched, or screen locked
let wasMusicPlayingBeforeHide = false;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (music && !music.paused) {
      wasMusicPlayingBeforeHide = true;
      music.pause();
      musicNote.classList.remove('playing');
      musicNote.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73l4.27 4.27L19.54 18 4.27 3zM12 7V3h6v4h-6z"/></svg>';
    }
    if (video && !video.paused) {
      video.pause();
    }
  } else {
    // When returning to tab, resume only if it was playing before leaving
    if (wasMusicPlayingBeforeHide && music) {
      music.play().then(() => {
        musicNote.classList.add('playing');
        musicNote.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>';
      }).catch(() => {});
      wasMusicPlayingBeforeHide = false;
    }
  }
});

// Guarantee immediate pause when navigating away or closing window/tab
window.addEventListener('pagehide', () => {
  if (music) music.pause();
  if (video) video.pause();
});

window.addEventListener('beforeunload', () => {
  if (music) music.pause();
  if (video) video.pause();
});


/* ========================================
   COUNTDOWN TIMER — target: 2 Dec 2026 10 PM IST
======================================== */
// IST = UTC+5:30
const TARGET = new Date('2026-12-02T22:00:00+05:30').getTime();

const tDays  = document.getElementById('t-days');
const tHours = document.getElementById('t-hours');
const tMins  = document.getElementById('t-mins');
const tSecs  = document.getElementById('t-secs');

let prevValues = {};

function pad(n, len = 2) { return String(n).padStart(len, '0'); }

function updateTimer() {
  const now  = Date.now();
  const diff = Math.max(0, TARGET - now);

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);
  const s = Math.floor((diff % 60000)    / 1000);

  const vals = {
    days:  pad(d, 2),
    hours: pad(h, 2),
    mins:  pad(m, 2),
    secs:  pad(s, 2)
  };

  function setNum(el, key) {
    if (vals[key] !== prevValues[key]) {
      el.textContent = vals[key];
      el.classList.remove('flip');
      void el.offsetWidth;
      el.classList.add('flip');
      prevValues[key] = vals[key];
    }
  }

  setNum(tDays,  'days');
  setNum(tHours, 'hours');
  setNum(tMins,  'mins');
  setNum(tSecs,  'secs');
}

updateTimer();
setInterval(updateTimer, 1000);


/* ========================================
   SCRATCH-REVEAL CARDS (Royal Gilded Foil & Petal Shower)
======================================== */
const scratchCanvas = document.getElementById('timer-scratch-canvas');
if (scratchCanvas) {
  const box = scratchCanvas.parentElement;
  const ctx = scratchCanvas.getContext('2d');
  let drawing = false;
  let cleared = false;
  let lastPetalTime = 0;

  function initScratch() {
    const r = box.getBoundingClientRect();
    const w = r.width || 360;
    const h = r.height || 100;
    scratchCanvas.width = w;
    scratchCanvas.height = h;

    // Royal Warm Brown Velvet Foil Base (#7B4028)
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0,   '#4A2516');
    grad.addColorStop(0.3, '#7B4028');
    grad.addColorStop(0.7, '#61311C');
    grad.addColorStop(1,   '#261810');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle Double Gold Border Filigree
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
    ctx.strokeRect(8, 8, w - 16, h - 16);

    // Diagonal gold shimmer accents
    const shim = ctx.createLinearGradient(0, 0, w, h);
    shim.addColorStop(0,    'rgba(212,175,55,0)');
    shim.addColorStop(0.45, 'rgba(212,175,55,0.18)');
    shim.addColorStop(0.5,  'rgba(255,235,160,0.38)');
    shim.addColorStop(0.55, 'rgba(212,175,55,0.18)');
    shim.addColorStop(1,    'rgba(212,175,55,0)');
    ctx.fillStyle = shim;
    ctx.fillRect(0, 0, w, h);

    // Elegant royal crest watermark
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#DFC7A9';
    ctx.font = 'bold 16px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦ ⚜ ✦', w / 2, h / 2 - 10);

    ctx.fillStyle = 'rgba(245, 232, 192, 0.95)';
    ctx.font = '600 10px "Cinzel", serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('SCRATCH TO REVEAL', w / 2, h / 2 + 12);
  }

  setTimeout(initScratch, 100);
  window.addEventListener('resize', () => { if (!cleared) initScratch(); });

  function scratch(clientX, clientY) {
    const r = scratchCanvas.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    // Trigger flower petal cascade on user touch/drag
    const now = performance.now();
    if (now - lastPetalTime > 80) {
      lastPetalTime = now;
      triggerPetalShower(clientX, clientY, 2);
    }

    checkCleared(clientX, clientY);
  }

  function checkCleared(clientX, clientY) {
    if (cleared) return;
    const data = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
    let total = 0, transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      total++;
      if (data[i] < 128) transparent++;
    }
    if (transparent / total > 0.45) {
      cleared = true;
      scratchCanvas.classList.add('cleared');
      const r = scratchCanvas.getBoundingClientRect();
      triggerPetalShower(r.left + r.width / 2, r.top + r.height / 2, 20);

      const hint = document.getElementById('scratch-hint');
      if (hint) {
        hint.innerHTML = '✦ Revealed with Love ✦';
        hint.style.animation = 'none';
        hint.style.color = 'var(--gold-light)';
      }
    }
  }

  // Mouse events
  scratchCanvas.addEventListener('mousedown', e => { 
    drawing = true; 
    scratch(e.clientX, e.clientY); 
  });
  window.addEventListener('mousemove', e => { 
    if (!drawing) return; 
    scratch(e.clientX, e.clientY); 
  });
  window.addEventListener('mouseup', () => { drawing = false; });

  // Touch events (mobile-first)
  scratchCanvas.addEventListener('touchstart', e => { 
    e.preventDefault(); 
    drawing = true; 
    const t = e.touches[0]; 
    scratch(t.clientX, t.clientY); 
  }, { passive: false });
  scratchCanvas.addEventListener('touchmove', e => { 
    e.preventDefault(); 
    if (!drawing) return; 
    const t = e.touches[0]; 
    scratch(t.clientX, t.clientY); 
  }, { passive: false });
  scratchCanvas.addEventListener('touchend', () => { drawing = false; });
}


/* ========================================
   SCROLL REVEAL (IntersectionObserver)
======================================== */
const revealEls = document.querySelectorAll('.reveal');
const timelineEvents = document.querySelectorAll('.timeline-event');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => observer.observe(el));
timelineEvents.forEach(el => observer.observe(el));
