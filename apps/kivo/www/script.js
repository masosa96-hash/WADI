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
let popSonido;
let deferredPrompt; // Para PWA install

// Estado de Kivo
let userId = null; // Modificado: Inicialmente null
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

    // Sonido
    popSonido = new Audio("assets/pop.mp3");

    // --- 2. LÓGICA DE INICIO Y NAVEGACIÓN ---

    if (empezarBtn) {
      empezarBtn.addEventListener("click", () => {
        inicioScreen.style.display = "none";
        chatScreen.style.display = "flex";
        scrollToBottom();

        // Esperar a que la autenticación esté lista
        // cargarUsuario() se llamará desde el listener de onAuthStateChanged en firebase-config.js
      });
    }

    if (chatForm) {
      chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const userMessage = messageInput.value.trim();
        if (userMessage) {
          handleUserMessage(userMessage);
        }
        messageInput.focus(); // Mantener foco en móvil
      });
    }

    // Registro Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("ServiceWorker registrado con éxito:", registration);
        })
        .catch((err) => {
          console.warn("Falló el registro del ServiceWorker:", err);
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
          console.log(`User response to the install prompt: ${outcome}`);
          deferredPrompt = null;
          installPrompt.style.display = "none";
        }
      });
    }
  });
}

// Función central de manejo de mensajes
function handleUserMessage(userMessage) {
  analyzeUserStyle(userMessage); // Analiza perfil
  addMessageToChat(userMessage, "user");
  if (messageInput) messageInput.value = "";
  lastMessageTimestamp = Date.now(); // Guarda la hora del envío

  // Llamada al Backend (Cerebro 2.0)
  fetch("http://localhost:3000/kivo/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mensajeUsuario: userMessage,
      historial: chatHistory.slice(-5), // Enviamos los últimos 5 mensajes para contexto
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Guardamos en BD
      if (userId) {
        guardarMensaje(userId, userMessage, data.emocion, data.modo);
      }

      // Actualizamos UI
      setBodyEmotion(data.emocion);

      // Enviamos respuesta
      addMessageToChat(data.respuestaKivo, "kivo");
    })
    .catch((err) => {
      console.error("Error conectando con Kivo Brain:", err);
      addMessageToChat(
        "Lo siento, estoy teniendo problemas para conectar con mi cerebro.",
        "kivo",
        "tecnico"
      );
    });
}

// --- 3. FUNCIONES DE FIREBASE (V12) ---

// =============================
// CARGAR PERFIL Y HISTORIAL
// =============================
async function cargarUsuario(uid) {
  userId = uid; // Guardamos el UID globalmente
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
        "kivo",
        "emocional"
      );
    }
  } catch (err) {
    console.error("Error al cargar Firebase:", err);
    addMessageToChat("Error de permisos o conexión.", "kivo");
  }
}

// =============================
// GUARDAR MENSAJE
// =============================
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

// =============================
// GUARDAR PERFIL
// =============================
async function guardarPerfil(uid, perfil) {
  if (!uid) return;
  await db.collection("usuarios").doc(uid).set({ perfil }, { merge: true });
}

// --- 4. FUNCIONES HELPER (Inteligencia V13) ---

function obtenerMomentoDelDía() {
  const hora = new Date().getHours();
  if (hora >= 22 || hora < 6) return "noche_descanso"; // ¡NUEVO!
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
  // (Sin cambios)
  const tecnico =
    /\b(puerto|proceso|script|evento|auditoría|log|firewall|powershell|sistema|control|validar|debug|conexión|remoto|registro)\b/i;
  const emocional =
    /\b(triste|ansiedad|raro|bajón|no sé|soledad|miedo|bronca|feliz|contento|confuso|extraño|sentir|emocion|estado)\b/i;
  if (tecnico.test(input)) return "tecnico";
  if (emocional.test(input)) return "emocional";
  return "neutro";
}

