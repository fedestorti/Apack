document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return window.location.href = '../inicio/index.html'; // o donde esté tu login
    }
  
    try {
      const res = await fetch('http://localhost:4000/auth/verify', {
        method: 'HEAD',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (!res.ok) {
        // Token inválido o expirado
        localStorage.clear();
        window.location.href = '../inicio/index.html';
      }
    } catch (err) {
      console.error('Error al verificar sesión:', err);
      localStorage.clear();
      window.location.href = '../inicio/index.html';
    }
  });
  