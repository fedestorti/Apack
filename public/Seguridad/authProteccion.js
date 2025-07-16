import jwtDecode from 'https://cdn.jsdelivr.net/npm/jwt-decode/+esm';

/* ---------- Protección de ruta (JWT) ---------- */
const pathname = new URL(location.href).pathname;
const ES_PRIVADA = /\/(?:registro|productos|editar)\.html$/i.test(pathname);

if (ES_PRIVADA) {
  const salir = () => {
    localStorage.removeItem('token');
    location.replace('/public/inicio/index.html');
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

