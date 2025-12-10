import { useRef, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { useChatStore } from "../store/chatStore";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";

export default function ChatPage() {
  const {
    messages,
    isLoading,
    sendMessage,
    resetChat,
    tutorMode,
    stopTutorMode,
    preferences,
    setPreferences,
  } = useChatStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const text = input;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleSuggestionClick = async (text: string) => {
    await sendMessage(text);
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
          backgroundColor: "var(--bg-app)", // Using new Y2K base
        }}
      >
        {/* Header Y2K Style */}
        <header
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--border-subtle)",
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(10px)",
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
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  background: "var(--grad-main)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {tutorMode.active ? "🎓 Modo Tutor" : "WADI Chat"}
              </h2>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                {tutorMode.active
                  ? `${tutorMode.topic} (${tutorMode.level})`
                  : "Tu copiloto de ideas a planes."}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetChat}
              title="Borrar chat"
              style={{ color: "var(--text-tertiary)" }}
            >
              🗑️ Limpiar
            </Button>
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
            {/* Mode/Topic Selector Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0.25rem",
                backgroundColor: "var(--bg-element)",
                padding: "0.25rem",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {(
                [
                  { id: "general", label: "General" },
                  { id: "tech", label: "Tech / Dev" },
                  { id: "biz", label: "Negocios" },
                  { id: "tutor", label: "Tutor Mode" },
                ] as const
              ).map((m) => {
                const isActive = preferences.activeTab === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPreferences({ activeTab: m.id })}
                    style={{
                      fontSize: "0.85rem",
                      padding: "6px 16px",
                      borderRadius: "var(--radius-full)",
                      border: "none",
                      cursor: "pointer",
                      background: isActive
                        ? "var(--text-primary)"
                        : "transparent",
                      color: isActive
                        ? "var(--bg-panel)"
                        : "var(--text-secondary)",
                      fontWeight: isActive ? 600 : 500,
                      transition: "all 0.2s ease",
                      boxShadow: isActive
                        ? "0 2px 5px rgba(0,0,0,0.1)"
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
                value={preferences.explainLevel}
                onChange={(e) =>
                  setPreferences({
                    explainLevel: e.target.value as
                      | "short"
                      | "normal"
                      | "detailed",
                  })
                }
                style={{
                  fontSize: "0.85rem",
                  padding: "6px 12px 6px 30px", // space for icon
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-panel)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none", // Reset for custom arrow if needed, mostly for style
                  minWidth: "140px",
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

        {/* Tutor Progress Banner */}
        {tutorMode.active && (
          <div
            style={{
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(90deg, #f0f0f0 0%, #ffffff 100%)",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  marginBottom: "0.25rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                <span>
                  Paso {tutorMode.currentStep} de {tutorMode.totalSteps || "?"}
                </span>
                <span>
                  {tutorMode.totalSteps > 0
                    ? Math.round(
                        (tutorMode.currentStep / tutorMode.totalSteps) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  borderRadius: "4px",
                  backgroundColor: "#e0e0e0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${tutorMode.totalSteps > 0 ? (tutorMode.currentStep / tutorMode.totalSteps) * 100 : 5}%`,
                    background: "var(--grad-secondary)",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={stopTutorMode}>
              Salir
            </Button>
          </div>
        )}

        {/* Messages */}
        <div
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
                height: "100%",
                gap: "3rem",
                marginTop: "-2rem",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <h3
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                    background: "var(--grad-main)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {tutorMode.active
                    ? "Modo Tutor Activado"
                    : "¿Qué construimos hoy?"}
                </h3>
              </div>

              {!tutorMode.active && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    width: "100%",
                    maxWidth: "700px",
                  }}
                >
                  {[
                    "Explícame un concepto técnico como si tuviera 12 años.",
                    "Ayúdame a bajar una idea de negocio a un plan.",
                    "Ayúdame a debuggear un error de código.",
                    "Armemos un plan de estudio sobre Python.",
                  ].map((s) => (
                    <Card
                      key={s}
                      hoverable
                      onClick={() => handleSuggestionClick(s)}
                      style={{
                        padding: "1.5rem",
                        fontSize: "1rem",
                        cursor: "pointer",
                        border: "1px solid var(--border-subtle)",
                        background: "rgba(255,255,255,0.6)",
                        backdropFilter: "blur(5px)",
                        borderRadius: "16px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                    >
                      <span style={{ marginRight: "0.5rem" }}>👉</span> {s}
                    </Card>
                  ))}
                </div>
              )}
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
                  style={{
                    maxWidth: "75%",
                    padding: "1.25rem 1.5rem",
                    borderRadius: "1.25rem",
                    borderTopRightRadius: isUser ? "0.25rem" : "1.25rem",
                    borderTopLeftRadius: isUser ? "1.25rem" : "0.25rem",
                    background: isUser
                      ? "var(--msg-user-bg)"
                      : "var(--bg-panel)",
                    color: isUser
                      ? "var(--msg-user-text)"
                      : "var(--text-primary)",
                    boxShadow: isUser
                      ? "0 5px 15px rgba(121, 40, 202, 0.2)"
                      : "var(--shadow-sm)",
                    lineHeight: "1.6",
                    fontSize: "1.05rem",
                    border: isUser ? "none" : "1px solid var(--border-subtle)",
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
                  background: "var(--bg-panel)",
                  borderRadius: "2rem",
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
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
                    background: "var(--accent-primary)",
                    borderRadius: "50%",
                    animation: "pulse 1s infinite",
                  }}
                ></div>
                WADI está pensando...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "1.5rem",
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: "1rem",
              maxWidth: "900px",
              margin: "0 auto",
              position: "relative",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  tutorMode.active
                    ? "Escribe tu respuesta o duda..."
                    : "Escribe tu mensaje..."
                }
                disabled={isLoading}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
                }}
                style={{
                  width: "100%",
                  padding: "1rem 1.25rem",
                  borderRadius: "1.5rem",
                  border: "2px solid var(--border-subtle)",
                  backgroundColor: "#fff",
                  color: "var(--text-primary)",
                  resize: "none",
                  minHeight: "56px",
                  maxHeight: "200px",
                  fontSize: "1rem",
                  outline: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--border-focus)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border-subtle)")
                }
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                height: "56px",
                width: "56px",
                borderRadius: "50%",
                background: "var(--grad-secondary)", // Lime/Cyan gradient
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                border: "2px solid #fff",
                fontSize: "1.2rem",
                transition: "transform 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              ➤
            </Button>
          </form>
          <div
            style={{
              textAlign: "center",
              marginTop: "0.75rem",
              fontSize: "0.8rem",
              color: "var(--text-tertiary)",
            }}
          >
            {tutorMode.active
              ? "💡 Tip: Escribí 'listo' o 'siguiente' para avanzar."
              : "WADI AI | Agentic Workspace v3.0"}
          </div>
        </div>
      </div>
    </Layout>
  );
}
