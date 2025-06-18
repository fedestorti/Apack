# 📦 Papelera Apack

Plataforma web para gestión y visualización de productos de una papelera. Incluye galería pública, sistema de autenticación con JWT, panel de administración, subida de imágenes a Cloudinary y carrito de compras con envío por WhatsApp.

---

## 🚀 Funcionalidades principales

### ✅ Público general
- Visualización de productos en una galería moderna y responsive.
- Búsqueda en tiempo real por nombre o código.
- Ampliación de imagen en modal.
- Carrito persistente (localStorage).
- Historial de productos seleccionados.
- Envío del pedido por WhatsApp.
- Botón de contacto rápido por WhatsApp.

### 🛠️ Administrador (requiere login)
- Login seguro con JWT.
- Registro de nuevos productos con imagen.
- Edición de productos (datos e imagen).
- Eliminación de productos.
- Vista previa de imagen antes de subir.
- Solo usuarios autenticados pueden registrar, editar o eliminar.

---

## 🧾 Estructura de carpetas

```
Apack/
├── index.js                   # Punto de entrada del servidor
├── .env                       # Variables de entorno (NO subir)
├── .env.example               # Plantilla de entorno
├── package.json
├── public/                    # HTML, imágenes y frontend estático
│   ├── RegistroNuevoProductos/
│   ├── Usuarios/              # Galería pública
│   └── ModificarProductos/    # Galería de admin
├── src/
│   ├── routes/                # Rutas Express
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   └── imagenes.routes.js
│   ├── controllers/           # Lógica de las rutas
│   ├── middlewares/           # JWT + Multer
└── README.md
```

---

## 🧪 Tecnologías usadas

- **Node.js + Express** – backend
- **PostgreSQL** – base de datos
- **Multer** – subida de imágenes
- **Cloudinary** – hosting de imágenes
- **JWT** – autenticación segura
- **HTML/CSS/JS** – frontend sin frameworks
- **Fetch API** – peticiones al backend
- **Render** – hosting gratuito
- **WhatsApp API** – integración de pedidos

---

## ⚙️ Configuración rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/usuario/apack.git
cd apack
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear archivo `.env`

Basado en `.env.example`, configura tus variables:

```env
PORT=4000
JWT_SECRET=clave_segura
DATABASE_URL=postgres://...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 4. Iniciar el servidor

```bash
node index.js
```

> Accede a `http://localhost:4000` o al frontend en `public/Usuarios/index.html`.

---

## 🔒 Seguridad

- La carpeta `/imagenesProductos` solo es accesible mediante rutas autenticadas.
- Solo usuarios con JWT pueden acceder a las rutas de edición.
- Las claves y datos sensibles están protegidos mediante `.env` (excluido por `.gitignore`).

---

## 📦 Deploy en Render

- Base de datos en Render PostgreSQL.
- Backend desplegado como servicio web.
- Frontend desde `public/` o también en Netlify/Vercel (opcional).

---

## 📬 Contacto

Hecho por **Fede** – Técnico en programación  
📧 Email: fedestorti@example.com  
📱 WhatsApp: [Contactar](https://wa.me/5491125880227)

---
