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
  get,
  update,
  set,
  remove
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const firebaseConfig = {
  apiKey:            "AIzaSyB_SWgmkMNh6FPhSdm9RUwfubTuKSZSpUM",
  authDomain:        "invitacion-mario-97aa1.firebaseapp.com",
  databaseURL:       "https://invitacion-mario-97aa1-default-rtdb.firebaseio.com",
  projectId:         "invitacion-mario-97aa1",
  storageBucket:     "invitacion-mario-97aa1.firebasestorage.app",
  messagingSenderId: "474262868148",
  appId:             "1:474262868148:web:39887666f3f579e58187e1"
};

const app        = initializeApp(firebaseConfig);
const db         = getDatabase(app);
const RSVP_REF   = ref(db, 'confirmaciones');
const FAMILY_REF = ref(db, 'familias');

// ── Leer ?familia=ID de la URL para modo invitación personalizada ──
const URL_PARAMS  = new URLSearchParams(window.location.search);
const FAMILIA_ID  = URL_PARAMS.get('familia') || null;
let   familiaData = null;   // se rellena si venimos con un ID


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
    ctx.ellipse(
      canvas.width / 2,
      canvas.height / 2,
      235,
      335,
      0,
      0,
      Math.PI * 2
    );
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
//  3. MÚSICA (song.mp3)
// ══════════════════════════════════════════

const bgAudio    = document.getElementById('bgAudio');
const musicBtn   = document.getElementById('musicBtn');
const musicIcon  = document.getElementById('musicIcon');
const musicLabel = document.getElementById('musicLabel');

bgAudio.volume = 0.7;

function setPlayingUI(playing) {
  if (playing) {
    musicBtn.classList.add('playing');
    musicIcon.textContent  = '■';
    musicLabel.textContent = 'Pausa';
  } else {
    musicBtn.classList.remove('playing');
    musicIcon.textContent  = '♪';
    musicLabel.textContent = 'Música';
  }
}

bgAudio.play().then(() => setPlayingUI(true)).catch(() => setPlayingUI(false));

