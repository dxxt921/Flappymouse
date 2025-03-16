const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const questionScreen = document.getElementById("questionScreen");
const questionText = document.getElementById("questionText");
const answerButtons = document.querySelectorAll(".answerButton");
const menuCanvas = document.getElementById("menuCanvas");
const ctxMenu = menuCanvas.getContext("2d");

menuCanvas.width = window.innerWidth;
menuCanvas.height = window.innerHeight;

const musicFiles = {
    menu: "MEDIA/MusicaInicio.mp3",
    level1: "MEDIA/Nivel1.mp3",
    level2: "MEDIA/Nivel2.mp3",
    level3: "MEDIA/Nivel3.mp3",
    level4: "MEDIA/Nivel4.mp3",
    level5: "MEDIA/Nivel5.mp3",
};

let backgroundX = 0;
let groundX = 0;
const skyColor = "#70c5ce"; 
const groundColor = "#8B4513"; 
const grassColor = "#228B22"; 

let currentMusic = new Audio(musicFiles.menu);
currentMusic.loop = true;

let gameStarted = false;
let meters = 0;
let invulnerable = false;
let revivalAttempts = 0;
let obstacles = [];
let frameCount = 0;
let currentQuestionIndex = 0;
let level = 1;
let maxMeters = 300;  
let obstacleSpeed = 2.5;

let gameLoopID = null; 


const questions = [
    { question: "¿Qué es POO?", answers: ["Programación Orientada a Objetos", "Protocolo de Operaciones Online", "Proceso Operacional Organizado"], correct: 0 },
    { question: "¿Qué significa HTML?", answers: ["HyperText Markup Language", "High Transfer Machine Learning", "Hyper Tool Modern Logic"], correct: 0 },
    { question: "¿Qué lenguaje se usa en la web?", answers: ["JavaScript", "Python", "C++"], correct: 0 },
    { question: "¿Qué significa CSS?", answers: ["Cascading Style Sheets", "Computer Science Software", "Creative Server System"], correct: 0 },
    { question: "¿Cuál es el lenguaje de bases de datos más usado?", answers: ["SQL", "Java", "PHP"], correct: 0 },
    { question: "¿Cuál de estos es un lenguaje de programación?", answers: ["Python", "HTML", "CSS"], correct: 0 },
    { question: "¿Qué hace un bucle 'for'?", answers: ["Repite código varias veces", "Declara una variable", "Finaliza el programa"], correct: 0 },
    { question: "¿Qué etiqueta HTML se usa para imágenes?", answers: ["<img>", "<pic>", "<image>"], correct: 0 },
    { question: "¿Cómo se declara una variable en JavaScript?", answers: ["let x = 5;", "var = x 5;", "x: int = 5;"], correct: 0 },
    { question: "¿Qué significa la sigla API?", answers: ["Application Programming Interface", "Advanced Programming Instructions", "Automated Process Integration"], correct: 0 },
    { question: "¿Qué es un algoritmo?", answers: ["Un conjunto de instrucciones para resolver un problema", "Un lenguaje de programación", "Un tipo de base de datos"], correct: 0 },
    { question: "¿Qué función tiene el DOM en JavaScript?", answers: ["Manipular la estructura de una página web", "Conectar con bases de datos", "Ejecutar código en el servidor"], correct: 0 },
    { question: "¿Qué es Git?", answers: ["Un sistema de control de versiones", "Un lenguaje de programación", "Un framework de JavaScript"], correct: 0 },
    { question: "¿Cuál es el sistema operativo de código abierto más usado?", answers: ["Linux", "Windows", "MacOS"], correct: 0 },
    { question: "¿Qué es un IDE?", answers: ["Un entorno de desarrollo integrado", "Un compilador", "Un protocolo de red"], correct: 0 },
    { question: "¿Cuál de estos es un lenguaje de programación orientado a objetos?", answers: ["Java", "HTML", "SQL"], correct: 0 },
    { question: "¿Qué hace el comando 'git commit'?", answers: ["Guarda cambios en el repositorio local", "Envía archivos al servidor", "Crea un nuevo repositorio"], correct: 0 },
    { question: "¿Cuál es la diferencia entre HTTP y HTTPS?", answers: ["HTTPS usa cifrado para mayor seguridad", "No hay diferencia", "HTTPS es más rápido"], correct: 0 },
    { question: "¿Qué es una API REST?", answers: ["Un servicio web basado en HTTP", "Un lenguaje de programación", "Una herramienta de diseño"], correct: 0 },
    { question: "¿Cuál es la finalidad de JSON?", answers: ["Intercambiar datos de manera estructurada", "Ejecutar código en el navegador", "Optimizar imágenes en una web"], correct: 0 }
];


const mouse = {
    x: 150,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    velocityY: 0,
    gravity: 0.2,
    jumpPower: -6,
    maxFallSpeed: 4
};

// Obstáculos (tubos)
const obstacleWidth = 70;
const obstacleGap = 160;

// Cargar imágenes
const mouseImg = new Image();
mouseImg.src = "MEDIA/pajaro.png";

