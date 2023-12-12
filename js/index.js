function redirectToLobby(tipoPartida) {
    var name = document.getElementById("name").value;
    if (name) {
        localStorage.setItem("name", name);
        if (tipoPartida === 'publica') {
            window.location.href = "/html/espera.html";
        } else {
            // Almacena el token en localStorage
            var token = prompt("Ingresa el token de la partida:");
            if (token) {
                localStorage.setItem("token", token);
                registerUserWithToken();
            } else {
                alert("Por favor, ingresa un token de la partida.");
            }
        }
    } else {
        alert("Por favor, ingresa un nombre de jugador.");
    }
}

function registerUserWithToken() {
    var name = localStorage.getItem("name");
    var token = localStorage.getItem("token"); 

    if (token) {
        $.ajax({
            type: "POST",
            url: "http://localhost:8080/api/juego/registrar-usuario",
            data: {
                nombre: name,
                token: token
            },
            success: function (response) {
                console.log("Usuario registrado exitosamente:", response);
                window.location.href = "/html/espera.html";
            },
            error: function (error) {
                console.error("Error al registrar el usuario:", error);
                alert("Error al registrar el usuario. Verifica el token e intenta nuevamente.");
            },
        });
    } else {
        alert("Por favor, ingresa un token de la partida.");
    }
}