musicBtn.addEventListener('click', () => {
  if (bgAudio.paused) {
    bgAudio.play();
    setPlayingUI(true);
  } else {
    bgAudio.pause();
    setPlayingUI(false);
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

    // Guardar en Firebase — incluye familiaId si venimos de link personalizado
    const payload = { name, count: Number(count), ts: new Date().toISOString() };
    if (FAMILIA_ID) payload.familiaId = FAMILIA_ID;
    await push(RSVP_REF, payload);

    // Solo limpiar el campo nombre si NO venimos de link personalizado
    if (!FAMILIA_ID) {
      nameInput.value = '';
    }
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

const ADMIN_PASSWORD = 'mario2026'; // ← Cambia aquí tu contraseña
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
  injectAdminTabs();
  listenToRSVP();
  renderAdminView();
}

/** Colores por número de mesa (1-12, luego se repite) */
const TABLE_COLORS = [
  '#3a5a8c', // 1 azul
  '#c0392b', // 2 rojo
  '#27ae60', // 3 verde
  '#8e44ad', // 4 morado
  '#e67e22', // 5 naranja
  '#16a085', // 6 verde azulado
  '#c0932b', // 7 dorado oscuro
  '#d35400', // 8 terracota
  '#2980b9', // 9 azul claro
  '#6c3483', // 10 uva
  '#1e8449', // 11 esmeralda
  '#922b21', // 12 vino
];

function tableColor(n) {
  if (!n || n < 1) return '#aaa';
  return TABLE_COLORS[(n - 1) % TABLE_COLORS.length];
}

// Estado de filtros y búsqueda
let adminList        = [];   // datos completos del snapshot
let adminSortMode    = 'fecha-asc';
let adminSearchQuery = '';

/** Suscripción en tiempo real */
function listenToRSVP() {
  if (rsvpUnsubscribe) { rsvpUnsubscribe(); rsvpUnsubscribe = null; }

  const wrap  = document.getElementById('guestListWrap');
  const badge = document.getElementById('totalBadge');
  wrap.innerHTML = '<div class="empty-state">Cargando confirmaciones…</div>';

  // Inyectar barra de controles si no existe
  if (!document.getElementById('adminControls')) {
    const controls = document.createElement('div');
    controls.id = 'adminControls';
    controls.innerHTML = `
      <div class="admin-controls-bar">
        <input id="adminSearch" class="admin-search" type="text" placeholder="🔍 Buscar familia…">
        <select id="adminSort" class="admin-sort">
          <option value="fecha-asc">Fecha ↑ (antigua primero)</option>
          <option value="fecha-desc">Fecha ↓ (reciente primero)</option>
          <option value="mesa-asc">Mesa ↑ (menor primero)</option>
          <option value="mesa-desc">Mesa ↓ (mayor primero)</option>
          <option value="sin-mesa">Sin mesa asignada</option>
        </select>
      </div>`;
    wrap.parentNode.insertBefore(controls, wrap);

    document.getElementById('adminSearch').addEventListener('input', function() {
      adminSearchQuery = this.value.toLowerCase().trim();
      renderAdminTable();
    });
    document.getElementById('adminSort').addEventListener('change', function() {
      adminSortMode = this.value;
      renderAdminTable();
    });
  }

  rsvpUnsubscribe = onValue(RSVP_REF, snapshot => {
    adminList = [];
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        const val = child.val();
        adminList.push({
          id:    child.key,
          name:  val.name  || '',
          count: parseInt(val.count, 10) || 0,
          ts:    val.ts    || '',
          mesa:  val.mesa  ? parseInt(val.mesa, 10) : null
        });
      });
    }

    const total = adminList.reduce((s, x) => s + x.count, 0);
    badge.textContent = 'Total: ' + total + ' invitado' + (total !== 1 ? 's' : '');
    renderAdminTable();

  }, error => {
    console.error('Firebase read error:', error);
    wrap.innerHTML = `<div class="empty-state" style="color:#c0392b;">
      Error al leer datos. Verifica la configuración de Firebase.</div>`;
  });
}

