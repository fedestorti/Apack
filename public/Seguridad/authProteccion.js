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

  const tokenValidoLocal = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded && decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const tokenValidoServidor = async (token) => {
    try {
      const res = await fetch(`${location.origin}/api/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  (async () => {
    if (!token || !tokenValidoLocal(token) || !(await tokenValidoServidor(token))) {
      salir();
    }
  })();
}

/* ---------- Registro de productos (JS) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ JS cargado');

  const form        = document.getElementById('uploadForm');
  const btn         = document.getElementById('btnRegistrar');
  const mensajeDiv  = document.getElementById('registroMensaje');
  const previewDiv  = document.getElementById('imagenPreview');
  const modal       = document.getElementById('modalExito');
  const cerrarModal = document.getElementById('cerrarModal');
  const searchInput = document.getElementById('searchInput');
  const galeria     = document.getElementById('galeria');

  if (!form) return console.error('No se encontró #uploadForm');

  const token = localStorage.getItem('token');
  const API   = `${location.origin}/api`;
  let productos = [];

  const mostrarMensaje = (txt, err = false) => {
    mensajeDiv.textContent = txt;
    mensajeDiv.className = err ? 'error' : 'exito';
    mensajeDiv.style.display = 'block';
    setTimeout(() => mensajeDiv.style.display = 'none', 3000);
  };

  const redirSi401 = res => {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      location.replace('/inicio/index.html');
      return true;
    }
    return false;
  };

  const fetchConToken = (endpoint, opts = {}) =>
    fetch(`${API}${endpoint}`, {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });

  form.imagen.addEventListener('change', e => {
    previewDiv.innerHTML = '';
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      previewDiv.innerHTML = `<img src="${ev.target.result}" style="max-width:300px">`;
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(form);
    try {
      const res = await fetchConToken('/productos', {
        method: 'POST',
        body: formData
      });

      if (redirSi401(res)) return;
      const data = await res.json();

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

  const renderGaleria = (lista = productos) => {
    if (!galeria) return;
    galeria.innerHTML = !lista.length
      ? '<p class="vacio">Sin resultados…</p>'
      : lista.map(p => `
        <div class="producto-card">
          <img src="${API}${p.imagen}" alt="${p.nombre_producto}" style="max-width:120px;">
          <h4>${p.nombre_producto}</h4>
          <p>Código: ${p.codigo_producto}</p>
          <p>Precio: $${p.precio}</p>
        </div>`).join('');
  };

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

  const cargarProductos = async () => {
    try {
      const res = await fetchConToken('/productos');
      if (redirSi401(res)) return;
      productos = await res.json();
      renderGaleria();
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  cargarProductos();
});
