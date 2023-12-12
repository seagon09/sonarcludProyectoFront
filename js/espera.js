async function verificarJugadores(token) {
    try {
        const response = await fetch(`http://localhost:8080/api/juego/verificar-jugadores?token=${token}`);
        const data = await response.json();

        if (data === 2) {
            // Redirigir a tablero.html
            window.location.href = "/html/tablero.html";
        } else {
            // Si no hay suficientes jugadores, esperar y verificar nuevamente
            setTimeout(() => {
                verificarJugadores(token);
            }, 1000); // Puedes ajustar el tiempo de espera según tus necesidades
        }
    } catch (error) {
        console.error("Error al verificar jugadores:", error);
    }
}

// Obtener el token del local storage o de donde sea que lo estés almacenando
const token = localStorage.getItem("token"); // Asegúrate de almacenar el token cuando se genera

// Iniciar la verificación de jugadores
verificarJugadores(token);