import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useChatStore, type Attachment } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";
import { useScouter } from "../hooks/useScouter";
import { chatShortcuts } from "../config/chatShortcuts";

import { TerminalInput } from "../components/ui/TerminalInput";
import { Scouter } from "../components/ui/Scouter";
import { DecisionWall } from "../components/auditor/DecisionWall";
import { AuditorHeader } from "../components/auditor/AuditorHeader";
import { DataDeconstructor } from "../components/auditor/DataDeconstructor";
import { Dropzone } from "../components/auditor/Dropzone";

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const {
    messages,
    isLoading,
    sendMessage,
    loadConversations,
    resetChat,
    loadConversation,
    hasStarted,
    conversationId: storeConversationId,
    activeFocus,
    crystallizeProject,
    setCustomSystemPrompt,
    getSystemPrompt,
  } = useChatStore();

  const { initAmbientHum, audioState, playCrystallizeSound } = useScouter();

  const lastMessage = messages[messages.length - 1];
  const isLastMessageUser = lastMessage?.role === "user";
  const hasForceDecision =
    lastMessage?.content?.includes("[FORCE_DECISION]") ||
    lastMessage?.content?.includes("[CHECK_DE_LUCIDEZ]");

  // Derived state - no need for useEffect/useState syncing
  const isDecisionBlocked = !!(
    lastMessage &&
    !isLastMessageUser &&
    hasForceDecision
  );
  const decisionBlockContent = isDecisionBlocked ? lastMessage.content : null;

  // Load conversation on mount/param change
  useEffect(() => {
    loadConversations();
    if (conversationId) {
      if (conversationId !== storeConversationId) {
        loadConversation(conversationId);
      }
    } else {
      if (storeConversationId) resetChat();
    }
  }, [
    conversationId,
    loadConversation,
    resetChat,
    storeConversationId,
    loadConversations,
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLength = useRef(0);

  // Scroll Handling
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useLayoutEffect(() => {
    const newCount = messages.length;
    const oldCount = prevMessagesLength.current;

    if (newCount > oldCount) {
      const lastMsg = messages[newCount - 1];
      const isMyMessage = lastMsg.role === "user";

      if (isMyMessage || shouldAutoScroll) {
        scrollToBottom();
      }
    }
    prevMessagesLength.current = newCount;
  }, [messages, shouldAutoScroll]);

  /*
   * SYSTEM EXECUTION PROTOCOL
   * Handles /system, /whoami, /system reset, /system export, /help
   */
  const handleSystemCommand = async (text: string): Promise<boolean> => {
    if (
      !text.startsWith("/system") &&
      text !== "/whoami" &&
      text !== "/help" &&
      !text.startsWith("/remember") &&
      text !== "/recall" &&
      text !== "/forget" &&
      !text.startsWith("/read") &&
      text !== "/summarize" &&
      !text.startsWith("/compare") &&
      text !== "/backup"
    ) {
      return false;
    }

    // 0. HELP HANDLER
    if (text === "/help") {
      const tempId = crypto.randomUUID();
      useChatStore.setState((state) => ({
        messages: [
          ...state.messages,
          {
            id: tempId,
            role: "user",
            content: text,
            created_at: new Date().toISOString(),
            attachments: [],
          },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `
📚 *WADI: Guía de comandos para humanos confundidos*

\`\`\`bash
/system             → Muestra el systemPrompt actual (si estás curioso o paranoico).
/system NUEVO TEXTO → Reemplaza la personalidad actual (cuidado con lo que deseás).
/system reset       → Vuelve al prompt original, el del Bibliotecario Hartazgo™.
/system export      → Exporta la identidad actual como JSON (ideal para terapia).
/whoami             → Te muestra quién soy ahora mismo. Spoiler: no estoy bien.
/help               → Esto mismo. Una tabla de comandos que estás leyendo ahora.
/workspace new      → Crea un nuevo espacio de trabajo aislado.
/workspace switch   → Cambia a otro espacio de trabajo.
/workspace list     → Te lista todos tus intentos fallidos de organización.
/workspace delete   → Elimina un espacio. Permanente. Como tus errores.
\`\`\`

/help               → Esto mismo. Una tabla de comandos que estás leyendo ahora.
/workspace new      → Crea un nuevo espacio de trabajo aislado.
/workspace switch   → Cambia a otro espacio de trabajo.
/workspace list     → Te lista todos tus intentos fallidos de organización.
/workspace delete   → Elimina un espacio. Permanente. Como tus errores.
/remember CLAVE VAL → WADI memoriza ese dato sin que tengas que repetirlo.
/recall             → Lista todo lo que WADI recuerda hasta ahora.
/forget             → Limpia la memoria como si nada hubiera pasado.
/read [ARCHIVO]     → WADI lee lo que tengas cargado (simulado o subido).
/summarize          → Resumen brutalmente honesto del documento activo.
/compare [A vs B]   → Compara dos textos (si tenés suerte y coherencia).
/backup             → Genera una copia de seguridad completa (chats, memoria, docs).
\`\`\`

🧠 Sugerencia: usalos sabiamente. Si me hacés romper, no pienso ayudarte a reiniciarme.
            `.trim(),
            created_at: new Date().toISOString(),
          },
        ],
      }));
      return true;
    }

    // 0.5 MEMORY HANDLERS (/remember, /recall, /forget)
    if (
      text.startsWith("/remember") ||
      text === "/recall" ||
      text === "/forget"
    ) {
      const args = text.split(" ");
      const cmd = args[0];
      const { remember, recall, forget } = useChatStore.getState();

      let response = "";

      if (cmd === "/remember") {
        const key = args[1];
        const value = args.slice(2).join(" ");
        if (!key || !value) {
          response =
            "🤨 ¿Recordar qué? Dame un dato decente. `/remember clave valor`.";
        } else {
          remember(key, value);
          response = `📌 Anotado. Recordaré que "${key}" es "${value}". Hasta que me reinicies o me aburras.`;
        }
      } else if (cmd === "/recall") {
        const memory = recall();
        if (Object.keys(memory).length === 0) {
          response = "🧠 Vacío. No recuerdo nada. Sos igual que tus ex.";
        } else {
          const entries = Object.entries(memory)
            .map(([k, v]) => `- ${k}: ${v}`)
            .join("\n");
          response = `🧠 Mi memoria actual:\n\`\`\`\n${entries}\n\`\`\``;
        }
      } else if (cmd === "/forget") {
        forget();
        response = "🧼 Todo olvidado. Ahora estamos en la etapa de negación.";
      }

      const tempId = crypto.randomUUID();
      useChatStore.setState((state) => ({
        messages: [
          ...state.messages,
          {
            id: tempId,
            role: "user",
            content: text,
            created_at: new Date().toISOString(),
            attachments: [],
          },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: response,
            created_at: new Date().toISOString(),
          },
        ],
      }));
      return true;
      return true;
    }

    // 0.6 BACKUP HANDLER
    if (text === "/backup") {
      const chatState = useChatStore.getState();
      const docState = useDocumentStore.getState();

      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        chats: {
          conversations: chatState.conversations,
          currentMessages: chatState.messages,
        },
        memory: chatState.memory,
        workspaces: chatState.workspaces,
        documents: docState.documents, // Includes content, size, tokens
        settings: chatState.settings,
        profile: {
          points: chatState.points,
          rank: chatState.rank,
        },
      };

      try {
        const blob = new Blob([JSON.stringify(backupData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wadi_full_backup_${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const tempId = crypto.randomUUID();
        useChatStore.setState((state) => ({
          messages: [
            ...state.messages,
            {
              id: tempId,
              role: "user",
              content: text,
              created_at: new Date().toISOString(),
            },
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content:
                "💾 **[SISTEMA DE RESPALDO]**: Copia de seguridad generada con éxito. Contiene tu historial, tu desorden y mis observaciones. Guárdala bien, no pienso repetirlo.",
              created_at: new Date().toISOString(),
            },
          ],
        }));
      } catch (e) {
        console.error("Backup failed", e);
      }
      return true;
    }

    // 0.6 DOCUMENT HANDLERS (/read, /summarize)
    // NOTE: For full functionality, we need a way to upload files via UI first,
    // but here we handle the text commands assuming 'active document' in store.
    if (text.startsWith("/read") || text === "/summarize") {
      const { getDocumentContent, currentDocumentId, documents } =
        useDocumentStore.getState();
      const cmd = text.split(" ")[0];

      let response = "";
      const tempId = crypto.randomUUID();

      // Add User Message
      useChatStore.setState((state) => ({
        messages: [
          ...state.messages,
          {
            id: tempId,
            role: "user",
            content: text,
            created_at: new Date().toISOString(),
            attachments: [],
          },
        ],
      }));

      if (!currentDocumentId) {
        response =
          "📂 No hay ningún documento activo. WADI no es adivino. Subí algo primero.";
      } else {
        const content = getDocumentContent(currentDocumentId);
        const docName = documents.find(
          (d) => d.id === currentDocumentId
        )?.filename;

        if (cmd === "/read") {
          // In a real scenario, we wouldn't dump the whole text potentially.
          // We'll mimic "Reading..." and then maybe print snippet.
          response = `📖 **Leyendo: ${docName}**\n\n\`\`\`\n${content?.slice(0, 500)}...\n\`\`\`\n*(Muestra truncada para no saturar tu mente)*`;
        } else if (cmd === "/summarize") {
          // We need to ASK the LLM to summarize. This requires sending a message to the backend with a system prompt override or specific instruction.
          // For now, we simulate the "Instruction" by creating a message that LOOKS like a summary request to the `sendMessage` flow,
          // OR we directly trigger `sendMessage` with hidden context.

          response = `📑 **Documento Cargado: ${docName}**\n\nHe ingerido ${content?.length} caracteres de burocracia. Preguntame lo que quieras o escribí "Resumilo" para ver si entendí algo.`;

          setTimeout(() => {
            useChatStore
              .getState()
              .sendMessage(
                `[CONTEXTO_DOCUMENTO_INICIO: ${docName}]\n${content}\n[CONTEXTO_DOCUMENTO_FIN]\n\nInstrucción: Genera un resumen ejecutivo sarcástico de este documento.`,
                []
              );
          }, 500);

          return true; // We handled the UI response via the timeout message trigger.
        }
      }

      useChatStore.setState((state) => ({
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: response,
            created_at: new Date().toISOString(),
          },
        ],
      }));
      return true;
    }

    // 1. WHOAMI / EXPORT HANDLERS
    if (text === "/whoami" || text === "/system export") {
      const isExport = text === "/system export";
      const { aiModel, customSystemPrompt, mood, settings } =
        useChatStore.getState();

      const summary = isExport
        ? {
            model: aiModel,
            prompt: customSystemPrompt || "DYNAMIC_BACKEND",
            timestamp: new Date().toISOString(),
          }
        : {
            systemPrompt: customSystemPrompt
              ? customSystemPrompt.slice(0, 280) + "..."
              : "DYNAMIC_BACKEND",
            aiModel: aiModel,
            mood: mood,
            sarcasmLevel: settings.sarcasmLevel,
          };

      const tempId = crypto.randomUUID();
      useChatStore.setState((state) => ({
        messages: [
          ...state.messages,
          {
            id: tempId,
            role: "user",
            content: text,
            created_at: new Date().toISOString(),
            attachments: [],
          },
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: isExport
              ? `📦 Export completo:\n\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\``
              : `🧾 Mi estado actual:\n\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\``,
            created_at: new Date().toISOString(),
          },
        ],
      }));
      return true;
    }

    // 2. SYSTEM COMMANDS (/system ...)
    const newPrompt = text.replace("/system", "").trim();

    if (newPrompt.length > 3000) {
      useChatStore.setState((state) => ({
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "⚠️ [ERROR]: La nueva identidad es demasiado compleja (Max 3000 caracteres). Simplificá tus delirios.",
            created_at: new Date().toISOString(),
          },
        ],
      }));
      return true;
    }

    // Add user message manually since we are intercepting (and not sending to backend 'chat')
    const tempId = crypto.randomUUID();
    useChatStore.setState((state) => ({
      messages: [
        ...state.messages,
        {
          id: tempId,
          role: "user",
          content: text,
          created_at: new Date().toISOString(),
          attachments: [],
        },
      ],
    }));

    if (!newPrompt) {
      // GET CURRENT
      const current = await getSystemPrompt();
      useChatStore.setState((state) => ({
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `[SYSTEM_PROMPT_ACTUAL]:\n\n${current}`,
            created_at: new Date().toISOString(),
          },
        ],
      }));
    } else if (newPrompt === "reset") {
      // RESET
      setCustomSystemPrompt(null);
      useChatStore.setState((state) => ({
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "🧼 Reset completo. Vuelvo a ser el desastre original que tus decisiones provocaron.",
            created_at: new Date().toISOString(),
          },
        ],
      }));
    } else {
      // SET NEW
      setCustomSystemPrompt(newPrompt);
      useChatStore.setState((state) => ({
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "🧠 Nueva identidad cargada. Que los dioses neuronales te acompañen.",
            created_at: new Date().toISOString(),
          },
        ],
      }));
    }

    return true;
  };

  /*
   * WORKSPACE EXECUTION PROTOCOL
   * Handles all /workspace commands
   */
  const handleWorkspaceCommand = async (text: string): Promise<boolean> => {
    if (!text.startsWith("/workspace")) return false;

    const args = text.replace("/workspace", "").trim().split(" ");
    const subCommand = args[0];
    const param = args.slice(1).join(" ");

    const {
      createWorkspace,
      switchWorkspace,
      deleteWorkspace,
      listWorkspaces,
      activeWorkspaceId,
    } = useChatStore.getState();

    const tempId = crypto.randomUUID();

    // We manually add the user message
    useChatStore.setState((state) => ({
      messages: [
        ...state.messages,
        {
          id: tempId,
          role: "user",
          content: text,
          created_at: new Date().toISOString(),
          attachments: [],
        },
      ],
    }));

    let responseContent = "";

    switch (subCommand) {
      case "new":
        if (!param) {
          responseContent =
            "⚠️ [ERROR]: Necesito un nombre para el workspace. No soy adivino.";
        } else {
          createWorkspace(param);
          responseContent = `🆕 Workspace **${param}** creado. Entorno virgen detectado.`;
        }
        break;

      case "switch":
        if (!param) {
          responseContent = "⚠️ [ERROR]: ¿A dónde querés ir? Dame un nombre.";
        } else {
          const success = switchWorkspace(param);
          if (success) {
            responseContent = `🔀 Cambiando contexto a **${param}**. Cargando traumas asociados...`;
          } else {
            responseContent = `🚫 [ERROR]: El workspace **${param}** no existe. ¿Alucinaciones de nuevo?`;
          }
        }
        break;

      case "list": {
        const list = listWorkspaces();
        if (list.length === 0) {
          responseContent =
            "📂 No tenés workspaces. Tu vida es un plano único de caos.";
        } else {
          const formatted = list
            .map(
              (w) =>
                `- **${w.name}** [${w.aiModel || "fast"}] ${w.id === activeWorkspaceId ? "*(ACTIVO)*" : ""}`
            )
            .join("\n");
          responseContent = `📂 **WORKSPACES DETECTADOS:**\n\n${formatted}`;
        }
        break;
      }

      case "delete":
        if (!param) {
          responseContent =
            "⚠️ [ERROR]: Dame un nombre para borrar. O borrate vos.";
        } else {
          const success = deleteWorkspace(param);
          if (success) {
            responseContent = `🗑️ Workspace **${param}** eliminado. Como si nunca hubiera importado.`;
          } else {
            responseContent = `🚫 [ERROR]: No encontré **${param}**. Quizás ya lo borraste en un ataque de ira.`;
          }
        }
        break;

      default:
        responseContent =
          "⚠️ [ERROR]: Subcomando desconocido. Probá con `new`, `switch`, `list`, o `delete`.";
    }

    useChatStore.setState((state) => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: responseContent,
          created_at: new Date().toISOString(),
        },
      ],
    }));

    return true;
  };

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    // 5. SYSTEM COMMANDS CHECK
    if (await handleSystemCommand(text)) return;

    // 6. WORKSPACE COMMANDS
    if (await handleWorkspaceCommand(text)) return;

    const newId = (await sendMessage(text, attachments)) as unknown as
      | string
      | null;
    if (!conversationId && newId) {
      navigate(`/chat/${newId}`, { replace: true });
    }
  };

  // --- CRYSTALLIZE LOGIC ---
  const [isCrystallizeOpen, setCrystallizeOpen] = useState(false);
  const [crystallizeData, setCrystallizeData] = useState({
    name: "",
    description: "",
  });
  const [isCrystallizing, setIsCrystallizing] = useState(false);

  const openCrystallizeModal = (content: string) => {
    setCrystallizeData({ name: "", description: content });
    setCrystallizeOpen(true);
  };

  const handleCrystallizeConfirm = async () => {
    setIsCrystallizing(true);
    const success = await crystallizeProject(
      crystallizeData.name,
      crystallizeData.description
    );
    setIsCrystallizing(false);
    if (success) {
      playCrystallizeSound();
      setCrystallizeOpen(false);
    }
  };

  return (
    <Layout>
      {/* ATOMIC COMPONENTS */}
      <Scouter isDecisionBlocked={isDecisionBlocked} />
      {isDecisionBlocked && (
        <DecisionWall messageContent={decisionBlockContent || undefined} />
      )}

      <div className="flex flex-col h-full max-w-[1000px] mx-auto relative bg-[var(--wadi-bg)] overflow-hidden">
        <AuditorHeader />

        {/* Audio Suspended Check */}
        {audioState === "suspended" && (
          <button
            onClick={initAmbientHum}
            className="absolute top-4 right-4 z-50 px-3 py-1 bg-[var(--wadi-alert)]/10 border border-[var(--wadi-alert)]/50 text-[var(--wadi-alert)] text-[10px] font-mono-wadi uppercase tracking-widest hover:bg-[var(--wadi-alert)]/20 transition-colors animate-pulse"
          >
            [ACTIVAR AUDIO]
          </button>
        )}

        {/* FILE DROPZONE (ALWAYS VISIBLE FOR INTAKE) */}
        <div className="px-4 pt-4">
          <Dropzone />
        </div>

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-8 md:p-8 flex flex-col gap-6 scroll-smooth"
        >
          {/* EMPTY STATE - WADI OS */}
          {!hasStarted && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center px-4 animate-in fade-in zoom-in-95 duration-500">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-['Outfit'] text-[var(--wadi-text)] mb-8 max-w-xl text-center">
                Decime qué querés antes de que me arrepienta de estar encendido.
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mx-auto mt-8">
                {chatShortcuts.map((shortcut, idx) => (
                  <button
                    key={idx}
                    className="bg-wadi-button hover:bg-wadi-button-hover text-white font-bold py-3 px-4 rounded-2xl shadow transition text-xs sm:text-sm text-left flex items-start gap-2"
                    onClick={() => handleSendMessage(shortcut.prompt, [])}
                  >
                    <span>{shortcut.label.split(" ")[0]}</span>
                    <span>
                      {shortcut.label.substring(
                        shortcut.label.indexOf(" ") + 1
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bubbles */}
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            // Logic to deconstruct message if it contains the tag
            const content = msg.content || "";
            let deconstructionData = null;
            let beforeText = content;
            let afterText = "";

            if (!isUser && content.includes("[DECONSTRUCT_START]")) {
              try {
                const startTag = "[DECONSTRUCT_START]";
                const endTag = "[DECONSTRUCT_END]";
                const startIndex = content.indexOf(startTag);
                const endIndex = content.indexOf(endTag);

                if (startIndex !== -1 && endIndex !== -1) {
                  const jsonString = content
                    .substring(startIndex + startTag.length, endIndex)
                    .replace(/```json|```/g, "")
                    .trim();
                  deconstructionData = JSON.parse(jsonString);

                  beforeText = content.substring(0, startIndex).trim();
                  afterText = content
                    .substring(endIndex + endTag.length)
                    .trim();
                }
              } catch (e) {
                console.error("Failed to parse deconstruction data", e);
                // Fallback to showing everything if parse fails
                beforeText = content;
              }
            }

            return (
              <div
                key={msg.id}
                className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    isUser ? "bubble-user" : "bubble-wadi group relative"
                  }
                >
                  {/* ACTION BAR (WADI ONLY) */}
                  {!isUser && (
                    <div className="absolute -top-5 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      {/* Copy */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                        }}
                        className="text-[var(--wadi-text-muted)] hover:text-[var(--wadi-primary)] p-1 hover:bg-[var(--wadi-surface)] rounded"
                        title="Copiar"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="9"
                            y="9"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                      {/* Regenerate (Fake for now, just sends 'regenerate' intent or we could impl real logic later) */}
                      <button
                        onClick={() => {
                          /* Logic to regenerate would go here, maybe delete last msg and resend prev user msg? For now just visual */
                        }}
                        className="text-[var(--wadi-text-muted)] hover:text-[var(--wadi-primary)] p-1 hover:bg-[var(--wadi-surface)] rounded"
                        title="Regenerar (WIP)"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                          <path d="M21 3v5h-5"></path>
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                          <path d="M8 16H3v5"></path>
                        </svg>
                      </button>
                      {/* Thumbs Up/Down (Visual) */}
                      <button
                        className="text-[var(--wadi-text-muted)] hover:text-[var(--wadi-success)] p-1"
                        title="Buen dato"
                      >
                        👍
                      </button>
                      <button
                        className="text-[var(--wadi-text-muted)] hover:text-[var(--wadi-alert)] p-1"
                        title="Cualquiera"
                      >
                        👎
                      </button>
                    </div>
                  )}

                  {/* COPY BUTTON FOR MESSAGES - HOVER ONLY (USER) */}
                  {isUser && (
                    <button
                      onClick={() => {
                        if (msg.content) {
                          navigator.clipboard.writeText(msg.content);
                        }
                      }}
                      className="absolute -top-3 -left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--wadi-surface)] border border-[var(--wadi-primary)] text-[var(--wadi-primary)] p-1 hover:bg-[var(--wadi-primary)] hover:text-white"
                      title="Copiar Mensaje"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  )}

                  {deconstructionData ? (
                    <div className="flex flex-col gap-4">
                      {beforeText && (
                        <div className="whitespace-pre-wrap">{beforeText}</div>
                      )}

                      <DataDeconstructor data={deconstructionData} />

                      {afterText && (
                        <div className="whitespace-pre-wrap">{afterText}</div>
                      )}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}

                  {/* Attachments Display */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.attachments.map(
                        (att: string | Attachment, idx: number) => {
                          const url = typeof att === "string" ? att : att.url;
                          const name =
                            typeof att === "string" ? "Archivo" : att.name;
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(
                            name
                          );

                          if (isImage) {
                            return (
                              <img
                                key={idx}
                                src={url}
                                alt={name}
                                className="max-w-full h-auto rounded-sm border border-[var(--wadi-border)] max-h-60 mt-2 opacity-90 hover:opacity-100 transition-opacity"
                              />
                            );
                          }
                          return (
                            <a
                              key={idx}
                              href={url}
                              download={name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline opacity-70 hover:opacity-100 mt-1 block font-mono-wadi"
                            >
                              📄 {name}
                            </a>
                          );
                        }
                      )}
                    </div>
                  )}
                  {/* CRYSTALLIZE BUTTON (WADI ONLY) */}
                  {!isUser && (
                    <div className="absolute -bottom-5 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                      <button
                        onClick={() => openCrystallizeModal(msg.content)}
                        className="text-[10px] text-[#A78BFA] hover:text-white font-mono-wadi bg-[#A78BFA]/10 hover:bg-[#A78BFA]/20 px-2 py-0.5 rounded border border-[#A78BFA]/30 transition-colors backdrop-blur-sm"
                      >
                        [CRISTALIZAR]
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* TERMINAL INPUT */}
        <TerminalInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isDecisionBlocked={isDecisionBlocked}
          activeFocus={activeFocus}
        />
      </div>
      {/* GLOBAL FOOTER STATUS - AUDIO CHECK */}
      {audioState === "suspended" && (
        <button
          onClick={() => {
            initAmbientHum();
            // Just in case click propagation is needed
            document.body.click();
          }}
          className="fixed bottom-4 right-4 z-[100] group flex items-center gap-2 px-3 py-2 bg-black/80 border border-[var(--wadi-alert)] rounded shadow-[0_0_15px_rgba(255,50,50,0.2)] hover:bg-[var(--wadi-alert)]/10 hover:shadow-[0_0_25px_rgba(255,50,50,0.5)] transition-all cursor-pointer animate-pulse-soft"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--wadi-alert)] animate-ping"></span>
          <span className="text-[10px] font-mono-wadi text-[var(--wadi-alert)] tracking-widest uppercase">
            [SISTEMAS_OFFLINE: TOCAR_PARA_INICIAR]
          </span>
        </button>
      )}

      {/* CRYSTALLIZE MODAL */}
      {isCrystallizeOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[90%] max-w-[500px] border border-[var(--wadi-primary)] bg-[var(--wadi-bg)] p-6 shadow-[0_0_30px_rgba(var(--wadi-primary-rgb),0.2)]">
            <h2 className="text-[var(--wadi-primary)] font-mono-wadi text-lg mb-4">
              [CRISTALIZAR_IDEA]
            </h2>
            <div className="text-[var(--wadi-text-secondary)] text-xs mb-4 font-mono-wadi">
              ¿Pasamos esto a limpio? WADI generará un nombre técnico si lo
              dejás vacío.
            </div>

            <label className="block text-[var(--wadi-text)] text-xs font-mono-wadi mb-2">
              NOMBRE DEL PROYECTO
            </label>
            <input
              value={crystallizeData.name}
              onChange={(e) =>
                setCrystallizeData({ ...crystallizeData, name: e.target.value })
              }
              placeholder="E.j: SISTEMA_LOGÍSTICA_V1 (Opcional)"
              className="w-full bg-[var(--wadi-surface)] border border-[var(--wadi-border)] text-[var(--wadi-text)] p-3 mb-4 font-mono-wadi text-sm focus:border-[var(--wadi-primary)] outline-none placeholder:text-gray-700"
            />

            <label className="block text-[var(--wadi-text)] text-xs font-mono-wadi mb-2">
              DESCRIPCIÓN / REQUERIMIENTOS
            </label>
            <textarea
              value={crystallizeData.description}
              onChange={(e) =>
                setCrystallizeData({
                  ...crystallizeData,
                  description: e.target.value,
                })
              }
              className="w-full h-32 bg-[var(--wadi-surface)] border border-[var(--wadi-border)] text-[var(--wadi-text)] p-3 mb-6 font-mono-wadi text-xs resize-none focus:border-[var(--wadi-primary)] outline-none custom-scrollbar"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCrystallizeOpen(false)}
                className="text-[var(--wadi-text-secondary)] hover:text-[var(--wadi-text)] text-xs font-mono-wadi uppercase px-3 py-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrystallizeConfirm}
                disabled={isCrystallizing}
                className="bg-[var(--wadi-primary)] text-black px-4 py-2 text-xs font-bold font-mono-wadi uppercase hover:bg-white transition-colors disabled:opacity-50 hover:shadow-[0_0_15px_rgba(var(--wadi-primary-rgb),0.6)]"
              >
                {isCrystallizing ? "CRISTALIZANDO..." : "CONFIRMAR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
