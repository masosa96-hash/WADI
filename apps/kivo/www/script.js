// ==============================
// CONFIG
// ==============================
const API_URL = "https://wadi-wxg7.onrender.com";

// ==============================
// DOM ELEMENTS
// ==============================
const chatContainer = document.getElementById("chat");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("send");

// ==============================
// HELPERS
// ==============================
function addMessage(role, content) {
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  el.innerText = content;
  chatContainer.appendChild(el);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ==============================
// SEND MESSAGE
// ==============================
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  addMessage("user", text);
  messageInput.value = "";

  try {
    const res = await fetch(`${API_URL}/kivo/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    if (data.reply) {
      addMessage("assistant", data.reply);
    } else {
      addMessage("assistant", "Error: respuesta inválida del servidor.");
    }

  } catch (err) {
    addMessage("assistant", "Error de red o servidor caído.");
  }
}

sendButton.onclick = sendMessage;
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
