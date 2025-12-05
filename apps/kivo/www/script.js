// --- 1. VARIABLES GLOBALES Y ELEMENTOS DEL DOM ---
let body,
  inicioScreen,
  chatScreen,
  empezarBtn,
  chatForm,
  messageInput,
  chatWindow,
  installBtn,
  installPrompt;
let deferredPrompt; // Para PWA install

// Estado de Kivo
let userId = null;
let currentEmotion = "neutral";
let chatHistory = [];
let userProfile = {
  emojis: false,
  slang: [],
  prefersShort: false,
  greetingType: "neutral",
  gratitudeType: "neutral",
  voz: "emocional",
};
let lastMessageTimestamp = Date.now();
let kivoVoice = "emocional"; // Default voice

// --- INICIALIZACIÓN DOM ---
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    body = document.getElementById("body");
    inicioScreen = document.getElementById("inicio");
    chatScreen = document.getElementById("chat-section");
    empezarBtn = document.getElementById("empezar-btn");
    chatForm = document.getElementById("chat-form");
    messageInput = document.getElementById("message-input");
    chatWindow = document.getElementById("chat-window");
    installBtn = document.getElementById("install-btn");
    installPrompt = document.getElementById("install-prompt");

    // --- 2. LÓGICA DE INICIO Y NAVEGACIÓN ---

    if (empezarBtn) {
      empezarBtn.addEventListener("click", () => {
        inicioScreen.style.display = "none";
        chatScreen.style.display = "flex";
        scrollToBottom();
      });
    }

    if (chatForm) {
      chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const userMessage = messageInput.value.trim();
        if (userMessage) {
          handleUserMessage(userMessage);
        }
        messageInput.focus();
      });
    }

    // Registro Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("./sw.js")
        .then((registration) => {
          console.log("ServiceWorker registrado:", registration);
        })
        .catch((err) => {
          console.warn("Falló registro ServiceWorker:", err);
        });
    }

    // PWA Install Prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installPrompt) installPrompt.style.display = "block";
    });

    if (installBtn) {
      installBtn.addEventListener("click", async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response: ${outcome}`);
          deferredPrompt = null;
          installPrompt.style.display = "none";
        }
      });
    }
  });
}

// Función central de manejo de mensajes
const API_URL = "https://ideal-essence-production.up.railway.app/kivo/message";

function handleUserMessage(userMessage) {
  analyzeUserStyle(userMessage);
  addMessageToChat(userMessage, "user");
  if (messageInput) messageInput.value = "";
  lastMessageTimestamp = Date.now();

  // Llamada al Backend Real (Railway)
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mensajeUsuario: userMessage,
      historial: chatHistory.slice(-5),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (userId) {
        guardarMensaje(userId, userMessage, data.emocion, data.modo);
      }
      setBodyEmotion(data.emocion);
      addMessageToChat(data.respuestaKivo, "kivo");
    })
    .catch((err) => {
      console.error("Error conectando con Kivo Brain:", err);
      // Fallback local
      try {
        const localData = kivoResponse(userMessage);
        addMessageToChat(localData.response, "kivo");
      } catch (e) {
        addMessageToChat(
          "Estoy teniendo problemas de conexión. Intenta de nuevo.",
          "kivo"
        );
      }
    });
}

async function cargarUsuario(uid) {
  userId = uid;
  try {
    const doc = await db.collection("usuarios").doc(uid).get();

    if (doc.exists) {
      const data = doc.data();
      userProfile = data.perfil || {};
      chatHistory = data.historialEmocional || [];
      currentEmotion = chatHistory.slice(-1)[0]?.emocion || "neutral";
      setBodyEmotion(currentEmotion);

      const momento = obtenerMomentoDelDía();
      addMessageToChat(
        `Hola. Qué bueno verte esta ${momento}. ¿Cómo venís hoy?`,
        "kivo"
      );
    } else {
      addMessageToChat(
        "Hola, soy Kivo. Estoy aquí para escucharte. ¿Cómo te sientes hoy?",
        "kivo"
      );
    }
  } catch (err) {
    console.error("Error al cargar Firebase:", err);
    addMessageToChat("Hola. Estoy listo para charlar.", "kivo");
  }
}

async function guardarMensaje(uid, mensaje, emocion, modo) {
  const docRef = db.collection("usuarios").doc(uid);
  const nuevo = {
    mensaje,
    emocion,
    modo,
    etiqueta:
      emocion === "confuso" || emocion === "triste" ? "día raro" : "normal",
    timestamp: new Date().toISOString(),
  };

  try {
    await docRef.update({
      historialEmocional: firebase.firestore.FieldValue.arrayUnion(nuevo),
    });
    chatHistory.push(nuevo);
  } catch (err) {
    await docRef.set({ historialEmocional: [nuevo] }, { merge: true });
    chatHistory.push(nuevo);
  }
}

async function guardarPerfil(uid, perfil) {
  if (!uid) return;
  await db.collection("usuarios").doc(uid).set({ perfil }, { merge: true });
}

// --- 4. FUNCIONES HELPER ---

function obtenerMomentoDelDía() {
  const hora = new Date().getHours();
  if (hora >= 22 || hora < 6) return "noche_descanso";
  if (hora >= 6 && hora < 12) return "mañana";
  if (hora >= 12 && hora < 18) return "tarde";
  return "noche";
}

function detectarClimaEmocional(historial) {
  const emociones = historial.slice(-5).map((e) => e.emocion);
  const cuenta = emociones.reduce((acc, emo) => {
    acc[emo] = (acc[emo] || 0) + 1;
    return acc;
  }, {});
  const dominante = Object.entries(cuenta).find(([_, cant]) => cant >= 3);
  return dominante ? dominante[0] : null;
}

function detectarModo(input) {
  const tecnico =
    /\b(puerto|proceso|script|evento|auditoría|log|firewall|powershell|sistema|control|validar|debug|conexión|remoto|registro)\b/i;
  const emocional =
    /\b(triste|ansiedad|raro|bajón|no sé|soledad|miedo|bronca|feliz|contento|confuso|extraño|sentir|emocion|estado)\b/i;
  if (tecnico.test(input)) return "tecnico";
  if (emocional.test(input)) return "emocional";
  return "neutro";
}

function detectarSubmodo(input) {
  const reflexivo =
    /\b(pensando|reflexionando|últimamente|no sé qué quiero|me estuve dando cuenta|me di cuenta|me siento distinto|cambiando|procesando)\b/i;
  const creativo =
    /\b(idea|crear|armar|escribir|proyecto|me pintó|me inspiró|quiero hacer algo)\b/i;
  if (reflexivo.test(input)) return "reflexivo";
  if (creativo.test(input)) return "creativo";
  return null;
}

function setBodyEmotion(emotion) {
  if (!body) return;
  body.className = "";
  if (emotion && emotion.startsWith("triste")) body.classList.add("triste");
  else if (emotion && emotion.startsWith("ansioso"))
    body.classList.add("ansioso");
  else if (emotion && emotion.startsWith("contento"))
    body.classList.add("contento");
}

function addMessageToChat(message, sender) {
  if (typeof document === "undefined") return;
  if (!chatWindow) return;

  const messageElement = document.createElement("div");
  messageElement.classList.add("message", sender);
  messageElement.innerHTML = `<p>${message}</p>`;
  chatWindow.appendChild(messageElement);
  scrollToBottom();
}

function scrollToBottom() {
  if (chatWindow) {
    setTimeout(() => {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }, 50);
  }
}

function analyzeUserStyle(input) {
  const lowerInput = input.toLowerCase();
  userProfile.emojis = /[\u{1F600}-\u{1F64F}]/u.test(input);
  const slangMatches = lowerInput.match(
    /\b(re|posta|jaja|uff|che|onda|pinta|bajón|embole|tranqui|dale)\b/gi
  );
  if (slangMatches) {
    slangMatches.forEach((word) => {
      if (!userProfile.slang.includes(word)) userProfile.slang.push(word);
    });
  }
  userProfile.prefersShort = input.split(" ").length <= 5;
  if (/qué onda|ey|che/i.test(lowerInput))
    userProfile.greetingType = "informal";
  else if (/hola|buenas/i.test(lowerInput)) userProfile.greetingType = "formal";

  if (userId) guardarPerfil(userId, userProfile);
}

// --- 6. MOTOR DE RESPUESTAS DE KIVO (V13 - Standalone) ---
function kivoResponse(userInput) {
  let responseDetails = {
    response: "",
    finalMode: kivoVoice,
    emotion: currentEmotion,
  };

  // --- LÓGICA DE VOZ "BARRIO" ---
  const LOGICA_BARRIO = (input) => {
    let res = "";
    let emotion = currentEmotion;

    if (input.includes("triste") || input.includes("bajón")) {
      emotion = "neutral";
    } else if (input.includes("gracias")) {
      res = "De nada, man. Para eso estamos. ¿Algo más?";
      emotion = "neutral";
    } else {
      res = "Te sigo, te sigo... ¿Qué más?";
    }
    responseDetails.response = res;
    responseDetails.emotion = emotion;
  };

  // --- LÓGICA DE VOZ "TÉCNICA" ---
  const LOGICA_TECNICA = (input) => {
    let res = "Input recibido. Procesando...";
    if (input.includes("hola"))
      res = "Saludos. Sistema Kivo en línea. Esperando comando.";
    else if (input.includes("validar"))
      res = "Validación recibida. Script operativo. Estado: " + currentEmotion;
    else if (input.includes("triste"))
      res = `Emoción detectada: triste. Protocolo de escucha activado.`;
    else if (input.includes("chau"))
      res = "Cerrando sesión. Que tenga un día productivo.";
    responseDetails.response = res;
    responseDetails.emotion = "neutral";
  };

  // --- LÓGICA DE VOZ "EMOCIONAL" (Simplificada) ---
  const LOGICA_EMOCIONAL = (input) => {
    let res = "";
    let emotion = currentEmotion;

    if (input.includes("triste") || input.includes("deprimido")) {
      res =
        "Uh, qué bajón... Largar todo eso es el primer paso. Estoy acá para escucharte.";
      emotion = "triste";
    } else if (input.includes("ansiedad") || input.includes("estrés")) {
      res =
        "La ansiedad te revuelve todo, ¿no? Respirá profundo. Estoy con vos.";
      emotion = "ansioso";
    } else if (input.includes("feliz") || input.includes("contento")) {
      res = "¡Qué bueno eso! Contame, ¿qué te tiene con esa buena vibra?";
      emotion = "contento";
    } else if (input.includes("hola") || input.includes("buenas")) {
      res = "¡Hola! Qué bueno verte. ¿Cómo te sentís hoy?";
      emotion = "neutral";
    } else if (input.includes("gracias")) {
      res = "No hay de qué. Es un placer acompañarte.";
      emotion = "neutral";
    } else {
      res = "Te escucho. Contame más sobre eso.";
    }
    responseDetails.response = res;
    responseDetails.emotion = emotion;
  };

  const input = userInput.toLowerCase();

  if (detectarModo(input) === "tecnico") kivoVoice = "tecnico";
  else if (input.includes("modo barrio")) {
    kivoVoice = "barrio";
    responseDetails.response =
      "Tranqui, loco. Acá estamos pa lo que pinte. ¿Querés largar eso que te pesa?";
    return responseDetails;
  } else {
    kivoVoice = userProfile.voz;
  }

  switch (kivoVoice) {
    case "barrio":
      LOGICA_BARRIO(input);
      break;
    case "tecnico":
      LOGICA_TECNICA(input);
      break;
    default:
      LOGICA_EMOCIONAL(input);
  }

  if (!responseDetails.finalMode) responseDetails.finalMode = kivoVoice;
  return responseDetails;
}

if (typeof module !== "undefined") {
  module.exports = { detectarModo, kivoResponse };
}
