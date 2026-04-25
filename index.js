/* ════════════════════════════════════════
   index.js · Primera Comunión Mario Alejandro
   ════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════════════
//  1. PÉTALOS / PARTÍCULAS (Canvas)
// ══════════════════════════════════════════

const canvas  = document.getElementById('particleCanvas');
const ctx     = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

/** Colores de pétalos: blanco, dorado, azul cielo */
const PETAL_COLORS = [
  'rgba(255,255,255,0.75)',
  'rgba(201,168,76,0.55)',
  'rgba(220,210,190,0.65)',
  'rgba(180,200,230,0.45)',
];

class Petal {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x     = Math.random() * canvas.width;
    this.y     = initial ? Math.random() * canvas.height * -1 : -20;
    this.size  = Math.random() * 7 + 4;          // 4–11 px
    this.speedY = Math.random() * 0.8 + 0.3;     // caída suave
    this.speedX = (Math.random() - 0.5) * 0.6;   // deriva lateral
    this.angle  = Math.random() * Math.PI * 2;
    this.spin   = (Math.random() - 0.5) * 0.04;
    this.color  = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    this.opacity = Math.random() * 0.5 + 0.3;
    this.wobble  = Math.random() * Math.PI * 2;
    this.wobbleSpeed = Math.random() * 0.03 + 0.01;
  }

  update() {
    this.wobble += this.wobbleSpeed;
    this.y      += this.speedY;
    this.x      += this.speedX + Math.sin(this.wobble) * 0.4;
    this.angle  += this.spin;
    if (this.y > canvas.height + 30) this.reset();
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle   = this.color;

    // Forma de pétalo (elipse girada)
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initParticles(count = 55) {
  particles = [];
  for (let i = 0; i < count; i++) particles.push(new Petal());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();


// ══════════════════════════════════════════
//  2. SEGUNDA PALOMA con delay (CSS clone)
// ══════════════════════════════════════════
// La primera paloma está en HTML; creamos una segunda más pequeña con JS

function spawnExtraDove() {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    top: 0; left: -120px;
    z-index: 10;
    pointer-events: none;
    animation: dovefly 24s linear 9s infinite;
  `;

  wrapper.innerHTML = `
    <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg"
         style="width:80px;height:55px;filter:drop-shadow(2px 3px 6px rgba(201,168,76,0.2));opacity:0.75">
      <ellipse cx="45" cy="34" rx="16" ry="10" fill="white"/>
      <circle  cx="61" cy="28" r="7" fill="white"/>
      <polygon points="68,28 74,26 68,31" fill="#e8c87a"/>
      <circle  cx="63.5" cy="26.5" r="1.5" fill="#3a5a8c"/>
      <path d="M45,34 Q22,15 6,23 Q26,38 45,36" fill="white" opacity="0.85"
            style="transform-origin:45px 34px;animation:flapLeft 0.5s ease-in-out infinite alternate"/>
      <path d="M46,34 Q68,18 84,26 Q66,39 46,36" fill="#f0ece0" opacity="0.8"
            style="transform-origin:46px 34px;animation:flapRight 0.5s ease-in-out infinite alternate"/>
      <path d="M29,36 Q18,42 15,50 Q25,43 32,39" fill="white" opacity="0.85"/>
    </svg>
  `;
  document.body.appendChild(wrapper);
}
spawnExtraDove();


// ══════════════════════════════════════════
//  3. MÚSICA  (Web Audio API — generativa)
// ══════════════════════════════════════════

let audioCtx   = null;
let musicNodes = [];
let isPlaying  = false;
let scheduleTimer = null;

/**
 * Genera un acorde suave tipo "Ave María" con
 * osciladores sinusoidales y vibrato leve.
 */
function createHarmonicTone(ctx, freq, startTime, duration, gain = 0.08) {
  const osc     = ctx.createOscillator();
  const gainNode= ctx.createGain();
  const vibLFO  = ctx.createOscillator();
  const vibGain = ctx.createGain();

  // Vibrato sutil
  vibLFO.frequency.value = 5.2;
  vibGain.gain.value     = freq * 0.003;
  vibLFO.connect(vibGain);
  vibGain.connect(osc.frequency);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.25);
  gainNode.gain.setValueAtTime(gain, startTime + duration - 0.3);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  vibLFO.start(startTime);
  osc.start(startTime);
  vibLFO.stop(startTime + duration);
  osc.stop(startTime + duration);

  return { osc, gainNode, vibLFO };
}

// Progresión tipo coral litúrgico en Do mayor
// Notas: Do, Mi, Sol, La, Fa, Re
const CHORD_PROG = [
  [261.63, 329.63, 392.00, 523.25],  // C maj
  [349.23, 440.00, 523.25, 698.46],  // F maj
  [392.00, 493.88, 587.33, 783.99],  // G maj
  [329.63, 415.30, 493.88, 659.25],  // E min
  [349.23, 440.00, 523.25, 698.46],  // F maj
  [261.63, 329.63, 392.00, 523.25],  // C maj
];

let chordIndex = 0;

function scheduleChord() {
  if (!isPlaying || !audioCtx) return;

  const now      = audioCtx.currentTime;
  const chord    = CHORD_PROG[chordIndex % CHORD_PROG.length];
  const duration = 3.2;

  chord.forEach((freq, i) => {
    const gainAmt = i === 0 ? 0.07 : (i === chord.length - 1 ? 0.045 : 0.055);
    const nodes   = createHarmonicTone(audioCtx, freq, now, duration, gainAmt);
    musicNodes.push(nodes);
  });

  chordIndex++;
  scheduleTimer = setTimeout(scheduleChord, (duration - 0.3) * 1000);
}

function startMusic() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  isPlaying = true;
  chordIndex = 0;
  scheduleChord();
}

function stopMusic() {
  isPlaying = false;
  clearTimeout(scheduleTimer);
  musicNodes.forEach(n => {
    try { n.osc.stop();    } catch(e) {}
    try { n.vibLFO.stop(); } catch(e) {}
  });
  musicNodes = [];
}

// Botón de música
const musicBtn  = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');
const musicLabel= document.getElementById('musicLabel');

musicBtn.addEventListener('click', () => {
  if (isPlaying) {
    stopMusic();
    musicBtn.classList.remove('playing');
    musicIcon.textContent  = '♪';
    musicLabel.textContent = 'Música';
  } else {
    startMusic();
    musicBtn.classList.add('playing');
    musicIcon.textContent  = '■';
    musicLabel.textContent = 'Pausa';
  }
});


// ══════════════════════════════════════════
//  4. SCROLL REVEAL
// ══════════════════════════════════════════

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ══════════════════════════════════════════
//  5. FORMULARIO RSVP
// ══════════════════════════════════════════

const STORAGE_KEY = 'rsvp_mario_comunion_2025';

function loadRSVP() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveRSVP(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function showMsg(text, isWarning = false) {
  const el = document.getElementById('rsvpMessage');
  el.textContent = text;
  el.className   = 'rsvp-message success';
  if (isWarning) el.style.borderColor = 'rgba(255,200,80,0.6)';
  else           el.style.borderColor = 'rgba(201,168,76,0.4)';
}

document.getElementById('rsvpForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name  = document.getElementById('familyName').value.trim();
  const count = parseInt(document.getElementById('guestCount').value, 10);
  if (!name) return;

  const list = loadRSVP();
  const dup  = list.find(x => x.name.toLowerCase() === name.toLowerCase());

  if (dup) {
    showMsg('⚠️ Ya hay una confirmación de "' + name + '". ¡Gracias por avisar!', true);
    return;
  }

  list.push({ name, count, ts: new Date().toISOString() });
  saveRSVP(list);

  document.getElementById('familyName').value = '';
  document.getElementById('guestCount').value = '1';

  const personas = count === 1 ? 'persona' : 'personas';
  showMsg('🎉 ¡Confirmación registrada! Te esperamos el 20 de Junio, ' + name + '. (' + count + ' ' + personas + ')');

  // Lanzar mini-celebración de pétalos extra
  burstPetals(12);
});

/** Lanza ráfaga de pétalos desde el centro del RSVP */
function burstPetals(n) {
  for (let i = 0; i < n; i++) {
    const p    = new Petal();
    p.y        = window.scrollY + window.innerHeight * 0.6;
    p.x        = Math.random() * canvas.width;
    p.speedY   = Math.random() * -3 - 1;       // sube
    p.speedX   = (Math.random() - 0.5) * 4;
    p.opacity  = 0.9;
    particles.push(p);
  }
  // Eliminar los extra después de 3 s para no acumular
  setTimeout(() => {
    particles = particles.slice(-55);
  }, 3000);
}


// ══════════════════════════════════════════
//  6. PANEL ADMIN
// ══════════════════════════════════════════

const ADMIN_PASSWORD = 'mario2025'; // ← Cambia aquí tu contraseña
let adminAuth = false;

// Abrir modal
document.getElementById('adminBar').addEventListener('click', openAdminModal);

function openAdminModal() {
  document.getElementById('adminOverlay').classList.add('open');
  if (adminAuth) showAdminPanel();
}

// Cerrar modal
document.getElementById('modalCloseBtn').addEventListener('click', closeAdminModal);
document.getElementById('adminOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeAdminModal();
});

function closeAdminModal() {
  document.getElementById('adminOverlay').classList.remove('open');
}

// Verificar contraseña
document.getElementById('adminEnterBtn').addEventListener('click', checkPassword);
document.getElementById('adminPass').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') checkPassword();
});

function checkPassword() {
  const val   = document.getElementById('adminPass').value;
  const errEl = document.getElementById('adminError');

  if (val === ADMIN_PASSWORD) {
    adminAuth = true;
    document.getElementById('adminPass').value = '';
    errEl.style.display = 'none';
    showAdminPanel();
  } else {
    errEl.style.display = 'block';
    document.getElementById('adminPass').value = '';
    document.getElementById('adminPass').focus();
    // Sacudir el campo de error
    errEl.style.animation = 'none';
    setTimeout(() => { errEl.style.animation = ''; }, 10);
  }
}

function showAdminPanel() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  renderGuestList();
}

function renderGuestList() {
  const list  = loadRSVP();
  const total = list.reduce((s, x) => s + x.count, 0);
  const wrap  = document.getElementById('guestListWrap');
  const badge = document.getElementById('totalBadge');

  badge.textContent = 'Total: ' + total + ' invitado' + (total !== 1 ? 's' : '');

  if (list.length === 0) {
    wrap.innerHTML = '<div class="empty-state">Aún no hay confirmaciones registradas.</div>';
    return;
  }

  const rows = list.map((x, i) => {
    const d     = new Date(x.ts);
    const fecha = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    return `<tr>
      <td style="color:var(--brown-soft);font-family:'Lato',sans-serif;font-size:0.8rem;">${i + 1}</td>
      <td>${escapeHtml(x.name)}</td>
      <td><span class="guest-count">${x.count}</span></td>
      <td style="font-size:0.85rem;color:var(--text-mid);">${fecha}</td>
    </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table class="guest-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Familia</th>
          <th>Asistentes</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Logout admin
document.getElementById('adminLogoutBtn').addEventListener('click', function() {
  adminAuth = false;
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminLogin').style.display = 'block';
  closeAdminModal();
});


// ══════════════════════════════════════════
//  7. CONTADOR REGRESIVO (días para el evento)
// ══════════════════════════════════════════

(function injectCountdown() {
  const target = new Date('2025-06-20T12:00:00');
  const now    = new Date();
  const diff   = target - now;

  if (diff <= 0) return; // Ya pasó el evento

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const badge = document.querySelector('.hero-date-badge');
  if (!badge) return;

  const countdown = document.createElement('div');
  countdown.style.cssText = `
    margin-top: 10px;
    font-family: 'Lato', sans-serif;
    font-weight: 300;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--brown-soft);
    opacity: 0.8;
  `;
  countdown.textContent = days > 0
    ? `Faltan ${days} día${days !== 1 ? 's' : ''} y ${hours}h`
    : `¡Es hoy! 🎉`;

  badge.appendChild(countdown);
})();
