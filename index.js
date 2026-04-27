/* ════════════════════════════════════════
   index.js · Primera Comunión Mario Alejandro
   Con Firebase Realtime Database
   ════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════════════
//  🔥 FIREBASE CONFIG
//  ► Reemplaza estos valores con los de TU proyecto en:
//    https://console.firebase.google.com
//    Proyecto → Configuración ⚙ → Tus apps → SDK de configuración
// ══════════════════════════════════════════
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getDatabase,
  ref,
  push,
  onValue,
  get
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const firebaseConfig = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://TU_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId:         "TU_PROJECT_ID",
  storageBucket:     "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID"
};

const app      = initializeApp(firebaseConfig);
const db       = getDatabase(app);
const RSVP_REF = ref(db, 'confirmaciones');


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

const PETAL_COLORS = [
  'rgba(255,255,255,0.75)',
  'rgba(201,168,76,0.55)',
  'rgba(220,210,190,0.65)',
  'rgba(180,200,230,0.45)',
];

class Petal {
  constructor() { this.reset(true); }

  reset(initial = false) {
    this.x           = Math.random() * canvas.width;
    this.y           = initial ? Math.random() * canvas.height * -1 : -20;
    this.size        = Math.random() * 7 + 4;
    this.speedY      = Math.random() * 0.8 + 0.3;
    this.speedX      = (Math.random() - 0.5) * 0.6;
    this.angle       = Math.random() * Math.PI * 2;
    this.spin        = (Math.random() - 0.5) * 0.04;
    this.color       = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    this.opacity     = Math.random() * 0.5 + 0.3;
    this.wobble      = Math.random() * Math.PI * 2;
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
//  2. SEGUNDA PALOMA con delay
// ══════════════════════════════════════════

function spawnExtraDove() {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position:fixed;top:0;left:-120px;
    z-index:10;pointer-events:none;
    animation:dovefly 24s linear 9s infinite;
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
    </svg>`;
  document.body.appendChild(wrapper);
}
spawnExtraDove();


// ══════════════════════════════════════════
//  3. MÚSICA (Web Audio API — generativa)
// ══════════════════════════════════════════

let audioCtx      = null;
let musicNodes    = [];
let isPlaying     = false;
let scheduleTimer = null;

function createHarmonicTone(actx, freq, startTime, duration, gain = 0.08) {
  const osc      = actx.createOscillator();
  const gainNode = actx.createGain();
  const vibLFO   = actx.createOscillator();
  const vibGain  = actx.createGain();

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
  gainNode.connect(actx.destination);
  vibLFO.start(startTime); osc.start(startTime);
  vibLFO.stop(startTime + duration); osc.stop(startTime + duration);

  return { osc, gainNode, vibLFO };
}

const CHORD_PROG = [
  [261.63, 329.63, 392.00, 523.25],
  [349.23, 440.00, 523.25, 698.46],
  [392.00, 493.88, 587.33, 783.99],
  [329.63, 415.30, 493.88, 659.25],
  [349.23, 440.00, 523.25, 698.46],
  [261.63, 329.63, 392.00, 523.25],
];
let chordIndex = 0;

function scheduleChord() {
  if (!isPlaying || !audioCtx) return;
  const now      = audioCtx.currentTime;
  const chord    = CHORD_PROG[chordIndex % CHORD_PROG.length];
  const duration = 3.2;
  chord.forEach((freq, i) => {
    const g = i === 0 ? 0.07 : (i === chord.length - 1 ? 0.045 : 0.055);
    musicNodes.push(createHarmonicTone(audioCtx, freq, now, duration, g));
  });
  chordIndex++;
  scheduleTimer = setTimeout(scheduleChord, (duration - 0.3) * 1000);
}

function startMusic() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  isPlaying  = true;
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

const musicBtn   = document.getElementById('musicBtn');
const musicIcon  = document.getElementById('musicIcon');
const musicLabel = document.getElementById('musicLabel');

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
//  5. FORMULARIO RSVP  — guarda en Firebase
// ══════════════════════════════════════════

function showMsg(text, isWarning = false) {
  const el = document.getElementById('rsvpMessage');
  el.textContent       = text;
  el.className         = 'rsvp-message success';
  el.style.borderColor = isWarning
    ? 'rgba(255,200,80,0.6)'
    : 'rgba(201,168,76,0.4)';
}

document.getElementById('rsvpForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const nameInput  = document.getElementById('familyName');
  const countInput = document.getElementById('guestCount');
  const name       = nameInput.value.trim();
  const count      = parseInt(countInput.value, 10);
  const btn        = document.querySelector('.btn-confirm');

  if (!name) return;

  btn.disabled    = true;
  btn.textContent = 'Guardando…';

  try {
    // Verificar duplicados
    const snapshot = await get(RSVP_REF);
    let duplicate  = false;
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        const d = child.val();
        if (d.name && d.name.toLowerCase() === name.toLowerCase()) {
          duplicate = true;
        }
      });
    }

    if (duplicate) {
      showMsg('⚠️ Ya hay una confirmación de "' + name + '". ¡Gracias por avisar!', true);
      btn.disabled    = false;
      btn.textContent = 'Confirmar Asistencia';
      return;
    }

    // Guardar en Firebase
    await push(RSVP_REF, { name, count, ts: new Date().toISOString() });

    nameInput.value  = '';
    countInput.value = '1';
    btn.disabled     = false;
    btn.textContent  = 'Confirmar Asistencia';

    const personas = count === 1 ? 'persona' : 'personas';
    showMsg('🎉 ¡Confirmación registrada! Te esperamos el 20 de Junio, '
      + name + '. (' + count + ' ' + personas + ')');
    burstPetals(12);

  } catch (err) {
    console.error('Firebase error:', err);
    showMsg('❌ Error al registrar. Verifica tu conexión e intenta de nuevo.', true);
    btn.disabled    = false;
    btn.textContent = 'Confirmar Asistencia';
  }
});

function burstPetals(n) {
  for (let i = 0; i < n; i++) {
    const p  = new Petal();
    p.y      = window.scrollY + window.innerHeight * 0.6;
    p.x      = Math.random() * canvas.width;
    p.speedY = Math.random() * -3 - 1;
    p.speedX = (Math.random() - 0.5) * 4;
    p.opacity= 0.9;
    particles.push(p);
  }
  setTimeout(() => { particles = particles.slice(-55); }, 3000);
}


// ══════════════════════════════════════════
//  6. PANEL ADMIN — lee Firebase en tiempo real
// ══════════════════════════════════════════

const ADMIN_PASSWORD = 'mario2025'; // ← Cambia aquí tu contraseña
let adminAuth        = false;
let rsvpUnsubscribe  = null;

document.getElementById('adminBar').addEventListener('click', openAdminModal);

function openAdminModal() {
  document.getElementById('adminOverlay').classList.add('open');
  if (adminAuth) showAdminPanel();
}

document.getElementById('modalCloseBtn').addEventListener('click', closeAdminModal);
document.getElementById('adminOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeAdminModal();
});

function closeAdminModal() {
  document.getElementById('adminOverlay').classList.remove('open');
}

document.getElementById('adminEnterBtn').addEventListener('click', checkPassword);
document.getElementById('adminPass').addEventListener('keydown', e => {
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
  }
}

function showAdminPanel() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  listenToRSVP();
}

/** Suscripción en tiempo real: la tabla se actualiza al instante cuando alguien confirma */
function listenToRSVP() {
  if (rsvpUnsubscribe) return; // ya está escuchando

  const wrap  = document.getElementById('guestListWrap');
  const badge = document.getElementById('totalBadge');
  wrap.innerHTML = '<div class="empty-state">Cargando confirmaciones…</div>';

  rsvpUnsubscribe = onValue(RSVP_REF, snapshot => {
    const list = [];
    if (snapshot.exists()) {
      snapshot.forEach(child => list.push({ id: child.key, ...child.val() }));
    }

    const total = list.reduce((s, x) => s + (x.count || 0), 0);
    badge.textContent = 'Total: ' + total + ' invitado' + (total !== 1 ? 's' : '');

    if (list.length === 0) {
      wrap.innerHTML = '<div class="empty-state">Aún no hay confirmaciones registradas.</div>';
      return;
    }

    list.sort((a, b) => new Date(a.ts) - new Date(b.ts));

    const rows = list.map((x, i) => {
      const fecha = new Date(x.ts).toLocaleDateString('es-MX',
        { day: '2-digit', month: 'short', year: 'numeric' });
      return `<tr>
        <td style="color:var(--brown-soft);font-family:'Lato',sans-serif;font-size:0.8rem;">${i + 1}</td>
        <td>${escapeHtml(x.name || '')}</td>
        <td><span class="guest-count">${x.count || 0}</span></td>
        <td style="font-size:0.85rem;color:var(--text-mid);">${fecha}</td>
      </tr>`;
    }).join('');

    wrap.innerHTML = `
      <table class="guest-table">
        <thead><tr><th>#</th><th>Familia</th><th>Asistentes</th><th>Fecha</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;

  }, error => {
    console.error('Firebase read error:', error);
    wrap.innerHTML = `<div class="empty-state" style="color:#c0392b;">
      Error al leer datos. Verifica la configuración de Firebase.</div>`;
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.getElementById('adminLogoutBtn').addEventListener('click', () => {
  adminAuth = false;
  if (rsvpUnsubscribe) { rsvpUnsubscribe(); rsvpUnsubscribe = null; }
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminLogin').style.display = 'block';
  closeAdminModal();
});


// ══════════════════════════════════════════
//  7. CONTADOR REGRESIVO
// ══════════════════════════════════════════

(function injectCountdown() {
  const target = new Date('2025-06-20T12:00:00');
  const diff   = target - new Date();
  if (diff <= 0) return;
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const badge = document.querySelector('.hero-date-badge');
  if (!badge) return;
  const el = document.createElement('div');
  el.style.cssText = `
    margin-top:10px;font-family:'Lato',sans-serif;font-weight:300;
    font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;
    color:var(--brown-soft);opacity:0.8;`;
  el.textContent = days > 0
    ? `Faltan ${days} día${days !== 1 ? 's' : ''} y ${hours}h`
    : '¡Es hoy! 🎉';
  badge.appendChild(el);
})();
