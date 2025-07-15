/******* Papelera Apack – Galería (Versión Optimizada para Render y Cloudinary) *******/

const API_BASE = window.location.port === '5500'
  ? 'http://localhost:4000'
  : '';
console.log('API_BASE =', API_BASE);

// ahora API apunta al backend correcto:
const API = `${API_BASE}/api`;
console.log('API =', API);
const galeria           = document.getElementById('galeria');


  const btnAbrirCarrito = document.querySelector('.carrito-icono');
  const btnCerrarCarrito= document.getElementById('cerrarModalCarrito');
  const modalCarrito    = document.getElementById('modalCarrito');
  const btnAbrirHist    = document.getElementById('btnAbrirModal2');
  const listaCarrito    = document.getElementById('listaCarrito');
  const btnBuscarCliente = document.getElementById('btnBuscarCliente');
  const resultadoCliente = document.getElementById('resultadoCliente');
  const btnVaciarCarrito = document.getElementById('vaciarCarrito');

const searchInput       = document.getElementById('searchInput');
const visor             = document.getElementById('visorImagen');
const imagenAmpliada    = document.getElementById('imagenAmpliada');
const cerrar            = document.querySelector('#visorImagen .cerrar');

let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
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

// Traer Productos
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

// Galeria Principal
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
    <img src="${p.imagen || '/imagenes/default.jpg'}" alt="${p.nombre || 'Producto'}" onclick="ampliarImagen('${p.imagen || ''}')">
      <h4>${p.nombre_producto}</h4>
      <p>Código: ${p.codigo_producto}</p>
      <p>Precio Minorista: $${p.precio_min}</p>
      <p>Cantidad al Mayorista: ${p.cantidad_may}</p>
      <p>Precio Mayorista: $${p.precio_may}</p>
      <p>Cantidad de Stock: ${p.cantidad_prod}</p>
      <div class="acciones">
        <input
          type="number"
          min="1"
          value="1"
          class="cantidad-input"
          id="cantidad-${p.codigo_producto}"
        />
        <button
          class="btn"
          onclick="agregarAlCarrito('${p.codigo_producto}')"
        >
          <span class="emoji-icon">🛒</span> Agregar
        </button>
      </div>`;
    galeria.appendChild(div);
  });
} //


// Buscador por filtrado
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

// Amplicar Imagen
window.ampliarImagen = src => {
  imagenAmpliada.src = src;
  visor.style.display = 'block';
};
cerrar.onclick = () => (visor.style.display = 'none');
visor.onclick = e => { if (e.target === visor) visor.style.display = 'none'; };

function actualizarBadge() {
  const contador = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  document.getElementById('contadorCarrito').textContent = contador;
}

function saveToLS(carrito) {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

window.mostrarModalCarrito = () => {
  modalCarrito.style.display = 'block';
};

cerrar.onclick = () => {
  modalCarrito.style.display = 'none';
};

window.onclick = e => {
  if (e.target === modalCarrito) {
    modalCarrito.style.display = 'none';
  }
};

btnAbrirCarrito?.addEventListener('click', () => {
  abrirHistorial();          // 1) historial
  // mostrarModalCarrito();  // 2) carrito (si también lo quieres)
});

btnCerrarCarrito.addEventListener('click', () => modalCarrito.style.display = 'none');
modalCarrito.addEventListener('click', e => { if (e.target === modalCarrito) modalCarrito.style.display = 'none'; });


listaCarrito.addEventListener('click', e => {
  const btn = e.target.closest('.borrar');
  if (!btn) return;
  carrito = carrito.filter(i => i.codigo !== btn.dataset.codigo);
  saveToLS(carrito);
  renderModalCarrito();
  actualizarBadge();
});

    const totalArt = carrito.reduce((s,i)=>s+i.cantidad,0);
    const total$$  = carrito.reduce((s,i)=>s+i.precio_min*i.cantidad,0);

    // Evento para los botones "Agregar"
document.querySelectorAll('.btn-agregar').forEach(btn => {
  btn.addEventListener('click', () => {
    const codigoProducto = btn.dataset.codigo; // 🔥 Obtiene el código
    const inputCantidad = document.getElementById(`cantidad-${codigoProducto}`);
    const cantidadSeleccionada = parseInt(inputCantidad.value, 10);

    // Buscar el producto en la lista de productos
    const producto = productos.find(p => p.codigo_producto === codigoProducto);

    if (!producto) {
      alert("❌ Producto no encontrado.");
      return;
    }

    // Verificar si ya existe en el carrito
    const existente = carrito.find(item => item.codigo_producto === codigoProducto);
    if (existente) {
      // Si existe, actualizar cantidad
      existente.cantidad += cantidadSeleccionada;
      // Recalcular precio_unitario según nueva cantidad
      existente.precio_unitario = (existente.cantidad > producto.cantidad_may)
        ? producto.precio_may
        : producto.precio_min;
    } else {
      // Si no existe, agregarlo al carrito
      const precioFinal = (cantidadSeleccionada > producto.cantidad_may)
        ? producto.precio_may
        : producto.precio_min;

      carrito.push({
        ...producto,
        cantidad: cantidadSeleccionada,
        precio_unitario: precioFinal
      });
    }

    console.log(`✅ Agregado ${producto.nombre_producto} x${cantidadSeleccionada}`);
    renderModalCarrito(); // 🔄 Vuelve a renderizar
  });
});


    // Abrir forma de pago y tipo de factura
    function toggleLista(id) {
      const lista = document.getElementById(id);
      lista.classList.toggle('activa');
    }
    
    function seleccionar(elemento, listaId, tituloId, prefijo) {
      const lista = document.getElementById(listaId);
      const seleccion = elemento.textContent;
    
      // Quitar la clase 'seleccionado' de todos los ítems
      const items = lista.querySelectorAll('li');
      items.forEach(item => item.classList.remove('seleccionado'));
    
      // Marcar el ítem seleccionado
      elemento.classList.add('seleccionado');
    
      // Actualizar el <h4> con la selección
      document.getElementById(tituloId).innerHTML = prefijo + seleccion;
    
      // Cerrar la lista
      lista.classList.remove('activa');
    }

    function renderModalCarrito(filtro = '') {
      listaCarrito.innerHTML = ''; // Limpia listado
    
      // 🔎 Filtrar productos por nombre o código
      const productosFiltrados = carrito.filter(item => {
        const termino = filtro.toLowerCase();
        return (
          item.codigo_producto.toString().includes(termino) ||
          item.nombre_producto.toLowerCase().includes(termino)
        );
      });
    
      // 🛒 Si no hay productos en el filtro
      if (productosFiltrados.length === 0) {
        listaCarrito.innerHTML = '<p class="vacio">❌ No se encontraron productos.</p>';
        return;
      }
      
      // 📝 Renderizar productos filtrados
      productosFiltrados.forEach(item => {
      listaCarrito.insertAdjacentHTML('beforeend', `
        <li class="carrito-item">
          <div class="detalle">
            <span class="codigo">${item.codigo_producto}</span>
            <span class="nombre">${item.nombre_producto}</span>
            <span class="precio">$${item.precio_unitario}</span>
            <span class="cantidad">${item.cantidad}</span>
          </div>
          <button class="borrar" data-codigo="${item.codigo_producto}">
            <i class="fas fa-trash"></i>
          </button>
        </li>
      `);
      });
      
      const totalCantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);
      const totalPrecio = carrito.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);
          
      document.querySelector('.carrito-total').innerHTML = `
      <div style="margin-bottom: 8px;">
        <span><strong>Total Cantidad:</strong> ${totalCantidad}</span><br>
        <span><strong>Total Precio:</strong> $${totalPrecio.toFixed(2)}</span>
      </div>
      <div style="margin-top: 10px;">
        <label for="montoCliente"><strong>💵 Monto del cliente:</strong></label>
        <input type="number" id="montoCliente" placeholder="Ingrese monto" style="width: 150px; margin-left: 5px;" />
      </div>
      <div style="margin-top: 5px;">
        <span><strong>Vuelto:</strong> $<span id="vuelto">0.00</span></span>
      </div>
    `;

      // 🎯 Detectar cambios en el input y calcular vuelto
    const inputMontoCliente = document.getElementById('montoCliente');
    const spanVuelto = document.getElementById('vuelto');

    inputMontoCliente.addEventListener('input', () => {
      const montoCliente = parseFloat(inputMontoCliente.value);
      const totalPrecio = carrito.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);
    
      if (!isNaN(montoCliente)) {
        const vuelto = montoCliente - totalPrecio;
        spanVuelto.textContent = vuelto >= 0 ? vuelto.toFixed(2) : "0.00";
        if (vuelto < 0) {
          spanVuelto.style.color = "red"; // Vuelto insuficiente
        } else {
          spanVuelto.style.color = "green"; // Correcto
        }
      } else {
        spanVuelto.textContent = "0.00";
        spanVuelto.style.color = "black";
      }
    });

      // 📌 Añadir eventos a los botones borrar
      document.querySelectorAll('.borrar').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const codigo = e.currentTarget.dataset.codigo;
    
          // 🗑 Borrar producto del carrito
          const index = carrito.findIndex(item => item.codigo_producto == codigo);
          if (index !== -1) {
            carrito.splice(index, 1); // lo elimina del array
          }
    
          // 🔄 Actualizar listado con el filtro actual
          const filtroActual = filtroInput.value.trim();
    
          // Si no quedan productos para el filtro, limpiar el campo
          const hayCoincidencias = carrito.some(item =>
            item.codigo_producto.toString().includes(filtroActual) ||
            item.nombre_producto.toLowerCase().includes(filtroActual.toLowerCase())
          );
    
          if (!hayCoincidencias) {
            filtroInput.value = ''; // limpiar filtro
            renderModalCarrito();   // renderiza todo
          } else {
            renderModalCarrito(filtroActual); // renderiza con el mismo filtro
          }
        });
      });
    }
    
    // Función para vaciar el carrito
    function vaciarCarrito() {
      // Mostrar confirmación antes de borrar
      const confirmar = confirm("⚠️ ¿Estás seguro que quieres vaciar todo el carrito?");
      if (!confirmar) return; // Si cancela, no hace nada
    
      // 🔥 Limpiar el array del carrito
      carrito = [];
    
      // 🔄 Volver a renderizar el modal
      renderModalCarrito();
    
      // ✅ Mensaje opcional
      console.log("🗑 Carrito vacío.");
    }

    btnVaciarCarrito.addEventListener('click', vaciarCarrito);

    const filtroInput = document.getElementById('filtroProducto');

    filtroInput.addEventListener('input', () => {
      const valorFiltro = filtroInput.value.trim();
      renderModalCarrito(valorFiltro); // 🔥 renderiza con el filtro
    });


 // Delegación eliminar dentro del carrito
listaCarrito.addEventListener('click', e => {
  const btn = e.target.closest('.borrar');
  if (!btn) return;               // si no clickeó un botón "borrar", salgo

  const codigo = btn.dataset.codigo;  // aquí obtengo el código
  console.log('Borrando producto con código:', codigo);

  // Filtrar por la misma propiedad que usaste en data-codigo:
  carrito = carrito.filter(item => item.codigo_producto !== codigo);

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


window.agregarAlCarrito = codigo => {
  // 🔎 Buscar producto en la lista de productos
  const prod = productos.find(p => p.codigo_producto === codigo);
  if (!prod) {
    alert('❌ Producto no encontrado.');
    return;
  }

  // 📥 Leer la cantidad del input
  const cantidadInput = document.getElementById(`cantidad-${codigo}`);
  const cantidadSeleccionada = parseInt(cantidadInput.value, 10) || 1;

  if (cantidadSeleccionada <= 0) {
    alert('⚠️ Ingrese una cantidad válida.');
    return;
  }

  // 📦 Buscar si ya está en el carrito
  const existente = carrito.find(item => item.codigo_producto === codigo);

  if (existente) {
    // ✅ Si ya existe, sumar cantidad y recalcular precio
    existente.cantidad += cantidadSeleccionada;
    existente.precio_unitario =
      (existente.cantidad >= prod.cantidad_may) // 👈 Cambio aquí
        ? prod.precio_may
        : prod.precio_min;
  } else {
    // 🆕 Si no existe, agregar nuevo con precio calculado
    const precioFinal = (cantidadSeleccionada >= prod.cantidad_may) // 👈 Cambio aquí
      ? prod.precio_may
      : prod.precio_min;

    carrito.push({
      codigo_producto: prod.codigo_producto,
      nombre_producto: prod.nombre_producto,
      imagen: prod.imagen,
      cantidad: cantidadSeleccionada,
      precio_unitario: precioFinal
    });
  }

  console.log(`✅ Agregado: ${prod.nombre_producto} x${cantidadSeleccionada}`);
  saveToLS(carrito);
  actualizarBadge();
  renderModalCarrito(); // 🔄 Refrescar carrito
};



async function buscarCliente() {
  const termino = document.getElementById('busquedaCliente').value.trim();
  resultadoCliente.innerHTML = ''; // Limpia resultados anteriores

  if (!termino) {
    alert('⚠️ Ingresar datos de cliente para buscar.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/clientes/buscar?termino=${encodeURIComponent(termino)}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store" // 👈 evita cacheo
    });

    console.log("📡 Status:", res.status);
    const text = await res.text(); // 🔥 captura la respuesta como texto puro
    console.log("📡 Respuesta (raw):", text);

    if (res.status === 401 || res.status === 403) {
      // 🔥 Limpia sesión
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    
      // 🔒 Muestra alerta y redirige
      alert("🔒 Token inválido o sesión expirada. Serás redirigido al login.");
    
      // Esto dispara la redirección automáticamente por tu otro script
      window.location.reload(); // 🔥 Fuerza recarga para que el verificador actúe
      return;
    }

    if (res.status === 404) {
      resultadoCliente.innerHTML = '<p class="mensaje-error">❌ Cliente no encontrado</p>';
      return;
    }

    if (!res.ok) throw new Error("Error al buscar cliente");

    let clientes = [];
    try {
      clientes = JSON.parse(text); // Intenta parsear como JSON
    } catch (err) {
      console.error("❌ Respuesta no es JSON válido:", err);
      throw new Error("Respuesta inválida del servidor");
    }

    console.log("✅ Clientes encontrados:", clientes);

    if (clientes.length === 0) {
      resultadoCliente.innerHTML = '<p class="mensaje-error">❌ Cliente no encontrado</p>';
      return;
    }

    // Mostrar solo el primer cliente (si solo buscas 1 cliente)
    const cli = clientes[0];

    resultadoCliente.insertAdjacentHTML('beforeend', `
      <div class="cliente-ficha">
        <h4>📋 Datos del cliente</h4>
        <div class="cliente-datos-horizontal">
          <div class="fila">
            <div class="dato">Cliente: <strong>${cli.dato_cliente}</strong></div>
            <div class="dato">DNI/CUIT: <strong>${cli.dni_cuit}</strong></div>
            <div class="dato">Email: <strong>${cli.email ?? 'No registrado'}</strong></div>
          </div>
          <div class="fila">
            <div class="dato">Teléfono: <strong>${cli.telefono ?? 'No registrado'}</strong></div>
            <div class="dato">Dirección: <strong>${cli.direccion ?? 'No registrada'}</strong></div>
            <div class="dato">             </div>
          </div>
        </div>
      </div>
    `);

  } catch (err) {
    console.error("❌ Error buscando cliente:", err);
    resultadoCliente.innerHTML = '<p class="mensaje-error">Error al buscar cliente.</p>';
  }
}




// Asigna el listener al botón
btnBuscarCliente?.addEventListener('click', buscarCliente);






function getSafeInnerText(selector) {
  const el = document.querySelector(selector);
  if (!el) {
    alert(`⚠️ Falta información del cliente (${selector}). Completa todos los campos antes de imprimir.`);
    throw new Error(`Elemento no encontrado: ${selector}`);
  }
  return el.innerText.trim();
}


// Descargar Factura
async function generarFacturaPDF() {
  const { jsPDF } = window.jspdf;

  // ⚠️ Validar datos antes de imprimir
  const clienteNombre = document.querySelector('.cliente-ficha .fila .dato strong')?.innerText.trim();
  const tipoFactura = document.getElementById('seleccionFactura')?.innerText.replace('🧾 Tipo de Factura: ', '').trim();
  const formaPago = document.getElementById('seleccionPago')?.innerText.replace('💳 Forma de Pago: ', '').trim();
  const productos = carrito; // tu carrito

  if (!clienteNombre || productos.length === 0 || tipoFactura === "ninguna" || formaPago === "ninguna") {
    alert("⚠️ Completa todos los campos: cliente, productos, forma de pago y tipo de factura antes de imprimir.");
    return;
  }

  // 📄 Generar PDF
  const doc = new jsPDF();

  // 🖼️ Insertar logo arriba a la izquierda
  const logoImg = new Image();
  logoImg.src = "/public/Imagen/Logo_Apack.jpg";
  logoImg.onload = function () {
    doc.addImage(logoImg, "JPEG", 10, 10, 40, 20); // X, Y, width, height

    // 🧾 Tipo de factura grande en cuadro
    doc.setDrawColor(0);
    doc.setFillColor(230, 230, 230); // Gris claro
    doc.rect(150, 10, 50, 14, 'F'); // X, Y, W, H
    doc.setFontSize(22);
    doc.text(`${tipoFactura}`, 175, 23, { align: "center" });

    // 📅 Fecha y número de factura a la derecha
    const fecha = new Date();
    const fechaString = fecha.toLocaleDateString('es-AR'); // DD/MM/YYYY
    const horaString = fecha.toLocaleTimeString('es-AR', { hour12: false }); // HH:MM:SS (24hs)


    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaString}`, 150, 30);
    doc.text(`Hora: ${horaString}`, 150, 35);
    

    // 📋 Datos del cliente en un recuadro
    
    const clienteDniCuit = getSafeInnerText('.cliente-ficha .fila .dato:nth-child(2) strong');
    const clienteEmail = getSafeInnerText('.cliente-ficha .fila .dato:nth-child(3) strong');
    const clienteTelefono = getSafeInnerText('.cliente-ficha .fila:nth-child(2) .dato:nth-child(1) strong');
    const direccionElement = document.querySelector('.cliente-ficha .fila:nth-child(2) .dato:nth-child(2) strong');
    const clienteDireccion = direccionElement ? direccionElement.innerText.trim() : "No registrada";
    

    // 📦 Recuadro Datos Cliente
    doc.setDrawColor(0);
    doc.rect(10, 40, 190, 25); // X, Y, Width, Height

    // 📐 Configuración de columnas y filas dentro del recuadro
    const columnaIzquierdaX = 15;    // X inicial columna izquierda (dentro del recuadro)
    const valorIzquierdaX = 45;      // X donde empiezan los valores en columna izquierda

    const columnaDerechaX = 110;     // X inicial columna derecha (dentro del recuadro)
    const valorDerechaX = 130;       // X donde empiezan los valores en columna derecha

    let filaY = 45;                  // Y inicial (margen superior del recuadro)
    const separacionFilas = 6;       // espacio uniforme entre filas

    // 🧑 Columna izquierda (alineada al recuadro)
    doc.setFontSize(11);
    doc.text(`Cliente:`, columnaIzquierdaX, filaY, { align: "left" });
    doc.text(`${clienteNombre}`, valorIzquierdaX, filaY, { align: "left" });

    filaY += separacionFilas;
    doc.text(`DNI/CUIT:`, columnaIzquierdaX, filaY, { align: "left" });
    doc.text(`${clienteDniCuit}`, valorIzquierdaX, filaY, { align: "left" });

    filaY += separacionFilas;
    doc.text(`Email:`, columnaIzquierdaX, filaY, { align: "left" });
    doc.text(`${clienteEmail}`, valorIzquierdaX, filaY, { align: "left" });

    filaY += separacionFilas;
    doc.text(`Forma de Pago:`, columnaIzquierdaX, filaY, { align: "left" });
    doc.text(`${formaPago}`, valorIzquierdaX, filaY, { align: "left" });

    // 📞 Columna derecha (alineada al recuadro)
    filaY = 50; // reinicia altura para la columna derecha
    doc.text(`Teléfono:`, columnaDerechaX, filaY, { align: "left" });
    doc.text(`${clienteTelefono}`, valorDerechaX, filaY, { align: "left" });

    filaY += separacionFilas;
    doc.text(`Dirección:`, columnaDerechaX, filaY, { align: "left" });
    doc.text(`${clienteDireccion}`, valorDerechaX, filaY, { align: "left" });


    

    // 🛒 Tabla de productos
    let y = 75;
    doc.setFontSize(11);

    // Encabezado tabla
    doc.setDrawColor(0);
    doc.setFillColor(200, 200, 200); // fondo gris claro
    doc.rect(10, y, 190, 6, 'F');
    doc.text("Código", 12, y + 5);
    doc.text("Descripción", 40, y + 5);
    doc.text("Cantidad", 120, y + 5);
    doc.text("P.Unit", 140, y + 5);
    doc.text("Total", 175, y + 5);

    y += 10;

    // Productos
    productos.forEach((item) => {
      const totalProducto = Number(item.precio_unitario) * Number(item.cantidad);
      doc.text(`${item.codigo_producto}`, 12, y);
      doc.text(`${item.nombre_producto}`, 40, y);
      doc.text(`${item.cantidad}`, 120, y);
      doc.text(`$${Number(item.precio_unitario).toFixed(2)}`, 140, y);
      doc.text(`$${totalProducto.toFixed(2)}`, 175, y);
      y += 6;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // 📦 Totales en cuadro
    y += 8;
    const totalCantidad = carrito.reduce((acc, item) => acc + Number(item.cantidad), 0);
    const totalPrecio = carrito.reduce((acc, item) => acc + (Number(item.precio_unitario) * Number(item.cantidad)), 0);
    doc.setDrawColor(0);
    doc.rect(130, y, 70, 12); // cuadro total
    doc.setFontSize(12);
    doc.text(`Total Cantidad: ${totalCantidad}`, 132, y + 5);
    doc.text(`Total Precio: $${totalPrecio.toFixed(2)}`, 132, y + 10);

    // 📝 Nombre del archivo dinámico
    // 📅 Crear fecha y hora en formato deseado
    const dia = String(fecha.getDate()).padStart(2, '0');      // Día con 2 dígitos
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes con 2 dígitos (enero=0)
    const anio = fecha.getFullYear();
    const hora = String(fecha.getHours()).padStart(2, '0');    // Hora 24hs
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');

    // 📝 Construir nombre del archivo
    const fechaHora = `${dia}-${mes}-${anio}_${hora}-${minutos}-${segundos}`;
    const nombreArchivo = `Factura-${tipoFactura}_${fechaHora}_${clienteNombre.replace(/\s+/g, '_')}.pdf`;
    // 💾 Guardar
    doc.save(nombreArchivo);
  };
}