function renderAdminTable() {
  const wrap = document.getElementById('guestListWrap');

  // Filtrar por búsqueda
  let list = adminList.filter(x =>
    x.name.toLowerCase().includes(adminSearchQuery)
  );

  // Filtrar sin mesa
  if (adminSortMode === 'sin-mesa') {
    list = list.filter(x => !x.mesa);
  }

  // Ordenar
  if (adminSortMode === 'fecha-asc')   list.sort((a, b) => new Date(a.ts) - new Date(b.ts));
  if (adminSortMode === 'fecha-desc')  list.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  if (adminSortMode === 'mesa-asc')    list.sort((a, b) => (a.mesa || 999) - (b.mesa || 999));
  if (adminSortMode === 'mesa-desc')   list.sort((a, b) => (b.mesa || 0)   - (a.mesa || 0));

  if (list.length === 0) {
    wrap.innerHTML = '<div class="empty-state">No se encontraron familias.</div>';
    return;
  }

  const rows = list.map((x, i) => {
    const fecha = x.ts
      ? new Date(x.ts).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';
    const color   = tableColor(x.mesa);
    const mesaVal = x.mesa || '';
    return `<tr>
      <td class="td-num">${i + 1}</td>
      <td class="td-name">${escapeHtml(x.name)}</td>
      <td><span class="guest-count">${x.count}</span></td>
      <td class="td-fecha">${fecha}</td>
      <td class="td-mesa">
        <div class="mesa-wrap">
          ${x.mesa
            ? `<span class="mesa-badge" style="background:${color}">Mesa ${x.mesa}</span>`
            : `<span class="mesa-empty">—</span>`
          }
          <input  class="mesa-input" type="number" min="1" max="99"
                  value="${mesaVal}" placeholder="#"
                  data-id="${x.id}" data-current="${x.mesa || ''}">
          <button class="mesa-save-btn" data-id="${x.id}"
                  style="--mesa-color:${color}">
            Guardar
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table class="guest-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Familia</th>
          <th>Asist.</th>
          <th>Fecha</th>
          <th>Mesa</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  // Listeners de guardar mesa
  wrap.querySelectorAll('.mesa-save-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id    = this.dataset.id;
      const input = wrap.querySelector(`.mesa-input[data-id="${id}"]`);
      const val   = parseInt(input.value, 10);
      if (!val || val < 1) return;

      this.textContent = '…';
      this.disabled    = true;
      try {
        await update(ref(db, 'confirmaciones/' + id), { mesa: val });
      } catch(e) {
        console.error(e);
        this.textContent = 'Error';
        this.disabled    = false;
      }
    });
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
  const target = new Date('2026-06-20T12:00:00');
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


// ══════════════════════════════════════════
//  8. MODO FAMILIA PERSONALIZADA
//  Si la URL trae ?familia=ID, cargamos los datos de Firebase
//  y adaptamos el formulario de RSVP.
// ══════════════════════════════════════════

async function initFamiliaMode() {
  if (!FAMILIA_ID) return;

  try {
    const snap = await get(ref(db, 'familias/' + FAMILIA_ID));
    if (!snap.exists()) return;

    familiaData = snap.val();
    const maxGuests = familiaData.maxGuests || 10;
    const famName   = familiaData.name      || '';

    // Ocultar completamente el campo de nombre — no lo necesitan escribir
    const nameGroup = document.getElementById('familyName')?.closest('.form-group');
    if (nameGroup) nameGroup.style.display = 'none';

    // Igual rellenar el value para que el submit lo tome
    const nameInput = document.getElementById('familyName');
    if (nameInput) nameInput.value = famName;

    // Reconstruir el select limitado al máximo de invitados asignados
    const countInput = document.getElementById('guestCount');
    if (countInput) {
      countInput.innerHTML = '';
      for (let i = 1; i <= maxGuests; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i === 1 ? '1 persona' : `${i} personas`;
        countInput.appendChild(opt);
      }
    }

    // Cambiar label del select para que sea más claro
    const countGroup = document.getElementById('guestCount')?.closest('.form-group');
    if (countGroup) {
      const lbl = countGroup.querySelector('label');
      if (lbl) lbl.textContent = `¿Cuántos asistirán? (máximo ${maxGuests})`;
    }

    // Badge de bienvenida personalizado encima del formulario
    const rsvpInner = document.querySelector('.rsvp-inner');
    if (rsvpInner) {
      const badge = document.createElement('div');
      badge.style.cssText = `
        background: rgba(201,168,76,0.12);
        border: 1px solid rgba(201,168,76,0.35);
        padding: 16px 20px;
        margin-bottom: 20px;
        text-align: center;
        font-family: 'Cormorant Garamond', serif;
        font-style: italic;
        font-size: 1.1rem;
        color: var(--gold-light);
        line-height: 1.6;
      `;
      badge.innerHTML = `
        Invitación reservada para<br>
        <strong style="font-size:1.25rem;color:#fff">${famName}</strong><br>
        <span style="font-size:0.82rem;opacity:0.75;font-style:normal;letter-spacing:0.08em;">
          ${maxGuests} LUGAR${maxGuests !== 1 ? 'ES' : ''} ASIGNADO${maxGuests !== 1 ? 'S' : ''}
        </span>`;
      rsvpInner.insertBefore(badge, rsvpInner.querySelector('.rsvp-form'));
    }

  } catch(err) {
    console.warn('No se pudo cargar datos de familia:', err);
  }
}

initFamiliaMode();


// ══════════════════════════════════════════
//  9. PANEL ADMIN — GESTIÓN DE FAMILIAS
//  Pestaña nueva en el modal de admin para
//  registrar familias y sus cupos máximos.
// ══════════════════════════════════════════

let familiesUnsubscribe = null;
let adminTab = 'confirmaciones'; // 'confirmaciones' | 'familias'

/** Inyecta las pestañas en el modal admin (se llama una sola vez) */
function injectAdminTabs() {
  const panel = document.getElementById('adminPanel');
  if (panel.querySelector('.admin-tabs')) return;

  // Tabs
  const tabBar = document.createElement('div');
  tabBar.className = 'admin-tabs';
  tabBar.innerHTML = `
    <button class="admin-tab active" data-tab="confirmaciones">Confirmaciones</button>
    <button class="admin-tab"        data-tab="familias">Familias invitadas</button>
  `;
  panel.insertBefore(tabBar, panel.firstChild);

  tabBar.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      tabBar.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      adminTab = this.dataset.tab;
      renderAdminView();
    });
  });

  // Contenedor que alterna entre las dos vistas
  const viewWrap = document.createElement('div');
  viewWrap.id = 'adminViewWrap';
  panel.insertBefore(viewWrap, panel.querySelector('.guest-list-header'));
}

function renderAdminView() {
  if (adminTab === 'confirmaciones') {
    showConfirmacionesView();
  } else {
    showFamiliasView();
  }
}

// ── Vista Confirmaciones (la original) ───────────────────────────
function showConfirmacionesView() {
  const viewWrap = document.getElementById('adminViewWrap');
  viewWrap.innerHTML = '';

  // Controles de búsqueda/sort (los reinsertamos aquí)
  const controls = document.createElement('div');
  controls.id = 'adminControls2';
  controls.innerHTML = `
    <div class="admin-controls-bar">
      <input id="adminSearch2" class="admin-search" type="text" placeholder="🔍 Buscar familia…" value="${adminSearchQuery}">
      <select id="adminSort2" class="admin-sort">
        <option value="fecha-asc">Fecha ↑</option>
        <option value="fecha-desc">Fecha ↓</option>
        <option value="mesa-asc">Mesa ↑</option>
        <option value="mesa-desc">Mesa ↓</option>
        <option value="sin-mesa">Sin mesa</option>
      </select>
    </div>`;
  viewWrap.appendChild(controls);

  document.getElementById('adminSearch2').value = adminSearchQuery;
  document.getElementById('adminSort2').value   = adminSortMode;

  document.getElementById('adminSearch2').addEventListener('input', function() {
    adminSearchQuery = this.value.toLowerCase().trim();
    renderAdminTable();
  });
  document.getElementById('adminSort2').addEventListener('change', function() {
    adminSortMode = this.value;
    renderAdminTable();
  });

  const tableWrap = document.createElement('div');
  tableWrap.id = 'guestListWrap2';
  viewWrap.appendChild(tableWrap);

  // redirigir guestListWrap a guestListWrap2
  renderAdminTableIn('guestListWrap2');
}

// Versión de renderAdminTable que escribe en un contenedor específico
function renderAdminTableIn(containerId) {
  const wrap = document.getElementById(containerId) || document.getElementById('guestListWrap');
  if (!wrap) return;

  let list = adminList.filter(x => x.name.toLowerCase().includes(adminSearchQuery));
  if (adminSortMode === 'sin-mesa') list = list.filter(x => !x.mesa);
  if (adminSortMode === 'fecha-asc')  list.sort((a,b) => new Date(a.ts) - new Date(b.ts));
  if (adminSortMode === 'fecha-desc') list.sort((a,b) => new Date(b.ts) - new Date(a.ts));
  if (adminSortMode === 'mesa-asc')   list.sort((a,b) => (a.mesa||999) - (b.mesa||999));
  if (adminSortMode === 'mesa-desc')  list.sort((a,b) => (b.mesa||0)   - (a.mesa||0));

  if (list.length === 0) {
    wrap.innerHTML = '<div class="empty-state">No se encontraron familias.</div>';
    return;
  }

  const rows = list.map((x, i) => {
    const fecha  = x.ts ? new Date(x.ts).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) : '—';
    const color  = tableColor(x.mesa);
    const mesaVal = x.mesa || '';
    return `<tr>
      <td class="td-num"  data-label="#">${i+1}</td>
      <td class="td-name" data-label="Familia">${escapeHtml(x.name)}</td>
      <td class="td-count" data-label="Asist."><span class="guest-count">${x.count}</span></td>
      <td class="td-fecha" data-label="Fecha">${fecha}</td>
      <td class="td-mesa"  data-label="Mesa">
        <div class="mesa-wrap">
          ${x.mesa ? `<span class="mesa-badge" style="background:${color}">Mesa ${x.mesa}</span>` : '<span class="mesa-empty">—</span>'}
          <input class="mesa-input" type="number" min="1" max="99" value="${mesaVal}" placeholder="#" data-id="${x.id}" data-current="${x.mesa||''}">
          <button class="mesa-save-btn" data-id="${x.id}" style="--mesa-color:${color}">Guardar</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table class="guest-table">
      <thead><tr><th>#</th><th>Familia</th><th>Asist.</th><th>Fecha</th><th>Mesa</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  wrap.querySelectorAll('.mesa-save-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id    = this.dataset.id;
      const input = wrap.querySelector(`.mesa-input[data-id="${id}"]`);
      const val   = parseInt(input.value, 10);
      if (!val || val < 1) return;
      this.textContent = '…';
      this.disabled    = true;
      try {
        await update(ref(db, 'confirmaciones/' + id), { mesa: val });
      } catch(e) {
        console.error(e);
        this.textContent = 'Error';
        this.disabled    = false;
      }
    });
  });
}

