// ==============================
// KIVO FRONTEND LOGIC
// ==============================

// Validar que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // ==============================
  // CONFIG
  // ==============================
  const API_URL = "https://wadi-wxg7.onrender.com/api";

  // ==============================
  // SERVICE WORKER
  // ==============================
  if ("serviceWorker" in navigator) {
    const isKivoRoute = window.location.pathname.includes("/kivo");
    // Also register if we are testing locally or loosely, but strict requirement was "Register ... only if current path is correct"
    if (isKivoRoute) {
      navigator.serviceWorker
        .register("./sw.js", { scope: "./" })
        .then((reg) => console.log("SW registrado:", reg.scope))
        .catch((err) => console.error("SW error:", err));
    }
  }

  // ==============================
  // DOM ELEMENTS
  // ==============================
  const startBtn = document.getElementById("start-btn");
  const inicioSection = document.getElementById("inicio");
  const chatSection = document.getElementById("chat-section");
  const chatWindow = document.getElementById("chat-window");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send");
  const chatForm = document.getElementById("chat-form");

  // ==============================
  // UI LOGIC
  // ==============================

  // Start Button Logic
  if (startBtn && inicioSection && chatSection) {
    startBtn.onclick = () => {
      inicioSection.style.display = "none";
      chatSection.style.display = "flex";
    };
  }

  // ==============================
  // HELPERS
  // ==============================
  function addMessage(role, content) {
    if (!chatWindow) return;

    const el = document.createElement("div");
    // Match CSS classes: .message .user or .message .kivo
    const cssClass = role === "assistant" ? "kivo" : role;

    el.className = `message ${cssClass}`;
    el.innerText = content;
    chatWindow.appendChild(el);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  // ==============================
  // SEND MESSAGE
  // ==============================
  async function sendMessage(e) {
    if (e) e.preventDefault();

    if (!messageInput) return;
    const text = messageInput.value.trim();
    if (!text) return;

    addMessage("user", text);
    messageInput.value = "";

    try {
      const res = await fetch(`${API_URL}/kivo/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (data.reply) {
        addMessage("assistant", data.reply);
      } else {
        addMessage("assistant", "Error: respuesta inválida del servidor.");
      }
    } catch (err) {
      console.error(err);
      addMessage("assistant", "Error de red o servidor caído.");
    }
  }

  // Attach Event Listeners
  if (chatForm) {
    chatForm.addEventListener("submit", sendMessage);
  } else if (sendButton) {
    sendButton.onclick = sendMessage;
  }
});