const pipeImg = new Image();
pipeImg.src = "MEDIA/tubo.png";

const backgroundImg = new Image();
backgroundImg.src = "MEDIA/paisajegame.JPG";

// Iniciar juego al hacer clic en "Jugar"
startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    canvas.style.display = "block";
    resetGame();
    gameStarted = true;
    changeMusic(level);
    gameLoop();
});


// Evento para saltar
document.addEventListener("keydown", (event) => {
    if (gameStarted && event.code === "Space") {
        jump();
    }
});

document.addEventListener("click", () => {
    if (gameStarted) {
        jump();
    }
});


function drawBackground() {
    // Cielo
    ctxMenu.fillStyle = skyColor;
    ctxMenu.fillRect(0, 0, menuCanvas.width, menuCanvas.height);

    // Montañas
    ctxMenu.fillStyle = "#556B2F"; // Verde oscuro
    ctxMenu.beginPath();
    ctxMenu.moveTo(0, menuCanvas.height - 200);
    ctxMenu.lineTo(150, menuCanvas.height - 300);
    ctxMenu.lineTo(300, menuCanvas.height - 200);
    ctxMenu.lineTo(450, menuCanvas.height - 350);
    ctxMenu.lineTo(600, menuCanvas.height - 200);
    ctxMenu.lineTo(menuCanvas.width, menuCanvas.height - 200);
    ctxMenu.lineTo(menuCanvas.width, menuCanvas.height);
    ctxMenu.lineTo(0, menuCanvas.height);
    ctxMenu.closePath();
    ctxMenu.fill();

    // Suelo (Capa inferior)
    ctxMenu.fillStyle = groundColor;
    ctxMenu.fillRect(0, menuCanvas.height - 40, menuCanvas.width, 40);

    // Hierba
    ctxMenu.fillStyle = grassColor;
    ctxMenu.fillRect(0, menuCanvas.height - 50, menuCanvas.width, 10);
}

function animateBackground() {
    backgroundX -= 1; // Mueve el fondo
    groundX -= 2; // Mueve el suelo más rápido

    if (backgroundX <= -menuCanvas.width) backgroundX = 0;
    if (groundX <= -menuCanvas.width) groundX = 0;

    drawBackground();
    requestAnimationFrame(animateBackground);
}

animateBackground();



function changeMusic(level) {
    let newMusic = musicFiles[`level${level}`];
    if (newMusic) {
        currentMusic.pause(); 
        currentMusic.src = newMusic;  
        currentMusic.currentTime = 0; 
        currentMusic.play(); 
    }
}

function toggleMusic(pause) {
    if (pause) {
        currentMusic.pause();
    } else {
        currentMusic.play();
    }
}

window.onload = () => {
    playMenuMusic();
};


function playMenuMusic() {
    currentMusic.src = musicFiles.menu;
    currentMusic.play();
}


// Función para hacer que el personaje salte
function jump() {
    mouse.velocityY = mouse.jumpPower;
}

// Generar obstáculos
function generateObstacles() {
    let minHeight = 80;
    let maxHeight = canvas.height / 2;
    let obstacleHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);

    let newObstacle = {
        x: canvas.width,
        topHeight: obstacleHeight,
        bottomHeight: canvas.height - obstacleHeight - obstacleGap
    };

    obstacles.push(newObstacle);
}

// Detección de colisión con obstáculos
function checkCollision(mouse, obstacle) {
    if (invulnerable) return false;

    // Definir hitbox
    let hitboxPaddingX = 5;  // Reducir ancho de la hitbox
    let hitboxPaddingY = 5;  // Reducir alto de la hitbox

    let hitbox = {
        x: mouse.x + hitboxPaddingX,
        y: mouse.y + hitboxPaddingY,
        width: mouse.width - (hitboxPaddingX * 2),
        height: mouse.height - (hitboxPaddingY * 2)
    };

    return (
        (hitbox.x < obstacle.x + obstacleWidth &&
            hitbox.x + hitbox.width > obstacle.x &&
            (hitbox.y < obstacle.topHeight || hitbox.y + hitbox.height > canvas.height - obstacle.bottomHeight)) ||
        (hitbox.y + hitbox.height >= canvas.height)
    );
}

// **Bucle principal del juego
const groundHeight = 40; // Aumentar el suelo para que sea más visible