// ── Vista Familias invitadas ──────────────────────────────────────
let allFamilias = [];

function showFamiliasView() {
  const viewWrap = document.getElementById('adminViewWrap');
  viewWrap.innerHTML = `
    <div class="familias-add-form">
      <input  id="famNameInput"   class="admin-search" type="text"   placeholder="Nombre de la familia" style="flex:2">
      <input  id="famGuestsInput" class="admin-search" type="number" min="1" max="20" placeholder="Máx. invitados" style="flex:0.6;min-width:90px">
      <button id="famAddBtn" class="mesa-save-btn" style="--mesa-color:#3a5a8c;padding:8px 16px">Agregar</button>
    </div>
    <div id="famListWrap" style="margin-top:12px"></div>`;

  document.getElementById('famAddBtn').addEventListener('click', addFamilia);
  document.getElementById('famNameInput').addEventListener('keydown', e => { if(e.key==='Enter') addFamilia(); });

  listenToFamilias();
}

async function addFamilia() {
  const nameEl   = document.getElementById('famNameInput');
  const guestsEl = document.getElementById('famGuestsInput');
  const name     = nameEl.value.trim();
  const max      = parseInt(guestsEl.value, 10);

  if (!name || !max || max < 1) return;

  const famBtn = document.getElementById('famAddBtn');
  famBtn.disabled = true;
  famBtn.textContent = '…';

  try {
    const newRef = await push(FAMILY_REF, {
      name,
      maxGuests: max,
      createdAt: new Date().toISOString()
    });
    nameEl.value   = '';
    guestsEl.value = '';
  } catch(e) {
    console.error(e);
    alert('Error al guardar. Revisa tu conexión.');
  } finally {
    famBtn.disabled    = false;
    famBtn.textContent = 'Agregar';
  }
}