//Generar Ticket
async function generarTicketPDF() {
  const { jsPDF } = window.jspdf;

  // 📄 Crear PDF en formato ticket (ancho reducido)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [90, 190] // Ancho: 80mm (ticket), alto dinámico
  });

  // 🖼️ Logo opcional arriba (comentá si no lo querés)
  const logoImg = new Image();
  logoImg.src = "/public/Imagen/Logo_Apack.jpg";
  logoImg.onload = function () {
    doc.addImage(logoImg, "JPEG", 20, 5, 40, 15); // Centrado

    // 🧾 Encabezado
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TICKET", 40, 25, { align: "center" });

    // 📅 Fecha y hora
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString('es-AR');
    const horaStr = fecha.toLocaleTimeString('es-AR', { hour12: false });
    doc.setFontSize(9);
    doc.text(`Fecha: ${fechaStr}`, 5, 35);
    doc.text(`Hora: ${horaStr}`, 5, 40);

    // 🛒 Productos
let y = 50;
doc.setFont("courier", "normal"); // Fuente tipo impresora térmica
doc.setFontSize(9);

// 📝 Encabezado de tabla
doc.text("Cant Producto          P.Unit        Total", 5, y);
y += 4;
doc.line(5, y, 85, y); // línea separadora
y += 5;

carrito.forEach((item) => {
  const cantidad = Number(item.cantidad);
  const precioUnitario = Number(item.precio_unitario);
  const totalProducto = precioUnitario * cantidad;

  // 📌 Definir posiciones X de cada columna
  const xCantidad = 5;          // Columna Cantidad
  const xProducto = 13;         // Columna Producto
  const xPUnit = 63;            // Columna Precio Unitario
  const xTotal = 85;            // Columna Total

  // 🛒 Imprimir fila
  doc.text(`${cantidad}x`, xCantidad, y);
  doc.text(`${item.nombre_producto.substring(0, 20)}`, xProducto, y); // Cortar nombre largo
  doc.text(`$${precioUnitario.toFixed(2)}`, xPUnit, y, { align: "right" });
  doc.text(`$${totalProducto.toFixed(2)}`, xTotal, y, { align: "right" });

  y += 5; // Avanzar a la siguiente fila
});

// 📦 Total general
y += 3;
doc.line(5, y, 85, y); // línea separadora
y += 5;

const totalCantidad = carrito.reduce((acc, item) => acc + Number(item.cantidad), 0);
const totalPrecio = carrito.reduce((acc, item) => acc + (Number(item.precio_unitario) * Number(item.cantidad)), 0);

doc.setFont("helvetica", "bold");

doc.text(`TOTAL CANTIDAD:`, 5, y);
doc.text(`${totalCantidad}`, 80, y, { align: "right" });
y += 5;
doc.text(`TOTAL:`, 5, y);
doc.text(`$${totalPrecio.toFixed(2)}`, 80, y, { align: "right" });

    // 📝 Guardar PDF
    const nombreArchivo = `Ticket_${fechaStr.replace(/\//g, '-')}_${horaStr.replace(/:/g, '-')}.pdf`;
    doc.save(nombreArchivo);
  };
}














actualizarBadge();
fetchProductos();
