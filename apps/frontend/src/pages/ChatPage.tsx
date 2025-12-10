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

    // Reset textarea height
    const textarea = document.querySelector(
      'textarea[name="chat-input"]'
    ) as HTMLTextAreaElement;
    if (textarea) textarea.style.height = "auto";

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
          backgroundColor: "var(--color-bg)",
        }}
      >
        {/* Header Calm Y2K Style */}
        <header
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--color-border)",
            background: "rgba(255,255,255,0.7)", // Higher opacity for calm feel
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
                {tutorMode.active ? "🎓 Modo Tutor" : "WADI Chat"}
              </h2>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-soft)",
                  margin: 0,
                }}
              >
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
              style={{ color: "var(--color-text-soft)" }}
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
                backgroundColor: "var(--color-surface-soft)",
                padding: "0.25rem",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--color-border)",
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
                      fontSize: "var(--text-xs)",
                      padding: "6px 14px",
                      borderRadius: "var(--radius-full)",
                      border: "none",
                      cursor: "pointer",
                      background: isActive
                        ? "var(--color-primary)"
                        : "transparent",
                      color: isActive
                        ? "#FFF" // active white
                        : "var(--color-text-soft)",
                      fontWeight: isActive ? 600 : 500,
                      transition: "all 0.2s ease",
                      boxShadow: isActive
                        ? "0 2px 5px rgba(139, 92, 246, 0.2)"
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

        {/* Tutor Progress Banner */}
        {tutorMode.active && (
          <div
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--color-surface-soft)",
              borderBottom: "1px solid var(--color-border)",
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
                  fontSize: "var(--text-xs)",
                  marginBottom: "0.25rem",
                  fontWeight: 600,
                  color: "var(--color-text-soft)",
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
                  height: "6px",
                  borderRadius: "3px",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${tutorMode.totalSteps > 0 ? (tutorMode.currentStep / tutorMode.totalSteps) * 100 : 5}%`,
                    background: "var(--grad-main)",
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
                    fontSize: "var(--text-2xl)",
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
                    "Explícame un concepto técnico.",
                    "Ayúdame a planear mi negocio.",
                    "Debuggea este error de código.",
                    "Crea un plan de aprendizaje.",
                  ].map((s) => (
                    <Card
                      key={s}
                      hoverable
                      onClick={() => handleSuggestionClick(s)}
                      style={{
                        padding: "1.25rem",
                        fontSize: "var(--text-sm)",
                        cursor: "pointer",
                        border: "1px solid var(--color-border)",
                        background: "rgba(255,255,255,0.8)",
                        backdropFilter: "blur(4px)",
                        borderRadius: "16px",
                        boxShadow: "var(--shadow-sm)",
                        transition: "all 0.2s",
                        color: "var(--color-text-main)",
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
                    maxWidth: "80%",
                    padding: "1rem 1.25rem",
                    borderRadius: "1.25rem",
                    borderTopRightRadius: isUser ? "0.25rem" : "1.25rem",
                    borderTopLeftRadius: isUser ? "1.25rem" : "0.25rem",
                    background: isUser
                      ? "var(--color-primary)" // Violet
                      : "var(--color-surface)", // White
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
            borderTop: "1px solid var(--color-border)",
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
                name="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  tutorMode.active
                    ? "Escribe tu respuesta o duda..."
                    : "Empezá a escribir..."
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
                  border: "2px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text-main)",
                  resize: "none",
                  minHeight: "56px",
                  maxHeight: "200px",
                  fontSize: "var(--text-base)",
                  outline: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--color-primary)";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(139, 92, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--color-border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                height: "56px",
                width: "56px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
                border: "2px solid #fff",
                fontSize: "1.2rem",
                transition: "transform 0.1s, opacity 0.2s",
                opacity: isLoading || !input.trim() ? 0.5 : 1,
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isLoading && input.trim())
                  e.currentTarget.style.transform = "scale(1.05)";
              }}
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
              fontSize: "var(--text-xs)",
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
