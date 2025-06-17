/* *******************************************************************************************
 * Papelera Apack – Galería, Carrito e Historial                                                 
 * Script COMPLETO + envío de pedido por WhatsApp                                                
 * ==========================================================================================   
 *  • Persiste carrito en localStorage (LS_KEY = "miCarrito")                                  
 *  • Delegación para eliminar ítems                                                            
 *  • Contador centralizado                                                                     
 *  • Botón #btnWhatsapp genera un mensaje con la lista y total                                 
 *  • Funciones globales (HTML inline): ampliarImagen, agregarAlCarrito,                        
 *    mostrarModalCarrito, cerrarHistorial                                                      
 ******************************************************************************************* */

/******************************************
 * 1. Persistencia y configuración
 *****************************************/
const LS_KEY = 'miCarrito';
const PHONE  = '5491125880227';   // ← cambia a tu número sin el “+”

const loadFromLS = () => JSON.parse(localStorage.getItem(LS_KEY)) || [];
const saveToLS   = data => localStorage.setItem(LS_KEY, JSON.stringify(data));

/******************************************
 * 2. Estado global
 *****************************************/
let productos = [];  // vendrá de la API
let carrito   = loadFromLS();

/******************************************
 * 3. Iniciar cuando el DOM está listo
 *****************************************/
