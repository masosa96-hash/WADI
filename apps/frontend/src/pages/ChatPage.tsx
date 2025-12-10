import { useRef, useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { useChatStore } from "../store/chatStore";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";

export default function ChatPage() {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
    tutorMode,
    stopTutorMode,
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

    // Logic to send
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

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: "var(--space-4)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600 }}>
              {tutorMode.active ? "🎓 Modo Tutor" : "Nueva conversación"}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {tutorMode.active
                ? `${tutorMode.topic} (${tutorMode.level})`
                : "WADI AI Assistant"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetChat}
            title="Borrar chat"
          >
            🗑️
          </Button>
        </header>

        {/* Tutor Progress Banner */}
        {tutorMode.active && (
          <div
            style={{
              padding: "0.75rem var(--space-4)",
              backgroundColor: "var(--bg-element)",
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
                  fontSize: "0.75rem",
                  marginBottom: "0.25rem",
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
                  height: "6px",
                  borderRadius: "3px",
                  backgroundColor: "var(--border-subtle)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${
                      tutorMode.totalSteps > 0
                        ? (tutorMode.currentStep / tutorMode.totalSteps) * 100
                        : 5
                    }%`,
                    backgroundColor: "var(--accent-primary)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={stopTutorMode}
              style={{
                fontSize: "0.75rem",
                height: "auto",
                padding: "4px 8px",
              }}
            >
              Salir
            </Button>
          </div>
        )}

        {/* Use ChatInterface which is much cleaner than the manual one in ChatPage,
            BUT ChatPage was manually implementing it.
            Actually, let's verify if ChatInterface works. I will replace the manual implementation 
            with ChatInterface ONLY IF I am sure. 
            The file `ChatInterface.tsx` exists and looks correct.
            However, the user asked to "UI de progreso del Modo Tutor en la página de chat".
            Replacing the whole page logic might be risky if ChatInterface is not fully wired up same way.
            I will stick to modifying the existing manual implementation in ChatPage for safety,
            as I did for the banner above.
         */}

        {/* Messages Area - Existing Manual Implementation */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
            backgroundColor: "var(--bg-app)",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                opacity: 0.7,
                textAlign: "center",
                gap: "2rem",
              }}
            >
              <div>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                  {tutorMode.active ? "📚" : "✨"}
                </div>
                <h3>
                  {tutorMode.active
                    ? "¡Listo para aprender!"
                    : "¿En qué puedo ayudarte hoy?"}
                </h3>
              </div>

              {!tutorMode.active && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "1rem",
                    width: "100%",
                    maxWidth: "600px",
                  }}
                >
                  {[
                    "Explícame conceptos de React",
                    "Escribe un poema sobre programación",
                    "Ayúdame a debuggear un error",
                    "Ideas para una app nueva",
                  ].map((s) => (
                    <Card
                      key={s}
                      hoverable
                      onClick={() => {
                        setInput(s);
                        // Optional: auto-send
                      }}
                      style={{
                        padding: "1rem",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      "{s}"
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

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
                    maxWidth: "70%",
                    padding: "1rem",
                    borderRadius: "1rem",
                    borderTopRightRadius: isUser ? "0.2rem" : "1rem",
                    borderTopLeftRadius: isUser ? "1rem" : "0.2rem",
                    backgroundColor: isUser
                      ? "var(--accent-primary)"
                      : "var(--bg-panel)",
                    color: isUser
                      ? "var(--accent-text)"
                      : "var(--text-primary)",
                    boxShadow: "var(--shadow-sm)",
                    lineHeight: "1.5",
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
                  padding: "0.5rem 1rem",
                  backgroundColor: "var(--bg-panel)",
                  borderRadius: "1rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  fontStyle: "italic",
                }}
              >
                WADI está pensando...
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                width: "100%",
                padding: "1rem",
                backgroundColor: "#ffeaea",
                color: "#d63031",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
                margin: "1rem 0",
              }}
            >
              {error}
              <div style={{ marginTop: "0.5rem" }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    sendMessage(messages[messages.length - 1]?.content || "")
                  }
                >
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "var(--space-4)",
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-panel)",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: "var(--space-2)",
              maxWidth: "800px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                tutorMode.active
                  ? "Escribe tu respuesta o duda..."
                  : "Escribe algo para empezar..."
              }
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "1rem",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-app)",
                color: "var(--text-primary)",
                resize: "none",
                minHeight: "50px",
                maxHeight: "200px",
                fontFamily: "inherit",
                fontSize: "1rem",
                outline: "none",
                boxShadow: "var(--shadow-sm)",
              }}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
              }}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                height: "50px",
                width: "50px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ➤
            </Button>
          </form>
          <div
            style={{
              textAlign: "center",
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
            }}
          >
            {tutorMode.active
              ? "Sugerencia: podés escribir ‘listo con este paso’ cuando quieras avanzar al siguiente."
              : "WADI puede cometer errores. Considera verificar la información importante."}
          </div>
        </div>
      </div>
    </Layout>
  );
}
