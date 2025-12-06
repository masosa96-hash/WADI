document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://wadi-wxg7.onrender.com"; 
  const API_ENDPOINT = `${API_URL}/kivo/chat`;

  const startBtn = document.getElementById("start-btn");
  const introScreen = document.getElementById("intro-screen");
  const chatScreen = document.getElementById("chat-screen");

  const chatWindow = document.getElementById("chat-window");
  const sendBtn = document.getElementById("send-btn");
  const userInput = document.getElementById("user-input");

  // Validación de elementos
  if (!startBtn || !introScreen || !chatScreen) {
    console.error("ERROR: Faltan elementos esenciales del DOM.");
    return;
  }

  // Pantalla inicial → Chat
  startBtn.onclick = () => {
    introScreen.style.display = "none";
    chatScreen.style.display = "flex";
  };

  // Enviar mensaje
  sendBtn.onclick = sendMessage;
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function addMessage(text, sender = "user") {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.textContent = text;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    userInput.value = "";

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) throw new Error("Error en el servidor");

      const data = await response.json();
      addMessage(data.reply || "Sin respuesta", "kivo");

    } catch (err) {
      addMessage("Error al conectar con el servidor.", "kivo");
      console.error(err);
    }
  }

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(console.error);
  }
});
