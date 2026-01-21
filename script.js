// ----------------------------
// MÓDULO DE USUARIOS
// ----------------------------
const Usuario = {
    baseUsuarios: {},
    usuarioActual: null,

    cargarUsuarios: function() {
        const data = localStorage.getItem("usuarios");
        if (data) this.baseUsuarios = JSON.parse(data);
    },

    guardarUsuarios: function() {
        localStorage.setItem("usuarios", JSON.stringify(this.baseUsuarios));
    },

    moduloRegistrar: function() {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const msg = document.getElementById("login-msg");

        if (!username || !password) { msg.textContent = "Rellena todos los campos"; return; }
        if (this.baseUsuarios[username]) { msg.textContent = "Usuario ya existe"; return; }

        this.baseUsuarios[username] = {password: password, puntaje: 0, niveles: {basico:0, intermedio:0, avanzado:0}};
        this.guardarUsuarios();
        msg.textContent = "Usuario registrado correctamente";
    },

    moduloLogin: function() {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const msg = document.getElementById("login-msg");

        if (!this.baseUsuarios[username] || this.baseUsuarios[username].password !== password) {
            msg.textContent = "Usuario o contraseña incorrectos";
            return;
        }

        this.usuarioActual = username;
        document.getElementById("login-register").style.display = "none";
        msg.textContent = `¡Bienvenido ${username}!`;

        // Iniciar directamente el nivel básico
        Quiz.nivel = "basico";
        Quiz.indicePregunta = 0;
        Quiz.puntaje = 0;
        document.getElementById("quiz-container").style.display = "block";
        Quiz.mostrarPregunta();
    },

    guardarPuntaje: function(nivel, puntaje) {
        if (this.usuarioActual) {
            this.baseUsuarios[this.usuarioActual].niveles[nivel] =
                Math.max(this.baseUsuarios[this.usuarioActual].niveles[nivel], puntaje);
            this.guardarUsuarios();
        }
    }
};

// ----------------------------
// MÓDULO DE QUIZ
// ----------------------------
const Quiz = {
    preguntas: {
        basico: [
            {pregunta:"¿Cuál es una variable correcta?", opciones:{a:"int x",b:"x=5",c:"var x",d:"let x",e:"x:=5"},respuesta:"b"},
            {pregunta:"¿Cuál imprime 'Hola mundo'?", opciones:{a:"echo",b:"console.log",c:"print",d:"printf",e:"write"},respuesta:"c"}
        ],
        intermedio: [
            {pregunta:"¿Qué hace 'def miFuncion()'?", opciones:{a:"Declara variable",b:"Declara función",c:"Ejecuta función",d:"Bucle",e:"Nada"},respuesta:"b"},
            {pregunta:"¿Qué tipo de dato es 3.14?", opciones:{a:"int",b:"float",c:"string",d:"bool",e:"char"},respuesta:"b"},
            {pregunta:"¿Cuál de las siguientes estructuras permite acceso O(1)?", opciones:{a:"Lista",b:"Diccionario",c:"Cola",d:"Pila",e:"Árbol"},respuesta:"b"},
            {pregunta:"¿Cuál operador concatena cadenas en Python?", opciones:{a:"+",b:"-",c:"&",d:"%",e:"*"},respuesta:"a"},
            {pregunta:"¿Cómo accedes al último elemento de una lista 'lista'?", opciones:{a:"lista[-1]",b:"lista[0]",c:"lista[len(lista)]",d:"lista.last()",e:"lista.tail"},respuesta:"a"}
        ],
        avanzado: [
            {pregunta:"¿Qué imprime: print(2*3+1)?", opciones:{a:"5",b:"6",c:"7",d:"8",e:"Error"},respuesta:"c"},
            {pregunta:"¿Qué hace 'break' dentro de un ciclo?", opciones:{a:"Detiene ciclo",b:"Continua ciclo",c:"Nada",d:"Salta función",e:"Error"},respuesta:"a"}
        ]
    },
    nivel: null,
    indicePregunta: 0,
    puntaje: 0,
    bloqueado: false,

    mostrarPregunta: function() {
        this.bloqueado = false;
        const p = this.preguntas[this.nivel][this.indicePregunta];
        document.getElementById("pregunta").textContent = p.pregunta;

        const opcionesDiv = document.getElementById("opciones");
        opcionesDiv.innerHTML = "";
        for (let letra in p.opciones) {
            const btn = document.createElement("button");
            btn.textContent = letra + ") " + p.opciones[letra];
            btn.onclick = () => this.seleccionarRespuesta(letra, btn);
            opcionesDiv.appendChild(btn);
        }

        document.getElementById("feedback").textContent = "";
        document.getElementById("puntaje").textContent = `Puntaje: ${this.puntaje}`;
        document.getElementById("progreso").textContent = `Pregunta ${this.indicePregunta+1} de ${this.preguntas[this.nivel].length}`;
    },

    seleccionarRespuesta: function(letra, boton) {
        if (this.bloqueado) return;
        this.bloqueado = true;

        const p = this.preguntas[this.nivel][this.indicePregunta];
        const feedback = document.getElementById("feedback");

        if (letra === p.respuesta) {
            feedback.textContent = "¡Correcto!";
            boton.classList.add("correct");
            this.puntaje++;
        } else {
            feedback.textContent = `Incorrecto. La respuesta correcta era: ${p.respuesta}) ${p.opciones[p.respuesta]}. ¡Hazlo bien, insecto! 😎`;
            boton.classList.add("wrong");
        }

        document.getElementById("puntaje").textContent = `Puntaje: ${this.puntaje}`;

        setTimeout(() => this.siguientePregunta(), 1500);
    },

    siguientePregunta: function() {
        this.indicePregunta++;
        const preguntasActuales = this.preguntas[this.nivel];

        if (this.indicePregunta >= preguntasActuales.length) {
            alert(`Juego terminado! Tu puntaje final: ${this.puntaje}/${preguntasActuales.length}`);
            Usuario.guardarPuntaje(this.nivel, this.puntaje);

            const minimoParaGanar = Math.ceil(preguntasActuales.length / 2);

            if (this.puntaje >= minimoParaGanar) {
                if (this.nivel === "basico") {
                    alert("¡Felicidades! Pasas al nivel intermedio 🎉");
                    this.nivel = "intermedio";
                    this.indicePregunta = 0;
                    this.puntaje = 0;
                    this.mostrarPregunta();
                } else if (this.nivel === "intermedio") {
                    alert("¡Felicidades! Pasas al nivel avanzado 🚀");
                    this.nivel = "avanzado";
                    this.indicePregunta = 0;
                    this.puntaje = 0;
                    this.mostrarPregunta();
                } else {
                    alert("¡Nivel avanzado completado! Felicidades 😎");
                    Ranking.mostrarRanking(this.nivel);
                    document.getElementById("quiz-container").style.display = "none";
                    document.getElementById("nivel-container").style.display = "block";
                }
            } else {
                alert("¡Perdiste! Volviendo al inicio del nivel.");
                this.reiniciarQuiz();
            }
        } else {
            this.mostrarPregunta();
        }
    },

    reiniciarQuiz: function() {
        this.indicePregunta = 0;
        this.puntaje = 0;
        this.mostrarPregunta();
        document.getElementById("feedback").textContent = "";
    }
};

