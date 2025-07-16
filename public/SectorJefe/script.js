console.log("✔ login.js cargado");

// Detecto si estoy en dev con Live-Server (puerto 5500) o en prod.
const API_BASE = window.location.hostname === '127.0.0.1' 
              && window.location.port === '5500'
  ? 'http://localhost:4000'  // tu servidor Express en dev
  : '';                      // prod: mismo dominio/origen

document.addEventListener("DOMContentLoaded", () => {
  const loginForm  = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.style.display = "none";
    loginError.textContent   = "";

    const email    = loginForm.email.value.trim();
    const password = loginForm.password.value;
    if (!email || !password) {
      loginError.textContent = "Completa todos los campos";
      loginError.style.display = "block";
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        let msg = "Usuario o contraseña incorrectos";
        try {
          const data = await res.json();
          msg = data.message || msg;
        } catch {
          msg = await res.text() || msg;
        }
        loginError.textContent = msg;
        loginError.style.display = "block";
        return;
      }

      const { token, usuario } = await res.json();
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      window.location.href = "/public/MenuPrincipal/index.html";
    } catch (err) {
      console.error("Fallo de red:", err);
      loginError.textContent = "No se pudo conectar con el servidor";
      loginError.style.display = "block";
    }
  });
});
