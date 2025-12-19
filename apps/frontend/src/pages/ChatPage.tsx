import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useChatStore, type Attachment } from "../store/chatStore";

import { ChatInput } from "../components/ChatInput";
import WadiOnboarding from "../components/WadiOnboarding";
import { OnboardingModal } from "../components/OnboardingModal";
import { useScouter } from "../hooks/useScouter";

const PLACEHOLDERS = ["¿Una idea?", "¿Un problema?", "¿Un objetivo?"];

export default function ChatPage() {
  // Lazy initialization to avoid useEffect flicker
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("wadi_onboarding_seen");
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem("wadi_onboarding_seen", "true");
    setShowOnboarding(false);
  };

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
    mood,
    conversationId: storeConversationId,
    isUploading,
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

  // Auto-focus input
  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.getElementById("chat-input");
      input?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [conversationId]);

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

  const { playScanSound, playAlertSound } = useScouter();
  const [isFlashing, setIsFlashing] = useState(false);

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

      // SCOUTER LOGIC: Check for alerts in Assistant messages
      if (!isMyMessage) {
        const text = lastMsg.content || "";
        const isChaotic = text.includes("[ALERTA DE CAOS DETECTADA]");
        const isForcedDecision = text.includes("[FORCE_DECISION]");
        const isRejected = text.toLowerCase().includes("tostadora");

        if (isChaotic || isRejected || isForcedDecision) {
          playAlertSound();
          // Timeout cleans render cycle
          setTimeout(() => setIsFlashing(true), 0);
          setTimeout(() => setIsFlashing(false), isForcedDecision ? 800 : 200); // Longer flash for forced decision
        } else if (
          text.includes("Analizar inconsistencias") ||
          text.includes("Diagnóstico")
        ) {
          // Normal analysis friction
          playScanSound();
        }
      }
    }
    prevMessagesLength.current = newCount;
  }, [messages, shouldAutoScroll, playAlertSound, playScanSound]);

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    // 1. If we are already in a chat (storeConversationId exists), we just send the message.
    // 2. If we are in "New Chat" mode (no ID), this first message CREATES the conversation.
    //    The store's sendMessage handles both cases on the backend.

    // We cast the return type because we know we updated the store action to return the ID
    const newId = (await sendMessage(text, attachments)) as unknown as
      | string
      | null;

    // If we were in a "New Chat" state (no URL param, no store ID effectively),
    // and we got a new ID back, we navigate to that ID to "persist" the session in the URL.
    if (!conversationId && newId) {
      navigate(`/chat/${newId}`, { replace: true });
    }
  };

  return (
    <Layout>
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Scouter Alert Overlay (Mobile Diegetic Feedback) */}
      {isFlashing && (
        <div className="fixed inset-0 z-[100] pointer-events-none scouter-alert" />
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          position: "relative",
          backgroundColor: "var(--color-bg)",
          overflow: "hidden",
        }}
      >
        {/* Header simple y fijo */}
        <header className="p-4 border-b border-[var(--wadi-border)] bg-[var(--wadi-bg)]/95 backdrop-blur-md sticky top-0 z-10 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-bold font-mono-wadi bg-clip-text text-transparent bg-gradient-to-r from-[var(--wadi-primary)] to-white m-0">
              WADI::AUDIT
            </h2>
          </div>
        </header>

        {/* FORCE DECISION OVERLAY */}
        {isFlashing && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center pointer-events-none transition-opacity duration-300">
            <div className="text-[var(--wadi-alert)] font-mono-wadi text-2xl font-bold animate-pulse">
              [DECISIÓN REQUERIDA]
            </div>
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-8 md:p-8 flex flex-col gap-6 scroll-smooth"
        >
          {/* Empty State - WADI OS */}
          {!hasStarted && (
            <div className="flex flex-col items-center justify-center min-h-full gap-8 -mt-8 text-center px-4">
              <div className="bg-[var(--wadi-surface)] border border-[var(--wadi-border)] p-8 rounded-sm shadow-2xl max-w-lg w-full relative overflow-hidden">
                {/* Decorative Tech Lines */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--wadi-primary)] to-transparent opacity-50"></div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-['Outfit'] tracking-tight">
                  WADI
                </h1>
                <div className="text-[var(--wadi-primary)] font-mono-wadi text-sm tracking-[0.2em] mb-6 uppercase">
                  Sistema de Auditoría Operativo
                </div>

                <p className="text-[var(--wadi-text-muted)] text-lg mb-8 font-light">
                  "Reportá tu caos. El tiempo es el único recurso que no podés
                  recuperar."
                </p>

                <div className="w-full">
                  {/* Using ChatInput directly as the trigger is cleaner, but for visual effect we can put a fake button here often. 
                         However, WADI UX is about directness. Pointing to the input is better. 
                         Let's just use the Onboarding comp formatted nicely. */}
                  <div className="opacity-80 scale-95">
                    <WadiOnboarding mood={mood} />
                  </div>
                </div>
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
                <div className={isUser ? "bubble-user" : "bubble-wadi"}>
                  <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>

                  {/* Attachments Display */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.attachments.map((att: string | Attachment, idx) => {
                        const url = typeof att === "string" ? att : att.url;
                        const name =
                          typeof att === "string" ? "Archivo" : att.name;

                        const isImage =
                          /\.(jpg|jpeg|png|gif|webp)$/i.test(name) ||
                          /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

                        if (isImage) {
                          return (
                            <img
                              key={idx}
                              src={url}
                              alt={name}
                              className="max-w-full h-auto rounded-lg border border-[var(--color-border)] max-h-60"
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
                            className="bg-[var(--color-bg)] p-3 rounded-lg text-xs border border-[var(--color-border)] hover:bg-[var(--color-surface-soft)] transition-colors flex items-center gap-2 touch-target-min"
                          >
                            📎 {name}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Uploading or Processing State */}
          {(isLoading || isUploading) && (
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
                className="animate-pulse-soft"
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
                {isUploading ? "Subiendo..." : "Procesando..."}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "0.75rem",
            background: "rgba(17, 24, 39, 0.95)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid var(--color-border)",
            position: "sticky",
            bottom: 0,
            zIndex: 20,
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
              marginTop: "0.25rem",
              fontSize: "0.7rem",
              color: "var(--color-text-soft)",
              opacity: 0.7,
            }}
          >
            WADI v1.0 • Mobile Optimized
          </div>
        </div>
      </div>
    </Layout>
  );
}