// ----------------------------
// MÓDULO DE RANKING
// ----------------------------
const Ranking = {
    mostrarRanking: function(nivel) {
        const rankingDiv = document.getElementById("ranking-container");
        const lista = document.getElementById("ranking-list");
        lista.innerHTML = "";

        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || {};
        const arrayUsuarios = Object.entries(usuarios)
            .sort((a,b)=> b[1].niveles[nivel]-a[1].niveles[nivel]);

        arrayUsuarios.forEach(([nombre,data],i)=>{
            const li = document.createElement("li");
            li.textContent = `${i+1}. ${nombre}: ${data.niveles[nivel]} puntos`;
            lista.appendChild(li);
        });

        rankingDiv.style.display = "block";
    },

    ocultarRanking: function() {
        document.getElementById("ranking-container").style.display = "none";
        document.getElementById("login-register").style.display = "block";
    }
};

// ----------------------------
// CARGAR USUARIOS AL INICIAR
// ----------------------------
window.onload = function() {
    Usuario.cargarUsuarios();
};

// ----------------------------
// MATRIX CINEMÁTICO
// ----------------------------
const canvas = document.getElementById("matrix-canvas");
const ctx = canvas.getContext("2d");

let fontSize = 16;
let columnas;
let drops = [];
const letras = "1010101010101010101010101010101010101011010";
const letrasArray = letras.split("");

function inicializarMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    columnas = Math.floor(canvas.width / fontSize);
    drops = [];

    for (let x = 0; x < columnas; x++) {
        drops[x] = {
            y: Math.random() * canvas.height,       // posición vertical inicial
            velocidad: 2 + Math.random() * 3,       // velocidad de caída
            longitud: 5 + Math.floor(Math.random() * 10) // longitud de rastro
        };
    }
}

function dibujarMatrix() {
    // Fondo semi-transparente para rastro
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + "px monospace";

    drops.forEach((drop, i) => {
        for (let j = 0; j < drop.longitud; j++) {
            const letra = letrasArray[Math.floor(Math.random() * letrasArray.length)];
            // Cabeza blanca brillante
            if (j === 0) ctx.fillStyle = "#FFFFFF";
            else ctx.fillStyle = `rgba(0,255,0,${1 - j / drop.longitud})`;

            ctx.fillText(letra, i * fontSize, drop.y - j * fontSize);
        }

        drop.y += drop.velocidad;

        // Reiniciar al llegar al final
        if (drop.y - drop.longitud * fontSize > canvas.height && Math.random() > 0.975) {
            drop.y = 0;
            drop.velocidad = 2 + Math.random() * 3;
            drop.longitud = 5 + Math.floor(Math.random() * 10);
        }
    });

    requestAnimationFrame(dibujarMatrix);
}

// Inicializar y empezar animación
inicializarMatrix();
requestAnimationFrame(dibujarMatrix);

// Ajustar canvas y reiniciar columnas al cambiar tamaño
window.addEventListener("resize", inicializarMatrix);

