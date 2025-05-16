document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const name = form.name.value.trim();
    const surname = form.surname.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    // Validación de campos vacíos
    if (!name || !surname || !email || !password || !confirmPassword) {
        return alert("Todos los campos son obligatorios");
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return alert("Por favor ingrese un email válido");
    }

    // Validación de contraseña mínima
    if (password.length < 6) {
        return alert("La contraseña debe tener al menos 6 caracteres");
    }

    // Validación de confirmación de contraseña
    if (password !== confirmPassword) {
        return alert("Las contraseñas no coinciden");
    }

    const formData = {
        name,
        surname,
        email,
        password
    };

    try {
const res = await fetch('http://localhost:4000/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
});

const result = await res.json();

if (!res.ok) {
    alert(result.message || "Error al registrar");
} else {
    alert("Usuario registrado correctamente");
    window.location.href = "../inicio/index.html";
}
} catch (error) {
    console.error(error);
    alert("Error al conectar con el servidor");
}
});