document.addEventListener('DOMContentLoaded', () => {
  /* ---------- 3.1 Referencias DOM ---------- */
  const galeria         = document.getElementById('galeria');
  const visor           = document.getElementById('visorImagen');
  const imagenAmpliada  = document.getElementById('imagenAmpliada');
  const btnCerrarVisor  = document.querySelector('#visorImagen .cerrar');

  const searchInput     = document.getElementById('searchInput');
  const badge           = document.getElementById('contadorCarrito');

  // Carrito modal
  const modalCarrito    = document.getElementById('modalCarrito');
  const btnCerrarCarrito= document.getElementById('cerrarModalCarrito');
  const listaCarrito    = document.getElementById('listaCarrito');
  const btnAbrirCarrito = document.querySelector('.carrito-icono');

  // Historial modal
  const modalHistorial  = document.getElementById('modalHistorial');
  const btnAbrirHist    = document.getElementById('btnAbrirModal2');
  const btnCerrarHist   = document.getElementById('cerrarModal2');
  const listaHistorial  = document.getElementById('listaHistorial');

  // Botón WhatsApp
  const btnWhatsapp     = document.getElementById('btnWhatsapp');
  const waFab          = document.querySelector('.wa-fab'); 
  
  /*********************** Helpers *************************/
  const actualizarBadge = () => {
    const badgeEl = document.getElementById('contadorCarrito');
    if (!badgeEl) return;                    // ← si no existe, salimos
  
    const total   = carrito.reduce((s, i) => s + i.cantidad, 0);
    const display = total > 99 ? '99+' : total;  // muestra 99+ a partir de 100
  
    badgeEl.textContent = total;             // (si usas el span aparte)
    document
      .querySelector('.carrito-icono')
      ?.setAttribute('data-count', display); // badge del ::after
  };

  /* ==== MODAL HISTORIAL (único cambio relevante) ==== */
  function abrirHistorial() {
    renderHistorial();                    // pinta la lista
    modalHistorial.style.display = 'flex';// lo hace visible
    waFab.style.display = 'none';
  }
  function cerrarHistorial() {
    modalHistorial.style.display = 'none';
    waFab.style.display = 'flex';
  }

  /* ---------- WhatsApp ---------- */
  const buildWpURL = () => {
    // 1 · elimina espacios, guiones, etc.
    const phone = PHONE.replace(/\D+/g, '');   // ← solo dígitos
    
    // 2 · URL base
    const base  = 'https://api.whatsapp.com/send';
  
    // 3 · Si el carrito está vacío
    if (!carrito.length)
      return `${base}?phone=${encodeURIComponent(phone)}`;
  
    // 4 · Mensaje con productos
    const lineas = carrito.map(p => {
      const subtotal = p.precio * p.cantidad;
      return `• *${p.codigo}*  ${p.nombre}  x${p.cantidad}\n   👉  $${subtotal}`;
    });
    const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);

     /* 3) === AQUÍ EDITAS EL MENSAJE === */
    const msg = [
      '🛒 *¡Hola! Quiero confirmar mi pedido:*',
      '',
      ...lineas,
      '',
      `💰 *Total a pagar:* $${total}`,
      '🙏 Quedo atento a tu confirmación.'
    ].join('\n'); 
  
    // 5 · URL final
    return `${base}?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(msg)}`;
  };

/* click */
btnWhatsapp?.addEventListener('click', e => {
  e.preventDefault();
  window.open(buildWpURL(), '_blank');
  console.log('URL generada →', buildWpURL());
  cerrarHistorial();              // cierra modal
});

  /********************** 3.3 Historial **********************/


  document.addEventListener('click', e => {
    const wpBtn = e.target.closest('#btnWhatsapp');
    if (!wpBtn) return;                  // el clic no es en el botón
  
    e.preventDefault();                  // evita navegación por defecto
  
    const url = buildWpURL();            // genera la URL de WhatsApp
    console.log('URL generada →', url);  // ← deberías verla ahora sí
    window.open(url, '_blank');          // abre WhatsApp
    cerrarHistorial();                   // cierra el modal
  });

  const renderHistorial = () => {
    carrito = loadFromLS();
    listaHistorial.innerHTML = '';
  
    if (!carrito.length) {
      listaHistorial.innerHTML =
        '<li class="vacio">No hay productos en tu lista.</li>';
      if (btnWhatsapp) btnWhatsapp.href = buildWpURL();   // ← chequeo
      return;
    }
  
    carrito.forEach(p => {
      listaHistorial.insertAdjacentHTML('beforeend', `
        <li class="historial-item">
          <img src="${p.imagen}" alt="${p.nombre}" class="thumb-historial">
          <div class="detalle">
            <span class="codigo">${p.codigo}</span>
            <span class="nombre">${p.nombre}</span>
            <span class="precio">$${p.precio}</span>
            <span class="cantidad">${p.cantidad}</span>
          </div>
          <button class="btn borrar-historial"
                  data-codigo="${p.codigo}">
            <i class="fas fa-trash"></i>
          </button>
        </li>`);
        setTimeout(() => {                 // espera a que el <a> ya esté en el DOM
          const btnWhatsapp = document.getElementById('btnWhatsapp');
          if (btnWhatsapp && !btnWhatsapp.dataset.listener) {
            btnWhatsapp.dataset.listener = 'true'; // evita duplicarlo
          }
        }, 0);
    });

    const totalArt = carrito.reduce((s,i)=>s+i.cantidad,0);
    const total$$  = carrito.reduce((s,i)=>s+i.precio*i.cantidad,0);
  
    listaHistorial.insertAdjacentHTML('beforeend', `
      <li class="historial-summary">
        <div class="detalle summary">
          <span><strong>Total artículos:</strong> ${totalArt}</span>
          <span><strong>Precio total:</strong> $${total$$}</span>
        </div>
      </li>`);
  
    if (btnWhatsapp) btnWhatsapp.href = buildWpURL();      // ← chequeo
  };

  // Delegación eliminar ítem en historial
  listaHistorial.addEventListener('click', e=>{
    const btn=e.target.closest('.borrar-historial');
    if(!btn) return;
    carrito = carrito.filter(p=>p.codigo!==btn.dataset.codigo);
    saveToLS(carrito);
    actualizarBadge();
    renderHistorial();
  });

  btnAbrirHist   ?.addEventListener('click', abrirHistorial);
  btnAbrirCarrito?.addEventListener('click', abrirHistorial); // ícono carrito
  btnCerrarHist  ?.addEventListener('click', cerrarHistorial);
  modalHistorial.addEventListener('click', e => {
    if (e.target === modalHistorial) cerrarHistorial();
  });
  /* necesario si tu HTML usa onclick="cerrarHistorial()" */
  window.cerrarHistorial = cerrarHistorial;

  /********************** 3.4 Galería ***********************/
  const renderGaleria = (lista = productos) => {
    galeria.innerHTML = '';
    if (!lista.length) {
      galeria.innerHTML = '<p class="vacio">Sin resultados…</p>';
      return;
    }

    lista.forEach(p => {
      galeria.insertAdjacentHTML('beforeend', `
        <div class="producto-card">
          <img src="${p.imagen}" alt="${p.nombre}" onclick="ampliarImagen('${p.imagen}')">
          <h4>${p.nombre}</h4>
          <p><strong>Código:</strong> ${p.codigo}</p>
          <p><strong>Precio:</strong> $${p.precio}</p>
          <div class="acciones">
            <input type="number" min="1" value="1" class="cantidad-input" id="cantidad-${p.codigo}">
            <button class="btn" onclick="agregarAlCarrito('${p.codigo}')"><span class="emoji-icon">🛒</span> Agregar</button>
          </div>
        </div>`);
    });
  };

  const fetchProductos = async () => {
    try {
      const API_BASE = location.origin;  // se adapta automáticamente a producción
      const res = await fetch(`${API_BASE}/api/imagenes`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      productos = await res.json();
      renderGaleria();
    } catch (err) {
      console.error(err);
      galeria.innerHTML = '<p class="error">Error al cargar productos</p>';
    }
  };
  

  /********************** 3.5 Buscador ***********************/
  let filtroTimeout;
  searchInput?.addEventListener('input', e => {
    clearTimeout(filtroTimeout);
    filtroTimeout = setTimeout(() => {
      const term = e.target.value.trim().toLowerCase();
      const filtrados = productos.filter(p => (p.nombre || '').toLowerCase().includes(term) || (p.codigo || '').toLowerCase().includes(term));
      renderGaleria(filtrados);
    }, 300);
  });

  /********************** 3.6 Visor Imagen *****************/
  window.ampliarImagen = src => {
    imagenAmpliada.src = src;
    visor.style.display = 'flex';
  };
  btnCerrarVisor?.addEventListener('click', () => visor.style.display = 'none');
  visor.addEventListener('click', e => { if (e.target === visor) visor.style.display = 'none'; });

  /********************** 3.7 Carrito **************************/
  window.agregarAlCarrito = codigo => {
    const prod = productos.find(p => p.codigo === codigo);
    const cantidad = parseInt(document.getElementById(`cantidad-${codigo}`).value, 10) || 1;
    if (cantidad <= 0) return alert('Ingrese cantidad válida.');

    const item = carrito.find(i => i.codigo === codigo);
    if (item) item.cantidad += cantidad; else carrito.push({ ...prod, cantidad });

    saveToLS(carrito);
    actualizarBadge();
  };

  function renderModalCarrito() {
    listaCarrito.innerHTML = '';
  
    if (!carrito.length) {
      listaCarrito.innerHTML = '<p class="vacio">Carrito vacío.</p>';
      return;
    }
  
    carrito.forEach(item => {
      listaCarrito.insertAdjacentHTML('beforeend', `
        <li class="carrito-item">
          <img src="${item.imagen}" alt="${item.nombre}" class="thumb">
          <span>${item.nombre} – $${item.precio} x ${item.cantidad}</span>
          <button class="btn borrar" data-codigo="${item.codigo}">
            <i class="fas fa-trash"></i>
          </button>
        </li>`);
    });
  };

  // Delegación eliminar dentro del carrito
  listaCarrito.addEventListener('click', e => {
    const btn = e.target.closest('.borrar');
    if (!btn) return;
    carrito = carrito.filter(i => i.codigo !== btn.dataset.codigo);
    saveToLS(carrito);
    renderModalCarrito();
    actualizarBadge();
  });

  window.mostrarModalCarrito = () => {
    renderModalCarrito();          // <- nombre correcto
    modalCarrito.style.display = 'flex';
  };

  btnAbrirCarrito?.addEventListener('click', () => {
    abrirHistorial();          // 1) historial
    // mostrarModalCarrito();  // 2) carrito (si también lo quieres)
  });

  btnCerrarCarrito.addEventListener('click', () => modalCarrito.style.display = 'none');
  modalCarrito.addEventListener('click', e => { if (e.target === modalCarrito) modalCarrito.style.display = 'none'; });
  window.cerrarHistorial = cerrarHistorial;
  /************************ 3.8 Init ***************************/


  /* ========= WhatsApp – mensaje de saludo ========= */
const buildWpSaludo = () => {
  const phone   = PHONE.replace(/\D+/g, '');
  const saludo  = '👋 ¡Hola! Quisiera hacer una consulta.';
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(saludo)}`;
};

/* Listener exclusivo para el FAB de saludo */
document.querySelector('.wa-fab')?.addEventListener('click', e=>{
  e.preventDefault();
  const url = buildWpSaludo();
  window.open(url, '_blank');   // o location.href = url; si prefieres
});

  /* si quieres que se oculte mientras el carrito/historial está cerrado: */
  function toggleWaFab(show) { waFab.style.display = show ? 'flex' : 'none'; }
  actualizarBadge();
  fetchProductos();
});
