$(document).ready(function () {
    var stompClient = null;
    var filaOrigen, columnaOrigen, filaDestino, columnaDestino;

    connect();

    function connect() {
        var socket = new SockJS("http://localhost:8080/ws");
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            stompClient.subscribe("/topic/gamestate", function (response) {
                var gameState = JSON.parse(response.body);
                updateBoard(gameState);
    
                handleCellClick();
            });
    
            stompClient.subscribe("/topic/hidebutton", function () {
                // Ocultar el botón cuando se recibe un mensaje en este tema
                $("#power-button").hide();
            });
    
            requestInitialState();
        });
    }

    function requestInitialState() {
        $.ajax({
            type: "GET",
            url: "http://localhost:8080/api/juego/estado",
            success: function (response) {
                var gameState = response;
                updateBoard(gameState);

                handleCellClick();
            },
            error: function (error) {
                console.error("Error al obtener el estado del juego:", error);
            },
        });
    }

    function buttonToFalse() {
        $.ajax({
            type: "GET",
            url: "http://localhost:8080/api/juego/estado",
            success: function (response) {
                var gameState = response;
                console.log("boton estado luego de pulsar : ", gameState.button);
            },
            error: function (error) {
                console.error("Error al obtener el estado del juego:", error);
            },
            
        });
    }

    function buttonToTrue() {
        document.getElementById("power-button").style.display = "block";
    }

    function handleCellClick() {
        $(".cell").click(function () {
            if (!filaOrigen && !columnaOrigen) {
                filaOrigen = $(this).data("fila");
                columnaOrigen = $(this).data("columna");
            } else {
                filaDestino = $(this).data("fila");
                columnaDestino = $(this).data("columna");

                sendMoveToBackend(
                    filaOrigen,
                    columnaOrigen,
                    filaDestino,
                    columnaDestino
                );

                filaOrigen = columnaOrigen = filaDestino = columnaDestino = null;
            }
        });
    }

    function sendMoveToBackend(
        filaOrigen,
        columnaOrigen,
        filaDestino,
        columnaDestino
    ) {
        var name = localStorage.getItem("name");

        var url =
            "http://localhost:8080/api/juego/mover-ficha?" +
            "jugador=" +
            encodeURIComponent(name) +
            "&filaOrigen=" +
            encodeURIComponent(filaOrigen) +
            "&columnaOrigen=" +
            encodeURIComponent(columnaOrigen) +
            "&filaDestino=" +
            encodeURIComponent(filaDestino) +
            "&columnaDestino=" +
            encodeURIComponent(columnaDestino);

        $.ajax({
            type: "POST",
            url: url,
            success: function (response) {
                console.log("Movimiento exitoso. Nuevo estado del juego:", response);
                var jugadorActual = response.jugadorActual;
                console.log("jugador actual: ", jugadorActual);
                console.log("botton estado: ", response.button);      
            },
            error: function (error) {
                console.error("Error al enviar el movimiento:", error);
            },
        });
    }

    function handleButtonClick() {
        
        var name = obtenerJugadorActual();
    
        $.ajax({
            type: "POST",
            url: "http://localhost:8080/api/juego/pulsar-boton",
            contentType: "application/json",
            data: JSON.stringify({ jugador: name }),
            success: function (response) {
                console.log("Pulsar botón exitoso. Respuesta:", response);
            },
            error: function (error) {
                console.error("Error al pulsar el botón:", error);
            }
        });
        buttonToFalse();
    }
    $("#power-button").click(handleButtonClick);

    function updateBoard(gameState) {
        var gameBoard = $("#game-board");
        gameBoard.empty();

        for (var i = 0; i < gameState.tablero.filas; i++) {
            for (var j = 0; j < gameState.tablero.columnas; j++) {
                var cell = $('<div class="cell"></div>');
                cell.attr("data-fila", i);
                cell.attr("data-columna", j);

                if (gameState.tablero.casillas[i * 8 + j].vacia) {
                    cell.addClass(i % 2 === j % 2 ? "empty-cell" : "white-cell");
                } else {
                    var ficha = gameState.tablero.casillas[i * 8 + j].ficha;
                    if (ficha) {
                        var fichaClase =
                            i < 3 ? "red-piece" : "yellow-piece";
                        cell.addClass(fichaClase);
                    } else {
                        cell.addClass("empty-cell");
                    }
                }
                
                gameBoard.append(cell);
            }
        }
        var currentPlayerInfo = $("#current-player");
        currentPlayerInfo.text(gameState.jugadorActual);
        var currentButtonInfo = $("#current-button");
        currentButtonInfo.text(gameState.jugadorActual);
        console.log("boton estado: ", gameState.button);   
        if (gameState.button) {
            buttonToTrue();
        }else{
            document.getElementById("power-button").style.display = "none";
        }
    }

    function obtenerJugadorActual() {
        console.log("jugador actual: ", localStorage.getItem("name"));
        jugadorActual = localStorage.getItem("name");
        return jugadorActual;
    }

});