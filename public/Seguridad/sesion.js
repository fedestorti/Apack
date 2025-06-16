document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const usuario = localStorage.getItem('usuario');

  // Rutas públicas que NO requieren autenticación
  const rutasPublicas = [
    'index.html',                 // Página de login
    'registro.html',             // Registro de usuarios (si tenés una)
    'inicio/index.html'          // Ajustá según tu estructura
  ];

  const pathActual = window.location.pathname.split('/').pop(); // Extrae el nombre del archivo

  const esRutaPublica = rutasPublicas.includes(pathActual);

  // Redirigir si no está logueado y la ruta no es pública
  if ((!token || !usuario) && !esRutaPublica) {
    window.location.href = "../inicio/index.html"; // Login
    return;
  }

  // Botón para cerrar sesión si existe en la página
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      window.location.href = "../inicio/index.html";
    });
  }
});
