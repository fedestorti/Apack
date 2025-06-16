// script.js
/******* Papelera Apack – Galería *******/
const galeria           = document.getElementById('galeria');
const modal             = document.getElementById('modalEditar');
const editNombre        = document.getElementById('editNombre');
const editPrecio        = document.getElementById('editPrecio');
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
  window.location.href = '/login';
}

/* Abre/cierra modal */
function abrirModal()  { modal.classList.add('mostrar'); }
function cerrarModal() { modal.classList.remove('mostrar'); }
cerrarModalEditar.addEventListener('click', cerrarModal);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    cerrarModal();
    visor.style.display = 'none';
  }
});

/* Fetch productos */
async function fetchProductos() {
  try {
    const res = await fetch('http://localhost:4000/api/productos', {
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

/* Render galería */
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
      <img src="http://localhost:4000${p.imagen}" alt="${p.nombre_producto}" onclick="ampliarImagen('http://localhost:4000${p.imagen}')"/>
      <h4>${p.nombre_producto}</h4>
      <p>Código: ${p.codigo_producto}</p>
      <p>Precio: $${p.precio}</p>
      <div class="acciones">
        <button onclick="prepararEdicion('${p.codigo_producto}')">✎ Editar</button>
        <button onclick="eliminarProducto('${p.codigo_producto}')">🗑️ Borrar</button>
      </div>`;
    galeria.appendChild(div);
  });
}

/* Buscador */
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

/* Preparar edición */
window.prepararEdicion = codigo => {
  const prod = productos.find(p => p.codigo_producto === codigo);
  if (!prod) return;

  codigoActual = codigo;
  editNombre.value    = prod.nombre_producto;
  editPrecio.value    = prod.precio;
  previewEditar.innerHTML = `<img src="http://localhost:4000${prod.imagen}" />`;
  abrirModal();
};

/* Confirmar edición */
btnConfirmar.onclick = async e => {
  e.preventDefault();
  if (!codigoActual) {
    alert('Código faltante.');
    return;
  }
  const formData = new FormData();
  formData.append('nombre_producto', editNombre.value.trim());
  formData.append('precio', editPrecio.value.trim());
  if (inputImagen.files[0]) formData.append('imagen', inputImagen.files[0]);

  const url = `http://localhost:4000/api/productos/${codigoActual.trim().toLowerCase()}`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    const updated = await res.json();
    alert('Producto actualizado.');
    cerrarModal();

    productos = productos.map(p =>
      p.codigo_producto === updated.codigo_producto ? updated : p
    );
    renderGaleria();

    // ← Aquí refrescamos la página para asegurarnos de ver la nueva imagen
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert('Error al actualizar: ' + err.message);
  }
};


/* Eliminar producto */
window.eliminarProducto = async (codigo) => {
  console.log('Intentando eliminar producto con código:', codigo);

  if (!confirm('¿Eliminar este producto?')) return;

  const token = localStorage.getItem('token');
  console.log('🔑 Token al eliminar:', token);
  if (!token) {
    alert('❗ Debes iniciar sesión antes de eliminar un producto.');
    return;
  }

  try {
    const res = await fetch(`http://localhost:4000/api/productos/${codigo}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('🚀 DELETE respuesta status:', res.status);

    if (res.status === 401) {
      throw new Error('No autenticado. Vuelve a iniciar sesión.');
    }
    // —————> eliminamos esta verificación de 403 <—————
    // if (res.status === 403) {
    //   throw new Error('No tienes permisos para eliminar este producto.');
    // }
    if (!res.ok) {
      throw new Error(`Error del servidor (${res.status})`);
    }

    productos = productos.filter(p => p.codigo_producto !== codigo);
    renderGaleria();

  } catch (err) {
    console.error('Error al eliminar producto:', err);
    alert(`Error al eliminar: ${err.message}`);
  }
};

/* Vista previa imagen */
inputImagen.addEventListener('change', () => {
  const file = inputImagen.files[0];
  if (!file) return (previewEditar.innerHTML = '');
  const reader = new FileReader();
  reader.onload = () => {
    previewEditar.innerHTML = `<img src="${reader.result}" />`;
  };
  reader.readAsDataURL(file);
});

/* Imagen ampliada */
window.ampliarImagen = src => {
  document.getElementById('imagenAmpliada').src = src;
  document.getElementById('visorImagen').style.display = 'block';
};
cerrar.onclick = () => (visor.style.display = 'none');
visor.onclick = e => { if (e.target === visor) visor.style.display = 'none'; };

/* Iniciar */
fetchProductos();