function listenToFamilias() {
  if (familiesUnsubscribe) { familiesUnsubscribe(); familiesUnsubscribe = null; }

  familiesUnsubscribe = onValue(FAMILY_REF, snap => {
    allFamilias = [];
    if (snap.exists()) {
      snap.forEach(child => {
        allFamilias.push({ id: child.key, ...child.val() });
      });
    }
    renderFamiliasTable();
  });
}

const BASE_PAGE_URL = 'https://ricardodev17.github.io/Invitaci-n/';

function renderFamiliasTable() {
  const wrap = document.getElementById('famListWrap');
  if (!wrap) return;

  if (allFamilias.length === 0) {
    wrap.innerHTML = '<div class="empty-state">Aún no hay familias registradas.</div>';
    return;
  }

  const rows = allFamilias.map((f, i) => {
    const link = `${BASE_PAGE_URL}?familia=${f.id}`;
    return `<tr>
      <td class="td-num"  data-label="#">${i+1}</td>
      <td class="td-name" data-label="Familia">${escapeHtml(f.name)}</td>
      <td class="td-count" data-label="Máx."><span class="guest-count">${f.maxGuests}</span></td>
      <td class="td-fecha" data-label="Link">
        <a href="${link}" target="_blank" class="fam-link" title="${link}">Ver</a>
        <button class="fam-copy-btn" data-link="${link}" title="Copiar link">📋</button>
      </td>
      <td data-label="PDF">
        <button class="fam-pdf-btn" data-id="${f.id}" data-name="${f.name}" data-guests="${f.maxGuests}" data-link="${link}" title="Descargar PDF">⬇ PDF</button>
      </td>
      <td data-label="Eliminar">
        <button class="fam-del-btn" data-id="${f.id}" title="Eliminar familia">✕</button>
      </td>
    </tr>`;
  }).join('');

  const total = allFamilias.reduce((s,f) => s + (f.maxGuests||0), 0);

  wrap.innerHTML = `
    <div class="guest-list-header" style="margin-bottom:10px">
      <h3 style="font-family:'Cinzel',serif;font-size:0.95rem;font-weight:400">Familias registradas</h3>
      <div class="total-badge">Total: ${total} lugares</div>
    </div>
    <div style="max-height:45vh;overflow-y:auto;border:1px solid rgba(201,168,76,0.2)">
      <table class="guest-table">
        <thead><tr><th>#</th><th>Familia</th><th>Máx.</th><th>Link</th><th>PDF</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  // Copiar link
  wrap.querySelectorAll('.fam-copy-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      navigator.clipboard.writeText(this.dataset.link).then(() => {
        const orig = this.textContent;
        this.textContent = '✓';
        setTimeout(() => { this.textContent = orig; }, 1500);
      });
    });
  });

  // Generar PDF
  wrap.querySelectorAll('.fam-pdf-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const name   = this.dataset.name;
      const guests = parseInt(this.dataset.guests, 10);
      const link   = this.dataset.link;
      generarPDF(name, guests, link);
    });
  });

  // Eliminar familia
  wrap.querySelectorAll('.fam-del-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const id = this.dataset.id;
      const fam = allFamilias.find(f => f.id === id);
      if (!fam) return;
      if (!confirm(`¿Eliminar a "${fam.name}"?`)) return;
      try {
        await remove(ref(db, 'familias/' + id));
      } catch(e) {
        console.error(e);
        alert('Error al eliminar.');
      }
    });
  });
}


async function generarPDF(familyName, maxGuests, pageLink) {
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const W = 210;
  const H = 297;

try {
  const response = await fetch('/invitacion.jpg');
  const blob = await response.blob();

  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  doc.addImage(base64, 'JPEG', 0, 0, W, H);

} catch (err) {
  console.error('No se pudo cargar invitacion.jpg', err);
}

  // ─────────────────────────────
  // NOMBRE DE FAMILIA
  // ─────────────────────────────
  doc.setTextColor(58, 90, 140);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(35);
  doc.text(familyName, W / 2, 260, { align: 'center' });

  // ─────────────────────────────
  // PASES
  // ─────────────────────────────
  doc.setTextColor(0, 0, 0);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text(String(maxGuests + " pases"), W / 2, 270, { align: 'center' });

    const btnX = 42;
    const btnY = 275;
    const btnW = 126;
    const btnH = 15;

  doc.setFillColor(58, 90, 140);
  doc.roundedRect(btnX, btnY, btnW, btnH, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text('CONFIRMA AQUÍ', W / 2, btnY + 9.7, { align: 'center' });

  doc.link(btnX, btnY, btnW, btnH, {
    url: pageLink
  });

  const safeName = familyName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');

  doc.save(`Invitacion_${safeName}.pdf`);
}