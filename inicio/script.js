console.log("✔ login.js cargado");

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
      const res = await fetch('http://localhost:4000/auth/login', {
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

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      window.location.href = "../RegistroNuevoProductos/index.html";
    } catch (err) {
      console.error("Fallo de red:", err);
      loginError.textContent = "No se pudo conectar con el servidor";
      loginError.style.display = "block";
    }
  });
});