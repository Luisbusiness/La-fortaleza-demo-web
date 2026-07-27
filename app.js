/* ============================================
   ABASTO LA FORTALEZA — app.js
   - Navegación / hamburger
   - Carrito con selector de productos
   - Calculadora de mercado semanal
   - Envío por WhatsApp
============================================ */

const WA_NUMBER = '584241270915';

/* ===== NAV / HAMBURGER ===== */
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');
const header    = document.getElementById('header');

hamburger.addEventListener('click', () => {
  nav.classList.toggle('open');
  hamburger.classList.toggle('open');
});

nav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// Header shadow on scroll
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10
    ? '0 2px 20px rgba(0,0,0,0.2)'
    : 'none';
});

/* ===== CARRITO STATE ===== */
let carrito = []; // { id, name, qty, unit, pricePerUnit, subtotal }

/* ===== CARRITO DRAWER ===== */
const drawer         = document.getElementById('carrito-drawer');
const overlay        = document.getElementById('carrito-overlay');
const btnAbrirArr    = [
  document.getElementById('btn-abrir-carrito'),
  document.getElementById('hero-btn-carrito'),
];
const btnCerrar      = document.getElementById('carrito-cerrar');
const productoSelect = document.getElementById('producto-select');
const cantidadInput  = document.getElementById('cantidad-input');
const cantidadUnit   = document.getElementById('cantidad-unit');
const btnAgregar     = document.getElementById('btn-agregar');
const carritoItems   = document.getElementById('carrito-items');
const carritoTotal   = document.getElementById('carrito-total');
const btnWhatsapp    = document.getElementById('btn-whatsapp');

function abrirCarrito() {
  drawer.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function cerrarCarrito() {
  drawer.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

btnAbrirArr.forEach(btn => btn && btn.addEventListener('click', abrirCarrito));
btnCerrar.addEventListener('click', cerrarCarrito);
overlay.addEventListener('click', cerrarCarrito);

// Product category buttons → open cart
document.querySelectorAll('.btn-cat').forEach(btn => {
  btn.addEventListener('click', abrirCarrito);
});

// Update unit label based on selected product
function getUnitFromOption(val) {
  if (!val) return 'kg';
  // Bebidas → 'und', others → 'kg' or 'l'
  if (val.includes('Refresco') || val.includes('Agua') || val.includes('Jugo') || val.includes('Leche') || val.includes('Yogurt') || val.includes('Mantequilla') || val.includes('Crema')) return 'und';
  if (val.includes('Aceite')) return 'l';
  return 'kg';
}

productoSelect.addEventListener('change', () => {
  const val = productoSelect.value;
  const unit = getUnitFromOption(val.split('|')[0]);
  cantidadUnit.textContent = unit;
  cantidadInput.value = 1;
  cantidadInput.step = unit === 'kg' ? '0.1' : '1';
});

// Add item to cart
btnAgregar.addEventListener('click', () => {
  const raw = productoSelect.value;
  if (!raw) return;
  const [name, priceStr] = raw.split('|');
  const price = parseFloat(priceStr);
  const qty   = parseFloat(cantidadInput.value);
  if (isNaN(qty) || qty <= 0) return;
  const unit = getUnitFromOption(name);

  const id = Date.now();
  const subtotal = parseFloat((price * qty).toFixed(2));
  carrito.push({ id, name, qty, unit, pricePerUnit: price, subtotal });

  renderCarrito();
  cantidadInput.value = 1;
});

function renderCarrito() {
  // Items
  if (carrito.length === 0) {
    carritoItems.innerHTML = '<p class="carrito-vacio">Tu pedido está vacío. Agrega productos arriba.</p>';
    btnWhatsapp.disabled = true;
    carritoTotal.textContent = '$0.00';
    return;
  }

  carritoItems.innerHTML = carrito.map(item => `
    <div class="carrito-item" data-id="${item.id}">
      <div class="carrito-item-info">
        <div class="carrito-item-name">${item.name}</div>
        <div class="carrito-item-detail">${item.qty} ${item.unit} × $${item.pricePerUnit.toFixed(2)}</div>
      </div>
      <div class="carrito-item-price">$${item.subtotal.toFixed(2)}</div>
      <button class="carrito-item-remove" data-id="${item.id}" aria-label="Eliminar">✕</button>
    </div>
  `).join('');

  // Remove listeners
  carritoItems.querySelectorAll('.carrito-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      carrito = carrito.filter(i => i.id !== id);
      renderCarrito();
    });
  });

  // Total
  const total = carrito.reduce((acc, i) => acc + i.subtotal, 0);
  carritoTotal.textContent = `$${total.toFixed(2)}`;
  btnWhatsapp.disabled = false;
}

