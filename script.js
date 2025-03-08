document.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById("video");
    const captureButton = document.getElementById("capture");
    const errorMessage = document.getElementById("mensaje");
    const cameraIcon = document.getElementById("camera-icon");
    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("login-button");
    const registerButton = document.getElementById("register-button");
    const voiceLoginButton = document.getElementById("voice-login");
    const voiceRegisterButton = document.getElementById("voice-register");
    const logoutButton = document.getElementById("logout-button");
    const attendanceTable = document.querySelector("#attendance-table tbody");
    const mainContainer = document.querySelector(".container");

    let users = JSON.parse(localStorage.getItem("users")) || {};
    let attendance = JSON.parse(localStorage.getItem("attendance")) || [];
    let isLoggedIn = false;
    let currentUser = "";
    let stream = null;

    function saveData() {
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("attendance", JSON.stringify(attendance));
    }

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            video.srcObject = stream;
            video.style.transform = "scaleX(-1)"; // Corrige el efecto espejo
            cameraIcon.style.display = "none";
        } catch (error) {
            errorMessage.textContent = "⚠️ No se pudo acceder a la cámara.";
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }
    }

    function renderAttendanceTable() {
        attendanceTable.innerHTML = "";
        attendance.forEach(({ username, date, time }) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${username}</td><td>${date}</td><td>${time}</td>`;
            attendanceTable.appendChild(row);
        });
    }

    function startVoiceRecognition(callback) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "es-ES";
        recognition.start();

        recognition.onresult = event => {
            const transcript = event.results[0][0].transcript.trim();
            if (transcript) {
                callback(transcript);
            }
        };

        recognition.onerror = event => {
            if (event.error !== "no-speech") {
                alert("⚠️ No se pudo reconocer la voz.");
            }
        };
    }

    function login(username, password) {
        if (users[username] === password) {
            isLoggedIn = true;
            currentUser = username;
            loginForm.style.display = "none";
            mainContainer.style.display = "block";
            startCamera();
        } else {
            alert("Credenciales incorrectas");
        }
    }

    loginButton.addEventListener("click", () => {
        login(usernameInput.value.trim(), passwordInput.value.trim());
    });

    registerButton.addEventListener("click", () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        if (!username || !password) return alert("Ingrese usuario y contraseña");
        if (users[username]) return alert("El usuario ya existe");

        users[username] = password;
        saveData();
        alert("Usuario registrado exitosamente");
    });

    logoutButton.addEventListener("click", () => {
        isLoggedIn = false;
        currentUser = "";
        loginForm.style.display = "block";
        mainContainer.style.display = "none";
        stopCamera();
    });

    captureButton.addEventListener("click", () => {
        if (!isLoggedIn) return alert("Debes iniciar sesión primero");
        const today = new Date();
        const date = today.toISOString().split("T")[0];
        const time = today.toTimeString().split(" ")[0];
        
        if (attendance.some(record => record.username === currentUser && record.date === date)) {
            return alert("⚠️ Ya has registrado asistencia hoy");
        }

        attendance.push({ username: currentUser, date, time });
        saveData();
        alert("✅ Asistencia registrada");
        renderAttendanceTable();
    });

    voiceLoginButton.addEventListener("click", () => {
        startVoiceRecognition(username => {
            usernameInput.value = username;
            startVoiceRecognition(password => {
                passwordInput.value = password;
                login(username, password);
            });
        });
    });

    voiceRegisterButton.addEventListener("click", () => {
        startVoiceRecognition(username => {
            usernameInput.value = username;
            startVoiceRecognition(password => {
                passwordInput.value = password;
                users[username] = password;
                saveData();
                alert("Usuario registrado exitosamente");
            });
        });
    });

    mainContainer.style.display = "none";
    renderAttendanceTable();
});