// Bucle principal del juego
function gameLoop() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar fondo
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    // Gravedad del pájaro
    mouse.velocityY += mouse.gravity;
    if (mouse.velocityY > mouse.maxFallSpeed) {
        mouse.velocityY = mouse.maxFallSpeed;
    }
    mouse.y += mouse.velocityY;

    // Dibujar personaje
    ctx.drawImage(mouseImg, mouse.x, mouse.y, mouse.width, mouse.height);

    // Generar obstáculos periódicamente
    if (frameCount % 100 === 0) {
        generateObstacles();
    }

    // Dibujar obstáculos y moverlos
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= obstacleSpeed;

        // Tubo superior
        ctx.save(); 
        ctx.translate(obstacle.x + obstacleWidth, obstacle.topHeight); // Movemos el punto de origen
        ctx.scale(1, -1); // Invertimos el eje Y
        ctx.drawImage(pipeImg, 0, 0, obstacleWidth, obstacle.topHeight);
        ctx.restore(); // Restauramos el estado original del canvas

        // Dibujar tubo inferior
        ctx.drawImage(pipeImg, obstacle.x, canvas.height - obstacle.bottomHeight, obstacleWidth, obstacle.bottomHeight);

        if (checkCollision(mouse, obstacle)) {
            showQuestion();
        }

        if (obstacle.x + obstacleWidth < 0) {
            obstacles.splice(index, 1);
        }
    });

    // Contador de metros
    meters += 0.1;
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Distancia: ${Math.floor(meters)}m`, 20, 30);
    ctx.fillText(`Nivel: ${level}`, 20, 50);

    if (meters >= maxMeters) {
        advanceLevel();
        return;
    }

    frameCount++;
    gameLoopID = requestAnimationFrame(gameLoop);
}

// Avanzar de nivel
function advanceLevel() {
    cancelAnimationFrame(gameLoopID); // Detener la animación antes de cambiar de nivel
    gameStarted = false;


    if (level === 1) {
        alert("¡Nivel 1 completado! Ahora pasas al Nivel 2.");
        level = 2;
        maxMeters = 400;
        obstacleSpeed += 0.5;
        changeMusic(level); 
        resetGame();
        gameStarted = true;
        gameLoop();
    }
    else if (level === 2) {
        alert("¡Nivel 2 completado! Ahora pasas al Nivel 3.");
        level = 3;
        maxMeters = 500;
        obstacleSpeed += 0.5;
        changeMusic(level);
        resetGame();
        gameStarted = true;
        gameLoop();
    }
    else if (level === 3) {
        alert("¡Nivel 3 completado! Ahora pasas al Nivel 4.");
        level = 4;
        maxMeters = 600;
        obstacleSpeed += 0.5;
        changeMusic(level);
        resetGame();
        gameStarted = true;
        gameLoop();
    }
    else if (level === 4) {
        alert("¡Nivel 4 completado! Ahora pasas al Nivel 5.");
        level = 5;
        maxMeters = 700;
        obstacleSpeed += 0.5;
        changeMusic(level);
        resetGame();
        gameStarted = true;
        gameLoop();
    }
    else {
        alert("¡Eres increíble! Has completado todos los niveles y eres un gran informático.");
        restartGame(true);
    }
}


// Mostrar pregunta cuando pierdes
function showQuestion() {
    if (revivalAttempts >= 2) {
        restartGame();
        return;
    }

    gameStarted = false;
    questionScreen.style.display = "block";
    canvas.style.display = "none";

    currentQuestionIndex = Math.floor(Math.random() * questions.length);
    questionText.innerText = questions[currentQuestionIndex].question;

    answerButtons.forEach((button, index) => {
        button.innerText = questions[currentQuestionIndex].answers[index];
        button.onclick = () => checkAnswer(index);
    });
}

// Comprobar respuesta
function checkAnswer(answerIndex) {
    if (answerIndex === questions[currentQuestionIndex].correct) {
        revivalAttempts++;
        invulnerable = true;
        setTimeout(() => {
            invulnerable = false;
        }, 10000);
        gameStarted = true;
        questionScreen.style.display = "none";
        canvas.style.display = "block";
        gameLoop();
    } else {
        restartGame();
    }
}

// Reiniciar juego
function restartGame(victory = false) {
    gameStarted = false;
    level = 1;
    maxMeters = 300;
    obstacleSpeed = 2.5;

    cancelAnimationFrame(gameLoopID); 
    currentMusic.pause(); 
    playMenuMusic(); 

    if (!victory) {
        alert("Has perdido. Volviendo al inicio...");
    }

    questionScreen.style.display = "none"; 
    canvas.style.display = "none"; 
    startScreen.style.display = "block";

    resetGame();
}


// Resetear variables del nivel
function resetGame() {
    meters = 0;
    revivalAttempts = 0;
    obstacles = [];
    invulnerable = false;
    mouse.y = canvas.height / 2;
}


function skipLevel() {
    if (gameStarted) {
        meters = maxMeters - 1; // Salta justo antes del final del nivel actual
        console.log(`Saltaste al final del Nivel ${level}`);
    } else {
        console.log("El juego no ha iniciado. Presiona 'Jugar' primero.");
    }
}

let gamePaused = false; 

// Evento para pausar y reanudar con la tecla "Escape"
document.addEventListener("keydown", (event) => {
    if (event.code === "Escape") {
        togglePause();
    }
});

//Función para pausar/reanudar el juego
function togglePause() {
    if (!gameStarted) return; // No permite pausar en la pantalla de inicio

    gamePaused = !gamePaused;

    if (gamePaused) {
        cancelAnimationFrame(gameLoopID);
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Pausa - Presiona 'Esc' para continuar", canvas.width / 2 - 180, canvas.height / 2);
    } else {
        gameLoop();
    }
}
















