import jwtDecode from 'https://cdn.jsdelivr.net/npm/jwt-decode/+esm';

/* ---------- Protección de ruta (JWT) ---------- */
const pathname = new URL(location.href).pathname;
const ES_PRIVADA = /\/(?:registro|productos|editar)\.html$/i.test(pathname);
if (ES_PRIVADA) {
  const salir = () => {
    localStorage.removeItem('token');
    location.replace('/inicio/index.html');
  };

  const token = localStorage.getItem('token');
const res = await fetch('http://localhost:4000/api/productos', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

  (async () => {
    if (!token || !tokenValidoLocal(token) || !(await tokenValidoServidor(token))) {
      salir();
    }
  })();
}

/* ---------- Registro de productos (JS) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ JS cargado');

  /* ---- DOM ---- */
  const form        = document.getElementById('uploadForm');
  const btn         = document.getElementById('btnRegistrar');
  const mensajeDiv  = document.getElementById('registroMensaje');
  const previewDiv  = document.getElementById('imagenPreview');
  const modal       = document.getElementById('modalExito');
  const cerrarModal = document.getElementById('cerrarModal');
  const searchInput = document.getElementById('searchInput');
  const galeria     = document.getElementById('galeria');

  if (!form) { console.error('No se encontró #uploadForm'); return; }

  /* ---- Configuración ---- */
  const API = 'http://localhost:4000/api';
  let productos = [];

  /* ---- Helpers ---- */
  const mostrarMensaje = (txt, err = false) => {
    mensajeDiv.textContent   = txt;
    mensajeDiv.className     = err ? 'error' : 'exito';
    mensajeDiv.style.display  = 'block';
    setTimeout(() => mensajeDiv.style.display = 'none', 3000);
  };

  const redirSi401 = res => {
    if (res.status === 401 || res.status === 403) {
      location.replace('/inicio/index.html');
      return true;
    }
    return false;
  };

  const fetchConCookie = (endpoint, opts = {}) =>
    fetch(`${API}${endpoint}`, { credentials: 'include', ...opts });

  /* ---- Vista previa de imagen ---- */
  form.imagen.addEventListener('change', e => {
    previewDiv.innerHTML = '';
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => previewDiv.innerHTML = `<img src="${ev.target.result}" style="max-width:300px">`;
    reader.readAsDataURL(file);
  });

  /* ---- Registrar producto ---- */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const res = await fetchConCookie('/productos', { method: 'POST', body: formData });
      if (redirSi401(res)) return;
      const data = await res.json();

      if (res.status === 409) return mostrarMensaje(data.message, true);
      if (!res.ok) return mostrarMensaje(data.message || 'Error inesperado', true);

      mostrarMensaje('Producto registrado');
      modal.style.display = 'flex';
      setTimeout(() => modal.style.display = 'none', 2000);
      form.reset(); previewDiv.innerHTML = '';
      await cargarProductos();
    } catch (err) {
      console.error('Error de red:', err);
      mostrarMensaje('Error de red', true);
    }
  });

  btn?.addEventListener('click', () => form.requestSubmit());
  cerrarModal?.addEventListener('click', () => modal.style.display = 'none');

  /* ---- Renderizar galería ---- */
  const renderGaleria = (lista = productos) => {
    if (!galeria) return;
    galeria.innerHTML = !lista.length ? '<p class="vacio">Sin resultados…</p>'
      : lista.map(p => `
        <div class="producto-card">
          <img src="${API}${p.imagen}" alt="${p.nombre_producto}" style="max-width:120px;">
          <h4>${p.nombre_producto}</h4>
          <p>Código: ${p.codigo_producto}</p>
          <p>Precio: $${p.precio}</p>
        </div>`).join('');
  };

  /* ---- Buscador ---- */
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    const lista = q
      ? productos.filter(p =>
          p.codigo_producto.toLowerCase().includes(q) ||
          p.nombre_producto.toLowerCase().includes(q)
        )
      : productos;
    renderGaleria(lista);
  });

  /* ---- Cargar productos ---- */
  const cargarProductos = async () => {
    try {
      const res = await fetchConCookie('/productos');
      if (redirSi401(res)) return;
      productos = await res.json();
      renderGaleria();
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  /* ---- Inicialización ---- */
  cargarProductos();
});
