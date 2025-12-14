import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useChatStore } from "../store/chatStore";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { ChatInput } from "../components/ChatInput";

const PLACEHOLDERS = ["¿Una idea?", "¿Un problema?", "¿Un objetivo?"];

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const {
    messages,
    isLoading,
    sendMessage,
    deleteConversation,
    loadConversations,
    resetChat,
    startNewConversation,
    loadConversation,
    conversationId: storeConversationId,
    mode,
    // topic,
    explainLevel,
    setPreset,
    setExplainLevel,
  } = useChatStore();

  // Load conversation on mount/param change
  useEffect(() => {
    loadConversations(); // Always refresh list
    if (conversationId) {
      if (conversationId !== storeConversationId) {
        loadConversation(conversationId);
      }
    } else {
      // If at /chat (no ID), reset
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

  // Placeholder logic
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentPlaceholder = PLACEHOLDERS[placeholderIndex];

  // Scroll Handling
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    // If user is near bottom (within 100px), enable auto-scroll
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useLayoutEffect(() => {
    // Only scroll if message count increased AND (it's my message OR I was near bottom)
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

  // Special case: When loading starts (user sent message), ensure scroll
  useEffect(() => {
    if (isLoading) {
      setShouldAutoScroll(true);
      scrollToBottom();
    }
  }, [isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!conversationId) {
      await sendMessage(text);
      const s = useChatStore.getState();
      if (s.conversationId) {
        navigate(`/chat/${s.conversationId}`, { replace: true });
      }
    } else {
      await sendMessage(text);
    }
  };

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          position: "relative",
          backgroundColor: "var(--color-bg)",
        }}
      >
        {/* Header Calm Y2K Style */}
        <header
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--color-border)",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(16px)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "var(--text-xl)",
                  fontWeight: 700,
                  background: "var(--grad-main)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: 0,
                }}
              >
                {mode === "tutor" ? "Modo Profe" : "WADI"}
              </h2>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-soft)",
                  margin: 0,
                }}
              >
                {mode === "tutor" ? "Paso a paso." : "Del caos al plan."}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {storeConversationId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "¿Seguro que querés borrar esta conversación? No se puede deshacer."
                      )
                    ) {
                      await deleteConversation(storeConversationId);
                      alert("Conversación eliminada.");
                      navigate("/chat");
                    }
                  }}
                  title="Eliminar conversación"
                  style={{ color: "var(--color-text-soft)" }}
                >
                  Running 🗑️
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  startNewConversation();
                  navigate("/chat");
                }}
                title="Nueva conversación"
                style={{ color: "var(--color-primary)" }}
              >
                ✨ Nuevo
              </Button>
            </div>
          </div>

          {/* Controls: Tabs & Dropdown */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Mode Selector Tabs (Scrollable & Tappable) */}
            <div
              className="scroll-x-mobile"
              style={{
                display: "flex",
                gap: "0.5rem",
                padding: "0.25rem 0", // Space for scrollbar if needed
                maxWidth: "100%",
              }}
            >
              {(
                [
                  { id: "reflexivo", label: "General", modeMatch: "normal" },
                  { id: "tech", label: "Tech / Dev", modeMatch: "tech" },
                  { id: "biz", label: "Negocios", modeMatch: "biz" },
                  { id: "learning", label: "Tutor", modeMatch: "tutor" },
                ] as const
              ).map((m) => {
                const isActive = mode === m.modeMatch;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPreset(m.id)}
                    className="tappable"
                    style={{
                      fontSize: "var(--text-sm)",
                      padding: "0 16px",
                      height: "44px", // Tappable minimum
                      minWidth: "44px",
                      borderRadius: "var(--radius-full)",
                      border: isActive
                        ? "1px solid var(--color-primary)"
                        : "1px solid var(--color-border)",
                      background: isActive
                        ? "var(--color-primary)"
                        : "var(--color-surface)",
                      color: isActive ? "#FFF" : "var(--color-text-soft)",
                      fontWeight: isActive ? 600 : 500,
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                      boxShadow: isActive
                        ? "0 2px 8px rgba(124, 58, 237, 0.25)"
                        : "none",
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Explain Level Dropdown */}
            <div style={{ position: "relative" }}>
              <select
                value={explainLevel}
                onChange={(e) =>
                  setExplainLevel(
                    e.target.value as "short" | "normal" | "detailed"
                  )
                }
                style={{
                  fontSize: "var(--text-xs)",
                  padding: "6px 12px 6px 30px", // space for icon
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-main)",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                  minWidth: "140px",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <option value="short">Corto (Resumen)</option>
                <option value="normal">Explicado (Normal)</option>
                <option value="detailed">Detallado (Paso a paso)</option>
              </select>
              <span
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.8rem",
                  pointerEvents: "none",
                }}
              >
                🎚️
              </span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Empty State */}
          {messages.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100%",
                gap: "2rem",
                marginTop: "-2rem",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <h3
                  style={{
                    fontSize: "var(--text-3xl)",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                    background: "var(--grad-main)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ¿Con qué querés que te ayude hoy?
                </h3>

                <p
                  style={{
                    fontSize: "var(--text-base)",
                    color: "var(--color-text-soft)",
                    margin: 0,
                  }}
                >
                  Elegí una categoría o escribí directamente abajo.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "1rem",
                  width: "100%",
                  maxWidth: "900px",
                }}
              >
                {[
                  {
                    title: "Quiero entender algo mejor",
                    desc: "Explicaciones simples, resúmenes y planes para aprender.",
                    prompt: "Quiero entender algo mejor: ",
                    preset: "learning",
                  },
                  {
                    title: "Tengo un problema con código",
                    desc: "Ayuda con código, errores, arquitectura o debugging.",
                    prompt: "Tengo un problema con código: ",
                    preset: "tech",
                  },
                  {
                    title: "Estoy pensando en un negocio",
                    desc: "Validación de ideas, pricing, ventas y estrategia.",
                    prompt: "Estoy pensando en un negocio: ",
                    preset: "biz",
                  },
                  {
                    title: "Quiero crear algo nuevo",
                    desc: "Creatividad, contenido, guiones y branding.",
                    prompt: "Quiero crear algo nuevo: ",
                    preset: "reflexivo",
                  },
                  {
                    title: "Necesito ordenar mis ideas",
                    desc: "Productividad, tareas y organización personal.",
                    prompt: "Necesito ordenar mis ideas: ",
                    preset: "productivity",
                  },
                  {
                    title: "Algo no me funciona",
                    desc: "Soporte técnico y troubleshooting de dispositivos.",
                    prompt: "Algo no me funciona: ",
                    preset: "reflexivo",
                  },
                ].map((item) => (
                  <Card
                    key={item.title}
                    hoverable
                    onClick={() => {
                      setPreset(
                        item.preset as
                          | "tech"
                          | "biz"
                          | "learning"
                          | "productivity"
                          | "reflexivo"
                      );

                      localStorage.setItem("wadi_chat_draft", item.prompt);

                      const textarea = document.getElementById(
                        "chat-input-main"
                      ) as HTMLTextAreaElement;

                      if (textarea) {
                        // Trigger React change event programmatically
                        const nativeInputValueSetter =
                          Object.getOwnPropertyDescriptor(
                            window.HTMLTextAreaElement.prototype,
                            "value"
                          )?.set;
                        if (nativeInputValueSetter) {
                          nativeInputValueSetter.call(textarea, item.prompt);
                          textarea.dispatchEvent(
                            new Event("input", { bubbles: true })
                          );
                        }
                        textarea.focus();
                        textarea.style.height = "auto";
                      }
                    }}
                    style={{
                      padding: "1.25rem",
                      cursor: "pointer",
                      border: "1px solid var(--color-border)",
                      background: "rgba(255,255,255,0.8)",
                      backdropFilter: "blur(4px)",
                      borderRadius: "16px",
                      boxShadow: "var(--shadow-sm)",
                      transition: "all 0.2s",
                      color: "var(--color-text-main)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      // Ensure it behaves like a button
                      touchAction: "manipulation",
                    }}
                    role="button"
                    tabIndex={0}
                    className="card tappable"
                  >
                    <strong style={{ fontSize: "1rem" }}>{item.title}</strong>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--color-text-soft)",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.desc}
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Bubbles */}
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  className="chat-bubble"
                  style={{
                    maxWidth: "80%",
                    padding: "1rem 1.25rem",
                    borderRadius: "1.25rem",
                    borderTopRightRadius: isUser ? "0.25rem" : "1.25rem",
                    borderTopLeftRadius: isUser ? "1.25rem" : "0.25rem",
                    background: isUser
                      ? "var(--color-primary)"
                      : "var(--color-surface)",
                    color: isUser ? "#FFF" : "var(--color-text-main)",
                    boxShadow: isUser
                      ? "0 4px 12px rgba(139, 92, 246, 0.25)"
                      : "var(--shadow-sm)",
                    lineHeight: "1.6",
                    fontSize: "var(--text-base)",
                    border: isUser ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "var(--color-surface-soft)",
                  borderRadius: "2rem",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-soft)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "var(--color-primary)",
                    borderRadius: "50%",
                    animation: "pulse 1s infinite",
                  }}
                ></div>
                Ordenando tus ideas...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "1rem",
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--color-border)",
            marginBottom: "env(keyboard-inset-height, 0px)", // Handle software keyboard
          }}
        >
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder={currentPlaceholder}
          />
          <div
            style={{
              textAlign: "center",
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "var(--color-text-soft)",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <span>WADI puede fallar. Usalo como copiloto.</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
