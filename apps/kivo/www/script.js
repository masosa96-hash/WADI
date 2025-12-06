// ===============================
// KIVO FRONTEND SCRIPT (PWA)
// ===============================

// API de backend (Render)
const API_URL = "https://wadi-wxg7.onrender.com";

// Helpers
function $(id) {
  return document.getElementById(id);
}

// Elements
const promptInput = $("prompt");
const sendBtn = $("sendBtn");
const outputDiv = $("output");

// Send prompt to API
async function sendPrompt() {
  const text = promptInput.value.trim();
  if (!text) return;

  outputDiv.innerHTML += `<div class="msg user">${text}</div>`;
  promptInput.value = "";
  sendBtn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/kivo/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt: text })
    });

    const data = await res.json();

    outputDiv.innerHTML += `<div class="msg ai">${data.reply}</div>`;
    outputDiv.scrollTop = outputDiv.scrollHeight;
  } catch (err) {
    console.error(err);
    outputDiv.innerHTML += `<div class="msg ai error">Error de conexión</div>`;
  } finally {
    sendBtn.disabled = false;
  }
}

sendBtn.addEventListener("click", sendPrompt);

promptInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendPrompt();
});

// Service worker (PWA)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
