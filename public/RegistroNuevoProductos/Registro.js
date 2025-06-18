//Registro.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ JS cargado sin cookies');

  const form = document.getElementById('uploadForm');
  const btn = document.getElementById('btnRegistrar');
  const mensajeDiv = document.getElementById('registroMensaje');
  const previewDiv = document.getElementById('imagenPreview');
  const modal = document.getElementById('modalExito');
  const cerrarModal = document.getElementById('cerrarModal');
  const searchInput = document.getElementById('searchInput');
  const galeria = document.getElementById('galeria');

  if (!form) {
    console.error('No se encontró #uploadForm');
    return;
  }

  const API = `${location.origin}/api`; // Verifica que la URL sea correcta
  let productos = [];

  const mostrarMensaje = (txt, err = false) => {
    mensajeDiv.textContent = txt;
    mensajeDiv.className = err ? 'error' : 'exito';
    mensajeDiv.style.display = 'block';
    setTimeout(() => mensajeDiv.style.display = 'none', 3000);
  };

  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../inicio/index.html'; // Redirige si no hay token
    return;
  }

  const redirSi401 = res => {
    if (res.status === 401 || res.status === 403) {
      localStorage.clear();
      window.location.href = '/inicio/index.html';
      return true;
    }
    return false;
  };

  const fetchConToken = (endpoint, opts = {}) => {
    return fetch(`${API}${endpoint}`, {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });
  };

  form.imagen.addEventListener('change', e => {
    previewDiv.innerHTML = '';
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      previewDiv.innerHTML = `<img src="${API}${p.imagen}" style="max-width:300px">`;
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

      if (res.status === 409 || res.status === 400) {
        const { message } = await res.json();
        return mostrarMensaje(message, true);
      }

      if (!res.ok) {
        console.error('Error inesperado al registrar:', res.status);
        return mostrarMensaje(`Error ${res.status}`, true);
      }

      const data = await res.json(); // Se asegura de obtener la respuesta
      mostrarMensaje('Producto registrado');
      modal.style.display = 'flex';
      setTimeout(() => modal.style.display = 'none', 2000);
      form.reset();
      previewDiv.innerHTML = '';
      await cargarProductos(); // Recarga los productos
    } catch (err) {
      console.error('Error de red al registrar:', err);
      mostrarMensaje('Error de red', true);
    }
  });

  btn?.addEventListener('click', () => form.requestSubmit());
  cerrarModal?.addEventListener('click', () => { modal.style.display = 'none'; });

  const renderGaleria = (lista = productos) => {
    if (!galeria) return;
    galeria.innerHTML = !lista.length
      ? '<p class="vacio">Sin resultados…</p>'
      : lista.map(p => `
        <div class="producto-card">
          <img src="${API}/imagenes/${p.codigo_producto}" alt="${p.nombre_producto}" style="max-width:120px;">
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

      if (!res.ok) {
        console.error('Error al cargar productos, status:', res.status);
        mostrarMensaje(`Error ${res.status}: ${res.statusText}`, true);
        return;
      }

      const datos = await res.json();
      productos = datos;
      renderGaleria(); // Muestra los productos en la galería
    } catch (err) {
      console.error('Error al cargar productos:', err);
      mostrarMensaje('Error de red al cargar productos', true);
    }
  };

  cargarProductos(); // Carga los productos al inicio
});