// Build and open WhatsApp message
function buildWaMsg(itemsArr, total, note) {
  const lineas = itemsArr.map(i => `• ${i.name}: ${i.qty} ${i.unit} ≈ $${i.subtotal.toFixed(2)}`).join('\n');
  const msg = `¡Hola! Quiero hacer el siguiente pedido desde su página web 🛒\n\n${lineas}\n\n*Total estimado: $${total.toFixed(2)}*\n${note || ''}\nPor favor confirmar disponibilidad y precio final. ¡Gracias!`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

btnWhatsapp.addEventListener('click', () => {
  if (carrito.length === 0) return;
  const total = carrito.reduce((acc, i) => acc + i.subtotal, 0);
  const url = buildWaMsg(carrito, total, '');
  window.open(url, '_blank');
});

/* ===== CALCULADORA DE MERCADO SEMANAL ===== */
const CANASTA_BASE = [
  { emoji: '🌽', name: 'Harina PAN',        unit: 'kg',  perAdulto: 0.5, precio: 0.90 },
  { emoji: '🍚', name: 'Arroz',             unit: 'kg',  perAdulto: 0.5, precio: 0.80 },
  { emoji: '🍝', name: 'Pasta',             unit: 'kg',  perAdulto: 0.3, precio: 0.70 },
  { emoji: '🫙', name: 'Caraotas negras',   unit: 'kg',  perAdulto: 0.25,precio: 1.20 },
  { emoji: '🛢️', name: 'Aceite vegetal',    unit: 'l',   perAdulto: 0.25,precio: 1.80 },
  { emoji: '🧀', name: 'Queso blanco',      unit: 'kg',  perAdulto: 0.25,precio: 3.50 },
  { emoji: '🥓', name: 'Mortadela',         unit: 'kg',  perAdulto: 0.2, precio: 4.50 },
  { emoji: '🍬', name: 'Azúcar',            unit: 'kg',  perAdulto: 0.3, precio: 0.90 },
  { emoji: '🥛', name: 'Leche UHT',         unit: 'l',   perAdulto: 0.5, precio: 1.30 },
];

const FACTOR_NINO = 0.65; // children consume ~65% of adult amount

let adultos = 2;
let ninos   = 1;
let listaSemanal = [];

// Counter controls
document.querySelectorAll('.counter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    const action = btn.dataset.action;
    const el = document.getElementById(target);
    let val = parseInt(el.textContent);
    if (action === 'plus')  val = Math.min(val + 1, 12);
    if (action === 'minus') val = Math.max(val - 1, 0);
    el.textContent = val;
    if (target === 'adultos') adultos = val;
    if (target === 'ninos')   ninos   = val;
  });
});

const btnCalcular      = document.getElementById('btn-calcular');
const resultadoEl      = document.getElementById('mercado-resultado');
const resultadoPersonas = document.getElementById('resultado-personas');
const resultadoItemsEl  = document.getElementById('resultado-items');
const resultadoTotalEl  = document.getElementById('resultado-total-val');
const btnEnviarLista    = document.getElementById('btn-enviar-lista');

// Initial placeholder state
resultadoItemsEl.innerHTML = `
  <div class="resultado-placeholder">
    <span class="placeholder-icon">📋</span>
    <span>Ajusta las personas y presiona<br><strong>Calcular mi lista</strong></span>
  </div>`;
resultadoTotalEl.textContent = '$0.00';

btnCalcular.addEventListener('click', () => {
  adultos = parseInt(document.getElementById('adultos').textContent) || 0;
  ninos   = parseInt(document.getElementById('ninos').textContent)   || 0;

  if (adultos + ninos === 0) {
    resultadoItemsEl.innerHTML = `<div class="resultado-placeholder"><span class="placeholder-icon">🤔</span><span>Agrega al menos una persona</span></div>`;
    resultadoTotalEl.textContent = '$0.00';
    btnEnviarLista.classList.remove('active');
    return;
  }

  const unidadesEquivalentes = adultos + ninos * FACTOR_NINO;

  listaSemanal = CANASTA_BASE.map(item => {
    const qty = parseFloat((item.perAdulto * unidadesEquivalentes).toFixed(2));
    const subtotal = parseFloat((qty * item.precio).toFixed(2));
    return { ...item, qty, subtotal };
  });

  const total = listaSemanal.reduce((acc, i) => acc + i.subtotal, 0);
  const personas = adultos + ninos;
  resultadoPersonas.textContent = `${personas} persona${personas !== 1 ? 's' : ''}`;

  resultadoItemsEl.innerHTML = listaSemanal.map(item => `
    <div class="resultado-item">
      <span class="resultado-item-name">${item.emoji} ${item.name}</span>
      <span class="resultado-item-qty">${item.qty} ${item.unit}</span>
      <span class="resultado-item-price">≈ $${item.subtotal.toFixed(2)}</span>
    </div>
  `).join('');

  resultadoTotalEl.textContent = `≈ $${total.toFixed(2)}`;
  btnEnviarLista.classList.add('active');
});

btnEnviarLista.addEventListener('click', () => {
  if (listaSemanal.length === 0) return;
  const total = listaSemanal.reduce((acc, i) => acc + i.subtotal, 0);
  const items = listaSemanal.map(i => ({
    name: `${i.emoji} ${i.name}`,
    qty: i.qty,
    unit: i.unit,
    pricePerUnit: i.precio,
    subtotal: i.subtotal
  }));
  const note = `_(Lista semanal calculada para ${adultos} adulto${adultos !== 1 ? 's' : ''} y ${ninos} niño${ninos !== 1 ? 's' : ''})_`;
  const url = buildWaMsg(items, total, note);
  window.open(url, '_blank');
});

/* ===== SMOOTH SCROLL fallback for older browsers ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
