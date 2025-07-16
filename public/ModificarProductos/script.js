/******* Papelera Apack – Galería (Versión Optimizada para Render y Cloudinary) *******/

const API_BASE = window.location.port === '5500'
  ? 'http://localhost:4000'
  : '';
console.log('API_BASE =', API_BASE);

// ahora API apunta al backend correcto:
const API = `${API_BASE}/api`;
console.log('API =', API);
const galeria           = document.getElementById('galeria');
const modal             = document.getElementById('modalEditar');

const editNombre        = document.getElementById('editNombre');
const edit_precio_min        = document.getElementById('edit_precio_min');
const edit_cantidad_may        = document.getElementById('edit_cantidad_may');
const edit_precio_may       = document.getElementById('edit_precio_may');
const edit_cantidad_prod       = document.getElementById('edit_cantidad_prod');

const inputImagen       = document.getElementById('editImagen');
const previewEditar     = document.getElementById('previewEditar');
const btnConfirmar      = document.getElementById('btnConfirmarEdicion');
const cerrarModalEditar = document.getElementById('cerrarModalEditar');
const searchInput       = document.getElementById('searchInput');
const visor             = document.getElementById('visorImagen');
const imagenAmpliada    = document.getElementById('imagenAmpliada');
const cerrar            = document.querySelector('#visorImagen .cerrar');

let productos = [];
let codigoActual = null;
let filtroTimeout;
const token = localStorage.getItem('token');
if (!token) {
  alert('Sesión expirada.');
  window.location.href = '/public/inicio/index.html'; // Asegurate que sea la URL pública de Render
}

// Loader opcional (agregalo en tu HTML si querés)
const mostrarCargando = (msg = 'Cargando...') => {
  galeria.innerHTML = `<p class="cargando">${msg}</p>`;
};

function abrirModal()  { modal.classList.add('mostrar'); }
function cerrarModal() { modal.classList.remove('mostrar'); }
cerrarModalEditar.addEventListener('click', cerrarModal);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    cerrarModal();
    visor.style.display = 'none';
  }
});

async function fetchProductos() {
  try {
    mostrarCargando();
    const res = await fetch(`${API}/productos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(res.status);
    productos = await res.json();
    renderGaleria();
  } catch (err) {
    console.error(err);
    galeria.innerHTML = '<p class="error">Error al cargar productos</p>';
  }
}

function renderGaleria(lista = productos) {
  galeria.innerHTML = '';
  if (!lista.length) {
    galeria.innerHTML = '<p class="vacio">Sin resultados…</p>';
    return;
  }
  lista.forEach(p => {
    const div = document.createElement('div');
    div.className = 'producto-card';
    div.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre_producto}" onclick="ampliarImagen('${p.imagen}')"/>
      <h4>${p.nombre_producto}</h4>
      <p>Código: ${p.codigo_producto}</p>
      <p>Precio Minorista: $${p.precio_min}</p>
      <p>Cantidad al Mayorista: ${p.cantidad_may}</p>
      <p>Precio Mayorista: $${p.precio_may}</p>
      <p>Cantidad de Stock: ${p.cantidad_prod}</p>
      <div class="acciones">
        <button onclick="prepararEdicion('${p.codigo_producto}')">✎ Editar</button>
        <button onclick="eliminarProducto('${p.codigo_producto}')">🗑️ Borrar</button>
      </div>`;
    galeria.appendChild(div);
  });
}

searchInput.addEventListener('input', () => {
  clearTimeout(filtroTimeout);
  filtroTimeout = setTimeout(() => {
    const q = searchInput.value.trim().toLowerCase();
    const filtrados = productos.filter(p =>
      p.codigo_producto.toLowerCase().includes(q) ||
      p.nombre_producto.toLowerCase().includes(q)
    );
    renderGaleria(filtrados);
  }, 300);
});

window.prepararEdicion = codigo => {
  const prod = productos.find(p => p.codigo_producto === codigo);
  if (!prod) return;

  codigoActual = codigo;
  editCodigo.value = codigo;
  editNombre.value = prod.nombre_producto;
  edit_precio_min.value = prod.precio_min;

  edit_cantidad_may.value = prod.cantidad_may;
  edit_precio_may.value = prod.precio_may;
  edit_cantidad_prod.value = prod.cantidad_prod;

  previewEditar.innerHTML = `<img src="${prod.imagen}" />`;
  abrirModal();
};

btnConfirmar.onclick = async e => {
  e.preventDefault();
  if (!codigoActual) {
    alert('Código faltante.');
    return;
  }

  // 1) Construye la URL dinámica según el entorno
  const url = `${API_BASE}/api/productos/${codigoActual.trim().toLowerCase()}`;

  // 2) Prepara el FormData
  const formData = new FormData();
  formData.append('nombre_producto', editNombre.value.trim());
  formData.append('precio_min', edit_precio_min.value.trim());

  formData.append('cantidad_may', edit_cantidad_may.value.trim());
  formData.append('precio_may', edit_precio_may.value.trim());
  formData.append('cantidad_prod', edit_cantidad_prod.value.trim());

  if (inputImagen.files[0]) {
    formData.append('imagen', inputImagen.files[0]);
  }

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) {
      // parsea JSON de error si viene
      let errMsg = `HTTP ${res.status}`;
      try {
        const errBody = await res.json();
        errMsg = errBody.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const updated = await res.json();
    alert('Producto actualizado con éxito.');
    cerrarModal();
    productos = productos.map(p =>
      p.codigo_producto === updated.codigo_producto ? updated : p
    );
    renderGaleria();

  } catch (err) {
    console.error('Error inesperado al actualizar:', err);
    alert('Error al actualizar: ' + err.message);
  }
};

window.eliminarProducto = async (codigo) => {
  if (!confirm('¿Eliminar este producto?')) return;
  if (!token) {
    alert('❗ Debes iniciar sesión antes de eliminar un producto.');
    return;
  }

  try {
    const res = await fetch(`${API}/productos/${codigo}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 401) throw new Error('No autenticado. Vuelve a iniciar sesión.');
    if (!res.ok) throw new Error(`Error del servidor (${res.status})`);

    productos = productos.filter(p => p.codigo_producto !== codigo);
    renderGaleria();
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    alert(`Error al eliminar: ${err.message}`);
  }
};

inputImagen.addEventListener('change', () => {
  const file = inputImagen.files[0];
  if (!file) return (previewEditar.innerHTML = '');
  const reader = new FileReader();
  reader.onload = () => {
    previewEditar.innerHTML = `<img src="${reader.result}" />`;
  };
  reader.readAsDataURL(file);
});

window.ampliarImagen = src => {
  imagenAmpliada.src = src;
  visor.style.display = 'block';
};
cerrar.onclick = () => (visor.style.display = 'none');
visor.onclick = e => { if (e.target === visor) visor.style.display = 'none'; };

fetchProductos();