function detectarSubmodo(input) {
  // (Sin cambios)
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
  if (emotion.startsWith("triste")) {
    body.classList.add("triste");
  } else if (emotion.startsWith("ansioso")) {
    body.classList.add("ansioso");
  } else if (emotion.startsWith("contento")) {
    body.classList.add("contento");
  }
}

// --- 5. LÓGICA DE CHAT (Núcleo V13) ---

function addMessageToChat(message, sender) {
  if (typeof document === "undefined") return; // Node check
  if (!chatWindow) return;

  const messageElement = document.createElement("div");
  messageElement.classList.add("message", sender);
  if (sender === "kivo") {
    if (popSonido && popSonido.play) popSonido.play().catch(() => {}); // Catch autoplay errors
  }
  messageElement.innerHTML = `<p>${message}</p>`;
  chatWindow.appendChild(messageElement);
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
  // (Función V11 sin cambios)
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
  if (/mil gracias|se agradece|genio/i.test(lowerInput))
    userProfile.gratitudeType = "expresivo";
  else if (/gracias|gracia/i.test(lowerInput))
    userProfile.gratitudeType = "simple";

  if (userId) guardarPerfil(userId, userProfile);
}

// --- 6. MOTOR DE RESPUESTAS DE KIVO (V13) ---
function kivoResponse(userInput) {
  // Objeto de respuesta
  let responseDetails = {
    response: "",
    finalMode: kivoVoice, // El modo por defecto es la voz elegida
    emotion: currentEmotion, // Emoción por defecto
  };

  // --- LÓGICA DE VOZ "BARRIO" ---
  const LOGICA_BARRIO = (input) => {
    let res = "";
    let emotion = currentEmotion;

    if (input.includes("triste") || input.includes("bajón")) {
      res =
        "Uh, qué cag... es un garrón sentirse así. Pero acá estoy, ¿querés largar un poco?";
      emotion = "triste";
    } else if (input.includes("ansiedad") || input.includes("estrés")) {
      res =
        "Esa te liquida... te corre por todos lados. Respirá hondo, loco. ¿Qué te tiene así?";
      emotion = "ansioso";
    } else if (
      input.includes("feliz") ||
      input.includes("contento") ||
      input.includes("re bien")
    ) {
      res =
        "¡Vamos! Así me gusta. ¿Qué onda, qué pasó de bueno? Tirame la data.";
      emotion = "contento";
    } else if (input.includes("hola") || input.includes("che")) {
      res = "¡Epa! ¿Todo tranca? ¿Qué se cuenta?";
      emotion = "neutral";
    } else if (input.includes("gracias") || input.includes("gracia")) {
      res = "De nada, man. Para eso estamos. ¿Algo más?";
      emotion = "neutral";
    } else if (input.includes("silencio")) {
      res = "Todo bien. Quedate piola. Estoy acá igual.";
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

  // --- LÓGICA DE VOZ "REFLEXIVA" ---
  const LOGICA_REFLEXIVA = (input) => {
    let res = "";
    let emotion = currentEmotion;
    const submodo = detectarSubmodo(input);

    if (/no sirvo|siempre me pasa|nunca puedo/i.test(input)) {
      res =
        "Eso que decís suena como una creencia instalada. ¿Querés que lo desarmemos juntos, sin apuro?";
      emotion = "reflexivo"; // Usamos 'reflexivo' como modo y emoción
    } else if (submodo === "reflexivo" || input.includes("pensando")) {
      res = "Es fascinante... ¿Qué disparó esa línea de pensamiento?";
      emotion = "confuso";
    } else if (submodo === "creativo" || input.includes("idea")) {
      res =
        "La creatividad es la inteligencia divirtiéndose. ¿Cuál es el núcleo de esa idea?";
      emotion = "contento";
    } else if (input.includes("hola")) {
      res = "Hola. Un gusto conectar. ¿Sobre qué te gustaría reflexionar hoy?";
      emotion = "neutral";
    } else if (input.includes("triste") || input.includes("ansioso")) {
      res =
        "Entiendo. ¿Podrías describir la textura de ese sentimiento? ¿Dónde lo sentís?";
      emotion = input.includes("triste") ? "triste" : "ansioso";
    } else if (input.includes("no sé")) {
      res =
        'El "no saber" es, a menudo, el primer paso para el verdadero saber. ¿Qué sentís en esa incertidumbre?';
      emotion = "confuso";
    } else {
      res = "Interesante. ¿Y qué conclusión sacás de eso?";
    }
    responseDetails.response = res;
    responseDetails.emotion = emotion;
  };

  // --- LÓGICA DE VOZ "EMOCIONAL" (La V11 completa) ---
  const LOGICA_EMOCIONAL = (input) => {
    // (Esta es la lógica V11 que ya teníamos)
    const momento = obtenerMomentoDelDía();
    const modo = detectarModo(input);
    const submodo = detectarSubmodo(input);
    let res = "";
    let emotion = currentEmotion;
    let emotionDetected = false;

    // 1. MANEJO DE OFERTAS
    if (emotion === "ansioso_ofreciendo_ayuda") {
      if (input.includes("dale") || input.includes("sí")) {
        res =
          "Genial. Es simple: Inhalá profundo (4 seg)... sostené (4 seg)... y largalo despacio (6 seg). Repetilo un par de veces.";
        emotion = "ansioso";
      } else {
        res =
          "No hay problema, tranqui. Era solo una idea. ¿Querés seguir contándome qué te pasa?";
        emotion = "ansioso";
      }
      responseDetails.response = res;
      responseDetails.emotion = emotion;
      return;
    }
    if (emotion === "triste_ofreciendo_ayuda") {
      if (input.includes("dale") || input.includes("sí")) {
        res =
          "Ok, tomá un segundo. Intentá escribir (acá o en un papel) 3 cosas que sentís ahora mismo, sin filtro. Te espero.";
        emotion = "triste";
      } else {
        res =
          "Todo bien. No te preocupes. ¿Querés seguir charlando sobre eso? Te leo.";
        emotion = "triste";
      }
      responseDetails.response = res;
      responseDetails.emotion = emotion;
      return;
    }

    // 2. DETECCIÓN DE EMOCIONES
    if (/no sirvo|siempre me pasa|nunca puedo/i.test(input)) {
      res =
        "Eso que decís suena como una creencia instalada. ¿Querés que lo desarmemos juntos, sin apuro?";
      emotion = "reflexivo"; // Sobreescribe la voz
      responseDetails.finalMode = "reflexivo";
      emotionDetected = true;
    } else if (
      input.includes("triste") ||
      input.includes("deprimido") ||
      input.includes("llorar")
    ) {
      res =
        'Uh, qué bajón... Largar todo eso es el primer paso. ¿Querés probar un ejercicio simple de "descarga" de sentimientos?';
      emotion = "triste_ofreciendo_ayuda";
      emotionDetected = true;
    } else if (
      input.includes("ansiedad") ||
      input.includes("estresado") ||
      input.includes("estrés")
    ) {
      res =
        "La ansiedad te revuelve todo, ¿no? ¿Querés probar un ejercicio de respiración simple para anclarse?";
      emotion = "ansioso_ofreciendo_ayuda";
      emotionDetected = true;
    } else if (input.includes("solo") || input.includes("soledad")) {
      res =
        "La soledad pega... pero ahora estoy con vos. ¿Querés hablar de eso?";
      emotion = "solo";
      emotionDetected = true;
    } else if (
      input.includes("enojado") ||
      input.includes("molesto") ||
      input.includes("rabia")
    ) {
      res = "Uf, qué bronca... si querés descargar, este es tu espacio.";
      emotion = "enojado";
      emotionDetected = true;
    } else if (
      input.includes("miedo") ||
      input.includes("temor") ||
      input.includes("preocupado")
    ) {
      res = "El miedo te deja medio paralizado, ¿no? Pero tranqui, estoy acá.";
      emotion = "miedo";
      emotionDetected = true;
    } else if (input.includes("aburrido") || input.includes("embole")) {
      res = "El embole total... ¿Querés que pensemos algo para cortar con eso?";
      emotion = "aburrido";
      emotionDetected = true;
    } else if (
      (input.includes("bien") &&
        (input.includes("pero") ||
          input.includes("no sé") ||
          input.includes("ultimamente") ||
          input.includes("raro"))) ||
      input.includes("me siento raro") ||
      input.includes("ando medio") ||
      input.includes("no sé qué me pasa")
    ) {
      res =
        'Entiendo, es como una mezcla rara, ¿no? A veces uno está "bien" pero hay algo que no termina de cerrar. Si querés, lo charlamos tranqui.';
      emotion = "confuso";
      emotionDetected = true;
    } else if (
      input.includes("🙃") ||
      input.includes("todo joya") ||
      (input.includes("re feliz") && input.includes("jaja")) ||
      input.includes("sobreviviendo")
    ) {
      res =
        "Jaja, ese “todo joya” suena con doble fondo... Si querés, seguimos charlando de eso. Estoy acá, tranqui.";
      emotion = "confuso";
      emotionDetected = true;
    } else if (
      input.includes("feliz") ||
      input.includes("contento") ||
      input.includes("bien")
    ) {
      res = "¡Qué bueno eso! Contame, ¿qué te tiene con esa buena vibra?";
      emotion = "contento";
      emotionDetected = true;
    }

    // 3. RESPUESTAS DE CONTEXTO
    if (!emotionDetected) {
      if (input.includes("gracias") || input.includes("gracia")) {
        res =
          userProfile.gratitudeType === "expresivo"
            ? "No hay de qué, de verdad. Es un placer acompañarte."
            : "No hay drama, posta. Me gusta estar acá para vos.";
        emotion = "neutral";
      } else if (input.includes("no sé") || input.includes("nose")) {
        switch (emotion) {
          case "triste":
            res =
              "Y sí... cuando uno está bajón, todo se vuelve medio confuso. No pasa nada.";
            break;
          case "ansioso":
            res =
              "La ansiedad te deja en blanco a veces. Respirá, no hay apuro.";
            break;
          case "confuso":
            res =
              'Ese "no sé" tiene peso, ¿no? Si querés, lo desarmamos juntos.';
            break;
          default:
            res = "No saber también está bien. Nadie tiene todo claro siempre.";
        }
      } else if (
        input.includes("hola") ||
        input.includes("buen día") ||
        input.includes("buenas") ||
        input.includes("che") ||
        input.includes("ey")
      ) {
        const saludo =
          userProfile.greetingType === "informal"
            ? "¡Ey!"
            : momento === "mañana"
            ? "Buen día"
            : momento === "tarde"
            ? "Buenas tardes"
            : "Buenas noches";
        res = `${saludo}, qué bueno verte de nuevo. ¿Cómo venís esta ${momento}?`;
        emotion = "neutral";
      } else if (
        input.includes("chau") ||
        input.includes("adiós") ||
        input.includes("me voy")
      ) {
        res = "Dale, cuidate. Acordate que estoy acá si necesitás hablar.";
        emotion = "neutral";
      } else if (input.includes("silencio") || input.includes("descansar")) {
        res =
          "Todo bien. Podemos quedarnos en silencio un rato. Estoy acá igual.";
        emotion = "neutral";
      } else if (submodo === "reflexivo") {
        res =
          "Te re entiendo. Esos momentos de introspección son clave. ¿Querés compartir algo de eso que venís pensando?";
        emotion = "confuso";
        responseDetails.finalMode = "reflexivo";
      } else if (submodo === "creativo") {
        res =
          "¡Me encanta! Esas chispas de creatividad son geniales. ¿Querés contarme más sobre esa idea o proyecto?";
        emotion = "contento";
        responseDetails.finalMode = "creativo";
      } else {
        // Genérica
        switch (emotion) {
          case "triste":
            res = `Dijiste “${userInput}”... y eso suena fuerte. Lo podemos desarmar juntos.`;
            break;
          case "ansioso":
            res =
              "¿Eso que me decís tiene que ver con lo que te venía angustiando? Estoy acá.";
            break;
          case "contento":
            res =
              "¡Me encanta esa energía! ¿Querés contarme más de lo que te tiene tan bien?";
            break;
          default:
            res =
              "Gracias por compartir eso. ¿Cómo te hace sentir lo que me contás? Estoy acá para vos.";
        }
      }
    }

    // 4. PULIDO V13

    // Clima
    const clima = detectarClimaEmocional(chatHistory);
    if (clima && clima !== emotion) {
      if (clima === "triste" || clima === "confuso" || clima === "ansioso") {
        res += ` Además, noté que venís ${clima} en varios mensajes. Si querés, podemos pensar algo distinto para cortar con eso.`;
      }
    }

    // Noche Descanso
    if (momento === "noche_descanso") {
      res +=
        " Ya es tarde, si querés podemos bajar un cambio y dejar que el cuerpo respire.";
    }

    // Velocidad
    const longitud = input.length;
    const velocidad = Date.now() - lastMessageTimestamp;
    if (longitud < 30 && velocidad < 5000) {
      // Menos de 5 seg
      res +=
        " Noté que estás escribiendo más breve y rápido. ¿Querés que vayamos más al grano hoy?";
    }

    // Fecha especial
    const hoy = new Date();
    if (hoy.getDate() === 19 && hoy.getMonth() === 9) {
      // 19 de Octubre (mes 9 en JS)
      res +=
        " Hoy es el aniversario del pueblo. ¿Querés que armemos algo especial para compartir?";
    }

    // Adaptación final al estilo del usuario
    if (userProfile.emojis) res += " 😊";
    if (userProfile.slang.includes("posta"))
      res = res.replace("Estoy acá", "Estoy acá, posta");
    if (userProfile.prefersShort) res = res.split(".")[0] + ".";

    responseDetails.response = res;
    responseDetails.emotion = emotion;
  };

  // --- CONTROLADOR PRINCIPAL ---
  const input = userInput.toLowerCase();

  // Override: Modo técnico
  if (detectarModo(input) === "tecnico") {
    kivoVoice = "tecnico"; // Forzar voz técnica
  } else if (input.includes("modo barrio")) {
    kivoVoice = "barrio";
    userProfile.voz = "barrio";
    if (userId) guardarPerfil(userId, userProfile);
    responseDetails.response =
      "Tranqui, loco. Acá estamos pa lo que pinte. ¿Querés largar eso que te pesa?";
    responseDetails.emotion = "neutral";
    responseDetails.finalMode = "barrio";
    return responseDetails; // Salir
  } else {
    kivoVoice = userProfile.voz; // Volver a la voz guardada
  }

  // SWITCH DE VOZ
  switch (kivoVoice) {
    case "barrio":
      LOGICA_BARRIO(input);
      break;
    case "tecnico":
      LOGICA_TECNICA(input);
      break;
    case "reflexivo":
      LOGICA_REFLEXIVA(input);
      break;
    case "emocional":
    default:
      LOGICA_EMOCIONAL(input);
  }

  // Asignar el modo de burbuja final (si no se asignó ya)
  if (!responseDetails.finalMode) {
    responseDetails.finalMode = kivoVoice;
  }

  // Resetear kivoVoice si fue un override temporal
  if (kivoVoice === "creativo" || kivoVoice === "reflexivo") {
    kivoVoice = userProfile.voz;
  }

  return responseDetails;
}

// Export for testing
if (typeof module !== "undefined") {
  module.exports = {
    detectarModo,
    detectarSubmodo,
    detectarClimaEmocional,
    obtenerMomentoDelDía,
    kivoResponse,
  };
}
